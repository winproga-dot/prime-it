import { useState } from 'react';
import ContactActions from './ContactActions.jsx';
import Icon from './Icon.jsx';
import { brand } from '../data/brand.js';
import useVideoScrub, { chapters, frameUrl } from '../hooks/useVideoScrub.js';

// Иконки-фото услуг внутри заголовка (приём Mobbin): место раздвигается,
// иконка «впрыгивает» с размытием. По клику — следующая иконка.
const ICONS = [
  ['repair', 'Ремонт ноутбука'], ['gpu_service', 'Видеокарта'], ['build', 'Игровой ПК'], ['clean', 'Чистка'],
  ['parts', 'Матрица'], ['data', 'Данные'], ['speedup', 'SSD'], ['winms', 'Windows'],
];
function Slot({ start, delay }) {
  const [index, setIndex] = useState(start);
  const [id, label] = ICONS[index % ICONS.length];
  return <span className="hero-slot" style={{ animationDelay: delay + 'ms' }} aria-hidden="true">
    <span className="hero-slot-inner" style={{ animationDelay: delay + 90 + 'ms' }} onClick={() => setIndex(index + 3)} title={label}>
      <img key={id} className="hero-icon" src={'/media/' + id + '-icon.webp'} width="160" height="160" alt="" decoding="async" />
    </span>
  </span>;
}
const BRANDS = ['ASUS', 'Lenovo', 'HP', 'Acer', 'MSI', 'Dell', 'Apple', 'Huawei', 'Samsung', 'Gigabyte', 'Honor', 'Xiaomi'];

export default function Hero({ message, context }) {
  const ref = useVideoScrub();
  return <section ref={ref} id="hero" className="hero-v" aria-labelledby="hero-title">
    <div className="hv-copy container">
      <p className="eyebrow hero-line" style={{ '--line': 0 }}><span className="status-dot" /> {brand.serviceType} · Алматы</p>
      <h1 id="hero-title">
        <span className="hero-line" style={{ '--line': 1 }}>Выездной<Slot start={0} delay={1100} />ремонт</span>
        <span className="hero-line" style={{ '--line': 2 }}>компьютеров<Slot start={1} delay={1250} />и ноутбуков</span>
        <span className="hero-line" style={{ '--line': 3 }}>в Алматы<Slot start={2} delay={1400} /></span>
      </h1>
      <p className="hv-lead hero-line" style={{ '--line': 4 }}><strong>Диагностика — бесплатно.</strong> Мастер приедет домой или в офис, без выходных {brand.hours.replace('Без выходных, ', 'с ').replace('–', ' до ')}.</p>
      <div className="hero-line" style={{ '--line': 5 }}><ContactActions message={message} context={context} location="hero" /></div>
      <p className="visit-notice hero-appointment hero-line" style={{ '--line': 6 }}><Icon name="ShieldCheck" size={16} /><span><strong>Гарантия до 3 месяцев.</strong> <span className="visit-detail">Стоимость согласуем до начала ремонта.</span></span></p>
    </div>
    <div className="brand-ticker" aria-label="Ремонтируем технику любых брендов">
      <p>Ремонтируем технику любых брендов</p>
      <div className="ticker-mask"><div className="ticker-track">{[0, 1].map(copy => <ul key={copy} aria-hidden={copy === 1}>{BRANDS.map(item => <li key={item}>{item}</li>)}</ul>)}</div></div>
    </div>
    <div className="hv-media-track" data-scrub-desktop data-scrub-mobile>
      <figure className="hv-media container" data-reveal>
        <div className="hv-frame">
          <img className="hv-poster" src={frameUrl('d', 0)} srcSet={frameUrl('m', 0) + ' 768w, ' + frameUrl('d', 0) + ' 1280w'}
            sizes="(max-width: 899px) 100vw, 1100px" width="1280" height="720" alt="Сборка игрового компьютера в PRIME IT" loading="lazy" decoding="async" />
          <canvas aria-hidden="true" />
          <div className="hv-shade" aria-hidden="true" />
          <div className="hv-caption" aria-hidden="true">
            <div className="hv-chapters">{chapters.map((item, i) => <p key={item.label} data-chapter={i} className={i === 0 ? 'is-active' : ''}><span>{item.label}</span><strong>{item.title}</strong></p>)}</div>
            <span className="hv-counter">01 / {String(chapters.length).padStart(2, '0')}</span>
          </div>
          <div className="hv-progress" aria-hidden="true"><i /></div>
        </div>
        <figcaption><span><Icon name="ChevronDown" size={15} /> Прокрутите — соберём компьютер</span>
          <a className="text-link" href="/sborka-kompyutera-almaty/">Сборка ПК под ваши задачи <Icon name="ArrowUpRight" size={15} /></a></figcaption>
      </figure>
    </div>
  </section>;
}
