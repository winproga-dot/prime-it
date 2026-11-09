import ContactActions from './ContactActions.jsx';
import Icon from './Icon.jsx';
import SplitWords from './SplitWords.jsx';
import { brand } from '../data/brand.js';
import useVideoScrub, { chapters, frameUrl } from '../hooks/useVideoScrub.js';

export default function Hero({ message, context }) {
  const ref = useVideoScrub();
  return <section ref={ref} id="hero" className="hero-v" aria-labelledby="hero-title">
    <div className="hv-copy container">
      <p className="mono hero-label load-in">PRIME IT® / {brand.serviceType} / Алматы</p>
      <SplitWords as="h1" id="hero-title" load delay={120} text={['Выездной ремонт ', { text: 'компьютеров и ноутбуков', className: 'accent' }, ' в Алматы']} />
      <div className="hv-bottom load-in" style={{ '--d': '700ms' }}>
        <p className="hv-lead"><strong>Диагностика — бесплатно.</strong> Мастер приедет домой или в офис, найдёт причину и назовёт цену до начала работ.</p>
        <div><ContactActions message={message} context={context} location="hero" />
          <p className="visit-notice hero-appointment"><Icon name="Clock3" size={15} /><span><strong>{brand.hours}.</strong> <span className="visit-detail">Гарантия до 3 месяцев.</span></span></p></div>
      </div>
    </div>
    <div className="hv-media-track">
      <figure className="hv-media container" data-reveal>
        <div className="hv-frame">
          <img className="hv-poster" src={frameUrl('d', 0)} srcSet={frameUrl('m', 0) + ' 768w, ' + frameUrl('d', 0) + ' 1280w'}
            sizes="(max-width: 899px) 100vw, 1200px" width="1280" height="720" alt="Сборка игрового компьютера в PRIME IT" loading="lazy" decoding="async" />
          <canvas aria-hidden="true" />
          <div className="hv-shade" aria-hidden="true" />
          <div className="hv-caption" aria-hidden="true">
            <div className="hv-chapters">{chapters.map((item, i) => <p key={item.label} data-chapter={i} className={i === 0 ? 'is-active' : ''}><span className="mono">{String(i + 1).padStart(2, '0')} / {item.label}</span><strong>{item.title}</strong></p>)}</div>
            <span className="hv-counter mono">{String(1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</span>
          </div>
          <div className="hv-progress" aria-hidden="true"><i /></div>
        </div>
        <figcaption className="mono"><span><Icon name="ChevronDown" size={15} /> Прокрутите — соберём компьютер</span>
          <a href="/sborka-kompyutera-almaty/">Сборка ПК <Icon name="ArrowUpRight" size={15} /></a></figcaption>
      </figure>
    </div>
  </section>;
}
