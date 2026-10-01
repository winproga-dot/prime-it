import { messages } from '../utils/whatsapp.js';
import { track } from '../utils/analytics.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
export function priceLabel(service) {
  return service.price ? 'от ' + new Intl.NumberFormat('ru-RU').format(service.price) + ' ₸' : 'После диагностики';
}
export default function ServiceCard({ service }) {
  const image = service.image === 'hero' ? '/media/hero-small.webp' : '/media/' + service.image + '-640.webp';
  return <article id={'service-' + service.id} className="service-card">
    <div className="service-image"><img src={image}
      {...(service.image !== 'hero' ? { srcSet: '/media/' + service.image + '-640.webp 640w, /media/' + service.image + '-960.webp 960w', sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px' } : {})}
      width="640" height="400" loading="lazy" decoding="async" alt={service.title} />
      {service.tag && <span className="service-tag">{service.tag}</span>}
    </div>
    <div className="service-content"><div className="service-title"><Icon name={service.icon} />
      <h3>{service.path ? <a href={service.path} onClick={() => track('service_click', { service: service.id, location: 'service_details' })}>{service.title}</a> : service.title}</h3></div>
      <p>{service.description}</p><div className="service-price"><strong>{priceLabel(service)}</strong>
        <small>{service.priceNote || (service.price ? 'Точная стоимость после бесплатной диагностики.' : 'Диагностика — бесплатно.')}</small></div>
      <div className="service-actions"><ContactLink className="button button-service" message={messages.service(service.title)}
        context={{ service: service.id }} location="service_card">Узнать стоимость</ContactLink>
        {service.path && <a className="service-details" href={service.path} aria-label={'Подробнее: ' + service.title}
          onClick={() => track('service_click', { service: service.id, location: 'service_details' })}><Icon name="ArrowUpRight" /></a>}
      </div>
      {service.links && <a className="service-sub-link" href={service.links[0]}>Ремонт стационарных компьютеров <Icon name="ArrowUpRight" size={14} /></a>}
    </div>
  </article>;
}
