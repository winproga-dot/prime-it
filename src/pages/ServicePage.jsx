import { brand } from '../data/brand.js';
import { services, servicePages } from '../data/services.js';
import { messages } from '../utils/whatsapp.js';
import { priceLabel } from '../components/ServiceCard.jsx';
import ContactActions from '../components/ContactActions.jsx';
import VisitNotice from '../components/VisitNotice.jsx';
import FAQ from '../components/FAQ.jsx';
import Location from '../components/Location.jsx';
import RepairProcess from '../components/RepairProcess.jsx';
import Icon from '../components/Icon.jsx';
export default function ServicePage({ page }) {
  const service = services.find(item => item.id === page.serviceId);
  const image = page.image || service.image;
  const message = messages.service(page.h1);
  const context = { service:page.slug };
  return <main id="main">
    <nav className="container breadcrumbs" aria-label="Хлебные крошки"><ol><li><a href="/">Главная</a></li><li aria-current="page">{page.breadcrumb}</li></ol></nav>
    <section className="container service-hero" aria-labelledby="service-heading">
      <div><p className="eyebrow"><span className="status-dot" /> PRIME IT · Бесплатная диагностика</p>
        <h1 id="service-heading">{page.h1}</h1><p className="service-intro">{page.intro}</p>
        <div className="service-hero-price"><strong>{priceLabel(service)}</strong><span>{service.priceNote || (service.price ? 'Точную стоимость согласуем после проверки.' : 'Стоимость ремонта согласуем после бесплатной диагностики.')}</span></div>
        <VisitNotice className="service-visit-note" />
        <ContactActions message={message} context={context} location="service_hero" />
        <p className="service-hero-contact"><Icon name="MapPin" size={17} /> {brand.address} · {brand.hours}</p>
      </div>
      <img className="service-page-image" src={'/media/' + image + '-960.webp'}
        srcSet={'/media/' + image + '-640.webp 640w, /media/' + image + '-960.webp 960w'} sizes="(max-width: 900px) 100vw, 500px"
        width="960" height="600" alt={page.imageAlt || service.imageAlt || page.h1} loading="eager" fetchpriority="high" decoding="async" />
    </section>
    <section className="section container service-explanation"><div><p className="eyebrow">Подход к работе</p><h2>Что входит в услугу</h2><p>{page.body}</p>
      <ul className="check-list">{page.includes.map(item => <li key={item}><Icon name="CheckCircle2" /><span>{item}</span></li>)}</ul></div>
      <aside className="symptoms-aside"><h2>Когда стоит обратиться</h2><ul>{page.symptoms.map(item => <li key={item}>{item}</li>)}</ul>
        <p>Не уверены, что нужно вашему устройству? Диагностика бесплатная — даже при отказе от ремонта.</p></aside>
    </section>
    <section className="container service-note"><Icon name="CircleHelp" size={27} /><div><h2>{page.noteTitle}</h2><p>{page.note}</p></div></section>
    <RepairProcess compact message={message} context={context} />
    <FAQ items={page.faq} title={'Вопросы: ' + page.breadcrumb.toLowerCase()} message={message} context={context} />
    <section className="section container related-services" aria-labelledby="related-title"><div className="section-heading"><div><p className="eyebrow">Может пригодиться</p><h2 id="related-title">Связанные услуги</h2></div></div>
      <div className="related-grid">{page.related.map(slug => { const related = servicePages.find(item => item.slug === slug); return <a href={related.path} key={slug}><span>{related.breadcrumb}</span><Icon name="ArrowUpRight" /></a>; })}</div>
      <a className="text-link" href="/#services">Все услуги PRIME IT <Icon name="ArrowRight" size={17} /></a>
    </section>
    <Location message={message} context={context} />
  </main>;
}
