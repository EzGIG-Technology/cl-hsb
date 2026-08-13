import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  MapPin,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Wifi,
  Battery,
  Bell,
  Home,
  Briefcase,
  MessageCircle,
  Wallet,
  User,
  Star,
  FileSignature,
  PartyPopper,
  Phone,
  CreditCard,
  Repeat,
  Sparkles,
  BookOpen,
  Send,
  LogOut,
  IdCard,
  ArrowLeft,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Logo } from '../components/Logo';
import { Avatar } from '../components/ui';
import { assignments } from '../data/assignments';
import { clientById } from '../data/clients';
import { useSettings } from '../store/SettingsContext';
import { useCLStore } from '../store/CLStore';
import { formatTime12, formatDateLabel } from '../lib/date';
import type { Assignment, ConfinementLady, Package } from '../types';

const FEATURED_MOTHER_ID = 'cli-01'; // Sofea Rahman — matches seeded assignments
const PERSONA_IDS = ['cl-01', 'cl-04', 'cl-05', 'cl-06'];

type AppMode = 'cl' | 'mother-review' | 'mother-app';
type CLTab = 'home' | 'jobs' | 'messages' | 'earnings' | 'profile';
type MotherTab = 'home' | 'bookings' | 'reviews' | 'profile';

const clTabs: { id: CLTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

const motherTabs: { id: MotherTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'profile', label: 'Profile', icon: User },
];

const features = ['GPS + selfie attendance', 'Package checklist with photo proof', 'Care reporting', 'Leave & performance'];

function clShortId(clId: string) {
  const n = parseInt(clId.replace('cl-', ''), 10);
  return `CL-${String(n + 18).padStart(3, '0')}`;
}

export default function MobileAppPage() {
  const [appMode, setAppMode] = useState<AppMode>('cl');
  const [motherTab, setMotherTab] = useState<MotherTab>('home');
  const { clById } = useCLStore();
  const { packageById } = useSettings();
  const mother = clientById(FEATURED_MOTHER_ID);

  const reviewedAssignment = assignments.find((a) => a.id === 'asg-06'); // Sofea Rahman's most recent completed Melur session
  const [reviewCl] = useState(() => clById('cl-01'));

  if (!mother || !reviewCl) return null;
  const motherPkg = packageById(mother.packageIds[0]);

  const headings: Record<AppMode, { title: string; subtitle: string }> = {
    cl: {
      title: 'CL mobile application',
      subtitle: 'The Confinement Lady experience — jobs, earnings, and package checklists.',
    },
    'mother-review': {
      title: "Mother's review form — Phase 1",
      subtitle: 'A simple, focused link sent to mothers after each session. This is the only mother-facing piece built for launch.',
    },
    'mother-app': {
      title: "Mother's app — Phase 2 preview",
      subtitle: 'Not part of the current build. Shown here so the team can plan ahead — bookings, add-ons, reviews, payments.',
    },
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-brand-cream">
      <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-brand-pink to-brand-green" />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="flex items-start justify-between px-8 pt-8">
            <div>
              <h1 className="text-2xl font-semibold text-brand-ink">{headings[appMode].title}</h1>
              <p className="mt-1 max-w-xl text-sm text-brand-muted">{headings[appMode].subtitle}</p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-brand-ink hover:bg-brand-cream"
            >
              Admin dashboard <ChevronRight size={14} />
            </Link>
          </div>

          <div className="px-8 pt-6">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'cl', label: 'Confinement Lady App' },
                  { id: 'mother-review', label: "Mother's Review Form" },
                  { id: 'mother-app', label: "Mother's App (Phase 2)" },
                ] as { id: AppMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAppMode(m.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    appMode === m.id ? 'bg-brand-green text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 px-8 py-8 lg:grid-cols-2">
            <div>
              {appMode === 'cl' && (
                <>
                  <span className="inline-block rounded-full bg-brand-pink-light px-3 py-1 text-xs font-semibold text-brand-pink">
                    iOS & Android
                  </span>
                  <h2 className="mt-4 text-4xl font-semibold text-brand-ink">Built for caregivers on the move</h2>
                  <p className="mt-3 max-w-sm text-brand-muted">
                    Tap "Open Job" on the Home or Jobs tab to see the full checklist + photo-proof flow. Switch personas
                    under Profile → Demo Controls.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
                    {features.map((f) => (
                      <div key={f} className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-3 text-sm text-brand-ink shadow-sm">
                        <CheckCircle2 size={16} className="shrink-0 text-brand-green" />
                        {f}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {appMode === 'mother-review' && (
                <>
                  <span className="inline-block rounded-full bg-brand-green-light px-3 py-1 text-xs font-semibold text-brand-green">
                    Phase 1 — built now
                  </span>
                  <h2 className="mt-4 text-3xl font-semibold text-brand-ink">Session review, not an app</h2>
                  <p className="mt-3 max-w-sm text-brand-muted">
                    Sent as a link (SMS/WhatsApp) after each completed session — no login required. Ratings and notes go to
                    admin only; they're never shown to the CL, matching what we agreed on the call.
                  </p>
                  <div className="mt-6 space-y-2 max-w-sm">
                    {['4 quick star ratings', 'Optional free-text feedback', 'Tap-to-sign confirmation', 'One tap to call HQ if urgent'].map((f) => (
                      <div key={f} className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2.5 text-sm text-brand-ink shadow-sm">
                        <CheckCircle2 size={16} className="shrink-0 text-brand-green" />
                        {f}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {appMode === 'mother-app' && (
                <>
                  <span className="inline-block rounded-full bg-brand-amber-light px-3 py-1 text-xs font-semibold text-brand-amber">
                    Phase 2 — planning preview
                  </span>
                  <h2 className="mt-4 text-3xl font-semibold text-brand-ink">Full mother companion app</h2>
                  <p className="mt-3 max-w-sm text-brand-muted">
                    Only the review form (left) is scoped for launch. This tab is a preview of where the mother experience
                    could go next — profile, bookings, add-ons, payments, and reschedule requests.
                  </p>
                  <p className="mb-2 mt-8 text-xs font-semibold tracking-wide text-brand-muted">PREVIEW TABS</p>
                  <div className="flex flex-wrap gap-2">
                    {motherTabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setMotherTab(t.id)}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          motherTab === t.id ? 'bg-brand-amber text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
                        }`}
                      >
                        <t.icon size={15} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center">
              {appMode === 'cl' && <CLAppSection />}

              {appMode === 'mother-review' && (
                <PhoneFrame noPadding>
                  <MotherReviewScreen cl={reviewCl} mother={mother} assignment={reviewedAssignment} pkg={motherPkg} />
                </PhoneFrame>
              )}

              {appMode === 'mother-app' && (
                <PhoneFrame>
                  <div className="mb-2 flex justify-center">
                    <span className="rounded-full bg-brand-amber-light px-2.5 py-0.5 text-[10px] font-semibold text-brand-amber">
                      PHASE 2 PREVIEW
                    </span>
                  </div>
                  {motherTab === 'home' && <MotherHomeScreen mother={mother} pkg={motherPkg} cl={reviewCl} />}
                  {motherTab === 'bookings' && <MotherBookingsScreen mother={mother} />}
                  {motherTab === 'reviews' && <MotherReviewsScreen cl={reviewCl} />}
                  {motherTab === 'profile' && <MotherProfileScreen mother={mother} />}
                  <div className="mt-auto flex items-center justify-around border-t border-black/5 bg-white px-2 py-3">
                    {motherTabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setMotherTab(t.id)}
                        className={`flex flex-col items-center gap-1 text-[10px] ${motherTab === t.id ? 'text-brand-amber' : 'text-brand-muted'}`}
                      >
                        <t.icon size={18} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </PhoneFrame>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children, noPadding = false }: { children: ReactNode; noPadding?: boolean }) {
  return (
    <div className="relative flex h-[720px] w-[360px] flex-col overflow-hidden rounded-[2.5rem] border-[6px] border-black bg-white shadow-xl">
      <div className="absolute left-1/2 top-2 h-6 w-28 -translate-x-1/2 rounded-full bg-black z-10" />
      {!noPadding && (
        <div className="flex items-center justify-between px-6 pb-1 pt-3 text-xs font-medium text-brand-ink">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <Wifi size={12} />
            <Battery size={14} />
          </div>
        </div>
      )}
      <div className={`scrollbar-thin flex flex-1 flex-col overflow-y-auto ${noPadding ? '' : 'px-5 pb-2 pt-2'}`}>{children}</div>
    </div>
  );
}

// ---------- Confinement Lady app ----------

function CLAppSection() {
  const { clById } = useCLStore();
  const [personaId, setPersonaId] = useState('cl-01');
  const [tab, setTab] = useState<CLTab>('home');
  const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null);

  const cl = clById(personaId);
  const myAssignments = assignments.filter((a) => a.clId === personaId);
  const openAssignment = openAssignmentId ? myAssignments.find((a) => a.id === openAssignmentId) : null;

  if (!cl) return null;

  return (
    <PhoneFrame>
      {openAssignment ? (
        <SessionFlow assignment={openAssignment} onClose={() => setOpenAssignmentId(null)} />
      ) : (
        <>
          {tab === 'home' && <CLHomeScreen cl={cl} assignments={myAssignments} onOpenJob={setOpenAssignmentId} onGoTo={setTab} />}
          {tab === 'jobs' && <CLJobsScreen cl={cl} assignments={myAssignments} onOpenJob={setOpenAssignmentId} />}
          {tab === 'messages' && <CLMessagesScreen />}
          {tab === 'earnings' && <CLEarningsScreen cl={cl} assignments={myAssignments} />}
          {tab === 'profile' && <CLProfileScreen cl={cl} personaId={personaId} onPersonaChange={setPersonaId} />}
          <div className="mt-auto flex items-center justify-around border-t border-black/5 bg-white px-2 py-3">
            {clTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-1 text-[10px] ${tab === t.id ? 'text-brand-pink' : 'text-brand-muted'}`}
              >
                <t.icon size={18} />
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </PhoneFrame>
  );
}

function dayOfTotal(assignment: Assignment, pkg?: Package) {
  const total = pkg?.tiers[0]?.days ?? 1;
  const hash = assignment.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return { day: (hash % total) + 1, total };
}

function CLHomeScreen({
  cl,
  assignments: myAssignments,
  onOpenJob,
  onGoTo,
}: {
  cl: ConfinementLady;
  assignments: Assignment[];
  onOpenJob: (id: string) => void;
  onGoTo: (tab: CLTab) => void;
}) {
  const { packageById } = useSettings();
  const todaysJob = myAssignments.find((a) => a.date === '2026-08-13' && (a.status === 'confirmed' || a.status === 'pending'));
  const client = todaysJob ? clientById(todaysJob.clientId) : undefined;
  const pkg = todaysJob ? packageById(todaysJob.packageId) : undefined;
  const dayInfo = todaysJob && pkg ? dayOfTotal(todaysJob, pkg) : null;

  const monthAssignments = myAssignments.filter((a) => a.date.startsWith('2026-08'));
  const completedThisMonth = monthAssignments.filter((a) => a.status === 'completed');
  const hoursThisMonth = completedThisMonth.reduce((sum, a) => {
    const [sh, sm] = a.startTime.split(':').map(Number);
    const [eh, em] = a.endTime.split(':').map(Number);
    return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
  }, 0);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <Logo variant="icon" size={30} />
        <span className="flex items-center gap-1 rounded-full bg-brand-green-light px-2 py-1 text-[10px] font-medium text-brand-green">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" /> Data synced
        </span>
        <Bell size={16} className="text-brand-ink" />
      </div>

      <p className="mt-4 text-xs text-brand-muted">Thursday, 13 Aug</p>
      <h3 className="text-xl font-semibold text-brand-ink">Hi, {cl.name.split(' ')[0]} 👋</h3>
      <p className="text-xs text-brand-muted">
        {clShortId(cl.id)} · {cl.location.split(',')[0]}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-brand-cream p-3">
          <p className="text-lg font-semibold text-brand-ink">{monthAssignments.length}</p>
          <p className="text-[10px] text-brand-muted">Sessions this month</p>
        </div>
        <div className="rounded-xl bg-brand-cream p-3">
          <p className="text-lg font-semibold text-brand-ink">{Math.round(hoursThisMonth)}</p>
          <p className="text-[10px] text-brand-muted">Hours this month</p>
        </div>
        <div className="rounded-xl bg-brand-cream p-3">
          <p className="text-lg font-semibold text-brand-ink">RM {Math.round(hoursThisMonth * 22).toLocaleString()}</p>
          <p className="text-[10px] text-brand-muted">Est. pay this month</p>
        </div>
        <div className="rounded-xl bg-brand-cream p-3">
          <p className="text-lg font-semibold text-brand-ink">{cl.completedAssignments}</p>
          <p className="text-[10px] text-brand-muted">Total sessions</p>
        </div>
      </div>

      {todaysJob && client && pkg ? (
        <div className="mt-4 rounded-2xl bg-brand-pink p-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-wide text-white/70">TODAY'S JOB</p>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">Assigned</span>
          </div>
          <p className="mt-1 text-lg font-semibold">{client.name}</p>
          <p className="text-xs text-white/80">
            {client.location} · {pkg.shortName}
            {dayInfo ? ` - Day ${dayInfo.day} of ${dayInfo.total}` : ''}
          </p>
          <p className="mt-1 text-xs text-white/80">{formatTime12(todaysJob.startTime)}</p>
          <button
            onClick={() => onOpenJob(todaysJob.id)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-white py-2 text-sm font-semibold text-brand-pink"
          >
            Open Job <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-black/5 p-4 text-center text-sm text-brand-muted">No job scheduled right now.</div>
      )}

      <p className="mb-2 mt-5 text-[11px] font-semibold tracking-wide text-brand-muted">QUICK ACTIONS</p>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onGoTo('messages')} className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-3 text-[11px] font-medium text-brand-ink shadow-sm">
          <MessageCircle size={16} className="text-brand-pink" /> Message HQ
        </button>
        <a href="tel:0102497650" className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-3 text-[11px] font-medium text-brand-ink shadow-sm">
          <Phone size={16} className="text-brand-pink" /> Call HQ
        </a>
        <button onClick={() => onGoTo('earnings')} className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-3 text-[11px] font-medium text-brand-ink shadow-sm">
          <Wallet size={16} className="text-brand-pink" /> Earnings
        </button>
      </div>
    </div>
  );
}

function CLJobsScreen({
  cl,
  assignments: myAssignments,
  onOpenJob,
}: {
  cl: ConfinementLady;
  assignments: Assignment[];
  onOpenJob: (id: string) => void;
}) {
  const { packageById } = useSettings();
  const [jobTab, setJobTab] = useState<'active' | 'upcoming' | 'past'>('active');

  const active = myAssignments.filter((a) => a.date === '2026-08-13' && a.status !== 'cancelled');
  const upcoming = myAssignments.filter((a) => a.date > '2026-08-13' && a.status !== 'cancelled');
  const past = myAssignments.filter((a) => a.status === 'completed');
  const rows = jobTab === 'active' ? active : jobTab === 'upcoming' ? upcoming : past;

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My jobs</h3>
      <p className="text-xs text-brand-muted">{cl.name}</p>
      <div className="mt-3 flex gap-1.5 rounded-full bg-brand-cream p-1">
        {(['active', 'upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setJobTab(t)}
            className={`flex-1 rounded-full py-1.5 text-xs font-medium capitalize ${jobTab === t ? 'bg-white text-brand-pink shadow-sm' : 'text-brand-muted'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((a) => {
          const client = clientById(a.clientId);
          const pkg = packageById(a.packageId);
          const dayInfo = pkg ? dayOfTotal(a, pkg) : null;
          return (
            <div key={a.id} className="rounded-xl border border-black/5 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-brand-ink">{client?.name}</p>
                  <p className="text-xs text-brand-muted">
                    {pkg?.shortName}
                    {dayInfo ? ` - Day ${dayInfo.day} of ${dayInfo.total}` : ''}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-muted">
                    <MapPin size={10} /> {client?.location}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-pink-light px-2 py-0.5 text-[10px] font-medium text-brand-pink">
                  {jobTab === 'active' ? `Today, ${formatTime12(a.startTime)}` : jobTab === 'upcoming' ? formatDateLabel(a.date) : 'Completed'}
                </span>
              </div>
              {jobTab === 'active' && (
                <button
                  onClick={() => onOpenJob(a.id)}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-pink"
                >
                  Open Job <ChevronRight size={12} />
                </button>
              )}
            </div>
          );
        })}
        {rows.length === 0 && <p className="py-4 text-center text-sm text-brand-muted">Nothing here.</p>}
      </div>
    </div>
  );
}

function CLMessagesScreen() {
  const [messages, setMessages] = useState([
    { id: 'm1', from: 'hq', text: 'Morning! Booking confirmed for today, 9am at Setia Alam.', time: '08:15' },
    { id: 'm2', from: 'me', text: 'Noted, on my way now.', time: '08:42' },
  ]);
  const [draft, setDraft] = useState('');

  function send() {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { id: `m-${Date.now()}`, from: 'me', text: draft, time: 'Now' }]);
    setDraft('');
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-black/5 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-xs font-semibold text-white">SL</div>
        <div>
          <p className="text-sm font-semibold text-brand-ink">Sarah Lim</p>
          <p className="text-[10px] text-brand-muted">NR HQ</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto py-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${m.from === 'me' ? 'bg-brand-pink text-white' : 'bg-brand-cream text-brand-ink'}`}>
              <p>{m.text}</p>
              <p className={`mt-0.5 text-[9px] ${m.from === 'me' ? 'text-white/60' : 'text-brand-muted'}`}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-black/5 pt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message NR HQ…"
          className="flex-1 rounded-full border border-black/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
        <button onClick={send} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white">
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

const PAST_PAYSLIPS = [
  { month: 'Jul 2026', sessions: 13, hours: 84, pay: 3400 },
  { month: 'Jun 2026', sessions: 15, hours: 92, pay: 3800 },
  { month: 'May 2026', sessions: 11, hours: 68, pay: 3000 },
];

function CLEarningsScreen({ cl, assignments: myAssignments }: { cl: ConfinementLady; assignments: Assignment[] }) {
  const [month, setMonth] = useState('Aug 2026 (Current)');
  const monthAssignments = myAssignments.filter((a) => a.date.startsWith('2026-08') && a.status === 'completed');
  const hours = monthAssignments.reduce((sum, a) => {
    const [sh, sm] = a.startTime.split(':').map(Number);
    const [eh, em] = a.endTime.split(':').map(Number);
    return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
  }, 0);

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My earnings</h3>
      <p className="text-xs text-brand-muted">{cl.name}</p>

      <div className="relative mt-3">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full appearance-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-brand-ink"
        >
          <option>Aug 2026 (Current)</option>
          {PAST_PAYSLIPS.map((p) => (
            <option key={p.month}>{p.month}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted" />
      </div>

      {month === 'Aug 2026 (Current)' ? (
        <div className="mt-3 rounded-xl bg-brand-cream p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-lg font-semibold text-brand-ink">{monthAssignments.length}</p>
              <p className="text-[10px] text-brand-muted">Sessions</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-brand-ink">{Math.round(hours)}</p>
              <p className="text-[10px] text-brand-muted">Hours</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-brand-ink">RM {Math.round(hours * 22).toLocaleString()}</p>
              <p className="text-[10px] text-brand-muted">Approved pay</p>
            </div>
            <div>
              <span className="rounded-full bg-brand-amber-light px-2 py-0.5 text-[10px] font-semibold text-brand-amber">Runs at month-end</span>
            </div>
          </div>
        </div>
      ) : (
        (() => {
          const p = PAST_PAYSLIPS.find((x) => x.month === month)!;
          return (
            <div className="mt-3 rounded-xl bg-brand-cream p-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-lg font-semibold text-brand-ink">{p.sessions}</p>
                  <p className="text-[10px] text-brand-muted">Sessions</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-brand-ink">{p.hours}</p>
                  <p className="text-[10px] text-brand-muted">Hours</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-brand-ink">RM {p.pay.toLocaleString()}</p>
                  <p className="text-[10px] text-brand-muted">Paid</p>
                </div>
              </div>
            </div>
          );
        })()
      )}

      <p className="mb-2 mt-5 text-[11px] font-semibold tracking-wide text-brand-muted">PAST PAYSLIPS</p>
      <div className="space-y-2">
        {PAST_PAYSLIPS.map((p) => (
          <div key={p.month} className="flex items-center justify-between rounded-xl border border-black/5 p-3 text-sm">
            <div>
              <p className="font-medium text-brand-ink">{p.month}</p>
              <p className="text-[11px] text-brand-muted">
                {p.sessions} sessions · {p.hours}h
              </p>
            </div>
            <p className="font-semibold text-brand-ink">RM {p.pay.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CLProfileScreen({
  cl,
  personaId,
  onPersonaChange,
}: {
  cl: ConfinementLady;
  personaId: string;
  onPersonaChange: (id: string) => void;
}) {
  const { clById } = useCLStore();
  const [open, setOpen] = useState<'particulars' | 'support' | null>('particulars');

  return (
    <div className="flex-1">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink text-lg font-semibold text-white">
          {cl.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-brand-ink">{cl.name}</h3>
        <p className="text-xs text-brand-muted">
          {clShortId(cl.id)} · {cl.phone}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
            {cl.completedAssignments >= 150 ? 'Gold' : cl.completedAssignments >= 50 ? 'Silver' : 'Bronze'} Tier
          </span>
          <span className="flex items-center gap-0.5 text-xs text-brand-ink">
            <Star size={12} className="fill-brand-amber text-brand-amber" /> {cl.rating}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <button
          onClick={() => setOpen(open === 'particulars' ? null : 'particulars')}
          className="flex w-full items-center justify-between rounded-xl border border-black/5 p-3 text-sm font-medium text-brand-ink"
        >
          <span className="flex items-center gap-2">
            <IdCard size={14} /> My Particulars
          </span>
          <ChevronDown size={14} className={`transition-transform ${open === 'particulars' ? 'rotate-180' : ''}`} />
        </button>
        {open === 'particulars' && (
          <div className="space-y-1.5 rounded-xl bg-brand-cream p-3 text-xs text-brand-ink">
            <p>IC: {cl.icNumber}</p>
            <p>Address: {cl.address}</p>
            <p>Languages: {cl.languages.join(', ')}</p>
            <p>Experience: {cl.yearsExperience} years</p>
          </div>
        )}

        <button
          onClick={() => setOpen(open === 'support' ? null : 'support')}
          className="flex w-full items-center justify-between rounded-xl border border-black/5 p-3 text-sm font-medium text-brand-ink"
        >
          <span className="flex items-center gap-2">
            <MessageCircle size={14} /> Support
          </span>
          <ChevronDown size={14} className={`transition-transform ${open === 'support' ? 'rotate-180' : ''}`} />
        </button>
        {open === 'support' && (
          <div className="rounded-xl bg-brand-cream p-3 text-xs">
            <a href="tel:0102497650" className="flex items-center gap-2 text-brand-ink">
              <Phone size={13} /> Call NR HQ — 010-249 7650
            </a>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-black/15 p-3">
        <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-brand-muted">DEMO CONTROLS</p>
        <select
          value={personaId}
          onChange={(e) => onPersonaChange(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs text-brand-ink"
        >
          {PERSONA_IDS.map((id) => {
            const persona = clById(id);
            return persona ? (
              <option key={id} value={id}>
                Preview as {persona.name}
              </option>
            ) : null;
          })}
        </select>
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-red-200 py-2.5 text-sm font-medium text-red-600">
        <LogOut size={14} /> Log Out
      </button>
    </div>
  );
}

// ---------- Session flow (checklist + photo proof) ----------

type SessionStep = 'checkin' | 'checklist' | 'final-photo' | 'completed';

function SessionFlow({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const { packageById } = useSettings();
  const client = clientById(assignment.clientId);
  const pkg = packageById(assignment.packageId);
  const checklistLabels = pkg ? [...pkg.dailyMotherCare, ...pkg.babyCare] : [];

  const [step, setStep] = useState<SessionStep>('checkin');
  const [items, setItems] = useState<{ label: string; photoTaken: boolean; done: boolean }[]>(
    checklistLabels.map((label) => ({ label, photoTaken: false, done: false })),
  );
  const [formPhotoTaken, setFormPhotoTaken] = useState(false);

  const doneCount = items.filter((i) => i.done).length;
  const allDone = items.length > 0 && doneCount === items.length;

  function takePhoto(index: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, photoTaken: true } : it)));
  }
  function markDone(index: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, done: true } : it)));
  }

  if (step === 'checkin') {
    return (
      <div className="flex flex-1 flex-col">
        <StepHeader step={1} totalSteps={4} label="Check in" onBack={onClose} />
        <div className="mt-3 rounded-xl border border-black/5 p-3">
          <p className="text-sm font-semibold text-brand-ink">{client?.name}</p>
          <p className="text-xs text-brand-muted">{pkg?.name}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-brand-muted">
            <MapPin size={11} /> {assignment.location}
          </p>
        </div>
        <div className="mt-4 rounded-2xl border border-black/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-ink">
            <MapPin size={16} className="text-brand-pink" /> Ready to clock in
          </div>
          <p className="text-xs text-brand-muted">GPS location verified</p>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-cream px-3 py-2 text-xs text-brand-ink">
            <span className="flex items-center gap-1.5">
              <Camera size={14} /> Selfie required
            </span>
            <ShieldCheck size={14} className="text-brand-green" />
          </div>
          <button
            onClick={() => setStep('checklist')}
            disabled={checklistLabels.length === 0}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand-green py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Camera size={15} /> Check in & start session
          </button>
        </div>
      </div>
    );
  }

  if (step === 'checklist') {
    return (
      <div className="flex flex-1 flex-col">
        <StepHeader step={2} totalSteps={4} label="Package checklist" onBack={() => setStep('checkin')} />
        <p className="mt-2 text-xs text-brand-muted">
          {pkg?.name ?? 'Package'} · {doneCount} of {items.length} tasks done
        </p>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-cream">
          <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }} />
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
          {items.map((item, i) => (
            <div key={item.label} className={`rounded-xl border p-3 ${item.done ? 'border-brand-green/30 bg-brand-green-light' : 'border-black/5'}`}>
              <div className="flex items-center gap-2">
                {item.done ? <CheckCircle2 size={16} className="shrink-0 text-brand-green" /> : <Circle size={16} className="shrink-0 text-brand-muted" />}
                <p className="text-sm text-brand-ink">{item.label}</p>
              </div>
              {!item.done && (
                <div className="mt-2 flex gap-2 pl-6">
                  {!item.photoTaken ? (
                    <button onClick={() => takePhoto(i)} className="flex items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1.5 text-xs font-medium text-brand-ink">
                      <Camera size={13} /> Take photo
                    </button>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 rounded-full bg-brand-green-light px-2 py-1 text-[10px] font-medium text-brand-green">
                        <CheckCircle2 size={11} /> Photo attached
                      </span>
                      <button onClick={() => markDone(i)} className="rounded-full bg-brand-green px-3 py-1.5 text-xs font-medium text-white">
                        Mark done
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          disabled={!allDone}
          onClick={() => setStep('final-photo')}
          className="mt-4 w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white disabled:opacity-30"
        >
          {allDone ? 'Finish checklist' : `${items.length - doneCount} task(s) remaining`}
        </button>
      </div>
    );
  }

  if (step === 'final-photo') {
    return (
      <div className="flex flex-1 flex-col">
        <StepHeader step={3} totalSteps={4} label="Signed form" onBack={() => setStep('checklist')} />
        <p className="mt-3 text-sm text-brand-ink">Take a photo of the signed checklist form to close out this session.</p>
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-black/10 p-6">
          {formPhotoTaken ? (
            <>
              <CheckCircle2 size={40} className="text-brand-green" />
              <p className="text-sm font-medium text-brand-ink">Form photo attached</p>
            </>
          ) : (
            <>
              <FileSignature size={40} className="text-brand-muted" />
              <p className="text-center text-xs text-brand-muted">Snap the customer-signed checklist page</p>
            </>
          )}
          <button onClick={() => setFormPhotoTaken(true)} className="flex items-center gap-2 rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-ink">
            <Camera size={15} /> {formPhotoTaken ? 'Retake photo' : 'Take photo'}
          </button>
        </div>
        <button
          disabled={!formPhotoTaken}
          onClick={() => setStep('completed')}
          className="mt-4 w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white disabled:opacity-30"
        >
          Complete session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <PartyPopper size={48} className="text-brand-pink" />
      <h3 className="mt-3 text-xl font-semibold text-brand-ink">Session completed!</h3>
      <p className="mt-1 max-w-[220px] text-sm text-brand-muted">
        {items.length} tasks logged with photo proof. Admin has been notified and payment follow-up will begin.
      </p>
      <button onClick={onClose} className="mt-6 rounded-full bg-brand-green px-5 py-2.5 text-sm font-medium text-white">
        Back to Home
      </button>
    </div>
  );
}

function StepHeader({ step, totalSteps, label, onBack }: { step: number; totalSteps: number; label: string; onBack: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-ink">
          <ArrowLeft size={12} /> Back
        </button>
        <span className="text-[10px] font-semibold tracking-wide text-brand-muted">
          STEP {step} OF {totalSteps}
        </span>
      </div>
      <h3 className="mt-1 text-lg font-semibold text-brand-ink">{label}</h3>
    </div>
  );
}

// ---------- Mother's review form (Phase 1) ----------

const reviewCategories = [
  { key: 'punctuality', label: 'Punctuality', sub: 'Arrived and left on schedule' },
  { key: 'care', label: 'Care Quality', sub: 'Massage, meals, and daily care tasks' },
  { key: 'hygiene', label: 'Hygiene & Cleanliness', sub: 'Personal hygiene and tidiness' },
  { key: 'communication', label: 'Communication', sub: 'Clear, respectful, and attentive' },
] as const;

function MotherReviewScreen({
  cl,
  mother,
  assignment,
  pkg,
}: {
  cl: ConfinementLady;
  mother: import('../types').Client;
  assignment?: Assignment;
  pkg?: Package;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [signed, setSigned] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dayInfo = assignment && pkg ? dayOfTotal(assignment, pkg) : null;

  const allRated = reviewCategories.every((c) => ratings[c.key] > 0);
  const avgRating = allRated ? (Object.values(ratings).reduce((s, v) => s + v, 0) / reviewCategories.length).toFixed(1) : null;
  const canSubmit = allRated && signed;

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-brand-pink-light to-brand-cream px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink text-white shadow-lg">
          <PartyPopper size={28} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-brand-ink">Thank you, {mother.name.split(' ')[0]}!</h3>
        <p className="mt-2 text-sm text-brand-muted">Your review helps us keep every confinement lady's care at its best.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-pink via-brand-pink to-brand-pink-dark px-6 pb-12 pt-6 text-white">
        <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute right-8 top-16 h-10 w-10 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-2 text-xs font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/25">
            <Sparkles size={14} />
          </div>
          NR Mothercare
        </div>
        <h2 className="relative mt-4 text-[26px] font-semibold leading-tight">How was your session, {mother.name.split(' ')[0]}?</h2>
        <p className="relative mt-2 text-sm leading-relaxed text-white/90">
          A quick, honest review helps us keep every confinement lady's care at its best.
        </p>
      </div>

      <div className="flex-1 space-y-4 px-5 pb-5 -mt-7">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5">
          <Avatar name={cl.name} color={cl.avatarColor} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-brand-ink">{cl.name}</p>
            <p className="truncate text-xs text-brand-muted">
              {pkg?.name ?? 'Package'}
              {dayInfo ? ` · Day ${dayInfo.day}` : ''}
              {assignment ? ` · ${formatDateLabel(assignment.date)}` : ''}
            </p>
          </div>
          {avgRating && (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-brand-pink-light px-2.5 py-1 text-xs font-semibold text-brand-pink-dark">
              <Star size={12} className="fill-brand-pink-dark" /> {avgRating}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-brand-muted">Rate your session</p>
          <div className="space-y-4">
            {reviewCategories.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-3 border-b border-black/5 pb-4 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-ink">{c.label}</p>
                  <p className="truncate text-[11px] text-brand-muted">{c.sub}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRatings((r) => ({ ...r, [c.key]: n }))} className="transition-transform active:scale-90">
                      <Star size={20} className={(ratings[c.key] ?? 0) >= n ? 'fill-brand-pink text-brand-pink' : 'fill-transparent text-brand-pink-light'} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="mb-2 text-sm font-semibold text-brand-ink">Tell us more</p>
          <p className="mb-2 text-[11px] text-brand-muted">Optional — and honesty is always welcome</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What went well? What could be better?"
            rows={3}
            className="w-full resize-none rounded-xl border border-black/10 bg-brand-cream p-3 text-sm placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-brand-muted">Confirm & sign off</p>
          <button
            onClick={() => setSigned((s) => !s)}
            className={`flex w-full items-center gap-2.5 rounded-xl border-2 border-dashed p-3.5 text-left text-xs font-medium transition-colors ${
              signed ? 'border-brand-green bg-brand-green-light text-brand-green' : 'border-black/15 bg-brand-cream text-brand-muted'
            }`}
          >
            {signed ? <CheckCircle2 size={18} className="shrink-0" /> : <FileSignature size={18} className="shrink-0" />}
            {signed ? 'Signed — thank you!' : 'Tap here to sign and confirm this session took place as described'}
          </button>
        </div>

        <button
          disabled={!canSubmit}
          onClick={() => setSubmitted(true)}
          className="w-full rounded-full bg-brand-pink py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-pink/30 transition-opacity disabled:opacity-30 disabled:shadow-none"
        >
          Submit Review
        </button>

        <p className="pb-1 text-center text-[11px] leading-relaxed text-brand-muted">
          Something urgent? <span className="font-semibold text-brand-pink">Call NR Mothercare</span> directly instead of waiting on this form.
        </p>
      </div>
    </div>
  );
}

// ---------- Mother's app (Phase 2 preview) ----------

function MotherHomeScreen({ mother, pkg, cl }: { mother: import('../types').Client; pkg?: Package; cl: ConfinementLady }) {
  return (
    <div className="flex-1">
      <p className="text-xs text-brand-muted">Thursday, 13 Aug</p>
      <h3 className="text-xl font-semibold text-brand-ink">Hello, {mother.name.split(' ')[0]}</h3>

      {pkg && (
        <div className="mt-4 rounded-2xl bg-brand-green p-4 text-white">
          <p className="text-[10px] font-semibold tracking-wide text-white/70">ACTIVE PACKAGE</p>
          <p className="mt-1 text-lg font-semibold">{pkg.name}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/85">
            <Avatar name={cl.name} color={cl.avatarColor} size={22} />
            Cared for by {cl.name}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-3 text-xs font-medium text-brand-ink shadow-sm">
          <Repeat size={18} className="text-brand-pink" /> Reschedule
        </button>
        <button className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-3 text-xs font-medium text-brand-ink shadow-sm">
          <MessageCircle size={18} className="text-brand-pink" /> Contact us
        </button>
        <button className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-3 text-xs font-medium text-brand-ink shadow-sm">
          <CreditCard size={18} className="text-brand-pink" /> Make payment
        </button>
        <button className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-3 text-xs font-medium text-brand-ink shadow-sm">
          <Phone size={18} className="text-brand-pink" /> Call HQ
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-black/5 p-4">
        <p className="text-sm font-medium text-brand-ink">Outstanding balance</p>
        <p className="mt-1 text-2xl font-semibold text-brand-ink">RM 1,200</p>
        <p className="text-xs text-brand-muted">Due after Day 10 — pay directly in-app</p>
      </div>
    </div>
  );
}

function MotherBookingsScreen({ mother }: { mother: import('../types').Client }) {
  const { packages } = useSettings();
  const owned = new Set(mother.packageIds);
  const addOns = packages.filter((p) => !owned.has(p.id)).slice(0, 4);

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My bookings</h3>
      <div className="mt-3 space-y-2">
        {mother.packageIds.map((pid) => {
          const pkg = packages.find((p) => p.id === pid);
          return (
            <div key={pid} className="rounded-xl border border-black/5 p-3">
              <p className="text-sm font-medium text-brand-ink">{pkg?.name}</p>
              <p className="text-xs text-brand-muted">{pkg?.durationEstimate}</p>
            </div>
          );
        })}
      </div>

      <p className="mb-2 mt-5 text-[11px] font-semibold tracking-wide text-brand-muted">ADD-ON PACKAGES</p>
      <div className="space-y-2">
        {addOns.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-black/5 p-3">
            <div>
              <p className="text-sm font-medium text-brand-ink">{p.name}</p>
              <p className="text-xs text-brand-muted">{p.summary}</p>
            </div>
            <button className="shrink-0 rounded-full bg-brand-amber px-3 py-1 text-xs font-medium text-white">Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MotherReviewsScreen({ cl }: { cl: ConfinementLady }) {
  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My reviews</h3>
      <p className="text-xs text-brand-muted">Leave feedback on completed sessions</p>
      <div className="mt-3 space-y-2">
        {[
          { date: '11 Aug 2026', status: 'reviewed' as const },
          { date: '10 Aug 2026', status: 'reviewed' as const },
          { date: '13 Aug 2026', status: 'pending' as const },
        ].map((r) => (
          <div key={r.date} className="flex items-center justify-between rounded-xl border border-black/5 p-3">
            <div className="flex items-center gap-2">
              <Avatar name={cl.name} color={cl.avatarColor} size={28} />
              <div>
                <p className="text-sm font-medium text-brand-ink">{cl.name}</p>
                <p className="text-xs text-brand-muted">{r.date}</p>
              </div>
            </div>
            {r.status === 'reviewed' ? (
              <span className="flex items-center gap-0.5 text-xs text-brand-amber">
                <Star size={12} className="fill-brand-amber" /> 5.0
              </span>
            ) : (
              <button className="rounded-full bg-brand-pink px-3 py-1 text-xs font-medium text-white">Review</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MotherProfileScreen({ mother }: { mother: import('../types').Client }) {
  return (
    <div className="flex-1 text-center">
      <Avatar name={mother.name} size={64} />
      <h3 className="mt-2 text-lg font-semibold text-brand-ink">{mother.name}</h3>
      <p className="text-xs text-brand-muted">{mother.location}</p>

      <div className="mt-4 space-y-2 text-left">
        <div className="rounded-xl border border-black/5 p-3">
          <p className="text-[11px] text-brand-muted">Phone</p>
          <p className="text-sm text-brand-ink">{mother.phone}</p>
        </div>
        <div className="rounded-xl border border-black/5 p-3">
          <p className="text-[11px] text-brand-muted">Address</p>
          <p className="text-sm text-brand-ink">{mother.address}</p>
        </div>
        <div className="rounded-xl border border-black/5 p-3">
          <p className="text-[11px] text-brand-muted">Due / birth date</p>
          <p className="text-sm text-brand-ink">{formatDateLabel(mother.dueOrBirthDate)}</p>
        </div>
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink py-2.5 text-sm font-medium text-white">
        <MessageCircle size={15} /> Contact NR Mothercare
      </button>
    </div>
  );
}
