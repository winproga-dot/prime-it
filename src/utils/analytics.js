// Аналитика PRIME IT.
// 1) Vercel Web Analytics — без cookie, включается в панели Vercel (Analytics → Enable).
// 2) Яндекс Метрика и Google Analytics 4 — только после согласия посетителя.
//    ID задаются переменными окружения Vercel при сборке:
//    VITE_YANDEX_METRIKA_ID=12345678, VITE_GA4_ID=G-XXXXXXXXXX
// В события передаются только контекстные метки — никогда не текст сообщения или телефон.
import { captureAdSource } from './adSource.js';
export const analyticsEvents = Object.freeze([
  'whatsapp_click', 'phone_click', 'route_click', 'service_click',
  'symptom_selected', 'review_2gis_click',
]);
const env = import.meta.env || {};
export const metrikaId = /^\d{5,12}$/.test(env.VITE_YANDEX_METRIKA_ID || '') ? Number(env.VITE_YANDEX_METRIKA_ID) : null;
export const ga4Id = /^G-[A-Z0-9]{4,16}$/.test(env.VITE_GA4_ID || '') ? env.VITE_GA4_ID : null;
export const consentRequired = Boolean(metrikaId || ga4Id);
const CONSENT_KEY = 'primeit-analytics-consent';

let provider = null;
let consentLoaded = false;
export function setAnalyticsProvider(callback) {
  provider = typeof callback === 'function' ? callback : null;
}

export function getConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
}
export function setConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* приватный режим */ }
  if (value === 'granted') loadConsentedAnalytics();
  else if (value === 'denied' && consentLoaded) window.location.reload(); // выгрузить уже загруженные счётчики
}
export function openConsentSettings() {
  try { localStorage.removeItem(CONSENT_KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event('primeit:consent-open'));
}

function addScript(src) {
  const script = document.createElement('script');
  script.async = true; script.src = src;
  document.head.appendChild(script);
}

function loadConsentedAnalytics() {
  if (consentLoaded || typeof window === 'undefined') return;
  consentLoaded = true;
  if (metrikaId) {
    window.ym = window.ym || function ym() { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    addScript('https://mc.yandex.ru/metrika/tag.js');
    window.ym(metrikaId, 'init', { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
  }
  if (ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga4Id);
    addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4Id));
  }
}

export async function initAnalytics() {
  if (typeof window === 'undefined') return;
  captureAdSource();
  const local = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  if (!local) {
    // Скрипт отдаётся самим Vercel после включения Web Analytics в проекте.
    window.va = window.va || function va() { (window.vaq = window.vaq || []).push(arguments); };
    addScript('/_vercel/insights/script.js');
  }
  if (consentRequired && getConsent() === 'granted') loadConsentedAnalytics();
}

export function track(event, properties = {}) {
  if (typeof window === 'undefined' || !analyticsEvents.includes(event)) return;
  try {
    window.dispatchEvent(new CustomEvent('primeit:analytics', { detail: { event, ...properties } }));
    if (provider) provider(event, properties);
    if (window.va) window.va('event', { name: event, data: properties });
    if (consentLoaded && metrikaId && window.ym) window.ym(metrikaId, 'reachGoal', event, properties);
    if (consentLoaded && ga4Id && window.gtag) window.gtag('event', event, properties);
  } catch { /* Аналитика не должна мешать переходу по ссылке. */ }
}
