import type { Expense, ExpenseCategory } from '../types';

/** Months the finance module reports on — Jan to the current month (Aug 2026), matching the Reports seed set. */
export const FINANCE_MONTHS = [
  { key: '2026-01', label: 'Jan' },
  { key: '2026-02', label: 'Feb' },
  { key: '2026-03', label: 'Mar' },
  { key: '2026-04', label: 'Apr' },
  { key: '2026-05', label: 'May' },
  { key: '2026-06', label: 'Jun' },
  { key: '2026-07', label: 'Jul' },
  { key: '2026-08', label: 'Aug' },
] as const;

export const CURRENT_FINANCE_MONTH = '2026-08';

/** Company bank balance on 1 Jan 2026 — the starting point for the running cash balance. */
export const OPENING_CASH_BALANCE = 285000;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent & Utilities',
  'Herbs & Supplies',
  'Transport & Fuel',
  'Marketing',
  'Admin & Software',
  'Insurance & Licences',
  'Equipment & Maintenance',
];

export const expenseCategoryColors: Record<ExpenseCategory, string> = {
  'Rent & Utilities': '#3c6f57',
  'Herbs & Supplies': '#d94f8c',
  'Transport & Fuel': '#c98a3b',
  Marketing: '#8b5fbf',
  'Admin & Software': '#3b6d8a',
  'Insurance & Licences': '#b13570',
  'Equipment & Maintenance': '#6fa583',
};

export const defaultBudgets: Record<ExpenseCategory, number> = {
  'Rent & Utilities': 18000,
  'Herbs & Supplies': 8000,
  'Transport & Fuel': 9000,
  Marketing: 7000,
  'Admin & Software': 10500,
  'Insurance & Licences': 1200,
  'Equipment & Maintenance': 2000,
};

/** Honey Spa Bangi treatment revenue by month (RM), tracked separately from CL home-care packages. */
export const monthlySpaRevenue: Record<string, number> = {
  '2026-01': 31200,
  '2026-02': 34800,
  '2026-03': 33100,
  '2026-04': 36500,
  '2026-05': 29900,
  '2026-06': 41200,
  '2026-07': 35600,
  '2026-08': 38400,
};

interface RecurringItem {
  category: ExpenseCategory;
  description: string;
  vendor: string;
  day: number;
  base: number;
  /** ± variation as a fraction of base, applied deterministically per month. */
  swing?: number;
}

const recurring: RecurringItem[] = [
  { category: 'Rent & Utilities', description: 'Setia Alam HQ office rent', vendor: 'Setia Alam Properties', day: 1, base: 8500 },
  { category: 'Rent & Utilities', description: 'Honey Spa Bangi premises rent', vendor: 'Bangi Sentral Sdn Bhd', day: 1, base: 6500 },
  { category: 'Rent & Utilities', description: 'Electricity (HQ & Honey Spa Bangi)', vendor: 'TNB', day: 18, base: 1850, swing: 0.12 },
  { category: 'Rent & Utilities', description: 'Water (HQ & Honey Spa Bangi)', vendor: 'Air Selangor', day: 20, base: 380, swing: 0.15 },
  { category: 'Rent & Utilities', description: 'Fibre internet', vendor: 'Unifi', day: 5, base: 299 },
  { category: 'Herbs & Supplies', description: 'Param, pilis, tapel & herbal bath stock', vendor: 'Herba Warisan Enterprise', day: 3, base: 5600, swing: 0.2 },
  { category: 'Herbs & Supplies', description: 'Bengkung, towels & spa linens', vendor: 'Tekstil Mutiara', day: 12, base: 1400, swing: 0.25 },
  { category: 'Transport & Fuel', description: 'CL fuel & toll allowance', vendor: 'Petronas Fleet / Touch n Go', day: 28, base: 7200, swing: 0.15 },
  { category: 'Transport & Fuel', description: 'E-hailing rides for CLs', vendor: 'Grab for Business', day: 28, base: 1150, swing: 0.3 },
  { category: 'Marketing', description: 'Meta & TikTok ads', vendor: 'Meta Platforms / TikTok', day: 7, base: 5400, swing: 0.25 },
  { category: 'Admin & Software', description: 'Office admin salaries', vendor: 'Payroll — admin team', day: 25, base: 9800 },
  { category: 'Admin & Software', description: 'Accounting software subscription', vendor: 'SQL Account', day: 2, base: 180 },
  { category: 'Admin & Software', description: 'WhatsApp Business API', vendor: 'Meta Platforms', day: 2, base: 350 },
  { category: 'Insurance & Licences', description: 'Takaful liability cover', vendor: 'Takaful Malaysia', day: 10, base: 850 },
];

const oneOffs: Omit<Expense, 'id' | 'status'>[] = [
  { date: '2026-02-16', category: 'Equipment & Maintenance', description: 'Sauna unit servicing — Honey Spa Bangi', vendor: 'SaunaTech Services', amount: 1800 },
  { date: '2026-03-09', category: 'Insurance & Licences', description: 'Premise licence renewal (HQ & Honey Spa Bangi)', vendor: 'Majlis Perbandaran Kajang', amount: 1600 },
  { date: '2026-04-21', category: 'Marketing', description: 'Raya promo flyers & banners', vendor: 'Cetak Pantas Printing', amount: 1650 },
  { date: '2026-05-14', category: 'Equipment & Maintenance', description: 'New tungku batu sungai sets (x12)', vendor: 'Herba Warisan Enterprise', amount: 3200 },
  { date: '2026-06-03', category: 'Marketing', description: 'Baby & Mother Expo booth', vendor: 'MIECC Events', amount: 4800 },
  { date: '2026-07-08', category: 'Equipment & Maintenance', description: 'Aircond servicing (HQ & Honey Spa Bangi)', vendor: 'Cool Breeze Aircond', amount: 1100 },
  { date: '2026-08-11', category: 'Equipment & Maintenance', description: 'Replacement spa beds — Honey Spa Bangi', vendor: 'Spa Supplies MY', amount: 2600 },
];

/** Deterministic 0..1 value per (month, item) so the seed ledger looks organic but never changes between loads. */
function jitter(monthIndex: number, itemIndex: number) {
  const x = Math.sin(monthIndex * 12.9898 + itemIndex * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Bills dated on/after 10 Aug are still awaiting payment in the demo; everything earlier is settled. */
const UNPAID_FROM = '2026-08-10';

function buildSeedExpenses(): Expense[] {
  const rows: Expense[] = [];
  FINANCE_MONTHS.forEach((m, mi) => {
    recurring.forEach((item, ii) => {
      const swing = item.swing ?? 0;
      const amount = Math.round((item.base * (1 + (jitter(mi, ii) * 2 - 1) * swing)) / 10) * 10;
      const date = `${m.key}-${String(item.day).padStart(2, '0')}`;
      rows.push({
        id: `exp-${m.key}-${ii}`,
        date,
        category: item.category,
        description: item.description,
        vendor: item.vendor,
        amount,
        status: date >= UNPAID_FROM ? 'unpaid' : 'paid',
      });
    });
  });
  oneOffs.forEach((o, i) => rows.push({ ...o, id: `exp-oneoff-${i}`, status: o.date >= UNPAID_FROM ? 'unpaid' : 'paid' }));
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export const seedExpenses: Expense[] = buildSeedExpenses();
