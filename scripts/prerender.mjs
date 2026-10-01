import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { render, pageMeta, structuredData, routes } from '../.ssr/entry-server.js';
const template = await readFile('dist/index.html','utf8');
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
function head(path) {
  const meta = pageMeta(path);
  const schema = JSON.stringify(structuredData(path)).replace(/</g,'\\u003c');
  return [
    '<title>' + escape(meta.title) + '</title>',
    '<meta name="description" content="' + escape(meta.description) + '" />',
    '<meta name="robots" content="' + (meta.index ? 'index, follow, max-image-preview:large' : 'noindex, follow') + '" />',
    ...(meta.canonical ? ['<link rel="canonical" href="' + meta.canonical + '" />'] : []),
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="ru_RU" />',
    '<meta property="og:site_name" content="PRIME IT" />',
    '<meta property="og:title" content="' + escape(meta.title) + '" />',
    '<meta property="og:description" content="' + escape(meta.description) + '" />',
    ...(meta.canonical ? ['<meta property="og:url" content="' + meta.canonical + '" />'] : []),
    '<meta property="og:image" content="' + meta.image + '" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="PRIME IT: ремонт компьютеров и ноутбуков в Алматы, Сатпаева, 105А" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="' + escape(meta.title) + '" />',
    '<meta name="twitter:description" content="' + escape(meta.description) + '" />',
    '<meta name="twitter:image" content="' + meta.image + '" />',
    '<script type="application/ld+json">' + schema + '</script>',
  ].join('\n    ');
}
for (const path of [...routes, '/404.html']) {
  const html = template.replace(/<!--SEO_HEAD_START-->[\s\S]*?<!--SEO_HEAD_END-->/,head(path))
    .replace('<div id="root"></div>', '<div id="root" data-prerendered="true">' + render(path) + '</div>');
  if (html === template || !html.includes('data-prerendered="true"') || html.includes('SEO_HEAD_START')) throw new Error('HTML template replacement failed: ' + path);
  const directory = path === '/404.html' ? 'dist' : join('dist',path.slice(1));
  await mkdir(directory,{recursive:true});
  await writeFile(join(directory,path === '/404.html' ? '404.html' : 'index.html'),html);
  console.log('PRERENDER',path,'HTML bytes:',Buffer.byteLength(html));
}
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes.map(path => '  <url><loc>https://www.prime-it.kz' + path + '</loc></url>').join('\n') + '\n</urlset>\n';
const publicSitemap = await readFile('public/sitemap.xml','utf8');
if (sitemap !== publicSitemap) throw new Error('public/sitemap.xml must match all generated routes');
await writeFile('dist/sitemap.xml',sitemap);
