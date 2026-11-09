// GET /api/admin/session — проверка, выполнен ли вход.
import { json, verifySession, config } from '../../server/auth.js';

export async function GET(request) {
  return json({ authenticated: await verifySession(request), configured: config().ready });
}
