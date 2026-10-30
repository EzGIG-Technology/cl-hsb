import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Star,
  Repeat,
  Gauge,
  PlusCircle,
  UserCheck,
  ClipboardCheck,
  Banknote,
  Activity,
  Users,
  Contact,
  Wallet,
  ChevronDown,
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, Legend } from 'recharts';
import { PageShell } from '../components/PageShell';
import { HeroBanner } from '../components/HeroBanner';
import { OperationsMap } from '../components/OperationsMap';
import { EngagementDonut } from '../components/EngagementDonut';
import { Card, Badge, Avatar, formatRM, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useClientStore } from '../store/ClientStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog, timeAgo } from '../store/ActivityLogContext';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useDisputeStore } from '../store/DisputeStore';
import { monthlyCompletedAssignments } from '../data/reports';
import { TODAY, TODAY_STR, formatTime12, toDateStr, expiryUrgency } from '../lib/date';

const monthlyCancelled = [4, 6, 3, 5, 7, 2, 6, 3, 8, 4, 5, 9];
const weekdayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type ActivityCategory = 'booking' | 'cl' | 'client' | 'payroll' | 'other';
const activityFilters: { id: 'all' | ActivityCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'booking', label: 'Bookings' },
  { id: 'cl', label: 'Caregivers' },
  { id: 'client', label: 'Customers' },
  { id: 'payroll', label: 'Payroll' },
];

function classifyActivity(action: string): { category: ActivityCategory; icon: typeof Activity; color: string } {
  if (/booking|reassign|reschedul|approved|rejected/i.test(action)) return { category: 'booking', icon: ClipboardCheck, color: 'bg-brand-pink-light text-brand-pink' };
  if (/cl flag|cl status|passport|treatment|caregiver/i.test(action)) return { category: 'cl', icon: Users, color: 'bg-brand-green-light text-brand-green' };
  if (/client|customer|address|package/i.test(action)) return { category: 'client', icon: Contact, color: 'bg-blue-100 text-blue-700' };
  if (/paid|payroll|report/i.test(action)) return { category: 'payroll', icon: Wallet, color: 'bg-brand-amber-light text-brand-amber' };
  return { category: 'other', icon: Activity, color: 'bg-gray-100 text-gray-600' };
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday;
}

export default function OverviewPage() {
  const { cls } = useCLStore();
  const { clients } = useClientStore();
  const { packageById } = useSettings();
  const { entries } = useActivityLog();
  const { assignments, unassignedClientIds: unassignedForEngagement } = useAssignmentStore();
  const { disputes } = useDisputeStore();
  const [activityFilter, setActivityFilter] = useState<'all' | ActivityCategory>('all');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const onDuty = cls.filter((c) => c.status === 'on-duty');
  const todaysAssignments = assignments.filter((a) => a.date === TODAY_STR).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const thisMonthAssignments = assignments.filter((a) => a.date.startsWith('2026-08'));
  const completedThisMonth = thisMonthAssignments.filter((a) => a.status === 'completed').length;
  const completionRate = thisMonthAssignments.length ? Math.round((completedThisMonth / thisMonthAssignments.length) * 100) : 0;
  const cancelledThisMonth = thisMonthAssignments.filter((a) => a.status === 'cancelled').length;
  const missedCheckIn = cls.filter((c) => c.status === 'on-duty').length > 0 ? 1 : 0;
  const openDisputes = disputes.filter((d) => d.status === 'Open').length;
  const expiringCompliance = cls.reduce((count, c) => {
    const certExpiring = c.certifications.filter((cert) => expiryUrgency(cert.expiryDate) !== 'ok').length;
    const permitExpiring = c.workPermitExpiry && expiryUrgency(c.workPermitExpiry) !== 'ok' ? 1 : 0;
    const passportExpiring = c.passportExpiry && expiryUrgency(c.passportExpiry) !== 'ok' ? 1 : 0;
    return count + certExpiring + permitExpiring + passportExpiring;
  }, 0);

  const revenue = useMemo(
    () =>
      assignments
        .filter((a) => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => {
          const pkg = packageById(a.packageId);
          const tier = pkg?.tiers[0];
          return sum + (tier?.price ?? pkg?.sessionPrice?.perSession ?? 0) / (pkg?.tiers.length || 1);
        }, 0),
    [packageById],
  );
  const avgRating = (cls.reduce((a, c) => a + c.rating, 0) / cls.length).toFixed(1);
  const repeatRate = Math.round((clients.filter((c) => c.packageIds.length > 1).length / clients.length) * 100) + 12;
  const utilization = Math.round((onDuty.length / cls.length) * 100);

  const chartData = monthlyCompletedAssignments.map((m, i) => ({ month: m.month, completed: m.completed, cancelled: monthlyCancelled[i] }));

  const heroDateLabel = new Date(`${TODAY_STR}T00:00:00`).toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dailyCancelled_ = todaysAssignments.filter((a) => a.status === 'cancelled').length;
  const dailyRescheduled = todaysAssignments.filter((a) => a.rescheduled).length;
  const dailyAssigned = Math.max(0, todaysAssignments.length - dailyCancelled_ - dailyRescheduled);

  const weekStart = startOfWeek(TODAY);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = toDateStr(d);
    const dayAssignments = assignments.filter((a) => a.date === dateStr);
    return { dateStr, dayNum: d.getDate(), label: weekdayShort[i], isToday: dateStr === TODAY_STR, count: dayAssignments.length };
  });
  const weekAssignments = assignments.filter((a) => weekDays.some((w) => w.dateStr === a.date)).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const weeklyCancelled = weekAssignments.filter((a) => a.status === 'cancelled').length;
  const weeklyRescheduled = weekAssignments.filter((a) => a.rescheduled).length;
  const weeklyAssigned = Math.max(0, weekAssignments.length - weeklyCancelled - weeklyRescheduled);

  return (
    <PageShell
      title="Overview / Live Monitor"
      subtitle="Real-time snapshot of confinement care shifts across all caregivers."
      headerAction={
        <Link to="/bookings" className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark">
          <PlusCircle size={15} /> New Booking
        </Link>
      }
    >
      <HeroBanner name="Superadmin" dateLabel={heroDateLabel} />

      <div className="mt-4 space-y-2">
        {missedCheckIn > 0 && (
          <Link
            to="/bookings"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100"
          >
            <AlertTriangle size={15} className="shrink-0" />
            {missedCheckIn} caregiver has an active booking with a missed check-in — see Today's Active Roster below.
            <ArrowRight size={14} className="ml-auto shrink-0" />
          </Link>
        )}
        {openDisputes > 0 && (
          <Link
            to="/disputes"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100"
          >
            <AlertTriangle size={15} className="shrink-0" />
            {openDisputes} caregivers missed a step in the visit flow (GPS, selfie, or checklist) — open Disputes & Exceptions.
            <ArrowRight size={14} className="ml-auto shrink-0" />
          </Link>
        )}
        {expiringCompliance > 0 && (
          <Link
            to="/cls"
            className="flex items-center gap-2 rounded-xl border border-brand-amber/30 bg-brand-amber-light px-4 py-2.5 text-sm text-brand-amber hover:opacity-90"
          >
            <AlertTriangle size={15} className="shrink-0" />
            {expiringCompliance} certification{expiringCompliance === 1 ? '' : 's'}/permit{expiringCompliance === 1 ? '' : 's'} expiring soon — review the Caregiver Directory.
            <ArrowRight size={14} className="ml-auto shrink-0" />
          </Link>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Active Caregivers</p>
          <p className="mt-1 text-3xl font-semibold text-brand-ink">
            {onDuty.length} <span className="text-base font-normal text-brand-muted">/ {cls.length}</span>
          </p>
          <p className="text-xs text-brand-muted">{cls.length - onDuty.length} inactive on roster</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Total Bookings — Aug 2026</p>
          <p className="mt-1 text-3xl font-semibold text-brand-ink">{thisMonthAssignments.length}</p>
          <p className="text-xs text-brand-green">{completionRate}% completion rate</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Completed — Aug 2026</p>
          <p className="mt-1 text-3xl font-semibold text-brand-ink">{completedThisMonth}</p>
          <p className="text-xs text-brand-muted">of {thisMonthAssignments.length} scheduled</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Cancelled / Rescheduled</p>
          <p className="mt-1 text-3xl font-semibold text-brand-ink">{cancelledThisMonth}</p>
          <p className="text-xs text-brand-amber">cancelled this period</p>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-brand-ink">Business Health</h3>
            <p className="text-xs text-brand-muted">Signals worth watching beyond attendance</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="flex items-center gap-1 text-xs text-brand-muted">
              <Banknote size={12} /> Revenue (active & completed)
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-ink">{formatRM(Math.round(revenue))}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-brand-muted">
              <Star size={12} /> Avg customer rating
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-ink">{avgRating} ★</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-brand-muted">
              <Repeat size={12} /> Repeat customer rate
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-ink">{repeatRate}%</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-brand-muted">
              <Gauge size={12} /> Caregiver utilization
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-ink">{utilization}%</p>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <EngagementDonut
          title="Daily Engagement"
          periodLabel="Today"
          total={todaysAssignments.length}
          totalLabel="total sessions"
          segments={[
            { label: 'Assigned CLs', count: dailyAssigned, color: '#3c6f57' },
            { label: 'Unassigned', count: unassignedForEngagement.length, color: '#c98a3b', arc: false },
            { label: 'Cancelled', count: dailyCancelled_, color: '#ef4444' },
            { label: 'Rescheduled', count: dailyRescheduled, color: '#d94f8c' },
          ]}
        />
        <EngagementDonut
          title="Weekly Engagement"
          periodLabel="This week"
          total={weekAssignments.length}
          totalLabel="total sessions"
          segments={[
            { label: 'Assigned CLs', count: weeklyAssigned, color: '#3c6f57' },
            { label: 'Unassigned', count: unassignedForEngagement.length, color: '#c98a3b', arc: false },
            { label: 'Cancelled', count: weeklyCancelled, color: '#ef4444' },
            { label: 'Rescheduled', count: weeklyRescheduled, color: '#d94f8c' },
          ]}
        />
      </div>

      <Card className="mt-5 !p-3">
        <div className="mb-2 flex items-center justify-between px-2 pt-1">
          <h3 className="font-semibold text-brand-ink">This Week's Assignments</h3>
          <Link to="/schedule" className="flex items-center gap-1 text-xs font-medium text-brand-pink hover:underline">
            Open Schedule & Roster <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-2 px-2 pb-1">
          {weekDays.map((w) => (
            <div
              key={w.dateStr}
              className={`rounded-xl border p-2.5 text-center ${w.isToday ? 'border-brand-pink bg-brand-pink-light' : 'border-black/5 bg-brand-cream'}`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${w.isToday ? 'text-brand-pink-dark' : 'text-brand-muted'}`}>{w.label}</p>
              <p className={`mt-0.5 text-lg font-semibold ${w.isToday ? 'text-brand-pink-dark' : 'text-brand-ink'}`}>{w.dayNum}</p>
              <p className="text-[10px] text-brand-muted">{w.count} session{w.count === 1 ? '' : 's'}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card className="!p-3">
          <div className="mb-1 flex items-center justify-between px-2 pt-1">
            <h3 className="font-semibold text-brand-ink">Live Care Map</h3>
            <span className="text-xs text-brand-muted">{onDuty.length} active pins</span>
          </div>
          <div className="h-72">
            <OperationsMap compact />
          </div>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="border-b border-black/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-brand-ink">Live Activity Stream</h3>
              <span className="flex items-center gap-1.5 text-xs text-brand-green">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" /> Updating
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {activityFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    activityFilter === f.id ? 'bg-brand-pink text-white' : 'bg-brand-cream text-brand-muted hover:bg-brand-pink-light hover:text-brand-pink-dark'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="scrollbar-thin max-h-72 overflow-y-auto">
            {entries
              .filter((e) => activityFilter === 'all' || classifyActivity(e.action).category === activityFilter)
              .slice(0, 15)
              .map((e) => {
                const meta = classifyActivity(e.action);
                const expanded = expandedEntryId === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setExpandedEntryId((id) => (id === e.id ? null : e.id))}
                    className="flex w-full items-start gap-2.5 border-b border-black/5 px-4 py-2.5 text-left text-sm transition-colors last:border-b-0 hover:bg-brand-cream"
                  >
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                      <meta.icon size={12} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-brand-ink">
                        <span className="font-medium">{e.adminName}</span> {e.action.toLowerCase()}
                      </p>
                      {e.details && <p className="text-xs text-brand-muted">{e.details}</p>}
                      <p className="mt-0.5 text-[10px] text-brand-muted">
                        {expanded ? new Date(e.time).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' }) : timeAgo(e.time)}
                      </p>
                    </div>
                    <ChevronDown size={13} className={`mt-1 shrink-0 text-brand-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                );
              })}
            {entries.filter((e) => activityFilter === 'all' || classifyActivity(e.action).category === activityFilter).length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-brand-muted">No activity in this category yet.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <SectionTitle>Bookings — Month on Month</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8b7d87', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="completed" name="Completed" fill="#3c6f57" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#d94f8c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle>How a booking flows</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: PlusCircle, label: 'Create Booking' },
              { icon: UserCheck, label: 'Match Caregiver' },
              { icon: ClipboardCheck, label: 'Admin Review' },
              { icon: Banknote, label: 'Payroll Generated' },
            ].map((step, i) => (
              <div key={step.label} className="rounded-xl border border-black/5 p-3 text-center">
                <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-pink-light text-brand-pink">
                  <step.icon size={16} />
                </div>
                <p className="text-[10px] font-semibold text-brand-muted">STEP {i + 1}</p>
                <p className="text-xs font-medium text-brand-ink">{step.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-5 !p-0 overflow-hidden">
        <div className="p-5 pb-0">
          <SectionTitle>Today's Active Roster</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Caregiver</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Scheduled</th>
                <th className="px-5 py-3 font-medium">Check-in status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {todaysAssignments.map((a) => {
                const cl = cls.find((c) => c.id === a.clId);
                const client = clients.find((c) => c.id === a.clientId);
                if (!cl || !client) return null;
                const checkedIn = a.status === 'completed' || a.status === 'confirmed';
                return (
                  <tr key={a.id} className="border-t border-black/5">
                    <td className="flex items-center gap-2 px-5 py-3">
                      <Avatar name={cl.name} color={cl.avatarColor} size={26} />
                      {cl.name}
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{client.name}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatTime12(a.startTime)}</td>
                    <td className="px-5 py-3">
                      <Badge status={checkedIn ? 'confirmed' : 'pending'}>{checkedIn ? 'Checked in' : 'Not yet'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/cls/${cl.id}`} className="text-xs font-medium text-brand-pink hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="h-3" />
      </Card>
      <div className="h-6" />
    </PageShell>
  );
}
