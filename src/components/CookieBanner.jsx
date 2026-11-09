import { useEffect, useState } from 'react';
import { consentRequired, getConsent, setConsent } from '../utils/analytics.js';
// Показывается только если подключены Метрика/GA4 и посетитель ещё не выбрал.
// Рендерится после монтирования, чтобы не ломать гидрацию пререндеренного HTML.
export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!consentRequired) return;
    if (!getConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener('primeit:consent-open', reopen);
    return () => window.removeEventListener('primeit:consent-open', reopen);
  }, []);
  if (!open) return null;
  const choose = value => { setConsent(value); setOpen(false); };
  return <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Согласие на cookie">
    <p>Мы используем cookie Яндекс Метрики и Google Analytics, чтобы понимать, как улучшить сайт. Подробнее — в <a href="/politika-konfidencialnosti/">политике конфиденциальности</a>.</p>
    <div><button type="button" className="button button-secondary" onClick={() => choose('denied')}>Отказаться</button>
      <button type="button" className="button button-primary" onClick={() => choose('granted')}>Принять</button></div>
  </div>;
}
