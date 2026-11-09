// Временная диагностика: какой эффект роняет WebKit на мобильной ширине.
import { webkit } from 'playwright';
import { startServer } from './serve-build.mjs';
const server = await startServer(4179);
const variants = {
  none: '',
  noLeaf3d: '.leaf{transform:none!important;transform-style:flat!important;transition:none!important}.leaf-front,.leaf-back{backface-visibility:visible!important;-webkit-backface-visibility:visible!important}.book{perspective:none!important}',
  noWordAnim: '.w,.load-in,.split-load .w{animation:none!important;filter:none!important}',
  noMarquee: '.marquee{display:none!important}',
  noStroke: '.marquee--outline{-webkit-text-stroke:0!important;color:#555!important}',
  noBackdrop: '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
  noCanvas: '.hv-frame canvas{display:none!important}',
  noBlurFilter: '*{filter:none!important}',
  allOff: '',
};
variants.allOff = Object.values(variants).join('');
const browser = await webkit.launch();
for (const [name, css] of Object.entries(variants)) {
  for (let run = 0; run < 2; run++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    let crashed = false; page.on('crash', () => { crashed = true; });
    try {
      if (name === 'noWordAnim' || name === 'allOff') await page.addInitScript(() => { const a = Element.prototype.animate; Element.prototype.animate = function (k, o) { return a.call(this, Array.isArray(k) ? k.map(f => { const { filter, ...r } = f; return r; }) : k, o); }; });
      await page.goto(server.url, { waitUntil: 'load', timeout: 30000 });
      if (css) await page.addStyleTag({ content: css });
      for (let y = 0; y < 8000; y += 300) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(80); }
      await page.evaluate(() => document.querySelector('#estimate').scrollIntoView());
      await page.getByRole('button', { name: 'Сильно греется', exact: true }).click({ timeout: 8000 });
      await page.waitForTimeout(1500);
      await page.locator('.sticker').nth(3).click({ timeout: 8000 });
      await page.waitForTimeout(1500);
      console.log('BISECT', name, run, crashed ? 'CRASH' : 'OK');
    } catch (error) { console.log('BISECT', name, run, crashed ? 'CRASH' : 'ERROR ' + error.message.split('\n')[0]); }
    await context.close().catch(() => {});
  }
}
await browser.close(); await server.close();
