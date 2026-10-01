# PRIME IT
Responsive React/Vite website for the computer service centre in Almaty.

## Run and build
Requires Node.js 22.19+; ffmpeg is recommended to compress the optional desktop video.
```sh
npm install
npm run dev
npm run build
npm run qa:static
npx playwright install --with-deps chromium webkit
npm run qa:browser
npm run qa:lighthouse
```
Deploy the entire `dist/` directory. The build generates complete HTML for the home page and ten service pages. Do not replace service URLs with an SPA fallback to the home page.

## Source
- `src/data/brand.js`: the only source of contact information.
- `src/data/services.js`: service prices and useful service-page content.
- `src/data/faq.js`: displayed home FAQs; the same records generate FAQPage.
- `src/data/reviews.js`: verified reviews only; currently empty.
- `src/data/licenses.js`: existing license offers preserved from the project.
- `src/components/` and `src/pages/`: one responsive interface.
- `scripts/prepare-assets.mjs`: image derivatives, social preview, video compression.
- `scripts/prerender.mjs`: server-rendered HTML and metadata at build time.
- `scripts/qa-browser.mjs`: Chrome/WebKit, seven viewports, links, accessibility, no-JS and deep-link checks.

Original service images live in `assets/source/`; generated WebP files live in `public/media/` and are ignored by Git. Originals are not deployed. There is no extension probing and no calculator.

## Contacts and verified sources
PRIME IT · Алматы, ул. Сатпаева, 105А  
8 (707) 684-06-25 · Без выходных, 10:00–20:00  
prime.it.08@gmail.com · https://www.prime-it.kz/

Diagnosis is free, including when the customer declines repair.
Warranty: up to 3 months on work, supplier warranty on replacement parts, as stated in the original project.

2GIS returned a CAPTCHA during verification. The historical short URL could not be verified against the new address and is not used in production. Until the current business card is confirmed, the reviews section links to a business/address search, and navigation uses Google Maps directions by the exact address. No ratings, coordinates or fabricated review excerpts are published.

To publish real reviews: verify the current 2GIS card and phone/address, set `brand.twoGisUrl` to its canonical `/firm/...` URL (without a tab suffix), then add verbatim excerpts with the actual author, date and source URL in `src/data/reviews.js`. Rebuild. That also adds the confirmed URL to LocalBusiness.sameAs.

## Analytics
No GA4/Metrica ID is configured. Register a provider after your SDK is ready:
```js
import { setAnalyticsProvider } from './src/utils/analytics.js';
setAnalyticsProvider((event, properties) => {
  window.gtag?.('event', event, properties);
});
```
Alternatively listen for `primeit:analytics` CustomEvent. Events: whatsapp_click, phone_click, route_click, service_click, symptom_selected, review_2gis_click. Only contextual service/symptom labels are recorded; visitor message contents are not sent.

See [deployment and indexing checklist](docs/deployment.md).
