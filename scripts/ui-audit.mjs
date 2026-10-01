import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { startServer } from './serve-build.mjs';
import { evidenceBlob } from './evidence.mjs';
const server=await startServer();
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
await mkdir('.qa',{recursive:true});
const measurements=[];
const capture=async(page,name,locator)=>{
 const bytes=await sharp(await (locator?locator.screenshot({style:'.site-header,.mobile-action-bar,.skip-link{visibility:hidden!important}'}):page.screenshot({fullPage:false}))).webp({quality:80}).toBuffer();
 await writeFile('.qa/'+name+'.webp',bytes);await evidenceBlob(name,bytes);
};
try {
 for(const [width,height] of [[320,568],[360,800],[390,844],[600,800],[601,800],[768,1024],[900,768],[1024,768],[1366,768],[1920,1080]]) {
  const page=await browser.newPage({viewport:{width,height}});
  await page.goto(server.url,{waitUntil:'networkidle'});
  const initial=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth>innerWidth,
   heroActions:[...document.querySelectorAll('.hero-actions a,.hero-route')].map(el=>({text:el.innerText,box:el.getBoundingClientRect().toJSON(),size:getComputedStyle(el).fontSize})),
   header:[...document.querySelectorAll('.header-inner>*')].map(el=>el.getBoundingClientRect().toJSON()),
   fonts:[...document.querySelectorAll('main p,.service-price small,.trust-item strong')].filter(el=>el.checkVisibility()).map(el=>({text:el.innerText.slice(0,70),size:parseFloat(getComputedStyle(el).fontSize)})).filter(el=>el.size<13),
  }));
  measurements.push({width,height,initial});
  if([360,768,900].includes(width))await capture(page,'audit-home-'+width);
  if([360,1366].includes(width)){
   for(const id of ['benefits','estimate','services','pricing','reviews','contact']){
    const locator=page.locator('#'+id);await locator.scrollIntoViewIfNeeded();await capture(page,'audit-'+id+'-'+width,locator);
   }
   await page.locator('.more-services summary').click();
   await capture(page,'audit-more-services-'+width,page.locator('.more-services'));
   await page.goto(server.url+'/remont-kompyuterov-almaty/',{waitUntil:'networkidle'});
   await capture(page,'audit-computer-'+width);
   await page.goto(server.url,{waitUntil:'networkidle'});
  }
  if(width<1100){
   await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');
   const focus=await page.evaluate(()=>({active:document.activeElement?.outerHTML,expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded')}));
   measurements.push({width,menuFocus:focus});
   await page.keyboard.press('Tab');measurements.push({width,nextTab:await page.evaluate(()=>document.activeElement?.outerHTML)});
   await page.keyboard.press('Escape');
  }
  await page.addStyleTag({content:'html{font-size:200%!important}'});
  measurements.push({width,enlarged:await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,offenders:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1 && el.checkVisibility()).map(el=>({tag:el.tagName,cls:el.className,right:el.getBoundingClientRect().right,text:el.innerText?.slice(0,60)})).slice(0,16),actions:[...document.querySelectorAll('.hero-actions a,.hero-route')].map(el=>({text:el.innerText,box:el.getBoundingClientRect().toJSON()}))}))});
  if([360,900].includes(width))await capture(page,'audit-enlarged-'+width);
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1024,height:320}});
 await page.goto(server.url);await page.locator('.menu-toggle').click();await capture(page,'audit-landscape-menu');
 console.log('LANDSCAPE_MENU',JSON.stringify(await page.locator('#primary-navigation').boundingBox()));await page.close();
 await writeFile('.qa/ui-audit.json',JSON.stringify(measurements,null,2));
 const liveMap=await browser.newPage({viewport:{width:390,height:844}});
 await liveMap.goto(server.url,{waitUntil:'networkidle'});
 await liveMap.getByRole('button',{name:'Показать карту',exact:true}).click();
 const mapUrl=await liveMap.locator('.map-frame').getAttribute('src');
 try {
  const response=await fetch(mapUrl,{signal:AbortSignal.timeout(20000)});
  const html=await response.text();console.log('LIVE_MAP_HTTP',JSON.stringify({status:response.status,url:response.url,leaflet:html.includes('leaflet') || html.includes('Leaflet')}));
  await liveMap.frameLocator('.map-frame').locator('.leaflet-tile-loaded').first().waitFor({timeout:20000});
  await capture(liveMap,'audit-live-map',liveMap.locator('#contact'));
  console.log('LIVE_MAP_RENDER',JSON.stringify({tiles:await liveMap.frameLocator('.map-frame').locator('.leaflet-tile-loaded').count()}));
 }catch(error){console.log('LIVE_MAP_UNAVAILABLE',JSON.stringify({message:error.message}));}
 await liveMap.close();
 console.log('UI_AUDIT',JSON.stringify(measurements));
}finally{await browser.close();await server.close();}
