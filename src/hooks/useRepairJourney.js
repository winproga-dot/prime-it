import { useEffect, useRef, useState } from 'react';

export default function useRepairJourney() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => {
    const root = ref.current;
    if (!root || !window.IntersectionObserver) return;
    const preference = window.matchMedia('(min-width: 1000px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)');
    let observer;
    const configure = () => {
      observer?.disconnect();
      setEnhanced(preference.matches);
      if (!preference.matches) return;
      const steps = [...root.querySelectorAll('[data-journey-step]')];
      const visible = new Set();
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        const next = steps.findIndex(node => visible.has(node));
        if (next !== -1) setActive(next);
      }, { rootMargin: '-' + Math.round(window.innerHeight * .32) + 'px 0px -' + Math.round(window.innerHeight * .46) + 'px 0px', threshold: 0 });
      steps.forEach(node => observer.observe(node));
    };
    configure();
    preference.addEventListener('change', configure);
    window.addEventListener('resize', configure, { passive: true });
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', configure);
      window.removeEventListener('resize', configure);
    };
  }, []);
  return { ref, active, enhanced };
}
