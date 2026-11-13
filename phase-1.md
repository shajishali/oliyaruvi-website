# Phase 1 — Planning decisions

Status: complete. No application code belongs in this phase.

Sources: `metapromt.md`, `phases.md`, and the 13 files in `photoes/`.

Phase 2 implements these decisions. It does not reopen them unless a later check fails.

---

## 1. Repository inventory

Inspected `d:\projects\oliyaruvi website` before writing this file.

| Path | What it is |
| --- | --- |
| `metapromt.md` | Product and engineering brief |
| `phases.md` | Phase and subphase plan |
| `photoes/` | 13 reference screens |
| `phase-1.md` | This decision record |

There is no frontend, backend, database migration, or package manifest yet.

---

## 2. What the screens may decide

The mockups set layout, colour, and navigation. They do not set business facts. Generated people, staff, milestone years, money, visitor counts, event names, and channel URLs stay out of the database until an admin enters real ones.

| File | Use it for | Do not treat as real |
| --- | --- | --- |
| `01_Homepage_Mobile_View.jpg` | Mobile header, stacked service cards, bottom WhatsApp and call bar | Hero portrait, Tamil marketing lines beyond the verified business name |
| `02_Homepage_Desktop_View.jpg` | Desktop hero, 32-year mark, four service cards, gold buttons | Browser domain `oliyaruvistudio.lk`, wedding portrait |
| `03_Photography_Portfolio_Page.jpg` | Filter chips, category cards, highlights strip | The sample photographs and album covers |
| `04_Printing_Services_Page.jpg` | Printing hero, quality points, service cards, quote button | Product photos, any printed price |
| `05_Contact_and_Orders_Page.jpg` | Two-column contact layout and form fields | Hours and the map pin. Hours may be entered only after the owner confirms them. The mockup shows Monday–Saturday 8:30–7:00 and Sunday 9:00–1:00 as a design, not a confirmed schedule. |
| `06_About_Us_Page.jpg` | Story, what we do, team, milestones, and location layout | The 1994, 2005, 2015, 2020, and 2026 timeline. The team faces and names. |
| `07_Custom_Gifts_Page.jpg` | Gift hero and product grid | Mug, medal, and gift photos as if they were stock the studio has already made |
| `08_Live_Streaming_and_Admin_Concept_A.jpg` | Live player column, channel chips, event editor fields | Chart totals, sample events, stream URLs |
| `09_Live_Streaming_and_Admin_Concept_B.jpg` | Upcoming and past event rows, publish toggle, quick actions | 248 photos, 56 videos, 12 events, 76 orders, 28 enquiries, the visits chart |
| `10_Live_Streaming_and_Admin_Concept_C.jpg` | Order and enquiry counts beside a live-event list | Revenue of Rs 186,500 and the sample orders |
| `11_Live_Streaming_and_Admin_Concept_D.jpg` | Split list and editor for live events, recent-order statuses | Visitor series and sample customers |
| `12_Admin_CMS_Visual_Page_Builder.jpg` | Admin rail, page builder, desktop and mobile preview, hero editor tabs | 4,892 visits, 68 enquiries, 17 bookings, 25 orders, the sample orders and the live badge on a fictional temple event |
| `13_All_Public_Website_Pages_Overview.jpg` | Check that home, photography, videography, live, printing, gifts, about, booking, and contact all exist | Every photograph and every sample event on those panels |

Dashboard charts are allowed later only when they sum real rows. An empty chart is the correct state when there are no rows. Visitor analytics stays “Not connected” until a provider is configured.

---

## 3. Architecture

```text
Browser (React)
  public pages, admin UI, forms
        |
        |  HTTPS, same origin, JSON /api
        v
Node.js (Express)
  validation, roles, cache headers, sitemap
        |
        |  user JWT for content
        |  service role only for the three jobs below
        v
Supabase
  Postgres + Auth + Storage
```

| App | Folder | Stack |
| --- | --- | --- |
| Frontend | `web/` | React, TypeScript, Vite, React Router, Tailwind |
| Backend | `server/` | Node.js, Express, TypeScript, Zod |
| Database | `supabase/migrations/` | Postgres, Auth, Storage, row-level security |

The React app calls `/api`. In development, Vite proxies `/api` to the Node port. In production, Express serves the built React files and the API on one port, so a VPS and Vercel use the same `app.ts`.

`server/src/app.ts` exports the Express app and does not listen. `server/src/server.ts` is the only file that calls `listen`.

### Auth and the service role

The browser may hold the Supabase URL and the anon key, because sign-in needs them. It must never hold the service-role key.

For each admin request, the Node server creates a Supabase client with that user's access token. Row-level security then sees `auth.uid()` and the user's roles.

The service-role client is imported only by:

- the user-invite path
- signing a private file URL
- the migration and seed script

### Hosting

Vercel is the first host. The application does not call Vercel KV, Blob, Postgres, Edge Config, or Edge-only middleware. A later server needs Node.js, the build, and the same environment variables. Supabase stays the database when the website moves.

### Rendering

Public section components render in React from published page JSON. Express replaces the title, description, canonical URL, Open Graph tags, and business structured data in `index.html` for each public route. Phase 6 measures first paint. If the page is too empty for a crawler, server-rendered text is added then, without changing the host model.

### Cache

Public JSON responses carry cache headers and a `content_version` from site settings. Publish increments that version and drops the in-memory copy for the changed route. The cache is not a Vercel API. On a host that runs many short-lived processes, the headers and the version still keep pages correct.

### Language

Locales are `en` and `ta` only. Tamil fields may be empty. The public site falls back to English. The admin editor shows “Tamil missing” on empty Tamil fields. No machine translation is stored as approved copy.

### Folder map for Phase 2

```text
web/src/
  main.tsx
  app/router.tsx
  pages/public/
  pages/admin/
  components/ui/
  components/public/
  components/admin/
  components/blocks/
  lib/api.ts
  lib/cms/
  styles/tokens.css
server/src/
  app.ts
  server.ts
  routes/
  middleware/
  db/
  auth/
  media/
  cms/
  schemas/
supabase/migrations/
```

---

## 4. Frozen routes

### Public

| Route | Page slug in the database |
| --- | --- |
| `/` | `home` |
| `/photography` | `photography` |
| `/videography` | `videography` |
| `/printing` | `printing` |
| `/gifts` | `gifts` |
| `/live` | `live` |
| `/about` | `about` |
| `/booking` | `booking` |
| `/contact` | `contact` |
| `/portfolio` | `portfolio` |

`/portfolio` is a real CMS page. Its first published hero links visitors to photography. The owner can later give it its own sections.

Album and product detail routes, added when those records exist:

| Route | Reads |
| --- | --- |
| `/photography/:albumSlug` | One visible album |
| `/printing/:productSlug` | One available printing product |
| `/gifts/:productSlug` | One available gift product |

### Admin

These match the rail in `12_Admin_CMS_Visual_Page_Builder.jpg`, plus the FAQ and audit screens the brief requires.

| Route | Screen |
| --- | --- |
| `/admin/login` | Sign in |
| `/admin` | Dashboard |
| `/admin/pages` | All pages |
| `/admin/pages/:pageId` | Visual page builder |
| `/admin/navigation` | Header and footer menu |
| `/admin/media` | Media library |
| `/admin/photography` | Albums |
| `/admin/photography/:albumId` | Photographs in one album |
| `/admin/videography` | Videos |
| `/admin/live` | Live events |
| `/admin/live/events/:eventId` | Edit one event |
| `/admin/live/channels` | Facebook Live, YouTube Live, Yarl Rip Book, Yarl Events, Yarl Tharisanam |
| `/admin/printing` | Printing products |
| `/admin/gifts` | Custom gifts |
| `/admin/bookings` | Booking inbox |
| `/admin/enquiries` | Contact and product enquiries |
| `/admin/orders` | Orders |
| `/admin/orders/:orderId` | One order |
| `/admin/testimonials` | Testimonials |
| `/admin/faqs` | FAQs |
| `/admin/contact` | Phones, address, hours, map, social links |
| `/admin/seo` | Default and per-page metadata |
| `/admin/theme` | Theme manager |
| `/admin/analytics` | Real analytics, or a clear “Not connected” state |
| `/admin/users` | Users and roles |
| `/admin/settings` | Site settings |
| `/admin/audit` | Audit log |

The Homepage item in the mockup rail is a shortcut to `/admin/pages/:pageId` for the home page, not a second editor. The top search box in that mockup is deferred. It is not part of Phase 2.

### API

Public:

| Method | Path |
| --- | --- |
| GET | `/api/public/site` |
| GET | `/api/public/theme` |
| GET | `/api/public/navigation` |
| GET | `/api/public/pages/:slug` |
| GET | `/api/public/albums` |
| GET | `/api/public/albums/:slug` |
| GET | `/api/public/videos` |
| GET | `/api/public/live-events` |
| GET | `/api/public/products` |
| GET | `/api/public/products/:slug` |
| GET | `/api/public/testimonials` |
| GET | `/api/public/faqs` |
| POST | `/api/public/bookings` |
| POST | `/api/public/enquiries` |
| GET | `/sitemap.xml` |
| GET | `/robots.txt` |

Admin resources follow one pattern: list, read, create, update, and soft delete under `/api/admin/<resource>`. Extra actions are `POST /api/admin/pages/:id/publish`, `POST /api/admin/pages/:id/unpublish`, `POST /api/admin/pages/:id/restore`, and `POST /api/admin/pages/:id/sections/reorder`. The same publish and reorder actions exist for the theme.

Reference files for a booking are uploaded with `POST /api/public/bookings/:id/files` only in the request that just created that booking, using a one-time token returned by the create call. They go to the private bucket.

---

## 5. Roles

| Key | Name |
| --- | --- |
| `super_admin` | Super Admin |
| `content_editor` | Content Editor |
| `media_manager` | Media Manager |
| `order_manager` | Order Manager |
| `live_event_manager` | Live Event Manager |

A user may hold more than one role. Super Admin passes every check. A signed-in user with no role sees no admin data.

| Area | Super Admin | Content Editor | Media Manager | Order Manager | Live Event Manager |
| --- | --- | --- | --- | --- | --- |
| Pages, navigation, theme, SEO, settings, testimonials, FAQs | Yes | Yes | No | No | No |
| Media library | Yes | Pick existing | Upload, replace, delete | No | Upload into the live-events folder and pick existing |
| Photography, videography, products | Yes | Yes | No | No | No |
| Live channels and events | Yes | No | No | No | Yes |
| Customers, bookings, enquiries, orders, export | Yes | No | No | Yes | No |
| Users, roles, audit log | Yes | No | No | No | No |

Hiding a button is not the control. Express middleware and row-level security both check the table above.

---

## 6. Block types

Shared section columns: `block_type`, `sort_order`, `is_visible`, `style`, `animation`, and `content`.

Text that visitors read sits in `content.en` and `content.ta`. Media ids, links, and flags sit once on `content`, shared by both languages.

| `block_type` | Shared fields | Per language |
| --- | --- | --- |
| `hero` | `mediaType` (`image`, `video`, or `slider`), `mediaIds`, `autoplay`, `mute`, `loop`, `primaryHref`, `secondaryHref` | `heading`, `subheading`, `body`, `primaryLabel`, `secondaryLabel` |
| `video_hero` | `sourceType` (`upload` or `youtube`), `mediaId`, `youtubeUrl`, `posterId`, `mute`, `loop` | `heading`, `subheading` |
| `image_slider` | `autoplay`, `intervalMs`, `slides[]` of `{ mediaId, href }` | each slide: `heading` |
| `text` | | `heading`, `body` |
| `image` | `mediaId`, `href` | `caption` |
| `gallery` | `albumId` or `mediaIds`, `layout` (`masonry`) | `heading` |
| `video_gallery` | `collectionId` or `videoIds` | `heading` |
| `services` | `items[]` of `{ href, icon }` | each item: `title`, `text` |
| `product_grid` | `catalogue` (`printing` or `gifts`), `categoryId`, `featuredOnly`, `limit` | `heading` |
| `live_events` | `mode` (`featured`, `upcoming`, or `past`), `limit` | `heading` |
| `testimonials` | `featuredOnly`, `limit` | `heading` |
| `statistics` | `items[]` of `{ valueSource, settingKey, literalValue }`. `settingKey` may only be `experience_years` in the seed. | each item: `label` |
| `faq` | `limit` | `heading` |
| `contact_form` | `purpose` (`contact` or `booking`), `showPhone`, `showWhatsapp`, `showMap`, `showHours` | `heading`, `intro` |
| `cta` | `href` | `heading`, `body`, `buttonLabel` |
| `custom_layout` | `columns` (1, 2, or 3). Each column has an optional `mediaId`. | each column: `heading`, `body` |

`custom_layout` is not a nested page builder. A column is a heading, a paragraph, and an optional image.

`style` holds only token overrides: background, spacing, and alignment. `animation` holds `none`, `fade`, or `rise`. Public motion still respects `prefers-reduced-motion`.

Zod schemas for these objects live in `server/src/schemas` and are the only accepted section payloads.

---

## 7. Database

Primary keys are `uuid` values from `gen_random_uuid()`, except `site_settings.id`, which is the integer `1`. Timestamps are `timestamptz`. Soft-deleted rows use `deleted_at` and stay out of public queries.

English and Tamil text are columns ending in `_en` and `_ta` on business records. Page sections use the JSON locales in section 6 instead of a translation child table.

### Identity

`profiles`

- `id` references `auth.users` and is the primary key
- `full_name`, `phone`
- A trigger inserts a profile when an auth user is created

`roles`

- `key` unique, one of the five keys in section 5
- `name`

`user_roles`

- Primary key `(user_id, role_id)`
- `user_id` references `profiles`
- `role_id` references `roles`
- `granted_by` references `profiles`
- `granted_at`

`has_role(uid, role_key)` is a security-definer function used by policies. `is_super_admin(uid)` is the same check for `super_admin`.

### Site

`site_settings` — one row, `id = 1`

- Verified seed: `business_name`, `business_name_ta`, `location_en`, `location_ta`, `phone_primary` `0773928215`, `phone_secondary` `0777241958`, `whatsapp_number` `0773928215`, `experience_years` `32`
- Left null until an admin saves them: `address_en`, `address_ta`, `map_url`, `latitude`, `longitude`, `hours`
- `social_links` defaults to `[]`
- `announcement_en`, `announcement_ta`, `announcement_enabled` default off
- `content_version` integer, starts at `1`
- `updated_at`, `updated_by`

`theme_settings`

- `status` is `draft` or `published`
- `tokens` jsonb for the colour, type, radius, and spacing variables
- `header_variant`, `footer_variant`, `button_variant`
- `published_at`, `updated_by`
- At most one row may have `status = 'published'`

Seed tokens: background `#0B0B0D`, surface `#17171B`, gold `#D6AC57`, light gold `#F3D58C`, maroon `#651C2A`, text `#F7F3EB`, muted `#B8B1A8`.

### Pages

`pages`

- `slug` unique where `deleted_at` is null
- `created_by` references `profiles`
- `deleted_at`

`page_revisions`

- `page_id` references `pages`
- `version` integer
- `state` is `draft`, `published`, or `archived`
- Unique `(page_id, version)`
- At most one `draft` and one `published` revision per page

`page_sections`

- `revision_id` references `page_revisions` and cascades on delete
- `block_type`, `sort_order`, `is_visible`
- `content`, `style`, `animation` jsonb
- Unique `(revision_id, sort_order)`

The public site reads the `published` revision only. Saving the builder writes the `draft` revision. Publish archives the current published revision, marks the draft published, then clones those sections into a new draft so the next edit does not change the live page. Restore copies an archived revision into the current draft and leaves the live revision in place.

`seo_metadata`

- `page_id` nullable, references `pages`. Null means the site default.
- `locale` is `en` or `ta`
- `title`, `description`
- `og_media_id` references `media_assets`
- Unique `(page_id, locale)` for page rows, and unique `locale` where `page_id` is null

### Navigation

`navigation_menus`

- `key` unique: `header` or `footer`
- The mobile drawer uses the header items

`navigation_items`

- `menu_id` references `navigation_menus`
- `parent_id` references `navigation_items`, for one level of dropdown
- `label_en`, `label_ta`, `href`, `link_type` (`internal` or `external`)
- `sort_order`, `is_visible`, `open_in_new_tab`

Seed header items, in order: Home, About, Photography, Videography, Printing, Custom Gifts, Live, Portfolio, Contact. Footer repeats the service links. Tamil labels stay empty until edited.

### Media

`media_assets`

- `bucket` is `media-public` or `media-private`
- `storage_path`, unique with `bucket`
- `folder`, `kind` (`image`, `video`, or `file`)
- `mime_type`, `byte_size`, `width`, `height`, `duration_seconds`
- `alt_en`, `alt_ta`, `title`
- `uploaded_by` references `profiles`
- `deleted_at`

`media_references`

- `media_id` references `media_assets`
- `entity_type`, `entity_id`
- Unique `(media_id, entity_type, entity_id)`

Delete is refused while a reference exists. Replacing a file writes a new storage path and keeps the same row id so existing references remain valid.

Buckets:

- `media-public` — published photos and videos. Anonymous read of objects that belong to a published, visible record.
- `media-private` — booking reference files. No anonymous read. Order Manager and Super Admin open them through a short-lived signed URL.

Allowed public uploads: JPEG, PNG, WebP, and MP4. Size limits are enforced in the Node API before storage: 15 MB for an image, 200 MB for a video. Private reference files accept JPEG, PNG, WebP, and PDF up to 10 MB.

### Photography and video

`photo_categories`

- `slug` unique, `sort_order`, `is_visible`
- `name_en`, `name_ta`

Seed slugs: `wedding`, `engagement`, `pre_wedding`, `birthday`, `family`, `temple`, `school`, `portrait`, `other`.

`photo_albums`

- `category_id` references `photo_categories`
- `slug` unique, `cover_media_id`, `sort_order`, `is_visible`, `is_featured`
- `title_en`, `title_ta`, `description_en`, `description_ta`
- `deleted_at`

`photographs`

- `album_id` references `photo_albums`
- `media_id` references `media_assets`
- `sort_order`, `is_visible`
- `caption_en`, `caption_ta`

`video_categories` uses the same shape. Seed slugs: `wedding`, `highlight`, `pre_wedding`, `birthday`, `temple`, `promotional`, `event`.

`video_collections`

- `category_id`, `slug`, `sort_order`, `is_visible`
- `title_en`, `title_ta`, `description_en`, `description_ta`

`videos`

- `collection_id` references `video_collections`
- `source_type` is `youtube` or `upload`
- `youtube_url` required when the source is YouTube, `media_id` required when the source is an upload
- `thumbnail_media_id`, `duration_seconds`, `sort_order`, `is_featured`, `is_visible`
- `title_en`, `title_ta`, `description_en`, `description_ta`

No album, photograph, or video is seeded.

### Live

`live_channels`

- `key` unique: `facebook_live`, `youtube_live`, `yarl_rip_book`, `yarl_events`, `yarl_tharisanam`
- `kind` is `platform` for the first two and `identity` for the Yarl channels
- `name_en`, `name_ta`, `description_en`, `description_ta`
- `external_url` null until an admin pastes one
- `sort_order`, `is_visible`

`live_events`

- `channel_id` references `live_channels`
- `thumbnail_media_id`
- `starts_at`, `ends_at`
- `status` is `draft`, `upcoming`, `live`, or `ended`
- `status_source` is `manual` or `provider`. Seed and the first release use `manual` only.
- `is_published` default false
- `is_featured` default false
- `replay_url`
- `title_en`, `title_ta`, `description_en`, `description_ta`
- `deleted_at`

The public site loads rows where `is_published` is true, `deleted_at` is null, and `status` is not `draft`. A Live badge renders only when `status` is `live`. When `status_source` is `manual`, the badge text is “Live · set by studio”. No event is seeded, so the public page starts with an empty upcoming list.

`event_broadcast_links`

- `event_id` references `live_events` and cascades on delete
- `platform` is `facebook`, `youtube`, or `other`
- `url`, `label_en`, `label_ta`, `sort_order`

A missing URL means the public card does not render that watch button.

### Products

`product_categories`

- `catalogue` is `printing` or `gifts`
- `slug`, unique together with `catalogue`
- `sort_order`, `is_visible`
- `name_en`, `name_ta`, `description_en`, `description_ta`

Printing seed slugs: `photo_prints`, `passport_id`, `wedding_albums`, `banners`, `flex`, `cloth_banners`, `stickers`, `large_format`, `frames`, `name_boards`, `other`.

Gift seed slugs: `mugs`, `phone_covers`, `medals`, `trophies`, `mementos`, `crystal`, `frames`, `keychains`, `other`.

Category names are the English service names. Tamil names stay empty. No product rows are seeded, and no price is invented.

`products`

- `category_id` references `product_categories`
- `slug` unique, `sort_order`, `is_featured`, `is_available`, `show_price` default false
- `name_en`, `name_ta`, `description_en`, `description_ta`
- `enquiry_label_en`, `enquiry_label_ta`
- `deleted_at`

`product_media`

- Primary key `(product_id, media_id)`
- `sort_order`

`product_variants`

- `product_id` references `products` and cascades on delete
- `size`, `material`, `price_lkr` nullable numeric
- `name_en`, `name_ta`, `is_available`, `sort_order`

When `show_price` is false, or every variant price is null, the public card says “Ask for price”.

### Customers and work

`customers`

- `full_name`, `phone`, `email`
- Index on `phone`

A public form finds or creates a customer by phone. It does not expose other customers.

`bookings`

- `customer_id` references `customers`
- `service`, `event_date`, `location`, `requirements`
- `status`: `new`, `reviewing`, `confirmed`, `declined`, `closed`
- `assigned_to` references `profiles`
- Success copy says the studio will review the request

`booking_notes`

- `booking_id`, `author_id`, `body`, `created_at`

`booking_files`

- `booking_id`, `media_id` in the private bucket

`enquiries`

- `customer_id`, `product_id` nullable
- `source`: `contact`, `product`, or `service`
- `service`, `details`
- Same status values and `assigned_to` as bookings

`enquiry_notes` matches `booking_notes`.

`orders`

- `order_number` unique, generated by the server
- `customer_id`
- `payment_status`: `unpaid`, `partial`, `paid`, `waived`
- `production_status`: `pending`, `in_production`, `ready`, `completed`, `cancelled`
- `fulfillment_type`: `pickup` or `delivery`
- `fulfillment_status`: `pending`, `ready`, `out_for_delivery`, `picked_up`, `delivered`, `cancelled`
- `internal_notes`, `created_by`

There is no payment gateway in this schema.

`order_items`

- `order_id` cascades on delete
- `product_id` and `variant_id` nullable, so a later product edit does not rewrite history
- `name_snapshot`, `variant_snapshot`
- `quantity` greater than 0
- `unit_price_lkr` numeric, stored at the time of the order

### Other content

`testimonials`

- `person_name`, `location_label`, `quote_en`, `quote_ta`
- `media_id`, `is_visible`, `is_featured`, `sort_order`
- None are seeded

`faqs`

- `question_en`, `question_ta`, `answer_en`, `answer_ta`
- `sort_order`, `is_visible`
- None are seeded

`audit_logs`

- `actor_id`, `action`, `entity_type`, `entity_id`
- `summary`, `metadata` jsonb, `created_at`
- Insert only. The API does not offer update or delete.

`form_rate_events`

- `ip_hash`, `form_key` (`booking` or `enquiry`), `created_at`
- The raw IP address is not stored
- Booking and enquiry posts allow 5 events per hash per form in 10 minutes
- This table is what makes the limit work on Vercel and on a single Node server

### Indexes

- `pages (slug)` where not deleted
- `page_revisions (page_id, state)`
- `page_sections (revision_id, sort_order)`
- `navigation_items (menu_id, parent_id, sort_order)`
- `media_assets (folder)` where not deleted
- `photo_albums (category_id, is_visible, is_featured)`
- `photographs (album_id, sort_order)`
- `videos (collection_id, is_featured)`
- `live_events (is_published, status, starts_at)`
- `products (category_id, is_available)`
- `bookings (status, created_at)`
- `enquiries (status, created_at)`
- `orders (created_at)`
- `audit_logs (created_at)`
- `form_rate_events (ip_hash, form_key, created_at)`

### Row-level security

Anonymous and authenticated users without a staff role may select only:

- the singleton site settings, excluding nothing secret because this table has no secrets
- the published theme
- visible navigation items
- published page revisions and their visible sections
- SEO rows for those pages, plus site defaults
- visible categories, albums, photographs, collections, and videos
- visible channels, and live events that are published and not draft
- visible categories and available products, their media, and their variants
- visible testimonials and FAQs
- public media objects

They may insert into `customers`, `bookings`, `enquiries`, `booking_files`, and `form_rate_events` only through the checks above. They cannot select bookings, enquiries, orders, notes, customers, private media, audit logs, drafts, or user roles.

Staff policies follow section 5. Super Admin policies cover all staff tables. Content Editor policies stop at customer, booking, enquiry, and order tables. Order Manager policies cover those customer tables and stop at pages, theme, and live events. Live Event Manager policies cover channels, events, broadcast links, and media in the live-events folder.

The service role bypasses these policies, which is why application code uses it only for the three jobs in section 3.

---

## 8. First seed

Phase 2 may insert only this:

- the five roles
- the site settings row with the verified facts, null hours, null map, and empty social links
- one published theme row using the palette in section 7
- the ten pages, each with one published revision and one draft clone
- header and footer navigation
- photo, video, and product category names
- the five live channels with null URLs
- site SEO title “Oliyaruvi Digital Colour Lab” and a one-sentence description that names Nelliady and the five services

Home starts with these sections: `hero`, `services`, `statistics` bound to `experience_years`, `gallery`, `video_gallery`, `live_events`, `product_grid` for printing, `product_grid` for gifts, `testimonials`, and `contact_form`. The hero heading is the business name in both languages. The English subheading is “Photography, videography, printing, and custom gifts in Nelliady.” Tamil subheading stays empty.

The other pages start with a `hero` and the one block that matches the page: gallery, video gallery, product grid, live events, text, or contact form. About also gets an empty `custom_layout` for the story. Team and milestone lists stay empty.

Starter English headings are labels the owner can replace. They are not stories, dates, or claims about staff.

The seed does not create a password. If `SEED_SUPER_ADMIN_EMAIL` matches an existing Auth user, the seed grants `super_admin`. Otherwise it does nothing and the operator invites that email later.

---

## 9. Credentials

Required before Phase 2 can talk to a real database:

| Variable | Where it lives |
| --- | --- |
| `SUPABASE_URL` | Node server |
| `SUPABASE_ANON_KEY` | Node server |
| `SUPABASE_SERVICE_ROLE_KEY` | Node server only |
| `PUBLIC_SITE_URL` | Node server |
| `PORT` | Node server. Local default `4000` |
| `SEED_SUPER_ADMIN_EMAIL` | Seed script only |
| `VITE_SUPABASE_URL` | Browser, same project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser |

`VITE_API_URL` is empty in production so the app calls `/api` on the same origin. In development it is `http://localhost:4000`.

Not required for Phase 2, and not invented:

- Vercel project, needed only in Phase 8
- analytics key
- map provider key
- spam-provider key
- Facebook or YouTube channel URLs
- a live-status provider
- a payment provider

---

## 10. Exit check

| Check | Result |
| --- | --- |
| Repository inspected and contains no application code | Pass. Root has the brief, the phase plan, this file, and `photoes/`. |
| All 13 screens named, with what each may and may not decide | Pass. Section 2. |
| Public routes, admin routes, and API routes frozen | Pass. Section 4. |
| Five roles and the permission matrix frozen | Pass. Section 5. |
| Sixteen block types and their fields frozen | Pass. Section 6. |
| Tables, relations, indexes, and row-level security written before any migration | Pass. Section 7. |
| Credentials and the things that must stay unconfigured | Pass. Section 9. |
| Mockup-only facts kept out of the seed | Pass. Sections 2 and 8. |

Phase 2 is the next phase.
