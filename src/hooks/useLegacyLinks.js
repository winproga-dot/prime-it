import { useEffect } from 'react';
// Native anchors work without JavaScript. This also preserves historical aliases.
export default function useLegacyLinks() {
  useEffect(() => {
    const run = () => {
      let hash = '';
      try { hash = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const params = new URLSearchParams(window.location.search);
      if (!hash && (params.get('service') || params.get('s'))) hash = 'service-' + (params.get('service') || params.get('s'));
      if (!hash && (params.get('license') || params.get('lic') || params.get('l'))) hash = 'license-' + (params.get('license') || params.get('lic') || params.get('l'));
      if (!hash) return;
      if (['license','licenses-modal'].includes(hash)) hash = 'licenses';
      hash = hash.replace(/-calc$/, '').replace(/-modal$/, '');
      const target = document.getElementById(hash);
      if (!target) {
        if (window.location.pathname !== '/' && /^(service-|license-|licenses$)/.test(hash)) window.location.assign('/#' + encodeURIComponent(hash));
        return;
      }
      let disclosure = target.closest('details') || (hash === 'licenses' ? target.querySelector('details') : null);
      while (disclosure) { disclosure.open = true; disclosure = disclosure.parentElement?.closest('details'); }
      requestAnimationFrame(() => target.scrollIntoView({ block:'start', behavior:'instant' }));
    };
    run();
    window.addEventListener('hashchange', run);
    return () => window.removeEventListener('hashchange', run);
  }, []);
}
