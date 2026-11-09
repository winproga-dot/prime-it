import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
// 2GIS подключён только как источник отзывов и доверия — без карты и маршрута:
// PRIME IT работает выездом.
export default function LocationMap() {
  return <div className="location-map">
    <div className="map-heading"><Icon name="ShieldCheck" size={23} /><div><h3>PRIME IT в 2GIS</h3><p>Карточка компании и отзывы клиентов</p></div></div>
    <div className="map-preview"><div className="map-provider"><Icon name="MessageCircle" size={36} /><span>2GIS</span></div>
      <strong>Отзывы реальных клиентов</strong><p>Почитайте, что пишут о нашей работе, и оставьте свой отзыв после ремонта.</p>
      <ContactLink type="reviews" className="button button-secondary" location="business_card">Открыть отзывы в 2GIS</ContactLink>
    </div>
    <p className="map-attribution">Откроется в новом окне.</p>
  </div>;
}
