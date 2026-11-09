import { useEffect, useRef, useState } from 'react';
import { brand } from '../data/brand.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
import useMeasuredHeight from '../hooks/useMeasuredHeight.js';
const nav = [['services','Услуги'],['pricing','Цены'],['reviews','Отзывы'],['faq','FAQ'],['contact','Контакты']];
export default function Header({ home = false, localSections = false, message, context }) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  useMeasuredHeight(headerRef, '--header-height');
  // Подвижная жёлтая «таблетка» в меню: едет за курсором, при прокрутке
  // показывает текущий раздел, а после загрузки один раз пробегает по пунктам.
  useEffect(() => {
    const navEl = navRef.current;
    const indicator = navEl?.querySelector('.nav-indicator');
    if (!navEl || !indicator) return;
    const desktop = window.matchMedia('(min-width: 1100px)');
    const links = Array.from(navEl.querySelectorAll('a'));
    let hover = null, active = null, timers = [];
    const place = () => {
      const target = hover || active;
      links.forEach(link => link.classList.toggle('is-current', link === target));
      if (!target || !desktop.matches) { indicator.style.opacity = '0'; return; }
      indicator.style.opacity = '1';
      indicator.style.width = target.offsetWidth + 'px';
      indicator.style.transform = 'translateX(' + target.offsetLeft + 'px)';
    };
    const enter = event => { hover = event.currentTarget; place(); };
    const leave = () => { hover = null; place(); };
    links.forEach(link => link.addEventListener('mouseenter', enter));
    navEl.addEventListener('mouseleave', leave);
    const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) active = links.find(link => link.hash === '#' + entry.target.id) || null;
      if (window.scrollY < 200) active = null;
      place();
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(section => observer.observe(section));
    if (desktop.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      links.forEach((link, i) => timers.push(setTimeout(() => { if (!hover) { active = link; place(); } }, 1400 + i * 160)));
      timers.push(setTimeout(() => { if (!hover && window.scrollY < 200) { active = null; place(); } }, 1400 + links.length * 160 + 300));
    }
    window.addEventListener('resize', place);
    return () => { timers.forEach(clearTimeout); observer.disconnect(); window.removeEventListener('resize', place);
      links.forEach(link => link.removeEventListener('mouseenter', enter)); navEl.removeEventListener('mouseleave', leave); };
  }, []);
  const href = id => (home || (localSections && ['faq','contact'].includes(id)) ? '' : '/') + '#' + id;
  useEffect(() => {
    if (!open) return;
    navRef.current?.querySelector('a')?.focus({ preventScroll:true });
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); toggleRef.current?.focus(); }
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
  return <header ref={headerRef} className="site-header">
    <div className="container header-inner">
      <a className="brand" href="/" aria-label="PRIME IT — главная">
        <img src="/logo.jpg" width="40" height="40" alt="" decoding="async" />
        <span><strong>PRIME<span className="brand-accent"> IT</span></strong><small>Выездной сервис · Алматы</small></span>
      </a>
      <nav ref={navRef} className={'header-nav ' + (open ? 'is-open' : '')} id="primary-navigation" aria-label="Основная навигация">
        <span className="nav-indicator" aria-hidden="true" />
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
