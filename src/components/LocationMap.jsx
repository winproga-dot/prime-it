import { useState } from 'react';
import { brand } from '../data/brand.js';
import { businessMap } from '../utils/map.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
const map = businessMap(brand.routeUrl);
export default function LocationMap() {
  const [shown, setShown] = useState(false);
  return <div className="location-map">
    <div className="map-heading"><Icon name="MapPin" size={23} /><div><h3>Расположение сервиса</h3><p>{brand.street}</p></div></div>
    {shown && map ? <iframe id="service-map" className="map-frame" title="Карта: PRIME IT, Сатпаева, 105А, Алматы"
      src={map.embed} width="640" height="360" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
      : <div className="map-preview"><Icon name="MapPin" size={42} /><strong>{brand.city} · {brand.street}</strong>
        <p>Посмотрите карту или сразу постройте маршрут до сервиса в 2GIS.</p>
        {map && <button type="button" className="button button-secondary map-load" onClick={() => setShown(true)}>Показать карту</button>}
      </div>}
    <div className="map-links"><ContactLink type="route" className="text-link" location="map">Маршрут в 2GIS</ContactLink>
      <ContactLink type="route" href={brand.twoGisUrl} className="text-link" location="business_card">Карточка PRIME IT</ContactLink></div>
    {map && <p className="map-attribution">Карта: 2GIS</p>}
  </div>;
}
