// Источник рекламы: запоминаем, с какой рекламы пришёл посетитель (первое касание в сессии),
// чтобы в сообщении WhatsApp было видно «Откуда узнали» — даже без согласия на cookie-аналитику.
// Хранится только название площадки (без идентификаторов кликов) и только до закрытия вкладки.
const KEY = 'primeit-ad-source';
const LABELS = {
  google: 'Google', yandex: 'Яндекс', '2gis': '2ГИС', instagram: 'Instagram', facebook: 'Facebook',
  meta: 'Instagram/Facebook', olx: 'OLX', tiktok: 'TikTok', whatsapp: 'WhatsApp', telegram: 'Telegram',
  gbp: 'Google Карты', yandexmaps: 'Яндекс Карты', flyer: 'Листовка', card: 'Визитка', qr: 'QR-код',
};

export function detectAdSource(search) {
  const params = new URLSearchParams(search || '');
  const raw = (params.get('utm_source') || '').trim().toLowerCase();
  if (/^[a-z0-9._-]{2,30}$/.test(raw)) {
    const key = raw.replace(/^(ig|insta)$/, 'instagram').replace(/^(fb)$/, 'facebook').replace(/^(ya|yandex\.direct|direct)$/, 'yandex').replace(/^(adwords|google_ads|googleads)$/, 'google');
    return { source: key, label: LABELS[key] || raw };
  }
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) return { source: 'google', label: 'Google' };
  if (params.has('yclid')) return { source: 'yandex', label: 'Яндекс' };
  return null;
}

export function captureAdSource() {
  if (typeof window === 'undefined') return;
  const found = detectAdSource(window.location.search);
  if (!found) return;
  try { if (!sessionStorage.getItem(KEY)) sessionStorage.setItem(KEY, JSON.stringify(found)); } catch { /* приватный режим */ }
}

export function getAdSource() {
  if (typeof window === 'undefined') return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    return value && typeof value.label === 'string' && typeof value.source === 'string' ? value : null;
  } catch { return null; }
}
