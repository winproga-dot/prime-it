import { brand } from '../data/brand.js';
import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
import LocationMap from './LocationMap.jsx';
import VisitNotice from './VisitNotice.jsx';
export default function Location({ message = messages.contact, context }) {
  return <section className="section container" id="contact" aria-labelledby="location-title">
    <div className="location-panel"><div className="location-copy"><p className="eyebrow">{brand.serviceType}</p><h2 id="location-title">Вызвать мастера</h2>
      <VisitNotice className="location-visit-note" detailed />
      <address><strong>PRIME IT</strong><p><span className="location-street">{brand.serviceArea}</span></p>
        <p className="location-hours"><Icon name="Clock3" /> <span>{brand.hours}</span></p>
        <ContactLink type="phone" className="location-phone" location="location" context={context}>{brand.phoneDisplay}</ContactLink>
        <a className="location-email" href={'mailto:' + brand.email}><Icon name="Mail" size={17} />{brand.email}</a>
      </address>
      <p className="location-dispatch">Мастер приезжает к вам с инструментом и расходниками. Стоимость выезда и ремонта сообщим заранее.</p>
      <div className="location-actions">
        <ContactLink type="phone" className="button button-primary" location="location" context={context}>Позвонить и вызвать мастера</ContactLink>
        <ContactLink message={message} context={context} className="button button-secondary" location="location" />
      </div>
    </div><LocationMap /></div>
  </section>;
}
