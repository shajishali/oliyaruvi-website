# Vercel + Supabase — work before deployment

Status: checklist for operator work in the Supabase and Vercel dashboards **before / during** Phase 8.  
Do not put real secrets in this file. Fill values only in `.env`, Vercel env settings, and Supabase.

Current local mode still runs without Supabase (file CMS + optional `ALLOW_LOCAL_ADMIN`). Production needs a real Supabase project and a Vercel project that starts the same Express app from `server/src/app.ts`.

---

## 0. Current project facts

| Item | Value / path |
| --- | --- |
| Monorepo | `web/` (React) + `server/` (Express) |
| Migration | `supabase/migrations/20261113120000_foundation.sql` |
| Env template | `.env.example` |
| Seed admin | `npm run seed:admin` (needs Auth user first) |
| Public media bucket | `media-public` |
| Private booking/enquiry files | `media-private` |
| First host | Vercel |
| Database host | Supabase only (no Vercel DB / Blob / KV) |

---

## 1. Supabase — create and configure the project

### 1.1 Project

- [ ] Create a Supabase project (region close to Sri Lanka / your users).
- [ ] Note the project reference / dashboard URL.
- [ ] Open **Project Settings → API** and copy:
  - Project URL → `SUPABASE_URL` / `VITE_SUPABASE_URL`
  - `anon` `public` key → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
  - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` only (never a `VITE_` var)

### 1.2 Auth

- [ ] **Authentication → Providers**: enable Email.
- [ ] Decide whether public sign-up is off (recommended: disable open sign-up; invite staff only).
- [ ] **Authentication → URL configuration**
  - Site URL = production site URL (Vercel domain or custom domain)
  - Redirect URLs include:
    - `https://<production-domain>/admin/login`
    - `https://<preview-domain-pattern>/admin/login` if you use Preview deploys
    - `http://localhost:5173/admin/login` and `http://localhost:4000/admin/login` for local
- [ ] Create the first Auth user for the owner (email + password) in **Authentication → Users**.
  - The seed script does **not** create a password. It only grants `super_admin` to an email that already exists.

### 1.3 Database migration

- [ ] Apply the foundation migration in order (only one file today):
  1. `supabase/migrations/20261113120000_foundation.sql`
- [ ] Preferred: Supabase CLI linked to the project, then `supabase db push` (or run the SQL in the SQL editor once).
- [ ] Confirm after apply:
  - Tables exist (`pages`, `media_assets`, `bookings`, `live_events`, `roles`, …)
  - RLS is enabled on content tables
  - Roles rows exist: `super_admin`, `content_editor`, `media_manager`, `order_manager`, `live_event_manager`
  - Site settings seed has verified phones / business name only
  - Storage buckets `media-public` and `media-private` exist

### 1.4 Storage

Created by the migration; still verify in the dashboard:

| Bucket | Public? | Purpose | Mime / size (migration) |
| --- | --- | --- | --- |
| `media-public` | Yes | Library images/videos | jpeg/png/webp/mp4 · up to 200 MB |
| `media-private` | No | Booking/enquiry reference files | jpeg/png/webp/pdf · up to 10 MB |

- [ ] Buckets visible under **Storage**
- [ ] Policies present for public read of non-deleted `media-public` objects, media-manager write, live-manager insert under `live-events/`, order-manager private read
- [ ] Do not create Vercel Blob or any second media store

### 1.5 First super admin

- [ ] Set `SEED_SUPER_ADMIN_EMAIL` in local `.env` to the Auth user email
- [ ] Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Run: `npm run seed:admin`
- [ ] Expect: `Granted super_admin to <email>.`
- [ ] If it says no Auth user matches: create the user in Supabase Auth first, then re-run
- [ ] Sign in at `/admin/login` with that email (local password login must stay off in production)

### 1.6 Optional later (not required to go live)

- [ ] Analytics provider keys
- [ ] Map embed / spam protection keys
- [ ] Custom SMTP for Auth emails
- [ ] Facebook / YouTube channel URLs (entered in CMS, not env)

---

## 2. Local `.env` before you connect Supabase

Copy from `.env.example`. Fill, never commit.

### Server (Node)

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | Local | Default `4000` |
| `PUBLIC_SITE_URL` | Yes | Local: `http://localhost:4000`. Production: real HTTPS origin |
| `SUPABASE_URL` | Yes for prod | Project URL |
| `SUPABASE_ANON_KEY` | Yes for prod | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for prod | Server only: invites, private signing, seed |
| `SEED_SUPER_ADMIN_EMAIL` | Seed only | Must already exist in Auth |
| `ALLOW_LOCAL_ADMIN` | Dev only | Must be unset / `0` on Vercel |
| `LOCAL_ADMIN_PASSWORD` | Dev only | Never on Vercel |

### Browser (Vite build-time)

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes for prod | Same as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Yes for prod | Same as anon key — **not** service role |
| `VITE_API_URL` | Dev only | Local: `http://localhost:4000`. Production / Vercel: **leave empty** so the app calls same-origin `/api` |

### Safety checks

- [ ] No `VITE_` variable contains the service-role key
- [ ] `.env` is gitignored
- [ ] After build, search the web bundle for the service-role substring — it must not appear

---

## 3. Vercel — create and configure the project

Phase 8 will wire `vercel.json` / the serverless entry that imports `createApp` from `server/src/app.ts`. Do this dashboard work now so deploy can plug in.

### 3.1 Project

- [ ] Create a Vercel project linked to `https://github.com/shajishali/oliyaruvi-website` (or the current remote)
- [ ] Framework: treat as a Node monorepo, not a static Vite-only site
- [ ] Root directory: repository root (workspaces `web` + `server`)
- [ ] Confirm the project will run the **same** Express app exported from `app.ts` (no separate Edge API rewrite of business logic)

### 3.2 Environment variables

Set for **Production** (and **Preview** if you want preview admin/API):

| Variable | Production | Preview |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | `https://<your-domain>` | Preview URL or leave until custom domain exists |
| `SUPABASE_URL` | Same as local | Same project (or a staging project) |
| `SUPABASE_ANON_KEY` | Same | Same / staging |
| `SUPABASE_SERVICE_ROLE_KEY` | Same | Prefer a staging project; never expose in logs |
| `VITE_SUPABASE_URL` | Same URL | Same |
| `VITE_SUPABASE_ANON_KEY` | Anon only | Anon only |
| `VITE_API_URL` | **empty** | **empty** |
| `ALLOW_LOCAL_ADMIN` | **unset** | **unset** |
| `LOCAL_ADMIN_PASSWORD` | **unset** | **unset** |
| `SEED_SUPER_ADMIN_EMAIL` | Optional; seed from CI/local, not required on Vercel runtime | — |
| `PORT` | Usually set by Vercel; do not hard-require `4000` | — |

- [ ] Mark `SUPABASE_SERVICE_ROLE_KEY` as sensitive / encrypted
- [ ] Do not add Vercel KV, Blob, Postgres, Edge Config, or Edge Middleware that replaces Express

### 3.3 Build and start (target shape for Phase 8)

Expected portable commands (same as a plain Node host):

```bash
npm install
npm run build
npm start
```

- [ ] Build must not invent fake content or depend on a filled local `.data` folder
- [ ] Production serves public site + `/admin` + `/api` from one app
- [ ] After Phase 8 adds the Vercel adapter, redeploy and confirm `/api/health` returns `{ ok: true }`

### 3.4 Domains and Auth URLs

- [ ] Attach production domain in Vercel (or use `*.vercel.app` temporarily)
- [ ] Set `PUBLIC_SITE_URL` to that exact origin (no trailing slash mismatch with sitemap/canonical)
- [ ] Mirror the same origin in Supabase Auth Site URL / redirect allow-list
- [ ] After go-live, confirm `/robots.txt` and `/sitemap.xml` use the production host

### 3.5 What Vercel must not own

- [ ] No Vercel database
- [ ] No Vercel file/blob store for media
- [ ] No Edge-only rewrite of CMS or auth
- Supabase stays the source of truth when the site later moves to a VPS / Docker host

---

## 4. Ordered work list (do in this sequence)

1. [ ] Create Supabase project; copy URL + anon + service role  
2. [ ] Configure Auth (email, disable open sign-up if desired, redirect URLs)  
3. [ ] Create owner Auth user  
4. [ ] Apply `20261113120000_foundation.sql`  
5. [ ] Verify tables, RLS, roles seed, buckets  
6. [ ] Fill local `.env` (disable reliance on local admin for the Supabase path)  
7. [ ] Run `npm run seed:admin`  
8. [ ] Local smoke: `npm run build` → `npm start` → `/` and `/admin/login` with Supabase user  
9. [ ] Create Vercel project linked to GitHub  
10. [ ] Set Vercel env vars (no local-admin, empty `VITE_API_URL`)  
11. [ ] Finish Phase 8 adapter (`vercel.json` / serverless entry) then deploy  
12. [ ] Production smoke: homepage, admin login, upload, draft, publish, rollback once  
13. [ ] Confirm phones / WhatsApp, empty sections, sitemap, robots  

---

## 5. Production smoke checklist (after first deploy)

- [ ] `/` loads with brand and verified phones `0773928215` / `0777241958`
- [ ] `/admin/login` accepts the Supabase user; local-admin login is unavailable
- [ ] Upload media to `media-public`
- [ ] Edit a page draft → publish → public page updates
- [ ] Restore / rollback an older revision once
- [ ] Booking or enquiry inserts a row (RPC + RLS path)
- [ ] Private reference file is not anonymously readable
- [ ] `/sitemap.xml` and `/robots.txt` are live on the production host
- [ ] Service-role key still absent from client JS

---

## 6. Moving off Vercel later (do not do now)

When you leave Vercel, you only need:

1. Node.js on the new host  
2. The same environment variables  
3. `npm run build` && `npm start` (or the Dockerfile from Phase 8)  

You do **not** copy or move the Supabase database. Point `SUPABASE_*` at the same project.

---

## 7. Operator notes / scratch pad

Use this section while you work in the dashboards (no secrets):

| Item | Your note |
| --- | --- |
| Supabase project name / ref | |
| Supabase region | |
| Production domain | |
| Vercel project name | |
| Owner admin email (no password here) | |
| Migration applied on (date) | |
| Seed admin run on (date) | |
| First successful prod deploy (date) | |
| Open issues | |
