import sharp from 'sharp';
import { mkdir, readdir, stat, writeFile, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
await mkdir('public/media', { recursive: true });
const report = [];
for (const file of (await readdir('assets/source')).filter(file => file.endsWith('.png')).sort()) {
  const source = 'assets/source/' + file;
  const id = file.slice(0,-4);
  const before = (await stat(source)).size;
  const outputs = [];
  for (const width of [640,960]) {
    const destination = 'public/media/' + id + '-' + width + '.webp';
    await sharp(source).resize(width, Math.round(width / 1.6), { fit:'cover' }).webp({ quality:width === 640 ? 78 : 80, effort:5 }).toFile(destination);
    const after = (await stat(destination)).size;
    if (after > 300 * 1024) throw new Error('Image exceeds budget: ' + destination);
    outputs.push({ width, bytes:after });
  }
  report.push({ id, originalBytes:before, outputs });
}
await sharp('public/hero.webp').resize(640).webp({ quality:78, effort:5 }).toFile('public/media/hero-small.webp');
await sharp('public/logo.jpg').resize(180,180).png().toFile('public/apple-touch-icon.png');
// Branded social preview: graphic text, not a synthetic photograph of the business.
const overlay = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#080d13" opacity=".72"/><g font-family="DejaVu Sans,Arial,sans-serif" fill="#f5f7fa"><text x="65" y="80" font-size="31" font-weight="700">PRIME IT</text><text x="65" y="215" font-size="51" font-weight="700">Ремонт компьютеров</text><text x="65" y="283" font-size="51" font-weight="700">и ноутбуков в Алматы</text><rect x="65" y="342" rx="15" width="585" height="73" fill="#49e5a4"/><text x="91" y="389" fill="#09251b" font-size="30" font-weight="700">Бесплатная диагностика</text><text x="65" y="498" font-size="27">ул. Сатпаева, 105А</text><text x="65" y="548" font-size="24" fill="#b7c9d7">8 (707) 684-06-25 · Без выходных 10:00–20:00</text></g></svg>';
await sharp('public/hero.webp').resize(1200,630,{fit:'cover'}).composite([{input:Buffer.from(overlay)}]).jpeg({quality:85,mozjpeg:true}).toFile('public/og-image.jpg');
const output = 'public/media/hero.mp4';
const video = spawnSync('ffmpeg', ['-hide_banner','-loglevel','error','-i','assets/source/hero.mp4','-t','12','-vf','scale=1280:-2,fps=24','-an','-c:v','libx264','-profile:v','main','-pix_fmt','yuv420p','-crf','29','-preset','medium','-movflags','+faststart','-y',output], { encoding:'utf8' });
if (video.status !== 0) {
  // Developer machines may lack ffmpeg. CI verifies and optimizes the production video.
  await copyFile('assets/source/hero.mp4', output);
  console.warn('ffmpeg unavailable: using the existing video. Install ffmpeg for compression.');
}
const videoReport = {originalBytes:(await stat('assets/source/hero.mp4')).size, optimizedBytes:(await stat(output)).size, compressed:video.status === 0};
await mkdir('.qa',{recursive:true});
await writeFile('.qa/asset-report.json', JSON.stringify({images:report,video:videoReport},null,2));
console.log('ASSET_REPORT', JSON.stringify({images:report,video:videoReport}));
