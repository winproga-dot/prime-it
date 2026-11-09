import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './serve-build.mjs';

const server=await startServer();
await mkdir('.qa',{recursive:true});
const results=[];
const expectedOrder=['hero','estimate','services','pricing','licenses','reviews','process','faq','contact'];
try {
  for(const [name,engine] of [['Chromium',chromium],['WebKit',webkit]]) {
    const browser=await engine.launch();
    for(const [width,height] of [[390,844],[1366,768],[1920,1080],[2560,1440]]) {
      const context=await browser.newContext({viewport:{width,height}});
      const page=await context.newPage();
      const errors=[],videoRequests=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('request',request=>{if(request.url().endsWith('/hero.mp4'))videoRequests.push(request.url());});
      await page.goto(server.url,{waitUntil:'networkidle'});
      assert.deepEqual(videoRequests,[],'Retired MP4 is never requested');
      assert.equal(await page.locator('video, .video-control, .hero-video-shell').count(),0,'Old video and its button are completely removed');
      assert.deepEqual(await page.locator('main > section[id]').evaluateAll(nodes=>nodes.map(node=>node.id)),expectedOrder,'Services, prices and reviews precede the compact process');
      assert.equal(await page.locator('#process .process-grid > li').count(),3,'Three repair steps are actually rendered');
      assert.equal(await page.locator('.story-stage').count(),0,'The page does not insert another long scroll story');
      assert((await page.locator('.hv-lead').innerText()).includes('Мастер приедет'),'Outcall offer in the hero');
      const header=await page.locator('.site-header').boundingBox();
      const leadBox=await page.locator('.hv-lead').boundingBox();
      assert(leadBox.y>=header.height-1 && leadBox.y<height,'Outcall offer visible on the first screen');
      for(const link of await page.locator('#hero .hero-actions a').all()){
        const box=await link.boundingBox();
        assert(box.y<height+120,'Hero contact actions start near the first screen');
      }
      assert.equal(await page.locator('#contact .location-actions a').first().getAttribute('href'),'tel:+77076840625','Calling precedes the route in contacts');
      const firstStep=await page.locator('#process .process-grid > li').first().textContent();
      assert(firstStep.includes('По звонку') && firstStep.includes('выезда'),'Process explains how to book an outcall');
      const focusBefore=await page.evaluate(()=>document.activeElement.tagName);
      await page.locator('#process').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(()=>document.activeElement.tagName),focusBefore,'Scrolling never moves keyboard focus');
      for(const step of await page.locator('#process .process-grid > li').all())assert(await step.isVisible(),'Every compact step is visible');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.getByRole('button',{name:'Сильно греется',exact:true}).click();
      const processLink=page.locator('#process a[href^="https://wa.me/"]');
      assert(new URL(await processLink.getAttribute('href')).searchParams.get('text').includes('Сильно греется'),'Compact process keeps symptom context');
      // На телефоне блок-призыв под этапами скрыт ради краткости.
      if(await processLink.isVisible()){
        await processLink.focus();
        assert(await processLink.evaluate(node=>node===document.activeElement));
      }
      if(name==='Chromium' && [390,1366].includes(width)){
        await page.locator('#process').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        const screenshot=await sharp(await page.screenshot()).webp({quality:82}).toBuffer();
        await writeFile('.qa/process-compact-'+width+'.webp',screenshot);
        const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        assert.equal(axe.violations.length,0,JSON.stringify(axe.violations.map(item=>({id:item.id,nodes:item.nodes.map(n=>n.failureSummary)}))));
      }
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,400)));
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      assert.deepEqual(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').map(a=>a.animationName||a.constructor.name)),[],'Reduced motion cancels native animations');
      assert.equal(await page.locator('#process .process-grid > li').count(),3);
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.setViewportSize({width,height:520});
      await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,400)));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.deepEqual(errors,[]);
      results.push({engine:name,width,height,order:true,compactSteps:true,appointment:true,phoneBeforeRoute:true,symptomContext:true,reducedMotion:true,pass:true});
      await context.close();
    }
    for(const width of [390,1366]){
      const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:844}});
      const page=await context.newPage();await page.goto(server.url);
      assert.equal(await page.locator('#process .process-grid > li').count(),3,'No-JS check must include all three steps');
      for(const step of await page.locator('#process .process-grid > li').all()){
        assert(await step.isVisible());assert((await step.textContent()).length>100);
      }
      assert((await page.locator('.hv-lead').innerText()).includes('Мастер приедет'));
      assert(await page.locator('a[href^="https://wa.me/"]:visible').count()>0);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await context.close();
    }
    await browser.close();
  }
  await writeFile('.qa/motion-results.json',JSON.stringify(results,null,2));
  console.log('MOTION_QA_PASS',JSON.stringify({scenarios:results.length,engines:['Chromium','WebKit'],compactSteps:3,order:true,appointment:true,phoneBeforeRoute:true,symptomContext:true,reducedMotion:true,noJavaScript:true,axeViolations:0}));
} finally {await server.close();}
