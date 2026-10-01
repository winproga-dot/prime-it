import { services } from '../data/services.js';
import ServiceCard from './ServiceCard.jsx';
import Icon from './Icon.jsx';
export default function Services() {
  return <section className="section container" id="services" aria-labelledby="services-title">
    <div className="section-heading"><div><p className="eyebrow">От неисправности до решения</p><h2 id="services-title">Поможем вашей технике</h2>
      <p>Основные услуги и цены. Сначала проверим устройство, затем согласуем работы.</p></div><span className="section-index" aria-hidden="true">02 / УСЛУГИ</span></div>
    <div className="services-grid">{services.slice(0,6).map(service => <ServiceCard service={service} key={service.id} />)}</div>
    <details className="more-services"><summary><span><strong>Ещё услуги сервиса</strong><small>SSD и память, петли, сборка ПК, программы и другое</small></span><Icon name="ChevronDown" /></summary>
      <div className="services-grid">{services.slice(6).map(service => <ServiceCard service={service} key={service.id} />)}</div>
    </details>
  </section>;
}
