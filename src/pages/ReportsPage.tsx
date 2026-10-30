import { useMemo, useState, type CSSProperties } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { PageShell } from '../components/PageShell';
import { Card, StatCard, SectionTitle, Avatar, formatRM } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { monthlyRevenue, monthlyPayroll, monthlyCompletedAssignments, ratingDistribution, packagePopularity } from '../data/reports';
import { useSettings } from '../store/SettingsContext';

const CURRENT_MONTH_INDEX = 7; // August: the seed set treats Aug 2026 as the current month

// Brand chart palette (house rules): magenta, lavender, light lavender, honey, muted.
const C = {
  magenta: '#c42474',
  lavender: '#6f76b0',
  lavenderLight: '#8c94c4',
  honey: '#d9921f',
  muted: '#8a7f8c',
  grid: '#f3e6ed',
};

// Tooltips are real overlays, so they keep a soft shadow.
const tooltipStyle: CSSProperties = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 6px 20px rgba(31, 26, 36, 0.12)', // taste-skill-ignore: overlay
  fontSize: 13,
};
const axisTick = { fill: C.muted, fontSize: 12 };

const ratingColors: Record<number, string> = { 5: C.magenta, 4: C.lavender, 3: C.lavenderLight, 2: C.honey, 1: C.muted };

export default function ReportsPage() {
  const { cls } = useCLStore();
  const { packageById } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState(monthlyRevenue[CURRENT_MONTH_INDEX].month);
  const monthLabel = `${selectedMonth} 2026`;

  const ytdRevenue = useMemo(() => monthlyRevenue.slice(0, CURRENT_MONTH_INDEX + 1).reduce((acc, m) => acc + m.revenue, 0), []);
  const ytdCompleted = useMemo(
    () => monthlyCompletedAssignments.slice(0, CURRENT_MONTH_INDEX + 1).reduce((acc, m) => acc + m.completed, 0),
    [],
  );
  const ytdPayroll = useMemo(() => monthlyPayroll.slice(0, CURRENT_MONTH_INDEX + 1).reduce((acc, m) => acc + m.payroll, 0), []);
  const ytdMargin = ytdRevenue - ytdPayroll;

  const selectedMonthRevenue = monthlyRevenue.find((m) => m.month === selectedMonth)?.revenue ?? 0;
  const selectedMonthCompleted = monthlyCompletedAssignments.find((m) => m.month === selectedMonth)?.completed ?? 0;
  const selectedMonthPayroll = monthlyPayroll.find((m) => m.month === selectedMonth)?.payroll ?? 0;
  const selectedMonthMargin = selectedMonthRevenue - selectedMonthPayroll;
  const selectedMonthMarginPct = selectedMonthRevenue ? Math.round((selectedMonthMargin / selectedMonthRevenue) * 100) : 0;

  const financeChartData = monthlyRevenue.map((m) => {
    const payroll = monthlyPayroll.find((p) => p.month === m.month)?.payroll ?? 0;
    return { month: m.month, revenue: m.revenue, payroll, margin: m.revenue - payroll };
  });

  const averageRating = cls.length ? (cls.reduce((a, c) => a + c.rating, 0) / cls.length).toFixed(1) : '–';
  const totalRatings = ratingDistribution.reduce((a, r) => a + r.count, 0);
  const fiveStarPct = totalRatings ? Math.round(((ratingDistribution.find((r) => r.stars === 5)?.count ?? 0) / totalRatings) * 100) : 0;

  const topCLs = useMemo(
    () => [...cls].sort((a, b) => b.rating - a.rating || b.completedAssignments - a.completedAssignments).slice(0, 6),
    [cls],
  );

  // Only treatments still on the menu are charted, so a retired id never shows up as a raw label.
  const packageChartData = packagePopularity
    .filter((p) => packageById(p.packageId))
    .map((p) => ({ name: packageById(p.packageId)!.shortName, bookings: p.bookings }))
    .sort((a, b) => b.bookings - a.bookings);

  return (
    <PageShell
      title="Reports"
      subtitle="Revenue, sessions and staff performance at a glance."
      headerAction={
        <div className="relative">
          <select
            aria-label="Report month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none rounded-full bg-white py-2.5 pl-5 pr-10 text-sm font-medium text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
          >
            {monthlyRevenue.map((m) => (
              <option key={m.month} value={m.month}>
                {m.month} 2026
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted" />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Revenue, ${monthLabel}`}
          value={formatRM(selectedMonthRevenue)}
          hint={<span className="text-sm text-brand-muted">YTD {formatRM(ytdRevenue)}</span>}
          className="p-6"
        />
        <StatCard
          label={`Completed sessions, ${monthLabel}`}
          value={selectedMonthCompleted}
          hint={<span className="text-sm text-brand-muted">YTD {ytdCompleted}</span>}
          className="p-6"
        />
        <StatCard
          label="Average staff rating"
          value={averageRating}
          icon={<Star size={16} className="fill-brand-amber text-brand-amber" />}
          hint={<span className="text-sm text-brand-muted">of 5</span>}
          className="p-6"
        />
        <StatCard
          label="Five-star reviews"
          value={`${fiveStarPct}%`}
          hint={<span className="text-sm text-brand-muted">of {totalRatings}</span>}
          className="p-6"
        />
      </div>

      <Card className="mt-8 p-6">
        <SectionTitle action={<span className="text-sm text-brand-muted">{monthLabel}</span>}>Revenue vs payroll</SectionTitle>
        <p className="-mt-2 mb-6 text-sm text-brand-muted">What customers pay in, what staff are paid out, and what the spa keeps.</p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 text-sm text-brand-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: C.honey }} aria-hidden /> Paid to staff
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-brand-ink">{formatRM(selectedMonthPayroll)}</p>
            <p className="mt-1 text-sm text-brand-muted">YTD {formatRM(ytdPayroll)}</p>
          </div>
          <div>
            <p className="text-sm text-brand-muted">Gross margin</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-brand-ink">{formatRM(selectedMonthMargin)}</p>
            <p className="mt-1 text-sm text-brand-muted">YTD {formatRM(ytdMargin)}</p>
          </div>
          <div>
            <p className="text-sm text-brand-muted">Kept after payroll</p>
            <p className={`mt-1 text-4xl font-semibold tracking-tight ${selectedMonthMarginPct >= 0 ? 'text-brand-ink' : 'text-red-600'}`}>
              {selectedMonthMarginPct}%
            </p>
            <p className="mt-1 text-sm text-brand-muted">of {formatRM(selectedMonthRevenue)} revenue</p>
          </div>
        </div>

        <div className="mt-8">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={financeChartData} barGap={4}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={tooltipStyle} cursor={{ fill: C.grid, opacity: 0.6 }} />
              <Legend wrapperStyle={{ fontSize: 13 }} iconType="circle" />
              <Bar dataKey="revenue" name="Revenue" fill={C.magenta} radius={[6, 6, 0, 0]}>
                {financeChartData.map((m) => (
                  <Cell key={m.month} fill={C.magenta} fillOpacity={m.month === selectedMonth ? 1 : 0.55} />
                ))}
              </Bar>
              <Bar dataKey="payroll" name="Paid to staff" fill={C.honey} radius={[6, 6, 0, 0]}>
                {financeChartData.map((m) => (
                  <Cell key={m.month} fill={C.honey} fillOpacity={m.month === selectedMonth ? 1 : 0.55} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <SectionTitle>Monthly revenue</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={C.magenta}
                strokeWidth={2.5}
                dot={{ r: 3, fill: C.magenta, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <SectionTitle action={<span className="text-sm text-brand-muted">{monthLabel} highlighted</span>}>Completed sessions</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyCompletedAssignments}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: C.grid, opacity: 0.6 }} />
              <Bar dataKey="completed" name="Sessions" radius={[8, 8, 8, 8]}>
                {monthlyCompletedAssignments.map((m) => (
                  <Cell key={m.month} fill={m.month === selectedMonth ? C.magenta : C.lavenderLight} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <SectionTitle>Treatment popularity</SectionTitle>
          {packageChartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-brand-muted">No bookings recorded for the current menu yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, packageChartData.length * 36)}>
              <BarChart data={packageChartData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={96} tick={axisTick} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: C.grid, opacity: 0.6 }} />
                <Bar dataKey="bookings" name="Bookings" radius={[0, 8, 8, 0]}>
                  {packageChartData.map((p, i) => (
                    <Cell key={p.name} fill={i === 0 ? C.magenta : C.lavender} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <SectionTitle action={<span className="text-sm text-brand-muted">{totalRatings} ratings</span>}>Rating distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingDistribution} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="stars"
                type="category"
                axisLine={false}
                tickLine={false}
                width={60}
                tick={axisTick}
                tickFormatter={(v) => `${v} star${v === 1 ? '' : 's'}`}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: C.grid, opacity: 0.6 }} />
              <Bar dataKey="count" name="Ratings" radius={[0, 8, 8, 0]}>
                {ratingDistribution.map((r) => (
                  <Cell key={r.stars} fill={ratingColors[r.stars]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="mt-8 overflow-hidden !p-0">
        <div className="px-6 pt-6">
          <SectionTitle>Staff leaderboard</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="px-6 py-3 font-medium">Staff</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Reviews</th>
                <th className="px-6 py-3 font-medium">Completed sessions</th>
                <th className="px-6 py-3 font-medium">Experience</th>
              </tr>
            </thead>
            <tbody>
              {topCLs.map((cl) => (
                <tr key={cl.id} /* taste-skill-ignore: table row */ className="border-t border-black/5">
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-2.5 text-brand-ink">
                      <Avatar name={cl.name} color={cl.avatarColor} size={28} />
                      {cl.name}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-1 font-medium text-brand-ink">
                      <Star size={14} className="fill-brand-amber text-brand-amber" /> {cl.rating}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-brand-ink">{cl.reviewCount}</td>
                  <td className="px-6 py-3 text-brand-ink">{cl.completedAssignments}</td>
                  <td className="px-6 py-3 text-brand-ink">{cl.yearsExperience} yrs</td>
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
