import type { Expense, ExpenseCategory } from '../types';

/** Months the finance module reports on: Jan to the current month (Aug 2026), matching the Reports data. */
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

/** Company bank balance on 1 Jan 2026, the starting point for the running cash balance. Illustrative. */
export const OPENING_CASH_BALANCE = 60000;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent & Utilities',
  'Herbs & Supplies',
  'Transport & Fuel',
  'Marketing',
  'Admin & Software',
  'Insurance & Licences',
  'Equipment & Maintenance',
];

// Brand set from index.css, plus two deeper tones so seven categories stay distinguishable.
export const expenseCategoryColors: Record<ExpenseCategory, string> = {
  'Rent & Utilities': '#c42474',
  'Herbs & Supplies': '#6f76b0',
  'Transport & Fuel': '#d9921f',
  Marketing: '#e07aa8',
  'Admin & Software': '#2f2b55',
  'Insurance & Licences': '#9c1a5b',
  'Equipment & Maintenance': '#9aa0d4',
};

export const defaultBudgets: Record<ExpenseCategory, number> = {
  'Rent & Utilities': 7200,
  'Herbs & Supplies': 3000,
  'Transport & Fuel': 1700,
  Marketing: 2000,
  'Admin & Software': 4600,
  'Insurance & Licences': 600,
  'Equipment & Maintenance': 1000,
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
  { category: 'Rent & Utilities', description: 'Spa premises rent, Bangi Sentral', vendor: 'Bangi Sentral Sdn Bhd', day: 1, base: 5200 },
  { category: 'Rent & Utilities', description: 'Electricity', vendor: 'TNB', day: 18, base: 1250, swing: 0.12 },
  { category: 'Rent & Utilities', description: 'Water', vendor: 'Air Selangor', day: 20, base: 260, swing: 0.15 },
  { category: 'Rent & Utilities', description: 'Fibre internet', vendor: 'Unifi', day: 5, base: 199 },
  { category: 'Herbs & Supplies', description: 'Massage oils, herbs & mandi bunga flowers', vendor: 'Herba Warisan Enterprise', day: 3, base: 1900, swing: 0.2 },
  { category: 'Herbs & Supplies', description: 'Towels, linen & laundry', vendor: 'Dobi Bersih Bangi', day: 12, base: 850, swing: 0.15 },
  { category: 'Transport & Fuel', description: 'CL fuel & toll for home service', vendor: 'Petronas / Touch n Go', day: 28, base: 1400, swing: 0.15 },
  { category: 'Marketing', description: 'Instagram, TikTok & Facebook ads', vendor: 'Meta / TikTok', day: 7, base: 1600, swing: 0.25 },
  { category: 'Admin & Software', description: 'Front desk & admin salaries', vendor: 'Payroll: admin team', day: 25, base: 4200 },
  { category: 'Admin & Software', description: 'Booking & accounting software', vendor: 'SQL Account', day: 2, base: 180 },
  { category: 'Admin & Software', description: 'WhatsApp Business', vendor: 'Meta', day: 2, base: 120 },
  { category: 'Insurance & Licences', description: 'Takaful liability cover', vendor: 'Takaful Malaysia', day: 10, base: 380 },
];

const oneOffs: Omit<Expense, 'id' | 'status'>[] = [
  { date: '2026-02-16', category: 'Equipment & Maintenance', description: 'Massage bed servicing', vendor: 'Spa Supplies MY', amount: 900 },
  { date: '2026-03-09', category: 'Insurance & Licences', description: 'Premise licence renewal', vendor: 'Majlis Perbandaran Kajang', amount: 650 },
  { date: '2026-04-21', category: 'Marketing', description: 'Raya promo flyers & banners', vendor: 'Cetak Pantas Bangi', amount: 520 },
  { date: '2026-05-14', category: 'Equipment & Maintenance', description: 'New hot stone & tungku set', vendor: 'Herba Warisan Enterprise', amount: 1100 },
  { date: '2026-06-03', category: 'Marketing', description: 'Bangi wedding expo booth', vendor: 'Bangi Events', amount: 1800 },
  { date: '2026-07-08', category: 'Equipment & Maintenance', description: 'Aircond servicing', vendor: 'Cool Breeze Aircond', amount: 600 },
  { date: '2026-08-11', category: 'Equipment & Maintenance', description: 'Replacement massage beds (x2)', vendor: 'Spa Supplies MY', amount: 2200 },
];

/** Deterministic 0..1 value per (month, item) so the seed ledger looks organic but never changes between loads. */
function jitter(monthIndex: number, itemIndex: number) {
  const x = Math.sin(monthIndex * 12.9898 + itemIndex * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Bills dated on or after 10 Aug are still awaiting payment in the demo; everything earlier is settled. */
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
