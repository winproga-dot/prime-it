import ContactActions from './ContactActions.jsx';
import VisitNotice from './VisitNotice.jsx';
import Icon from './Icon.jsx';
import { brand } from '../data/brand.js';
import GamingPcScene from './GamingPcScene.jsx';
import useScrollScene from '../hooks/useScrollScene.js';

const chapters = [
  { label: '01 / КОРПУС', title: 'Начинаем с основы.' },
  { label: '02 / ПЛАТА И ПРОЦЕССОР', title: 'У каждой детали своё место.' },
  { label: '03 / ВИДЕОКАРТА И ПАМЯТЬ', title: 'Мощность — внутри.' },
  { label: '04 / ОХЛАЖДЕНИЕ И ПИТАНИЕ', title: 'Продумываем каждый узел.' },
  { label: '05 / КАБЕЛИ И СТЕКЛО', title: 'Собираем всё воедино.' },
  { label: '06 / ГОТОВЫЙ КОМПЬЮТЕР', title: 'Готов к вашим задачам.' },
];

export default function Hero({ message, context }) {
  const sceneRef = useScrollScene();
  return <section ref={sceneRef} id="hero" className="hero-story hero-story--pc" data-scene-mode="static" aria-labelledby="hero-title">
    <div className="hero-pin hero hero--scroll hero--pc">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" /> PRIME IT · Сервис с выездом в Алматы</p>
        <h1 id="hero-title">Ремонт компьютеров<br className="desktop-break" /> и ноутбуков <span>в Алматы</span></h1>
        <p className="hero-lead">Сначала найдём причину.<br /><strong>Диагностика — бесплатно.</strong></p>
        <p className="hero-benefits"><span className="hero-benefit-item">Гарантия на работы</span> <span className="benefit-separator">•</span> <span className="hero-benefit-item">Ремонт от 1 часа</span></p>
        <p className="hero-description">Стоимость согласуем с вами до начала ремонта.</p>
        <p className="hero-address"><Icon name="MapPin" size={18} /><span>{brand.street}<br /><span className="muted">{brand.hours}</span></span></p>
        <VisitNotice className="hero-note hero-appointment" />
        <ContactActions message={message} context={context} location="hero" />
        <a href="#estimate" className="scene-skip text-link">Выбрать мою проблему <Icon name="ChevronDown" size={16} /></a>
      </div>
      <div className="scene-anchor" aria-hidden="true" />
      <div className="hero-visual scroll-visual">
        <div className="pc-background" aria-hidden="true"><GamingPcScene /></div>
        <div className="pc-copy-mask" aria-hidden="true" />
        <div className="assembly-caption">
          <div className="scene-topline"><span>PRIME IT / СБОРКА И АПГРЕЙД ПК</span><span className="scene-counter" aria-hidden="true">01 / 06</span></div>
          <div className="scene-chapters" aria-hidden="true">
            {chapters.map((chapter,index)=><div key={chapter.label} data-scene-copy={index}><span>{chapter.label}</span><strong>{chapter.title}</strong></div>)}
          </div>
          <a className="assembly-service-link text-link" href="/sborka-kompyutera-almaty/">Соберём ПК под ваши задачи <Icon name="ArrowUpRight" size={16} /></a>
          <ol className="scene-transcript">
            <li>Подбираем совместимые комплектующие под ваши задачи.</li>
            <li>Собираем компьютер и подключаем компоненты.</li>
            <li>Проверяем готовый ПК перед выдачей.</li>
          </ol>
          <div className="scene-bottomline" aria-hidden="true"><span className="scene-scroll-hint"><Icon name="ChevronDown" size={16} /> Прокрутите — соберём компьютер</span><div className="scene-track"><i /></div></div>
        </div>
      </div>
    </div>
  </section>;
}
