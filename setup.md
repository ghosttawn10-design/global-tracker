# GlobalTrack Logistique — Setup Guide

## Overview

GlobalTrack Logistique is a full-stack logistics tracking application built with:
- **Frontend**: React 18 + Vite + TailwindCSS + shadcn/ui + Framer Motion
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL (Replit Neon DB)
- **Architecture**: pnpm Monorepo

---

## Project Structure

```
├── artifacts/
│   ├── globaltrack/          # React frontend (Vite)
│   │   └── src/
│   │       ├── pages/        # Public + admin pages
│   │       ├── components/   # Shared UI components
│   │       ├── contexts/     # Auth context
│   │       └── hooks/        # Custom React hooks
│   └── api-server/           # Express backend
│       └── src/
│           ├── routes/       # REST API routes
│           └── index.ts      # Server entry point
├── lib/
│   ├── db/                   # Drizzle schema & seed data
│   │   └── src/
│   │       └── schema/       # Table definitions
│   ├── api-zod/              # Zod validation schemas
│   └── api-client-react/     # React Query hooks (auto-generated)
└── setup.md                  # This file
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `ADMIN_EMAIL` | Default admin login email | `admin@globaltrack.com` |
| `ADMIN_PASSWORD` | Default admin login password | `admin123` |
| `ADMIN_NAME` | Default admin display name | `Admin` |
| `PORT` | API server port | `8081` |
| `CORS_ORIGINS` | Comma-separated allowlist of frontend origins (Render URLs + custom domains) | Optional for local, required for production |
| `SMTP_HOST` | SMTP host for email notifications | Optional |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | Optional |
| `SMTP_PASS` | SMTP password | Optional |
| `SMTP_FROM` | From email address | Optional |
| `SMTP_TO` | Notification recipient email | Optional |

---

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

Push the schema to your PostgreSQL database:

```bash
pnpm --filter @workspace/db push
```

Seed the database with sample data:

```bash
pnpm --filter @workspace/db seed
```

### 3. Start Development Servers

Start the API server:

```bash
pnpm --filter @workspace/api-server dev
```

Start the frontend:

```bash
pnpm --filter @workspace/globaltrack dev
```

---

## Admin Panel

Access the admin panel at `/admin`. Default credentials:

- **Email**: `admin@globaltrack.com`
- **Password**: `admin123`

**Important**: Change the default credentials immediately after first login via **Admin Panel → Settings → Admin Credentials**.

---

## Public Pages

| Route | Description |
|---|---|
| `/` | Home page with hero, features, and testimonials |
| `/track` | Shipment tracking page |
| `/analytics` | Public analytics dashboard |
| `/contact` | Contact form |
| `/privacy` | Privacy Policy (editable in admin) |
| `/terms` | Terms of Service (editable in admin) |
| `/cookies` | Cookies Policy (editable in admin) |

## Admin Pages

| Route | Description |
|---|---|
| `/admin` | Dashboard with key metrics |
| `/admin/shipments` | Create, edit, delete shipments with global location search |
| `/admin/analytics` | Charts and analytics (daily trend + pie chart) |
| `/admin/contacts` | View and delete contact messages |
| `/admin/testimonials` | Manage testimonials with image upload |
| `/admin/settings` | All site settings including legal pages and credentials |

---

## Key Features

### Global Location Search
Shipment origin/destination uses [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) for real-time geocoding — search any city or location worldwide. No API key required.

### Hero Background
If no hero images are uploaded in Settings, a default dark logistics-themed background image is shown (from Unsplash, `photo-1586528116311-ad8dd3c8310d`).

### Testimonial Image Upload
Avatar images for testimonials can be uploaded directly from the admin panel via the built-in object storage system.

### Legal Pages
Privacy Policy, Terms of Service, and Cookies Policy can be edited directly in the Admin Settings panel and are served at public routes.

### Admin Credentials
Admin email, name, and password can be changed in the Admin Settings panel. Passwords are hashed using SHA-256 + salt. Changing credentials takes effect immediately.

---

## Database Schema

Key tables:
- `shipments` — Tracking records with status, location, route points
- `site_settings` — Global site config including legal page content
- `admin_users` — Admin login credentials (hashed passwords)
- `contact_messages` — Contact form submissions
- `testimonials` — Customer testimonials

### Apply Schema Changes

```bash
pnpm --filter @workspace/db push
```

---

## Tech Stack Versions

- Node.js 20+
- pnpm 9+
- React 18
- Vite 7
- Drizzle ORM 0.39+
- Express 5
- TypeScript 5
- TailwindCSS 4
- shadcn/ui (Radix primitives)
- Framer Motion 12
- Recharts 2

---

## Deployment

This application is deployed on **Render.com** as two separate services:

- **Backend**: Render **Web Service** (API-only Express server)
- **Frontend**: Render **Static Site** (Vite build output)

The backend is intentionally **API-only** and must **not** serve the frontend.

---

## Render.com Deployment Guide (Backend + Frontend)

### Backend (Render Web Service)

1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Configure:
   - **Root Directory**: *(leave blank / repo root)*
   - **Build Command**:
     ```
     pnpm -w install
     pnpm -w --filter @workspace/api-server build
     ```
   - **Start Command**:
     ```
     pnpm -w --filter @workspace/api-server start
     ```

4. Set environment variables in Render (Backend service):

| Variable | Required | Notes |
|---|---:|---|
| `DATABASE_URL` | Yes | Neon/Postgres connection string |
| `ADMIN_EMAIL` | Yes | Default: `admin@globaltrack.com` |
| `ADMIN_PASSWORD` | Yes | Default: `admin123` |
| `ADMIN_NAME` | No | Default: `Admin` |
| `CORS_ORIGINS` | Yes | Comma-separated allowlist of frontend origins |

**CORS_ORIGINS example** (set this exactly to your frontend URLs):
```
https://YOUR-FRONTEND.onrender.com,https://www.YOURDOMAIN.com
```

Notes:
- Render sets `PORT` automatically for web services. **Do not hardcode `PORT`** in Render.
- Authentication is **token-based**:
  - `POST /api/admin/login` returns a token
  - The frontend stores it in `localStorage` as `admin_token`
  - All authenticated API calls send `Authorization: Bearer <token>`

### Frontend (Render Static Site)

1. Create a new **Static Site** on Render.
2. Connect the same GitHub repository.
3. Configure:
   - **Root Directory**: *(leave blank / repo root)*
   - **Build Command**:
     ```
     pnpm -w install
     pnpm -w --filter @workspace/globaltrack build
     ```
   - **Publish Directory**:
     ```
     artifacts/globaltrack/dist/public
     ```

4. Set environment variables in Render (Frontend static site):

| Variable | Required | Notes |
|---|---:|---|
| `VITE_API_BASE_URL` | Yes | Absolute backend base URL, including `https://` |

**VITE_API_BASE_URL example**:
```
https://YOUR-BACKEND.onrender.com
```

Notes:
- When hosting as a static site (Render Static Site), the frontend does not have a `/api` proxy. `VITE_API_BASE_URL` must be set so the browser calls the backend directly.
- iPhone/Safari: use HTTPS in production. Some privacy modes can restrict storage APIs; the app reads the admin token from `localStorage`, so avoid blocking storage for the site.

### SPA Routing Fix (Render Static Site)

To prevent refresh / direct navigation from returning 404 (e.g. visiting `/admin/shipments` directly), configure a **rewrite** so all non-file routes serve `index.html`.

In Render Static Site settings, add a rewrite rule:

- **Source**: `/*`
- **Destination**: `/index.html`
- **Status**: `200`

This ensures client-side routing works for all routes.

---

## Database: Schema + Seed (Production)

After setting `DATABASE_URL` and deploying the backend, you can initialize schema + sample data from your local machine:

```bash
pnpm --filter @workspace/db push
pnpm --filter @workspace/db seed
```

Notes:
- The seed script connects using `DATABASE_URL`. Make sure your local machine can resolve/reach the database host.
- In production, you typically run schema/seed as a one-off task (locally or via a temporary Render job) rather than on every deploy.

---

## Cloudflare Domain Setup (DNS Only)

Cloudflare is used **only** for DNS (and optionally CDN/proxy). The frontend and backend remain hosted on **Render**.

### Recommended domain layout

- **Frontend (Static Site)**: `www.yourdomain.com`
- **Backend (Web Service)**: `api.yourdomain.com` (optional) OR keep as `YOUR-BACKEND.onrender.com`

### Connect custom domain to Render Frontend

1. In Render (Frontend Static Site), add your custom domain:
   - `www.yourdomain.com`
2. Render will show the DNS records required.
3. In Cloudflare DNS, create a **CNAME**:
   - **Name**: `www`
   - **Target**: `YOUR-FRONTEND.onrender.com`

### Root domain → www redirect (recommended)

To redirect `yourdomain.com` → `www.yourdomain.com`:

1. Add `yourdomain.com` as an additional domain in Render for the frontend.
2. In Cloudflare DNS, create a record as instructed by Render.
3. Configure a redirect at the platform level:
   - If Render provides a redirect option, use it.
   - Otherwise, use Cloudflare redirect rules (DNS-only mode is fine) to redirect apex to www.

### Optional: Cloudflare proxy (CDN)

You may enable Cloudflare proxy (orange cloud) on the **frontend** record for caching/performance.

Important:
- If you enable proxying, keep TLS mode **Full (strict)**.
- Verify the SPA rewrite still works and that Render still sees HTTPS.

### Backend integration rules

- The frontend must call the backend via `VITE_API_BASE_URL`.
- The backend must allow the frontend origins via `CORS_ORIGINS`.
- Do **not** proxy API requests through Cloudflare as a requirement (optional CDN is fine, but not required for functionality).

---

## GitHub Repository

Target: [github.com/ghosttown10-design/global-tracker](https://github.com/ghosttown10-design/global-tracker)
