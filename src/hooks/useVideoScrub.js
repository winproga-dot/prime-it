import { useEffect, useRef } from 'react';

// Прокрутка видео колесом: кадры видео (WebP) рисуются на canvas в зависимости
// от прокрутки. Работает одинаково в Chrome, Safari и Firefox и не зависит от
// настройки «уменьшить анимацию»: картинка меняется только когда человек сам
// прокручивает страницу. Длина прокрутки — около одного экрана.
export const FRAME_COUNT = 121;
export const PIN_QUERY = '(min-width: 900px) and (min-height: 500px)';
export const frameUrl = (set, index) => '/hero-frames/' + set + '/' + String(index + 1).padStart(3, '0') + '.webp';
export const chapters = [
  { at: 0, label: 'Корпус', title: 'Начинаем с основы' },
  { at: .1, label: 'Плата и процессор', title: 'Каждая деталь — на своём месте' },
  { at: .28, label: 'Видеокарта', title: 'Мощность под ваши задачи' },
  { at: .44, label: 'Охлаждение', title: 'Тихо и без перегрева' },
  { at: .58, label: 'Подсветка', title: 'Проверяем и настраиваем' },
  { at: .88, label: 'Готово', title: 'PRIME IT — компьютер готов' },
];

const clamp = value => Math.min(1, Math.max(0, value));

function loadOrder(count) {
  const order = []; const seen = new Set();
  for (const stride of [16, 8, 4, 2, 1]) for (let i = 0; i < count; i += stride) if (!seen.has(i)) { seen.add(i); order.push(i); }
  if (!seen.has(count - 1)) order.push(count - 1);
  return order;
}

export default function useVideoScrub() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Режим «закреплён весь первый экран» — только если он помещается по высоте.
    const pinned = () => window.matchMedia(PIN_QUERY).matches;
    const track = () => root.querySelector(pinned() ? '[data-scrub-desktop]' : '[data-scrub-mobile]');
    const sticky = () => root.querySelector(pinned() ? '.hv-pin' : '.hv-media');
    const canvas = root.querySelector('canvas');
    const context = canvas.getContext('2d');
    const bar = root.querySelector('.hv-progress i');
    const counter = root.querySelector('.hv-counter');
    const captions = Array.from(root.querySelectorAll('[data-chapter]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const set = window.matchMedia('(min-width: 900px)').matches && !navigator.connection?.saveData ? 'd' : 'm';
    const frames = new Array(FRAME_COUNT);
    let target = 0, current = 0, raf = 0, lastTime = 0, drawn = -1, chapter = -1, visible = true, disposed = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio);
      drawn = -1; draw();
    };
    const nearest = index => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        if (frames[index - d]?.complete && frames[index - d].naturalWidth) return frames[index - d];
        if (frames[index + d]?.complete && frames[index + d].naturalWidth) return frames[index + d];
      }
      return null;
    };
    const draw = () => {
      const index = Math.round(current * (FRAME_COUNT - 1));
      const image = nearest(index);
      if (image) {
        const { width, height } = canvas;
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
        // На узком (вертикальном) кадре в финале смещаем фокус к логотипу справа.
        const focus = .5 + .2 * clamp((current - .86) / .06);
        context.drawImage(image, (width - w) * focus, (height - h) / 2, w, h);
        drawn = index;
        root.dataset.frame = String(index);
        if (!root.classList.contains('is-live')) root.classList.add('is-live');
      }
      bar.style.transform = 'scaleX(' + current.toFixed(4) + ')';
      let next = 0;
      chapters.forEach((item, i) => { if (current >= item.at) next = i; });
      if (next !== chapter) {
        chapter = next;
        captions.forEach((node, i) => node.classList.toggle('is-active', i === next));
        counter.textContent = String(next + 1).padStart(2, '0') + ' / ' + String(chapters.length).padStart(2, '0');
      }
      root.dataset.progress = current.toFixed(3);
      root.dataset.settled = String(current === target);
    };
    const measure = () => {
      const area = track(); const pin = sticky();
      if (!area || !pin) return 0;
      const top = parseFloat(getComputedStyle(pin).top) || 0;
      const distance = area.offsetHeight - pin.offsetHeight;
      return distance > 0 ? clamp((top - area.getBoundingClientRect().top) / distance) : 0;
    };
    // Сглаживание по времени (≈90 мс), а не по кадрам: одинаково на 60/120 Гц
    // и в браузерах, которые реже вызывают requestAnimationFrame.
    const tick = time => {
      raf = 0;
      const dt = lastTime ? Math.min(250, time - lastTime) : 16;
      lastTime = time;
      const delta = target - current;
      current = reduce.matches || Math.abs(delta) < .0008 ? target : current + delta * (1 - Math.exp(-dt / 90));
      draw();
      if (current !== target) raf = requestAnimationFrame(tick); else lastTime = 0;
    };
    const onScroll = () => { if (!visible) return; target = measure(); if (!raf) raf = requestAnimationFrame(tick); };

    // Кадры грузим после загрузки страницы: сначала каждый 16-й, потом остальные,
    // чтобы прокрутка работала сразу, а плавность догружалась.
    const load = async () => {
      const order = loadOrder(FRAME_COUNT);
      let cursor = 0;
      const worker = async () => {
        while (!disposed && cursor < order.length) {
          const index = order[cursor++];
          const image = new Image(); image.decoding = 'async'; image.src = frameUrl(set, index);
          try { await image.decode(); } catch { /* пропущенный кадр заменит соседний */ }
          frames[index] = image;
          if (Math.abs(index - Math.round(current * (FRAME_COUNT - 1))) < 3 || index === 0) { drawn = -1; draw(); }
        }
      };
      await Promise.all(Array.from({ length: 4 }, worker));
      if (!disposed) root.dataset.loaded = 'true';
    };
    const start = () => (window.requestIdleCallback || (cb => setTimeout(cb, 200)))(load);
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });

    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) onScroll(); });
    observer.observe(root);
    const resizeObserver = new ResizeObserver(() => { resize(); onScroll(); });
    resizeObserver.observe(canvas);
    window.addEventListener('scroll', onScroll, { passive: true });
    target = current = measure(); resize();
    return () => {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect(); resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('load', start);
    };
  }, []);
  return ref;
}
