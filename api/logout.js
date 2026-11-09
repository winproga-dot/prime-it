// POST /api/logout — выход: cookie удаляется, а все ранее выданные сессии отзываются
// (даже скопированный токен перестаёт работать).
import { json, sameOrigin, clearCookie, verifySession, revokeAll } from '../server/auth.js';

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'Запрос отклонён' }, 403);
  if (await verifySession(request)) await revokeAll();
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
}
