import { useEffect, useRef, useState } from 'react';
import { brand } from '../data/brand.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
const nav = [['services','Услуги'],['pricing','Цены'],['reviews','Отзывы'],['faq','FAQ'],['contact','Контакты']];
export default function Header({ home = false, localSections = false, message, context }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const href = id => (home || (localSections && ['faq','contact'].includes(id)) ? '' : '/') + '#' + id;
  useEffect(() => {
    if (!open) return;
    const onKey = event => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    const onPointer = event => {
      if (!navRef.current?.contains(event.target) && !toggleRef.current?.contains(event.target)) setOpen(false);
    };
    const media = window.matchMedia('(min-width: 1100px)');
    const onResize = event => { if (event.matches) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    media.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      media.removeEventListener('change', onResize);
    };
  }, [open]);
  return <header className="site-header">
    <div className="container header-inner">
      <a className="brand" href="/" aria-label="PRIME IT — главная">
        <img src="/logo.jpg" width="40" height="40" alt="" decoding="async" />
        <span><strong>PRIME<span className="brand-accent"> IT</span></strong><small>Компьютерный сервис · Алматы</small></span>
      </a>
      <nav ref={navRef} className={'header-nav ' + (open ? 'is-open' : '')} id="primary-navigation" aria-label="Основная навигация">
        {nav.map(([id,label]) => <a key={id} href={href(id)} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <ContactLink type="phone" location="header" className="header-phone">{brand.phoneDisplay}</ContactLink>
        <ContactLink location="header" message={message} context={context} className="button button-primary header-whatsapp" aria-label="Написать в WhatsApp">WhatsApp</ContactLink>
        <button ref={toggleRef} type="button" className="icon-button menu-toggle" aria-controls="primary-navigation"
          aria-expanded={open} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setOpen(!open)}>
          <Icon name={open ? 'X' : 'Menu'} size={23} />
        </button>
      </div>
    </div>
  </header>;
}
