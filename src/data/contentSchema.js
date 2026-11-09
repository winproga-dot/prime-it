import { services as baseServices } from './services.js';
import { brand } from './brand.js';

// Схема и проверка редактируемого содержимого (общая для сайта, админки и сервера).
// Редактируемое содержимое сайта.
// defaults — тексты и картинки «из коробки»; поверх них накладываются правки из админки.
// Правки хранятся в хранилище (Vercel Blob) и попадают в сборку через scripts/load-content.mjs
// (src/data/content.generated.json), поэтому сайт остаётся статическим и индексируемым.

const showcaseDefaults = [
  { label: '01 / Ремонт', title: 'Не включается? Найдём причину на месте.', text: 'Ноутбуки и ПК: питание, плата, экран, клавиатура, петли. Мастер приедет домой или в офис.', price: 'Диагностика — бесплатно', image: 'repair' },
  { label: '02 / Чистка', title: 'Греется и шумит? Остынет за 2 часа.', text: 'Чистка от пыли, замена термопасты и термопрокладок, проверка температур под нагрузкой.', price: 'от 8 000 ₸', image: 'clean' },
  { label: '03 / Апгрейд', title: 'Тормозит? Поставим SSD — и полетит.', text: 'Подберём совместимые SSD и оперативную память, перенесём систему и файлы.', price: 'от 7 000 ₸', image: 'speedup' },
  { label: '04 / Сборка', title: 'Игровой ПК мечты. С подсветкой.', text: 'Подбор комплектующих под задачи и бюджет, сборка, кабель-менеджмент, тесты.', price: 'от 16 000 ₸', image: 'build' },
];

export const defaults = {
  hero: {
    label: 'PRIME IT® / ' + brand.serviceType + ' / Алматы',
    titleStart: 'Выездной ремонт ',
    titleAccent: 'компьютеров и ноутбуков',
    titleEnd: ' в Алматы',
    lead: 'Мастер приедет домой или в офис, найдёт причину и назовёт цену до начала работ.',
    leadAccent: 'Диагностика — бесплатно.',
  },
  marquee: { items: ['Диагностика бесплатно', 'Выезд по Алматы', 'Гарантия до 3 месяцев', 'Без выходных 07:00–22:00', 'Ремонт от 1 часа'] },
  symptoms: { title: 'Что случилось с устройством?', subtitle: 'Выберите симптом — подскажем вероятную причину и цену.' },
  showcase: { eyebrow: 'Что мы делаем', title: 'Чиним, ускоряем, собираем.', items: showcaseDefaults },
  pricing: { title: 'Все услуги и цены', subtitle: 'Ведите мышью по стикерам — журнал листается. Цены «от» за работу, диагностика — бесплатно.' },
  services: Object.fromEntries(baseServices.map(service => [service.id, {
    title: service.title, description: service.description, price: service.price, priceNote: service.priceNote || '', image: service.image,
  }])),
  reviews: { title: 'Нам доверяют технику.', subtitle: 'Реальные отзывы клиентов из 2GIS — со ссылками на оригиналы.' },
  process: { title: 'Как проходит ремонт' },
  faq: { title: 'Ответы на частые вопросы' },
  cta: { title: 'Сломался компьютер? ', accent: 'Мастер приедет сам.' },
};

// Схема: какие поля можно менять, их подписи и ограничения. Используется и формой
// админки, и сервером (принимаются только эти поля и только допустимые значения).
const text = (path, label, max = 120) => ({ path, label, type: 'text', max });
const area = (path, label, max = 400) => ({ path, label, type: 'textarea', max });
const image = (path, label) => ({ path, label, type: 'image' });
export const schema = [
  { id: 'hero', title: 'Первый экран', fields: [
    text('hero.label', 'Метка над заголовком', 80),
    text('hero.titleStart', 'Заголовок: начало', 60), text('hero.titleAccent', 'Заголовок: жёлтая часть', 60), text('hero.titleEnd', 'Заголовок: конец', 60),
    text('hero.leadAccent', 'Подзаголовок: выделенная фраза', 80), area('hero.lead', 'Подзаголовок', 240),
  ] },
  { id: 'marquee', title: 'Жёлтая бегущая лента', fields: [0, 1, 2, 3, 4].map(i => text('marquee.items.' + i, 'Фраза ' + (i + 1), 40)) },
  { id: 'symptoms', title: 'Блок «Что случилось»', fields: [text('symptoms.title', 'Заголовок', 80), area('symptoms.subtitle', 'Подзаголовок', 200)] },
  { id: 'showcase', title: 'Витрина услуг', fields: [
    text('showcase.eyebrow', 'Метка', 40), text('showcase.title', 'Заголовок', 80),
    ...[0, 1, 2, 3].flatMap(i => [
      text('showcase.items.' + i + '.label', 'Карточка ' + (i + 1) + ': метка', 40),
      text('showcase.items.' + i + '.title', 'Карточка ' + (i + 1) + ': заголовок', 80),
      area('showcase.items.' + i + '.text', 'Карточка ' + (i + 1) + ': текст', 240),
      text('showcase.items.' + i + '.price', 'Карточка ' + (i + 1) + ': цена', 40),
      image('showcase.items.' + i + '.image', 'Карточка ' + (i + 1) + ': изображение'),
    ]),
  ] },
  { id: 'pricing', title: 'Прайс-журнал', fields: [text('pricing.title', 'Заголовок', 80), area('pricing.subtitle', 'Подзаголовок', 240),
    ...baseServices.flatMap(service => [
      text('services.' + service.id + '.title', service.title + ': название', 80),
      area('services.' + service.id + '.description', service.title + ': описание', 300),
      { path: 'services.' + service.id + '.price', label: service.title + ': цена от, ₸ (пусто — «после диагностики»)', type: 'number' },
      text('services.' + service.id + '.priceNote', service.title + ': примечание к цене', 120),
      image('services.' + service.id + '.image', service.title + ': изображение'),
    ])] },
  { id: 'sections', title: 'Заголовки разделов', fields: [
    text('reviews.title', 'Отзывы: заголовок', 80), area('reviews.subtitle', 'Отзывы: подзаголовок', 200),
    text('process.title', 'Этапы: заголовок', 80), text('faq.title', 'Вопросы: заголовок', 80),
    text('cta.title', 'Финальный призыв: заголовок', 80), text('cta.accent', 'Финальный призыв: вторая часть', 80),
  ] },
];
export const fields = schema.flatMap(group => group.fields);

export function getPath(object, path) {
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), object);
}
function setPath(object, path, value) {
  const keys = path.split('.');
  let node = object;
  keys.slice(0, -1).forEach((key, i) => {
    if (node[key] == null) node[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    node = node[key];
  });
  node[keys[keys.length - 1]] = value;
}

// Допустимые изображения: встроенные фото услуг, загрузки в Vercel Blob или локальные /uploads (разработка).
const IMAGE_RE = /^(?:[a-z_]{2,20}|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[A-Za-z0-9._\-/%]{1,200}|\/uploads\/[A-Za-z0-9._-]{1,120})$/;
// Управляющие символы (кроме переводов строки) отбрасываем.
const clean = value => String(value).replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim();

// Проверка правок: возвращает { content, errors }. Неизвестные поля игнорируются,
// пустые значения — «вернуть как было» (поле просто не сохраняется).
export function validateContent(input) {
  const content = {}; const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { content, errors: ['Неверный формат данных'] };
  for (const field of fields) {
    const raw = getPath(input, field.path);
    if (field.type === 'number' && (raw === null || raw === '')) { setPath(content, field.path, null); continue; }
    if (raw === undefined || raw === null || raw === '') continue;
    if (field.type === 'number') {
      const number = Number(raw);
      if (!Number.isInteger(number) || number < 0 || number > 10000000) { errors.push(field.label + ': нужна целая сумма от 0 до 10 000 000'); continue; }
      setPath(content, field.path, number);
    } else if (field.type === 'image') {
      const value = clean(raw);
      if (!IMAGE_RE.test(value)) { errors.push(field.label + ': недопустимый адрес изображения'); continue; }
      setPath(content, field.path, value);
    } else {
      if (typeof raw !== 'string') { errors.push(field.label + ': нужен текст'); continue; }
      const value = clean(raw);
      if (value.length > field.max) { errors.push(field.label + ': не больше ' + field.max + ' символов'); continue; }
      if (value) setPath(content, field.path, field.path.endsWith('titleStart') ? value + ' ' : field.path.endsWith('titleEnd') ? ' ' + value : value);
    }
  }
  return { content, errors };
}

// Собирает итоговое содержимое: значения по умолчанию + допустимые правки.
export function mergeContent(overrides = {}) {
  const result = JSON.parse(JSON.stringify(defaults));
  const { content } = validateContent(overrides);
  for (const field of fields) {
    const value = getPath(content, field.path);
    if (value !== undefined) setPath(result, field.path, value);
  }
  return result;
}
