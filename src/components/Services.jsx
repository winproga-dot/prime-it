import { services } from '../data/services.js';
import ServiceCard from './ServiceCard.jsx';
import SplitWords from './SplitWords.jsx';
// Полный список услуг с ценами. На главной идёт после витрины и заменяет отдельный блок цен.
export default function Services({ id = 'services', title = 'Все услуги и цены' }) {
  return <section className="section container" id={id} aria-labelledby={id + '-title'}>
    <div className="section-heading"><div><p className="eyebrow">Прайс</p><SplitWords as="h2" id={id + '-title'} text={title} />
      <p>Цены «от» за работу. Детали — по согласованию. Диагностика — бесплатно.</p></div></div>
    <div className="services-grid services-list">{services.map((service, index) => <ServiceCard service={service} revealOrder={index % 3} key={service.id} />)}</div>
  </section>;
}
