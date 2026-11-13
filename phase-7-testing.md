# Phase 7 — Testing note

Date: 2026-11-13  
Command: `npm test` (server + web) — **76 tests passed**

## Automated coverage

| Area | What ran |
| --- | --- |
| Schema / validation | Zod tests for every block type; booking, enquiry, product, live-event, order, inbox status; unknown statuses rejected; reference type/size limits asserted |
| Authorization | Role helpers; SQL policy checks (anon has no table write policies; theme → content editors; bookings/orders → order managers; live events → live managers); HTTP 401/403 for anon, content editor CSV/orders, live manager theme/pages, media manager settings |
| CMS workflows | Create page → add hero/text → draft → publish → reorder → republish → restore older revision; public order matches published sections |
| Public behaviour | Booking/enquiry insert + review messages; bad reference MIME → 400; oversized reference → 413; reduced-motion CSS present; live badge labels + lightbox Escape/Arrow keys |

## Browser pass (localhost:4000)

Exercised at **desktop 1440×900** and **mobile 390×844**:

- Routes: `/`, `/photography`, `/printing`, `/gifts`, `/live`, `/about`, `/booking`, `/contact` — all 200
- Locale: Tamil switch reloads; brand/hero Tamil appears; missing Tamil falls back to English
- Mobile: hamburger menu opens; mobile nav links show no text overflow (`scrollWidth ≤ clientWidth`)
- Desktop Tamil/EN buttons: no overflow
- Keyboard: Skip link + Tab through header; booking/contact forms focusable
- Form errors: empty contact submit shows `role="alert"` — “Please check the form and try again.”
- Live page: stored `live` event shows **Live · set by studio**

### Homepage weight / LCP (local, after load)

| Metric | Value |
| --- | --- |
| LCP | ~868 ms |
| Transfer size | ~428 KB (document + resources) |
| Resource count | 18 |

## Remaining gaps

- Gallery lightbox open/close was **not** clicked in the browser: album `phase5-wedding` has no published photographs yet. Escape/Arrow key mapping is covered by unit tests; re-check lightbox in the UI after photos are added.
- Upcoming/Ended badge UI on `/live` depends on published events of those statuses; label logic is covered by unit tests. Only a manual `live` event was present during the pass.
- Local HTTP LCP/weight are notes only, not production CDN numbers.
