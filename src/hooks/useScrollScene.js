import { useEffect, useRef } from 'react';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };

// Reversible scroll timeline, without wheel interception or an idle animation loop.
export default function useScrollScene() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const visual = root.querySelector('.scroll-visual');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 900px)');
    const parts = Object.fromEntries(Array.from(root.querySelectorAll('[data-scene-part]')).map(node => [node.dataset.scenePart, node]));
    const copies = Array.from(root.querySelectorAll('[data-scene-copy]'));
    const counter = root.querySelector('.scene-counter');
    const progress = root.querySelector('.scene-track i');
    let start = 0, distance = 1, raf = 0, resizeRaf = 0, enabled = false, visible = true, last = -1;

    const paint = (value, force = false) => {
      const p = clamp(value);
      if (!force && Math.abs(p - last) < .00005) return;
      last = p;
      const open = smooth(.03, .35, p);
      const close = smooth(.64, .96, p);
      const explode = open * (1 - close);
      const awake = smooth(.78, .96, p);
      const diagnosis = smooth(.19, .35, p) * (1 - smooth(.63, .76, p));
      parts.world.style.transform = 'translate3d(-50%,-44%,0) rotateX(' + mix(56, 46, open) + 'deg) rotateY(' + mix(-7, 9, p) + 'deg) rotateZ(' + mix(-24, -4, p) + 'deg) scale(' + (1 - explode * .12 + awake * .05) + ')';
      parts.world.style.top = (60 + explode * 7) + '%';
      parts.cover.style.opacity = String(1 - explode * .65);
      parts.lid.style.transform = 'translate3d(0,' + (-explode * 48) + 'px,' + (12 + explode * 86) + 'px) rotateX(' + (-105 + explode * 10) + 'deg)';
      parts.deck.style.transform = 'translate3d(' + (-explode * 35) + 'px,' + (-explode * 22) + 'px,' + (14 + explode * 126) + 'px)';
      parts.deck.style.opacity = String(1 - explode * .42);
      parts.board.style.transform = 'translate3d(0,0,' + (7 + explode * 24) + 'px)';
      parts.cover.style.transform = 'translate3d(' + (explode * 24) + 'px,' + (explode * 34) + 'px,' + (-explode * 75) + 'px)';
      parts.cpu.style.transform = 'translate3d(0,0,' + (4 + explode * 45) + 'px)';
      parts.ssd.style.transform = 'translate3d(' + (explode * 84) + 'px,' + (explode * 16) + 'px,' + (4 + explode * 66) + 'px) rotateZ(' + (explode * 8) + 'deg)';
      parts.fan.style.transform = 'translate3d(' + (-explode * 48) + 'px,0,' + (4 + explode * 50) + 'px)';
      parts.rotor.style.transform = 'rotate(' + (p * 520) + 'deg)';
      parts.scan.style.transform = 'translate3d(' + (-180 + 360 * smooth(.25, .62, p)) + 'px,0,80px)';
      parts.scan.style.opacity = String(diagnosis * .75);
      parts.signal.style.opacity = String(diagnosis);
      parts.off.style.opacity = String(1 - awake);
      parts.on.style.opacity = String(awake);
      parts.shadow.style.transform = 'translateX(-50%) scale(' + (1 + explode * .25) + ')';
      parts.shadow.style.opacity = String(.52 - explode * .27);
      parts.labels.style.opacity = String(diagnosis);
      const chapter = p < .28 ? 0 : p < .74 ? 1 : 2;
      root.dataset.sceneChapter = String(chapter);
      root.dataset.scrollProgress = p.toFixed(4);
      counter.textContent = '0' + (chapter + 1) + ' / 03';
      const weights = [1 - smooth(.2, .32, p),smooth(.2, .32, p) * (1 - smooth(.67, .78, p)),smooth(.67, .78, p)];
      copies.forEach((node, i) => {
        node.style.opacity = String(weights[i]);
        node.style.transform = 'translate3d(0,' + ((1 - weights[i]) * (p > i / 3 ? -24 : 24)) + 'px,0)';
      });
      progress.style.transform = 'scaleX(' + p + ')';
    };
    const update = () => { raf = 0; if (enabled && visible && !preference.matches) paint((window.scrollY - start) / distance); };
    const schedule = () => { if (enabled && visible && !raf) raf = requestAnimationFrame(update); };
    const measure = () => {
      resizeRaf = 0;
      const styles = getComputedStyle(document.documentElement);
      const header = parseFloat(styles.getPropertyValue('--header-height')) || 82;
      const bottom = desktop.matches ? 0 : parseFloat(styles.getPropertyValue('--mobile-action-height')) || 0;
      const available = window.innerHeight - header - bottom - 12;
      const largeText = parseFloat(styles.fontSize) > 22;
      const fits = desktop.matches ? available >= Math.max(600, root.querySelector('.hero-copy').scrollHeight + 48) : available >= 500;
      enabled = !preference.matches && !largeText && fits;
      cancelAnimationFrame(raf); raf = 0;
      root.dataset.sceneMode = enabled ? 'scroll' : 'static';
      const sceneHeight = desktop.matches ? available : Math.min(available, 670);
      distance = desktop.matches ? clamp(window.innerHeight * 1.8, 1200, 2400) : Math.max(850, sceneHeight * 1.65);
      root.style.setProperty('--scene-height', sceneHeight + 'px');
      root.style.setProperty('--scroll-distance', enabled ? distance + 'px' : '0px');
      // Layout is read on resize/setup, never on each scroll event.
      const target = desktop.matches ? root : root.querySelector('.scene-anchor');
      start = target.getBoundingClientRect().top + window.scrollY - header;
      root.style.setProperty('--device-scale', Math.min(visual.clientWidth / 500, Math.max(300, visual.clientHeight - 185) / 540, 1.25).toFixed(3));
      visible = true;
      paint(enabled ? (window.scrollY - start) / distance : 0, true);
      if (!enabled) {
        for (const animation of document.getAnimations?.() || []) {
          if (animation.effect?.target instanceof Element && root.contains(animation.effect.target)) animation.cancel();
        }
      }
    };
    const scheduleMeasure = () => { if (!resizeRaf) resizeRaf = requestAnimationFrame(measure); };
    const observer = window.IntersectionObserver ? new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) schedule();
    }, { rootMargin: '100px' }) : null;
    observer?.observe(root);
    const resizeObserver = window.ResizeObserver ? new ResizeObserver(scheduleMeasure) : null;
    resizeObserver?.observe(root.querySelector('.hero-copy'));
    const headerNode = document.querySelector('.site-header');
    if (headerNode) resizeObserver?.observe(headerNode);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    window.visualViewport?.addEventListener('resize', scheduleMeasure, { passive: true });
    preference.addEventListener('change', measure);
    desktop.addEventListener('change', measure);
    measure();
    return () => {
      cancelAnimationFrame(raf); cancelAnimationFrame(resizeRaf);
      observer?.disconnect(); resizeObserver?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', scheduleMeasure);
      window.visualViewport?.removeEventListener('resize', scheduleMeasure);
      preference.removeEventListener('change', measure);
      desktop.removeEventListener('change', measure);
    };
  }, []);
  return ref;
}
