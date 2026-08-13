import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Star } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, PieChart, Pie, Cell } from 'recharts';
import { PageShell } from '../components/PageShell';
import { MiniCalendar } from '../components/MiniCalendar';
import { OperationsMap } from '../components/OperationsMap';
import { Card, StatCard, Badge, Avatar, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { clientById } from '../data/clients';
import { useSettings } from '../store/SettingsContext';
import { assignments } from '../data/assignments';
import { monthlyCompletedAssignments, attendanceToday } from '../data/reports';
import { TODAY_STR, formatTime12, formatWeekdayDate, TODAY } from '../lib/date';

export default function OverviewPage() {
  const { cls, clById } = useCLStore();
  const { packageById } = useSettings();
  const totalCLs = cls.length;
  const avgRating = useMemo(() => {
    const sum = cls.reduce((acc, c) => acc + c.rating, 0);
    return (sum / cls.length).toFixed(1);
  }, [cls]);
  const totalReviews = useMemo(() => cls.reduce((acc, c) => acc + c.reviewCount, 0), [cls]);

  const todaysAssignments = assignments
    .filter((a) => a.date === TODAY_STR)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const attendanceData = [
    { name: 'On time', value: attendanceToday.onTime, color: '#1f4d3a' },
    { name: 'Late', value: attendanceToday.late, color: '#c98a3b' },
    { name: 'Not clocked in', value: attendanceToday.notClockedIn, color: '#6d2748' },
  ];

  return (
    <PageShell
      title="Hello, Amy!"
      subtitle="Here's what's happening across your CLs today."
      searchPlaceholder="Search CL"
      sidePanel={
        <div className="flex flex-1 flex-col gap-4">
          <MiniCalendar selectedDate={TODAY} />

          <Link
            to="/schedule"
            className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium hover:bg-white/15"
          >
            {todaysAssignments.length} assignments today
            <ArrowUpRight size={16} />
          </Link>

          <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto">
            {todaysAssignments.map((a) => {
              const cl = clById(a.clId);
              const client = clientById(a.clientId);
              const pkg = packageById(a.packageId);
              if (!cl || !client || !pkg) return null;
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5">
                  <Avatar name={cl.name} color={cl.avatarColor} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{cl.name}</p>
                    <p className="truncate text-xs text-white/60">{pkg.shortName}</p>
                  </div>
                  <span className="text-xs text-white/70">{formatTime12(a.startTime)}</span>
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 pt-4 md:grid-cols-3">
        <StatCard label="Peak activity time" value="10:00–12:30" hint={<span className="text-sm text-brand-muted">PM</span>} />
        <StatCard
          label="Total CLs"
          value={totalCLs}
          hint={<span className="rounded-full bg-brand-green-light px-2 py-0.5 text-xs font-medium text-brand-green">+13% last month</span>}
        />
        <StatCard
          label="Average care rating"
          value={avgRating}
          icon={<Star size={16} className="fill-brand-amber text-brand-amber" />}
          hint={<span className="text-sm text-brand-muted">{totalReviews} reviews</span>}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle>Active CLs</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyCompletedAssignments}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8b7d87', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(109,39,72,0.06)' }}
                formatter={(value) => [`${value} completed`, '']}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}
              />
              <Bar dataKey="completed" radius={[8, 8, 8, 8]}>
                {monthlyCompletedAssignments.map((m) => (
                  <Cell key={m.month} fill={m.month === 'Aug' ? '#6d2748' : '#e9d3dd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-2 text-xs text-brand-muted">
            <span className="h-2 w-2 rounded-full bg-brand-maroon" /> completed assignments
          </div>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <SectionTitle>Attendance today</SectionTitle>
            <span className="text-xs text-brand-muted">Today</span>
          </div>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={attendanceData} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={3}>
                  {attendanceData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-semibold text-brand-ink">{attendanceToday.scheduled}</span>
              <span className="text-xs text-brand-muted">scheduled</span>
            </div>
          </div>
          <div className="mt-2 space-y-2 text-sm">
            {attendanceData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-brand-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-brand-ink">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 !p-0">
          <div className="flex items-center justify-between p-5 pb-0">
            <SectionTitle>Assignments</SectionTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-brand-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Package</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Confirmation</th>
                </tr>
              </thead>
              <tbody>
                {todaysAssignments.map((a) => {
                  const cl = clById(a.clId);
                  const pkg = packageById(a.packageId);
                  if (!cl || !pkg) return null;
                  return (
                    <tr key={a.id} className="border-t border-black/5">
                      <td className="flex items-center gap-2 px-5 py-3">
                        <Avatar name={cl.name} color={cl.avatarColor} size={26} />
                        {cl.name}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-brand-pink-light px-2.5 py-1 text-xs font-medium text-brand-maroon">
                          {pkg.shortName}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-brand-muted">{formatWeekdayDate(TODAY).split(',')[0]}, {a.date.slice(-2)} Aug</td>
                      <td className="px-5 py-3 text-brand-muted">{formatTime12(a.startTime)}</td>
                      <td className="px-5 py-3">
                        <Badge status={a.status}>{a.status[0].toUpperCase() + a.status.slice(1)}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="h-4" />
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="font-semibold text-brand-ink">Operations map</h3>
              <p className="text-xs text-brand-muted">CL totals by location</p>
            </div>
            <Link to="/map" className="text-brand-maroon">
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="h-64 px-3 pb-3">
            <OperationsMap compact />
          </div>
        </Card>
      </div>

      <div className="h-6" />
    </PageShell>
  );
}
