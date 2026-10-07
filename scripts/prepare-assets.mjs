import sharp from 'sharp';
import { mkdir, stat, writeFile, rm } from 'node:fs/promises';
import { servicePhotos } from '../src/data/media.js';

await mkdir('public/media', { recursive: true });
const report = [];
for (const [id, photo] of Object.entries(servicePhotos)) {
  const before = (await stat(photo.file)).size;
  const outputs = [];
  for (const width of [640, 960]) {
    const destination = 'public/media/' + id + '-' + width + '.webp';
    await sharp(photo.file).rotate().resize(width, Math.round(width / 1.6), { fit:'cover' })
      .webp({ quality:width === 640 ? 76 : 80, effort:5 }).toFile(destination);
    const after = (await stat(destination)).size;
    if (after > 300 * 1024) throw new Error('Image exceeds budget: ' + destination);
    outputs.push({ width, bytes:after });
  }
  report.push({ id, originalBytes:before, source:photo.sourceUrl, outputs });
}
await sharp(servicePhotos.build.file).resize(1280,854,{fit:'cover'}).webp({quality:74,effort:5}).toFile('public/hero.webp');
await sharp(servicePhotos.build.file).resize(640,427,{fit:'cover'}).webp({quality:72,effort:5}).toFile('public/media/hero-small.webp');
await sharp('public/logo.jpg').resize(180,180).png().toFile('public/apple-touch-icon.png');
const overlay = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#080d13" opacity=".72"/><g font-family="DejaVu Sans,Arial,sans-serif" fill="#f5f7fa"><text x="65" y="80" font-size="31" font-weight="700">PRIME IT</text><text x="65" y="215" font-size="51" font-weight="700">Ремонт компьютеров</text><text x="65" y="283" font-size="51" font-weight="700">и ноутбуков в Алматы</text><rect x="65" y="342" rx="15" width="585" height="73" fill="#49e5a4"/><text x="91" y="389" fill="#09251b" font-size="30" font-weight="700">Бесплатная диагностика</text><text x="65" y="498" font-size="27">ул. Сатпаева, 105А</text><text x="65" y="548" font-size="24" fill="#b7c9d7">8 (707) 684-06-25 · Без выходных 10:00–20:00</text><text x="65" y="596" font-size="23" fill="#77efbc">Приём по предварительному звонку</text></g></svg>';
await sharp('public/hero.webp').resize(1200,630,{fit:'cover'}).composite([{input:Buffer.from(overlay)}]).jpeg({quality:85,mozjpeg:true}).toFile('public/og-image.jpg');

// Remove the retired asset from persistent local builds as well as clean deployments.
await rm('public/media/hero.mp4', { force:true });
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const items = Object.entries(servicePhotos).map(([id,photo]) =>
  '<li><h2>' + escape(photo.alt) + '</h2><p>Автор: ' + escape(photo.author) + '</p><p><a href="' + escape(photo.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Оригинал фотографии</a> · <a href="' + escape(photo.licenseUrl || photo.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + escape(photo.license) + '</a></p></li>'
).join('');
const credits = '<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><title>Источники фотографий | PRIME IT</title><meta name="theme-color" content="#080d13"><link rel="icon" href="/favicon.svg"><style>body{margin:0;background:#080d13;color:#eef3f7;font:16px/1.75 system-ui,sans-serif}main{max-width:850px;margin:auto;padding:40px 24px}a{color:#6ee8b2;display:inline-flex;align-items:center;min-height:44px}h1{font-size:clamp(28px,5vw,40px)}h2{font-size:19px}p{color:#b9c8d4}ul{padding:0;list-style:none}li{border-top:1px solid #304251;padding:22px 0}a:focus-visible{outline:3px solid #69cbed;outline-offset:4px}</style></head><body><main><a href="/">← На главную PRIME IT</a><h1>Источники фотографий</h1><p>Фотографии техники используются как иллюстрации услуг. Авторы и лицензии указаны ниже. Выполнены кадрирование, уменьшение и конвертация в WebP; производные фотографии сохраняют исходную лицензию.</p><ul>' + items + '</ul><h2>Фотографии профилей в отзывах</h2><p>Фотографии профилей, имена, даты и индивидуальные оценки проверены в публичных данных <a href="https://2gis.kz/almaty/firm/70000001078609004/tab/reviews" target="_blank" rel="noopener noreferrer">отзывов PRIME IT в 2GIS</a> 1 октября 2026 года. Под каждым отзывом есть ссылка на источник.</p><a href="/#contact">Контакты PRIME IT</a></main></body></html>';
await mkdir('public/photo-credits',{recursive:true});
await writeFile('public/photo-credits/index.html',credits);
await mkdir('.qa',{recursive:true});
await writeFile('.qa/asset-report.json', JSON.stringify({
  images:report,hero:{
    desktopBytes:(await stat('public/hero.webp')).size,
    mobileBytes:(await stat('public/media/hero-small.webp')).size,
  }
},null,2));
console.log('ASSET_REPORT', JSON.stringify({images:report,legacyVideoRemoved:true}));
