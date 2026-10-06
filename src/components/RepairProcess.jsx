import { repairJourney } from '../data/repairJourney.js';
import useRepairJourney from '../hooks/useRepairJourney.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';

export default function RepairProcess({ message, context }) {
  const { ref, active, enhanced } = useRepairJourney();
  return <section ref={ref} id="process" className="section container repair-story" data-story-mode={enhanced ? 'scroll' : 'stacked'} data-active-step={active}
    aria-labelledby="process-title">
    <div className="section-heading" data-reveal><div><p className="eyebrow">Понятно на каждом этапе</p>
      <h2 id="process-title">Как проходит ремонт</h2>
      <p>Сначала разберёмся. Затем согласуем ремонт.</p></div>
      <span className="section-index" aria-hidden="true">02 / ПРОЦЕСС</span>
    </div>
    <div className="repair-story-grid">
      <div className="story-stage" aria-hidden="true">
        <div className="story-stage-top"><span>PRIME IT / ВАША ТЕХНИКА</span><span>0{active + 1} / 03</span></div>
        <div className="story-view">
          {repairJourney.map((step, index) => <div key={step.id} className={'story-frame story-frame--' + step.id + (active === index ? ' is-active' : '')}>
            <img src={'/media/' + step.image + '-960.webp'} width="960" height="600" loading="lazy" decoding="async" alt="" />
            <div className="story-frame-shade" />
            <div className="story-frame-mark"><Icon name={step.icon} size={32} /></div>
            {step.id === 'diagnosis' && <svg className="inspection-ring" viewBox="0 0 300 300" fill="none">
              <circle cx="150" cy="150" r="120" /><circle cx="150" cy="150" r="96" />
              <path d="M150 16v32M150 252v32M16 150h32M252 150h32" />
            </svg>}
            {step.id === 'repair' && <svg className="story-check" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="35" /><path d="m24 40 11 11 22-23" />
            </svg>}
            <div className="story-frame-copy"><span>ЭТАП {step.number}</span><strong>{step.label}</strong></div>
          </div>)}
        </div>
        <div className="story-stage-bottom">
          <div className="story-dots">{repairJourney.map((step, index) => <span key={step.id} className={active === index ? 'is-active' : ''} />)}</div>
          <span>Стоимость — до начала работ</span>
        </div>
      </div>
      <ol className="repair-steps">
        {repairJourney.map((step, index) => <li key={step.id} className={'repair-step' + (active === index ? ' is-active' : '')} data-journey-step={index}>
          <div className="step-mobile-image"><img src={'/media/' + step.image + '-640.webp'} width="640" height="400" alt="" loading="lazy" decoding="async" /></div>
          <div className="repair-step-copy">
            <div className="repair-step-meta"><span>{step.number}</span><Icon name={step.icon} size={24} /></div>
            <h3>{step.title}</h3><p>{step.text}</p>
            <div className="step-tags">{step.tags.map(tag => <span key={tag}><Icon name="Check" size={14} />{tag}</span>)}</div>
            <p className="repair-step-detail">{step.detail}</p>
          </div>
        </li>)}
      </ol>
    </div>
    <div className="story-contact" data-reveal><div><strong>Начнём с того, что случилось.</strong><p>Напишите о проблеме — поможем определить следующий шаг.</p></div>
      <ContactLink className="text-link" message={message} context={context} location="repair_process">Обсудить мою проблему <Icon name="ArrowUpRight" size={18} /></ContactLink>
    </div>
  </section>;
}
