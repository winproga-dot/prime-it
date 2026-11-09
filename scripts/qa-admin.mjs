// Полный сценарий админки: защита API без входа, неверный пароль, вход, правка текста
// и изображения, сохранение, публикация (пересборка), проверка на сайте после
// перезагрузки, выход и отзыв сессии. Пароль и секрет — случайные, только в окружении.
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';
import sharp from 'sharp';

const store = await mkdtemp(join(tmpdir(), 'prime-admin-'));
const port = 4300 + Math.floor(Math.random() * 500);
Object.assign(process.env, {
  ADMIN_PASSWORD: randomBytes(12).toString('base64url'),
  SESSION_SECRET: randomBytes(32).toString('hex'),
  CONTENT_STORE_DIR: store,
  DEPLOY_HOOK_URL: 'http://localhost:' + port + '/__deploy-hook',
});
const { startDevServer } = await import('./dev-server.mjs');
const results = [];
const step = (name, detail = '') => { results.push(name); console.log('ADMIN_QA_OK', name, detail); };
const marker = 'Тестовый текст ' + randomBytes(3).toString('hex');

execSync('npm run build', { stdio: 'ignore', env: process.env });
const server = await startDevServer({ port });
const browser = await chromium.launch();
try {
  const api = await browser.newContext(); const req = api.request;
  const base = server.url;

  // 1. Без входа данные админки и изменения недоступны.
  assert.equal((await req.get(base + '/api/admin/content')).status(), 401); step('GET содержимого без входа → 401');
  assert.equal((await req.put(base + '/api/admin/content', { headers: { 'X-Admin-Request': '1' }, data: { content: { hero: { lead: 'взлом' } } } })).status(), 401); step('PUT без входа → 401');
  assert.equal((await req.put(base + '/api/admin/content', { data: { content: { hero: { lead: 'взлом' } } } })).status(), 403); step('PUT без служебного заголовка (CSRF) → 403');
  assert.equal((await req.put(base + '/api/admin/content', { headers: { 'X-Admin-Request': '1', Origin: 'https://evil.example' }, data: { content: {} } })).status(), 403); step('PUT с чужого сайта (Origin) → 403');
  assert.equal((await req.post(base + '/api/admin/upload', { headers: { 'X-Admin-Request': '1' }, multipart: { file: { name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('x') } } })).status(), 401); step('Загрузка файла без входа → 401');
  const forged = 'eyJzdWIiOiJhZG1pbiIsImlhdCI6OTk5OTk5OTk5OTk5OSwiZXhwIjo5OTk5OTk5OTk5fQ.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  assert.equal((await req.put(base + '/api/admin/content', { headers: { 'X-Admin-Request': '1', Cookie: '__Host-prime_admin=' + forged }, data: { content: { hero: { lead: 'взлом' } } } })).status(), 401); step('PUT с поддельной cookie → 401');
  const files = async dir => (await readdir(join(store, dir)).catch(() => []));
  assert.deepEqual([...await files('content'), ...await files('uploads')], [], 'Хранилище не изменилось'); step('Хранилище не изменилось после попыток без входа');
  const adminHtml = await (await req.get(base + '/admin/')).text();
  assert(!adminHtml.includes(process.env.ADMIN_PASSWORD) && adminHtml.includes('noindex')); step('Страница админки не содержит данных и закрыта от индексации');
  await api.close();

  // 2. Неверный пароль.
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/admin/');
  await page.getByLabel('Пароль').fill('неверный-пароль-123');
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.getByRole('alert').filter({ hasText: 'Неверный пароль' }).waitFor();
  assert.equal((await context.cookies()).length, 0, 'После неверного пароля cookie нет');
  assert.equal((await page.request.get(base + '/api/admin/content')).status(), 401);
  step('Неверный пароль: ошибка, сессии нет, API → 401');

  // 3. Вход.
  await page.getByLabel('Пароль').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.getByRole('button', { name: 'Сохранить и опубликовать' }).waitFor();
  const [cookie] = await context.cookies();
  assert(cookie && cookie.httpOnly && cookie.secure && cookie.sameSite === 'Strict', 'Cookie: HttpOnly, Secure, SameSite=Strict');
  step('Вход: открыт редактор; cookie HttpOnly + Secure + SameSite=Strict');

  // 4. Правка текста и изображения.
  await page.locator('textarea[name="hero.lead"]').fill(marker);
  await page.getByRole('button', { name: 'Витрина услуг' }).click();
  const png = await sharp({ create: { width: 1200, height: 750, channels: 3, background: { r: 238, g: 255, b: 0 } } }).png().toBuffer();
  await page.locator('input[type="file"][data-path="showcase.items.0.image"]').setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('status').filter({ hasText: 'Загружено' }).waitFor();
  const uploaded = await page.locator('.image-field img').first().getAttribute('src');
  assert(uploaded.startsWith('/uploads/') && uploaded.endsWith('.webp'), 'Изображение загружено и сжато в WebP: ' + uploaded);
  step('Изображение загружено (уменьшено в браузере до WebP)', uploaded);
  const before = server.deploy.builds;
  await page.getByRole('button', { name: 'Сохранить и опубликовать' }).click();
  await page.getByRole('status').filter({ hasText: 'Сохранено. Сайт обновится' }).waitFor();
  step('Сохранение: «Сохранено», запущена публикация');

  // Предпросмотр сразу после сохранения (до пересборки).
  const previewPage = await context.newPage();
  await previewPage.goto(base + '/?preview=1', { waitUntil: 'load' });
  await previewPage.locator('.hv-lead').filter({ hasText: marker }).waitFor({ timeout: 15000 });
  await previewPage.close();
  step('Предпросмотр показывает правку сразу');

  // 5. Публикация и проверка на сайте (обычный посетитель, без cookie).
  const deadline = Date.now() + 180000;
  while (!(server.deploy.builds > before && server.deploy.state !== 'building')) {
    assert(Date.now() < deadline, 'Пересборка не завершилась'); await new Promise(r => setTimeout(r, 1000));
  }
  assert.equal(server.deploy.state, 'ready', 'Сборка успешна');
  const visitor = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const site = await visitor.newPage();
  const html = await (await site.goto(base + '/', { waitUntil: 'load' })).text();
  assert(html.includes(marker), 'Новый текст в HTML страницы (виден поисковикам)');
  assert(html.includes(uploaded), 'Новое изображение в HTML страницы');
  await site.locator('.hv-lead').filter({ hasText: marker }).waitFor();
  assert.equal(await site.locator('.showcase-media img').first().getAttribute('src'), uploaded);
  const imageOk = await site.locator('.showcase-media img').first().evaluate(async img => { img.loading = 'eager'; img.scrollIntoView(); await img.decode().catch(() => {}); return img.naturalWidth > 0; });
  assert(imageOk, 'Изображение реально загружается');
  step('Сайт после публикации: новый текст и изображение (в HTML и на странице)');
  await site.reload({ waitUntil: 'load' });
  await site.locator('.hv-lead').filter({ hasText: marker }).waitFor();
  step('После перезагрузки страницы изменения сохранились');
  await page.reload();
  await page.getByRole('button', { name: 'Сохранить и опубликовать' }).waitFor();
  assert.equal(await page.locator('textarea[name="hero.lead"]').inputValue(), marker);
  step('В админке после перезагрузки — сохранённое значение');
  await visitor.close();

  // 6. Выход и отзыв сессии.
  const stolen = (await context.cookies())[0].value;
  await page.getByRole('button', { name: 'Выйти' }).click();
  await page.getByRole('button', { name: 'Войти' }).waitFor();
  assert.equal((await context.cookies()).length, 0, 'Cookie удалена');
  assert.equal((await page.request.get(base + '/api/admin/content')).status(), 401);
  const replay = await browser.newContext();
  const status = (await replay.request.put(base + '/api/admin/content', { headers: { 'X-Admin-Request': '1', Cookie: '__Host-prime_admin=' + stolen }, data: { content: { hero: { lead: 'после выхода' } } } })).status();
  assert.equal(status, 401, 'Старый токен после выхода не работает');
  await replay.close();
  step('Выход: cookie удалена, API → 401, скопированный старый токен отклонён');

  // 7. Ограничение подбора пароля.
  const brute = await browser.newContext();
  let last = 0;
  for (let i = 0; i < 6; i++) last = (await brute.request.post(base + '/api/login', { headers: { 'X-Admin-Request': '1', 'X-Real-IP': '203.0.113.7' }, data: { password: 'guess' + i } })).status();
  assert.equal(last, 429, 'После 5 ошибок вход временно заблокирован');
  const blocked = (await brute.request.post(base + '/api/login', { headers: { 'X-Admin-Request': '1', 'X-Real-IP': '203.0.113.7' }, data: { password: process.env.ADMIN_PASSWORD } })).status();
  assert.equal(blocked, 429, 'Даже верный пароль не принимается во время блокировки');
  await brute.close();
  step('Подбор пароля: после 5 ошибок — блокировка 15 минут (429)');

  // 8. Сервер отклоняет недопустимые данные даже с действующей сессией.
  const admin = await browser.newContext(); const ap = admin.request;
  assert.equal((await ap.post(base + '/api/login', { headers: { 'X-Admin-Request': '1' }, data: { password: process.env.ADMIN_PASSWORD } })).status(), 200);
  const bad = await ap.put(base + '/api/admin/content', { headers: { 'X-Admin-Request': '1' }, data: { content: { showcase: { items: [{ image: 'javascript:alert(1)' }] }, hero: { lead: 'x'.repeat(1000) } } } });
  assert.equal(bad.status(), 422);
  const fake = await ap.post(base + '/api/admin/upload', { headers: { 'X-Admin-Request': '1' }, multipart: { file: { name: 'evil.png', mimeType: 'image/png', buffer: Buffer.from('<script>alert(1)</script>') } } });
  assert.equal(fake.status(), 415);
  await admin.close();
  step('Недопустимые данные (ссылка javascript:, слишком длинный текст, «картинка» со скриптом) отклонены');

  assert.deepEqual(errors, [], 'Ошибок в консоли админки нет');
  console.log('ADMIN_QA_PASS', JSON.stringify({ checks: results.length }));
} finally {
  await browser.close(); await server.close(); await rm(store, { recursive: true, force: true });
  execSync('node scripts/load-content.mjs', { stdio: 'ignore', env: { ...process.env, CONTENT_STORE_DIR: '' } });
}
