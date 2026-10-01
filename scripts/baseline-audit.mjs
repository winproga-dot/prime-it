import { chromium } from 'playwright';
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('.audit', { recursive: true });
for (const domain of ['www.prime-it.kz', 'prime-it.kz']) {
  try { console.log('DOMAIN_DNS', domain, await lookup(domain)); } catch (error) { console.log('DOMAIN_DNS', domain, error.code); }
}
const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1'], { stdio: 'ignore' });
await new Promise(resolve => setTimeout(resolve, 1500));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const requests = [];
page.on('response', response => {
  if (response.status() >= 400) requests.push({ url: response.url(), status: response.status() });
});
async function capture(name, targetPage = page) {
  const png = await targetPage.screenshot({ fullPage: false });
  const webp = await sharp(png).webp({ quality: 72 }).toBuffer();
  await writeFile('.audit/' + name + '.webp', webp);
  const response = await fetch('https://api.github.com/repos/' + process.env.GITHUB_REPOSITORY + '/git/blobs', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: JSON.stringify({ content: webp.toString('base64'), encoding: 'base64' })
  });
  const blob = await response.json();
  console.log('SCREENSHOT_BLOB', name, response.status, blob.sha || blob.message);
}
try {
  await page.goto('https://www.prime-it.kz/', { waitUntil: 'networkidle', timeout: 45000 });
  const content = await page.locator('body').innerText();
  await writeFile('.audit/live.txt', content);
  console.log('LIVE_SITE', JSON.stringify({
    url: page.url(), title: await page.title(),
    headings: await page.locator('h1,h2,h3').allTextContents(),
    contacts: content.match(/.{0,45}(?:105|100|диагност|Гарантия|10:00|20:00).{0,95}/gi),
    failedRequests: requests.slice(0,25)
  }));
  await capture('baseline-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
  await capture('baseline-mobile');
} catch (error) { console.log('LIVE_SITE_UNAVAILABLE', error.message); }
for (const url of [
  'https://go.2gis.com/f7IzE',
  'https://2gis.kz/almaty/search/PRIME%20IT',
  'https://2gis.kz/almaty/search/' + encodeURIComponent('Сатпаева 105А PRIME IT')
]) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(4500);
    const content = await page.locator('body').innerText();
    console.log('TWOGIS_PUBLIC', JSON.stringify({ url: page.url(), title: await page.title(), text: content.slice(0,14000),
      links: await page.locator('a[href*="/firm/"]').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent,href:node.href})).slice(0,15)) }));
    await writeFile('.audit/2gis-' + Math.random().toString(16).slice(2) + '.txt', content);
  } catch (error) { console.log('TWOGIS_UNAVAILABLE', url, error.message); }
}
const localPage = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await localPage.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
await capture('baseline-desktop', localPage);
await localPage.setViewportSize({ width: 390, height: 844 });
await localPage.reload({ waitUntil: 'networkidle' });
await capture('baseline-mobile', localPage);
console.log('ORIGINAL_HERO', JSON.stringify(await sharp('public/hero.webp').metadata()));
await browser.close();
server.kill();
