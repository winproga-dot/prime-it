import { useEffect, useRef } from 'react';

export default function usePointerDepth() {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const preference = window.matchMedia('(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let bounds;
    let attached = false;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      bounds = undefined;
      node.style.removeProperty('--depth-x');
      node.style.removeProperty('--depth-y');
    };
    const enter = () => { bounds = node.getBoundingClientRect(); };
    const move = event => {
      if (!bounds || event.pointerType !== 'mouse') return;
      x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        node.style.setProperty('--depth-x', (x * 2.4).toFixed(2) + 'deg');
        node.style.setProperty('--depth-y', (y * -2.4).toFixed(2) + 'deg');
        frame = 0;
      });
    };
    const configure = () => {
      reset();
      if (attached) {
        node.removeEventListener('pointerenter', enter);
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerleave', reset);
        attached = false;
      }
      if (!preference.matches || navigator.connection?.saveData) return;
      node.addEventListener('pointerenter', enter);
      node.addEventListener('pointermove', move, { passive: true });
      node.addEventListener('pointerleave', reset);
      attached = true;
    };
    configure();
    preference.addEventListener('change', configure);
    window.addEventListener('resize', reset, { passive: true });
    return () => {
      preference.removeEventListener('change', configure);
      window.removeEventListener('resize', reset);
      node.removeEventListener('pointerenter', enter);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', reset);
      reset();
    };
  }, []);
  return ref;
}
