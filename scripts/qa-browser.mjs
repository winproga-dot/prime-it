import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './serve-build.mjs';
import { evidenceBlob } from './evidence.mjs';
import { servicePages, services } from '../src/data/services.js';
import { licenses } from '../src/data/licenses.js';
import { greeting } from '../src/utils/whatsapp.js';
const server = await startServer();
await mkdir('.qa',{recursive:true});
const sizes = [[360,800],[390,844],[412,915],[430,932],[1366,768],[1920,1080],[2560,1440]];
const results = [];
try {
  for (const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]) {
    const browser = await engine.launch();
    for (const [width,height] of sizes) {
      const context = await browser.newContext({viewport:{width,height}});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('console',message=>{if(message.type() === 'error') errors.push(message.text());});
      page.on('response',response=>{if(response.url().startsWith(server.url) && response.status()>=400) errors.push(response.status() + ' ' + response.url());});
      await page.goto(server.url,{waitUntil:'networkidle'});
      assert.equal(await page.locator('h1').count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth),false,'Home overflow: ' + engineName + ' ' + width);
      const allWhatsApp = await page.locator('a[href^="https://wa.me/"]').evaluateAll(nodes=>nodes.map(node=>node.href));
      for(const href of allWhatsApp) {
        const url = new URL(href);assert.equal(url.pathname,'/77076840625');
        assert(url.searchParams.get('text').startsWith(greeting));
      }
      assert.equal(await page.locator('a[href^="tel:"]').first().getAttribute('href'),'tel:+77076840625');
      if(width < 600) {
        assert(await page.locator('.mobile-action-bar').isVisible());
        const sticky = await page.locator('.mobile-action-bar').boundingBox();
        assert(sticky.y+sticky.height <= height+1);
        assert(parseFloat(await page.locator('body').evaluate(node=>getComputedStyle(node).paddingBottom)) >= sticky.height);
        assert.equal(await page.locator('video').count(),0);
        await page.locator('.menu-toggle').click();
        assert(await page.locator('#primary-navigation').isVisible());
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
        assert(await page.locator('.menu-toggle').evaluate(node=>node === document.activeElement));
      }
      await page.evaluate(()=>{window.qaEvents=[];window.addEventListener('primeit:analytics',event=>window.qaEvents.push(event.detail));});
      await page.getByRole('button',{name:'Сильно греется',exact:true}).click();
      assert.equal(await page.getByRole('button',{name:'Сильно греется',exact:true}).getAttribute('aria-pressed'),'true');
      assert(new URL(await page.locator('.mobile-action-bar a[href^="https://wa.me/"]').getAttribute('href')).searchParams.get('text').includes('Сильно греется'));
      const symptomLink = page.locator('#estimate a[href^="https://wa.me/"]');
      const symptomMessage = new URL(await symptomLink.getAttribute('href')).searchParams.get('text');
      assert(symptomMessage.includes('Проблема: Сильно греется') && symptomMessage.includes('бесплатную диагностику') && symptomMessage.includes('Модель устройства:') && symptomMessage.includes('Комментарий:'));
      await page.evaluate(()=>document.addEventListener('click',event=>{if(event.target.closest('a[href^="https://wa.me/"], a[href^="tel:"], a[href*="google.com/maps"], a[href*="2gis.kz"]')) event.preventDefault();},{capture:true}));
      await symptomLink.click();
      const events = await page.evaluate(()=>window.qaEvents);
      assert(events.some(event=>event.event === 'symptom_selected'));
      assert(events.some(event=>event.event === 'whatsapp_click'));
      if(engineName === 'chromium' && width === 390) {
        await page.locator('.hero-actions a[href^="tel:"]').click();
        await page.locator('.hero-route').click();
        await page.locator('#reviews a[href*="2gis.kz"]').click();
        await page.locator('#service-clean .service-actions a[href^="https://wa.me/"]').click();
        const contactEvents = await page.evaluate(()=>window.qaEvents);
        for(const event of ['phone_click','route_click','service_click','review_2gis_click']) assert(contactEvents.some(item=>item.event === event),'Analytics event: ' + event);
      }
      await page.locator('.faq-item').first().locator('summary').click();
      assert(await page.locator('.faq-item').first().locator('p').isVisible());
      if(engineName === 'chromium' && [390,1366].includes(width)) {
        await page.goto(server.url,{waitUntil:'networkidle'});
        const screenshot = await sharp(await page.screenshot({fullPage:false})).webp({quality:78}).toBuffer();
        await writeFile('.qa/home-' + width + '.webp',screenshot);
        await evidenceBlob('home-' + width,screenshot);
        const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        await writeFile('.qa/axe-home-' + width + '.json',JSON.stringify(axe,null,2));
        if(width === 1366) {
          await page.locator('#services').scrollIntoViewIfNeeded();
          const servicesImage=await sharp(await page.screenshot({fullPage:false})).webp({quality:78}).toBuffer();
          await writeFile('.qa/services-desktop.webp',servicesImage);await evidenceBlob('services-desktop',servicesImage);
        }
        if(width === 390) {
          await page.locator('#estimate').scrollIntoViewIfNeeded();
          const symptomImage=await sharp(await page.screenshot({fullPage:false})).webp({quality:78}).toBuffer();
          await writeFile('.qa/symptoms-mobile.webp',symptomImage);await evidenceBlob('symptoms-mobile',symptomImage);
          await page.locator('#contact').scrollIntoViewIfNeeded();
          const contactImage=await sharp(await page.screenshot({fullPage:false})).webp({quality:78}).toBuffer();
          await writeFile('.qa/location-mobile.webp',contactImage);await evidenceBlob('location-mobile',contactImage);
        }
        assert.equal(axe.violations.length,0,'Accessibility: ' + JSON.stringify(axe.violations.map(item=>({id:item.id,impact:item.impact,nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}))));
      }
      assert.deepEqual(errors,[],'Browser errors: ' + engineName + ' ' + width);
      results.push({engine:engineName,width,height,page:'home',pass:true});
      await context.close();
    }
    for (const entry of servicePages) {
      for (const [width,height] of sizes) {
      const context = await browser.newContext({viewport:{width,height}});
      const page = await context.newPage();
      const response = await page.goto(server.url + entry.path,{waitUntil:'networkidle'});
      assert.equal(response.status(),200);assert((await response.text()).includes(entry.h1),'HTML contains service before JS');
      assert.equal(await page.title(),entry.title);
      assert.equal(await page.locator('h1').innerText(),entry.h1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth),false,'Service overflow: ' + entry.path);
      const link = page.locator('.service-hero a[href^="https://wa.me/"]');
      assert(new URL(await link.getAttribute('href')).searchParams.get('text').includes(entry.h1));
      assert(new URL(await page.locator('.mobile-action-bar a[href^="https://wa.me/"]').getAttribute('href')).searchParams.get('text').includes(entry.h1));
      if(entry.slug === 'chistka-noutbuka-almaty' && engineName === 'chromium' && width === 390) {
        const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        assert.equal(axe.violations.length,0,'Service accessibility: ' + JSON.stringify(axe.violations.map(item=>({id:item.id,nodes:item.nodes.map(node=>node.failureSummary)}))));
        const screenshot=await sharp(await page.screenshot({fullPage:true})).resize(390).webp({quality:70}).toBuffer();
        await writeFile('.qa/service-mobile.webp',screenshot);await evidenceBlob('service-mobile',screenshot);
      }
      results.push({engine:engineName,width,height,page:entry.path,pass:true});
      await context.close();
      }
    }
    const page=await browser.newPage({viewport:{width:390,height:844}});
    for(const service of services) {
      await page.goto(server.url+'/#service-'+service.id,{waitUntil:'networkidle'});
      await page.waitForFunction(id => {const y=document.getElementById(id)?.getBoundingClientRect().top;return y>=65 && y<400;},'service-'+service.id);
      const box=await page.locator('#service-'+service.id).boundingBox();
      assert(box.y>=65 && box.y<400,'Legacy service anchor: '+service.id+' y='+box.y);
    }
    for(const license of licenses) {
      await page.goto(server.url+'/#license-'+license.id,{waitUntil:'networkidle'});
      await page.waitForFunction(id=>{const el=document.getElementById(id);return el && el.getBoundingClientRect().height>0;},'license-'+license.id);
      assert(await page.locator('#license-'+license.id).isVisible(),'Legacy license is visible: '+license.id);
      assert(await page.locator('.licenses-disclosure').evaluate(node=>node.open));
    }
    await page.goto(server.url+'/?service=parts',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.getElementById('service-parts').getBoundingClientRect().top<400);
    assert((await page.locator('#service-parts').boundingBox()).y<400);
    await page.goto(server.url+'/#service-clean-calc',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.getElementById('service-clean').getBoundingClientRect().top<400);
    assert((await page.locator('#service-clean').boundingBox()).y<400);
    await page.goto(server.url+'/#license-office-modal',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('.licenses-disclosure').open);
    assert(await page.locator('#license-office').isVisible());
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:1366,height:768});
    await page.goto(server.url,{waitUntil:'networkidle'});
    assert.equal(await page.locator('video').count(),0);
    assert.equal(await page.locator('.video-control').count(),0);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto(server.url,{waitUntil:'networkidle'});
    await page.locator('.video-control').click();
    await page.waitForFunction(()=>{const video=document.querySelector('video');return video && video.readyState>=2 && video.currentTime>0;});
    await page.locator('.video-control').click();
    assert.equal(await page.locator('video').count(),0);
    const missing=await page.goto(server.url+'/missing-page/',{waitUntil:'networkidle'});
    assert.equal(missing.status(),404);assert((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
    await page.close();
    const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const staticPage=await noJS.newPage();
    for(const path of ['/',...servicePages.map(entry=>entry.path)]) {
      await staticPage.goto(server.url+path);
      assert.equal(await staticPage.locator('h1').count(),1);
      assert((await staticPage.locator('main').innerText()).length>500);
      assert(await staticPage.locator('a[href^="https://wa.me/"]').first().isVisible());
    }
    await noJS.close();await browser.close();
  }
  await writeFile('.qa/browser-results.json',JSON.stringify(results,null,2));
  console.log('BROWSER_QA_PASS',JSON.stringify({engines:['Chromium','WebKit'],viewports:sizes,checks:results.length,deepLinks:true,noJavaScript:true,axeViolations:0}));
} finally { await server.close(); }
