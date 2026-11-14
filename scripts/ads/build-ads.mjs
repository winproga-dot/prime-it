// Собирает файлы для загрузки рекламы и проверяет лимиты символов.
// npm run ads                       — ссылки на https://www.prime-it.kz
// SITE=https://prime-it-1.vercel.app npm run ads — если нужно запустить рекламу до домена
import { mkdir, writeFile } from 'node:fs/promises';
import { common, negatives, groups, sitelinks, callouts } from './ads-data.mjs';

const SITE = (process.env.SITE || 'https://www.prime-it.kz').replace(/\/$/, '');
const CAMPAIGN_GOOGLE = 'PRIME IT — Поиск — Алматы';
const CAMPAIGN_YANDEX = 'PRIME IT — Поиск — Алматы';
const errors = [];
const check = (where, text, max, extra) => {
  const len = [...text].length;
  if (len > max) errors.push(`${where}: ${len}/${max} «${text}»`);
  if (extra) extra(text);
};
const words22 = where => text => text.split(/\s+/).forEach(w => w.length > 22 && errors.push(`${where}: слово длиннее 22 «${w}»`));

for (const g of groups) {
  const heads = [...g.headlines, ...common.headlines];
  const descs = [...g.descriptions, ...common.descriptions];
  if (heads.length > 15 || heads.length < 3) errors.push(`${g.id}: заголовков ${heads.length}`);
  if (descs.length > 4 || descs.length < 2) errors.push(`${g.id}: описаний ${descs.length}`);
  if (new Set(heads).size !== heads.length) errors.push(`${g.id}: повтор заголовка`);
  heads.forEach(h => check(`Google ${g.id} заголовок`, h, 30));
  descs.forEach(d => check(`Google ${g.id} описание`, d, 90));
  g.paths.forEach(p => check(`Google ${g.id} путь`, p, 15));
  g.keywords.forEach(k => check(`${g.id} ключ`, k, 80, t => t.split(' ').length > 7 && errors.push(`${g.id}: в ключе больше 7 слов «${t}»`)));
  check(`Яндекс ${g.id} заголовок 1`, g.yandex.title1, 56, words22(g.id));
  check(`Яндекс ${g.id} заголовок 2`, g.yandex.title2, 30, words22(g.id));
  check(`Яндекс ${g.id} текст`, g.yandex.text, 81, words22(g.id));
  check(`Яндекс ${g.id} отображаемая ссылка`, displayLink(g), 20);
}
sitelinks.forEach(s => { check('быстрая ссылка', s.text, 25); check('описание ссылки', s.d1, 35); check('описание ссылки', s.d2, 35); });
callouts.forEach(c => check('уточнение', c, 25));
if (errors.length) { console.error('ADS_LIMITS_FAIL\n' + errors.join('\n')); process.exit(1); }

function displayLink(g) { return g.paths.join('-'); }
const csv = rows => '﻿' + rows.map(r => r.map(v => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}).join(',')).join('\r\n') + '\r\n';
const yandexUtm = '?utm_source=yandex&utm_medium=cpc&utm_campaign={campaign_id}&utm_content={ad_id}&utm_term={keyword}';

// Google Ads Editor: Аккаунт → Импорт → Из файла.
const H = Array.from({ length: 15 }, (_, i) => 'Headline ' + (i + 1));
const D = Array.from({ length: 4 }, (_, i) => 'Description ' + (i + 1));
const adsRows = [['Campaign', 'Ad Group', 'Ad type', 'Final URL', 'Path 1', 'Path 2', ...H, ...D]];
const kwRows = [['Campaign', 'Ad Group', 'Keyword', 'Criterion Type']];
for (const g of groups) {
  const heads = [...g.headlines, ...common.headlines]; const descs = [...g.descriptions, ...common.descriptions];
  adsRows.push([CAMPAIGN_GOOGLE, g.name, 'Responsive search ad', SITE + g.path, g.paths[0], g.paths[1] || '',
    ...H.map((_, i) => heads[i] || ''), ...D.map((_, i) => descs[i] || '')]);
  g.keywords.forEach(k => kwRows.push([CAMPAIGN_GOOGLE, g.name, k, 'Phrase']));
}
negatives.forEach(n => kwRows.push([CAMPAIGN_GOOGLE, '', n, 'Campaign Negative Broad']));
const extRows = [['Тип', 'Текст', 'Описание 1', 'Описание 2', 'Ссылка']];
sitelinks.forEach(s => extRows.push(['Быстрая ссылка (Sitelink)', s.text, s.d1, s.d2, SITE + s.path]));
callouts.forEach(c => extRows.push(['Уточнение (Callout)', c, '', '', '']));
extRows.push(['Звонок (Call)', '+7 707 684 06 25', 'Показывать с 07:00 до 22:00', '', '']);

// Яндекс Директ: по строке на группу — удобно вносить в мастер кампаний или Коммандер.
const yRows = [['Группа', 'Ключевые фразы', 'Заголовок 1 (до 56)', 'Заголовок 2 (до 30)', 'Текст (до 81)', 'Ссылка', 'Отображаемая ссылка']];
for (const g of groups) yRows.push([g.name, g.keywords.join('\n'), g.yandex.title1, g.yandex.title2, g.yandex.text, SITE + g.path + yandexUtm, displayLink(g)]);

await mkdir('docs/ads', { recursive: true });
await writeFile('docs/ads/google-ads-ads.csv', csv(adsRows));
await writeFile('docs/ads/google-ads-keywords.csv', csv(kwRows));
await writeFile('docs/ads/google-ads-extensions.csv', csv(extRows));
await writeFile('docs/ads/yandex-direct.csv', csv(yRows));
await writeFile('docs/ads/minus-words.txt', negatives.join('\n') + '\n');
console.log('ADS_OK', JSON.stringify({ site: SITE, groups: groups.length, keywords: groups.reduce((n, g) => n + g.keywords.length, 0), negatives: negatives.length }));
