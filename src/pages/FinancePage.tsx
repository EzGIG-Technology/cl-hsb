import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark,
  ChevronDown,
  Download,
  Plus,
  X,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  HandCoins,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { PageShell } from '../components/PageShell';
import { Card, SectionTitle, Avatar, formatRM } from '../components/ui';
import { useFinanceStore } from '../store/FinanceStore';
import { useSpaStaffStore } from '../store/SpaStaffStore';
import { useClientStore } from '../store/ClientStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { monthlyRevenue, monthlyPayroll } from '../data/reports';
import {
  FINANCE_MONTHS,
  CURRENT_FINANCE_MONTH,
  OPENING_CASH_BALANCE,
  EXPENSE_CATEGORIES,
  expenseCategoryColors,
  monthlySpaRevenue,
} from '../data/finance';
import { receivableFor, type Receivable, type ReceivableStatus } from '../lib/finance';
import { downloadCSV } from '../lib/csv';
import { formatDateLabel, TODAY_STR } from '../lib/date';
import type { CustomerPaymentKind, Expense, ExpenseCategory, PaymentMethod } from '../types';

type Tab = 'pnl' | 'expenses' | 'receivables' | 'cashflow';

const tabs: { id: Tab; label: string; icon: typeof Landmark }[] = [
  { id: 'pnl', label: 'P&L Overview', icon: PiggyBank },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'receivables', label: 'Receivables & Deposits', icon: HandCoins },
  { id: 'cashflow', label: 'Cash Flow & Budget', icon: Banknote },
];

const inputClass = 'w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink';
const tooltipStyle = { borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' };
const axisTick = { fill: '#8b7d87', fontSize: 12 };

const methodLabels: Record<PaymentMethod, string> = { 'bank-transfer': 'Bank transfer', cash: 'Cash', 'e-wallet': 'E-wallet' };

interface MonthFinancials {
  key: string;
  label: string;
  clRevenue: number;
  spaRevenue: number;
  revenue: number;
  clPayroll: number;
  spaSalaries: number;
  opexByCategory: Record<ExpenseCategory, number>;
  opex: number;
  paidOpex: number;
  grossProfit: number;
  costs: number;
  profit: number;
  cashIn: number;
  cashOut: number;
  netCash: number;
  closingBalance: number;
}

function monthLabel(key: string) {
  return `${FINANCE_MONTHS.find((m) => m.key === key)?.label ?? key} 2026`;
}

function pct(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

export default function FinancePage() {
  const { expenses, payments, budgets } = useFinanceStore();
  const { staff } = useSpaStaffStore();
  const [tab, setTab] = useState<Tab>('pnl');
  const [month, setMonth] = useState<string>(CURRENT_FINANCE_MONTH);

  const spaSalaries = staff.reduce((sum, s) => sum + s.monthlySalary, 0);

  const series = useMemo<MonthFinancials[]>(() => {
    let balance = OPENING_CASH_BALANCE;
    return FINANCE_MONTHS.map((m) => {
      const clRevenue = monthlyRevenue.find((r) => r.month === m.label)?.revenue ?? 0;
      const spaRevenue = monthlySpaRevenue[m.key] ?? 0;
      const clPayroll = monthlyPayroll.find((p) => p.month === m.label)?.payroll ?? 0;
      const monthExpenses = expenses.filter((e) => e.date.startsWith(m.key));
      const opexByCategory = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, 0])) as Record<ExpenseCategory, number>;
      monthExpenses.forEach((e) => {
        opexByCategory[e.category] += e.amount;
      });
      const opex = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const paidOpex = monthExpenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
      const revenue = clRevenue + spaRevenue;
      const grossProfit = revenue - clPayroll - spaSalaries;
      const costs = clPayroll + spaSalaries + opex;
      const cashIn = revenue;
      const cashOut = clPayroll + spaSalaries + paidOpex;
      balance += cashIn - cashOut;
      return {
        key: m.key,
        label: m.label,
        clRevenue,
        spaRevenue,
        revenue,
        clPayroll,
        spaSalaries,
        opexByCategory,
        opex,
        paidOpex,
        grossProfit,
        costs,
        profit: revenue - costs,
        cashIn,
        cashOut,
        netCash: cashIn - cashOut,
        closingBalance: balance,
      };
    });
  }, [expenses, spaSalaries]);

  const monthIndex = series.findIndex((s) => s.key === month);
  const current = series[monthIndex];
  const previous = monthIndex > 0 ? series[monthIndex - 1] : undefined;
  const ytd = series.slice(0, monthIndex + 1);

  return (
    <PageShell
      title="Financial Management"
      subtitle="Company P&L, expenses, customer receivables, cash flow and budget — in one place."
      icon={Landmark}
      accentColor="#c98a3b"
      headerAction={
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none rounded-full border border-black/10 bg-white py-2 pl-4 pr-9 text-sm font-medium text-brand-ink"
          >
            {FINANCE_MONTHS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label} 2026{m.key === CURRENT_FINANCE_MONTH ? ' (current)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        </div>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'pnl' && <PnLTab series={series} current={current} previous={previous} ytd={ytd} />}
      {tab === 'expenses' && <ExpensesTab month={month} expenses={expenses} />}
      {tab === 'receivables' && <ReceivablesTab payments={payments} />}
      {tab === 'cashflow' && <CashFlowTab series={series} current={current} budgets={budgets} />}
      <div className="h-6" />
    </PageShell>
  );
}

function Kpi({ label, value, hint, icon, tone = 'text-brand-ink' }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: string }) {
  return (
    <Card>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {icon} {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
      {hint && <div className="mt-0.5 text-xs text-brand-muted">{hint}</div>}
    </Card>
  );
}

function Delta({ now, before, invert = false }: { now: number; before?: number; invert?: boolean }) {
  if (before === undefined || before === 0) return <span>—</span>;
  const change = Math.round(((now - before) / Math.abs(before)) * 100);
  const good = invert ? change <= 0 : change >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${good ? 'text-brand-green' : 'text-red-600'}`}>
      {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {change >= 0 ? '+' : ''}
      {change}% vs last month
    </span>
  );
}

/* ───────────────────────────── P&L ───────────────────────────── */

function PnLTab({ series, current, previous, ytd }: { series: MonthFinancials[]; current: MonthFinancials; previous?: MonthFinancials; ytd: MonthFinancials[] }) {
  const { logAction } = useActivityLog();
  const sumYtd = (pick: (m: MonthFinancials) => number) => ytd.reduce((s, m) => s + pick(m), 0);

  const lines: { label: string; pick: (m: MonthFinancials) => number; kind: 'item' | 'subtotal' | 'total' | 'cost'; indent?: boolean }[] = [
    { label: 'CL home-care packages', pick: (m) => m.clRevenue, kind: 'item', indent: true },
    { label: 'Honey Spa Bangi treatments', pick: (m) => m.spaRevenue, kind: 'item', indent: true },
    { label: 'Total revenue', pick: (m) => m.revenue, kind: 'subtotal' },
    { label: 'CL payroll', pick: (m) => -m.clPayroll, kind: 'cost', indent: true },
    { label: 'Spa staff salaries', pick: (m) => -m.spaSalaries, kind: 'cost', indent: true },
    { label: 'Gross profit', pick: (m) => m.grossProfit, kind: 'subtotal' },
    ...EXPENSE_CATEGORIES.map((c) => ({ label: c, pick: (m: MonthFinancials) => -m.opexByCategory[c], kind: 'cost' as const, indent: true })),
    { label: 'Total operating expenses', pick: (m) => -m.opex, kind: 'subtotal' },
    { label: 'Net profit', pick: (m) => m.profit, kind: 'total' },
  ];

  function exportPnL() {
    downloadCSV(`nrmc-pnl-${current.key}.csv`, [
      ['Line', monthLabel(current.key), previous ? monthLabel(previous.key) : 'Previous', 'YTD'],
      ...lines.map((l) => [l.label, l.pick(current), previous ? l.pick(previous) : '', sumYtd(l.pick)]),
    ]);
    logAction('Admin Amy', 'Exported P&L report', monthLabel(current.key));
  }

  const margin = pct(current.profit, current.revenue);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total revenue"
          icon={<TrendingUp size={12} className="text-brand-green" />}
          value={formatRM(current.revenue)}
          hint={<Delta now={current.revenue} before={previous?.revenue} />}
        />
        <Kpi
          label="Total costs"
          icon={<Wallet size={12} className="text-brand-amber" />}
          value={formatRM(current.costs)}
          hint={<Delta now={current.costs} before={previous?.costs} invert />}
        />
        <Kpi
          label="Net profit"
          icon={<PiggyBank size={12} className="text-brand-pink" />}
          value={formatRM(current.profit)}
          tone={current.profit >= 0 ? 'text-brand-ink' : 'text-red-600'}
          hint={<Delta now={current.profit} before={previous?.profit} />}
        />
        <Kpi
          label="Net margin"
          value={`${margin}%`}
          tone={margin >= 0 ? 'text-brand-ink' : 'text-red-600'}
          hint={`YTD margin ${pct(sumYtd((m) => m.profit), sumYtd((m) => m.revenue))}%`}
        />
      </div>

      <Card className="mt-5">
        <SectionTitle action={<span className="text-xs text-brand-muted">Jan – Aug 2026</span>}>Revenue, costs &amp; net profit</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
            <YAxis hide />
            <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name="Revenue" fill="#d94f8c" radius={[6, 6, 0, 0]}>
              {series.map((m) => (
                <Cell key={m.key} fill="#d94f8c" fillOpacity={m.key === current.key ? 1 : 0.55} />
              ))}
            </Bar>
            <Bar dataKey="costs" name="Costs" fill="#c98a3b" radius={[6, 6, 0, 0]}>
              {series.map((m) => (
                <Cell key={m.key} fill="#c98a3b" fillOpacity={m.key === current.key ? 1 : 0.55} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="profit" name="Net profit" stroke="#3c6f57" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Card className="mt-5 !p-0 overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-2">
          <h2 className="text-lg font-semibold text-brand-ink">Profit &amp; loss statement</h2>
          <button
            onClick={exportPnL}
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-brand-ink hover:bg-brand-cream"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Line item</th>
                <th className="px-5 py-3 text-right font-medium">{monthLabel(current.key)}</th>
                <th className="px-5 py-3 text-right font-medium">{previous ? monthLabel(previous.key) : 'Previous month'}</th>
                <th className="px-5 py-3 text-right font-medium">YTD</th>
                <th className="px-5 py-3 text-right font-medium">% of revenue</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => {
                const v = l.pick(current);
                const rowClass =
                  l.kind === 'total'
                    ? 'border-t-2 border-brand-ink/20 bg-brand-green-light/60 font-semibold'
                    : l.kind === 'subtotal'
                      ? 'border-t border-black/10 bg-brand-cream font-semibold'
                      : 'border-t border-black/5';
                const money = (n: number) => (
                  <span className={l.kind === 'total' && n < 0 ? 'text-red-600' : n < 0 ? 'text-brand-muted' : 'text-brand-ink'}>
                    {n < 0 ? `(${formatRM(Math.abs(n))})` : formatRM(n)}
                  </span>
                );
                return (
                  <tr key={l.label} className={rowClass}>
                    <td className={`px-5 py-2.5 ${l.indent ? 'pl-9 text-brand-muted' : 'text-brand-ink'}`}>{l.label}</td>
                    <td className="px-5 py-2.5 text-right">{money(v)}</td>
                    <td className="px-5 py-2.5 text-right">{previous ? money(l.pick(previous)) : '—'}</td>
                    <td className="px-5 py-2.5 text-right">{money(sumYtd(l.pick))}</td>
                    <td className="px-5 py-2.5 text-right text-brand-muted">{pct(Math.abs(v), current.revenue)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-5 py-3 text-[11px] text-brand-muted">
          Costs shown in brackets. Spa staff salaries use the current Honey Spa Bangi payroll from the Spa Directory; operating expenses come from the Expenses ledger
          (paid and unpaid, i.e. accrual basis).
        </p>
      </Card>
    </>
  );
}

/* ───────────────────────────── Expenses ───────────────────────────── */

function ExpensesTab({ month, expenses }: { month: string; expenses: Expense[] }) {
  const { addExpense, setExpenseStatus, removeExpense } = useFinanceStore();
  const { logAction } = useActivityLog();
  const [category, setCategory] = useState<ExpenseCategory | 'all'>('all');
  const [status, setStatus] = useState<'all' | Expense['status']>('all');
  const [showAdd, setShowAdd] = useState(false);

  const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
  const rows = monthExpenses.filter((e) => (category === 'all' || e.category === category) && (status === 'all' || e.status === status));
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const unpaid = monthExpenses.filter((e) => e.status === 'unpaid');
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    category: c,
    amount: monthExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const largest = byCategory[0];

  function exportExpenses() {
    downloadCSV(`nrmc-expenses-${month}.csv`, [
      ['Date', 'Description', 'Vendor', 'Category', 'Amount (RM)', 'Status'],
      ...rows.map((e) => [e.date, e.description, e.vendor, e.category, e.amount, e.status]),
    ]);
    logAction('Admin Amy', 'Exported expenses', monthLabel(month));
  }

  function toggleStatus(e: Expense) {
    const next = e.status === 'paid' ? 'unpaid' : 'paid';
    setExpenseStatus(e.id, next);
    logAction('Admin Amy', next === 'paid' ? 'Marked expense paid' : 'Marked expense unpaid', `${e.description} · ${formatRM(e.amount)}`);
  }

  function handleRemove(e: Expense) {
    if (!window.confirm(`Delete "${e.description}" (${formatRM(e.amount)})?`)) return;
    removeExpense(e.id);
    logAction('Admin Amy', 'Deleted expense', `${e.description} · ${formatRM(e.amount)}`);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={`Expenses · ${monthLabel(month)}`} icon={<Receipt size={12} />} value={formatRM(total)} hint={`${monthExpenses.length} entries`} />
        <Kpi
          label="Unpaid bills"
          icon={<AlertTriangle size={12} className="text-brand-amber" />}
          value={formatRM(unpaid.reduce((s, e) => s + e.amount, 0))}
          tone={unpaid.length ? 'text-brand-amber' : 'text-brand-ink'}
          hint={`${unpaid.length} awaiting payment`}
        />
        <Kpi label="Largest category" value={largest ? largest.category : '—'} hint={largest ? `${formatRM(largest.amount)} · ${pct(largest.amount, total)}% of spend` : undefined} />
        <Card className="flex items-center justify-center">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-pink-dark"
          >
            <Plus size={15} /> Add Expense
          </button>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2 !p-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-4">
            <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory | 'all')} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-brand-ink">
              <option value="all">All categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {(['all', 'paid', 'unpaid'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                  status === s ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
                }`}
              >
                {s}
              </button>
            ))}
            <button
              onClick={exportExpenses}
              className="ml-auto flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-brand-ink hover:bg-brand-cream"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-brand-muted">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-t border-black/5 hover:bg-brand-cream/60">
                    <td className="whitespace-nowrap px-4 py-2.5 text-brand-muted">{formatDateLabel(e.date)}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-brand-ink">{e.description}</p>
                      <p className="text-[11px] text-brand-muted">{e.vendor}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-brand-muted">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: expenseCategoryColors[e.category] }} />
                        {e.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium text-brand-ink">{formatRM(e.amount)}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => toggleStatus(e)}
                        title={e.status === 'paid' ? 'Mark as unpaid' : 'Mark as paid'}
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          e.status === 'paid' ? 'bg-brand-green-light text-brand-green' : 'bg-brand-amber-light text-brand-amber hover:bg-brand-amber hover:text-white'
                        }`}
                      >
                        {e.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => handleRemove(e)} className="text-brand-muted hover:text-red-600" title="Delete expense">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-brand-muted">
                      No expenses match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="h-2" />
        </Card>

        <Card className="h-fit">
          <SectionTitle>Spend by category</SectionTitle>
          <div className="space-y-3">
            {byCategory.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-brand-ink">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: expenseCategoryColors[c.category] }} />
                    {c.category}
                  </span>
                  <span className="text-brand-muted">{formatRM(c.amount)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-brand-cream">
                  <div className="h-2 rounded-full" style={{ width: `${pct(c.amount, total)}%`, backgroundColor: expenseCategoryColors[c.category] }} />
                </div>
              </div>
            ))}
            {byCategory.length === 0 && <p className="text-sm text-brand-muted">No expenses recorded this month.</p>}
          </div>
        </Card>
      </div>

      {showAdd && (
        <AddExpenseModal
          defaultDate={month === CURRENT_FINANCE_MONTH ? TODAY_STR : `${month}-01`}
          onClose={() => setShowAdd(false)}
          onSubmit={(input) => {
            addExpense(input);
            logAction('Admin Amy', 'Added expense', `${input.description} · ${formatRM(input.amount)} (${input.category})`);
            setShowAdd(false);
          }}
        />
      )}
    </>
  );
}

function AddExpenseModal({ defaultDate, onClose, onSubmit }: { defaultDate: string; onClose: () => void; onSubmit: (e: Omit<Expense, 'id'>) => void }) {
  const [date, setDate] = useState(defaultDate);
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Expense['status']>('paid');
  const canSubmit = description.trim() && Number(amount) > 0 && date;

  return (
    <Modal title="Add expense" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 p-5">
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-brand-muted">Description *</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Herbal bath stock top-up" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-muted">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className={inputClass}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-muted">Vendor</label>
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Supplier name" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-muted">Amount (RM) *</label>
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-muted">Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2 flex gap-2">
          {(['paid', 'unpaid'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm capitalize ${status === s ? 'bg-brand-green text-white' : 'border border-black/10 text-brand-ink'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <ModalFooter
        onClose={onClose}
        disabled={!canSubmit}
        label="Add expense"
        onConfirm={() => onSubmit({ date, category, description: description.trim(), vendor: vendor.trim() || '—', amount: Number(amount), status })}
      />
    </Modal>
  );
}

/* ───────────────────────────── Receivables ───────────────────────────── */

const receivableStyles: Record<ReceivableStatus, string> = {
  'Paid in full': 'bg-brand-green-light text-brand-green',
  'Deposit paid': 'bg-blue-100 text-blue-700',
  'Awaiting deposit': 'bg-brand-amber-light text-brand-amber',
  'Awaiting payment': 'bg-gray-100 text-gray-600',
  Overdue: 'bg-red-100 text-red-600',
};

const receivableFilters: ('All' | ReceivableStatus)[] = ['All', 'Overdue', 'Awaiting deposit', 'Awaiting payment', 'Deposit paid', 'Paid in full'];

function ReceivablesTab({ payments }: { payments: ReturnType<typeof useFinanceStore>['payments'] }) {
  const { clients, clientById } = useClientStore();
  const { packageById } = useSettings();
  const { recordPayment } = useFinanceStore();
  const { logAction } = useActivityLog();
  const [filter, setFilter] = useState<'All' | ReceivableStatus>('All');
  const [paying, setPaying] = useState<Receivable | null>(null);

  const receivables = useMemo(
    () =>
      clients
        .map((c) => receivableFor(c, payments, packageById))
        .filter((r): r is Receivable => r !== null)
        .sort((a, b) => b.outstanding - a.outstanding),
    [clients, payments, packageById],
  );

  const billed = receivables.reduce((s, r) => s + r.billed, 0);
  const collected = receivables.reduce((s, r) => s + Math.min(r.paid, r.billed), 0);
  const outstanding = receivables.reduce((s, r) => s + r.outstanding, 0);
  const overdue = receivables.filter((r) => r.status === 'Overdue');
  const awaitingDeposit = receivables.filter((r) => r.status === 'Awaiting deposit');
  const rows = filter === 'All' ? receivables : receivables.filter((r) => r.status === filter);

  function exportReceivables() {
    downloadCSV('nrmc-receivables.csv', [
      ['Customer', 'Billed (RM)', 'Deposit required (RM)', 'Paid (RM)', 'Outstanding (RM)', 'Balance due', 'Status'],
      ...rows.map((r) => [r.client.name, r.billed, r.depositRequired, r.paid, r.outstanding, r.dueDate, r.status]),
    ]);
    logAction('Admin Amy', 'Exported receivables report', `${rows.length} customers`);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total billed" icon={<Receipt size={12} />} value={formatRM(billed)} hint={`${receivables.length} customers with packages`} />
        <Kpi label="Collected" icon={<CheckCircle2 size={12} className="text-brand-green" />} value={formatRM(collected)} hint={`${pct(collected, billed)}% of billed`} />
        <Kpi label="Outstanding" icon={<HandCoins size={12} className="text-brand-amber" />} value={formatRM(outstanding)} tone="text-brand-amber" hint={`${awaitingDeposit.length} still owe a deposit`} />
        <Kpi
          label="Overdue balances"
          icon={<AlertTriangle size={12} className="text-red-500" />}
          value={formatRM(overdue.reduce((s, r) => s + r.outstanding, 0))}
          tone={overdue.length ? 'text-red-600' : 'text-brand-ink'}
          hint={`${overdue.length} customers past their start date`}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-3">
        <Card className="2xl:col-span-2 !p-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-4">
            {receivableFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  filter === f ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={exportReceivables}
              className="ml-auto flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-brand-ink hover:bg-brand-cream"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-brand-muted">
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 text-right font-medium">Billed</th>
                  <th className="px-4 py-2.5 text-right font-medium">Deposit</th>
                  <th className="px-4 py-2.5 text-right font-medium">Paid</th>
                  <th className="px-4 py-2.5 text-right font-medium">Outstanding</th>
                  <th className="px-4 py-2.5 font-medium">Balance due</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.client.id} className="border-t border-black/5 hover:bg-brand-cream/60">
                    <td className="px-4 py-2.5">
                      <Link to={`/customers/${r.client.id}`} className="flex items-center gap-2 hover:underline">
                        <Avatar name={r.client.name} size={26} />
                        <span className="whitespace-nowrap text-brand-ink">{r.client.name}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-brand-ink">{formatRM(r.billed)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-brand-muted">{r.depositRequired ? formatRM(r.depositRequired) : '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-brand-muted">{formatRM(r.paid)}</td>
                    <td className={`whitespace-nowrap px-4 py-2.5 text-right font-medium ${r.outstanding ? 'text-brand-ink' : 'text-brand-muted'}`}>{formatRM(r.outstanding)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-brand-muted">{r.dueDate ? formatDateLabel(r.dueDate) : '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${receivableStyles[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {r.outstanding > 0 && (
                        <button onClick={() => setPaying(r)} className="whitespace-nowrap text-xs font-medium text-brand-pink hover:underline">
                          Record payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-brand-muted">
                      No customers in this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="h-2" />
        </Card>

        <Card className="h-fit">
          <SectionTitle>Recent payments</SectionTitle>
          <div className="space-y-2.5">
            {payments.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-brand-ink">{clientById(p.clientId)?.name ?? 'Customer'}</p>
                  <p className="text-[11px] capitalize text-brand-muted">
                    {formatDateLabel(p.date)} · {p.kind} · {methodLabels[p.method]}
                  </p>
                </div>
                <span className="shrink-0 font-medium text-brand-green">+{formatRM(p.amount)}</span>
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-brand-muted">No payments recorded yet.</p>}
          </div>
        </Card>
      </div>

      {paying && (
        <RecordPaymentModal
          receivable={paying}
          onClose={() => setPaying(null)}
          onSubmit={(input) => {
            recordPayment({ ...input, clientId: paying.client.id });
            logAction('Admin Amy', 'Recorded customer payment', `${paying.client.name} · ${formatRM(input.amount)} ${input.kind}`);
            setPaying(null);
          }}
        />
      )}
    </>
  );
}

function RecordPaymentModal({
  receivable,
  onClose,
  onSubmit,
}: {
  receivable: Receivable;
  onClose: () => void;
  onSubmit: (p: { date: string; amount: number; kind: CustomerPaymentKind; method: PaymentMethod }) => void;
}) {
  const owesDeposit = receivable.paid < receivable.depositRequired;
  const [kind, setKind] = useState<CustomerPaymentKind>(owesDeposit ? 'deposit' : 'balance');
  const [amount, setAmount] = useState(String(owesDeposit ? receivable.depositRequired - receivable.paid : receivable.outstanding));
  const [method, setMethod] = useState<PaymentMethod>('bank-transfer');
  const [date, setDate] = useState(TODAY_STR);
  const value = Number(amount);
  const canSubmit = value > 0 && value <= receivable.outstanding && date;

  function pickKind(k: CustomerPaymentKind) {
    setKind(k);
    if (k === 'deposit') setAmount(String(Math.max(0, receivable.depositRequired - receivable.paid)));
    else setAmount(String(receivable.outstanding));
  }

  return (
    <Modal title={`Record payment — ${receivable.client.name}`} onClose={onClose}>
      <div className="space-y-3 p-5">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-brand-cream p-3 text-center text-xs">
          <div>
            <p className="text-brand-muted">Billed</p>
            <p className="font-semibold text-brand-ink">{formatRM(receivable.billed)}</p>
          </div>
          <div>
            <p className="text-brand-muted">Paid</p>
            <p className="font-semibold text-brand-ink">{formatRM(receivable.paid)}</p>
          </div>
          <div>
            <p className="text-brand-muted">Outstanding</p>
            <p className="font-semibold text-brand-amber">{formatRM(receivable.outstanding)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['deposit', 'balance', 'full'] as const)
            .filter((k) => k !== 'deposit' || owesDeposit)
            .map((k) => (
              <button
                key={k}
                onClick={() => pickKind(k)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm capitalize ${kind === k ? 'bg-brand-green text-white' : 'border border-black/10 text-brand-ink'}`}
              >
                {k}
              </button>
            ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Amount (RM)</label>
            <input type="number" min={0} max={receivable.outstanding} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Date received</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-muted">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
            {Object.entries(methodLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        {value > receivable.outstanding && <p className="text-xs text-red-600">Amount is more than the outstanding balance.</p>}
      </div>
      <ModalFooter onClose={onClose} disabled={!canSubmit} label="Record payment" onConfirm={() => onSubmit({ date, amount: value, kind, method })} />
    </Modal>
  );
}

/* ───────────────────────────── Cash flow & budget ───────────────────────────── */

function CashFlowTab({ series, current, budgets }: { series: MonthFinancials[]; current: MonthFinancials; budgets: Record<ExpenseCategory, number> }) {
  const { setBudget } = useFinanceStore();
  const { logAction } = useActivityLog();
  const visible = series.slice(0, series.indexOf(current) + 1);
  const totalBudget = EXPENSE_CATEGORIES.reduce((s, c) => s + budgets[c], 0);
  const overBudget = EXPENSE_CATEGORIES.filter((c) => current.opexByCategory[c] > budgets[c]);
  const budgetChart = EXPENSE_CATEGORIES.map((c) => ({ name: c.split(' ')[0], category: c, budget: budgets[c], actual: current.opexByCategory[c] }));

  function exportCashFlow() {
    downloadCSV('nrmc-cash-flow-2026.csv', [
      ['Month', 'Cash in (RM)', 'Cash out (RM)', 'Net cash flow (RM)', 'Closing balance (RM)'],
      ...visible.map((m) => [monthLabel(m.key), m.cashIn, m.cashOut, m.netCash, m.closingBalance]),
    ]);
    logAction('Admin Amy', 'Exported cash flow report', `Jan – ${monthLabel(current.key)}`);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Cash in" icon={<ArrowDownCircle size={12} className="text-brand-green" />} value={formatRM(current.cashIn)} hint="Customer collections (CL + Honey Spa)" />
        <Kpi label="Cash out" icon={<ArrowUpCircle size={12} className="text-brand-amber" />} value={formatRM(current.cashOut)} hint="Payroll, salaries & paid bills" />
        <Kpi
          label="Net cash flow"
          value={`${current.netCash >= 0 ? '+' : '−'}${formatRM(Math.abs(current.netCash))}`}
          tone={current.netCash >= 0 ? 'text-brand-green' : 'text-red-600'}
          hint={monthLabel(current.key)}
        />
        <Kpi label="Closing cash balance" icon={<Landmark size={12} className="text-brand-pink" />} value={formatRM(current.closingBalance)} hint={`Opened the year at ${formatRM(OPENING_CASH_BALANCE)}`} />
      </div>

      <Card className="mt-5">
        <SectionTitle
          action={
            <button
              onClick={exportCashFlow}
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-brand-ink hover:bg-brand-cream"
            >
              <Download size={13} /> Export CSV
            </button>
          }
        >
          Monthly cash flow &amp; running balance
        </SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={visible}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
            <YAxis yAxisId="flow" hide />
            <YAxis yAxisId="balance" orientation="right" hide />
            <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="flow" dataKey="cashIn" name="Cash in" fill="#3c6f57" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="flow" dataKey="cashOut" name="Cash out" fill="#c98a3b" radius={[6, 6, 0, 0]} />
            <Line yAxisId="balance" type="monotone" dataKey="closingBalance" name="Cash balance" stroke="#d94f8c" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-3 py-2 font-medium">Month</th>
                <th className="px-3 py-2 text-right font-medium">Cash in</th>
                <th className="px-3 py-2 text-right font-medium">Cash out</th>
                <th className="px-3 py-2 text-right font-medium">Net</th>
                <th className="px-3 py-2 text-right font-medium">Closing balance</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.key} className={`border-t border-black/5 ${m.key === current.key ? 'bg-brand-cream font-medium' : ''}`}>
                  <td className="px-3 py-2 text-brand-ink">{monthLabel(m.key)}</td>
                  <td className="px-3 py-2 text-right text-brand-green">{formatRM(m.cashIn)}</td>
                  <td className="px-3 py-2 text-right text-brand-amber">{formatRM(m.cashOut)}</td>
                  <td className={`px-3 py-2 text-right ${m.netCash >= 0 ? 'text-brand-ink' : 'text-red-600'}`}>
                    {m.netCash >= 0 ? '+' : '−'}
                    {formatRM(Math.abs(m.netCash))}
                  </td>
                  <td className="px-3 py-2 text-right text-brand-ink">{formatRM(m.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <SectionTitle action={<span className="text-xs text-brand-muted">Edit a budget to update it for every month</span>}>
            Budget vs. actual · {monthLabel(current.key)}
          </SectionTitle>
          <div className="space-y-3">
            {EXPENSE_CATEGORIES.map((c) => {
              const actual = current.opexByCategory[c];
              const budget = budgets[c];
              const used = pct(actual, budget);
              const over = actual > budget;
              return (
                <div key={c} className="grid grid-cols-12 items-center gap-3">
                  <span className="col-span-4 flex items-center gap-1.5 text-xs text-brand-ink">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: expenseCategoryColors[c] }} />
                    {c}
                  </span>
                  <div className="col-span-5">
                    <div className="h-2 rounded-full bg-brand-cream">
                      <div className={`h-2 rounded-full ${over ? 'bg-red-500' : 'bg-brand-green'}`} style={{ width: `${Math.min(100, used)}%` }} />
                    </div>
                    <p className={`mt-0.5 text-[10px] ${over ? 'font-medium text-red-600' : 'text-brand-muted'}`}>
                      {formatRM(actual)} spent · {used}%{over ? ` · ${formatRM(actual - budget)} over` : ''}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <BudgetInput
                      value={budget}
                      onCommit={(amount) => {
                        setBudget(c, amount);
                        logAction('Admin Amy', 'Updated monthly budget', `${c} → ${formatRM(amount)}`);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
            <span className="text-brand-muted">Total operating budget</span>
            <span className="font-semibold text-brand-ink">
              {formatRM(current.opex)} <span className="font-normal text-brand-muted">of {formatRM(totalBudget)}</span>
            </span>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <SectionTitle>Budget health</SectionTitle>
          {overBudget.length > 0 ? (
            <div className="mb-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle size={13} /> {overBudget.length} {overBudget.length === 1 ? 'category is' : 'categories are'} over budget
              </p>
              <p className="mt-1">{overBudget.join(', ')}</p>
            </div>
          ) : (
            <div className="mb-3 rounded-xl bg-brand-green-light p-3 text-xs text-brand-green">
              <p className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={13} /> All categories within budget
              </p>
            </div>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetChart} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: '#8b7d87', fontSize: 11 }} />
              <Tooltip formatter={(v) => formatRM(Number(v))} labelFormatter={(_, p) => p?.[0]?.payload?.category ?? ''} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="budget" name="Budget" fill="#e3f0e8" radius={[0, 6, 6, 0]} />
              <Bar dataKey="actual" name="Actual" radius={[0, 6, 6, 0]}>
                {budgetChart.map((b) => (
                  <Cell key={b.category} fill={b.actual > b.budget ? '#dc2626' : '#3c6f57'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}

function BudgetInput({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  function commit() {
    if (draft === null) return;
    const n = Number(draft);
    if (n >= 0 && n !== value) onCommit(n);
    setDraft(null);
  }
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted">RM</span>
      <input
        type="number"
        min={0}
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="w-full rounded-lg border border-black/10 py-1.5 pl-7 pr-2 text-right text-xs text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
        aria-label="Monthly budget"
      />
    </div>
  );
}

/* ───────────────────────────── Shared modal chrome ───────────────────────────── */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <p className="text-sm font-semibold text-brand-ink">{title}</p>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onClose, onConfirm, disabled, label }: { onClose: () => void; onConfirm: () => void; disabled: boolean; label: string }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-black/5 p-4">
      <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-brand-muted hover:bg-brand-cream">
        Cancel
      </button>
      <button disabled={disabled} onClick={onConfirm} className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white disabled:opacity-30">
        {label}
      </button>
    </div>
  );
}
