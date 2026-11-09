import generated from './content.generated.json';
import { services as baseServices } from './services.js';
import { mergeContent } from './contentSchema.js';
export { defaults, schema, fields, getPath, validateContent, mergeContent } from './contentSchema.js';

let current = mergeContent(generated);
export const getContent = () => current;
export function setContent(overrides) { current = mergeContent(overrides); }

// Адрес изображения: встроенное фото (ключ) или полный адрес загруженного файла.
export function imageUrl(value, width = 960) {
  return /^(https:|\/)/.test(value) ? value : '/media/' + value + '-' + width + '.webp';
}
export function imageSrcSet(value) {
  return /^(https:|\/)/.test(value) ? undefined : '/media/' + value + '-640.webp 640w, /media/' + value + '-960.webp 960w';
}

// Услуги с учётом правок (название, описание, цена, примечание, изображение).
export function getServices() {
  const overrides = current.services;
  return baseServices.map(service => ({ ...service, ...overrides[service.id], priceNote: overrides[service.id]?.priceNote || service.priceNote }));
}
