import { brand } from '../data/brand.js';
import { servicePages } from '../data/services.js';
export default function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div><a className="footer-brand" href="/">PRIME <span>IT</span></a><p>Компьютерный сервис в Алматы</p>
    <p>{brand.street}<br />{brand.hours}</p></div><nav className="footer-nav" aria-label="Услуги PRIME IT">
      {servicePages.map(page => <a key={page.path} href={page.path}>{page.breadcrumb}</a>)}</nav></div>
    <div className="footer-bottom"><span>© PRIME IT</span><a href="/#licenses">Лицензии и программы</a><a href="/#contact">Контакты</a><span>Диагностика — бесплатно</span></div>
  </div></footer>;
}
