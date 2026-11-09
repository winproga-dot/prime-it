import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { writeFile, mkdir } from 'node:fs/promises';
import { startServer } from './serve-build.mjs';
const server = await startServer();
await mkdir('.qa',{recursive:true});
const browser = await chromium.launch({args:['--remote-debugging-port=9222']});
try {
  for(const [name,path] of [['home','/'],['service','/chistka-noutbuka-almaty/']]) {
    const result = await lighthouse(server.url+path,{port:9222,output:'json',onlyCategories:['performance','accessibility','best-practices','seo']});
    await writeFile('.qa/lighthouse-'+name+'.json',result.report);
    const scores=Object.fromEntries(Object.entries(result.lhr.categories).map(([id,category])=>[id,Math.round(category.score*100)]));
    const metrics=Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(id=>[id,result.lhr.audits[id]?.displayValue]));
    console.log('LIGHTHOUSE',name,JSON.stringify({scores,metrics}));
    for(const [id,audit] of Object.entries(result.lhr.audits)) if(audit.score !== null && audit.score < 1 && ['opportunity','numeric'].includes(audit.scoreDisplayMode)) {
      console.log('LIGHTHOUSE_FINDING',name,id,audit.displayValue || '',JSON.stringify(audit.details?.items?.slice(0,4) || []));
    }
    if(scores.performance<90 || scores.accessibility<95 || scores['best-practices']<95 || scores.seo<95) process.exitCode=1;
  }
} finally {await browser.close();await server.close();}
