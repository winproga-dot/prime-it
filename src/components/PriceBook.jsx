import { useCallback, useEffect, useRef, useState } from 'react';
import { services } from '../data/services.js';
import { messages } from '../utils/whatsapp.js';
import { priceLabel } from './ServiceCard.jsx';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
import SplitWords from './SplitWords.jsx';

// Прайс-журнал. Разворот: слева фото услуги, справа название, цена и кнопки.
// Листается: ведёте мышью по стикерам под журналом слева направо (каждый стикер — страница),
// стрелками, клавишами ←/→, кликом по краю страницы или свайпом на телефоне.
// Все услуги и цены остаются в HTML — их видят поисковики и экранные дикторы.
//
// Листы: front(L0) — обложка, back(Lk) — фото услуги k, front(Lk) (k ≥ 1) — детали услуги k-1.
// Когда перевёрнуто f листов: слева back(L f-1) = фото услуги f-1, справа front(L f) = её детали.
const count = services.length;
const short = { repair: 'Ремонт', clean: 'Чистка', winms: 'Windows', data: 'Данные', gpu_service: 'Видеокарты', parts: 'Матрица',
  hinge: 'Петли', speedup: 'SSD и ОЗУ', build: 'Сборка ПК', soft: 'Программы', misc: 'Другое', battery: 'Батарея', sale: 'Подбор ПК' };

function Details({ service, index }) {
  return <div className="page-details" id={'service-' + service.id}>
    <span className="mono page-num">{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
    <img className="page-thumb" src={'/media/' + service.image + '-640.webp'} width="640" height="400" alt="" loading="lazy" decoding="async" />
    <h3>{service.path ? <a href={service.path}>{service.title}</a> : service.title}</h3>
    <p>{service.description}</p>
    <strong className="page-price">{priceLabel(service)}</strong>
    <small>{service.priceNote || (service.price ? 'Точная стоимость — после бесплатной диагностики.' : 'Диагностика — бесплатно.')}</small>
    <div className="page-actions">
      <ContactLink className="button button-primary" message={messages.service(service.title)} context={{ service: service.id }} location="price_book">Узнать цену</ContactLink>
      {service.path && <a className="button button-ghost" href={service.path}>Подробнее <Icon name="ArrowUpRight" size={16} /></a>}
    </div>
  </div>;
}

export default function PriceBook() {
  // page: 0 — обложка, 1..count — услуги; from — откуда листали (для поочерёдного переворота листов)
  const [{ page, from }, setState] = useState({ page: 0, from: 0 });
  const bookRef = useRef(null);
  const touch = useRef(null);
  const go = useCallback(next => setState(state => {
    const target = Math.max(0, Math.min(count, next));
    return target === state.page ? state : { page: target, from: state.page };
  }), []);

  useEffect(() => {
    const book = bookRef.current;
    const onKey = event => {
      if (!book.contains(document.activeElement) && document.activeElement !== book) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); go(page + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(page - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page, go]);

  const onTouchStart = event => { touch.current = event.touches[0].clientX; };
  const onTouchEnd = event => {
    if (touch.current === null) return;
    const dx = event.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) go(page + (dx < 0 ? 1 : -1));
    touch.current = null;
  };

  return <section className="section container price-book" id="pricing" aria-labelledby="pricing-title">
    <div className="section-heading"><div><p className="eyebrow">Прайс</p><SplitWords as="h2" id="pricing-title" text="Все услуги и цены" />
      <p>Ведите мышью по стикерам — журнал листается. Цены «от» за работу, диагностика — бесплатно.</p></div></div>

    <div className="book-wrap">
      <button type="button" className="book-arrow book-arrow--prev" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Предыдущая страница"><Icon name="ArrowRight" size={20} /></button>
      <div ref={bookRef} className="book" data-page={page} tabIndex={0} aria-roledescription="журнал услуг" aria-label={'Прайс PRIME IT, страница ' + page + ' из ' + count}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ '--page': page }}>
        <div className="book-left" aria-hidden="true">
          <p className="mono">PRIME IT® / Прайс {new Date().getFullYear()}</p>
          <strong>Выездной сервисный центр</strong>
          <span>{count} услуг · диагностика бесплатно</span>
        </div>
        {Array.from({ length: count + 1 }, (_, k) => {
          const flipped = k < page;
          // Листы между старой и новой страницей переворачиваются по очереди, как в журнале.
          const order = page > from ? k - from : from - 1 - k;
          const moving = page > from ? k >= from && k < page : k >= page && k < from;
          return <div key={k} className={'leaf' + (flipped ? ' is-flipped' : '')}
            style={{ zIndex: flipped ? k + 1 : count + 2 - k, transitionDelay: (moving ? order * 70 : 0) + 'ms' }}
            onClick={event => { if (!event.target.closest('a,button')) go(flipped ? k : k + 1); }}>
            <div className="leaf-front" aria-hidden={k !== page}>
              {k === 0 ? <div className="book-cover">
                <span className="mono">PRIME IT®</span>
                <strong>Прайс<br />{new Date().getFullYear()}</strong>
                <span className="cover-hint"><Icon name="ArrowRight" size={18} /> Листайте</span>
              </div> : <Details service={services[k - 1]} index={k - 1} />}
            </div>
            <div className="leaf-back" aria-hidden="true">
              {k < count ? <img src={'/media/' + services[k].image + '-960.webp'} width="960" height="600" alt="" loading="lazy" decoding="async" />
                : <div className="book-cover book-cover--back"><strong>Мастер приедет сам.</strong></div>}
              {k < count && <span className="mono leaf-tag">{short[services[k].id]}</span>}
            </div>
          </div>;
        })}
      </div>
      <button type="button" className="book-arrow book-arrow--next" onClick={() => go(page + 1)} disabled={page === count} aria-label="Следующая страница"><Icon name="ArrowRight" size={20} /></button>
    </div>

    <div className="stickers" role="tablist" aria-label="Услуги">
      {services.map((service, i) => <button key={service.id} type="button" role="tab" aria-selected={page === i + 1}
        className={'sticker' + (page === i + 1 ? ' is-active' : '')} style={{ '--tilt': ((i % 3) - 1) * 2 + 'deg' }}
        onMouseEnter={() => go(i + 1)} onFocus={() => go(i + 1)} onClick={() => go(i + 1)}>
        <span>{short[service.id]}</span><strong>{service.price ? 'от ' + new Intl.NumberFormat('ru-RU').format(service.price) + ' ₸' : 'диагностика 0 ₸'}</strong>
      </button>)}
    </div>
  </section>;
}
