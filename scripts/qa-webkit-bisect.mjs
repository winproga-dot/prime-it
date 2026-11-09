// Временная диагностика WebKit на 2560×1440.
import { webkit } from 'playwright';
import { startServer } from './serve-build.mjs';
const server = await startServer(4179);
const variants = [
  ['none', '', false], ['noFrames', '', true],
  ['noOutlineMarquee', '.marquee--outline{display:none!important}', false],
  ['noWordmark', '.footer-wordmark{display:none!important}', false],
  ['noNavAnim', '.header-nav{animation:none!important;background:#111!important}', false],
  ['noFramesNoBig', '.marquee--outline,.footer-wordmark{display:none!important}.header-nav{animation:none!important}', true],
];
for (const [name, css, blockFrames] of variants) {
  for (let run = 0; run < 2; run++) {
    const browser = await webkit.launch();
    const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } });
    let crashed = false; page.on('crash', () => { crashed = true; });
    try {
      if (blockFrames) await page.route('**/hero-frames/**', route => route.abort());
      if (css) await page.addInitScript(c => document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = c; document.head.append(s); }), css);
      await page.goto(server.url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(3000);
      for (let y = 0; y < 12000; y += 500) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(60); }
      await page.evaluate(() => document.querySelector('#estimate').scrollIntoView());
      await page.getByRole('button', { name: 'Сильно греется', exact: true }).click({ timeout: 8000 });
      await page.waitForTimeout(2000);
      console.log('BISECT2560', name, run, crashed ? 'CRASH' : 'OK');
    } catch (error) { console.log('BISECT2560', name, run, crashed ? 'CRASH' : 'ERROR ' + error.message.split('\n')[0]); }
    await browser.close().catch(() => {});
  }
}
await server.close();
