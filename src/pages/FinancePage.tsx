import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Download, Plus, X, Trash2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { PageShell } from '../components/PageShell';
import { Card, StatCard, SectionTitle, Avatar, formatRM } from '../components/ui';
import { useFinanceStore } from '../store/FinanceStore';
import { useClientStore } from '../store/ClientStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { monthlyRevenue, monthlyPayroll } from '../data/reports';
import { FINANCE_MONTHS, CURRENT_FINANCE_MONTH, OPENING_CASH_BALANCE, EXPENSE_CATEGORIES, expenseCategoryColors } from '../data/finance';
import { receivableFor, type Receivable, type ReceivableStatus } from '../lib/finance';
import { downloadCSV } from '../lib/csv';
import { formatDateLabel, TODAY_STR } from '../lib/date';
import type { CustomerPayment, CustomerPaymentKind, Expense, ExpenseCategory, PaymentMethod } from '../types';

type Tab = 'pnl' | 'expenses' | 'receivables' | 'cashflow';

const tabs: { id: Tab; label: string }[] = [
  { id: 'pnl', label: 'Profit & loss' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'receivables', label: 'Receivables & deposits' },
  { id: 'cashflow', label: 'Cash flow & budget' },
];

// Brand chart palette, same as Reports.
const C = {
  magenta: '#c42474',
  lavender: '#6f76b0',
  lavenderLight: '#e8e9f6',
  honey: '#d9921f',
  muted: '#8a7f8c',
  grid: '#f3e6ed',
};

const tooltipStyle: CSSProperties = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 6px 20px rgba(31, 26, 36, 0.12)', // taste-skill-ignore: overlay
  fontSize: 13,
};
const axisTick = { fill: C.muted, fontSize: 12 };

const inputCls = 'w-full rounded-lg bg-brand-cream px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink';
const pillButton =
  'flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink';
const primaryButton =
  'flex items-center gap-1.5 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 disabled:opacity-30';

function chip(active: boolean) {
  return `rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
    active ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
  }`;
}

const methodLabels: Record<PaymentMethod, string> = { 'bank-transfer': 'Bank transfer', cash: 'Cash', 'e-wallet': 'E-wallet' };

interface MonthFinancials {
  key: string;
  label: string;
  revenue: number;
  payroll: number;
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

function signedRM(n: number) {
  return `${n >= 0 ? '+' : '−'}${formatRM(Math.abs(n))}`;
}

export default function FinancePage() {
  const { expenses, payments, budgets } = useFinanceStore();
  const [tab, setTab] = useState<Tab>('pnl');
  const [month, setMonth] = useState<string>(CURRENT_FINANCE_MONTH);

  const series = useMemo<MonthFinancials[]>(() => {
    let balance = OPENING_CASH_BALANCE;
    return FINANCE_MONTHS.map((m) => {
      const revenue = monthlyRevenue.find((r) => r.month === m.label)?.revenue ?? 0;
      const payroll = monthlyPayroll.find((p) => p.month === m.label)?.payroll ?? 0;
      const monthExpenses = expenses.filter((e) => e.date.startsWith(m.key));
      const opexByCategory = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, 0])) as Record<ExpenseCategory, number>;
      monthExpenses.forEach((e) => {
        opexByCategory[e.category] += e.amount;
      });
      const opex = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const paidOpex = monthExpenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
      const cashOut = payroll + paidOpex;
      balance += revenue - cashOut;
      return {
        key: m.key,
        label: m.label,
        revenue,
        payroll,
        opexByCategory,
        opex,
        paidOpex,
        grossProfit: revenue - payroll,
        costs: payroll + opex,
        profit: revenue - payroll - opex,
        cashIn: revenue,
        cashOut,
        netCash: revenue - cashOut,
        closingBalance: balance,
      };
    });
  }, [expenses]);

  const monthIndex = series.findIndex((s) => s.key === month);
  const current = series[monthIndex];
  const previous = monthIndex > 0 ? series[monthIndex - 1] : undefined;
  const ytd = series.slice(0, monthIndex + 1);

  return (
    <PageShell
      title="Financial management"
      subtitle="Profit and loss, expenses, what customers owe, cash flow and budget for Honey Spa Bangi."
      headerAction={
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Month"
            className="appearance-none rounded-full bg-white py-2.5 pl-5 pr-10 text-sm font-medium text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            {FINANCE_MONTHS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label} 2026
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted" />
        </div>
      }
    >
      <div className="mb-8 inline-flex flex-wrap gap-1 rounded-full bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              tab === t.id ? 'bg-brand-pink text-white' : 'text-brand-ink hover:bg-brand-pink-light'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pnl' && <PnLTab series={series} current={current} previous={previous} ytd={ytd} />}
      {tab === 'expenses' && <ExpensesTab month={month} expenses={expenses} />}
      {tab === 'receivables' && <ReceivablesTab payments={payments} />}
      {tab === 'cashflow' && <CashFlowTab series={series} current={current} budgets={budgets} />}
    </PageShell>
  );
}

function Delta({ now, before, invert = false }: { now: number; before?: number; invert?: boolean }) {
  if (before === undefined || before === 0) return null;
  const change = Math.round(((now - before) / Math.abs(before)) * 100);
  const good = invert ? change <= 0 : change >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${good ? 'text-brand-lavender' : 'text-red-600'}`}>
      {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {change >= 0 ? '+' : ''}
      {change}% vs last month
    </span>
  );
}

/* ───────────────────────────── Profit & loss ───────────────────────────── */

interface PnLLine {
  label: string;
  pick: (m: MonthFinancials) => number;
  kind: 'item' | 'subtotal' | 'total';
}

function PnLTab({ series, current, previous, ytd }: { series: MonthFinancials[]; current: MonthFinancials; previous?: MonthFinancials; ytd: MonthFinancials[] }) {
  const { logAction } = useActivityLog();
  const sumYtd = (pick: (m: MonthFinancials) => number) => ytd.reduce((s, m) => s + pick(m), 0);

  const lines: PnLLine[] = [
    { label: 'Treatment sessions (spa & home service)', pick: (m) => m.revenue, kind: 'item' },
    { label: 'Total revenue', pick: (m) => m.revenue, kind: 'subtotal' },
    { label: 'Staff payroll (CL & spa staff)', pick: (m) => -m.payroll, kind: 'item' },
    { label: 'Gross profit', pick: (m) => m.grossProfit, kind: 'subtotal' },
    ...EXPENSE_CATEGORIES.map((c): PnLLine => ({ label: c, pick: (m) => -m.opexByCategory[c], kind: 'item' })),
    { label: 'Total operating expenses', pick: (m) => -m.opex, kind: 'subtotal' },
    { label: 'Net profit', pick: (m) => m.profit, kind: 'total' },
  ];

  function exportPnL() {
    downloadCSV(`honeyspa-pnl-${current.key}.csv`, [
      ['Line', monthLabel(current.key), previous ? monthLabel(previous.key) : 'Previous', 'Year to date'],
      ...lines.map((l) => [l.label, l.pick(current), previous ? l.pick(previous) : '', sumYtd(l.pick)]),
    ]);
    logAction('Front Desk', 'Exported P&L report', monthLabel(current.key));
  }

  const margin = pct(current.profit, current.revenue);
  const money = (n: number, kind: PnLLine['kind']) => (
    <span className={kind === 'total' && n < 0 ? 'text-red-600' : n < 0 ? 'text-brand-muted' : 'text-brand-ink'}>
      {n < 0 ? `(${formatRM(Math.abs(n))})` : formatRM(n)}
    </span>
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Revenue, ${monthLabel(current.key)}`} value={formatRM(current.revenue)} hint={<Delta now={current.revenue} before={previous?.revenue} />} className="p-6" />
        <StatCard label="Total costs" value={formatRM(current.costs)} hint={<Delta now={current.costs} before={previous?.costs} invert />} className="p-6" />
        <StatCard label="Net profit" value={formatRM(current.profit)} hint={<Delta now={current.profit} before={previous?.profit} />} className="p-6" />
        <StatCard
          label="Net margin"
          value={`${margin}%`}
          hint={<span className="text-sm text-brand-muted">Year to date {pct(sumYtd((m) => m.profit), sumYtd((m) => m.revenue))}%</span>}
          className="p-6"
        />
      </div>

      <Card className="mt-8 p-6">
        <SectionTitle action={<span className="text-sm text-brand-muted">Jan to {monthLabel(current.key)}</span>}>Revenue, costs and profit</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={series.slice(0, series.indexOf(current) + 1)} barGap={4}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
            <YAxis hide />
            <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={tooltipStyle} cursor={{ fill: C.grid, opacity: 0.6 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} iconType="circle" />
            <Bar dataKey="revenue" name="Revenue" fill={C.magenta} radius={[6, 6, 0, 0]}>
              {series.map((m) => (
                <Cell key={m.key} fill={C.magenta} fillOpacity={m.key === current.key ? 1 : 0.55} />
              ))}
            </Bar>
            <Bar dataKey="costs" name="Costs" fill={C.honey} radius={[6, 6, 0, 0]}>
              {series.map((m) => (
                <Cell key={m.key} fill={C.honey} fillOpacity={m.key === current.key ? 1 : 0.55} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="profit" name="Net profit" stroke={C.lavender} strokeWidth={2.5} dot={{ r: 3, fill: C.lavender, strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Card className="mt-8 !p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
          <h2 className="text-lg font-semibold text-brand-ink">Profit and loss statement</h2>
          <button onClick={exportPnL} className={`${pillButton} bg-brand-cream`}>
            <Download size={15} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="px-6 py-4 font-medium"></th>
                <th className="px-6 py-4 text-right font-medium">{monthLabel(current.key)}</th>
                <th className="px-6 py-4 text-right font-medium">{previous ? monthLabel(previous.key) : 'Previous month'}</th>
                <th className="px-6 py-4 text-right font-medium">Year to date</th>
                <th className="px-6 py-4 text-right font-medium">Share of revenue</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {lines.map((l) => {
                const v = l.pick(current);
                const rowClass =
                  l.kind === 'total' ? 'bg-brand-pink-light font-semibold' : l.kind === 'subtotal' ? 'border-t border-black/5 bg-brand-cream font-semibold' : 'border-t border-black/5';
                return (
                  <tr key={l.label} className={rowClass}>
                    <td className={`px-6 py-3 ${l.kind === 'item' ? 'pl-10 text-brand-muted' : 'text-brand-ink'}`}>{l.label}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-right">{money(v, l.kind)}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-right">{previous ? money(l.pick(previous), l.kind) : '–'}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-right">{money(sumYtd(l.pick), l.kind)}</td>
                    <td className="px-6 py-3 text-right text-brand-muted">{pct(Math.abs(v), current.revenue)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-6 py-4 text-sm text-brand-muted">
          Costs are in brackets. Revenue and payroll match Reports. Operating expenses come from the Expenses tab, paid or not.
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
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({ category: c, amount: monthExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  function exportExpenses() {
    downloadCSV(`honeyspa-expenses-${month}.csv`, [
      ['Date', 'Description', 'Vendor', 'Category', 'Amount (RM)', 'Status'],
      ...rows.map((e) => [e.date, e.description, e.vendor, e.category, e.amount, e.status]),
    ]);
    logAction('Front Desk', 'Exported expenses', monthLabel(month));
  }

  function toggleStatus(e: Expense) {
    const next = e.status === 'paid' ? 'unpaid' : 'paid';
    setExpenseStatus(e.id, next);
    logAction('Front Desk', next === 'paid' ? 'Marked expense paid' : 'Marked expense unpaid', `${e.description} · ${formatRM(e.amount)}`);
  }

  function handleRemove(e: Expense) {
    if (!window.confirm(`Delete "${e.description}" (${formatRM(e.amount)})?`)) return;
    removeExpense(e.id);
    logAction('Front Desk', 'Deleted expense', `${e.description} · ${formatRM(e.amount)}`);
  }

  return (
    <>
      <Card className="grid grid-cols-1 gap-6 !p-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
        <div>
          <p className="text-sm text-brand-muted">Spent in {monthLabel(month)}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-brand-pink">{formatRM(total)}</p>
        </div>
        <div>
          <p className="text-sm text-brand-muted">Bills still to pay</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-brand-amber">{formatRM(unpaid.reduce((s, e) => s + e.amount, 0))}</p>
          <p className="mt-1 text-sm text-brand-muted">{unpaid.length} unpaid</p>
        </div>
        <div>
          <p className="text-sm text-brand-muted">Biggest category</p>
          <p className="mt-2 text-xl font-semibold text-brand-ink">{byCategory[0]?.category ?? '–'}</p>
          {byCategory[0] && <p className="mt-1 text-sm text-brand-muted">{pct(byCategory[0].amount, total)}% of spend</p>}
        </div>
        <button onClick={() => setShowAdd(true)} className={`${primaryButton} justify-self-start`}>
          <Plus size={15} /> Add expense
        </button>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(['all', 'paid', 'unpaid'] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`${chip(status === s)} capitalize`}>
                {s}
              </button>
            ))}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory | 'all')}
                aria-label="Category"
                className="appearance-none rounded-full bg-white py-1.5 pl-4 pr-9 text-sm font-medium text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
              >
                <option value="all">All categories</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            </div>
            <button onClick={exportExpenses} className={`${pillButton} ml-auto`}>
              <Download size={15} /> Export CSV
            </button>
          </div>
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-sm text-brand-muted">
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Expense</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 text-right font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id} className="border-t border-black/5 hover:bg-brand-cream/60">{/* taste-skill-ignore: table row */}
                      <td className="whitespace-nowrap px-6 py-3 text-brand-muted">{formatDateLabel(e.date)}</td>
                      <td className="px-6 py-3">
                        <p className="text-brand-ink">{e.description}</p>
                        <p className="text-sm text-brand-muted">{e.vendor}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap text-brand-ink">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: expenseCategoryColors[e.category] }} aria-hidden />
                          {e.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right font-medium tabular-nums text-brand-ink">{formatRM(e.amount)}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => toggleStatus(e)}
                          title={e.status === 'paid' ? 'Mark as unpaid' : 'Mark as paid'}
                          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            e.status === 'paid' ? 'bg-brand-lavender-light text-brand-lavender' : 'bg-brand-amber-light text-brand-amber hover:bg-brand-amber hover:text-white'
                          }`}
                        >
                          {e.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => handleRemove(e)} className="rounded-full p-1 text-brand-muted hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${e.description}`}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-brand-muted">
                        No expenses match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card className="h-fit p-6">
          <SectionTitle>Where the money went</SectionTitle>
          <div className="space-y-4">
            {byCategory.map((c) => (
              <div key={c.category}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-brand-ink">{c.category}</span>
                  <span className="tabular-nums text-brand-muted">{formatRM(c.amount)}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-brand-cream">
                  <div className="h-2 rounded-full" style={{ width: `${pct(c.amount, total)}%`, backgroundColor: expenseCategoryColors[c.category] }} />
                </div>
              </div>
            ))}
            {byCategory.length === 0 && <p className="text-sm text-brand-muted">No expenses this month.</p>}
          </div>
        </Card>
      </div>

      {showAdd && (
        <AddExpenseModal
          defaultDate={month === CURRENT_FINANCE_MONTH ? TODAY_STR : `${month}-01`}
          onClose={() => setShowAdd(false)}
          onSubmit={(input) => {
            addExpense(input);
            logAction('Front Desk', 'Added expense', `${input.description} · ${formatRM(input.amount)} (${input.category})`);
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
  const canSubmit = Boolean(description.trim() && Number(amount) > 0 && date);

  return (
    <Modal title="Add expense" onClose={onClose}>
      <div className="grid grid-cols-2 gap-4 px-6 pt-5">
        <Field label="What was it for? *" className="col-span-2">
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Massage oil top-up" className={inputCls} />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className={inputCls}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Paid to">
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Supplier" className={inputCls} />
        </Field>
        <Field label="Amount (RM) *">
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls} />
        </Field>
        <Field label="Date *">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <div className="col-span-2 flex gap-2">
          {(['paid', 'unpaid'] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`flex-1 ${chip(status === s)} ${status === s ? '' : 'bg-brand-cream'} capitalize`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <ModalFooter
        onClose={onClose}
        disabled={!canSubmit}
        label="Add expense"
        onConfirm={() => onSubmit({ date, category, description: description.trim(), vendor: vendor.trim() || '–', amount: Number(amount), status })}
      />
    </Modal>
  );
}

/* ───────────────────────────── Receivables ───────────────────────────── */

const receivableStyles: Record<ReceivableStatus, string> = {
  'Paid in full': 'bg-brand-lavender-light text-brand-lavender',
  'Part paid': 'bg-blue-100 text-blue-700',
  'Awaiting deposit': 'bg-brand-amber-light text-brand-amber',
  'Awaiting payment': 'bg-gray-100 text-gray-600',
  Overdue: 'bg-red-100 text-red-600',
};

const receivableFilters: ('All' | ReceivableStatus)[] = ['All', 'Overdue', 'Awaiting payment', 'Awaiting deposit', 'Part paid', 'Paid in full'];

function ReceivablesTab({ payments }: { payments: CustomerPayment[] }) {
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
        .sort((a, b) => b.outstanding - a.outstanding || a.client.name.localeCompare(b.client.name)),
    [clients, payments, packageById],
  );

  const billed = receivables.reduce((s, r) => s + r.billed, 0);
  const collected = receivables.reduce((s, r) => s + Math.min(r.paid, r.billed), 0);
  const outstanding = receivables.reduce((s, r) => s + r.outstanding, 0);
  const overdue = receivables.filter((r) => r.status === 'Overdue');
  const deposits = receivables.filter((r) => r.depositRequired > 0);
  const rows = filter === 'All' ? receivables : receivables.filter((r) => r.status === filter);

  function exportReceivables() {
    downloadCSV('honeyspa-receivables.csv', [
      ['Customer', 'Billed (RM)', 'Deposit (RM)', 'Paid (RM)', 'Outstanding (RM)', 'Due', 'Status'],
      ...rows.map((r) => [r.client.name, r.billed, r.depositRequired, r.paid, r.outstanding, r.dueDate, r.status]),
    ]);
    logAction('Front Desk', 'Exported receivables report', `${rows.length} customers`);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Billed" value={formatRM(billed)} hint={<span className="text-sm text-brand-muted">{receivables.length} customers</span>} className="p-6" />
        <StatCard label="Collected" value={formatRM(collected)} hint={<span className="text-sm text-brand-muted">{pct(collected, billed)}% of billed</span>} className="p-6" />
        <StatCard
          label="Still owed"
          value={formatRM(outstanding)}
          hint={<span className="text-sm text-brand-muted">{deposits.length ? `${deposits.length} with a deposit` : 'Paid at the spa, no deposits'}</span>}
          className="p-6"
        />
        <StatCard
          label="Overdue"
          value={<span className={overdue.length ? 'text-red-600' : undefined}>{formatRM(overdue.reduce((s, r) => s + r.outstanding, 0))}</span>}
          hint={<span className="text-sm text-brand-muted">{overdue.length} past their session date</span>}
          className="p-6"
        />
      </div>

      <div className="mt-8 mb-4 flex flex-wrap items-center gap-2">
        {receivableFilters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={chip(filter === f)}>
            {f}
          </button>
        ))}
        <button onClick={exportReceivables} className={`${pillButton} ml-auto`}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_340px]">
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sm text-brand-muted">
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 text-right font-medium">Billed</th>
                  <th className="px-6 py-4 text-right font-medium">Deposit</th>
                  <th className="px-6 py-4 text-right font-medium">Paid</th>
                  <th className="px-6 py-4 text-right font-medium">Still owed</th>
                  <th className="px-6 py-4 font-medium">Due</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {rows.map((r) => (
                  <tr key={r.client.id} className="border-t border-black/5 hover:bg-brand-cream/60">{/* taste-skill-ignore: table row */}
                    <td className="px-6 py-3">
                      <Link to={`/customers/${r.client.id}`} className="flex items-center gap-2.5 hover:underline">
                        <Avatar name={r.client.name} size={28} />
                        <span className="whitespace-nowrap text-brand-ink">{r.client.name}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right text-brand-ink">{formatRM(r.billed)}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-right text-brand-muted">{r.depositRequired ? formatRM(r.depositRequired) : '–'}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-right text-brand-muted">{formatRM(r.paid)}</td>
                    <td className={`whitespace-nowrap px-6 py-3 text-right font-medium ${r.outstanding ? 'text-brand-ink' : 'text-brand-muted'}`}>{formatRM(r.outstanding)}</td>
                    <td className="whitespace-nowrap px-6 py-3 text-brand-muted">{r.dueDate ? formatDateLabel(r.dueDate) : '–'}</td>
                    <td className="px-6 py-3">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${receivableStyles[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {r.outstanding > 0 && (
                        <button onClick={() => setPaying(r)} className="whitespace-nowrap text-sm font-medium text-brand-pink hover:underline">
                          Record payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-brand-muted">
                      No customers with this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="h-fit p-6">
          <SectionTitle>Recent payments</SectionTitle>
          <div className="space-y-3">
            {payments.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-brand-ink">{clientById(p.clientId)?.name ?? 'Customer'}</p>
                  <p className="text-brand-muted">
                    {formatDateLabel(p.date)} · {methodLabels[p.method]}
                  </p>
                </div>
                <span className="shrink-0 font-medium tabular-nums text-brand-lavender">+{formatRM(p.amount)}</span>
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
            logAction('Front Desk', 'Recorded customer payment', `${paying.client.name} · ${formatRM(input.amount)}`);
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
  const [kind, setKind] = useState<CustomerPaymentKind>(owesDeposit ? 'deposit' : receivable.paid > 0 ? 'balance' : 'full');
  const [amount, setAmount] = useState(String(owesDeposit ? receivable.depositRequired - receivable.paid : receivable.outstanding));
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [date, setDate] = useState(TODAY_STR);
  const value = Number(amount);
  const canSubmit = Boolean(value > 0 && value <= receivable.outstanding && date);
  const kinds: CustomerPaymentKind[] = owesDeposit ? ['deposit', 'full'] : receivable.paid > 0 ? ['balance'] : ['full'];

  function pickKind(k: CustomerPaymentKind) {
    setKind(k);
    setAmount(String(k === 'deposit' ? receivable.depositRequired - receivable.paid : receivable.outstanding));
  }

  return (
    <Modal title={`Record payment from ${receivable.client.name}`} onClose={onClose}>
      <div className="space-y-4 px-6 pt-5">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-brand-cream p-4 text-sm">
          <div>
            <p className="text-brand-muted">Billed</p>
            <p className="font-semibold tabular-nums text-brand-ink">{formatRM(receivable.billed)}</p>
          </div>
          <div>
            <p className="text-brand-muted">Paid</p>
            <p className="font-semibold tabular-nums text-brand-ink">{formatRM(receivable.paid)}</p>
          </div>
          <div>
            <p className="text-brand-muted">Still owed</p>
            <p className="font-semibold tabular-nums text-brand-amber">{formatRM(receivable.outstanding)}</p>
          </div>
        </div>
        {kinds.length > 1 && (
          <div className="flex gap-2">
            {kinds.map((k) => (
              <button key={k} onClick={() => pickKind(k)} className={`flex-1 ${chip(kind === k)} ${kind === k ? '' : 'bg-brand-cream'} capitalize`}>
                {k === 'full' ? 'Pay in full' : k}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount (RM)">
            <input type="number" min={0} max={receivable.outstanding} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Date received">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Paid by">
          <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputCls}>
            {Object.entries(methodLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        {value > receivable.outstanding && <p className="text-sm text-red-600">That is more than the customer still owes.</p>}
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
    downloadCSV('honeyspa-cash-flow-2026.csv', [
      ['Month', 'Cash in (RM)', 'Cash out (RM)', 'Net (RM)', 'Closing balance (RM)'],
      ...visible.map((m) => [monthLabel(m.key), m.cashIn, m.cashOut, m.netCash, m.closingBalance]),
    ]);
    logAction('Front Desk', 'Exported cash flow report', `Jan to ${monthLabel(current.key)}`);
  }

  return (
    <>
      <Card className="grid grid-cols-1 gap-6 !p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-brand-muted">Cash in</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-brand-ink">{formatRM(current.cashIn)}</p>
          <p className="mt-1 text-sm text-brand-muted">From customers</p>
        </div>
        <div>
          <p className="text-sm text-brand-muted">Cash out</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-brand-ink">{formatRM(current.cashOut)}</p>
          <p className="mt-1 text-sm text-brand-muted">Payroll and paid bills</p>
        </div>
        <div>
          <p className="text-sm text-brand-muted">Net cash flow</p>
          <p className={`mt-2 text-4xl font-semibold tracking-tight tabular-nums ${current.netCash >= 0 ? 'text-brand-lavender' : 'text-red-600'}`}>{signedRM(current.netCash)}</p>
          <p className="mt-1 text-sm text-brand-muted">{monthLabel(current.key)}</p>
        </div>
        <div>
          <p className="text-sm text-brand-muted">Cash in the bank</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-brand-pink">{formatRM(current.closingBalance)}</p>
          <p className="mt-1 text-sm text-brand-muted">Started the year at {formatRM(OPENING_CASH_BALANCE)}</p>
        </div>
      </Card>

      <Card className="mt-8 p-6">
        <SectionTitle
          action={
            <button onClick={exportCashFlow} className={`${pillButton} bg-brand-cream`}>
              <Download size={15} /> Export CSV
            </button>
          }
        >
          Cash flow by month
        </SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={visible} barGap={4}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
            <YAxis yAxisId="flow" hide />
            <YAxis yAxisId="balance" orientation="right" hide />
            <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={tooltipStyle} cursor={{ fill: C.grid, opacity: 0.6 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} iconType="circle" />
            <Bar yAxisId="flow" dataKey="cashIn" name="Cash in" fill={C.magenta} radius={[6, 6, 0, 0]} />
            <Bar yAxisId="flow" dataKey="cashOut" name="Cash out" fill={C.honey} radius={[6, 6, 0, 0]} />
            <Line yAxisId="balance" type="monotone" dataKey="closingBalance" name="Cash in the bank" stroke={C.lavender} strokeWidth={2.5} dot={{ r: 3, fill: C.lavender, strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="px-3 py-3 font-medium">Month</th>
                <th className="px-3 py-3 text-right font-medium">Cash in</th>
                <th className="px-3 py-3 text-right font-medium">Cash out</th>
                <th className="px-3 py-3 text-right font-medium">Net</th>
                <th className="px-3 py-3 text-right font-medium">Cash in the bank</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {visible.map((m) => (
                <tr key={m.key} className={`border-t border-black/5 ${m.key === current.key ? 'bg-brand-pink-light/50 font-medium' : ''}`}>
                  <td className="px-3 py-2.5 text-brand-ink">{monthLabel(m.key)}</td>
                  <td className="px-3 py-2.5 text-right text-brand-ink">{formatRM(m.cashIn)}</td>
                  <td className="px-3 py-2.5 text-right text-brand-ink">{formatRM(m.cashOut)}</td>
                  <td className={`px-3 py-2.5 text-right ${m.netCash >= 0 ? 'text-brand-lavender' : 'text-red-600'}`}>{signedRM(m.netCash)}</td>
                  <td className="px-3 py-2.5 text-right text-brand-ink">{formatRM(m.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <SectionTitle action={<span className="text-sm text-brand-muted">{monthLabel(current.key)}</span>}>Budget vs actual</SectionTitle>
          <p className="-mt-2 mb-5 text-sm text-brand-muted">Monthly budget per category. Change a number to update it for every month.</p>
          <div className="space-y-4">
            {EXPENSE_CATEGORIES.map((c) => {
              const actual = current.opexByCategory[c];
              const budget = budgets[c];
              const used = pct(actual, budget);
              const over = actual > budget;
              return (
                <div key={c} className="grid grid-cols-12 items-center gap-3">
                  <span className="col-span-4 text-sm text-brand-ink">{c}</span>
                  <div className="col-span-5">
                    <div className="h-2 rounded-full bg-brand-cream">
                      <div className={`h-2 rounded-full ${over ? 'bg-red-500' : 'bg-brand-lavender'}`} style={{ width: `${Math.min(100, used)}%` }} />
                    </div>
                    <p className={`mt-1 text-xs tabular-nums ${over ? 'font-medium text-red-600' : 'text-brand-muted'}`}>
                      {formatRM(actual)} · {used}%{over ? ` · ${formatRM(actual - budget)} over` : ''}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <BudgetInput
                      label={`${c} budget`}
                      value={budget}
                      onCommit={(amount) => {
                        setBudget(c, amount);
                        logAction('Front Desk', 'Updated monthly budget', `${c} → ${formatRM(amount)}`);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-sm">
            <span className="text-brand-muted">All operating costs</span>
            <span className="font-semibold tabular-nums text-brand-ink">
              {formatRM(current.opex)} <span className="font-normal text-brand-muted">of {formatRM(totalBudget)}</span>
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Budget check</SectionTitle>
          {overBudget.length > 0 ? (
            <div className="mb-5 flex gap-2.5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              <p>
                <span className="font-medium">
                  {overBudget.length} {overBudget.length === 1 ? 'category is' : 'categories are'} over budget:
                </span>{' '}
                {overBudget.join(', ')}.
              </p>
            </div>
          ) : (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-brand-lavender-light p-4 text-sm text-brand-lavender-dark">
              <CheckCircle2 size={17} className="shrink-0" /> Every category is within budget.
            </div>
          )}
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={budgetChart} layout="vertical" margin={{ left: 10 }} barGap={2}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={86} tick={axisTick} />
              <Tooltip formatter={(v) => formatRM(Number(v))} labelFormatter={(_, p) => p?.[0]?.payload?.category ?? ''} contentStyle={tooltipStyle} cursor={{ fill: C.grid, opacity: 0.6 }} />
              <Legend wrapperStyle={{ fontSize: 13 }} iconType="circle" />
              <Bar dataKey="budget" name="Budget" fill={C.lavenderLight} radius={[0, 6, 6, 0]} />
              <Bar dataKey="actual" name="Actual" radius={[0, 6, 6, 0]}>
                {budgetChart.map((b) => (
                  <Cell key={b.category} fill={b.actual > b.budget ? '#dc2626' : C.lavender} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}

function BudgetInput({ label, value, onCommit }: { label: string; value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  function commit() {
    if (draft === null) return;
    const n = Number(draft);
    if (draft.trim() !== '' && n >= 0 && n !== value) onCommit(n);
    setDraft(null);
  }
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted">RM</span>
      <input
        type="number"
        min={0}
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        aria-label={label}
        className="w-full rounded-lg bg-brand-cream py-1.5 pl-9 pr-3 text-right text-sm tabular-nums text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
      />
    </div>
  );
}

/* ───────────────────────────── Shared modal pieces ───────────────────────────── */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">{/* taste-skill-ignore: overlay */}
        <div className="flex items-center justify-between gap-3 px-6 pt-6">
          <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-brand-muted hover:bg-brand-cream hover:text-brand-ink" aria-label="Close">
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
    <div className="flex items-center justify-end gap-2 p-6">
      <button onClick={onClose} className="rounded-full bg-brand-cream px-4 py-2 text-sm text-brand-ink hover:bg-brand-pink-light">
        Cancel
      </button>
      <button disabled={disabled} onClick={onConfirm} className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark disabled:opacity-30">
        {label}
      </button>
    </div>
  );
}

function Field({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm text-brand-muted">{label}</label>
      {children}
    </div>
  );
}
