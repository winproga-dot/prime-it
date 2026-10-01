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
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
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
   return {title:document.title,text:document.body.innerText.slice(0,label==='gallery'?12000:label==='card'?7000:17000),authorCards:records,images:images(document).slice(0,80),backgrounds:Array.from(document.querySelectorAll('body *')).map(el=>({image:getComputedStyle(el).backgroundImage,text:(el.innerText||'').slice(0,100)})).filter(el=>el.image.includes('url(')).slice(0,80),videoSources:Array.from(document.querySelectorAll('video,source')).map(el=>el.getAttribute('src'))};
  },{authors,label});
  console.log('SOURCE_'+label.toUpperCase(),JSON.stringify({url:response.url,status:response.status,...data}));
  await page.close();
 }catch(error){console.log('SOURCE_'+label.toUpperCase()+'_ERROR',String(error));}
}


const searches=['laptop repair','computer motherboard','graphics card computer','gaming desktop computer','laptop solid state drive','laptop battery'];
for(const search of searches){
 try{
  const url=new URL('https://commons.wikimedia.org/w/api.php');
  const params={action:'query',generator:'search',gsrsearch:search+' filetype:bitmap',gsrnamespace:'6',gsrlimit:'8',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1600',format:'json'};
  for(const [key,value]of Object.entries(params))url.searchParams.set(key,value);
  const response=await fetch(url,{headers:{'User-Agent':'PrimeITWebsiteMediaResearch/1.0'},signal:AbortSignal.timeout(25000)});
  const json=await response.json();
  const photos=Object.values(json.query?.pages||{}).map(page=>{
   const info=page.imageinfo?.[0],meta=info?.extmetadata||{};
   return {title:page.title,fileUrl:info?.thumburl||info?.url,sourceUrl:info?.descriptionurl,artist:meta.Artist?.value,credit:meta.Credit?.value,license:meta.LicenseShortName?.value,licenseUrl:meta.LicenseUrl?.value,description:meta.ImageDescription?.value?.slice(0,1000),width:info?.thumbwidth,height:info?.thumbheight};
  });
  console.log('COMMONS_SOURCE',JSON.stringify({search,status:response.status,photos}));
 }catch(error){console.log('COMMONS_SOURCE_ERROR',JSON.stringify({search,error:String(error)}));}
}

await offline.close();
await browser.close();
