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
          const delay = Math.min(Number(entry.target.dataset.revealOrder || 0) * 65, 195);
          const animation = entry.target.animate([
            { opacity: 0, transform: 'translate3d(0, 18px, 0)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0)' },
          ], { duration: 560, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
          animations.add(animation);
          const remove = () => animations.delete(animation);
          animation.finished.then(remove, remove);
        }
      }, { threshold: .08 });
      root.querySelectorAll('[data-reveal]').forEach(node => observer.observe(node));
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
