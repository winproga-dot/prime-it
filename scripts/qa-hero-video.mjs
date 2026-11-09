// QA прокрутки видео в hero: кадр меняется от прокрутки вперёд и назад,
// на десктопе и телефоне, в том числе при «уменьшить анимацию».
import assert from 'node:assert/strict';
import { chromium, webkit, devices } from 'playwright';
import { startServer } from './serve-build.mjs';
const server = await startServer(4174);
const engines = process.env.QA_ENGINES ? process.env.QA_ENGINES.split(',') : ['chromium','webkit'];
const contexts = [
  ['desktop', { viewport:{ width:1366, height:768 } }],
  ['desktop-reduced', { viewport:{ width:1440, height:900 }, reducedMotion:'reduce' }],
  ['mobile', { ...devices['iPhone 13'], defaultBrowserType:undefined }],
];
try {
  for (const engineName of engines) {
    const browser = await ({ chromium, webkit })[engineName].launch();
    for (const [name, options] of contexts) {
      const { isMobile, ...rest } = options;
      const context = await browser.newContext(engineName === 'chromium' || !isMobile ? options : rest);
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(server.url + '/', { waitUntil:'networkidle' });
      await page.waitForFunction(() => document.querySelector('#hero').dataset.loaded === 'true', null, { timeout:30000 });
      const settle = previous => page.waitForFunction(prev => { const h = document.querySelector('#hero'); return h.dataset.settled === 'true' && h.dataset.frame !== String(prev); }, previous, { timeout:8000 }).catch(() => {});
      const state = () => page.evaluate(() => ({ frame:Number(document.querySelector('#hero').dataset.frame || -1), progress:Number(document.querySelector('#hero').dataset.progress || 0) }));
      const start = await state();
      assert.equal(start.frame, 0, name + ': first frame at top');
      const [rangeStart, rangeEnd] = await page.evaluate(() => [Number(document.querySelector('#hero').dataset.rangeStart), Number(document.querySelector('#hero').dataset.rangeEnd)]);
      const distance = rangeEnd - rangeStart;
      assert(distance > 150 && distance < 1.3 * (options.viewport?.height || 900), name + ': short scroll distance ' + distance);
      const middleTop = rangeStart + distance / 2;
      await page.evaluate(y => scrollTo(0, y), middleTop); await settle(start.frame);
      const middle = await state();
      assert(middle.frame > 40 && middle.frame < 80, name + ': middle frame ' + middle.frame);
      await page.evaluate(y => scrollTo(0, y), rangeEnd + 20); await settle(middle.frame);
      const end = await state();
      assert(end.frame >= 118, name + ': last frame ' + end.frame);
      await page.evaluate(() => scrollTo(0, 0)); await settle(end.frame);
      assert.equal((await state()).frame, 0, name + ': reversible');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, name + ': no horizontal overflow');
      assert.deepEqual(errors, [], name + ': no page errors');
      console.log('HERO_VIDEO_OK', engineName, name, JSON.stringify({ distance, middle:middle.frame, end:end.frame }));
      await context.close();
    }
    await browser.close();
  }
  console.log('HERO_VIDEO_QA_PASS');
} finally { await server.close(); }
