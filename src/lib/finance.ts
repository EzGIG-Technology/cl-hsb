import type { Client, CustomerPayment, Package } from '../types';
import { TODAY_STR } from './date';

export function packagePriceForClient(client: Client, pkg: Package) {
  const selectedDays = client.packageDays?.[pkg.id] ?? pkg.tiers[0]?.days;
  const tier = pkg.tiers.find((t) => t.days === selectedDays) ?? pkg.tiers[0];
  return tier?.price ?? pkg.sessionPrice?.perSession ?? 0;
}

export type ReceivableStatus = 'Paid in full' | 'Deposit paid' | 'Awaiting deposit' | 'Awaiting payment' | 'Overdue';

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
 * What each customer owes vs. has paid. Billed = selected tier price of every package on the
 * customer; the balance falls due on the confinement start (due/birth date).
 */
export function receivableFor(client: Client, payments: CustomerPayment[], packageById: (id: string) => Package | undefined): Receivable | null {
  const pkgs = client.packageIds.map(packageById).filter((p): p is Package => Boolean(p));
  if (pkgs.length === 0) return null;
  const billed = pkgs.reduce((sum, p) => sum + packagePriceForClient(client, p), 0);
  const depositRequired = pkgs.reduce((sum, p) => sum + Math.round((packagePriceForClient(client, p) * p.bookingDepositPct) / 100), 0);
  const paid = payments.filter((p) => p.clientId === client.id).reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(0, billed - paid);
  const dueDate = client.dueOrBirthDate;
  const pastDue = Boolean(dueDate) && dueDate < TODAY_STR;
  let status: ReceivableStatus;
  if (outstanding === 0) status = 'Paid in full';
  else if (pastDue) status = 'Overdue';
  else if (paid >= depositRequired && paid > 0) status = 'Deposit paid';
  else if (depositRequired === 0) status = 'Awaiting payment';
  else status = 'Awaiting deposit';
  return { client, billed, depositRequired, paid, outstanding, dueDate, status };
}

type SeedPlan = 'full' | 'deposit' | 'deposit+half' | 'none';

/** Demo payment history for the seed customers — keyed by customer id so receivable statuses cover every case. */
const seedPlans: Record<string, SeedPlan> = {
  'cli-01': 'full',
  'cli-02': 'deposit',
  'cli-03': 'none',
  'cli-04': 'deposit',
  'cli-05': 'deposit',
  'cli-06': 'full',
  'cli-07': 'deposit+half',
  'cli-08': 'full',
  'cli-09': 'deposit',
  'cli-10': 'full',
  'cli-11': 'full',
  'cli-12': 'none',
  'cli-13': 'full',
  'cli-14': 'deposit',
  'cli-15': 'full',
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
    const method = (['bank-transfer', 'e-wallet', 'bank-transfer', 'cash'] as const)[i % 4];
    const depositDate = shiftDate(client.dueOrBirthDate, -30);
    if (plan === 'full' && r.depositRequired === 0) {
      payments.push({ id: `pay-${client.id}-full`, clientId: client.id, date: shiftDate(client.dueOrBirthDate, -7), amount: r.billed, kind: 'full', method });
      return;
    }
    if (r.depositRequired > 0) {
      payments.push({ id: `pay-${client.id}-dep`, clientId: client.id, date: depositDate, amount: r.depositRequired, kind: 'deposit', method });
    }
    const balance = r.billed - r.depositRequired;
    if (plan === 'full' && balance > 0) {
      payments.push({ id: `pay-${client.id}-bal`, clientId: client.id, date: client.dueOrBirthDate, amount: balance, kind: 'balance', method });
    }
    if (plan === 'deposit+half' && balance > 0) {
      payments.push({ id: `pay-${client.id}-bal`, clientId: client.id, date: client.dueOrBirthDate, amount: Math.round(balance / 2), kind: 'balance', method });
    }
  });
  return payments.sort((a, b) => b.date.localeCompare(a.date));
}
