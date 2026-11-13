# Oliyaruvi Digital Colour Lab — Implementation Phases

Planning source: `metapromt.md` and the 13 reference screens in `photoes/`.

This file is the working plan. Build one subphase at a time. Do not treat a subphase as done until its checks pass in a running app.

The public site must feel more spacious than the mockups. The mockups are visual direction, not a pixel-copy target. Faces, staff, milestones, revenue, visitor counts, event names, and channel URLs shown in the mockups are design fiction. Do not publish them as real Oliyaruvi facts.

---

## Current project

- `photoes/` — 13 reference screens
- `metapromt.md` — product and engineering brief
- `phases.md` — phase plan
- `phase-1.md` — completed Phase 1 decisions (routes, roles, blocks, database)
- `web/` — React public site and admin shell
- `server/` — Node.js API
- `supabase/migrations/` — first database migration and seed

## Verified business facts

Use only these as real copy until the owner edits them in admin:

| Fact | Value |
| --- | --- |
| Name | Oliyaruvi Digital Colour Lab |
| Tamil name | ஒளியருவி டிஜிட்டல் கலர் லேப் |
| Place | Nelliady, Jaffna, Sri Lanka |
| Phones | 0773928215, 0777241958 |
| WhatsApp | Same as the primary phone until admin changes it |
| Experience | 32 years, editable later |

Hours, map pin, social links, prices, staff, milestones, and domain (`oliyaruvistudio.lk` appears only in a mockup) stay empty or clearly marked draft until an admin enters them.

## Design decisions locked for later phases

**Public visual language** (from `02`, `03`, `04`, `05`, `06`, `07`, `01`): charcoal ground, antique gold, maroon as a small accent, serif headings, large photography, short copy, gold outline cards, WhatsApp as the main enquiry action.

**Public routes**

| Route | Screen it serves |
| --- | --- |
| `/` | Homepage |
| `/photography` | Portfolio and category galleries |
| `/videography` | Film categories and playback |
| `/printing` | Printing services |
| `/gifts` | Custom gifts |
| `/live` | Live streaming |
| `/about` | Story, team, milestones, location |
| `/booking` | Service booking enquiry |
| `/contact` | Contact, hours, map, enquiry |
| `/portfolio` | Optional curated mix. Start as a published page that can point at photography until the owner wants a separate mix. |

**Admin information architecture** (from `12_Admin_CMS_Visual_Page_Builder.jpg`, which is the most complete admin screen). Concepts A–D (`08`–`11`) inform dashboard cards and the live-event editor, but they do not replace this menu:

Dashboard, Page Builder, Navigation, All Pages, Media Library, Photography, Videography, Live Manager (Facebook Live, YouTube Live, Yarl Rip Book, Yarl Events, Yarl Tharisanam), Printing Products, Custom Gifts, Bookings, Orders, Testimonials, Contact Details, SEO, Theme, Analytics, Users and Roles, Site Settings.

**Stack.** The site is two applications in one repository, plus Supabase.

| Layer | Choice | Responsibility |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Tailwind | Public pages, admin UI, motion, forms |
| Backend | Node.js, Express, TypeScript, Zod | API, auth checks, uploads, validation, sitemap |
| Database | Supabase Postgres, Auth, and Storage | Content, users, media, row-level security |
| First host | Vercel | Public production deploy |
| Later host | Any Node.js server | Same build, started with `node` |

Motion, GSAP, and React Three Fiber stay on the React side, and only where a screen needs them. The browser never receives the Supabase service-role key. React calls the Node API. Content reads and writes use the signed-in user's token so row-level security applies. The service role is limited to inviting users, signing private files, and migrations.

**Hosting rule.** Vercel is the first place the site runs. It is not part of the application. The same Node process must be able to serve the API and the built React app on another machine.

- Business code does not import Vercel KV, Blob, Postgres, Edge Config, or Edge-only middleware.
- Secrets and the Supabase URL come from environment variables, so a new server is a new env file, not a code change.
- `server.ts` listens on a port. That is the entry used on a VPS, Docker host, or other Node host.
- The Vercel entry calls the same Express app. It does not contain a second copy of the routes.
- Supabase stays the database when the website moves. Moving the website server does not require moving the database. Self-hosting Supabase later is a separate decision, and the app already talks to it only through its URL and keys.

**CMS rule:** every public page renders from stored pages and sections. Admin edits content, order, media, and visibility. Code owns the block components, not the page copy.

---

# Phase 1 — Planning

Status: complete. The decisions are in `phase-1.md`. That file is the source for routes, roles, block content, permissions, and the database. Phase 2 builds from it and does not reopen those choices unless a check fails.

Outcome: this plan, plus schema and route decisions written down before application code.

## 1.1 Repository and asset inventory

- Confirm the repo contains only planning files and `photoes/`.
- Name each reference screen and what it is allowed to decide (layout, colour, navigation) versus what it must not invent (people, dates, money, live status).

## 1.2 Screen inventory

Map each file to a later subphase:

| File | Use it for |
| --- | --- |
| `01_Homepage_Mobile_View.jpg` | Mobile home, bottom enquiry bar, stacked services |
| `02_Homepage_Desktop_View.jpg` | Desktop home hero, service row, 32-year mark |
| `03_Photography_Portfolio_Page.jpg` | Gallery filters, category cards, highlight strip |
| `04_Printing_Services_Page.jpg` | Printing hero and service cards |
| `05_Contact_and_Orders_Page.jpg` | Contact layout and enquiry fields |
| `06_About_Us_Page.jpg` | About layout only. Timeline years are not facts. |
| `07_Custom_Gifts_Page.jpg` | Gifts hero and product grid |
| `08`–`11` live and admin concepts | Live page and dashboard/editor patterns |
| `12_Admin_CMS_Visual_Page_Builder.jpg` | Admin navigation and page builder |
| `13_All_Public_Website_Pages_Overview.jpg` | Check that all nine public screens exist |

## 1.3 Routes, roles, and block list

- Freeze the public routes in the table above.
- Freeze admin routes under `/admin`.
- Freeze roles: Super Admin, Content Editor, Media Manager, Order Manager, Live Event Manager.
- Freeze block types: hero, video hero, image slider, text, image, gallery, video gallery, services, product grid, live events, testimonials, statistics, FAQ, contact form, CTA, custom layout.

## 1.4 Database outline

The relations, keys, and row-level security rules are written in `phase-1.md`. The table list below is the index. Phase 1 also adds `faqs`, `product_media`, `media_references`, `booking_notes`, `booking_files`, `enquiry_notes`, and `form_rate_events` because safe delete, notes, private files, and shared rate limiting need them.

- `profiles`, `roles`, `user_roles`
- `site_settings`, `theme_settings`
- `pages`, `page_revisions`, `page_sections`
- `navigation_menus`, `navigation_items`
- `media_assets`
- `photo_albums`, `photographs`
- `video_collections`, `videos`
- `live_channels`, `live_events`, `event_broadcast_links`
- `product_categories`, `products`, `product_variants`
- `customers`, `bookings`, `enquiries`
- `orders`, `order_items`
- `testimonials`, `seo_metadata`, `audit_logs`

Each content row that visitors can read needs locale fields or a child translation table for English and Tamil. Empty Tamil falls back to English. Do not machine-fill Tamil and present it as approved copy.

## 1.5 Credentials and external dependencies

List what must exist before later phases can be real:

- Supabase project URL, anon key, service role key (Node server only)
- First super-admin email
- Vercel project when the first production deploy starts
- A second host later needs only Node.js, the built app, and the same environment variables
- Optional later: analytics provider, map embed, spam protection keys

No channel URL, payment provider, or live-status API is assumed.

## 1.6 Exit check

- `phases.md` matches the meta prompt and the 13 screens.
- Schema outline, routes, roles, and block types are written in `phase-1.md`.
- Unverified mockup facts are listed in `phases.md` and `phase-1.md` so they are not seeded as truth.
- Repository inspection found only planning files and `photoes/`. No application code was started.

---

# Phase 2 — Foundation

Status: complete. `npm run build` then `npm start` serves the public site, the admin sign-in, and the API from one Node process. The full page sections are still Phase 3. A live super-admin sign-in needs the Supabase keys in `.env`; without them the dashboard stays closed.

Outcome: an app that boots, looks like the brand, and can sign an admin in. No full pages yet.

## 2.1 Project setup

- Create a repository with two apps: `web` (React) and `server` (Node.js).
- `web`: Vite, React, TypeScript, React Router, Tailwind, ESLint. Folders: `pages` for public routes, `admin` for the dashboard, `components` for public, admin, and shared UI, `lib` for the API client and CMS block renderer.
- `server`: Express, TypeScript, Zod. Folders: `routes`, `middleware`, `db` (Supabase), `auth`, `media`, `cms`.
- `server/app.ts` exports the Express app with no call to `listen`. `server/server.ts` is the only file that listens on `PORT`. Vercel and any other host both use `app.ts`.
- In production, the Node process also serves the built React files and falls back to the React app for public and admin routes.
- Add `.env.example` with Supabase keys, `PORT`, and the public site URL. Never commit real keys.

## 2.2 Design tokens

- Put the palette into CSS variables: background `#0B0B0D`, surface `#17171B`, gold `#D6AC57`, light gold `#F3D58C`, maroon `#651C2A`, text `#F7F3EB`, muted `#B8B1A8`.
- Load Playfair Display or Cormorant Garamond, Inter, and Noto Sans Tamil.
- Add spacing, radius, and button styles that theme settings can override later.

## 2.3 Shared UI

- Build button, link, field, select, textarea, card, badge, dialog, and icon button.
- Gold primary button, gold outline secondary button, green WhatsApp button, as in the contact and home screens.
- All controls must be keyboard reachable and labelled.

## 2.4 Public chrome

- Header: logo lockup, location line, desktop nav, phone cluster, language switch, mobile drawer.
- Footer: short studio line, service links, phones, hours placeholder, social slots.
- Language switch stores `en` or `ta` and does not invent missing Tamil strings.

## 2.5 Admin chrome

- Dark admin shell matching screen `12`: left rail, top search placeholder, admin identity, content canvas.
- Rail items can be visible but disabled until their subphase exists. A disabled item must say it is not built yet. Do not render fake numbers.

## 2.6 Supabase and auth

- The React app receives the anon key for sign-in only. Admin API calls use that user's access token so row-level security applies. The service-role client is limited to invites, private file signing, and the seed script, as decided in `phase-1.md`.
- `/admin/login` signs in with Supabase Auth.
- The React admin shell sends the session token to the Node API.
- Express middleware rejects `/api/admin` requests with a missing, expired, or role-less token.
- A React route guard also blocks `/admin` except the login route. The server check is the one that matters.
- A signed-in user with no role cannot open the dashboard.

## 2.7 First migration

- Create the tables from `phase-1.md` with primary keys, foreign keys, timestamps, and indexes on slugs, status, and foreign keys.
- Add row-level security. Public reads only published rows. Writes require the matching role.
- Seed site settings with the verified facts only.
- Seed one super admin from an environment variable, not a password in the repo.

## 2.8 Run on a plain Node server

- `npm run build` builds the React app, then `npm start` runs `server.ts`.
- One local URL serves `/`, `/admin`, and `/api`.
- Confirm this command does not require the Vercel CLI.

## 2.9 Exit check

- `npm run lint` and the TypeScript check pass in both apps.
- Home route renders the header and footer with real phones and the Tamil name.
- Wrong users cannot open `/admin`.
- A super admin can.
- Stopping the Node process stops both the site and the API.

---

# Phase 3 — Public website

Status: complete. Every public route renders from page and section JSON. Without Supabase the API serves the seed defaults. Galleries, films, live events, and testimonials stay empty until real rows exist. Booking and enquiry posts need Supabase connected.

Outcome: all public screens exist and are rendered by the block system, using published seed sections. Copy stays short. Photography areas show an empty state until real media is uploaded.

## 3.1 CMS renderer

- Define a Zod schema per block type.
- `lib/cms` loads a published page and ordered sections, then renders the matching component.
- Unknown or invalid section JSON is skipped and logged, not crashed into the page.
- Draft pages are invisible on the public site.

## 3.2 Homepage

Match the structure of `02` and `01`, with more space:

- Hero: image, video, or slider, chosen by section data
- Tamil and English heading
- Portfolio and WhatsApp actions
- Five services: Photography, Videography, Printing, Custom Gifts, Live Streaming
- Experience figure from site settings
- Slots for featured photos, videos, one live event, printing and gifts, testimonials, and a contact strip

Seed English structure with the verified name and phones. Leave testimonial and gallery slots empty rather than filling them with mockup people.

## 3.3 Photography

From `03`:

- Filter row: All, Wedding, Engagement, Portrait, Events, Temple, plus the extra categories from the brief (pre-wedding, birthday, family, school, other)
- Category cards and a highlights strip
- Masonry grid, album pages, fullscreen lightbox
- Empty state: “Photographs will appear here after they are published.”

## 3.4 Videography

From the videography panel in `13`:

- Category grid with duration when a real video has one
- YouTube embed or uploaded file in a modal
- No autoplay with sound

## 3.5 Live streaming

From `08`–`11` and the live panel in `13`:

- Featured event, upcoming list, past list with replay
- Watch links for Facebook and YouTube only when a URL is stored
- Channel chips for Yarl Rip Book, Yarl Events, and Yarl Tharisanam as identities, not platforms
- A Live badge appears only when status is `live` and the event is published
- Manual status is labelled as set by the studio, not as a checked provider signal

## 3.6 Printing

From `04`:

- Intro, four quality points, service cards for photo prints, albums, banners and flex, stickers, large format, passport and ID, frames, name boards, and other
- Each card can show an image, short description, sizes, materials, optional price, and an enquiry action
- “Request a quote” goes to the enquiry form with the service prefilled

## 3.7 Custom gifts

From `07`:

- Hero and product grid: mugs, phone covers, medals, trophies, mementos, crystal, frames, keychains, other personalised gifts
- Variant and price come from product data
- Enquiry opens WhatsApp with the product name when a number is configured, and also stores an enquiry

## 3.8 About

From `06`, without fake history:

- Intro, what we do, team, facilities, milestones, trust line, gallery, location card
- Seed an empty team and an empty milestone list
- The 1994–2026 timeline in the mockup is not seeded

## 3.9 Booking

From the booking panel in `13`:

- Fields: name, phone, optional email, service, event date, location, requirements, optional reference file
- Submit stores a booking with status `new`
- Success text says the studio will review it. It does not say the date is confirmed.

## 3.10 Contact

From `05`:

- Phones, WhatsApp, address, hours, map, social links, enquiry form
- Map and hours render only after settings contain them
- Form fields match the screen: name, phone, optional email, service, details

## 3.11 Motion and responsive pass

- Hero transition, section reveal, card hover, page transition
- Honour `prefers-reduced-motion`
- Check 390px, 768px, 1280px, and a wide desktop
- No horizontal scroll
- Mobile home keeps a WhatsApp and call bar, as in `01`

## 3.12 Exit check

- Every public route renders from page and section records.
- Changing a seeded heading in the database changes the page without a code edit.
- Forms create rows.
- Empty galleries do not show mockup photographs as studio work.
- Tamil name renders with Noto Sans Tamil.

---

# Phase 4 — Admin CMS

Status: complete. Local admin (`ALLOW_LOCAL_ADMIN`) edits pages, navigation, theme, media, settings, testimonials, FAQs, and the audit log through `/admin`. Drafts stay off the public URL until publish. Publish writes a revision; restore copies a version into a new draft. Without Supabase, uploads land in `.data/uploads` and the CMS store is `.data/cms-store.json`. Media Manager vs Content Editor checks are enforced on the API when those roles are assigned in Supabase.

Outcome: the owner can change pages, menu, theme, and media without code. This phase is the priority in the brief.

## 4.1 Dashboard

From the lower panels of `08`–`11`, using only real queries:

- Counts of published photos, videos, live events, open enquiries, and open orders
- Recent enquiries and recent bookings
- Quick actions that link to real screens: edit homepage, add media, create event, add product
- Analytics card stays “Not connected” until a provider is configured. No chart of invented visits.

## 4.2 Media library

- Upload images and allowed video types to Supabase Storage
- Folders, alt text, replace, and soft delete
- Block delete while a published section, product, or event still references the file
- Size and MIME checks on the server
- Picker used by every later editor

## 4.3 Navigation manager

- Edit header and footer items
- Rename, reorder, hide, add a child for dropdowns, set internal or external URL
- Mobile nav uses the same items
- Public header updates after publish

## 4.4 Theme manager

- Edit the colour tokens, heading and body fonts, button style, header and footer style, and section spacing
- Save as draft theme or publish
- Public layout reads published theme variables
- Per-section overrides exist but cannot break contrast below the readable gold-on-charcoal pair

## 4.5 Pages

- List, create, duplicate, delete, publish, unpublish
- Slug, title, SEO fields, and locale copies
- Soft delete with restore

## 4.6 Visual page builder

Match screen `12`:

- Section list with drag reorder
- Add and remove the block types from section 1.3
- Editor tabs: content, style, animation
- Hero media type switch: image, video, slider, plus autoplay, mute, and loop
- Edit headings, body, buttons, and links in English and Tamil side by side
- Desktop and mobile preview of the draft
- Save draft without changing the live page

## 4.7 Versions

- Each publish stores a revision snapshot
- History list and restore
- Restore creates a new draft. It does not silently overwrite the live page.

## 4.8 Shared content

- Testimonials, FAQs, contact details, social links, footer text, SEO defaults, site announcements
- Announcements can be scheduled on or off
- Contact phones in the header come from these settings

## 4.9 Audit log

- Record who changed pages, theme, navigation, media, and settings
- Super Admin can read the log. Others cannot.

## 4.10 Exit check

- A Content Editor can publish a homepage hero change and see it on `/` after refresh.
- A Media Manager can upload but cannot publish pages or read orders.
- Draft preview does not leak onto the public URL.
- Version restore works on a test page.

---

# Phase 5 — Business features

Status: complete. Local CMS store holds albums, videos, live channels/events, products, bookings, enquiries, and orders. Admin managers are enabled under `/admin`. Public catalogue readers prefer the store, then Supabase. Forms write to the store when Supabase is not connected. Users/roles invite needs Supabase; local mode lists the local super admin.

Outcome: galleries, films, live events, products, bookings, and orders are managed in admin and show on the public site when published.

## 5.1 Photography manager

- Categories from section 3.3
- Albums, cover, order, visibility, featured flag
- Photos chosen from the media library
- Featured albums fill the homepage and photography highlights

## 5.2 Videography manager

- Collections and videos
- Title, category, thumbnail, YouTube URL or uploaded file, featured flag
- Public modal plays that source

## 5.3 Live channels

- Seed five channel records with names only: Facebook Live, YouTube Live, Yarl Rip Book, Yarl Events, Yarl Tharisanam
- Admin can edit display name, description, external URL, and visibility
- Leave URLs empty until the owner pastes them

## 5.4 Live event manager

Combine the editors in `08`, `10`, and `11` into one screen:

- List with All, Draft, Live, Upcoming, Ended
- Fields: title, description, thumbnail, start time, channel, Facebook URL, YouTube URL, replay URL, featured flag
- Status: Draft, Upcoming, Live, Ended
- Publish toggle separate from status, so a Live event can stay unpublished
- One event may store more than one broadcast link
- Public page reads only published events

## 5.5 Products

- Separate printing and gift catalogues, shared product tables
- Category, images, description, sizes, materials, variants, optional price, availability, featured flag, enquiry label
- Hidden price means the public card says “Ask for price”
- No payment capture

## 5.6 Bookings and enquiries

- Inbox with filters for service, status, and date
- Status flow: New, Reviewing, Confirmed, Declined, Closed
- Internal notes and optional staff assignment
- WhatsApp link built from the customer phone
- CSV export for roles that are allowed to export
- Reference files stay in a private bucket

## 5.7 Orders

- Create an order from a customer and product lines
- Quantity, price snapshot, payment status, production status, delivery or pickup status, notes
- Status labels are internal workflow, not a payment gateway
- Dashboard order count uses this table

## 5.8 Users and roles

- Super Admin invites users and assigns the five roles
- Permission checks run in server actions and in row-level security
- Hiding a button is not the access control

## 5.9 Exit check

- Publishing an album shows it on `/photography` and, if featured, on the homepage.
- A live event with no URL shows the title and time, not a dead watch button.
- Setting status to Live without a stored URL still does not render a provider badge that implies the stream was verified.
- An Order Manager can update an order and cannot edit the homepage.
- A public visitor cannot read draft events, private files, or order rows.

---

# Phase 6 — Integration

Status: complete. Public pages stay store/API driven. Cache headers and in-process clear on publish. Media is gated to non-deleted library files; private booking uploads stay under `/media/private` and are blocked. `/sitemap.xml` and `/robots.txt` are live. Hero/image blocks resolve media with priority/lazy loading. Locale switch reloads the route; admin editors mark missing Tamil. Booking reference uploads are size/type limited. Lighthouse scores recorded in `phase-6-lighthouse.md` (Performance 24 on local HTTP, Accessibility 93, Best Practices 100, SEO 100).

Outcome: admin publish is the only way content changes the public site, and caches clear safely.

## 6.1 One read path

- Remove any remaining hardcoded public copy except the design-system components themselves.
- Homepage featured strips query published albums, videos, events, and products.

## 6.2 Publish and cache

- The Node API sets cache headers on public page JSON. Publish and unpublish clear that response for the affected routes.
- The cache lives in the Node process, or is skipped when the process is short-lived. It does not depend on a Vercel cache API.
- Theme publish returns the new theme on the next layout request.
- Preview uses the draft revision and a signed-in admin session only.

## 6.3 Media delivery

- Public images use responsive sizes and lazy loading below the hero.
- Hero media is the priority image or video.
- Alt text comes from the media record.

## 6.4 Language

- Switcher reloads the same route in the other locale.
- Navigation, headings, products, and metadata use the locale row.
- Missing Tamil shows English and an admin-only “Tamil missing” mark inside the editor, not on the public page.

## 6.5 Forms and abuse

- Server validation with Zod
- Rate limit enquiry and booking posts
- Honeypot or equivalent spam field
- File type and size limits on reference uploads

## 6.6 SEO

- Per-page title and description from `seo_metadata`
- Open Graph image from a chosen media asset
- Node routes `/sitemap.xml` and `/robots.txt` list only published public routes
- Local business structured data uses verified name, phones, and address only when address is set

## 6.7 Exit check

- Edit in admin, publish, and confirm the public page changes without a redeploy.
- Unpublished media URLs are not reachable anonymously.
- Both locales render. Tamil-missing fields fall back.
- Lighthouse or an equivalent check is run and the numbers are recorded, not claimed.

---

# Phase 7 — Testing

Outcome: core workflows have automated tests, and the visual pass is recorded.

## 7.1 Schema and validation

- Zod tests for each block type and for booking, enquiry, product, and live-event payloads
- Reject oversized files and unknown status values

## 7.2 Authorization

- Tests or SQL checks that anon cannot write, and that each role can only reach its tables
- Content Editor cannot export orders
- Live Event Manager cannot change theme

## 7.3 CMS workflows

- Create page, add hero, save draft, publish, edit, restore an older revision
- Reorder sections and confirm public order

## 7.4 Public behaviour

- Booking and enquiry insert rows and return the review message
- Gallery lightbox opens and closes
- Live, Upcoming, and Ended badges match stored status
- Reduced-motion preference disables the large transitions

## 7.5 Responsive and language

- Screenshot or browser pass at mobile and desktop for home, photography, printing, gifts, live, about, booking, and contact
- Tamil strings do not overflow buttons or the mobile nav

## 7.6 Accessibility and performance

- Keyboard path through header, a form, and the lightbox
- Form errors are announced
- Record LCP and a page-weight note for the homepage
- Fix failures before calling the phase done

## 7.7 Exit check

- Automated test command passes
- A written note lists what was exercised in the browser and any remaining gap

---

# Phase 8 — Deployment

Outcome: the owner can run the site on Vercel first, and the same build can run on another Node.js server without a rewrite. Supabase remains the database.

## 8.1 Environment

- Document every variable: Supabase URL, anon key, service role, site URL, super-admin email, optional analytics and spam keys
- Confirm the service role is not present in client bundles

## 8.2 Database

- Migration order
- How to create the first super admin
- Storage buckets: public media, private enquiry files
- Policies reviewed against section 5.9

## 8.3 Vercel

- Production and preview env for the React build and the Node API
- The Vercel project starts the same Express app exported from `app.ts`
- No build step that requires fake content
- No Vercel-only storage, database, or edge service

## 8.4 Another server

- Document the portable run: install Node.js, set the same environment variables, `npm run build`, `npm start`
- Add a Dockerfile that runs that same command, so a VPS or other host can run one container
- The container serves the public site, the admin UI, and the API on one port
- Confirm a clean machine can open the homepage and the admin login with Vercel removed from the path
- Supabase URL stays in the environment. Moving the website does not move or copy the database

## 8.5 Launch checklist

- Public pages load
- Admin login works
- Upload, draft, publish, and rollback tried once on production
- Phones and WhatsApp match the verified numbers
- Empty sections still look intentional
- Sitemap and robots are live

## 8.6 Exit check

- A new developer can follow the docs and reach a logged-in admin and a published homepage.
- Deployment notes do not contain secrets.

---

## Suggested build order

1. Phase 1 is this document. Start implementation at Phase 2.
2. Finish 2.1 through 2.9 before any page design work.
3. Build 3.1 before 3.2. Later public pages reuse the renderer.
4. After the homepage renders from the database, build admin media, navigation, and the page builder (4.2–4.7) before the rest of the public pages, so those pages are edited rather than recoded.
5. Photography, video, live, and products (Phase 5) come before the integration pass.
6. Testing and deployment stay last, with fixes folded back into the phase that failed.

## Definition of done

The project is done only when all 15 conditions in section 14 of `metapromt.md` are true in the running app, not only described here.
