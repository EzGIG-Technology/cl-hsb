import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Star, Award, ChevronDown, Wallet, PiggyBank } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { PageShell } from '../components/PageShell';
import { Card, StatCard, SectionTitle, Avatar, formatRM } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { monthlyRevenue, monthlyPayroll, monthlyCompletedAssignments, ratingDistribution, packagePopularity } from '../data/reports';
import { useSettings } from '../store/SettingsContext';

const CURRENT_MONTH_INDEX = 7; // August — data only exists for Jan-Aug in the seed set

export default function ReportsPage() {
  const { cls } = useCLStore();
  const { packageById } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState(monthlyRevenue[CURRENT_MONTH_INDEX].month);
  const isCurrentMonth = selectedMonth === monthlyRevenue[CURRENT_MONTH_INDEX].month;

  const ytdRevenue = useMemo(
    () => monthlyRevenue.slice(0, CURRENT_MONTH_INDEX + 1).reduce((acc, m) => acc + m.revenue, 0),
    [],
  );
  const selectedMonthRevenue = monthlyRevenue.find((m) => m.month === selectedMonth)?.revenue ?? 0;
  const selectedMonthCompleted = monthlyCompletedAssignments.find((m) => m.month === selectedMonth)?.completed ?? 0;
  const ytdCompleted = useMemo(
    () => monthlyCompletedAssignments.slice(0, CURRENT_MONTH_INDEX + 1).reduce((acc, m) => acc + m.completed, 0),
    [],
  );

  const financeChartData = monthlyRevenue.map((m) => {
    const payroll = monthlyPayroll.find((p) => p.month === m.month)?.payroll ?? 0;
    return { month: m.month, revenue: m.revenue, payroll, margin: m.revenue - payroll };
  });
  const selectedMonthPayroll = monthlyPayroll.find((m) => m.month === selectedMonth)?.payroll ?? 0;
  const selectedMonthMargin = selectedMonthRevenue - selectedMonthPayroll;
  const selectedMonthMarginPct = selectedMonthRevenue ? Math.round((selectedMonthMargin / selectedMonthRevenue) * 100) : 0;
  const ytdPayroll = useMemo(
    () => monthlyPayroll.slice(0, CURRENT_MONTH_INDEX + 1).reduce((acc, m) => acc + m.payroll, 0),
    [],
  );
  const ytdMargin = ytdRevenue - ytdPayroll;

  const topCLs = useMemo(() => [...cls].sort((a, b) => b.rating - a.rating || b.completedAssignments - a.completedAssignments).slice(0, 6), [cls]);

  const packageChartData = packagePopularity
    .map((p) => ({ name: packageById(p.packageId)?.shortName ?? p.packageId, bookings: p.bookings }))
    .sort((a, b) => b.bookings - a.bookings);

  const ratingColors: Record<number, string> = { 5: '#2f2b55', 4: '#6f76b0', 3: '#d9921f', 2: '#b45f3b', 1: '#b23b3b' };

  return (
    <PageShell
      title="Reports"
      subtitle="Revenue, bookings, and CL performance at a glance."
      headerAction={
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none rounded-full border border-black/10 bg-white py-2 pl-4 pr-9 text-sm font-medium text-brand-ink"
          >
            {monthlyRevenue.map((m) => (
              <option key={m.month} value={m.month}>
                {m.month} 2026
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="YTD revenue" value={formatRM(ytdRevenue)} icon={<TrendingUp size={16} className="text-brand-lavender" />} />
        <StatCard label="YTD completed assignments" value={ytdCompleted} />
        <StatCard
          label={isCurrentMonth ? "This month's revenue" : `${selectedMonth} 2026 revenue`}
          value={formatRM(selectedMonthRevenue)}
        />
        <StatCard label={`${selectedMonth} 2026 completed`} value={selectedMonthCompleted} />
        <StatCard label="Average CL rating" value={(cls.reduce((a, c) => a + c.rating, 0) / cls.length).toFixed(1)} icon={<Award size={16} className="text-brand-amber" />} />
      </div>

      <Card className="mt-5">
        <SectionTitle action={<span className="text-xs text-brand-muted">{isCurrentMonth ? 'This month' : `${selectedMonth} 2026`}</span>}>
          Revenue vs. Payroll
        </SectionTitle>
        <p className="-mt-3 mb-4 text-xs text-brand-muted">What customers pay in, what CLs are paid out, and what's left over.</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-brand-cream p-3">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              <TrendingUp size={11} className="text-brand-lavender" /> Revenue collected
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-ink">{formatRM(selectedMonthRevenue)}</p>
            <p className="text-[10px] text-brand-muted">YTD {formatRM(ytdRevenue)}</p>
          </div>
          <div className="rounded-xl bg-brand-cream p-3">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              <Wallet size={11} className="text-brand-amber" /> Paid out to CLs
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-ink">{formatRM(selectedMonthPayroll)}</p>
            <p className="text-[10px] text-brand-muted">YTD {formatRM(ytdPayroll)}</p>
          </div>
          <div className="rounded-xl bg-brand-cream p-3">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              <PiggyBank size={11} className="text-brand-pink" /> Gross margin
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-ink">{formatRM(selectedMonthMargin)}</p>
            <p className="text-[10px] text-brand-muted">YTD {formatRM(ytdMargin)}</p>
          </div>
          <div className="rounded-xl bg-brand-cream p-3">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              {selectedMonthMarginPct >= 0 ? (
                <TrendingUp size={11} className="text-brand-lavender" />
              ) : (
                <TrendingDown size={11} className="text-red-500" />
              )}
              Margin %
            </p>
            <p className={`mt-1 text-xl font-semibold ${selectedMonthMarginPct >= 0 ? 'text-brand-ink' : 'text-red-600'}`}>{selectedMonthMarginPct}%</p>
            <p className="text-[10px] text-brand-muted">of revenue kept after payroll</p>
          </div>
        </div>

        <div className="mt-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={financeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a7f8c', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#c42474" radius={[6, 6, 0, 0]} />
              <Bar dataKey="payroll" name="Paid to CLs" fill="#d9921f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle>Monthly revenue (RM)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a7f8c', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#c42474" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Completed assignments</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyCompletedAssignments}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a7f8c', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Bar dataKey="completed" radius={[8, 8, 8, 8]}>
                {monthlyCompletedAssignments.map((m) => (
                  <Cell key={m.month} fill={m.month === selectedMonth ? '#c42474' : '#8c94c4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Package popularity (bookings)</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={packageChartData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: '#8a7f8c', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Bar dataKey="bookings" radius={[0, 8, 8, 0]} fill="#d9921f" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Rating distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ratingDistribution} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="stars" type="category" axisLine={false} tickLine={false} width={50} tick={{ fill: '#8a7f8c', fontSize: 12 }} tickFormatter={(v) => `${v}★`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {ratingDistribution.map((r) => (
                  <Cell key={r.stars} fill={ratingColors[r.stars]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="mt-5 !p-0 overflow-hidden">
        <div className="p-5 pb-0">
          <SectionTitle>CL performance leaderboard</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">CL</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Reviews</th>
                <th className="px-5 py-3 font-medium">Completed</th>
                <th className="px-5 py-3 font-medium">Experience</th>
              </tr>
            </thead>
            <tbody>
              {topCLs.map((cl) => (
                <tr key={cl.id} className="border-t border-black/5">
                  <td className="flex items-center gap-2 px-5 py-3">
                    <Avatar name={cl.name} color={cl.avatarColor} size={26} />
                    {cl.name}
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1">
                      <Star size={13} className="fill-brand-amber text-brand-amber" /> {cl.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-brand-muted">{cl.reviewCount}</td>
                  <td className="px-5 py-3 text-brand-muted">{cl.completedAssignments}</td>
                  <td className="px-5 py-3 text-brand-muted">{cl.yearsExperience} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-3" />
      </Card>

      <div className="h-6" />
    </PageShell>
  );
}
