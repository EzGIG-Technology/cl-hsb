# NR Mothercare Confinement — Admin Console

A demo admin dashboard, caregiver (CL) mobile app, and mother's review form for **NR Mothercare Confinement**,
built with React, TypeScript, Vite, Tailwind CSS, and Recharts. Brand colours are the logo's pink (`#d94f8c`)
and green (`#3c6f57`).

## Admin dashboard pages

**Operations**
- **Overview / Live Monitor** — alert banners, active-caregiver count, business health KPIs (revenue, rating,
  repeat rate, utilisation), live care map, live activity stream, month-on-month bookings chart, today's roster
- **Bookings & Assignment** — Unassigned / Active / Completed / Cancelled tabs, area filter, and a 4-step
  New Booking wizard (pick customer → package & tier → system-ranked caregiver match → confirm)
- **CL Directory** — leaderboard (top 3 by tier/points), full roster table; click through to a
  profile with stats (sessions, verified hours, lifetime earnings, leaderboard points, good/poor reviews),
  action buttons (WhatsApp, reports, mark inactive), and Current Schedule / Active / Completed / Monthly tabs.
  Each profile also has an **internal vs. customer-facing view** (print/PDF-style, strips private info) and
  banned/complained flagging.
- **Spa Directory** — spa staff across the three spa outlets (Setia Alam, Shah Alam, Bangi), with outlet headcount /
  on-duty / treatment summary cards and total monthly spa salaries. Roles are Spa Supervisor, Spa Specialist, Spa
  Attendant and Front Desk (there is no therapist role). Each profile has status, treatment skills (tap to toggle),
  contact details, salary, admin notes, and edit / remove-from-roster actions.
- **Customer Directory** — click through to a customer profile with editable address, multi-package
  assignment with a running total, and full booking history
- **Visit Records & Audit** — every visit with a computed verification status (Verified / In Progress /
  Missing Check-Out Selfie / GPS Mismatch) and an inspect panel

**Finance & Risk**
- **Financial Management** — company-wide finances with a month picker (Jan–Aug 2026) and four tabs:
  - *P&L Overview* — revenue (CL home-care packages + spa treatments) minus CL payroll, spa staff salaries and
    operating expenses; net profit and margin vs. last month, a revenue/costs/profit chart, and a full P&L
    statement (month, previous month, YTD, % of revenue) with CSV export
  - *Expenses* — categorised expense ledger (rent & utilities, herbs & supplies, transport, marketing, admin,
    insurance, equipment) with add / delete / mark paid, filters, spend-by-category breakdown, and CSV export
  - *Receivables & Deposits* — what each customer has been billed, deposit required, paid, and outstanding, with
    Overdue / Awaiting deposit / Deposit paid / Paid in full statuses, a "Record payment" flow, and recent payments
  - *Cash Flow & Budget* — monthly cash in/out, running bank balance, and editable per-category monthly budgets
    with budget-vs-actual bars and over-budget alerts
- **Hourly Payroll** — monthly summary (caregiver count, approved/disputed hours, total pay), CSV/Excel export,
  bulk "mark as paid", per-caregiver approval status
- **Disputes & Exceptions** — Open/Resolved tickets with severity and a resolve action

**Catalog**
- **Packages & Availability** — every package (Melur, Mawar, Dahlia, Rafflesia, Cempaka, Oversea, Seri Ibu,
  Keguguran, Penutup Pantang — priced from the real flyers) with day-tier pricing, treatment lists, and a
  **per-location, per-package slot editor** (daily/weekly/monthly cadence + cap)

**System**
- **Reports** — revenue, completed assignments, package popularity, rating distribution, CL leaderboard
- **Messages** — chat with CLs and clients
- **Settings & Users** — company profile (with logo upload), admin team (Admin / Operations / Finance roles),
  and a global "reset all demo data" control
- **Mobile App Preview** — see below

All admin actions (reassign CL, flag a caregiver, edit an address, update a package, etc.) are recorded to a
live **Activity Log**, surfaced in the header notification bell and on the Overview's Activity Stream.

## Mobile app preview (`/mobile-app`)

Three switchable modes in one phone mockup:

1. **Confinement Lady App** — Home (caregiver card, monthly stats, today's job, quick actions) / Jobs
   (Active·Upcoming·Past) / Messages / Earnings (month picker + payslip history) / Profile (particulars,
   support, a demo persona switcher, log out). Tapping **Open Job** launches the real session flow: check-in →
   package checklist (photo required per task, pulled live from the assigned package) → photo of the signed
   closing form → complete.
2. **Mother's Review Form (Phase 1)** — the only mother-facing piece scoped for launch: a link sent after each
   session with 4 star-rating categories, free-text feedback, tap-to-sign confirmation, and a "call us instead"
   escape hatch. Ratings never reach the CL.
3. **Mother's App (Phase 2 preview)** — clearly labelled as not yet in scope: profile, bookings + add-on
   packages, reviews, and payments, so the team can plan ahead.

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
(e.g. `/schedule`, `/cls/:id`, `/packages/:id`) work on refresh/direct link.

**Option A — Vercel CLI**

```bash
npm i -g vercel
vercel          # first run links/creates the project, deploys a preview
vercel --prod   # promote to production
```

**Option B — GitHub + Vercel dashboard**

1. This repo is already pushed to `https://github.com/ezgig-hq/cl`.
2. In the Vercel dashboard, "Add New Project" → import that repo.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (auto-detected).
4. Deploy.

No environment variables or backend are required — all data is local mock data plus `localStorage`. Each
visitor's browser starts from the same seeded dataset; edits persist locally per-browser and can be cleared
from **Settings → Reset all demo data**.

## Notes on the data

Package pricing/day-tiers for Melur, Mawar, Dahlia, Rafflesia, Cempaka, Oversea, Seri Ibu (prenatal), Keguguran,
and Penutup Pantang are sourced from the real NR Mothercare pricing flyers. A few tiers for Cempaka/Oversea were
interpolated where the flyers didn't cover every day-count. Everything else (CL roster, clients, assignments,
disputes, payroll) is illustrative mock data wired through shared React Context stores (`src/store/`), so admin
edits made in one page (e.g. reassigning a CL in Bookings) are reflected everywhere else (Schedule, CL profile,
Overview) in the same session.
