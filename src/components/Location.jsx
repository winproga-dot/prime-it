import { brand } from '../data/brand.js';
import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
export default function Location() {
  return <section className="section container" id="contact" aria-labelledby="location-title">
    <div className="location-panel"><div className="location-copy"><p className="eyebrow">Приезжайте — разберёмся</p><h2 id="location-title">Как нас найти</h2>
      <address><strong>PRIME IT</strong><p>Алматы,<br /><span className="location-street">ул. Сатпаева, 105А</span></p>
        <p className="location-hours"><Icon name="Clock3" /> <span>10:00–20:00<br /><small>Без выходных</small></span></p>
        <ContactLink type="phone" className="location-phone" location="location">{brand.phoneDisplay}</ContactLink>
        <a className="location-email" href={'mailto:' + brand.email}><Icon name="Mail" size={17} />{brand.email}</a>
      </address>
      <div className="location-actions"><ContactLink type="route" className="button button-primary" location="location" /><ContactLink message={messages.contact} className="button button-secondary" location="location" /></div>
    </div><div className="location-map">
      <div className="map-grid" aria-hidden="true" />
      <div className="map-street" aria-hidden="true">АЛМАТЫ</div>
      <div className="map-marker"><Icon name="MapPin" size={35} /><strong>PRIME IT</strong><span>Сатпаева, 105А</span></div>
      <p>Алматы · ул. Сатпаева, 105А</p><ContactLink type="route" className="button button-map" location="map" href={brand.twoGisAddress}>Открыть адрес в 2GIS</ContactLink>
    </div></div>
  </section>;
}
