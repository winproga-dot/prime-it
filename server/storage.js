// Хранилище правок. На Vercel — Vercel Blob (переменная BLOB_READ_WRITE_TOKEN
// появляется автоматически после подключения Blob-хранилища к проекту).
// Для локальной разработки и автотестов — папка CONTENT_STORE_DIR.
// Каждое сохранение — новый неизменяемый файл (история версий), читается последний.
import { mkdir, readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

const KEEP_VERSIONS = 20;
const stamp = () => new Date().toISOString().replace(/[-:.TZ]/g, '') + '-' + randomBytes(4).toString('hex');

function blobStore() {
  const load = () => import('@vercel/blob');
  return {
    kind: 'blob',
    async readContent() {
      const { list } = await load();
      const { blobs } = await list({ prefix: 'content/', limit: 1000 });
      if (!blobs.length) return {};
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const response = await fetch(blobs[0].url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Не удалось прочитать содержимое');
      return response.json();
    },
    async saveContent(content) {
      const { put, list, del } = await load();
      await put('content/' + stamp() + '.json', JSON.stringify(content), { access: 'public', contentType: 'application/json', addRandomSuffix: true });
      const { blobs } = await list({ prefix: 'content/', limit: 1000 });
      const old = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(KEEP_VERSIONS);
      if (old.length) await del(old.map(blob => blob.url));
    },
    async readRevokedAt() {
      const { list } = await load();
      const { blobs } = await list({ prefix: 'meta/revoked-', limit: 1000 });
      if (!blobs.length) return 0;
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      return new Date(blobs[0].uploadedAt).getTime();
    },
    async revokeSessions() {
      const { put } = await load();
      await put('meta/revoked-' + stamp() + '.json', JSON.stringify({ at: Date.now() }), { access: 'public', contentType: 'application/json', addRandomSuffix: true });
    },
    async saveImage(bytes, extension, contentType) {
      const { put } = await load();
      const blob = await put('uploads/' + stamp() + '.' + extension, bytes, { access: 'public', contentType, addRandomSuffix: true });
      return blob.url;
    },
  };
}

function fileStore(root) {
  const contentDir = join(root, 'content'); const uploadDir = join(root, 'uploads');
  return {
    kind: 'file',
    async readContent() {
      await mkdir(contentDir, { recursive: true });
      const files = (await readdir(contentDir)).filter(name => name.endsWith('.json')).sort();
      return files.length ? JSON.parse(await readFile(join(contentDir, files[files.length - 1]), 'utf8')) : {};
    },
    async saveContent(content) {
      await mkdir(contentDir, { recursive: true });
      await writeFile(join(contentDir, stamp() + '.json'), JSON.stringify(content));
      const files = (await readdir(contentDir)).filter(name => name.endsWith('.json')).sort();
      for (const name of files.slice(0, Math.max(0, files.length - KEEP_VERSIONS))) await unlink(join(contentDir, name));
    },
    async readRevokedAt() {
      try { return JSON.parse(await readFile(join(root, 'revoked.json'), 'utf8')).at || 0; } catch { return 0; }
    },
    async revokeSessions() { await writeFile(join(root, 'revoked.json'), JSON.stringify({ at: Date.now() })); },
    async saveImage(bytes, extension) {
      await mkdir(uploadDir, { recursive: true });
      const name = stamp() + '.' + extension;
      await writeFile(join(uploadDir, name), bytes);
      return '/uploads/' + name;
    },
  };
}

export function getStore() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobStore();
  if (process.env.CONTENT_STORE_DIR) return fileStore(process.env.CONTENT_STORE_DIR);
  return null;
}

// После сохранения просим Vercel пересобрать сайт (Deploy Hook из настроек проекта).
export async function triggerPublish() {
  const url = process.env.DEPLOY_HOOK_URL;
  if (!url) return 'not-configured';
  try { const response = await fetch(url, { method: 'POST' }); return response.ok ? 'started' : 'failed'; } catch { return 'failed'; }
}
