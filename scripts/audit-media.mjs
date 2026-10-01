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
  if(label==='reviews'||label==='gallery'){
   const domDetails=await page.evaluate(({authors})=>({
    authors:authors.map(author=>{
     const el=Array.from(document.querySelectorAll('span')).find(el=>el.textContent.trim()===author);
     return {author,html:el?.parentElement?.parentElement?.parentElement?.outerHTML?.slice(0,5000)};
    }),
    scripts:Array.from(document.scripts).filter(s=>s.textContent.length>1000).map(s=>({type:s.type,id:s.id,length:s.textContent.length,start:s.textContent.slice(0,180)}))
   }),{authors});
   const urls=[...new Set(html.match(/https?:[^\s"'<>]+(?:profile|avatar|branch)[^\s"'<>]+/gi)||[])].slice(0,100);
   console.log('PUBLIC_PHOTO_METADATA',JSON.stringify({label,domDetails,urls}));
   const scriptTexts=await page.locator('script').allTextContents();
   function objectEnd(text,start){
    let depth=0,quoted=false,escaped=false;
    for(let i=start;i<text.length;i++){
     const c=text[i];
     if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
     if(c==='"'){quoted=true;continue;}
     if(c==='{')depth++;
     if(c==='}'&&--depth===0)return i+1;
    }
    return -1;
   }
   const parsed=[];
   for(const text of scriptTexts){
    if(!/Sherkhan|Есенгалиев|photo|avatar/i.test(text))continue;
    try{parsed.push(JSON.parse(text.trim()));continue;}catch{}
    const starts=[...text.matchAll(/(?:^|[=;(])\s*(\{)/g)].map(m=>m.index+m[0].lastIndexOf('{')).slice(0,5);
    for(const start of starts){const end=objectEnd(text,start);if(end>start)try{parsed.push(JSON.parse(text.slice(start,end)));}catch{}}
   }
   const matching=[];
   function walk(node,path='',depth=0){
    if(!node||typeof node!=='object'||depth>25)return;
    const strings=Object.entries(node).filter(([key,value])=>typeof value==='string');
    const whole=strings.map(([key,value])=>value).join(' ');
    const name=authors.find(name=>whole.includes(name));
    if(name)matching.push({author:name,path,keys:Object.keys(node),photos:strings.filter(([key,value])=>/photo|avatar|image|picture/i.test(key)).map(([key,value])=>({key,value}))});
    for(const [key,value]of Object.entries(node))if(value&&typeof value==='object')walk(value,path+'.'+key,depth+1);
   }
   for(const node of parsed)walk(node);
   console.log('PUBLIC_PROFILE_RECORDS',JSON.stringify({label,parsed:parsed.length,matching:matching.slice(0,30)}));
  }
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

const repo=process.env.GITHUB_REPOSITORY;
const auth={'Authorization':'Bearer '+process.env.GITHUB_TOKEN,'Accept':'application/vnd.github+json','Content-Type':'application/json'};
async function blob(buffer,encoding='base64'){
 const content=encoding==='base64'?buffer.toString('base64'):String(buffer);
 const response=await fetch('https://api.github.com/repos/'+repo+'/git/blobs',{method:'POST',headers:auth,body:JSON.stringify({content,encoding})});
 const data=await response.json();if(!response.ok)throw new Error('Blob upload: '+response.status+' '+JSON.stringify(data));
 return data.sha;
}
async function evidence(name,buffer){
 const sha=await blob(JSON.stringify({mime:'image/webp',base64:buffer.toString('base64')}),'utf-8');
 console.log('PHOTO_EVIDENCE',JSON.stringify({name,sha,bytes:buffer.length}));
}
const candidates=JSON.parse(await readFile('scripts/photo-candidates.json','utf8'));
const tiles=[],prepared=[];
for(let offset=0;offset<candidates.length;offset+=4){
 const batch=await Promise.allSettled(candidates.slice(offset,offset+4).map(async photo=>{
  const response=await fetch(photo.fileUrl,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'PrimeITWebsiteMediaResearch/1.0'}});
  if(!response.ok)throw new Error('Photo '+photo.index+' status '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  const source=await sharp(bytes).rotate().resize({width:1536,height:1536,fit:'inside',withoutEnlargement:true}).webp({quality:87,effort:5}).toBuffer();
  const sourceSha=await blob(source);
  const label=Buffer.from('<svg width="320" height="200" xmlns="http://www.w3.org/2000/svg"><rect y="166" width="320" height="34" fill="#080d13" opacity=".9"/><text x="12" y="188" font-size="16" fill="white">'+photo.index+'</text></svg>');
  const tile=await sharp(source).resize(320,200,{fit:'cover'}).composite([{input:label}]).webp({quality:78}).toBuffer();
  return {photo,sourceSha,sourceBytes:source.length,tile};
 }));
 for(let j=0;j<batch.length;j++){
  const result=batch[j];
  if(result.status==='fulfilled'){
   const value=result.value;prepared.push(value);
   const index=value.photo.index;
   tiles.push({input:value.tile,left:(index%4)*320,top:Math.floor(index/4)*200});
   console.log('PHOTO_CANDIDATE_BLOB',JSON.stringify({index,title:value.photo.title,sha:value.sourceSha,bytes:value.sourceBytes,sourceUrl:value.photo.sourceUrl,artist:value.photo.artist,license:value.photo.license}));
  }else console.log('PHOTO_CANDIDATE_ERROR',String(result.reason));
 }
}
const sheet=await sharp({create:{width:1280,height:Math.ceil(candidates.length/4)*200,channels:3,background:'#101821'}}).composite(tiles).webp({quality:82}).toBuffer();
await evidence('service-photo-candidates',sheet);
try{
 const response=await fetch('https://api.github.com/repos/'+repo+'/actions/artifacts/11166255062/zip',{headers:{Authorization:auth.Authorization,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Artifact '+response.status);
 const zip=Buffer.from(await response.arrayBuffer());
 const {writeFile,mkdir}=await import('node:fs/promises');
 await mkdir('.audit',{recursive:true});await writeFile('.audit/quality.zip',zip);
 const listing=spawnSync('unzip',['-Z1','.audit/quality.zip'],{encoding:'utf8'}).stdout.split('\n');
 const file=listing.find(file=>file.endsWith('/media/hero.mp4'))||listing.find(file=>file==='media/hero.mp4');
 if(!file)throw new Error('Prepared video missing from artifact');
 const video=spawnSync('unzip',['-p','.audit/quality.zip',file],{maxBuffer:10*1024*1024}).stdout;
 if(!video?.length)throw new Error('Could not extract video');
 console.log('PREPARED_VIDEO_BLOB',JSON.stringify({sha:await blob(video),bytes:video.length,artifact:11166255062,file}));
}catch(error){console.log('PREPARED_VIDEO_ERROR',String(error));}

await browser.close();
