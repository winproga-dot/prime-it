import { licenses } from '../data/licenses.js';
import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
export default function Licenses() {
  return <section className="container licenses-section" id="licenses" aria-label="Лицензионные программы">
    <details className="licenses-disclosure"><summary><Icon name="Layers3" size={24} /><span><strong>Лицензии и профессиональные программы</strong><small>Windows, Office, Autodesk, Adobe, Kaspersky · Возможна удалённая установка</small></span><Icon name="ChevronDown" /></summary>
      <div className="licenses-content"><p className="muted">Уточните наличие, тип лицензии и условия установки перед покупкой.</p>
        <div className="license-grid">{licenses.map(license => <article id={'license-' + license.id} className="license-card" key={license.id}>
          <h3>{license.name}</h3><p>Срок: {license.term}</p><strong>{license.price}</strong>
          <ContactLink message={messages.license(license.name)} location="licenses" className="text-link">Уточнить условия</ContactLink></article>)}</div>
      </div>
    </details>
  </section>;
}
