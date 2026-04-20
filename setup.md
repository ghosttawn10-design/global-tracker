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
| `PORT` | API server port | `8080` |
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
- Express 4
- TypeScript 5
- TailwindCSS 4
- shadcn/ui (Radix primitives)
- Framer Motion 12
- Recharts 2

---

## Deployment

This project is configured for Replit deployment. The API server runs on `PORT` (default 8080) and the frontend is served via Vite in development and a static build in production.

For production deployment:
1. Ensure `DATABASE_URL` is set in environment secrets
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in environment secrets
3. Click "Deploy" in the Replit interface

---

## GitHub Repository

Target: [github.com/ghosttown10-design/global-tracker](https://github.com/ghosttown10-design/global-tracker)
