# NR Mothercare Confinement — Admin Dashboard

A demo admin dashboard and confinement-lady (CL) mobile app showcase for **NR Mothercare Confinement**,
built with React, TypeScript, Vite, Tailwind CSS, and Recharts.

## What's in here

- **Overview** — daily stats, active-CL trend, attendance breakdown, live operations map, today's assignments
- **Schedule & Roster** — weekly calendar of CL assignments, unassigned-request queue with CL assignment picker
- **Confinement Ladies** — staff directory with an internal profile (contact, IC, assignment history) and a
  customer-facing profile view (print/PDF-style, no private info) with banned/complained flagging
- **Clients** — customer directory with package, contact, and notes
- **Operations map** — stylised live map of CL totals by area
- **Reports** — revenue, completed assignments, package popularity, rating distribution, CL leaderboard
- **Messages** — chat with CLs and clients
- **Settings** — fully editable package catalogue (day-tier pricing, treatments, notes), company profile,
  and admin team management — changes persist to the browser via `localStorage`
- **Mobile app showcase** — interactive phone mockup of the CL-facing app (clock-in, care checklist, schedule, profile)

Package data (Pakej Melur, Mawar, Dahlia, Rafflesia, Cempaka, Oversea, Seri Ibu, Keguguran, Penutup Pantang)
is sourced from the real NR Mothercare pricing flyers. A few tiers for Cempaka and Oversea were interpolated
where the source flyers didn't cover every day-count — see the "estimated pricing" note in Settings.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## Deploying to Vercel

This is a static single-page app — `vercel.json` already includes the SPA rewrite so client-side routes
(e.g. `/schedule`, `/cls/:id`) work on refresh/direct link.

**Option A — Vercel CLI**

```bash
npm i -g vercel
vercel          # first run links/creates the project, deploys a preview
vercel --prod   # promote to production
```

**Option B — GitHub + Vercel dashboard**

1. Push this repo to GitHub.
2. In the Vercel dashboard, "Add New Project" → import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (auto-detected).
4. Deploy.

No environment variables or backend are required — all data is local mock data plus `localStorage`.
