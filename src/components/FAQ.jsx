import Icon from './Icon.jsx';
import ContactLink from './ContactLink.jsx';
import { messages } from '../utils/whatsapp.js';
export default function FAQ({ items, title = 'Ответы на частые вопросы', message = messages.question, context }) {
  return <section className="section container faq-section" id="faq" aria-labelledby="faq-title">
    <div className="faq-intro"><p className="eyebrow">Перед обращением</p><h2 id="faq-title">{title}</h2><p>Уточним детали по вашей модели и ситуации.</p>
      <ContactLink className="text-link" location="faq" message={message} context={context}>Задать свой вопрос</ContactLink></div>
    <div className="faq-list">{items.map(item => <details key={item.q} className="faq-item"><summary><span>{item.q}</span><Icon name="ChevronDown" size={20} /></summary><p>{item.a}</p></details>)}</div>
  </section>;
}
