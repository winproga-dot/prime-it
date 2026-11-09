// POST /api/login — вход администратора. Пароль сверяется с ADMIN_PASSWORD из окружения.
import { config, json, sameOrigin, loginBlocked, checkPassword, createSession, sessionCookie } from '../server/auth.js';

export async function POST(request) {
  if (!config().ready) return json({ error: 'Админка не настроена на сервере' }, 503);
  if (!sameOrigin(request)) return json({ error: 'Запрос отклонён' }, 403);
  if (loginBlocked(request)) return json({ error: 'Слишком много попыток. Попробуйте через 15 минут.' }, 429);
  let body = {};
  try { body = await request.json(); } catch { /* пустое тело */ }
  if (!checkPassword(request, body.password)) {
    await new Promise(resolve => setTimeout(resolve, 400)); // замедляем подбор
    return json({ error: 'Неверный пароль' }, 401);
  }
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(createSession()) });
}
