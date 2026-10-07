import { brand } from '../data/brand.js';
import ContactActions from './ContactActions.jsx';
import Icon from './Icon.jsx';
import LaptopScene from './LaptopScene.jsx';
import HeroVideo from './HeroVideo.jsx';
import useScrollScene from '../hooks/useScrollScene.js';

export default function Hero({ message, context }) {
  const sceneRef = useScrollScene();
  return <section ref={sceneRef} id="hero" className="hero-story" data-scene-mode="static" aria-labelledby="hero-title">
    <div className="hero-pin hero hero--scroll container">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" /> PRIME IT · Сервисный центр в Алматы</p>
        <h1 id="hero-title">Ремонт компьютеров<br className="desktop-break" /> и ноутбуков <span>в Алматы</span></h1>
        <p className="hero-lead">Сначала найдём причину.<br /><strong>Диагностика — бесплатно.</strong></p>
        <p className="hero-benefits"><span className="hero-benefit-item">Гарантия на работы</span> <span className="benefit-separator">•</span> <span className="hero-benefit-item">Ремонт от 1 часа</span></p>
        <p className="hero-description">Стоимость согласуем с вами до начала ремонта.</p>
        <p className="hero-address"><Icon name="MapPin" size={18} /><span>{brand.street}<br /><span className="muted">{brand.hours}</span></span></p>
        <ContactActions message={message} context={context} location="hero" />
        <p className="hero-note"><Icon name="CheckCircle2" size={16} /> Диагностика бесплатна, даже если вы откажетесь от ремонта.</p>
        <a href="#estimate" className="scene-skip text-link">Выбрать мою проблему <Icon name="ChevronDown" size={16} /></a>
      </div>
      <div className="scene-anchor" aria-hidden="true" />
      <div className="hero-visual scroll-visual">
        <div className="scene-topline"><span>ОТ ПРОБЛЕМЫ К РЕШЕНИЮ</span><span className="scene-counter" aria-hidden="true">01 / 03</span></div>
        <LaptopScene />
        <div className="scene-chapters" aria-hidden="true">
          <div data-scene-copy="0"><span>01 / ОБРАЩЕНИЕ</span><strong>Не работает?<br />Разберёмся.</strong><p>Не нужно знать причину.<br />Просто расскажите, что случилось.</p></div>
          <div data-scene-copy="1"><span>02 / БЕСПЛАТНАЯ ДИАГНОСТИКА</span><strong>Причина — внутри.<br />Найдём её.</strong><p>Проверим устройство и сообщим стоимость.<br />Ремонт — только после согласования.</p></div>
          <div data-scene-copy="2"><span>03 / РЕМОНТ И ПРОВЕРКА</span><strong>Снова в работе.</strong><p>Выполним согласованный ремонт.<br />Проверим устройство перед выдачей.</p></div>
        </div>
        <ol className="scene-transcript">
          <li>Расскажите, что случилось — знать причину не нужно.</li>
          <li>Бесплатно проведём диагностику и согласуем стоимость.</li>
          <li>После согласования выполним ремонт и проверим устройство.</li>
        </ol>
        <div className="scene-bottomline" aria-hidden="true"><span className="scene-scroll-hint"><Icon name="ChevronDown" size={16} /> Прокрутите — заглянем внутрь</span><div className="scene-track"><i /></div></div>
        <HeroVideo />
      </div>
    </div>
  </section>;
}
