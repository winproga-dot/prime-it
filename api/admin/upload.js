// POST /api/admin/upload — загрузка изображения (только после входа).
// Принимаются JPEG, PNG и WebP до 5 МБ; формат проверяется по содержимому файла.
import { json, requireAdmin } from '../../server/auth.js';
import { getStore } from '../../server/storage.js';

const MAX = 5 * 1024 * 1024;
function detect(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ['jpg', 'image/jpeg'];
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return ['png', 'image/png'];
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return ['webp', 'image/webp'];
  return null;
}

export async function POST(request) {
  const denied = await requireAdmin(request, { mutate: true });
  if (denied) return denied;
  const store = getStore();
  if (!store) return json({ error: 'Хранилище не подключено' }, 503);
  if (Number(request.headers.get('content-length') || 0) > MAX + 100000) return json({ error: 'Файл больше 5 МБ' }, 413);
  let file;
  try { file = (await request.formData()).get('file'); } catch { return json({ error: 'Файл не получен' }, 400); }
  if (!file || typeof file.arrayBuffer !== 'function') return json({ error: 'Файл не получен' }, 400);
  if (file.size > MAX) return json({ error: 'Файл больше 5 МБ' }, 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detect(bytes);
  if (!type) return json({ error: 'Нужен JPEG, PNG или WebP' }, 415);
  try { return json({ ok: true, url: await store.saveImage(bytes, type[0], type[1]) }); }
  catch (error) { console.error('UPLOAD_FAILED', error); return json({ error: 'Не удалось сохранить файл: ' + error.message }, 502); }
}
