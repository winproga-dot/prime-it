import { useEffect, useState } from 'react';
import { track } from '../utils/analytics.js';
import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
const symptoms = [
  ['Power','Не включается'],['Gauge','Тормозит'],['Fan','Сильно греется'],['PanelTop','Разбит экран'],
  ['Zap','Выключается'],['Monitor','Проблема с Windows'],['MemoryStick','Нужен апгрейд'],['CircleHelp','Другая проблема'],
];
// Подсказка «ассистента»: вероятная причина и с чего начать. Точная причина — после бесплатной диагностики.
const hints = {
  'Не включается': ['Питание, аккумулятор или плата', 'Ремонт ноутбуков и ПК', 'после диагностики', '/remont-noutbukov-almaty/'],
  'Тормозит': ['Пыль, старый HDD или мало памяти', 'Ускорение: SSD и ОЗУ', 'от 7 000 ₸', '/upgrade-noutbuka-kompyutera-almaty/'],
  'Сильно греется': ['Пыль и высохшая термопаста', 'Чистка и замена термопасты', 'от 8 000 ₸', '/chistka-noutbuka-almaty/'],
  'Разбит экран': ['Повреждена матрица', 'Замена матрицы', 'от 10 000 ₸ + деталь', '/zamena-matricy-noutbuka-almaty/'],
  'Выключается': ['Перегрев или неисправное питание', 'Чистка и проверка питания', 'от 8 000 ₸', '/chistka-noutbuka-almaty/'],
  'Проблема с Windows': ['Сбой системы или драйверов', 'Установка Windows', 'от 10 000 ₸', '/ustanovka-windows-almaty/'],
  'Нужен апгрейд': ['Подберём совместимые SSD и ОЗУ', 'Апгрейд SSD и ОЗУ', 'от 7 000 ₸', '/upgrade-noutbuka-kompyutera-almaty/'],
  'Другая проблема': ['Определим на месте', 'Бесплатная диагностика', 'бесплатно', '/remont-noutbukov-almaty/'],
};
export default function Symptoms({ selected = '', onSelect }) {
  const [thinking, setThinking] = useState(false);
  useEffect(() => {
    if (!selected) return;
    setThinking(true);
    const timer = setTimeout(() => setThinking(false), 900);
    return () => clearTimeout(timer);
  }, [selected]);
  const hint = selected && hints[selected];
  return <section className="section container" id="estimate" aria-labelledby="symptoms-title">
    <div className="symptoms-panel" data-reveal>
      <div className="section-heading"><div><p className="eyebrow">Начнём с вашей проблемы</p><h2 id="symptoms-title">Что случилось с устройством?</h2>
        <p>Выберите симптом — подскажем вероятную причину и цену.</p></div>
      </div>
      <div className="symptom-grid" role="group" aria-label="Выберите проблему устройства">
        {symptoms.map(([icon,label]) => <button key={label} className={'symptom-button ' + (selected === label ? 'selected' : '')}
          type="button" aria-pressed={selected === label} onClick={() => { onSelect(label); track('symptom_selected', { symptom: label }); }}>
          <Icon name={icon} size={24} /><span>{label}</span><Icon name={selected === label ? 'Check' : 'ArrowUpRight'} size={17} />
        </button>)}
      </div>
      <div className="symptom-action"><div aria-live="polite" className="assistant">
        {!hint ? <><strong>Можно просто описать проблему</strong><p>Модель и подробности добавите в сообщении.</p></>
          : thinking ? <p className="assistant-thinking">Подбираем решение<span className="dots"><i>.</i><i>.</i><i>.</i></span></p>
          : <div className="assistant-result" key={selected}>
            <span className="assistant-label">Вероятная причина</span><strong>{hint[0]}</strong>
            <p><a href={hint[3]}>{hint[1]}</a> · {hint[2]}. Точно скажем после бесплатной диагностики.</p>
          </div>}
      </div>
        <ContactLink message={messages.symptom(selected)} context={{ symptom: selected || 'unknown' }} location="symptoms"
          className="button button-primary">Узнать причину и стоимость</ContactLink>
      </div>
    </div>
  </section>;
}
