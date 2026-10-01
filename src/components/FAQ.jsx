import Icon from './Icon.jsx';
import ContactLink from './ContactLink.jsx';
export default function FAQ({ items, title = 'Ответы на частые вопросы' }) {
  return <section className="section container faq-section" id="faq" aria-labelledby="faq-title">
    <div className="faq-intro"><p className="eyebrow">До вашего визита</p><h2 id="faq-title">{title}</h2><p>Уточним детали по вашей модели и ситуации.</p>
      <ContactLink className="text-link" location="faq">Задать свой вопрос</ContactLink></div>
    <div className="faq-list">{items.map(item => <details key={item.q} className="faq-item"><summary><span>{item.q}</span><Icon name="ChevronDown" size={20} /></summary><p>{item.a}</p></details>)}</div>
  </section>;
}
