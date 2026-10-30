# Honey Spa Bangi: Admin Console

A demo admin dashboard, staff mobile app and customer review form for **Honey Spa Bangi**, a women-only
spa at Bangi Sentral, Bandar Baru Bangi. Built with React, TypeScript, Vite, Tailwind CSS and Recharts.

Brand colours come from the Honey Spa logo and price card: magenta `#c42474` (primary), lavender `#6f76b0`
(the five-petal flower), honey `#d9921f` (the bee) on a blush ground `#fdf6f9`. Type is Jost. The wordmark is
cut from the published logo (`scripts/optimize-logo.mjs`); the flower-and-bee mark is redrawn as SVG
(`src/components/Logo.tsx`, `public/favicon.svg`).

## Admin dashboard pages

**Today**
- **Overview**: greeting with the outlet's live open/closed status, headline figures (sessions, revenue,
  rating, staff on duty), today's roster, activity stream, bookings chart and customer map
- **Bookings**: Unassigned / Active / Completed / Cancelled, area filter, and a New Booking wizard
  (customer → treatment & session length → ranked staff match → confirm)
- **Schedule & roster**: week view with status filters
- **Session records**: every session with a verification status (Verified / In Progress / Missing Check-Out
  Selfie / GPS Mismatch) and an inspect panel

**People**

Staff are split into two directories (there is no "therapist" role):
- **CL directory** (`/cls`): CLs, who go to customers' homes for home service and prenatal & postnatal care
- **Spa directory** (`/spa`): spa staff, who work in the spa at Bangi Sentral

Both have a leaderboard, roster, and profiles with stats, certifications, leave, flagging, and an internal vs
customer-facing (printable) view. A staff member's type is the `staffType` field (`'cl' | 'spa'`).
- **Customer directory** (`/customers`; old `/clients` links redirect): profiles with address, treatments and
  session length, booking history
- **Messages**: chat with staff and customers

**Menu & money**
- **Treatments & prices**: the Honey Spa menu with per-length pricing, treatment steps (used as the
  session checklist) and availability by area
- **Financial management** (`/finance`), with a month picker and four tabs:
  - *Profit & loss*: revenue minus staff payroll and operating expenses, net profit and margin vs last month,
    a revenue/costs/profit chart, and a P&L statement (month, previous month, year to date) with CSV export
  - *Expenses*: expense ledger by category (rent & utilities, herbs & supplies, transport, marketing, admin,
    insurance, equipment) with add, delete, mark paid, filters and CSV export
  - *Receivables & deposits*: what each customer was billed, any deposit, what they paid and still owe, with
    Overdue / Awaiting payment / Awaiting deposit / Part paid / Paid in full, and a "Record payment" flow
  - *Cash flow & budget*: monthly cash in and out, running bank balance, and editable monthly budgets per
    category with budget-vs-actual and over-budget warnings
- **Payroll**, **Complaints**, **Reports**

**System**
- **Settings & users**: company profile (address, hours, phone/WhatsApp, socials, logo upload), admin team,
  reset demo data
- **Mobile app preview**: Staff App, Customer Review Form (Phase 1) and Customer App (Phase 2 preview)

All admin actions are recorded to a live Activity Log.

## Data

The treatment menu and company details come from Honey Spa's own price list and public listings; see
[`docs/honey-spa-audit.md`](docs/honey-spa-audit.md) for sources and the open questions (two treatments
still have placeholder prices, flagged "Price to confirm"). Staff, customers, bookings, complaints,
payroll and finance figures are illustrative mock data wired through shared React Context stores (`src/store/`), persisted per
browser in `localStorage` and resettable from **Settings → Reset all demo data**.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deploying to Vercel

Static single-page app; `vercel.json` includes the SPA rewrite so client-side routes work on refresh.
Framework preset **Vite**, build command `npm run build`, output directory `dist`. No environment variables or
backend are required.
