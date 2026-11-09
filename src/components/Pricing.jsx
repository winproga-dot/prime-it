import { services } from '../data/services.js';
import { priceLabel } from './ServiceCard.jsx';
import ContactLink from './ContactLink.jsx';
import { messages } from '../utils/whatsapp.js';
import Icon from './Icon.jsx';
export default function Pricing() {
  return <section className="section container" id="pricing" aria-labelledby="pricing-title">
    <div className="pricing-panel"><div className="pricing-copy"><p className="eyebrow">Понятная стоимость</p><h2 id="pricing-title">Сначала диагностика.<br />Потом ваше решение.</h2>
      <p>Диагностика полностью бесплатная. Стоимость ремонта сообщим заранее — вы решаете, приступать ли к работе.</p>
      <ContactLink className="text-link" location="pricing">Уточнить стоимость <Icon name="ArrowUpRight" size={17} /></ContactLink>
    </div><div className="price-list">
      <div className="price-row free"><span>Диагностика устройства</span><strong>Бесплатно</strong></div>
      {services.filter(service => ['clean','winms','speedup','hinge','build'].includes(service.id)).map(service =>
        <ContactLink key={service.id} message={messages.service(service.title)} location="price_list" context={{ service: service.id }} className="price-row" showIcon={false}>
          <span>{service.title}</span><strong>{priceLabel(service)}</strong><Icon name="ArrowUpRight" size={16} />
        </ContactLink>)}
      <p className="price-footnote">Цены «от» за работу. Детали и комплектующие — по согласованию. Все услуги и цены указаны выше.</p>
    </div></div>
  </section>;
}
