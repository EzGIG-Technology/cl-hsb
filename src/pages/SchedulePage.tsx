import { useMemo, useState } from 'react';
import { CalendarClock, Users, Palmtree, AlertTriangle, X } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { MiniCalendar } from '../components/MiniCalendar';
import { Card, StatCard, Badge, Avatar, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { clientById } from '../data/clients';
import { useSettings } from '../store/SettingsContext';
import { assignments as seedAssignments, unassignedClientIds as seedUnassigned } from '../data/assignments';
import { TODAY, toDateStr, formatTime12 } from '../lib/date';
import type { Assignment } from '../types';

const DAY_START_MIN = 7 * 60;
const DAY_END_MIN = 20 * 60;
const HOUR_HEIGHT = 64;
const GRID_HEIGHT = ((DAY_END_MIN - DAY_START_MIN) / 60) * HOUR_HEIGHT;

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function mondayOf(date: Date) {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

const themeBlock: Record<string, string> = {
  confirmed: 'bg-brand-green-light border-brand-green/30',
  pending: 'bg-brand-amber-light border-brand-amber/40',
  completed: 'bg-gray-100 border-gray-300',
  cancelled: 'bg-red-50 border-red-200 opacity-70',
};

export default function SchedulePage() {
  const { cls: confinementLadies, clById } = useCLStore();
  const { packageById } = useSettings();
  const [weekStart, setWeekStart] = useState(() => mondayOf(TODAY));
  const [allAssignments, setAllAssignments] = useState<Assignment[]>(seedAssignments);
  const [unassigned, setUnassigned] = useState<string[]>(seedUnassigned);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const days = useMemo(
    () => Array.from({ length: 5 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)),
    [weekStart],
  );

  const weekAssignments = allAssignments.filter((a) => days.some((d) => toDateStr(d) === a.date));
  const scheduledCount = weekAssignments.filter((a) => a.status !== 'cancelled').length;
  const availableCLs = confinementLadies.filter((c) => c.status === 'available');
  const onLeave = confinementLadies.filter((c) => c.status === 'on-leave');
  const conflicts = weekAssignments.filter((a) => a.status === 'cancelled' || a.urgent).length;

  const hours = Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 60 + 1 }, (_, i) => DAY_START_MIN / 60 + i);

  function assignCL(clientId: string, clId: string) {
    const client = clientById(clientId);
    if (!client) return;
    const newAssignment: Assignment = {
      id: `asg-new-${Date.now()}`,
      clientId,
      clId,
      packageId: client.packageId,
      date: toDateStr(TODAY),
      startTime: '09:00',
      endTime: '13:00',
      location: client.location,
      status: 'pending',
    };
    setAllAssignments((prev) => [...prev, newAssignment]);
    setUnassigned((prev) => prev.filter((id) => id !== clientId));
    setPickerFor(null);
  }

  return (
    <PageShell
      title="Schedule & Roster"
      subtitle="Plan CL assignments, availability, and replacements."
      searchPlaceholder="Search CL or client"
      sidePanel={
        <div className="flex flex-1 flex-col gap-4">
          <MiniCalendar selectedDate={weekStart} onSelect={(d) => setWeekStart(mondayOf(d))} />
          {selected ? (
            <SelectedDetail assignment={selected} onClose={() => setSelected(null)} />
          ) : (
            <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/70">
              Click any assignment block to see full details here.
            </div>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Scheduled" value={scheduledCount} icon={<CalendarClock size={16} className="text-brand-maroon" />} />
        <StatCard label="Available CLs" value={availableCLs.length} icon={<Users size={16} className="text-blue-600" />} />
        <StatCard label="On leave" value={onLeave.length} icon={<Palmtree size={16} className="text-brand-amber" />} />
        <StatCard label="Conflicts" value={conflicts} icon={<AlertTriangle size={16} className="text-red-500" />} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <Card className="!p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekStart(mondayOf(TODAY))}
                className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-brand-ink hover:bg-brand-cream"
              >
                Today
              </button>
              <button
                onClick={() => setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7))}
                className="rounded-full border border-black/10 px-2.5 py-1.5 text-sm text-brand-ink hover:bg-brand-cream"
              >
                ‹
              </button>
              <button
                onClick={() => setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7))}
                className="rounded-full border border-black/10 px-2.5 py-1.5 text-sm text-brand-ink hover:bg-brand-cream"
              >
                ›
              </button>
              <span className="ml-2 text-sm font-medium text-brand-ink">
                Week of {days[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} –{' '}
                {days[4].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex">
            <div className="w-14 shrink-0 border-r border-black/5">
              <div className="h-12 border-b border-black/5" />
              {hours.map((h) => (
                <div key={h} style={{ height: HOUR_HEIGHT }} className="relative border-b border-black/5 text-right text-[10px] text-brand-muted">
                  <span className="absolute -top-1.5 right-1">{h % 12 === 0 ? 12 : h % 12}{h >= 12 ? 'PM' : 'AM'}</span>
                </div>
              ))}
            </div>

            <div className="scrollbar-thin flex flex-1 overflow-x-auto">
              {days.map((day) => {
                const dateStr = toDateStr(day);
                const isToday = dateStr === toDateStr(TODAY);
                const dayAssignments = weekAssignments.filter((a) => a.date === dateStr);
                return (
                  <div key={dateStr} className="min-w-[150px] flex-1 border-r border-black/5 last:border-r-0">
                    <div className={`flex h-12 flex-col items-center justify-center border-b border-black/5 ${isToday ? 'bg-brand-pink-light' : ''}`}>
                      <span className="text-[10px] uppercase text-brand-muted">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className={`text-sm font-semibold ${isToday ? 'text-brand-maroon' : 'text-brand-ink'}`}>{day.getDate()}</span>
                    </div>
                    <div className="relative" style={{ height: GRID_HEIGHT }}>
                      {hours.map((h) => (
                        <div key={h} className="absolute left-0 right-0 border-b border-black/5" style={{ top: (h - DAY_START_MIN / 60) * HOUR_HEIGHT }} />
                      ))}
                      {dayAssignments.map((a) => {
                        const cl = clById(a.clId);
                        const client = clientById(a.clientId);
                        const pkg = packageById(a.packageId);
                        if (!cl || !client || !pkg) return null;
                        const top = ((toMinutes(a.startTime) - DAY_START_MIN) / 60) * HOUR_HEIGHT;
                        const height = Math.max(28, ((toMinutes(a.endTime) - toMinutes(a.startTime)) / 60) * HOUR_HEIGHT);
                        return (
                          <button
                            key={a.id}
                            onClick={() => setSelected(a)}
                            className={`absolute left-1 right-1 overflow-hidden rounded-lg border px-2 py-1 text-left text-[11px] shadow-sm transition-transform hover:scale-[1.02] ${themeBlock[a.status]}`}
                            style={{ top, height }}
                          >
                            <p className="truncate font-semibold text-brand-ink">{client.name}</p>
                            <p className="truncate text-brand-muted">{formatTime12(a.startTime)} – {formatTime12(a.endTime)}</p>
                            <div className="mt-1 flex items-center gap-1">
                              <Avatar name={cl.name} color={cl.avatarColor} size={16} />
                              <span className="truncate text-brand-muted">{cl.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <SectionTitle>
              Unassigned requests
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">{unassigned.length}</span>
            </SectionTitle>
            <p className="mb-3 -mt-2 text-xs text-brand-muted">Clients still requiring a CL</p>
            <div className="space-y-3">
              {unassigned.map((clientId) => {
                const client = clientById(clientId);
                if (!client) return null;
                const pkg = packageById(client.packageId);
                return (
                  <div key={clientId} className="rounded-xl border border-black/5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-brand-ink">{client.name}</p>
                        <p className="text-xs text-brand-muted">{pkg?.shortName}</p>
                      </div>
                      <Badge status={client.status === 'upcoming' ? 'urgent' : 'upcoming'}>
                        {client.dueOrBirthDate <= toDateStr(TODAY) ? 'Urgent' : 'Upcoming'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-brand-muted">{client.location}</p>

                    {pickerFor === clientId ? (
                      <div className="mt-2 space-y-1 rounded-lg bg-brand-cream p-2">
                        {availableCLs.map((cl) => (
                          <button
                            key={cl.id}
                            onClick={() => assignCL(clientId, cl.id)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-white"
                          >
                            <Avatar name={cl.name} color={cl.avatarColor} size={20} />
                            {cl.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setPickerFor(clientId)}
                        className="mt-2 rounded-full bg-brand-maroon px-3 py-1 text-xs font-medium text-white hover:bg-brand-maroon-dark"
                      >
                        Schedule
                      </button>
                    )}
                  </div>
                );
              })}
              {unassigned.length === 0 && <p className="text-sm text-brand-muted">All caught up — no pending requests.</p>}
            </div>
          </Card>

          <Card>
            <SectionTitle>Available now</SectionTitle>
            <p className="mb-3 -mt-2 text-xs text-brand-muted">CLs without conflicts this week</p>
            <div className="space-y-3">
              {availableCLs.map((cl) => (
                <div key={cl.id} className="flex items-center gap-3">
                  <Avatar name={cl.name} color={cl.avatarColor} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-ink">{cl.name}</p>
                    <p className="truncate text-xs text-brand-muted">{cl.location}</p>
                  </div>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="h-6" />
    </PageShell>
  );
}

function SelectedDetail({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const { clById } = useCLStore();
  const { packageById } = useSettings();
  const cl = clById(assignment.clId);
  const client = clientById(assignment.clientId);
  const pkg = packageById(assignment.packageId);
  if (!cl || !client || !pkg) return null;

  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-semibold">{client.name}</p>
          <p className="text-xs text-white/60">{pkg.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={assignment.status}>{assignment.status}</Badge>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm text-white/85">
        <div className="flex items-center gap-2">
          <Avatar name={cl.name} color={cl.avatarColor} size={22} />
          {cl.name}
        </div>
        <p>
          {new Date(`${assignment.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p>
          {formatTime12(assignment.startTime)} – {formatTime12(assignment.endTime)}
        </p>
        <p className="text-white/60">{assignment.location}</p>
      </div>
    </div>
  );
}
