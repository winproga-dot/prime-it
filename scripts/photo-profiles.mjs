import sharp from 'sharp';
const authors=['Азамат Есенгалиев','Sherkhan Kubaidullov','Мадина Закир','Zhaniya Karmenova','Калихан Абенов','Aisana Azamat'];
const sourceUrl='https://2gis.kz/almaty/firm/70000001078609004/tab/reviews';
const response=await fetch(sourceUrl,{signal:AbortSignal.timeout(30000)});
const html=await response.text();
const scripts=Array.from(html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)).map(m=>m[1]);
function decodeLiteral(raw){
 if(raw[0]==='"')return JSON.parse(raw);
 return raw.slice(1,-1).replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g,(_,escape)=>{
  if(escape[0]==='u')return String.fromCharCode(parseInt(escape.slice(1),16));
  if(escape[0]==='x')return String.fromCharCode(parseInt(escape.slice(1),16));
  return ({n:'\n',r:'\r',t:'\t',b:'\b',f:'\f',v:'\v','0':'\0'})[escape]??escape;
 });
}
const parsed=[];
for(const script of scripts){
 for(const match of script.matchAll(/JSON\.parse\(\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")\s*\)/g)){
  try{parsed.push(JSON.parse(decodeLiteral(match[1])));}catch{}
 }
}
function photoUrls(node,depth=0){
 if(depth>12||node==null)return [];
 if(typeof node==='string')return /https:\/\/i\d+\.photo\.2gis\.com\/images\/profile\//.test(node)?[node]:[];
 if(typeof node!=='object')return [];
 return Object.values(node).flatMap(value=>photoUrls(value,depth+1));
}
const found=[];
function walk(node,path='',parent=null,depth=0){
 if(!node||typeof node!=='object'||depth>30)return;
 const strings=Object.entries(node).filter(([key,value])=>typeof value==='string');
 const text=strings.map(([key,value])=>value).join(' ');
 const author=authors.find(name=>strings.some(([key,value])=>value===name)||text.includes(name));
 if(author){
  const urls=[...new Set(photoUrls(node))];
  const review=parent&&typeof parent==='object'?Object.fromEntries(Object.entries(parent).filter(([key,value])=>/^(id|text|rating|date.*|created.*|time.*)$/i.test(key)&&(['string','number'].includes(typeof value)))):{};
  found.push({author,path,keys:Object.keys(node),urls,review});
 }
 for(const [key,value] of Object.entries(node))if(value&&typeof value==='object')walk(value,path+'.'+key,node,depth+1);
}
for(const node of parsed)walk(node);
console.log('VERIFIED_PUBLIC_PROFILE_DATA',JSON.stringify({sourceUrl,status:response.status,parsed:parsed.length,found}));
const repo=process.env.GITHUB_REPOSITORY,headers={Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json'};
async function blob(bytes,encoding='base64'){
 const response=await fetch('https://api.github.com/repos/'+repo+'/git/blobs',{method:'POST',headers,body:JSON.stringify({content:encoding==='base64'?bytes.toString('base64'):String(bytes),encoding})});
 const json=await response.json();if(!response.ok)throw new Error('Git blob '+response.status);return json.sha;
}
const profiles=[];
for(const author of authors){
 const record=found.find(record=>record.author===author&&record.urls.length>0&&record.urls.length<8);
 if(!record)continue;
 const url=record.urls.find(url=>url.includes('_320x.'))||record.urls.find(url=>url.includes('_640x.'))||record.urls[0];
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('Avatar '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  const image=await sharp(bytes).rotate().resize(160,160,{fit:'cover'}).webp({quality:86,effort:5}).toBuffer();
  const sha=await blob(image);
  const evidence=await blob(JSON.stringify({mime:'image/webp',base64:image.toString('base64')}),'utf-8');
  const result={author,sourceUrl,avatarSource:url,sha,evidence,bytes:image.length,review:record.review};
  profiles.push(result);console.log('VERIFIED_AVATAR_BLOB',JSON.stringify(result));
 }catch(error){console.log('AVATAR_SOURCE_ERROR',JSON.stringify({author,error:String(error)}));}
}
const searches=['intitle:laptop intitle:repair','intitle:laptop intitle:screen','intitle:laptop intitle:fan','intitle:laptop intitle:hinge','intitle:"hard disk"','intitle:laptop intitle:battery','intitle:NVMe intitle:SSD','intitle:laptop Windows'];
const candidates=[];
for(const search of searches){
 const url=new URL('https://commons.wikimedia.org/w/api.php');
 const params={action:'query',generator:'search',gsrsearch:search+' filetype:bitmap',gsrnamespace:'6',gsrlimit:'4',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1600',format:'json'};
 for(const[key,value]of Object.entries(params))url.searchParams.set(key,value);
 try{
  const response=await fetch(url,{headers:{'User-Agent':'PrimeITWebsiteMediaResearch/1.0'},signal:AbortSignal.timeout(25000)});
  const json=await response.json();
  for(const page of Object.values(json.query?.pages||{})){
   const info=page.imageinfo?.[0],meta=info?.extmetadata||{};
   if(!info||!/^CC (?:BY|BY-SA)|^CC0|Public domain/.test(meta.LicenseShortName?.value||''))continue;
   candidates.push({index:candidates.length+17,title:page.title,fileUrl:info.thumburl||info.url,sourceUrl:info.descriptionurl,artist:meta.Artist?.value,license:meta.LicenseShortName?.value,licenseUrl:meta.LicenseUrl?.value,description:meta.ImageDescription?.value?.slice(0,450)});
  }
 }catch(error){console.log('FOCUSED_PHOTO_SOURCE_ERROR',JSON.stringify({search,error:String(error)}));}
}
const tiles=[],rows=Math.ceil(candidates.length/4);
for(let offset=0;offset<candidates.length;offset+=4){
 const results=await Promise.allSettled(candidates.slice(offset,offset+4).map(async photo=>{
  const response=await fetch(photo.fileUrl,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'PrimeITWebsiteMediaResearch/1.0'}});
  if(!response.ok)throw new Error('Photo '+photo.index+' '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  const source=await sharp(bytes).rotate().resize({width:1536,height:1536,fit:'inside',withoutEnlargement:true}).webp({quality:87,effort:5}).toBuffer();
  const sha=await blob(source);
  const label=Buffer.from('<svg width="320" height="200" xmlns="http://www.w3.org/2000/svg"><rect y="166" width="320" height="34" fill="#080d13" opacity=".9"/><text x="12" y="188" font-size="16" fill="white">'+photo.index+'</text></svg>');
  const tile=await sharp(source).resize(320,200,{fit:'cover'}).composite([{input:label}]).webp({quality:78}).toBuffer();
  return {photo,sha,bytes:source.length,tile};
 }));
 for(const result of results){
  if(result.status==='fulfilled'){
   const {photo,sha,bytes,tile}=result.value;
   const index=photo.index-17;tiles.push({input:tile,left:(index%4)*320,top:Math.floor(index/4)*200});
   console.log('FOCUSED_PHOTO_BLOB',JSON.stringify({...photo,sha,bytes}));
  }else console.log('FOCUSED_PHOTO_ERROR',String(result.reason));
 }
}
if(rows){
 const image=await sharp({create:{width:1280,height:rows*200,channels:3,background:'#101821'}}).composite(tiles).webp({quality:82}).toBuffer();
 console.log('FOCUSED_PHOTO_EVIDENCE',JSON.stringify({sha:await blob(JSON.stringify({mime:'image/webp',base64:image.toString('base64')}),'utf-8'),bytes:image.length}));
}
