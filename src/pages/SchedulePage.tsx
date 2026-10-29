import { useMemo, useState } from 'react';
import { X, Repeat, CalendarCog, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { MiniCalendar } from '../components/MiniCalendar';
import { Card, Badge, Avatar, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useClientStore } from '../store/ClientStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { useAssignmentStore } from '../store/AssignmentStore';
import { TODAY, toDateStr, formatTime12 } from '../lib/date';
import type { Assignment, Therapist } from '../types';

// Grid spans opening hours (10.30am–7.30pm) with half an hour either side.
const DAY_START_MIN = 10 * 60;
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

const legend: { label: string; category: ScheduleCategory; color: string }[] = [
  { label: 'Assigned', category: 'assigned', color: '#6f76b0' },
  { label: 'Active today', category: 'active', color: '#c42474' },
  { label: 'Upcoming (pending)', category: 'upcoming', color: '#d9921f' },
  { label: 'Completed', category: 'completed', color: '#8c94c4' },
  { label: 'Cancelled', category: 'cancelled', color: '#b23b3b' },
  { label: 'Unassigned', category: 'unassigned', color: '#ea580c' },
];

const colorOf = (category: ScheduleCategory) => legend.find((l) => l.category === category)?.color ?? '#6f76b0';

function categoryOf(a: Assignment, isToday: boolean): ScheduleCategory {
  if (a.status === 'cancelled') return 'cancelled';
  if (a.status === 'completed') return 'completed';
  if (a.status === 'pending') return 'upcoming';
  if (isToday) return 'active';
  return 'assigned';
}

function addMinutes(time: string, minutes: number) {
  const total = toMinutes(time) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`; // taste-skill-ignore: HH:MM clock time
}

export default function SchedulePage() {
  const { cls: therapists, clById } = useCLStore();
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
  const availableTherapists = therapists.filter((c) => c.status === 'available');
  const onLeave = therapists.filter((c) => c.status === 'on-leave');
  const conflicts = weekAssignments.filter((a) => a.status === 'cancelled' || a.urgent).length;

  const hours = Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 60 + 1 }, (_, i) => DAY_START_MIN / 60 + i);

  function assignTherapist(clientId: string, clId: string) {
    const client = clientById(clientId);
    if (!client) return;
    const packageId = client.packageIds[0];
    // First slot after the spa opens (10.30am), as long as the client's chosen session.
    const minutes = client.packageMinutes?.[packageId] ?? packageById(packageId)?.tiers[0]?.minutes ?? 60;
    addBooking({
      clientId,
      clId,
      packageId,
      date: toDateStr(TODAY),
      startTime: '10:30',
      endTime: addMinutes('10:30', minutes),
      location: client.location,
    });
    setPickerFor(null);
    const therapist = clById(clId);
    logAction('Front Desk', 'Assigned therapist', `${therapist?.name ?? clId} → ${client.name}`);
  }

  function reassignTherapist(assignmentId: string, newClId: string) {
    const a = allAssignments.find((x) => x.id === assignmentId);
    const oldTherapist = a ? clById(a.clId) : undefined;
    const newTherapist = clById(newClId);
    storeReassign(assignmentId, newClId);
    logAction('Front Desk', 'Reassigned therapist', `${oldTherapist?.name ?? 'Unknown'} → ${newTherapist?.name ?? newClId}`);
  }

  function rescheduleAssignment(assignmentId: string, date: string, startTime: string, endTime: string) {
    const a = allAssignments.find((x) => x.id === assignmentId);
    const client = a ? clientById(a.clientId) : undefined;
    storeReschedule(assignmentId, date, startTime, endTime);
    logAction('Front Desk', 'Rescheduled booking', `${client?.name ?? 'Client'} → ${date} ${startTime}-${endTime}`);
  }

  const toggleCategory = (category: ScheduleCategory) => setCategoryFilter((f) => (f === category ? 'all' : category));

  return (
    <PageShell
      title="Schedule & roster"
      subtitle="Plan therapist sessions, availability and cover for the week."
      searchPlaceholder="Search therapist or client"
    >
      <Card className="p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          <Figure label="Sessions this week" value={scheduledCount} note="Not counting cancellations" />
          <Figure label="Therapists available" value={availableTherapists.length} note="Free to take a booking" />
          <Figure label="On leave" value={onLeave.length} note="Away this week" />
          <Figure label="Conflicts" value={conflicts} note="Cancelled or marked urgent" warn={conflicts > 0} />
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 text-sm text-brand-muted">
          <Filter size={14} /> Show only
        </span>
        <button
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
            categoryFilter === 'all' ? 'bg-brand-ink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
          }`}
        >
          All
        </button>
        {legend.map((l) => {
          const active = categoryFilter === l.category;
          return (
            <button
              key={l.category}
              onClick={() => toggleCategory(l.category)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                active ? 'text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
              }`}
              style={active ? { backgroundColor: l.color } : undefined}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: active ? 'white' : l.color }} />
              {l.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <MiniCalendar selectedDate={weekStart} onSelect={(d) => setWeekStart(mondayOf(d))} />
          </Card>
          <Card>
            <h3 className="mb-3 text-base font-semibold text-brand-ink">Legend</h3>
            <div className="space-y-1">
              {legend.map((l) => (
                <button
                  key={l.label}
                  onClick={() => toggleCategory(l.category)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-brand-ink transition-colors hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                    categoryFilter === l.category ? 'bg-brand-cream font-medium' : ''
                  }`}
                >
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.label}
                </button>
              ))}
            </div>
          </Card>
          {selectedAssignment ? (
            <SelectedDetail
              assignment={selectedAssignment}
              onClose={() => setSelectedId(null)}
              availableTherapists={availableTherapists}
              onReassign={(newClId) => reassignTherapist(selectedAssignment.id, newClId)}
              onReschedule={(date, start, end) => rescheduleAssignment(selectedAssignment.id, date, start, end)}
            />
          ) : (
            <Card className="text-sm text-brand-muted">Click any session on the calendar to see its details here.</Card>
          )}
        </div>

        <Card className="!p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setWeekStart(mondayOf(TODAY))}
                className="rounded-full bg-brand-pink-light px-4 py-2 text-sm font-medium text-brand-pink transition-colors hover:bg-brand-pink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
              >
                This week
              </button>
              <button
                onClick={() => setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7))}
                aria-label="Previous week"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-ink transition-colors hover:bg-brand-pink-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7))}
                aria-label="Next week"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-ink transition-colors hover:bg-brand-pink-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
              >
                <ChevronRight size={16} />
              </button>
              <span className="ml-2 text-lg font-semibold text-brand-ink">
                {days[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} to{' '}
                {days[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <span className="text-sm text-brand-muted">
              {categoryFilter === 'all' ? weekAssignments.length : visibleWeekAssignments.length} sessions this week
              {categoryFilter !== 'all' && ` · ${legend.find((l) => l.category === categoryFilter)?.label}`}
            </span>
          </div>

          {categoryFilter === 'unassigned' && (
            <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-800">
              <Filter size={14} className="shrink-0" /> Unassigned requests have no date or time yet, so they are not on the calendar. See
              &ldquo;Unassigned requests&rdquo; below.
            </div>
          )}

          <div className="scrollbar-thin overflow-x-auto px-3 pb-3">
            <div className="flex min-w-[900px] gap-1.5">
              <div className="w-14 shrink-0">
                <div className="h-16" />
                <div className="relative" style={{ height: GRID_HEIGHT }}>
                  {hours.map((h) => (
                    <span
                      key={h}
                      className="absolute right-2 -translate-y-1/2 text-xs text-brand-muted"
                      style={{ top: (h - DAY_START_MIN / 60) * HOUR_HEIGHT }}
                    >
                      {h % 12 === 0 ? 12 : h % 12}
                      {h >= 12 ? 'pm' : 'am'}
                    </span>
                  ))}
                </div>
              </div>

              {days.map((day) => {
                const dateStr = toDateStr(day);
                const isToday = dateStr === todayStr;
                const dayAssignments = visibleWeekAssignments.filter((a) => a.date === dateStr);
                return (
                  <div key={dateStr} className={`min-w-[120px] flex-1 overflow-hidden rounded-xl ${isToday ? 'bg-brand-pink-light/60' : 'bg-brand-cream'}`}>
                    <div className={`flex h-16 flex-col items-center justify-center ${isToday ? 'bg-brand-pink text-white' : ''}`}>
                      <span className={`text-xs ${isToday ? 'text-white/85' : 'text-brand-muted'}`}>{day.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                      <span className={`text-lg font-semibold ${isToday ? 'text-white' : 'text-brand-ink'}`}>{day.getDate()}</span>
                    </div>
                    <div className="relative" style={{ height: GRID_HEIGHT }}>
                      {hours.map((h) => (
                        <div
                          key={h}
                          className="absolute left-0 right-0 border-t border-white" // taste-skill-ignore: calendar hour grid
                          style={{ top: (h - DAY_START_MIN / 60) * HOUR_HEIGHT }}
                        />
                      ))}
                      {dayAssignments.map((a) => {
                        const therapist = clById(a.clId);
                        const client = clientById(a.clientId);
                        const pkg = packageById(a.packageId);
                        if (!therapist || !client || !pkg) return null;
                        const color = colorOf(categoryOf(a, isToday));
                        const top = ((toMinutes(a.startTime) - DAY_START_MIN) / 60) * HOUR_HEIGHT;
                        const height = Math.max(40, ((toMinutes(a.endTime) - toMinutes(a.startTime)) / 60) * HOUR_HEIGHT);
                        const selected = a.id === selectedId;
                        return (
                          <button
                            key={a.id}
                            onClick={() => setSelectedId(a.id)}
                            className={`absolute left-1 right-1 overflow-hidden rounded-lg bg-white px-2.5 py-2 text-left text-xs transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                              a.status === 'cancelled' ? 'opacity-70' : ''
                            }`}
                            style={{ top, height }}
                          >
                            <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
                            <span className="absolute inset-0" style={{ backgroundColor: color, opacity: selected ? 0.22 : 0.12 }} />
                            <span className="relative block">
                              <span className={`block truncate text-sm font-semibold text-brand-ink ${a.status === 'cancelled' ? 'line-through' : ''}`}>{client.name}</span>
                              <span className="block truncate text-brand-muted">
                                {formatTime12(a.startTime)} to {formatTime12(a.endTime)}
                              </span>
                              <span className="mt-1 flex items-center gap-1.5">
                                <Avatar name={therapist.name} color={therapist.avatarColor} size={16} />
                                <span className="truncate text-brand-ink">{therapist.name}</span>
                              </span>
                            </span>
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
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <SectionTitle>
            <span className="flex items-center gap-2">
              Unassigned requests
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-sm font-semibold text-orange-700">{unassigned.length}</span>
            </span>
          </SectionTitle>
          <p className="-mt-2 mb-4 text-sm text-brand-muted">Clients still waiting for a therapist.</p>
          <div className="space-y-3">
            {unassigned.map((clientId) => {
              const client = clientById(clientId);
              if (!client) return null;
              const pkg = packageById(client.packageIds[0]);
              return (
                <div key={clientId} className="rounded-xl bg-brand-cream p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-brand-ink">{client.name}</p>
                      <p className="text-sm text-brand-muted">
                        {pkg?.shortName} · {client.location}
                      </p>
                    </div>
                    <Badge status={client.status === 'upcoming' ? 'urgent' : 'upcoming'}>
                      {client.preferredDate <= toDateStr(TODAY) ? 'Urgent' : 'Upcoming'}
                    </Badge>
                  </div>

                  {pickerFor === clientId ? (
                    <div className="mt-3 space-y-1 rounded-xl bg-white p-2">
                      <p className="px-2 pb-1 text-sm text-brand-muted">Choose a therapist</p>
                      {availableTherapists.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => assignTherapist(clientId, t.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-brand-ink transition-colors hover:bg-brand-cream"
                        >
                          <Avatar name={t.name} color={t.avatarColor} size={22} />
                          {t.name}
                        </button>
                      ))}
                      {availableTherapists.length === 0 && <p className="px-2 text-sm text-brand-muted">No therapists available right now.</p>}
                      <button onClick={() => setPickerFor(null)} className="px-2 pt-1 text-sm text-brand-muted hover:text-brand-ink">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPickerFor(clientId)}
                      className="mt-3 rounded-full bg-brand-pink px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
                    >
                      Schedule
                    </button>
                  )}
                </div>
              );
            })}
            {unassigned.length === 0 && <p className="text-sm text-brand-muted">All caught up. No pending requests.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Available now</SectionTitle>
          <p className="-mt-2 mb-4 text-sm text-brand-muted">Therapists with no clashes this week.</p>
          <div className="space-y-2">
            {availableTherapists.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl bg-brand-cream p-3">
                <Avatar name={t.name} color={t.avatarColor} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-ink">{t.name}</p>
                  <p className="truncate text-sm text-brand-muted">{t.location}</p>
                </div>
                <Badge status="available">Available</Badge>
              </div>
            ))}
            {availableTherapists.length === 0 && <p className="text-sm text-brand-muted">No therapists available right now.</p>}
          </div>
        </Card>
      </div>

      <div className="h-6" />
    </PageShell>
  );
}

function Figure({ label, value, note, warn = false }: { label: string; value: number; note: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-sm text-brand-muted">{label}</p>
      <p className={`mt-2 text-4xl font-semibold tracking-tight ${warn ? 'text-brand-amber' : 'text-brand-ink'}`}>{value}</p>
      <p className="mt-1 text-sm text-brand-muted">{note}</p>
    </div>
  );
}

function SelectedDetail({
  assignment,
  onClose,
  availableTherapists,
  onReassign,
  onReschedule,
}: {
  assignment: Assignment;
  onClose: () => void;
  availableTherapists: Therapist[];
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

  const therapist = clById(assignment.clId);
  const client = clientById(assignment.clientId);
  const pkg = packageById(assignment.packageId);
  if (!therapist || !client || !pkg) return null;

  const fieldClass = 'w-full rounded-lg bg-white px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink';

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-brand-ink">{client.name}</p>
          <p className="text-sm text-brand-muted">{pkg.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={assignment.status}>
            <span className="capitalize">{assignment.status}</span>
          </Badge>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="flex h-7 w-7 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-brand-cream hover:text-brand-ink"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-brand-ink">
        <div className="flex items-center gap-2">
          <Avatar name={therapist.name} color={therapist.avatarColor} size={24} />
          {therapist.name}
        </div>
        <p>
          {new Date(`${assignment.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p>
          {formatTime12(assignment.startTime)} to {formatTime12(assignment.endTime)}
        </p>
        <p className="text-brand-muted">{assignment.location}</p>
      </div>

      {mode === 'view' && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setMode('reassign')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-cream py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light hover:text-brand-pink"
          >
            <Repeat size={13} /> Reassign
          </button>
          <button
            onClick={() => setMode('reschedule')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-cream py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light hover:text-brand-pink"
          >
            <CalendarCog size={13} /> Reschedule
          </button>
        </div>
      )}

      {mode === 'reassign' && (
        <div className="mt-4 space-y-1 rounded-xl bg-brand-cream p-2">
          <p className="px-2 pb-1 text-sm text-brand-muted">Choose another therapist</p>
          {availableTherapists
            .filter((c) => c.id !== therapist.id)
            .map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onReassign(c.id);
                  setMode('view');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-brand-ink transition-colors hover:bg-white"
              >
                <Avatar name={c.name} color={c.avatarColor} size={22} />
                {c.name}
              </button>
            ))}
          <button onClick={() => setMode('view')} className="px-2 pt-1 text-sm text-brand-muted hover:text-brand-ink">
            Cancel
          </button>
        </div>
      )}

      {mode === 'reschedule' && (
        <div className="mt-4 space-y-2 rounded-xl bg-brand-cream p-3">
          <label className="block text-sm text-brand-muted">
            Date
            <input type="date" value={dateDraft} onChange={(e) => setDateDraft(e.target.value)} className={`mt-1 ${fieldClass}`} />
          </label>
          <div className="flex gap-2">
            <label className="block flex-1 text-sm text-brand-muted">
              Start
              <input type="time" value={startDraft} onChange={(e) => setStartDraft(e.target.value)} className={`mt-1 ${fieldClass}`} />
            </label>
            <label className="block flex-1 text-sm text-brand-muted">
              End
              <input type="time" value={endDraft} onChange={(e) => setEndDraft(e.target.value)} className={`mt-1 ${fieldClass}`} />
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                onReschedule(dateDraft, startDraft, endDraft);
                setMode('view');
              }}
              className="rounded-full bg-brand-pink px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark"
            >
              Save
            </button>
            <button onClick={() => setMode('view')} className="rounded-full px-4 py-1.5 text-sm text-brand-muted transition-colors hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
