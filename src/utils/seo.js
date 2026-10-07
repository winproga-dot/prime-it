import { brand } from '../data/brand.js';
import { servicePages, pageForPath } from '../data/services.js';
import { faq } from '../data/faq.js';
export const homeMeta = {
  title: 'Ремонт компьютеров и ноутбуков в Алматы | PRIME IT',
  description: 'Ремонт компьютеров и ноутбуков в Алматы, в сервисе и с выездом. Бесплатная диагностика. PRIME IT — Сатпаева, 105А. Приём по предварительному звонку.',
};
export function pageMeta(path) {
  const page = pageForPath(path);
  if (path === '/') return { ...homeMeta, canonical: brand.url, index: true, image: brand.url + 'og-image.jpg' };
  if (page) return { title: page.title, description: page.description, canonical: new URL(page.path, brand.url).href, index: true, image: brand.url + 'og-image.jpg' };
  return { title: 'Страница не найдена | PRIME IT', description: 'Перейдите на главную страницу PRIME IT — компьютерного сервиса в Алматы.', index: false, image: brand.url + 'og-image.jpg' };
}
export function structuredData(path) {
  const page = pageForPath(path);
  const meta = pageMeta(path);
  const businessId = brand.url + '#business';
  const business = {
    '@type': 'LocalBusiness', '@id': businessId, name: brand.name, url: brand.url,
    description: homeMeta.description, telephone: brand.phoneTel, email: brand.email,
    image: brand.url + 'hero.webp', priceRange: 'от 5 000 ₸; диагностика бесплатно',
    address: { '@type': 'PostalAddress', streetAddress: brand.street, addressLocality: brand.city, addressCountry: 'KZ' },
    areaServed: { '@type': 'City', name: brand.city },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => 'https://schema.org/' + day), opens:'10:00', closes:'20:00' }],
    ...(brand.twoGisUrl ? { sameAs: [brand.twoGisUrl] } : {}),
  };
  const displayedFaq = path === '/' ? faq : page?.faq;
  const graph = [business];
  if (meta.index) graph.push({ '@type':'WebPage', '@id':meta.canonical + '#webpage', url:meta.canonical, name:meta.title, description:meta.description, inLanguage:'ru', about:{ '@id':businessId } });
  if (displayedFaq) graph.push({ '@type':'FAQPage', '@id':meta.canonical + '#faq', mainEntity:displayedFaq.map(item => ({ '@type':'Question', name:item.q, acceptedAnswer:{ '@type':'Answer', text:item.a } })) });
  if (page) graph.push(
    { '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Главная', item:brand.url },{ '@type':'ListItem', position:2, name:page.breadcrumb, item:meta.canonical }] },
    { '@type':'Service', name:page.h1, serviceType:page.breadcrumb, provider:{ '@id':businessId }, areaServed:{ '@type':'City', name:brand.city }, url:meta.canonical,
      // Repair prices are estimates, so do not imply a fixed Offer price.
      description:page.description }
  );
  return { '@context':'https://schema.org', '@graph':graph };
}
export const routes = ['/', ...servicePages.map(page => page.path)];
