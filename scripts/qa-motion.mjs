import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './serve-build.mjs';
import { evidenceBlob } from './evidence.mjs';

const server = await startServer();
await mkdir('.qa', { recursive: true });
const results = [];
try {
  for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) {
    const browser = await engine.launch();
    for (const [width, height] of [[1366,768], [1920,1080], [2560,1440]]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      const errors = [];
      const videoRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (request.url().endsWith('/hero.mp4')) videoRequests.push(request.url()); });
      await page.goto(server.url, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.getElementById('process').dataset.storyMode === 'scroll');
      assert.equal(await page.locator('.story-stage').isVisible(), true);
      assert.deepEqual(videoRequests, [], 'Motion does not download video automatically');
      for (const index of [0,1,2,1,0]) {
        await page.locator('[data-journey-step]').nth(index).evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForFunction(index => document.getElementById('process').dataset.activeStep === String(index), index);
        assert.equal(await page.locator('.story-frame.is-active').count(), 1, 'Exactly one illustration matches the current step');
        const sticky = await page.locator('.story-stage').boundingBox();
        const headerHeight = await page.locator('.site-header').evaluate(node => node.getBoundingClientRect().height);
        assert(sticky.y >= headerHeight - 1, 'Sticky illustration clears the header');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
      if (name === 'Chromium' && width === 1366) {
        await page.locator('[data-journey-step]').nth(1).evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForFunction(() => document.getElementById('process').dataset.activeStep === '1');
        await page.waitForTimeout(800);
        const screenshot = await sharp(await page.screenshot()).webp({ quality: 80 }).toBuffer();
        await writeFile('.qa/repair-story-desktop.webp', screenshot);
        await evidenceBlob('repair-story-desktop', screenshot);
        const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.failureSummary)}))));
        await page.goto(server.url, { waitUntil: 'networkidle' });
        const rig = page.locator('.hero-rig');
        const box = await rig.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.move(box.x + box.width * .75, box.y + box.height * .35);
        await page.waitForFunction(() => document.querySelector('.hero-rig').style.getPropertyValue('--depth-x') !== '');
        await page.mouse.move(3, 3);
        await page.waitForFunction(() => document.querySelector('.hero-rig').style.getPropertyValue('--depth-x') === '');
        // Keyboard users can reach the newly actionable diagnosis card.
        await page.locator('.diagnosis-card').focus();
        assert(await page.locator('.diagnosis-card').evaluate(node=>node === document.activeElement));
        assert(new URL(await page.locator('.diagnosis-card').getAttribute('href')).searchParams.get('text').includes('бесплатную диагностику'));
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.getElementById('process').dataset.storyMode === 'stacked');
      assert.equal(await page.locator('.story-stage').isVisible(), false);
      for (const step of await page.locator('[data-journey-step]').all()) assert(await step.isVisible(), 'Reduced motion preserves every step');
      assert.equal(await page.locator('.hero-rig').evaluate(node => getComputedStyle(node).transform), 'none');
      assert.equal(await page.locator('.hero-scan').isVisible(), false);
      assert.equal(await page.evaluate(() => document.getAnimations().filter(animation=>animation.playState === 'running').length), 0, 'Reduced motion cancels active animations');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => document.getElementById('process').dataset.storyMode === 'scroll');
      await page.setViewportSize({ width, height: 520 });
      await page.waitForFunction(() => document.getElementById('process').dataset.storyMode === 'stacked');
      assert.equal(await page.locator('.story-stage').isVisible(), false, 'Short desktop screens receive the readable layout');
      assert.deepEqual(errors, []);
      results.push({engine:name,width,height,scrollForwardAndBack:true,reducedMotion:true,shortViewport:true,pass:true});
      await context.close();
    }
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(server.url, { waitUntil: 'networkidle' });
    assert.equal(await mobile.locator('#process').getAttribute('data-story-mode'), 'stacked');
    assert.equal(await mobile.locator('.story-stage').isVisible(), false);
    assert.equal(await mobile.locator('.step-mobile-image').count(), 3);
    const focusBefore = await mobile.evaluate(() => document.activeElement.tagName);
    await mobile.locator('[data-journey-step]').last().scrollIntoViewIfNeeded();
    assert.equal(await mobile.evaluate(() => document.activeElement.tagName), focusBefore, 'Scrolling never steals focus');
    const order = await mobile.locator('main > section[id]').evaluateAll(nodes=>nodes.map(node=>node.id));
    assert(order.indexOf('estimate') < order.indexOf('process') && order.indexOf('process') < order.indexOf('services'));
    await mobile.getByRole('button', { name: 'Сильно греется', exact: true }).click();
    const storyLink = mobile.locator('#process a[href^="https://wa.me/"]');
    assert(new URL(await storyLink.getAttribute('href')).searchParams.get('text').includes('Сильно греется'), 'Journey CTA retains selected symptom');
    if (name === 'Chromium') {
      await mobile.locator('[data-journey-step]').first().scrollIntoViewIfNeeded();
      await mobile.waitForTimeout(650);
      const screenshot = await sharp(await mobile.screenshot()).webp({ quality: 80 }).toBuffer();
      await writeFile('.qa/repair-story-mobile.webp', screenshot);
      await evidenceBlob('repair-story-mobile', screenshot);
    }
    await mobile.close();
    const noJS = await browser.newContext({ javaScriptEnabled:false, viewport:{width:1366,height:768} });
    const staticPage = await noJS.newPage();
    await staticPage.goto(server.url);
    for (const step of await staticPage.locator('[data-journey-step]').all()) {
      assert(await step.isVisible(), 'HTML includes the full process without JavaScript');
      assert((await step.innerText()).length > 100);
    }
    assert(await staticPage.locator('#process a[href^="https://wa.me/"]').isVisible());
    assert.equal(await staticPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await noJS.close();
    await browser.close();
  }
  await writeFile('.qa/motion-results.json', JSON.stringify(results, null, 2));
  console.log('MOTION_QA_PASS', JSON.stringify({desktopScenarios:results.length,engines:['Chromium','WebKit'],forwardAndBackward:true,reducedMotion:true,pointerDepth:true,mobileStacked:true,noJavaScript:true,symptomContext:true,axeViolations:0}));
} finally { await server.close(); }
