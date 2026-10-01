import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { servicePages } from '../src/data/services.js';
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json' };
export async function startServer(port = 4173) {
  const directory = resolve('dist');
  const server = createServer(async (request,response) => {
    try {
      const url = new URL(request.url,'http://localhost');
      const path = decodeURIComponent(url.pathname);
      if (servicePages.some(page => page.path.slice(0,-1) === path)) {
        response.writeHead(301,{Location:path + '/' + url.search});response.end();return;
      }
      let file = resolve(directory,'.' + path);
      if (file !== directory && !file.startsWith(directory + sep)) { response.writeHead(403);response.end();return; }
      let status = 200;
      try { if ((await stat(file)).isDirectory()) file = resolve(file,'index.html'); await stat(file); }
      catch { file = resolve(directory,'404.html');status = 404; }
      const data = await readFile(file);
      const extension = extname(file);
      const headers = {'Content-Type':mime[extension] || 'application/octet-stream',
        'Cache-Control': extension === '.html' ? 'no-cache' : file.includes(sep + 'assets' + sep) ? 'public, max-age=31536000, immutable' : 'public, max-age=86400',
        'X-Content-Type-Options':'nosniff'};
      const compression = /\btext\/|application\/(xml|json)/.test(headers['Content-Type']) && /gzip/.test(request.headers['accept-encoding'] || '');
      if(compression) { headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding'; }
      response.writeHead(status,headers);response.end(compression ? gzipSync(data) : data);
    } catch { response.writeHead(500);response.end('Server error'); }
  });
  await new Promise(resolveReady => server.listen(port,'127.0.0.1',resolveReady));
  return { url:'http://127.0.0.1:' + port, close:() => new Promise(done=>server.close(done)) };
}
