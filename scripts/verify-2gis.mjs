import { chromium } from 'playwright';

const sourceUrl = 'https://2gis.kz/almaty/geo/70000001078609004';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1366, height: 900 } });
async function inspect(url, label) {
  const page = await context.newPage();
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    const record = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      text: document.body?.innerText?.slice(0, 42000) ?? '',
      links: Array.from(document.querySelectorAll('a[href]'))
        .map(a => ({ text: a.innerText.trim(), href: a.href }))
        .filter(a => /reviews|отзыв|tel:|prime|satpa|сатпа|70000001078609004/i.test(a.text + ' ' + a.href))
        .slice(0, 100),
      schema: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => s.textContent.slice(0, 18000))
    }));
    record.status = response?.status() ?? null;
    record.blocked = /captcha|капч|подтвердите,? что вы|проверка браузера|докажите,? что вы|are you a robot|доступ ограничен/i.test(record.url + ' ' + record.title + ' ' + record.text);
    console.log('PUBLIC_2GIS_' + label, JSON.stringify(record));
    return record;
  } catch (error) {
    console.log('PUBLIC_2GIS_' + label + '_ERROR', JSON.stringify({ url, error: String(error), actualUrl: page.url() }));
    return null;
  } finally {
    await page.close();
  }
}
console.log('OWNER_PROVIDED_2GIS_URL', sourceUrl);
try {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(25000) });
  const html = await response.text();
  console.log('PUBLIC_2GIS_HTTP', JSON.stringify({ status: response.status, url: response.url,
    title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null,
    canonical: html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ?? null,
    bytes: Buffer.byteLength(html) }));
} catch (error) {
  console.log('PUBLIC_2GIS_HTTP_ERROR', String(error));
}
try {
  const card = await inspect(sourceUrl, 'CARD');
  if (card && !card.blocked) {
    const reviewLink = card.links.find(link => /\/tab\/reviews(?:[/?#]|$)/.test(link.href) && link.href.includes('70000001078609004'));
    if (reviewLink) await inspect(reviewLink.href, 'REVIEWS');
    else console.log('PUBLIC_2GIS_REVIEWS_LINK_NOT_EXPOSED');
  } else {
    console.log('PUBLIC_2GIS_STOP_NO_VERIFIED_REVIEWS');
  }
} finally {
  await context.close();
  await browser.close();
}
