import { useEffect } from 'react';

// Progressive enhancement: HTML is visible before hydration and without JS.
// Animations are finite, observed once, and cancelled when motion is reduced.
export default function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.IntersectionObserver || !Element.prototype.animate) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    let observer;
    let generation = 0;
    const setup = () => {
      const session = ++generation;
      observer?.disconnect();
      for (const animation of animations) animation.cancel();
      animations.clear();
      if (preference.matches) return;
      observer = new IntersectionObserver(entries => {
        // Disconnect cannot withdraw an already queued delivery in every engine.
        if (preference.matches || session !== generation) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (entry.target.hasAttribute('data-split')) {
            // Пословно: 40px вверх и размытие 10px, шаг 45 мс (как у Work Louder).
            entry.target.querySelectorAll('.w').forEach((word, i) => {
              const a = word.animate([
                { opacity: 0, transform: 'translate3d(0, 40px, 0)', filter: 'blur(10px)' },
                { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0px)' },
              ], { duration: 900, delay: i * 45, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'backwards' });
              animations.add(a); const done = () => animations.delete(a); a.finished.then(done, done);
            });
            continue;
          }
          // Как у Mobbin: подъём на 16px с размытием 4px, 1 с, easeOutExpo.
          const delay = Math.min(Number(entry.target.dataset.revealOrder || 0) * 80, 240);
          const animation = entry.target.animate([
            { opacity: 0, transform: 'translate3d(0, 16px, 0)', filter: 'blur(4px)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0px)' },
          ], { duration: 1000, delay, easing: 'cubic-bezier(.19,1,.22,1)', fill: 'backwards' });
          animations.add(animation);
          const remove = () => animations.delete(animation);
          animation.finished.then(remove, remove);
        }
      }, { threshold: .08 });
      root.querySelectorAll('[data-reveal],[data-split]').forEach(node => observer.observe(node));
    };
    setup();
    preference.addEventListener('change', setup);
    return () => {
      ++generation;
      observer?.disconnect();
      preference.removeEventListener('change', setup);
      for (const animation of animations) animation.cancel();
    };
  }, [rootRef]);
}
