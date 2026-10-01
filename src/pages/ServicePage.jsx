import { brand } from '../data/brand.js';
import { services, servicePages } from '../data/services.js';
import { messages } from '../utils/whatsapp.js';
import { priceLabel } from '../components/ServiceCard.jsx';
import ContactLink from '../components/ContactLink.jsx';
import FAQ from '../components/FAQ.jsx';
import Location from '../components/Location.jsx';
import RepairProcess from '../components/RepairProcess.jsx';
import Icon from '../components/Icon.jsx';
export default function ServicePage({ page }) {
  const service = services.find(item => item.id === page.serviceId);
  return <main id="main">
    <nav className="container breadcrumbs" aria-label="Хлебные крошки"><ol><li><a href="/">Главная</a></li><li aria-current="page">{page.breadcrumb}</li></ol></nav>
    <section className="container service-hero" aria-labelledby="service-heading">
      <div><p className="eyebrow"><span className="status-dot" /> PRIME IT · Бесплатная диагностика</p>
        <h1 id="service-heading">{page.h1}</h1><p className="service-intro">{page.intro}</p>
        <div className="service-hero-price"><strong>{priceLabel(service)}</strong><span>{service.priceNote || (service.price ? 'Точную стоимость согласуем после проверки.' : 'Стоимость ремонта согласуем после бесплатной диагностики.')}</span></div>
        <div className="hero-actions"><ContactLink className="button button-primary" message={messages.service(page.h1)} location="service_hero" context={{ service: page.slug }}>Узнать стоимость в WhatsApp</ContactLink>
          <ContactLink type="phone" className="button button-secondary" location="service_hero" /></div>
        <p className="service-hero-contact"><Icon name="MapPin" size={17} /> {brand.address} · {brand.hours}</p>
      </div>
      <img className="service-page-image" src={'/media/' + service.image + '-960.webp'}
        srcSet={'/media/' + service.image + '-640.webp 640w, /media/' + service.image + '-960.webp 960w'} sizes="(max-width: 900px) 100vw, 500px"
        width="960" height="600" alt={service.imageAlt || page.h1} loading="eager" fetchpriority="high" decoding="async" />
    </section>
    <section className="section container service-explanation"><div><p className="eyebrow">Подход к работе</p><h2>Что входит в услугу</h2><p>{page.body}</p>
      <ul className="check-list">{page.includes.map(item => <li key={item}><Icon name="CheckCircle2" /><span>{item}</span></li>)}</ul></div>
      <aside className="symptoms-aside"><h2>Когда стоит обратиться</h2><ul>{page.symptoms.map(item => <li key={item}>{item}</li>)}</ul>
        <p>Не уверены, что нужно вашему устройству? Диагностика бесплатная — даже при отказе от ремонта.</p></aside>
    </section>
    <section className="container service-note"><Icon name="CircleHelp" size={27} /><div><h2>{page.noteTitle}</h2><p>{page.note}</p></div></section>
    <RepairProcess />
    <FAQ items={page.faq} title={'Вопросы: ' + page.breadcrumb.toLowerCase()} />
    <section className="section container related-services" aria-labelledby="related-title"><div className="section-heading"><div><p className="eyebrow">Может пригодиться</p><h2 id="related-title">Связанные услуги</h2></div></div>
      <div className="related-grid">{page.related.map(slug => { const related = servicePages.find(item => item.slug === slug); return <a href={related.path} key={slug}><span>{related.breadcrumb}</span><Icon name="ArrowUpRight" /></a>; })}</div>
      <a className="text-link" href="/#services">Все услуги PRIME IT <Icon name="ArrowRight" size={17} /></a>
    </section>
    <Location />
  </main>;
}
