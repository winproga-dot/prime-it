import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const sources = [
 ['card','https://2gis.kz/almaty/firm/70000001078609004'],
 ['reviews','https://2gis.kz/almaty/firm/70000001078609004/tab/reviews'],
 ['gallery','https://2gis.kz/almaty/gallery/firm/70000001078609004'],
];
const authors=['Азамат Есенгалиев','Sherkhan Kubaidullov','Sergey Batalov','Мадина Закир','Zhaniya Karmenova','Калихан Абенов','Aisana Azamat','Маржан Алиева'];
const browser=await chromium.launch();
const offline=await browser.newContext({javaScriptEnabled:false});
await offline.route('**/*',r=>r.abort());
for(const [label,url] of sources) {
 try {
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  const html=await response.text();
  const page=await offline.newPage();
  await page.setContent(html,{waitUntil:'domcontentloaded'});
  const data=await page.evaluate(({authors,label})=>{
   const images=node=>Array.from(node.querySelectorAll('img')).map(img=>({src:img.getAttribute('src'),srcset:img.getAttribute('srcset'),alt:img.getAttribute('alt'),width:img.getAttribute('width'),height:img.getAttribute('height')}));
   const records=[];
   for(const author of authors){
    const name=Array.from(document.querySelectorAll('body *')).find(el=>el.children.length===0 && el.textContent.trim()===author);
    if(!name)continue;
    let parent=name;
    const levels=[];
    for(let n=0;n<9 && parent;n++,parent=parent.parentElement){
     levels.push({level:n,tag:parent.tagName,class:parent.className,
      text:parent.innerText.slice(0,2800),images:images(parent).slice(0,12),
      backgrounds:[parent,...parent.querySelectorAll('*')].map(el=>getComputedStyle(el).backgroundImage).filter(style=>style.includes('url(')).slice(0,10),
      links:Array.from(parent.querySelectorAll('a[href]')).map(a=>({text:a.innerText,href:a.getAttribute('href')})).slice(0,15)});
    }
    records.push({author,levels});
   }
   return {title:document.title,text:document.body.innerText.slice(0,label==='gallery'?12000:label==='card'?7000:17000),authorCards:records,images:images(document).slice(0,80),backgrounds:Array.from(document.querySelectorAll('body *')).map(el=>({image:getComputedStyle(el).backgroundImage,text:el.innerText.slice(0,100)})).filter(el=>el.image.includes('url(')).slice(0,80),videoSources:Array.from(document.querySelectorAll('video,source')).map(el=>el.getAttribute('src'))};
  },{authors,label});
  console.log('SOURCE_'+label.toUpperCase(),JSON.stringify({url:response.url,status:response.status,...data}));
  await page.close();
 }catch(error){console.log('SOURCE_'+label.toUpperCase()+'_ERROR',String(error));}
}

const stockPages=[
 ['repair','https://unsplash.com/s/photos/computer-repair'],
 ['laptop','https://unsplash.com/s/photos/laptop'],
 ['gpu','https://unsplash.com/s/photos/graphics-card'],
 ['parts','https://unsplash.com/s/photos/computer-components']
];
for(const [label,url] of stockPages){
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  const html=await response.text();
  const context=await browser.newContext({javaScriptEnabled:false});
  await context.route('**/*',r=>r.abort());
  const page=await context.newPage();
  await page.setContent(html,{waitUntil:'domcontentloaded'});
  const data=await page.evaluate(()=>({title:document.title,text:document.body?.innerText?.slice(0,1200),photos:Array.from(document.querySelectorAll('img[src*="images.unsplash.com/photo-"]')).map(img=>{
   let parent=img;
   const paths=[];
   for(let n=0;n<6&&parent;n++,parent=parent.parentElement){
    const link=parent.querySelector('a[href*="/photos/"]');
    if(link)paths.push({href:link.getAttribute('href'),text:link.textContent.trim().slice(0,150)});
   }
   return {src:img.getAttribute('src'),alt:img.getAttribute('alt'),paths};
  }).slice(0,40)}));
  console.log('STOCK_SOURCE',JSON.stringify({label,url:response.url,status:response.status,...data}));
  await context.close();
 }catch(error){console.log('STOCK_SOURCE_ERROR',JSON.stringify({label,error:String(error)}));}
}

await offline.close();
const previewUrls=[
 'https://prime-it-git-prime-it-redesign-2026-winproga-dots-projects.vercel.app',
 'https://prime-it-1-git-prime-it-redesign-2026-winproga-dots-projects.vercel.app'
];
for(const origin of previewUrls){
 try{
  const response=await fetch(origin+'/media/hero.mp4',{headers:{Range:'bytes=0-4095'},signal:AbortSignal.timeout(30000)});
  const bytes=Buffer.from(await response.arrayBuffer());
  console.log('PREVIEW_VIDEO_HTTP',JSON.stringify({origin,status:response.status,url:response.url,type:response.headers.get('content-type'),range:response.headers.get('content-range'),bytes:bytes.length,head:bytes.subarray(0,30).toString('hex')}));
  if(response.status===401||response.status===403)continue;
  const page=await browser.newPage({viewport:{width:1366,height:768}});
  const failures=[],requests=[];
  page.on('pageerror',e=>failures.push(e.message));
  page.on('console',m=>{if(m.type()==='error')failures.push(m.text())});
  page.on('response',r=>{if(r.url().includes('hero.mp4'))requests.push({url:r.url(),status:r.status(),type:r.headers()['content-type']})});
  await page.goto(origin,{waitUntil:'networkidle',timeout:45000});
  if(await page.locator('.video-control').count()){
   await page.locator('.video-control').click();
   await page.waitForTimeout(7000);
  }
  const record=await page.evaluate(()=>({title:document.title,button:document.querySelector('.video-control')?.outerHTML,
   video:(()=>{const v=document.querySelector('video');return v?{src:v.currentSrc,readyState:v.readyState,networkState:v.networkState,paused:v.paused,time:v.currentTime,error:v.error?{code:v.error.code,message:v.error.message}:null}:null})()}));
  console.log('PREVIEW_VIDEO_BROWSER',JSON.stringify({origin,...record,failures,requests}));
  await page.close();
 }catch(error){console.log('PREVIEW_VIDEO_ERROR',JSON.stringify({origin,error:String(error)}))}
}
console.log('SOURCE_VIDEO_CODEC',spawnSync('ffprobe',['-v','error','-show_entries','stream=codec_name,profile,pix_fmt,width,height','-show_entries','format=duration','-of','json','assets/source/hero.mp4'],{encoding:'utf8'}).stdout);
await browser.close();
