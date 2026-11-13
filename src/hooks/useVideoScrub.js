import { useEffect, useRef } from 'react';

// Прокрутка видео колесом: кадры видео (WebP) рисуются на canvas в зависимости
// от прокрутки. Работает одинаково в Chrome, Safari и Firefox и не зависит от
// настройки «уменьшить анимацию»: картинка меняется только когда человек сам
// прокручивает страницу. Длина прокрутки — около одного экрана.
// 81 кадр (каждый 3-й кадр видео): плавно и в ~3 раза меньше памяти, важно для iPhone.
export const FRAME_COUNT = 81;
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
    const track = () => root.querySelector('.hv-media-track');
    const sticky = () => root.querySelector('.hv-media');
    const canvas = root.querySelector('canvas');
    const context = canvas.getContext('2d');
    const bar = root.querySelector('.hv-progress i');
    const counter = root.querySelector('.hv-counter');
    const captions = Array.from(root.querySelectorAll('[data-chapter]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const set = window.matchMedia('(min-width: 900px)').matches && !navigator.connection?.saveData ? 'd' : 'm';
    const frames = new Array(FRAME_COUNT);
    let target = 0, current = 0, raf = 0, lastTime = 0, drawn = -1, drawnFocus = -1, chapter = -1, visible = true, disposed = false;

    // Против мерцания:
    // — холст меняем только если реально изменился его размер (присваивание width/height
    //   стирает холст; на телефоне resize бывает от показа/скрытия адресной строки);
    // — кадры храним уже распакованными (ImageBitmap), отрисовка не ждёт декодирования;
    // — перерисовываем только при смене кадра;
    // — если нужный кадр ещё не загружен, берём соседний (±6), иначе оставляем текущую
    //   картинку, а не прыгаем к далёкому кадру.
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(rect.width * ratio), height = Math.round(rect.height * ratio);
      if (!width || !height || (width === canvas.width && height === canvas.height)) return;
      canvas.width = width; canvas.height = height;
      draw(true);
    };
    const nearest = index => {
      for (let d = 0; d <= 6; d++) {
        if (frames[index - d]) return [frames[index - d], index - d];
        if (frames[index + d]) return [frames[index + d], index + d];
      }
      return drawn < 0 ? frames.map((frame, i) => frame && [frame, i]).find(Boolean) || null : null;
    };
    const draw = (force = false) => {
      const index = Math.round(current * (FRAME_COUNT - 1));
      // На узком (вертикальном) кадре в финале смещаем фокус к логотипу справа.
      const focus = Math.round((.5 + .2 * clamp((current - .86) / .06)) * 100) / 100;
      const found = (force || index !== drawn || focus !== drawnFocus) ? nearest(index) : null;
      if (found && (force || found[1] !== drawn || focus !== drawnFocus)) {
        const [frame, frameIndex] = found;
        const { width, height } = canvas;
        const scale = Math.max(width / frame.width, height / frame.height);
        const w = frame.width * scale, h = frame.height * scale;
        context.drawImage(frame.source, (width - w) * focus, (height - h) / 2, w, h);
        drawn = frameIndex; drawnFocus = focus;
        root.dataset.frame = String(frameIndex);
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
    // Диапазон прокрутки, на котором проигрывается видео.
    // ПК: весь первый экран закреплён, видео идёт ~1 экран.
    // Телефон: без закрепления — видео проигрывается, пока карточка проезжает
    // от низа экрана до шапки, и страница не становится длиннее.
    const range = () => {
      const docTop = node => node.getBoundingClientRect().top + window.scrollY;
      if (pinned()) {
        const area = track(), pin = sticky();
        const start = docTop(area) - (parseFloat(getComputedStyle(pin).top) || 0);
        return [start, start + Math.max(1, area.offsetHeight - pin.offsetHeight)];
      }
      const frame = root.querySelector('.hv-frame');
      const styles = getComputedStyle(document.documentElement);
      const header = parseFloat(styles.getPropertyValue('--header-height')) || 60;
      const bar = parseFloat(styles.getPropertyValue('--mobile-action-height')) || 0;
      const top = docTop(frame), height = frame.offsetHeight;
      const start = Math.max(0, top + height - (window.innerHeight - bar));
      const end = Math.max(start + height, top - header - 8);
      return [start, end];
    };
    const measure = () => {
      const [start, end] = range();
      root.dataset.rangeStart = String(Math.round(start)); root.dataset.rangeEnd = String(Math.round(end));
      return clamp((window.scrollY - start) / (end - start));
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
          const image = new Image(); image.decoding = 'async';
          // onload + таймаут: зависший кадр не блокирует остальные (его заменит соседний).
          const loaded = await new Promise(resolve => {
            const timer = setTimeout(() => resolve(false), 8000);
            image.onload = () => { clearTimeout(timer); resolve(true); };
            image.onerror = () => { clearTimeout(timer); resolve(false); };
            image.src = frameUrl(set, index);
          });
          if (!loaded || !image.naturalWidth) continue;
          // Распаковываем заранее, чтобы отрисовка при прокрутке была мгновенной.
          let source = image;
          try { source = window.createImageBitmap ? await createImageBitmap(image) : (await image.decode(), image); } catch { /* рисуем как есть */ }
          frames[index] = { source, width: image.naturalWidth, height: image.naturalHeight };
          const wanted = Math.round(current * (FRAME_COUNT - 1));
          if (drawn < 0 || Math.abs(index - wanted) < Math.abs(drawn - wanted)) draw(true);
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
      disposed = true; cancelAnimationFrame(raf); frames.forEach(frame => frame?.source?.close?.()); observer.disconnect(); resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('load', start);
    };
  }, []);
  return ref;
}
