import { brand } from '../data/brand.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
export default function LocationMap() {
  return <div className="location-map">
    <div className="map-heading"><Icon name="MapPin" size={23} /><div><h3>Карта и маршрут</h3><p>{brand.street}</p></div></div>
    <div className="map-preview"><div className="map-provider"><Icon name="MapPin" size={36} /><span>2GIS</span></div>
      <strong>{brand.address}</strong><p>Откройте точку PRIME IT на карте и постройте маршрут до сервиса.</p>
      <ContactLink type="route" href={brand.twoGisUrl} className="button button-secondary" location="business_card">Открыть карту в 2GIS</ContactLink>
    </div>
    <ContactLink type="route" className="text-link" location="map">Построить маршрут до PRIME IT</ContactLink>
    <p className="map-attribution">Карта откроется в новом окне.</p>
  </div>;
}
