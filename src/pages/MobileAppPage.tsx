import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  MapPin,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Wifi,
  Battery,
  Bell,
  Home,
  CalendarClock,
  ClipboardList,
  User,
  Star,
} from 'lucide-react';
import { IconRail } from '../components/IconRail';
import { Logo } from '../components/Logo';
import { assignments } from '../data/assignments';
import { clientById } from '../data/clients';
import { useSettings } from '../store/SettingsContext';
import { useCLStore } from '../store/CLStore';
import { formatTime12, formatDateLabel } from '../lib/date';

const FEATURED_CL_ID = 'cl-01'; // Sarah Yusof

type DemoTab = 'today' | 'schedule' | 'reports' | 'profile';

const tabs: { id: DemoTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'reports', label: 'Reports', icon: ClipboardList },
  { id: 'profile', label: 'Profile', icon: User },
];

const careChecklist = [
  { label: 'Postnatal massage', done: true },
  { label: 'Baby bath, hot compress & massage', done: true },
  { label: 'Herbal bath', done: false },
  { label: 'Apply param, pilis & tapel', done: false },
];

const features = [
  'GPS + selfie attendance',
  'Schedule & assignments',
  'Care reporting',
  'Leave & performance',
];

export default function MobileAppPage() {
  const [tab, setTab] = useState<DemoTab>('today');
  const { clById } = useCLStore();
  const cl = clById(FEATURED_CL_ID);

  const nextAssignment = assignments.find((a) => a.clId === FEATURED_CL_ID && a.date === '2026-08-13');
  const upcoming = assignments.filter((a) => a.clId === FEATURED_CL_ID).slice(0, 5);

  if (!cl) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-cream">
      <IconRail />
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="flex items-start justify-between px-8 pt-8">
          <div>
            <h1 className="text-2xl font-semibold text-brand-ink">CL mobile application</h1>
            <p className="mt-1 text-sm text-brand-muted">
              The Confinement Lady experience for daily assignments, attendance, and care reporting.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-brand-ink hover:bg-brand-cream"
          >
            Admin dashboard <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 px-8 py-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-brand-pink-light px-3 py-1 text-xs font-semibold text-brand-maroon">
              iOS & Android
            </span>
            <h2 className="mt-4 text-4xl font-semibold text-brand-ink">Good morning, {cl.name.split(' ')[0]}</h2>
            <p className="mt-3 max-w-sm text-brand-muted">Use the tabs inside the phone to explore the working application.</p>

            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-3 text-sm text-brand-ink shadow-sm">
                  <CheckCircle2 size={16} className="shrink-0 text-brand-green" />
                  {f}
                </div>
              ))}
            </div>

            <p className="mb-2 mt-10 text-xs font-semibold tracking-wide text-brand-muted">DEMO FLOW</p>
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    tab === t.id ? 'bg-brand-maroon text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
                  }`}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <PhoneFrame>
              {tab === 'today' && <TodayScreen cl={cl} nextAssignment={nextAssignment} />}
              {tab === 'schedule' && <ScheduleScreen assignmentsForCL={upcoming} />}
              {tab === 'reports' && <ReportsScreen cl={cl} />}
              {tab === 'profile' && <ProfileScreen cl={cl} />}

              <div className="mt-auto flex items-center justify-around border-t border-black/5 bg-white px-2 py-3">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex flex-col items-center gap-1 text-[10px] ${tab === t.id ? 'text-brand-maroon' : 'text-brand-muted'}`}
                  >
                    <t.icon size={18} />
                    {t.label}
                  </button>
                ))}
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-[720px] w-[360px] flex-col overflow-hidden rounded-[2.5rem] border-[6px] border-black bg-white shadow-xl">
      <div className="absolute left-1/2 top-2 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center justify-between px-6 pb-1 pt-3 text-xs font-medium text-brand-ink">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Wifi size={12} />
          <Battery size={14} />
        </div>
      </div>
      <div className="scrollbar-thin flex flex-1 flex-col overflow-y-auto px-5 pb-2 pt-2">{children}</div>
    </div>
  );
}

function TodayScreen({ cl, nextAssignment }: { cl: import('../types').ConfinementLady; nextAssignment?: (typeof assignments)[number] }) {
  const { packageById } = useSettings();
  const client = nextAssignment ? clientById(nextAssignment.clientId) : undefined;
  const pkg = nextAssignment ? packageById(nextAssignment.packageId) : undefined;
  const doneCount = careChecklist.filter((c) => c.done).length;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <Logo variant="icon" size={30} />
        <span className="flex items-center gap-1 rounded-full bg-brand-green-light px-2 py-1 text-[10px] font-medium text-brand-green">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" /> Data synced
        </span>
        <Bell size={16} className="text-brand-ink" />
      </div>

      <p className="mt-4 text-xs text-brand-muted">Selasa, 4 Ogos</p>
      <h3 className="text-xl font-semibold text-brand-ink">Good morning, {cl.name.split(' ')[0]}</h3>

      {client && pkg && nextAssignment && (
        <div className="mt-4 rounded-2xl bg-brand-maroon p-4 text-white">
          <p className="text-[10px] font-semibold tracking-wide text-white/70">NEXT ASSIGNMENT</p>
          <p className="mt-1 text-lg font-semibold">{client.name}</p>
          <p className="text-xs text-white/80">
            {pkg.shortName} · {nextAssignment.startTime && formatTime12(nextAssignment.startTime)}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-white/80">
            <span>
              {formatTime12(nextAssignment.startTime)}–{formatTime12(nextAssignment.endTime)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
            <MapPin size={12} /> {nextAssignment.location}
          </div>
          <span className="mt-3 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium">Starts in 45 minutes</span>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-black/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-ink">
          <MapPin size={16} className="text-brand-maroon" />
          Ready to clock in
        </div>
        <p className="text-xs text-brand-muted">GPS location verified</p>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-cream px-3 py-2 text-xs text-brand-ink">
          <span className="flex items-center gap-1.5">
            <Camera size={14} /> Selfie required
          </span>
          <ShieldCheck size={14} className="text-brand-green" />
        </div>
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand-green py-2.5 text-sm font-medium text-white">
          <Camera size={15} /> Clock in
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-brand-ink">Care today</p>
          <span className="text-xs text-brand-muted">
            {doneCount} of {careChecklist.length} completed
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {careChecklist.map((c) => (
            <div key={c.label} className="rounded-xl border border-black/5 p-2.5 text-xs text-brand-ink">
              {c.done ? <CheckCircle2 size={14} className="text-brand-green" /> : <Circle size={14} className="text-brand-muted" />}
              <p className="mt-1 leading-snug">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleScreen({ assignmentsForCL }: { assignmentsForCL: typeof assignments }) {
  const { packageById } = useSettings();
  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My schedule</h3>
      <p className="text-xs text-brand-muted">Upcoming assignments</p>
      <div className="mt-4 space-y-2">
        {assignmentsForCL.map((a) => {
          const client = clientById(a.clientId);
          const pkg = packageById(a.packageId);
          return (
            <div key={a.id} className="rounded-xl border border-black/5 p-3">
              <p className="text-sm font-medium text-brand-ink">{client?.name}</p>
              <p className="text-xs text-brand-muted">
                {pkg?.shortName} · {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReportsScreen({ cl }: { cl: import('../types').ConfinementLady }) {
  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My performance</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-brand-cream p-3">
          <p className="text-xl font-semibold text-brand-ink">{cl.completedAssignments}</p>
          <p className="text-xs text-brand-muted">Completed</p>
        </div>
        <div className="rounded-xl bg-brand-cream p-3">
          <p className="flex items-center gap-1 text-xl font-semibold text-brand-ink">
            <Star size={16} className="fill-brand-amber text-brand-amber" /> {cl.rating}
          </p>
          <p className="text-xs text-brand-muted">{cl.reviewCount} reviews</p>
        </div>
        <div className="rounded-xl bg-brand-cream p-3">
          <p className="text-xl font-semibold text-brand-ink">{cl.yearsExperience}</p>
          <p className="text-xs text-brand-muted">Years experience</p>
        </div>
        <div className="rounded-xl bg-brand-cream p-3">
          <p className="text-xl font-semibold text-brand-ink capitalize">{cl.status.replace('-', ' ')}</p>
          <p className="text-xs text-brand-muted">Current status</p>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ cl }: { cl: import('../types').ConfinementLady }) {
  return (
    <div className="flex-1 text-center">
      <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-brand-maroon text-lg font-semibold text-white">
        {cl.name
          .split(' ')
          .map((p) => p[0])
          .slice(0, 2)
          .join('')}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-brand-ink">{cl.name}</h3>
      <p className="text-xs text-brand-muted">{cl.location}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {cl.specialties.map((s) => (
          <span key={s} className="rounded-full bg-brand-pink-light px-2.5 py-1 text-[10px] text-brand-maroon">
            {s}
          </span>
        ))}
      </div>
      <p className="mt-4 text-left text-xs text-brand-muted">{cl.bio}</p>
    </div>
  );
}
