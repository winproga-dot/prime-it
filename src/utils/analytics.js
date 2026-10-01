// No analytics IDs, cookies or SDKs are added until the owner connects a provider.
export const analyticsEvents = Object.freeze([
  'whatsapp_click', 'phone_click', 'route_click', 'service_click',
  'symptom_selected', 'review_2gis_click',
]);
let provider = null;
export function setAnalyticsProvider(callback) {
  provider = typeof callback === 'function' ? callback : null;
}
export function track(event, properties = {}) {
  if (typeof window === 'undefined' || !analyticsEvents.includes(event)) return;
  // Only contextual labels; never send the visitor's message, phone or personal data.
  try {
    window.dispatchEvent(new CustomEvent('primeit:analytics', { detail: { event, ...properties } }));
    if (provider) provider(event, properties);
  } catch { /* Tracking must never interrupt a contact link. */ }
}
