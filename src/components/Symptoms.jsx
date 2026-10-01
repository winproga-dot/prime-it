import { track } from '../utils/analytics.js';
import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
const symptoms = [
  ['Power','Не включается'],['Gauge','Тормозит'],['Fan','Сильно греется'],['PanelTop','Разбит экран'],
  ['Zap','Выключается'],['Monitor','Проблема с Windows'],['MemoryStick','Нужен апгрейд'],['CircleHelp','Другая проблема'],
];
export default function Symptoms({ selected = '', onSelect }) {
  return <section className="section container" id="estimate" aria-labelledby="symptoms-title">
    <div className="symptoms-panel">
      <div className="section-heading"><div><p className="eyebrow">Начнём с вашей проблемы</p><h2 id="symptoms-title">Что случилось с устройством?</h2>
        <p>Не знаете причину поломки? Это нормально — диагностика бесплатная.</p></div>
        <div className="section-index" aria-hidden="true">01 / ПОМОЩЬ</div>
      </div>
      <div className="symptom-grid" role="group" aria-label="Выберите проблему устройства">
        {symptoms.map(([icon,label]) => <button key={label} className={'symptom-button ' + (selected === label ? 'selected' : '')}
          type="button" aria-pressed={selected === label} onClick={() => { onSelect(label); track('symptom_selected', { symptom: label }); }}>
          <Icon name={icon} size={24} /><span>{label}</span><Icon name={selected === label ? 'Check' : 'ArrowUpRight'} size={17} />
        </button>)}
      </div>
      <div className="symptom-action"><div aria-live="polite"><strong>{selected ? 'Проблема: ' + selected : 'Можно просто описать проблему'}</strong>
        <p>Модель и подробности добавите в сообщении.</p></div>
        <ContactLink message={messages.symptom(selected)} context={{ symptom: selected || 'unknown' }} location="symptoms"
          className="button button-primary">Узнать причину и стоимость</ContactLink>
      </div>
    </div>
  </section>;
}
