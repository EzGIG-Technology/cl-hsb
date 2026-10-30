import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, PlusCircle, ClipboardCheck, Activity, Users, Contact, Wallet, ChevronDown } from 'lucide-react';
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
import { monthlyCompletedAssignments, locationTotals } from '../data/reports';
import { TODAY, TODAY_STR, formatTime12, toDateStr, expiryUrgency } from '../lib/date';
import { staffPath } from '../types';

const monthlyCancelled = [4, 6, 3, 5, 7, 2, 6, 3, 8, 4, 5, 9];
const weekdayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type ActivityCategory = 'booking' | 'staff' | 'customer' | 'payroll' | 'other';
const activityFilters: { id: 'all' | ActivityCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'booking', label: 'Bookings' },
  { id: 'staff', label: 'Staff' },
  { id: 'customer', label: 'Customers' },
  { id: 'payroll', label: 'Payroll' },
];

function classifyActivity(action: string): { category: ActivityCategory; icon: typeof Activity; color: string } {
  if (/booking|reassign|reschedul|approved|rejected|session/i.test(action))
    return { category: 'booking', icon: ClipboardCheck, color: 'bg-brand-pink-light text-brand-pink' };
  if (/\bcls?\b|staff|therapist|caregiver|flag|passport|certification|leave|treatment photo/i.test(action))
    return { category: 'staff', icon: Users, color: 'bg-brand-lavender-light text-brand-lavender' };
  if (/client|customer|address|package|treatment/i.test(action)) return { category: 'customer', icon: Contact, color: 'bg-brand-cream text-brand-lavender-dark' };
  if (/paid|payroll|report|expense|budget|payment/i.test(action)) return { category: 'payroll', icon: Wallet, color: 'bg-brand-amber-light text-brand-amber' };
  return { category: 'other', icon: Activity, color: 'bg-brand-cream text-brand-muted' };
}

/** Older log entries were written with older wording; show them in today's terms. */
function displayAction(action: string) {
  return action
    .toLowerCase()
    .replace(/therapists/g, 'staff')
    .replace(/therapist/g, 'staff')
    .replace(/caregiver/g, 'cl')
    .replace(/clients/g, 'customers')
    .replace(/client/g, 'customer')
    .replace(/\bpackage\b/g, 'treatment')
    .replace(/\bcl(s?)\b/g, 'CL$1');
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday;
}

function HeadlineFigure({ label, value, suffix, note }: { label: string; value: ReactNode; suffix?: string; note: string }) {
  return (
    <div>
      <p className="text-sm text-brand-muted">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-brand-ink xl:text-5xl">
        {value}
        {suffix && <span className="ml-1.5 text-lg font-normal tracking-normal text-brand-muted">{suffix}</span>}
      </p>
      <p className="mt-2 text-sm text-brand-muted">{note}</p>
    </div>
  );
}

function AlertLink({ to, tone, children }: { to: string; tone: 'red' | 'amber'; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
        tone === 'red' ? 'bg-red-50 text-red-800 hover:bg-red-100' : 'bg-brand-amber-light text-brand-ink hover:bg-brand-amber/20'
      }`}
    >
      <AlertTriangle size={16} className={`shrink-0 ${tone === 'red' ? 'text-red-600' : 'text-brand-amber'}`} />
      <span>{children}</span>
      <ArrowRight size={15} className="ml-auto shrink-0" />
    </Link>
  );
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
  const monthPrefix = TODAY_STR.slice(0, 7);
  const monthName = TODAY.toLocaleDateString('en-GB', { month: 'long' });
  const thisMonthAssignments = assignments.filter((a) => a.date.startsWith(monthPrefix));
  const completedThisMonth = thisMonthAssignments.filter((a) => a.status === 'completed').length;
  const completionRate = thisMonthAssignments.length ? Math.round((completedThisMonth / thisMonthAssignments.length) * 100) : 0;
  const cancelledThisMonth = thisMonthAssignments.filter((a) => a.status === 'cancelled').length;
  const missedCheckIn = onDuty.length > 0 ? 1 : 0;
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
          return sum + (pkg?.tiers[0]?.price ?? 0);
        }, 0),
    [assignments, packageById],
  );
  const avgRating = cls.length ? (cls.reduce((a, c) => a + c.rating, 0) / cls.length).toFixed(1) : '0.0';
  const repeatRate = clients.length ? Math.round((clients.filter((c) => c.packageIds.length > 1).length / clients.length) * 100) + 12 : 0;
  const utilization = cls.length ? Math.round((onDuty.length / cls.length) * 100) : 0;
  const totalClientsMapped = locationTotals.reduce((sum, l) => sum + l.count, 0);

  const chartData = monthlyCompletedAssignments.map((m, i) => ({ month: m.month, completed: m.completed, cancelled: monthlyCancelled[i] }));

  const heroDateLabel = new Date(`${TODAY_STR}T00:00:00`).toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dailyCancelled = todaysAssignments.filter((a) => a.status === 'cancelled').length;
  const dailyRescheduled = todaysAssignments.filter((a) => a.rescheduled).length;
  const dailyAssigned = Math.max(0, todaysAssignments.length - dailyCancelled - dailyRescheduled);
  const checkedInToday = todaysAssignments.filter((a) => a.status === 'completed' || a.status === 'confirmed').length;

  const weekStart = startOfWeek(TODAY);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = toDateStr(d);
    const dayAssignments = assignments.filter((a) => a.date === dateStr);
    return { dateStr, dayNum: d.getDate(), label: weekdayShort[i], isToday: dateStr === TODAY_STR, count: dayAssignments.length };
  });
  const weekAssignments = assignments
    .filter((a) => weekDays.some((w) => w.dateStr === a.date))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const weeklyCancelled = weekAssignments.filter((a) => a.status === 'cancelled').length;
  const weeklyRescheduled = weekAssignments.filter((a) => a.rescheduled).length;
  const weeklyAssigned = Math.max(0, weekAssignments.length - weeklyCancelled - weeklyRescheduled);

  const visibleEntries = entries.filter((e) => activityFilter === 'all' || classifyActivity(e.action).category === activityFilter);

  return (
    <PageShell
      title="Overview"
      subtitle="Today at Honey Spa Bangi: sessions, staff and bookings at a glance."
      headerAction={
        <Link
          to="/bookings"
          className="flex items-center gap-2 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
        >
          <PlusCircle size={16} /> New booking
        </Link>
      }
    >
      <HeroBanner name="Manager" dateLabel={heroDateLabel} />

      {(missedCheckIn > 0 || openDisputes > 0 || expiringCompliance > 0) && (
        <div className="mt-6 space-y-2">
          {missedCheckIn > 0 && (
            <AlertLink to="/bookings" tone="red">
              {missedCheckIn} staff member has a session with a missed check-in. See today&rsquo;s roster below.
            </AlertLink>
          )}
          {openDisputes > 0 && (
            <AlertLink to="/disputes" tone="red">
              {openDisputes} open complaint{openDisputes === 1 ? '' : 's'}: a step in the session flow was missed (GPS, selfie or checklist).
            </AlertLink>
          )}
          {expiringCompliance > 0 && (
            <AlertLink to="/cls" tone="amber">
              {expiringCompliance} certification{expiringCompliance === 1 ? '' : 's'} or permit{expiringCompliance === 1 ? '' : 's'} expiring soon. Review CL and spa staff.
            </AlertLink>
          )}
        </div>
      )}

      <Card className="mt-6 p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          <HeadlineFigure
            label="Today's sessions"
            value={todaysAssignments.length}
            note={`${checkedInToday} checked in · ${dailyCancelled} cancelled`}
          />
          <HeadlineFigure label="Revenue" value={formatRM(Math.round(revenue))} note="Confirmed and completed sessions" />
          <HeadlineFigure label="Average rating" value={avgRating} suffix="/ 5" note={`${repeatRate}% of customers come back`} />
          <HeadlineFigure
            label="Staff on duty"
            value={onDuty.length}
            suffix={`/ ${cls.length}`}
            note={`${utilization}% of the team working now`}
          />
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="!p-0 overflow-hidden">
          <div className="p-6 pb-2">
            <SectionTitle
              action={
                <Link to="/schedule" className="flex items-center gap-1 text-sm font-medium text-brand-pink hover:underline">
                  Schedule <ArrowRight size={14} />
                </Link>
              }
            >
              Today&rsquo;s roster
            </SectionTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sm text-brand-muted">
                  <th className="px-6 py-2 font-normal">Staff</th>
                  <th className="px-6 py-2 font-normal">Customer</th>
                  <th className="px-6 py-2 font-normal">Time</th>
                  <th className="px-6 py-2 font-normal">Check-in</th>
                  <th className="px-6 py-2 font-normal">
                    <span className="sr-only">Profile</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {todaysAssignments.map((a) => {
                  const staffMember = cls.find((c) => c.id === a.clId);
                  const client = clients.find((c) => c.id === a.clientId);
                  if (!staffMember || !client) return null;
                  const checkedIn = a.status === 'completed' || a.status === 'confirmed';
                  return (
                    <tr key={a.id} className="border-t border-brand-cream" /* taste-skill-ignore: table row */>
                      <td className="px-6 py-3.5">
                        <span className="flex items-center gap-2.5 text-brand-ink">
                          <Avatar name={staffMember.name} color={staffMember.avatarColor} size={28} />
                          {staffMember.name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-brand-ink">{client.name}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-brand-ink">{formatTime12(a.startTime)}</td>
                      <td className="px-6 py-3.5">
                        <Badge status={checkedIn ? 'confirmed' : 'pending'}>{checkedIn ? 'Checked in' : 'Not yet'}</Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link to={staffPath(staffMember)} className="text-sm font-medium text-brand-pink hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {todaysAssignments.length === 0 && <p className="px-6 pb-6 text-sm text-brand-muted">No sessions booked for today.</p>}
          </div>
          <div className="h-3" />
        </Card>

        <Card className="flex flex-col !p-0 overflow-hidden">
          <div className="p-6 pb-3">
            <SectionTitle>Activity</SectionTitle>
            <div className="-mt-1 flex flex-wrap gap-1.5">
              {activityFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActivityFilter(f.id)}
                  aria-pressed={activityFilter === f.id}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                    activityFilter === f.id ? 'bg-brand-pink text-white' : 'bg-brand-cream text-brand-ink hover:bg-brand-pink-light hover:text-brand-pink-dark'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="scrollbar-thin max-h-[26rem] flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
            {visibleEntries.slice(0, 15).map((e) => {
              const meta = classifyActivity(e.action);
              const expanded = expandedEntryId === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setExpandedEntryId((id) => (id === e.id ? null : e.id))}
                  aria-expanded={expanded}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-cream"
                >
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                    <meta.icon size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-brand-ink">
                      <span className="font-medium">{e.adminName}</span> {displayAction(e.action)}
                    </span>
                    {e.details && <span className="block text-brand-muted">{e.details}</span>}
                    <span className="mt-0.5 block text-xs text-brand-muted">
                      {expanded ? new Date(e.time).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' }) : timeAgo(e.time)}
                    </span>
                  </span>
                  <ChevronDown size={14} className={`mt-1 shrink-0 text-brand-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
            {visibleEntries.length === 0 && <p className="px-3 py-6 text-center text-sm text-brand-muted">No activity in this category yet.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Bookings month on month</SectionTitle>
          <p className="-mt-2 mb-4 text-sm text-brand-muted">
            {monthName} so far: {thisMonthAssignments.length} bookings, {completionRate}% completed, {cancelledThisMonth} cancelled.
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={3}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a7f8c', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#fdf6f9' }}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(47,43,85,0.12)', fontSize: 13 }} // taste-skill-ignore: overlay
              />
              <Legend wrapperStyle={{ fontSize: 13 }} iconType="circle" iconSize={9} />
              <Bar dataKey="completed" name="Completed" fill="#c42474" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#8c94c4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="flex flex-col p-6">
          <SectionTitle
            action={
              <Link to="/map" className="flex items-center gap-1 text-sm font-medium text-brand-pink hover:underline">
                Open map <ArrowRight size={14} />
              </Link>
            }
          >
            Where customers live
          </SectionTitle>
          <p className="-mt-2 mb-4 text-sm text-brand-muted">
            {totalClientsMapped} customers across {locationTotals.length} areas around Bangi Sentral.
          </p>
          <div className="h-[300px] overflow-hidden rounded-xl">
            <OperationsMap compact />
          </div>
        </Card>
      </div>

      <section className="mt-10">
        <Card className="p-6">
          <SectionTitle
            action={
              <Link to="/schedule" className="flex items-center gap-1 text-sm font-medium text-brand-pink hover:underline">
                Open schedule <ArrowRight size={14} />
              </Link>
            }
          >
            This week
          </SectionTitle>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((w) => (
              <div key={w.dateStr} className={`rounded-xl px-2 py-3 text-center ${w.isToday ? 'bg-brand-pink text-white' : 'bg-brand-cream text-brand-ink'}`}>
                <p className={`text-sm ${w.isToday ? 'text-white/85' : 'text-brand-muted'}`}>{w.label}</p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight">{w.dayNum}</p>
                <p className={`text-xs ${w.isToday ? 'text-white/85' : 'text-brand-muted'}`}>
                  {w.count} session{w.count === 1 ? '' : 's'}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EngagementDonut
            title="Today's sessions"
            periodLabel="Today"
            total={todaysAssignments.length}
            totalLabel="sessions"
            segments={[
              { label: 'Assigned', count: dailyAssigned, color: '#6f76b0' },
              { label: 'Rescheduled', count: dailyRescheduled, color: '#c42474' },
              { label: 'Cancelled', count: dailyCancelled, color: '#b23b3b' },
              { label: 'Waiting for staff', count: unassignedForEngagement.length, color: '#d9921f', arc: false },
            ]}
          />
          <EngagementDonut
            title="This week's sessions"
            periodLabel="This week"
            total={weekAssignments.length}
            totalLabel="sessions"
            segments={[
              { label: 'Assigned', count: weeklyAssigned, color: '#6f76b0' },
              { label: 'Rescheduled', count: weeklyRescheduled, color: '#c42474' },
              { label: 'Cancelled', count: weeklyCancelled, color: '#b23b3b' },
              { label: 'Waiting for staff', count: unassignedForEngagement.length, color: '#d9921f', arc: false },
            ]}
          />
        </div>
      </section>
      <div className="h-6" />
    </PageShell>
  );
}
