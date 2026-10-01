# PRIME IT
Responsive React/Vite website for the computer service centre in Almaty.

## Run and build
Requires Node.js 22.19+. The checked desktop MP4 is committed in `assets/prepared/`; production builds do not require ffmpeg.
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
- `src/data/reviews.js`: verified real 2GIS excerpts, dates, individual ratings, profile photos and source URLs.
- `src/data/media.js`: real service photographs, authors and checked Creative Commons licenses.
- `src/data/licenses.js`: existing license offers preserved from the project.
- `src/components/` and `src/pages/`: one responsive interface.
- `scripts/prepare-assets.mjs`: responsive image derivatives, photo credits, social preview and the prepared video.
- `scripts/prerender.mjs`: server-rendered HTML and metadata at build time.
- `scripts/qa-browser.mjs`: Chrome/WebKit, seven viewports, links, accessibility, no-JS and deep-link checks.

Real service photographs live in `assets/photos/`; the old illustrative PNGs have been removed from the active tree. Generated WebP derivatives live in `public/media/` and are ignored by Git. Source images are not deployed. Attribution is generated at `/photo-credits/` and linked from the footer. Review avatars are stored locally in `public/reviews/`; they are the actual public 2GIS profile photographs, not generated portraits. There is no extension probing and no calculator.

## Contacts and verified sources
PRIME IT · Алматы, ул. Сатпаева, 105А  
8 (707) 684-06-25 · Без выходных, 10:00–20:00  
prime.it.08@gmail.com · https://www.prime-it.kz/

Diagnosis is free, including when the customer declines repair.
Warranty: up to 3 months on work, supplier warranty on replacement parts, as stated in the original project.

The owner supplied https://2gis.kz/almaty/geo/70000001078609004. On 2026-10-01 the public HTTP response redirected to https://2gis.kz/almaty/firm/70000001078609004 and confirmed Satpaeva 105A and +77076840625. Review and route links came directly from that card; LocalBusiness.sameAs uses its canonical URL. Browser navigation showed CAPTCHA, but the normal public HTML responses exposed the card and reviews without bypassing a challenge.

Three short verbatim review excerpts from Sherkhan Kubaidullov, Zhaniya Karmenova and Калихан Абенов are published in `src/data/reviews.js`. Public review/profile records verified on 2026-10-01 link each excerpt to its actual author photo, publication date and individual five-star rating. These dates are review dates, not company-reply dates. The source URLs, review IDs, original avatar URLs and verification date are retained. No aggregate business rating, review count or geographic schema has been added. [Review/profile verification evidence](https://github.com/winproga-dot/prime-it/actions/runs/36901556696).

The listing currently says 07:00–22:00 by prior phone call; the website keeps the owner's stated daily 10:00–20:00. Update the listing so its hours and business description agree with the actual service centre.

To update reviews: check the real public source, copy only short verbatim excerpts with the actual author and source URL, add dates, individual ratings and genuine author profile photographs only when verified in the same source records, and update `reviewsVerifiedAt`. Rebuild. The direct review URL is stored separately from the canonical card, so tab suffixes are never inferred from a shared `/geo/` link.

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
