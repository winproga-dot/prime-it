import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { routes, pageMeta } from '../src/utils/seo.js';
import { faq } from '../src/data/faq.js';
import { servicePages } from '../src/data/services.js';
import { brand } from '../src/data/brand.js';
const titles = new Set(), descriptions = new Set();
for (const route of routes) {
  const html = await readFile(join('dist',route.slice(1),'index.html'),'utf8');
  const meta = pageMeta(route);
  assert.equal((html.match(/<h1\b/g) || []).length,1,route + ': one H1');
  assert(html.includes('data-prerendered="true"'),route + ': server HTML');
  assert(html.includes('<title>' + meta.title + '</title>'),route + ': static title');
  assert(!titles.has(meta.title),route + ': unique title'); titles.add(meta.title);
  assert(!descriptions.has(meta.description),route + ': unique description'); descriptions.add(meta.description);
  assert(meta.description.length >= 90 && meta.description.length <= 170,route + ': description length');
  assert(html.includes('rel="canonical" href="' + meta.canonical + '"'),route + ': canonical');
  assert(html.includes('name="robots" content="index, follow'),route + ': indexable');
  assert(html.includes('property="og:image"') && html.includes('name="twitter:card"'),route + ': social metadata');
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const business = schema['@graph'].find(item => item['@type'] === 'LocalBusiness');
  assert.equal(business.telephone,brand.phoneTel);
  assert(business.description.includes('Приём по предварительному звонку'),route + ': appointment in LocalBusiness');
  assert(html.includes(brand.visitNotice),route + ': appointment included in crawlable HTML');
  assert(meta.description.includes('Приём по'),route + ': appointment in metadata');
  assert(!html.includes('просто привезите') && !html.includes('Приезжайте — разберёмся'),route + ': no walk-in promises');
  assert.equal(business.address.streetAddress,brand.street);
  assert.equal(business.openingHoursSpecification[0].dayOfWeek.length,7);
  assert(!('geo' in business) && !('aggregateRating' in business),route + ': no invented location or rating');
  const expectedFaq = route === '/' ? faq : servicePages.find(page => page.path === route).faq;
  const actualFaq = schema['@graph'].find(item => item['@type'] === 'FAQPage');
  assert.deepEqual(actualFaq.mainEntity.map(item => ({q:item.name,a:item.acceptedAnswer.text})),expectedFaq);
  if (route !== '/') assert(schema['@graph'].some(item => item['@type'] === 'BreadcrumbList'));
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)(?:[^"]*)"/g)) {
    const path = match[1];
    if (path === '/') continue;
    const destination = path.endsWith('/') ? join('dist',path.slice(1),'index.html') : join('dist',path.slice(1));
    await access(destination);
  }
  assert(html.includes('https://wa.me/77076840625?text=') && html.includes('tel:+77076840625'),route + ': contact links');
}
const sitemap = await readFile('public/sitemap.xml','utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,routes.length);
for (const route of routes) assert(sitemap.includes(brand.url.slice(0,-1) + route));
assert((await readFile('dist/robots.txt','utf8')).includes('Sitemap: ' + brand.url + 'sitemap.xml'));
assert((await readFile('dist/404.html','utf8')).includes('noindex, follow'));
assert(!(await readdir('dist')).includes('services'),'Original PNGs are not deployed');
const pattern = ['Ади' + '\\s+' + 'Шарипова','Шарипова' + '\\s+' + '100'].join('|');
const oldAddress = spawnSync('rg',['-n',pattern,'src','public','scripts','docs'],{encoding:'utf8'});
if (oldAddress.error?.code === 'ENOENT') {
  const visit = async directory => { for(const entry of await readdir(directory,{withFileTypes:true})) {
    const file = join(directory,entry.name);
    if (entry.isDirectory()) await visit(file);
    else if (/\.(js|jsx|mjs|html|xml|txt|md|css)$/.test(file)) assert(!new RegExp(pattern,'i').test(await readFile(file,'utf8')),file + ': obsolete address');
  }};
  for(const directory of ['src','public','scripts','docs']) await visit(directory);
} else assert.equal(oldAddress.status,1,'No obsolete address: ' + oldAddress.stdout);
const diagnosisPattern = 'диагност.{0,60}3[[:space:]]*000|' + 'бесплатно' + ' при ремонте';
const paidDiagnosis = spawnSync('rg',['-ni',diagnosisPattern,'src','public','docs'],{encoding:'utf8'});
if (!paidDiagnosis.error) assert.equal(paidDiagnosis.status,1,'No paid diagnosis contradiction: ' + paidDiagnosis.stdout);
console.log('STATIC_QA_PASS',JSON.stringify({pages:routes.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,faqMatches:true,address:brand.address}));

const creditsHtml = await readFile('dist/photo-credits/index.html','utf8');
assert(creditsHtml.includes('noindex, follow') && creditsHtml.includes('creativecommons.org'),'Photo attribution is deployed');
const videoFile = await readFile('dist/media/hero.mp4');
assert.deepEqual(videoFile,await readFile('assets/prepared/hero.mp4'),'Same prepared video on every hosting provider');
console.log('MEDIA_QA_PASS',JSON.stringify({preparedVideoBytes:videoFile.length,photoCredits:true}));
