import { useEffect, useRef, useState } from 'react';
import { brand } from '../data/brand.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
export default function Hero() {
  const [playing, setPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    const update = () => {
      const enabled = media.matches && !navigator.connection?.saveData;
      setCanPlay(enabled);
      if (!enabled) setPlaying(false);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!playing) return;
    videoRef.current?.play()?.catch(() => setPlaying(false));
  }, [playing]);
  return <section id="hero" className="hero container" aria-labelledby="hero-title">
    <div className="hero-copy">
      <p className="eyebrow"><span className="status-dot" /> PRIME IT · Сервисный центр в Алматы</p>
      <h1 id="hero-title">Ремонт компьютеров<br className="desktop-break" /> и ноутбуков <span>в Алматы</span></h1>
      <p className="hero-benefits"><span className="hero-benefit-item">Бесплатная диагностика</span> <span className="benefit-separator">•</span> <span className="hero-benefit-item">Гарантия на работы</span> <span className="benefit-separator">•</span> <span className="hero-benefit-item">Ремонт от 1 часа</span></p>
      <p className="hero-description">Расскажите, что случилось. Мы найдём причину и согласуем стоимость до начала ремонта.</p>
      <p className="hero-address"><Icon name="MapPin" size={18} /><span>{brand.street}<br /><span className="muted">{brand.hours}</span></span></p>
      <div className="hero-actions">
        <ContactLink className="button button-primary" location="hero">Узнать стоимость в WhatsApp</ContactLink>
        <ContactLink type="phone" className="button button-secondary" location="hero">Позвонить</ContactLink>
      </div>
      <ContactLink type="route" className="text-link hero-route" location="hero" />
      <p className="hero-note"><Icon name="CheckCircle2" size={16} /> Диагностика бесплатна, даже если вы откажетесь от ремонта.</p>
    </div>
    <div className="hero-visual">
      <div className="hero-media">
        <picture>
          <source media="(max-width: 600px)" srcSet="/media/hero-small.webp" />
          <img src="/hero.webp" width="1536" height="1024" alt="Обслуживание ноутбука: проверка и установка компонентов"
            fetchpriority="high" loading="eager" decoding="async" />
        </picture>
        {playing && <video ref={videoRef} src="/media/hero.mp4" poster="/hero.webp" width="1536" height="1024"
          muted playsInline preload="none" className="hero-video" onEnded={() => setPlaying(false)} onError={() => setPlaying(false)} />}
        <div className="hero-media-shade" />
        <span className="media-label"><Icon name="Cpu" size={16} /> Ноутбуки · ПК · Видеокарты</span>
        <div className="media-caption"><span>Техника снова</span><strong>в рабочем ритме.</strong></div>
        {canPlay && <button className="video-control" type="button" onClick={() => setPlaying(!playing)}
          aria-label={playing ? 'Остановить видео' : 'Посмотреть видео о сервисе'}><Icon name={playing ? 'X' : 'Play'} size={16} />{playing ? 'Остановить' : 'Посмотреть видео'}</button>}
      </div>
      <div className="diagnosis-card"><div className="diagnosis-icon"><Icon name="Search" size={24} /></div>
        <div><span>Сначала найдём причину</span><strong>Диагностика — бесплатно</strong></div><Icon name="ArrowUpRight" />
      </div>
    </div>
  </section>;
}
