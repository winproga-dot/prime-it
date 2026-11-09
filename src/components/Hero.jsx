import ContactActions from './ContactActions.jsx';
import Icon from './Icon.jsx';
import { brand } from '../data/brand.js';
import useVideoScrub, { chapters, frameUrl } from '../hooks/useVideoScrub.js';

export default function Hero({ message, context }) {
  const ref = useVideoScrub();
  return <section ref={ref} id="hero" className="hero-v" aria-labelledby="hero-title">
    <div className="hv-track" data-scrub-desktop>
      <div className="hv-pin container">
        <div className="hv-copy">
          <p className="eyebrow"><span className="status-dot" /> PRIME IT · {brand.serviceType}</p>
          <h1 id="hero-title">Выездной ремонт компьютеров и ноутбуков <span>в Алматы</span></h1>
          <p className="hv-lead"><strong>Диагностика — бесплатно.</strong> Мастер приедет домой или в офис, найдёт причину и согласует стоимость до начала ремонта.</p>
          <ul className="hv-facts">
            <li><Icon name="MapPin" size={18} /><span>Выезд по Алматы</span></li>
            <li><Icon name="Clock3" size={18} /><span>{brand.hours}</span></li>
            <li><Icon name="ShieldCheck" size={18} /><span>Гарантия до 3 месяцев</span></li>
          </ul>
          <p className="visit-notice hero-appointment"><Icon name="Phone" size={16} /><span><strong>{brand.visitNotice}</strong> <span className="visit-detail">Время выезда согласуем по звонку.</span></span></p>
          <ContactActions message={message} context={context} location="hero" />
          <a href="#estimate" className="text-link hv-skip">Выбрать мою проблему <Icon name="ChevronDown" size={16} /></a>
        </div>
        <div className="hv-media-track" data-scrub-mobile>
          <figure className="hv-media">
            <div className="hv-frame">
              <img className="hv-poster" src={frameUrl('d', 0)} srcSet={frameUrl('m', 0) + ' 768w, ' + frameUrl('d', 0) + ' 1280w'}
                sizes="(max-width: 899px) 100vw, 60vw" width="1280" height="720" alt="Сборка игрового компьютера в PRIME IT" fetchpriority="high" decoding="async" />
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
      </div>
    </div>
  </section>;
}
