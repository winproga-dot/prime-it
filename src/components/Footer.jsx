import { brand } from '../data/brand.js';
import { servicePages } from '../data/services.js';
import { legalPages } from '../data/legal.js';
import { consentRequired, openConsentSettings } from '../utils/analytics.js';
export default function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div><a className="footer-brand" href="/">PRIME <span>IT</span></a><p>Компьютерный сервис с выездом в Алматы</p>
    <p>{brand.street}<br />{brand.hours}</p><p>{brand.visitNotice}</p></div><nav className="footer-nav" aria-label="Услуги PRIME IT">
      {servicePages.map(page => <a key={page.path} href={page.path}>{page.breadcrumb}</a>)}</nav></div>
    <div className="footer-bottom"><span>© {brand.legalName}</span><a href="/#licenses">Лицензии и программы</a><a href="/#contact">Контакты</a><a href="/photo-credits/">Фотоматериалы</a><span>Диагностика — бесплатно</span></div>
    <p className="footer-legal">{brand.legalName} · {brand.taxIdLabel} {brand.taxId} · {brand.address} · {brand.phoneDisplay} · {brand.email}<br />
      {legalPages.map(page => <span key={page.path}><a href={page.path}>{page.breadcrumb}</a>{' · '}</span>)}
      {consentRequired ? <button type="button" onClick={openConsentSettings}>Настройки cookie</button> : <span>Сайт не использует рекламные cookie</span>}</p>
  </div></footer>;
}
