import { useMemo, useState } from 'react';
import { CalendarClock, Users, Palmtree, AlertTriangle, X, Repeat, CalendarCog, Filter, CalendarDays } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { MiniCalendar } from '../components/MiniCalendar';
import { Card, StatCard, Badge, Avatar, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useClientStore } from '../store/ClientStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { useAssignmentStore } from '../store/AssignmentStore';
import { TODAY, toDateStr, formatTime12 } from '../lib/date';
import type { Assignment, Therapist } from '../types';

const DAY_START_MIN = 7 * 60;
const DAY_END_MIN = 20 * 60;
const HOUR_HEIGHT = 76;
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

type ScheduleCategory = 'assigned' | 'active' | 'upcoming' | 'completed' | 'cancelled' | 'unassigned';

const legend: { label: string; category: ScheduleCategory; color: string; swatch: string }[] = [
  { label: 'Assigned', category: 'assigned', color: '#6f76b0', swatch: 'bg-brand-lavender-light border-brand-lavender/40' },
  { label: 'Active today', category: 'active', color: '#c42474', swatch: 'bg-brand-pink-light border-brand-pink/40' },
  { label: 'Upcoming (pending)', category: 'upcoming', color: '#d9921f', swatch: 'bg-brand-amber-light border-brand-amber/50' },
  { label: 'Completed', category: 'completed', color: '#2563eb', swatch: 'bg-blue-50 border-blue-300' },
  { label: 'Cancelled', category: 'cancelled', color: '#ef4444', swatch: 'bg-red-50 border-red-300' },
  { label: 'Unassigned', category: 'unassigned', color: '#ea580c', swatch: 'bg-orange-50 border-orange-300' },
];

function categoryOf(a: Assignment, isToday: boolean): ScheduleCategory {
  if (a.status === 'cancelled') return 'cancelled';
  if (a.status === 'completed') return 'completed';
  if (a.status === 'pending') return 'upcoming';
  if (isToday) return 'active';
  return 'assigned';
}

function blockStyle(a: Assignment, isToday: boolean) {
  if (a.status === 'cancelled') return 'bg-red-50 border-red-300 opacity-80';
  if (a.status === 'completed') return 'bg-blue-50 border-blue-300';
  if (a.status === 'pending') return 'bg-brand-amber-light border-brand-amber/50';
  if (isToday) return 'bg-brand-pink-light border-brand-pink/50';
  return 'bg-brand-lavender-light border-brand-lavender/40';
}

export default function SchedulePage() {
  const { cls: confinementLadies, clById } = useCLStore();
  const { packageById } = useSettings();
  const { clientById } = useClientStore();
  const { logAction } = useActivityLog();
  const { assignments: allAssignments, unassignedClientIds: unassigned, addBooking, reassignCL: storeReassign, reschedule: storeReschedule } = useAssignmentStore();
  const [weekStart, setWeekStart] = useState(() => mondayOf(TODAY));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | ScheduleCategory>('all');

  const selectedAssignment = allAssignments.find((a) => a.id === selectedId) ?? null;
  const todayStr = toDateStr(TODAY);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)),
    [weekStart],
  );

  const weekAssignments = allAssignments.filter((a) => days.some((d) => toDateStr(d) === a.date));
  const visibleWeekAssignments =
    categoryFilter === 'all'
      ? weekAssignments
      : categoryFilter === 'unassigned'
        ? []
        : weekAssignments.filter((a) => categoryOf(a, a.date === todayStr) === categoryFilter);
  const scheduledCount = weekAssignments.filter((a) => a.status !== 'cancelled').length;
  const availableCLs = confinementLadies.filter((c) => c.status === 'available');
  const onLeave = confinementLadies.filter((c) => c.status === 'on-leave');
  const conflicts = weekAssignments.filter((a) => a.status === 'cancelled' || a.urgent).length;

  const hours = Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 60 + 1 }, (_, i) => DAY_START_MIN / 60 + i);

  function assignCL(clientId: string, clId: string) {
    const client = clientById(clientId);
    if (!client) return;
    addBooking({
      clientId,
      clId,
      packageId: client.packageIds[0],
      date: toDateStr(TODAY),
      startTime: '09:00',
      endTime: '13:00',
      location: client.location,
    });
    setPickerFor(null);
    const cl = clById(clId);
    logAction('Front Desk', 'Assigned CL', `${cl?.name ?? clId} → ${client.name}`);
  }

  function reassignCL(assignmentId: string, newClId: string) {
    const a = allAssignments.find((x) => x.id === assignmentId);
    const oldCl = a ? clById(a.clId) : undefined;
    const newCl = clById(newClId);
    storeReassign(assignmentId, newClId);
    logAction('Front Desk', 'Reassigned CL', `${oldCl?.name ?? 'Unknown'} → ${newCl?.name ?? newClId}`);
  }

  function rescheduleAssignment(assignmentId: string, date: string, startTime: string, endTime: string) {
    const a = allAssignments.find((x) => x.id === assignmentId);
    const client = a ? clientById(a.clientId) : undefined;
    storeReschedule(assignmentId, date, startTime, endTime);
    logAction('Front Desk', 'Rescheduled booking', `${client?.name ?? 'Client'} → ${date} ${startTime}-${endTime}`);
  }

  return (
    <PageShell
      title="Schedule & Roster"
      subtitle="Plan CL assignments, availability, and replacements."
      icon={CalendarDays}
      accentColor="#c42474"
      searchPlaceholder="Search CL or client"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Scheduled" value={scheduledCount} icon={<CalendarClock size={16} className="text-brand-pink" />} />
        <StatCard label="Available CLs" value={availableCLs.length} icon={<Users size={16} className="text-blue-600" />} />
        <StatCard label="On leave" value={onLeave.length} icon={<Palmtree size={16} className="text-brand-amber" />} />
        <StatCard label="Conflicts" value={conflicts} icon={<AlertTriangle size={16} className="text-red-500" />} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
          <Filter size={13} /> Show only
        </span>
        <button
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            categoryFilter === 'all' ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
          }`}
        >
          All categories
        </button>
        {legend.map((l) => (
          <button
            key={l.category}
            onClick={() => setCategoryFilter((f) => (f === l.category ? 'all' : l.category))}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === l.category ? 'text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
            }`}
            style={categoryFilter === l.category ? { backgroundColor: l.color } : undefined}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: categoryFilter === l.category ? 'white' : l.color }} />
            {l.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-5">
          <Card>
            <MiniCalendar selectedDate={weekStart} onSelect={(d) => setWeekStart(mondayOf(d))} />
          </Card>
          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">Legend</p>
            <div className="space-y-2">
              {legend.map((l) => (
                <button
                  key={l.label}
                  onClick={() => setCategoryFilter((f) => (f === l.category ? 'all' : l.category))}
                  className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-sm transition-colors hover:bg-brand-cream ${
                    categoryFilter === l.category ? 'bg-brand-cream font-medium' : ''
                  } text-brand-ink`}
                >
                  <span className={`h-3 w-3 shrink-0 rounded-full border ${l.swatch}`} style={{ backgroundColor: l.color + '33', borderColor: l.color }} />
                  {l.label}
                </button>
              ))}
            </div>
          </Card>
          {selectedAssignment ? (
            <SelectedDetail
              assignment={selectedAssignment}
              onClose={() => setSelectedId(null)}
              availableCLs={availableCLs}
              onReassign={(newClId) => reassignCL(selectedAssignment.id, newClId)}
              onReschedule={(date, start, end) => rescheduleAssignment(selectedAssignment.id, date, start, end)}
            />
          ) : (
            <Card className="text-sm text-brand-muted">Click any assignment block to see full details here.</Card>
          )}
        </div>

        <Card className="!p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-5">
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
              <span className="ml-2 text-base font-semibold text-brand-ink">
                Week of {days[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} –{' '}
                {days[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <span className="text-xs text-brand-muted">
              {categoryFilter === 'all' ? weekAssignments.length : visibleWeekAssignments.length} sessions this week
              {categoryFilter !== 'all' && ` · filtered to ${legend.find((l) => l.category === categoryFilter)?.label}`}
            </span>
          </div>

          {categoryFilter === 'unassigned' && (
            <div className="flex items-center gap-2 border-b border-black/5 bg-orange-50 px-5 py-2.5 text-xs text-orange-700">
              <Filter size={13} className="shrink-0" /> Unassigned bookings have no date/time yet, so they don't appear on the calendar — see
              "Unassigned requests" below.
            </div>
          )}

          <div className="scrollbar-thin overflow-x-auto">
            <div className="flex min-w-[900px]">
              <div className="w-16 shrink-0 border-r border-black/5">
                <div className="h-14 border-b border-black/5" />
                {hours.map((h) => (
                  <div key={h} style={{ height: HOUR_HEIGHT }} className="relative border-b border-black/5 text-right text-xs text-brand-muted">
                    <span className="absolute -top-2 right-2">{h % 12 === 0 ? 12 : h % 12}{h >= 12 ? 'PM' : 'AM'}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-1">
                {days.map((day) => {
                  const dateStr = toDateStr(day);
                  const isToday = dateStr === toDateStr(TODAY);
                  const dayAssignments = visibleWeekAssignments.filter((a) => a.date === dateStr);
                  return (
                    <div key={dateStr} className="min-w-[126px] flex-1 border-r border-black/5 last:border-r-0">
                      <div className={`flex h-14 flex-col items-center justify-center border-b border-black/5 ${isToday ? 'bg-brand-pink-light' : ''}`}>
                        <span className="text-[11px] uppercase tracking-wide text-brand-muted">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className={`text-base font-semibold ${isToday ? 'text-brand-pink' : 'text-brand-ink'}`}>{day.getDate()}</span>
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
                          const height = Math.max(36, ((toMinutes(a.endTime) - toMinutes(a.startTime)) / 60) * HOUR_HEIGHT);
                          return (
                            <button
                              key={a.id}
                              onClick={() => setSelectedId(a.id)}
                              className={`absolute left-1.5 right-1.5 overflow-hidden rounded-lg border px-2.5 py-1.5 text-left text-xs shadow-sm transition-transform hover:scale-[1.02] ${blockStyle(a, isToday)}`}
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
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Card className="border-l-4 !border-l-orange-400">
            <SectionTitle>
              Unassigned requests
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">{unassigned.length}</span>
            </SectionTitle>
            <p className="mb-3 -mt-2 text-xs text-brand-muted">Clients still requiring a CL</p>
            <div className="space-y-3">
              {unassigned.map((clientId) => {
                const client = clientById(clientId);
                if (!client) return null;
                const pkg = packageById(client.packageIds[0]);
                return (
                  <div key={clientId} className="rounded-xl border border-black/5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-brand-ink">{client.name}</p>
                        <p className="text-xs text-brand-muted">{pkg?.shortName}</p>
                      </div>
                      <Badge status={client.status === 'upcoming' ? 'urgent' : 'upcoming'}>
                        {client.preferredDate <= toDateStr(TODAY) ? 'Urgent' : 'Upcoming'}
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
                        className="mt-2 rounded-full bg-brand-pink px-3 py-1 text-xs font-medium text-white hover:bg-brand-pink-dark"
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
        </div>

        <div>
          <Card className="border-l-4 !border-l-brand-lavender">
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
              {availableCLs.length === 0 && <p className="text-sm text-brand-muted">No CLs currently available.</p>}
            </div>
          </Card>
        </div>
      </div>

      <div className="h-6" />
    </PageShell>
  );
}

function SelectedDetail({
  assignment,
  onClose,
  availableCLs,
  onReassign,
  onReschedule,
}: {
  assignment: Assignment;
  onClose: () => void;
  availableCLs: Therapist[];
  onReassign: (newClId: string) => void;
  onReschedule: (date: string, startTime: string, endTime: string) => void;
}) {
  const { clById } = useCLStore();
  const { packageById } = useSettings();
  const { clientById } = useClientStore();
  const [mode, setMode] = useState<'view' | 'reassign' | 'reschedule'>('view');
  const [dateDraft, setDateDraft] = useState(assignment.date);
  const [startDraft, setStartDraft] = useState(assignment.startTime);
  const [endDraft, setEndDraft] = useState(assignment.endTime);

  const cl = clById(assignment.clId);
  const client = clientById(assignment.clientId);
  const pkg = packageById(assignment.packageId);
  if (!cl || !client || !pkg) return null;

  return (
    <Card>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-semibold text-brand-ink">{client.name}</p>
          <p className="text-xs text-brand-muted">{pkg.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={assignment.status}>{assignment.status}</Badge>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm text-brand-ink">
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
        <p className="text-brand-muted">{assignment.location}</p>
      </div>

      {mode === 'view' && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setMode('reassign')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-cream py-1.5 text-xs font-medium text-brand-ink hover:bg-black/5"
          >
            <Repeat size={12} /> Reassign CL
          </button>
          <button
            onClick={() => setMode('reschedule')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-cream py-1.5 text-xs font-medium text-brand-ink hover:bg-black/5"
          >
            <CalendarCog size={12} /> Reschedule
          </button>
        </div>
      )}

      {mode === 'reassign' && (
        <div className="mt-3 space-y-1 rounded-lg bg-brand-cream p-2">
          <p className="mb-1 text-xs text-brand-muted">Choose a replacement CL:</p>
          {availableCLs
            .filter((c) => c.id !== cl.id)
            .map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onReassign(c.id);
                  setMode('view');
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-brand-ink hover:bg-white"
              >
                <Avatar name={c.name} color={c.avatarColor} size={20} />
                {c.name}
              </button>
            ))}
          <button onClick={() => setMode('view')} className="mt-1 text-xs text-brand-muted hover:text-brand-ink">
            Cancel
          </button>
        </div>
      )}

      {mode === 'reschedule' && (
        <div className="mt-3 space-y-2 rounded-lg bg-brand-cream p-2">
          <input
            type="date"
            value={dateDraft}
            onChange={(e) => setDateDraft(e.target.value)}
            className="w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-xs text-brand-ink"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={startDraft}
              onChange={(e) => setStartDraft(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-xs text-brand-ink"
            />
            <input
              type="time"
              value={endDraft}
              onChange={(e) => setEndDraft(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-xs text-brand-ink"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReschedule(dateDraft, startDraft, endDraft);
                setMode('view');
              }}
              className="rounded-full bg-brand-pink px-3 py-1 text-xs font-medium text-white hover:bg-brand-pink-dark"
            >
              Save
            </button>
            <button onClick={() => setMode('view')} className="rounded-full px-3 py-1 text-xs text-brand-muted hover:bg-black/5">
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
