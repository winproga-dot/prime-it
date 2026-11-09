// Авторизация админки. Пароль и секрет — только в переменных окружения
// (ADMIN_PASSWORD, SESSION_SECRET), в коде и в репозитории их нет.
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getStore } from './storage.js';

export const COOKIE = '__Host-prime_admin';
const SESSION_HOURS = 8;
const MAX_FAILS = 5;
const BLOCK_MS = 15 * 60 * 1000;
const fails = new Map(); // ip -> { count, until } (на один экземпляр функции)

export function config() {
  const password = process.env.ADMIN_PASSWORD || '';
  const secret = process.env.SESSION_SECRET || '';
  return { password, secret, ready: password.length >= 10 && secret.length >= 32 };
}

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
}

const b64 = buffer => Buffer.from(buffer).toString('base64url');
const sign = (data, secret) => createHmac('sha256', secret).update(data).digest('base64url');
const sameBytes = (a, b) => {
  const x = createHash('sha256').update(String(a)).digest(); const y = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(x, y);
};

export function createSession() {
  const { secret } = config();
  const now = Math.floor(Date.now() / 1000);
  const payload = b64(JSON.stringify({ sub: 'admin', iat: Date.now(), exp: now + SESSION_HOURS * 3600, n: b64(randomBytes(9)) }));
  return payload + '.' + sign(payload, secret);
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

// Время последнего выхода: токены, выданные раньше, недействительны (кэш 5 с на экземпляр).
let revoked = { at: 0, checked: 0 };
async function revokedAt() {
  if (Date.now() - revoked.checked < 5000) return revoked.at;
  const store = getStore();
  revoked = { at: store ? await store.readRevokedAt() : 0, checked: Date.now() };
  return revoked.at;
}
export async function revokeAll() {
  const store = getStore();
  if (store) await store.revokeSessions();
  revoked = { at: Date.now(), checked: Date.now() };
}

export async function verifySession(request) {
  const { secret, ready } = config();
  if (!ready) return false;
  const token = readCookie(request, COOKIE);
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !sameBytes(sign(payload, secret), signature)) return false;
  let data;
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return false; }
  if (data.sub !== 'admin' || !Number.isFinite(data.exp) || data.exp <= Date.now() / 1000 || !Number.isFinite(data.iat)) return false;
  return data.iat > await revokedAt();
}

export const sessionCookie = token => COOKIE + '=' + token + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + SESSION_HOURS * 3600;
export const clearCookie = () => COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';

// Защита от CSRF: изменяющие запросы только со своего сайта и с особым заголовком,
// который браузер не отправит с чужой страницы без CORS-разрешения.
export function sameOrigin(request) {
  if (request.headers.get('x-admin-request') !== '1') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

// x-real-ip выставляет сама платформа Vercel (клиент его не подменит).
const clientIp = request => request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
export function loginBlocked(request) {
  const entry = fails.get(clientIp(request));
  return Boolean(entry && entry.until > Date.now());
}
export function checkPassword(request, candidate) {
  const { password } = config();
  const ok = typeof candidate === 'string' && candidate.length <= 200 && sameBytes(candidate, password);
  const ip = clientIp(request);
  if (ok) { fails.delete(ip); return true; }
  const entry = fails.get(ip) || { count: 0, until: 0 };
  entry.count += 1;
  if (entry.count >= MAX_FAILS) { entry.until = Date.now() + BLOCK_MS; entry.count = 0; }
  fails.set(ip, entry);
  return false;
}

// Общая обёртка для защищённых обработчиков.
export async function requireAdmin(request, { mutate = false } = {}) {
  if (!config().ready) return json({ error: 'Админка не настроена на сервере' }, 503);
  if (mutate && !sameOrigin(request)) return json({ error: 'Запрос отклонён' }, 403);
  if (!await verifySession(request)) return json({ error: 'Нужна авторизация' }, 401);
  return null;
}
