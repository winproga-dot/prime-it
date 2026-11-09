// GET /api/admin/content — текущие правки (только после входа).
// PUT /api/admin/content — сохранить правки (только после входа) и запустить публикацию.
import { json, requireAdmin } from '../../server/auth.js';
import { getStore, triggerPublish } from '../../server/storage.js';
import { validateContent } from '../../src/data/contentSchema.js';

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const store = getStore();
  if (!store) return json({ error: 'Хранилище не подключено' }, 503);
  try { return json({ content: await store.readContent(), storage: store.kind }); }
  catch (error) { console.error('CONTENT_READ_FAILED', error); return json({ error: 'Хранилище недоступно: ' + error.message }, 502); }
}

export async function PUT(request) {
  const denied = await requireAdmin(request, { mutate: true });
  if (denied) return denied;
  const store = getStore();
  if (!store) return json({ error: 'Хранилище не подключено' }, 503);
  if (Number(request.headers.get('content-length') || 0) > 200000) return json({ error: 'Слишком большой запрос' }, 413);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Неверный формат данных' }, 400); }
  const { content, errors } = validateContent(body?.content);
  if (errors.length) return json({ error: 'Проверьте поля', errors }, 422);
  try { await store.saveContent(content); }
  catch (error) { console.error('CONTENT_SAVE_FAILED', error); return json({ error: 'Не удалось сохранить в хранилище: ' + error.message }, 502); }
  const publish = await triggerPublish();
  return json({ ok: true, content, publish });
}
