# Deployment and search indexing
## Hosting
1. Deploy the whole `dist/` directory, including each service folder, robots.txt, sitemap.xml, 404.html, favicon, social preview and media.
2. Serve `/service-slug/` from its own `index.html`. Return 301 from the equivalent URL without a slash; a Netlify/Cloudflare Pages `_redirects` file is included.
3. Return an actual 404 and the generated 404.html for unknown URLs. Do not use a catch-all SPA rewrite.
4. Enable HTTPS, gzip or Brotli, and caching for images. Hashed JS/CSS in `/assets/` can be cached for one year with immutable. HTML should revalidate.
5. Verify DNS for both prime-it.kz and www.prime-it.kz. Both names returned ENOTFOUND from the audit runner on 2026-10-01; this needs an independent check with the registrar/hosting provider. The code cannot configure DNS.
6. Choose https://www.prime-it.kz/ as the canonical host and configure a single redirect from the alternative host. All metadata and sitemap entries use the requested www address.
7. Check direct service URL loads and reloads on the actual hosting provider. Use View Source to confirm its unique title, description, H1, FAQ and JSON-LD before JavaScript runs.
8. Verify WhatsApp app opening on physical Android/iOS and desktop, and calls on a phone. Browser QA verifies standard wa.me encoding and tel links; OS handoff requires real devices.

## Business listings
- Update/verify Google Business Profile: PRIME IT, Алматы, ул. Сатпаева, 105А, +77076840625, daily 10:00–20:00.
- Keep the owner-provided [2GIS card](https://2gis.kz/almaty/firm/70000001078609004) consistent with the site. Address and phone matched during the 2026-10-01 check. The listing currently shows 07:00–22:00 by prior phone call; change it to the actual daily 10:00–20:00 and check the business description.
- Confirm that the 2GIS destination link opens the entrance you use on real mobile devices. The site uses the route URL exposed by the checked card, not an address search.
- Keep the three real review excerpts and source links current. Only publish dates if independently verified; dates of official replies are not review dates.
- Do not add geographic coordinates or aggregate ratings until independently confirmed from the current listing.

## Search indexing after deployment
- Verify ownership in Google Search Console.
- Submit https://www.prime-it.kz/sitemap.xml.
- Use URL Inspection for the home page and all ten service pages; request indexing where appropriate.
- Check HTTP 200, canonical selection, mobile rendering and robots access.
- Review Page Indexing reports and real Core Web Vitals after enough traffic has accumulated.
- Add/update Yandex Webmaster and submit the same sitemap if relevant to your audience.
- Keep name, address and phone consistent across listings and directories.
- Earn relevant external mentions/links through business listings and real local partnerships.
- Keep service prices, opening hours, FAQs and licensing terms current.

These measures make the site understandable and crawlable; rankings depend on search engines, competition and external signals.

## QA scope
CI tests the production output in Chromium and WebKit at 360×800, 390×844, 412×915, 430×932, 1366×768, 1920×1080 and 2560×1440; checks all service URLs, semantic headings, contact URLs, historic service/license anchors, reduced motion, keyboard menu controls and rendered content with JavaScript disabled. Automated axe checks complement visual review. Lighthouse is a lab measurement, not field INP or a guarantee of scores after deployment.
