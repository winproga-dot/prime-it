import { getContent } from '../data/content.js';
import SplitWords from './SplitWords.jsx';
import { brand } from '../data/brand.js';
import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
// Финальный призыв по центру (как «Find what works. Design what's next.» у Mobbin).
export default function Location({ message = messages.contact, context }) {
  return <section className="section container" id="contact" aria-labelledby="location-title">
    <div className="location-panel" data-reveal>
      <div className="location-copy">
        <p className="eyebrow"><span className="status-dot" /> {brand.serviceType}</p>
        <SplitWords as="h2" id="location-title" text={[getContent().cta.title, { text: getContent().cta.accent, className: 'accent' }]} />
        <p className="location-lead">{brand.serviceArea}. {brand.hours}. Диагностика — бесплатно.</p>
        <div className="location-actions">
          <ContactLink type="phone" className="button button-primary" location="location" context={context}>Позвонить {brand.phoneDisplay}</ContactLink>
          <ContactLink message={message} context={context} className="button button-secondary" location="location" />
        </div>
        <p className="location-meta">
          <a className="location-email" href={'mailto:' + brand.email}><Icon name="Mail" size={15} />{brand.email}</a>
          <ContactLink type="reviews" className="location-reviews" location="business_card" showIcon={false}>Отзывы о нас в 2GIS <Icon name="ArrowUpRight" size={14} /></ContactLink>
        </p>
      </div>
    </div>
  </section>;
}
