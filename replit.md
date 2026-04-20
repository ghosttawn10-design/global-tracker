# GlobalTrack Logistique

A premium full-stack logistics shipment tracking platform with real-time map tracking, admin dashboard, and global operations overview.

## Architecture

**Monorepo** managed with pnpm workspaces.

### Artifacts
- **`artifacts/globaltrack`** — React 18 + Vite frontend (public + admin UI)
- **`artifacts/api-server`** — Express.js REST API backend

### Shared Libraries
- **`lib/db`** — Drizzle ORM schema + Postgres connection + seed script
- **`lib/api-spec`** — OpenAPI spec (orval codegen with post-gen patch script)
- **`lib/api-zod`** — Generated Zod validation schemas
- **`lib/api-client-react`** — Generated React Query hooks (from Orval)
- **`lib/object-storage-web`** — Uppy-based object storage upload component (template)

## Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Leaflet maps, React Query (TanStack), Wouter routing, shadcn/ui
- **Backend**: Express.js, Drizzle ORM, PostgreSQL, Zod validation, nodemailer (SMTP)
- **Storage**: Replit Object Storage (GCS-backed) for logo + hero image uploads
- **DB**: Drizzle Kit schema push — run `pnpm --filter @workspace/db run push` to sync
- **Seed**: `pnpm --filter @workspace/db run seed` — inserts testimonials + demo shipments + default settings (idempotent)

## Design System

- **Color Palette**: Deep navy background (`hsl(222 47% 7-10%)`) + Blue primary (`hsl(213 90% 48%)` light / `hsl(213 90% 58%)` dark)
- **Dark mode**: Smart — applies `.dark` class when hour >= 18 or < 7, OR system prefers dark
- **Utilities**: `.glass`, `.hero-gradient`, `.emerald-glow`, `.primary-glow`, `.text-gradient-primary` in `index.css`
- **Typography**: Inter (sans), JetBrains Mono

## Pages & Features

### Public
- **`/`** — Home: animated stats counters, hero section with image slideshow (default logistics warehouse background if no images set), how-it-works, features grid, testimonials, CTA
- **`/track`** — Live shipment tracking with Leaflet map, route interpolation based on `progressPercent`, smooth animation
- **`/contact`** — Contact form with subject selector; SMTP email notification on submit
- **`/analytics`** — Public preview page with teaser stats
- **`/privacy`** — Privacy Policy page (content editable in admin settings)
- **`/terms`** — Terms of Service page (content editable in admin settings)
- **`/cookies`** — Cookies Policy page (content editable in admin settings)

### Admin (`/admin/*`)
- **`/admin`** — Dashboard: stats summary + recent shipments
- **`/admin/shipments`** — Full CRUD with Nominatim global location search (OpenStreetMap, no API key required), route points editor, progress slider
- **`/admin/contacts`** — View, mark-read, and delete contact form submissions
- **`/admin/analytics`** — Full analytics: daily trend chart (30 days), status pie chart (fixed labels, no overlap), status bar chart
- **`/admin/testimonials`** — Manage testimonials with avatar image upload + edit bug fix (useEffect on modal open)
- **`/admin/settings`** — Company info, logo upload, hero images, WhatsApp/Telegram/Tawk.to widgets, social links, SMTP config, Privacy/Terms/Cookies editors, Admin Credentials section
- **`/admin/login`** — Secure login; credentials set via `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars

## Backend Routes (api-server)

- `GET/POST /api/contacts` — List and submit contact messages
- `PUT /api/contacts/:id/read` — Mark as read
- `DELETE /api/contacts/:id` — Delete contact message
- `GET /api/analytics/summary` — Key metrics
- `GET /api/analytics/shipments-by-status` — Pie chart data
- `GET /api/analytics/shipments-by-month` — Monthly trend
- `GET /api/analytics/shipments-by-day` — Daily trend (last 30 days)
- `POST /api/admin/login` — Admin login (returns token + sets cookie)
- `POST /api/admin/logout` — Clear session
- `GET /api/admin/me` — Current session
- `PUT /api/admin/credentials` — Update admin email/name/password
- `GET/PUT /api/settings` — Site settings (includes privacyPolicy, termsOfService, cookiesPolicy)

## Auth

- In-memory session Map in admin.ts
- Cookie `admin_token` + Bearer header support
- `ADMIN_EMAIL`/`ADMIN_PASSWORD` env fallback when no DB admin record exists
- Passwords hashed with SHA-256 + `globaltrack_salt` when stored in DB

## DB Schema

Tables: `shipments`, `contact_messages`, `testimonials`, `site_settings`, `admin_users`

`site_settings` includes: all company config + `privacyPolicy`, `termsOfService`, `cookiesPolicy` text fields

Run `pnpm --filter @workspace/db push` after any schema changes.

## Default Credentials

- Email: `admin@globaltrack.com`
- Password: `admin123`

Change via **Admin → Settings → Admin Credentials** section.

## Key Implementation Notes

- **Location Search**: Uses Nominatim (OpenStreetMap) — debounced 400ms, returns lat/lng for map
- **Hero Background**: Falls back to Unsplash logistics warehouse image when no hero images uploaded
- **Upload Pattern**: `POST /api/storage/uploads/request-url` → `PUT` signed URL → reference via `/api/storage/public-objects/{filename}`
- **No Orval Regen**: New endpoints use direct `fetch()` calls; Zod schemas edited directly in `lib/api-zod/src/generated/api.ts`
- **Legal Pages**: Stored as plain text in `site_settings` table, rendered with `whitespace-pre-wrap`

## Setup

See `setup.md` for full setup documentation.
