import type { Client, CustomerPayment, Package } from '../types';
import { TODAY_STR } from './date';

export function packagePriceForClient(client: Client, pkg: Package) {
  const selected = client.packageMinutes?.[pkg.id] ?? pkg.tiers[0]?.minutes;
  const tier = pkg.tiers.find((t) => t.minutes === selected) ?? pkg.tiers[0];
  return tier?.price ?? 0;
}

export type ReceivableStatus = 'Paid in full' | 'Part paid' | 'Awaiting deposit' | 'Awaiting payment' | 'Overdue';

export interface Receivable {
  client: Client;
  billed: number;
  depositRequired: number;
  paid: number;
  outstanding: number;
  dueDate: string;
  status: ReceivableStatus;
}

/**
 * What each customer owes vs has paid. Billed = the selected session length's price for every
 * treatment on the customer; payment falls due on their booked (preferred) date. Deposits only
 * apply to treatments with a deposit % set in Treatments & prices; the rest are paid at the spa.
 */
export function receivableFor(client: Client, payments: CustomerPayment[], packageById: (id: string) => Package | undefined): Receivable | null {
  const pkgs = client.packageIds.map(packageById).filter((p): p is Package => Boolean(p));
  if (pkgs.length === 0) return null;
  const billed = pkgs.reduce((sum, p) => sum + packagePriceForClient(client, p), 0);
  const depositRequired = pkgs.reduce((sum, p) => sum + Math.round((packagePriceForClient(client, p) * p.bookingDepositPct) / 100), 0);
  const paid = payments.filter((p) => p.clientId === client.id).reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(0, billed - paid);
  const dueDate = client.preferredDate;
  const pastDue = Boolean(dueDate) && dueDate < TODAY_STR;
  let status: ReceivableStatus;
  if (outstanding === 0) status = 'Paid in full';
  else if (pastDue) status = 'Overdue';
  else if (paid < depositRequired) status = 'Awaiting deposit';
  else if (paid > 0) status = 'Part paid';
  else status = 'Awaiting payment';
  return { client, billed, depositRequired, paid, outstanding, dueDate, status };
}

type SeedPlan = 'prepaid' | 'paid' | 'half' | 'none';

/** Demo payment history for the seed customers, keyed by customer id so every receivable status shows up. */
const seedPlans: Record<string, SeedPlan> = {
  'cli-01': 'prepaid',
  'cli-02': 'none',
  'cli-03': 'none',
  'cli-04': 'prepaid',
  'cli-05': 'none',
  'cli-06': 'paid',
  'cli-07': 'half',
  'cli-08': 'paid',
  'cli-09': 'half',
  'cli-10': 'none',
  'cli-11': 'paid',
  'cli-12': 'none',
  'cli-13': 'paid',
  'cli-14': 'prepaid',
  'cli-15': 'paid',
};

function shiftDate(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buildSeedPayments(clients: Client[], packageById: (id: string) => Package | undefined): CustomerPayment[] {
  const payments: CustomerPayment[] = [];
  clients.forEach((client, i) => {
    const plan = seedPlans[client.id];
    const r = receivableFor(client, [], packageById);
    if (!plan || plan === 'none' || !r) return;
    const method = (['bank-transfer', 'e-wallet', 'cash', 'e-wallet'] as const)[i % 4];
    if (plan === 'prepaid') {
      payments.push({ id: `pay-${client.id}`, clientId: client.id, date: shiftDate(client.preferredDate, -3), amount: r.billed, kind: 'full', method });
    } else if (plan === 'paid') {
      payments.push({ id: `pay-${client.id}`, clientId: client.id, date: client.preferredDate, amount: r.billed, kind: 'full', method });
    } else {
      payments.push({ id: `pay-${client.id}`, clientId: client.id, date: client.preferredDate, amount: Math.round(r.billed / 2), kind: 'balance', method });
    }
  });
  return payments.sort((a, b) => b.date.localeCompare(a.date));
}
