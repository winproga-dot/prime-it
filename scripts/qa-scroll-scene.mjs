import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './serve-build.mjs';
import { evidenceBlob } from './evidence.mjs';

const server=await startServer();
await mkdir('.qa',{recursive:true});
const results=[];
let activePage;
const sizes=[[360,800],[390,844],[412,915],[430,932],[1366,768],[1920,1080],[2560,1440]];
async function timeline(page) {
  return page.evaluate(()=>{
    const root=document.getElementById('hero');
    const anchor=innerWidth<900 ? root.querySelector('.scene-anchor') : root;
    const header=document.querySelector('.site-header').getBoundingClientRect().height;
    return {start:anchor.getBoundingClientRect().top+scrollY-header,distance:parseFloat(root.style.getPropertyValue('--scroll-distance'))};
  });
}
async function seek(page,fraction) {
  const t=await timeline(page);
  await page.evaluate(({t,fraction})=>window.scrollTo({top:t.start+t.distance*fraction,behavior:'instant'}),{t,fraction});
  await page.waitForFunction(f=>Math.abs(Number(document.getElementById('hero').dataset.scrollProgress)-f)<.003,fraction);
  return page.locator('[data-scene-part="world"]').evaluate(node=>getComputedStyle(node).transform);
}
try {
  for(const [name,engine] of [['Chromium',chromium],['WebKit',webkit]]) {
    const browser=await engine.launch();
    for(const [width,height] of sizes) {
      const recording=name==='Chromium' && width===1366;
      const context=await browser.newContext({viewport:{width,height},...(recording?{recordVideo:{dir:'.qa/video',size:{width:1366,height:768}}}:{})});
      const page=await context.newPage();activePage=page;
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(server.url,{waitUntil:'networkidle'});
      console.log('SCENE_LAYOUT',name,width,await page.locator('#hero').evaluate(node=>({mode:node.dataset.sceneMode,copyHeight:node.querySelector('.hero-copy').scrollHeight,styles:node.getAttribute('style')})));
      await page.waitForFunction(()=>document.getElementById('hero').dataset.sceneMode==='scroll');
      const header=await page.locator('.site-header').boundingBox();
      for(const box of await page.locator('.hero-actions a').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()))) {
        assert(box.y>=header.height-1 && box.bottom<=height-10,'Contact visible before scrolling: '+name+' '+width+' '+JSON.stringify(box));
      }
      for(const link of await page.locator('.hero-actions a').all()) {
        assert(await link.evaluate(node=>{
          const r=node.getBoundingClientRect();
          return node.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
        }),'Background never blocks contact links');
      }
      const focusBefore=await page.evaluate(()=>document.activeElement.tagName);
      const beginning=await seek(page,0);
      assert.equal(await page.locator('[data-scene-part="gpu"]').getAttribute('data-assembled'),'false');
      assert.equal(await page.locator('[data-scene-part="lights"]').evaluate(node=>getComputedStyle(node).opacity),'0');
      const initialVisual=await page.locator('.scroll-visual').boundingBox();
      const poses=[],frames=[];
      for(const fraction of [0,.15,.30,.45,.60,.80,1,.45,.15,0]) {
        poses.push({fraction,transform:await seek(page,fraction)});
        const visual=await page.locator('.scroll-visual').boundingBox();
        const pinned=width<900 ? visual : await page.locator('.hero-pin').boundingBox();
        assert(pinned.y>=header.height-1 && pinned.y<=header.height+6,'Hero remains pinned: '+name+' '+width+' '+pinned.y);
        assert(Math.abs(visual.y-initialVisual.y)<=6,'Illustration stays at a stable position while scrolling');
        assert(visual.y+visual.height<=height-10,'Complete scene fits the viewport');
        if(width<600) {
          const bar=await page.locator('.mobile-action-bar').boundingBox();
          assert(visual.y+visual.height<=bar.y-2,'Scene clears mobile bar: '+name+' '+width+' '+JSON.stringify({visual,bar}));
        }
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        if(fraction===1) {
          assert.equal(await page.locator('.pc-component[data-assembled="true"]').count(),10,'Every component reaches its mounting position');
          assert.equal(await page.locator('[data-scene-part="lights"]').evaluate(node=>getComputedStyle(node).opacity),'1','Lighting switches on after assembly');
          assert.equal(await page.locator('#hero').getAttribute('data-scene-chapter'),'5');
        }
        if(fraction===0) assert.equal(await page.locator('.pc-component[data-assembled="true"]').count(),0,'Scrolling back restores the empty chassis');
        if(name==='Chromium' && [390,1366].includes(width) && [0,.45,1].includes(fraction) && frames.length<3) {
          const frame=await sharp(await page.screenshot()).webp({quality:85}).toBuffer();frames.push(frame);
          await writeFile('.qa/scroll-hero-'+width+'-'+fraction+'.webp',frame);
          await evidenceBlob('scroll-hero-'+width+'-'+fraction,frame);
        }
      }
      assert.notEqual(poses[1].transform,poses[2].transform,'Intermediate scrolling changes geometry');
      assert.notEqual(poses[2].transform,poses[3].transform,'Movement continues within a chapter');
      assert.equal(poses.at(-1).transform,beginning,'Reversing restores the original geometry');
      assert.equal(await page.evaluate(()=>document.activeElement.tagName),focusBefore);
      await seek(page,.45);
      const gpuMoving=await page.locator('[data-scene-part="gpu"]').getAttribute('style');
      await seek(page,.55);
      assert.notEqual(await page.locator('[data-scene-part="gpu"]').getAttribute('style'),gpuMoving,'Graphics card moves into the case continuously');
      await seek(page,.45);
      const stable=await page.locator('[data-scene-part="world"]').getAttribute('style');
      await page.waitForTimeout(250);
      assert.equal(await page.locator('[data-scene-part="world"]').getAttribute('style'),stable,'Stopping scroll stops the scene');
      if(name==='Chromium' && [390,1366].includes(width)) {
        const inputs=await Promise.all(frames.map(async(input,i)=>({input:await sharp(input).resize(width,height).toBuffer(),left:i*width,top:0})));
        const composite=await sharp({create:{width:width*3,height,channels:3,background:'#080d13'}}).composite(inputs).webp({quality:80}).toBuffer();
        await writeFile('.qa/scroll-sequence-'+width+'.webp',composite);
        await evidenceBlob('scroll-sequence-'+width,composite);
        const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        assert.equal(axe.violations.length,0,JSON.stringify(axe.violations.map(item=>({id:item.id,nodes:item.nodes.map(n=>n.failureSummary)}))));
      }
      if(recording) {
        await seek(page,0);const t=await timeline(page);
        for(const p of [1,0]) {
          await page.evaluate(({t,p})=>window.scrollTo({top:t.start+t.distance*p,behavior:'smooth'}),{t,p});
          await page.waitForTimeout(1500);
        }
      }
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>document.getElementById('hero').dataset.sceneMode==='static');
      assert.equal(await page.locator('.scene-transcript').evaluate(node=>getComputedStyle(node).position),'static');
      assert.equal(await page.locator('.pc-component[data-assembled="true"]').count(),10,'Reduced motion shows a complete PC');
      const reducedPose=await page.locator('[data-scene-part="world"]').getAttribute('style');
      await page.locator('#hero').scrollIntoViewIfNeeded();
      await page.evaluate(()=>window.scrollBy(0,120));await page.waitForTimeout(100);
      assert.equal(await page.locator('[data-scene-part="world"]').getAttribute('style'),reducedPose);
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForFunction(()=>document.getElementById('hero').dataset.sceneMode==='scroll');
      await seek(page,.45);
      await page.setViewportSize({width,height:520});
      await page.waitForFunction(()=>document.getElementById('hero').dataset.sceneMode==='static');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.deepEqual(errors,[]);
      results.push({engine:name,width,height,continuous:true,reversible:true,componentsAssemble:true,lighting:true,pinned:true,contactsVisible:true,reducedMotion:true,pass:true});
      const video=page.video();await context.close();activePage=null;
      if(recording && video)await video.saveAs('.qa/scroll-hero-demonstration.webm');
    }
    const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const page=await noJS.newPage();await page.goto(server.url);
    assert.equal(await page.locator('#hero').getAttribute('data-scene-mode'),'static');
    assert.equal(await page.locator('.scene-transcript').evaluate(node=>getComputedStyle(node).position),'static');
    assert.equal(await page.locator('.scene-transcript li').count(),3);
    assert(await page.locator('.hero-actions a[href^="https://wa.me/"]').isVisible());
    await noJS.close();await browser.close();
  }
  await writeFile('.qa/scroll-scene-results.json',JSON.stringify(results,null,2));
  console.log('SCROLL_SCENE_QA_PASS',JSON.stringify({scenarios:results.length,continuous:true,reverse:true,components:10,lighting:true,mobile:true,reducedMotion:true,noJavaScript:true,axeViolations:0}));
} catch(error) {
  if(activePage && !activePage.isClosed()) {
    const frame=await sharp(await activePage.screenshot()).webp({quality:85}).toBuffer();
    await writeFile('.qa/scroll-scene-failure.webp',frame);
    await evidenceBlob('scroll-scene-failure',frame);
    console.log('SCENE_FAILURE_LAYOUT',await activePage.evaluate(()=>({scrollY,viewport:[innerWidth,innerHeight],hero:document.getElementById('hero')?.outerHTML.slice(0,400),copy:document.querySelector('.hero-copy')?.getBoundingClientRect().toJSON(),scene:document.querySelector('.scroll-visual')?.getBoundingClientRect().toJSON(),ancestors:Array.from(document.querySelectorAll('html,body,main,.hero-story,.hero-pin,.scroll-visual')).map(node=>{const css=getComputedStyle(node);return {tag:node.tagName,className:node.className,rect:node.getBoundingClientRect().toJSON(),position:css.position,top:css.top,overflow:css.overflow,pseudoHeight:getComputedStyle(node,'::after').height}})})));
  }
  throw error;
} finally {await server.close();}
