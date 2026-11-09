import { licenses } from '../data/licenses.js';
import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
export default function Licenses() {
  return <section className="container licenses-section" id="licenses" aria-label="Лицензионные программы">
    <details className="licenses-disclosure"><summary><Icon name="Layers3" size={24} /><span><strong>Лицензии и профессиональные программы</strong><small>Windows, Office, Autodesk, Adobe, Kaspersky · Возможна удалённая установка</small></span><Icon name="ChevronDown" /></summary>
      <div className="licenses-content"><p className="muted">Стоимость зависит от версии, типа и срока лицензии — уточните её в WhatsApp перед покупкой.</p>
        <div className="license-grid">{licenses.map(license => <article id={'license-' + license.id} className="license-card" key={license.id}>
          <h3>{license.name}</h3><strong>Цена по запросу</strong>
          <ContactLink message={messages.license(license.name)} location="licenses" className="text-link">Узнать стоимость</ContactLink></article>)}</div>
      </div>
    </details>
  </section>;
}
