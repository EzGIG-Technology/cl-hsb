import { useMemo } from 'react';
import { TrendingUp, Star, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { PageShell } from '../components/PageShell';
import { Card, StatCard, SectionTitle, Avatar, formatRM } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { monthlyRevenue, monthlyCompletedAssignments, ratingDistribution, packagePopularity } from '../data/reports';
import { useSettings } from '../store/SettingsContext';

const CURRENT_MONTH_INDEX = 7; // August

export default function ReportsPage() {
  const { cls } = useCLStore();
  const { packageById } = useSettings();

  const ytdRevenue = useMemo(
    () => monthlyRevenue.slice(0, CURRENT_MONTH_INDEX + 1).reduce((acc, m) => acc + m.revenue, 0),
    [],
  );
  const thisMonthRevenue = monthlyRevenue[CURRENT_MONTH_INDEX].revenue;
  const ytdCompleted = useMemo(
    () => monthlyCompletedAssignments.slice(0, CURRENT_MONTH_INDEX + 1).reduce((acc, m) => acc + m.completed, 0),
    [],
  );

  const topCLs = useMemo(() => [...cls].sort((a, b) => b.rating - a.rating || b.completedAssignments - a.completedAssignments).slice(0, 6), [cls]);

  const packageChartData = packagePopularity
    .map((p) => ({ name: packageById(p.packageId)?.shortName ?? p.packageId, bookings: p.bookings }))
    .sort((a, b) => b.bookings - a.bookings);

  const ratingColors: Record<number, string> = { 5: '#21493a', 4: '#3c6f57', 3: '#c98a3b', 2: '#b45f3b', 1: '#b23b3b' };

  return (
    <PageShell title="Reports" subtitle="Revenue, bookings, and CL performance at a glance.">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard label="YTD revenue" value={formatRM(ytdRevenue)} icon={<TrendingUp size={16} className="text-brand-green" />} />
        <StatCard label="This month's revenue" value={formatRM(thisMonthRevenue)} />
        <StatCard label="YTD completed assignments" value={ytdCompleted} />
        <StatCard label="Average CL rating" value={(cls.reduce((a, c) => a + c.rating, 0) / cls.length).toFixed(1)} icon={<Award size={16} className="text-brand-amber" />} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle>Monthly revenue (RM)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8b7d87', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatRM(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#d94f8c" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Completed assignments</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyCompletedAssignments}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8b7d87', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Bar dataKey="completed" radius={[8, 8, 8, 8]} fill="#4f8a6d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Package popularity (bookings)</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={packageChartData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: '#8b7d87', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Bar dataKey="bookings" radius={[0, 8, 8, 0]} fill="#c98a3b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>Rating distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ratingDistribution} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="stars" type="category" axisLine={false} tickLine={false} width={50} tick={{ fill: '#8b7d87', fontSize: 12 }} tickFormatter={(v) => `${v}★`} />
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
