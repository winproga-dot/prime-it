import { useEffect } from 'react';
// Keep fixed bars and native anchors correct when content, font size or safe area changes.
export default function useMeasuredHeight(ref, property) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const root = document.documentElement;
    const measure = () => root.style.setProperty(property, Math.ceil(element.getBoundingClientRect().height) + 'px');
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      root.style.removeProperty(property);
    };
  }, [ref, property]);
}
