// Локальный аналог Vercel для проверки админки: статический сайт из dist/,
// API-функции из api/, файловое хранилище (CONTENT_STORE_DIR) вместо Vercel Blob
// и имитация Deploy Hook — после сохранения сайт пересобирается с новым содержимым.
// Пароль и секрет берутся только из окружения: ADMIN_PASSWORD, SESSION_SECRET.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep, join } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json','.woff2':'font/woff2','.ico':'image/x-icon' };
const routes = { '/api/login':'api/login.js', '/api/logout':'api/logout.js', '/api/admin/session':'api/admin/session.js', '/api/admin/content':'api/admin/content.js', '/api/admin/upload':'api/admin/upload.js' };

export async function startDevServer({ port = 4300, buildCommand = ['npm', ['run', 'build']] } = {}) {
  const deploy = { state: 'idle', builds: 0, log: '' };
  const runBuild = () => new Promise(done => {
    deploy.state = 'building';
    const child = spawn(buildCommand[0], buildCommand[1], { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => { deploy.log += chunk; });
    child.stderr.on('data', chunk => { deploy.log += chunk; });
    child.on('close', code => { deploy.state = code === 0 ? 'ready' : 'error'; deploy.builds += 1; done(); });
  });
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost:' + port);
      const path = url.pathname.replace(/\/$/, '') || '/';
      if (path === '/__deploy-hook' && req.method === 'POST') { runBuild(); res.writeHead(201); res.end('{}'); return; }
      if (path === '/__deploy-status') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ state: deploy.state, builds: deploy.builds })); return; }
      if (routes[path]) {
        const module = await import(pathToFileURL(resolve(routes[path])).href);
        const handler = module[req.method];
        if (!handler) { res.writeHead(405); res.end(); return; }
        const chunks = []; for await (const chunk of req) chunks.push(chunk);
        const headers = new Headers(); for (const [key, value] of Object.entries(req.headers)) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
        const response = await handler(request);
        const outHeaders = {}; response.headers.forEach((value, key) => { outHeaders[key] = value; });
        res.writeHead(response.status, outHeaders); res.end(Buffer.from(await response.arrayBuffer())); return;
      }
      if (path.startsWith('/uploads/') && process.env.CONTENT_STORE_DIR) {
        const file = resolve(process.env.CONTENT_STORE_DIR, 'uploads', path.slice(9));
        if (!file.startsWith(resolve(process.env.CONTENT_STORE_DIR, 'uploads') + sep)) { res.writeHead(403); res.end(); return; }
        res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }); res.end(await readFile(file)); return;
      }
      const dist = resolve('dist');
      let file = resolve(dist, '.' + decodeURIComponent(url.pathname)); let status = 200;
      if (file !== dist && !file.startsWith(dist + sep)) { res.writeHead(403); res.end(); return; }
      try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); await stat(file); } catch { file = join(dist, '404.html'); status = 404; }
      res.writeHead(status, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(await readFile(file));
    } catch (error) { res.writeHead(500); res.end(String(error.message)); }
  });
  await new Promise(done => server.listen(port, 'localhost', done));
  return { url: 'http://localhost:' + port, deploy, close: () => new Promise(done => server.close(done)) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await startDevServer({ port: Number(process.env.PORT || 4300) });
  console.log('DEV_SERVER', url, '— админка:', url + '/admin/');
}
