import { chromium } from 'playwright';

const sourceUrl = 'https://2gis.kz/almaty/geo/70000001078609004';
async function readPublicHtml(url, label) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    const html = await response.text();
    const offline = await browser.newContext({ javaScriptEnabled: false });
    await offline.route('**/*', route => route.abort());
    const page = await offline.newPage();
    try {
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const record = await page.evaluate(() => ({
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        text: document.body?.innerText?.slice(0, 42000) ?? '',
        links: Array.from(document.querySelectorAll('a[href]'))
          .map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }))
          .filter(a => /reviews|отзыв|tel:|prime|сатпа|70000001078609004/i.test(a.text + ' ' + a.href))
          .slice(0, 100),
        schema: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => s.textContent.slice(0, 20000))
      }));
      record.url = response.url;
      record.status = response.status;
      record.blocked = /captcha|капч|подтвердите,? что вы|подтвердить,? что вы|проверка браузера|are you a robot|доступ ограничен/i.test(record.url + ' ' + record.title + ' ' + record.text);
      console.log('PUBLIC_2GIS_HTML_' + label, JSON.stringify(record));
      return record;
    } finally {
      await offline.close();
    }
  } catch (error) {
    console.log('PUBLIC_2GIS_HTML_' + label + '_ERROR', String(error));
    return null;
  }
}
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
const publicCard = await readPublicHtml(sourceUrl, 'CARD');
if (publicCard && !publicCard.blocked) {
  const reviewLink = publicCard.links.find(link => /\/tab\/reviews(?:[/?#]|$)/.test(link.href) && link.href.includes('70000001078609004'));
  if (reviewLink) await readPublicHtml(new URL(reviewLink.href, publicCard.url).href, 'REVIEWS');
  else console.log('PUBLIC_2GIS_HTML_REVIEWS_LINK_NOT_EXPOSED');
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
