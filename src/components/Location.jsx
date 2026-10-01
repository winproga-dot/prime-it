import { brand } from '../data/brand.js';
import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
import LocationMap from './LocationMap.jsx';
export default function Location({ message = messages.contact, context }) {
  return <section className="section container" id="contact" aria-labelledby="location-title">
    <div className="location-panel"><div className="location-copy"><p className="eyebrow">Приезжайте — разберёмся</p><h2 id="location-title">Как нас найти</h2>
      <address><strong>PRIME IT</strong><p>{brand.city},<br /><span className="location-street">{brand.street}</span></p>
        <p className="location-hours"><Icon name="Clock3" /> <span>{brand.hours}</span></p>
        <ContactLink type="phone" className="location-phone" location="location">{brand.phoneDisplay}</ContactLink>
        <a className="location-email" href={'mailto:' + brand.email}><Icon name="Mail" size={17} />{brand.email}</a>
      </address>
      <div className="location-actions"><ContactLink type="route" className="button button-primary" location="location" /><ContactLink message={message} context={context} className="button button-secondary" location="location" /></div>
    </div><LocationMap /></div>
  </section>;
}
