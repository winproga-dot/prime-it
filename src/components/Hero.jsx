import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { brand } from '../data/brand.js';
import ContactActions from './ContactActions.jsx';
import Icon from './Icon.jsx';
import ContactLink from './ContactLink.jsx';
import usePointerDepth from '../hooks/usePointerDepth.js';

export default function Hero({ message, context }) {
  const depthRef = usePointerDepth();
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState('idle');
  const [canPlay, setCanPlay] = useState(false);
  const videoRef = useRef(null);
  const playbackId = useRef(0);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px)');
    const update = () => {
      setCanPlay(media.matches);
      if (!media.matches) {
        ++playbackId.current;
        videoRef.current?.pause();
        setRequested(false);
        setStatus('idle');
      }
    };
    update();
    media.addEventListener('change', update);
    return () => {
      ++playbackId.current;
      media.removeEventListener('change', update);
    };
  }, []);

  const fail = id => {
    if (id !== playbackId.current) return;
    ++playbackId.current;
    setRequested(false);
    setStatus('error');
  };
  const toggleVideo = () => {
    if (requested) {
      ++playbackId.current;
      videoRef.current?.pause();
      setRequested(false);
      setStatus('idle');
      return;
    }
    // Mount and start inside the user's click. Safari may lose activation
    // when play() is deferred to a React effect.
    const id = ++playbackId.current;
    flushSync(() => {
      setStatus('loading');
      setRequested(true);
    });
    const video = videoRef.current;
    if (!video) return fail(id);
    video.muted = true;
    video.defaultMuted = true;
    try { video.play()?.catch(() => fail(id)); }
    catch { fail(id); }
  };

  const session = playbackId.current;
  return <section id="hero" className="hero hero--cinematic container" aria-labelledby="hero-title">
    <div className="hero-atmosphere" aria-hidden="true"><div className="hero-grid-lines" /><span className="hero-orbit hero-orbit--one" /><span className="hero-orbit hero-orbit--two" /></div>
    <div className="hero-copy">
      <p className="eyebrow"><span className="status-dot" /> PRIME IT · Сервисный центр в Алматы</p>
      <h1 id="hero-title">Ремонт компьютеров<br className="desktop-break" /> и ноутбуков <span>в Алматы</span></h1>
      <p className="hero-lead">Сначала найдём причину.<br /><strong>Диагностика — бесплатно.</strong></p>
      <p className="hero-benefits"><span className="hero-benefit-item">Гарантия на работы</span> <span className="benefit-separator">•</span> <span className="hero-benefit-item">Ремонт от 1 часа</span></p>
      <p className="hero-description">Стоимость согласуем с вами до начала ремонта.</p>
      <p className="hero-address"><Icon name="MapPin" size={18} /><span>{brand.street}<br /><span className="muted">{brand.hours}</span></span></p>
      <ContactActions message={message} context={context} location="hero" />
      <p className="hero-note"><Icon name="CheckCircle2" size={16} /> Диагностика бесплатна, даже если вы откажетесь от ремонта.</p>
    </div>
    <div className="hero-visual">
      <div ref={depthRef} className={'hero-rig' + (requested ? ' hero-rig--playing' : '')}>
      <div className="hero-rig-top"><span><span className="rig-dot" /> PRIME IT / СЕРВИС</span><span>АЛМАТЫ</span></div>
      <div className={'hero-media' + (requested ? ' is-playing' : '')} data-video-state={status}>
        <picture>
          <source media="(max-width: 600px)" srcSet="/media/hero-small.webp" />
          <img src="/hero.webp" width="1280" height="854" alt="Компоненты игрового компьютера: охлаждение, видеокарта и материнская плата"
            fetchpriority="high" loading="eager" decoding="async" />
        </picture>
        {requested && <video ref={videoRef} src="/media/hero.mp4" poster="/hero.webp" width="854" height="480"
          muted playsInline loop controls preload="metadata" className="hero-video" aria-label="Видео о компьютерном сервисе"
          onPlaying={() => { if (session === playbackId.current) setStatus('playing'); }}
          onWaiting={() => { if (session === playbackId.current) setStatus('loading'); }} onError={() => fail(session)} />}
        <div className="hero-media-shade" />
        <div className="hero-scan" aria-hidden="true" />
        <svg className="hero-crosshair" viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M8 40V8h32M120 8h32v32M152 120v32h-32M40 152H8v-32" /><circle cx="80" cy="80" r="36" /><path d="M80 32v16M80 112v16M32 80h16M112 80h16" /></svg>
        <span className="media-label"><Icon name="Cpu" size={16} /> Ноутбуки · ПК · Видеокарты</span>
        <div className="media-caption"><span>Техника снова</span><strong>в деле.</strong></div>
        {canPlay && <button className="video-control" type="button" onClick={toggleVideo}
          aria-pressed={requested} aria-label={requested ? 'Закрыть видео' : status === 'error' ? 'Повторить загрузку видео' : 'Посмотреть видео о сервисе'}>
          <Icon name={requested ? 'X' : 'Play'} size={18} />{requested ? 'Закрыть' : status === 'error' ? 'Повторить' : 'Посмотреть видео'}
        </button>}
        <div className={'video-status' + (status === 'loading' || status === 'error' ? ' is-visible' : '')} role="status" aria-live="polite">
          {status === 'loading' ? 'Загружаем видео…' : status === 'error' ? 'Видео не загрузилось. Попробуйте ещё раз.' : ''}
        </div>
      </div>
      <div className="hero-rig-bottom" aria-hidden="true"><span>ДИАГНОСТИКА / СОГЛАСОВАНИЕ / РЕМОНТ</span><span className="rig-lines"><i /><i /><i /><i /><i /><i /></span></div>
      </div>
      <ContactLink className="diagnosis-card" message={message} context={context} location="hero_diagnosis" showIcon={false} aria-label="Записаться на бесплатную диагностику"><div className="diagnosis-icon"><Icon name="Search" size={24} /></div>
        <div><span>Сначала найдём причину</span><strong>Диагностика — бесплатно</strong></div><Icon name="ArrowUpRight" />
      </ContactLink>
    </div>
  </section>;
}
