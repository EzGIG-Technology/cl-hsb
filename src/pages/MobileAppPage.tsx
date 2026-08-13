import { useState, useEffect, type ReactNode, type ChangeEvent } from 'react';
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
  Clock,
  Landmark,
  Smartphone,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { PackageArt } from '../components/PackageArt';
import { Avatar, ProfileAvatar, formatRM } from '../components/ui';
import { assignments } from '../data/assignments';
import { useSettings } from '../store/SettingsContext';
import { useCLStore } from '../store/CLStore';
import { useClientStore } from '../store/ClientStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { formatTime12, formatDateLabel, TODAY_STR } from '../lib/date';
import { HOURLY_RATE } from '../lib/clMetrics';
import type { Assignment, ConfinementLady, Package } from '../types';

const FEATURED_MOTHER_ID = 'cli-01'; // Siti Rahman — matches seeded assignments
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
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const { clById } = useCLStore();
  const { clientById } = useClientStore();
  const { packageById } = useSettings();
  const mother = clientById(FEATURED_MOTHER_ID);

  const reviewedAssignment = assignments.find((a) => a.id === 'asg-06'); // Siti Rahman's most recent completed Melur session
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

          {appMode === 'mother-review' ? (
            <div className="px-8 py-8">
              <div className="mx-auto max-w-2xl text-center">
                <span className="inline-block rounded-full bg-brand-green-light px-3 py-1 text-xs font-semibold text-brand-green">
                  Phase 1 — built now
                </span>
                <h2 className="mt-4 text-3xl font-semibold text-brand-ink">Session review, not an app</h2>
                <p className="mx-auto mt-3 max-w-lg text-brand-muted">
                  Sent as a link (SMS/WhatsApp) after each completed session — opens in the browser, no login or app
                  install required. Ratings and notes go to admin only; they're never shown to the CL, matching what we
                  agreed on the call.
                </p>
                <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                  {['4 quick star ratings', 'Optional free-text feedback', 'Tap-to-sign confirmation', 'One tap to call HQ if urgent'].map((f) => (
                    <div key={f} className="flex items-center justify-center rounded-xl border border-black/5 bg-white px-3 py-2.5 text-center text-xs font-medium text-brand-ink shadow-sm">
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto mt-10 max-w-4xl rounded-3xl bg-gradient-to-br from-brand-pink-light via-white to-brand-green-light p-8">
                <BrowserFrame url="review.nrmothercare.com/r/8f2a91">
                  <MotherReviewWebScreen cl={reviewCl} mother={mother} assignment={reviewedAssignment} pkg={motherPkg} />
                </BrowserFrame>
              </div>
            </div>
          ) : (
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

                {appMode === 'mother-app' && (
                  <>
                    <span className="inline-block rounded-full bg-brand-amber-light px-3 py-1 text-xs font-semibold text-brand-amber">
                      Phase 2 — planning preview
                    </span>
                    <h2 className="mt-4 text-3xl font-semibold text-brand-ink">Full mother companion app</h2>
                    <p className="mt-3 max-w-sm text-brand-muted">
                      Only the review form is scoped for launch. This tab is a preview of where the mother experience
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

              <div className="flex justify-center rounded-3xl bg-gradient-to-br from-brand-pink-light via-white to-brand-green-light p-8">
                {appMode === 'cl' && <CLAppSection />}

                {appMode === 'mother-app' && (
                  <PhoneFrame>
                    {purchasingPackageId ? (
                      <PackagePurchaseFlow
                        mother={mother}
                        packageId={purchasingPackageId}
                        onClose={() => setPurchasingPackageId(null)}
                      />
                    ) : (
                      <>
                        <div className="mb-2 flex justify-center">
                          <span className="rounded-full bg-brand-amber-light px-2.5 py-0.5 text-[10px] font-semibold text-brand-amber">
                            PHASE 2 PREVIEW
                          </span>
                        </div>
                        {motherTab === 'home' && <MotherHomeScreen mother={mother} pkg={motherPkg} cl={reviewCl} />}
                        {motherTab === 'bookings' && (
                          <MotherBookingsScreen mother={mother} onBuyPackage={setPurchasingPackageId} />
                        )}
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
                      </>
                    )}
                  </PhoneFrame>
                )}
              </div>
            </div>
          )}
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

function BrowserFrame({ children, url }: { children: ReactNode; url: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
      <div className="flex items-center gap-3 border-b border-black/5 bg-brand-cream/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-brand-muted ring-1 ring-black/5">
          <ShieldCheck size={12} className="shrink-0 text-brand-green" />
          <span className="truncate">{url}</span>
        </div>
      </div>
      <div className="scrollbar-thin max-h-[80vh] overflow-y-auto">{children}</div>
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
        <SessionFlow assignment={openAssignment} cl={cl} myAssignments={myAssignments} onClose={() => setOpenAssignmentId(null)} />
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
  const { clientById } = useClientStore();
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
        <div className="flex items-center gap-2">
          <ProfileAvatar avatarKey={cl.id} name={cl.name} color={cl.avatarColor} size={34} editable={false} />
          <div>
            <p className="text-[10px] text-brand-muted">{clShortId(cl.id)} · {cl.location.split(',')[0]}</p>
            <p className="text-sm font-semibold text-brand-ink">Hi, {cl.name.split(' ')[0]} 👋</p>
          </div>
        </div>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream">
          <Bell size={16} className="text-brand-ink" />
        </div>
      </div>
      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-green-light px-2 py-1 text-[10px] font-medium text-brand-green">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green" /> Data synced · Thursday, 13 Aug
      </span>

      {todaysJob && client && pkg ? (
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-pink via-brand-pink to-brand-pink-dark p-4 text-white shadow-lg shadow-brand-pink/20">
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide text-white/70">TODAY'S JOB</p>
              <p className="mt-1 truncate text-lg font-semibold">{client.name}</p>
              <p className="text-xs text-white/80">
                {client.location} · {pkg.shortName}
                {dayInfo ? ` · Day ${dayInfo.day} of ${dayInfo.total}` : ''}
              </p>
            </div>
            <Avatar name={client.name} size={40} />
          </div>
          <div className="relative mt-3 flex items-center gap-1.5 text-xs text-white/85">
            <Clock size={12} /> Since {formatTime12(todaysJob.startTime)}
          </div>
          <div className="relative mt-1 flex items-center gap-1.5 text-xs text-white/85">
            <ChevronRight size={12} /> Ends {formatTime12(todaysJob.endTime)}
          </div>
          <button
            onClick={() => onOpenJob(todaysJob.id)}
            className="relative mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-white py-2 text-sm font-semibold text-brand-pink"
          >
            Open Job <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4 text-center text-sm text-brand-muted shadow-sm">No job scheduled right now.</div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-lg font-semibold text-brand-ink">{monthAssignments.length}</p>
          <p className="text-[10px] text-brand-muted">Sessions this month</p>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-lg font-semibold text-brand-ink">{Math.round(hoursThisMonth)}</p>
          <p className="text-[10px] text-brand-muted">Hours this month</p>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-lg font-semibold text-brand-ink">RM {Math.round(hoursThisMonth * HOURLY_RATE).toLocaleString()}</p>
          <p className="text-[10px] text-brand-muted">Est. pay this month</p>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-lg font-semibold text-brand-ink">{cl.completedAssignments}</p>
          <p className="text-[10px] text-brand-muted">Total sessions</p>
        </div>
      </div>

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
  const { clientById } = useClientStore();
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
        <ProfileAvatar avatarKey="admin" name="Superadmin" size={36} editable={false} />
        <div>
          <p className="text-sm font-semibold text-brand-ink">Superadmin</p>
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
              <p className="text-lg font-semibold text-brand-ink">RM {Math.round(hours * HOURLY_RATE).toLocaleString()}</p>
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
        <div className="mx-auto flex justify-center">
          <ProfileAvatar avatarKey={cl.id} name={cl.name} color={cl.avatarColor} size={72} />
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

function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function SessionFlow({
  assignment,
  cl,
  myAssignments,
  onClose,
}: {
  assignment: Assignment;
  cl: ConfinementLady;
  myAssignments: Assignment[];
  onClose: () => void;
}) {
  const { packageById } = useSettings();
  const { clientById } = useClientStore();
  const client = clientById(assignment.clientId);
  const pkg = packageById(assignment.packageId);
  const checklistLabels = pkg ? [...pkg.dailyMotherCare, ...pkg.babyCare] : [];

  const [step, setStep] = useState<SessionStep>('checkin');
  const [checkinSelfieUrl, setCheckinSelfieUrl] = useState<string>();
  const [items, setItems] = useState<{ label: string; photoUrl?: string; done: boolean }[]>(
    checklistLabels.map((label) => ({ label, done: false })),
  );
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalElapsed, setFinalElapsed] = useState(0);

  useEffect(() => {
    if (startedAt === null || step === 'completed') return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [startedAt, step]);

  const doneCount = items.filter((i) => i.done).length;
  const allDone = items.length > 0 && doneCount === items.length;

  const upcomingToday = myAssignments.filter(
    (a) => a.id !== assignment.id && a.date === TODAY_STR && (a.status === 'confirmed' || a.status === 'pending'),
  );

  function takePhoto(index: number, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const photoUrl = reader.result as string;
      setItems((prev) => prev.map((it, i) => (i === index ? { ...it, photoUrl } : it)));
    };
    reader.readAsDataURL(file);
  }
  function markDone(index: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, done: true } : it)));
  }
  function handleFormPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => setFormPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
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
          <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl bg-brand-cream px-3 py-2 text-xs text-brand-ink">
            <span className="flex items-center gap-1.5">
              <Camera size={14} /> {checkinSelfieUrl ? 'Selfie captured' : 'Selfie required'}
            </span>
            {checkinSelfieUrl ? (
              <img src={checkinSelfieUrl} alt="Check-in selfie" className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-green" />
            ) : (
              <ShieldCheck size={14} className="text-brand-muted" />
            )}
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setCheckinSelfieUrl(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <button
            onClick={() => {
              setStartedAt(Date.now());
              setStep('checklist');
            }}
            disabled={checklistLabels.length === 0 || !checkinSelfieUrl}
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
        <div className="mt-2 flex items-center gap-1.5 self-start rounded-full bg-brand-ink px-2.5 py-1 text-xs font-semibold text-white">
          <Clock size={12} /> {formatElapsed(elapsed)}
        </div>
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
                <div className="mt-2 flex items-center gap-2 pl-6">
                  {!item.photoUrl ? (
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1.5 text-xs font-medium text-brand-ink">
                      <Camera size={13} /> Take photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) takePhoto(i, file);
                        }}
                      />
                    </label>
                  ) : (
                    <>
                      <img src={item.photoUrl} alt="" className="h-6 w-6 rounded object-cover" />
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
        <div className="mt-2 flex items-center gap-1.5 self-start rounded-full bg-brand-ink px-2.5 py-1 text-xs font-semibold text-white">
          <Clock size={12} /> {formatElapsed(elapsed)}
        </div>
        <p className="mt-3 text-sm text-brand-ink">Take a photo of the signed checklist form to close out this session.</p>
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-black/10 p-6">
          {formPhotoUrl ? (
            <>
              <img src={formPhotoUrl} alt="Signed checklist form" className="h-24 w-24 rounded-xl object-cover shadow-sm" />
              <p className="text-sm font-medium text-brand-ink">Form photo attached</p>
            </>
          ) : (
            <>
              <FileSignature size={40} className="text-brand-muted" />
              <p className="text-center text-xs text-brand-muted">Snap the customer-signed checklist page</p>
            </>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-ink">
            <Camera size={15} /> {formPhotoUrl ? 'Retake photo' : 'Take photo'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) handleFormPhoto(file);
              }}
            />
          </label>
        </div>
        <button
          disabled={!formPhotoUrl}
          onClick={() => {
            setFinalElapsed(elapsed);
            setStep('completed');
          }}
          className="mt-4 w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white disabled:opacity-30"
        >
          Complete session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink text-white shadow-lg shadow-brand-pink/30">
          <PartyPopper size={30} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-brand-ink">Congratulations!</h3>
        <p className="mt-2 max-w-[240px] text-sm text-brand-ink">
          You've completed a session for <span className="font-semibold">{client?.name}</span> under the{' '}
          <span className="font-semibold">{pkg?.name}</span> package.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-cream px-4 py-3">
          <Clock size={16} className="text-brand-pink" />
          <div className="text-left">
            <p className="text-lg font-semibold leading-tight text-brand-ink">{formatElapsed(finalElapsed)}</p>
            <p className="text-[10px] text-brand-muted">Total time taken</p>
          </div>
        </div>

        <p className="mt-4 max-w-[240px] text-xs text-brand-muted">
          This session will be sent to HQ for review and approval — your selfies and checklist photos are attached.
        </p>
      </div>

      <div className="border-t border-black/5 px-1 pb-1 pt-4">
        <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold tracking-wide text-brand-muted">
          <Briefcase size={13} /> YOUR UPCOMING ASSIGNMENTS TODAY
        </p>
        {upcomingToday.length === 0 ? (
          <p className="rounded-xl border border-black/5 p-3 text-center text-xs text-brand-muted">
            Nothing else scheduled for today — enjoy the rest of your day, {cl.name.split(' ')[0]}!
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingToday.map((a) => {
              const upClient = clientById(a.clientId);
              const upPkg = packageById(a.packageId);
              return (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-black/5 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-ink">{upClient?.name}</p>
                    <p className="text-xs text-brand-muted">
                      {upPkg?.shortName} · {a.location}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-pink-light px-2 py-0.5 text-[10px] font-medium text-brand-pink">
                    {formatTime12(a.startTime)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <button onClick={onClose} className="mt-3 w-full rounded-full bg-brand-green py-3 text-sm font-semibold text-white">
          Back to Home
        </button>
      </div>
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

function MotherReviewWebScreen({
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
  const { addReview } = useCLStore();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [signed, setSigned] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dayInfo = assignment && pkg ? dayOfTotal(assignment, pkg) : null;

  const allRated = reviewCategories.every((c) => ratings[c.key] > 0);
  const avgRating = allRated ? (Object.values(ratings).reduce((s, v) => s + v, 0) / reviewCategories.length).toFixed(1) : null;
  const canSubmit = allRated && signed;

  function submitReview() {
    if (!canSubmit || !avgRating) return;
    addReview(cl.id, {
      rating: Number(avgRating),
      text: feedback.trim() || undefined,
      date: TODAY_STR,
      clientName: mother.name,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[560px] flex-col items-center justify-center bg-gradient-to-b from-brand-pink-light to-white px-8 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-pink text-white shadow-lg shadow-brand-pink/30">
          <PartyPopper size={32} />
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-brand-ink">Thank you, {mother.name.split(' ')[0]}!</h3>
        <p className="mt-2 max-w-sm text-sm text-brand-muted">
          Your review helps us keep every confinement lady's care at its best. You can close this page now.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-pink via-brand-pink to-brand-pink-dark px-8 py-10 text-white">
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute right-10 top-24 h-12 w-12 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-2 text-xs font-semibold tracking-wide">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/25">
            <Sparkles size={16} />
          </div>
          NR MOTHERCARE
        </div>
        <h2 className="relative mt-6 text-[28px] font-semibold leading-tight">How was your session, {mother.name.split(' ')[0]}?</h2>
        <p className="relative mt-3 text-sm leading-relaxed text-white/90">
          A quick, honest review helps us keep every confinement lady's care at its best.
        </p>

        <div className="relative mt-10 flex items-center gap-3 rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur-sm">
          <Avatar name={cl.name} color={cl.avatarColor} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{cl.name}</p>
            <p className="truncate text-xs text-white/80">
              {pkg?.name ?? 'Package'}
              {dayInfo ? ` · Day ${dayInfo.day}` : ''}
            </p>
            {assignment && <p className="truncate text-xs text-white/70">{formatDateLabel(assignment.date)}</p>}
          </div>
        </div>

        {avgRating && (
          <div className="relative mt-4 flex items-center gap-1.5 text-sm font-semibold text-white">
            <Star size={16} className="fill-white text-white" /> {avgRating} average so far
          </div>
        )}

        <p className="relative mt-auto pt-10 text-xs leading-relaxed text-white/75">
          Something urgent? <span className="font-semibold text-white">Call NR Mothercare</span> directly instead of
          waiting on this form.
        </p>
      </div>

      <div className="space-y-6 px-8 py-10">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-muted">Rate your session</p>
          <div className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
            {reviewCategories.map((c) => (
              <div key={c.key} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-ink">{c.label}</p>
                  <p className="text-xs text-brand-muted">{c.sub}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRatings((r) => ({ ...r, [c.key]: n }))}
                      className="transition-transform hover:scale-110 active:scale-90"
                    >
                      <Star size={24} className={(ratings[c.key] ?? 0) >= n ? 'fill-brand-pink text-brand-pink' : 'fill-transparent text-brand-pink-light'} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-ink">Tell us more</p>
          <p className="mb-2 text-xs text-brand-muted">Optional — and honesty is always welcome</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What went well? What could be better?"
            rows={4}
            className="w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm shadow-sm placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        <div>
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-brand-muted">Confirm & sign off</p>
          <button
            onClick={() => setSigned((s) => !s)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 border-dashed p-4 text-left text-sm font-medium transition-colors ${
              signed ? 'border-brand-green bg-brand-green-light text-brand-green' : 'border-black/15 bg-white text-brand-muted hover:border-black/25'
            }`}
          >
            {signed ? <CheckCircle2 size={20} className="shrink-0" /> : <FileSignature size={20} className="shrink-0" />}
            {signed ? 'Signed — thank you!' : 'Click here to sign and confirm this session took place as described'}
          </button>
        </div>

        <button
          disabled={!canSubmit}
          onClick={submitReview}
          className="w-full rounded-full bg-brand-pink py-4 text-sm font-bold text-white shadow-lg shadow-brand-pink/30 transition-opacity hover:opacity-90 disabled:opacity-30 disabled:shadow-none disabled:hover:opacity-30"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}

// ---------- Mother's app (Phase 2 preview) ----------

function MotherHomeScreen({ mother, pkg, cl }: { mother: import('../types').Client; pkg?: Package; cl: ConfinementLady }) {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ProfileAvatar avatarKey={mother.id} name={mother.name} size={40} />
          <div>
            <p className="text-xs text-brand-muted">Good morning</p>
            <p className="text-sm font-semibold text-brand-ink">{mother.name.split(' ')[0]} 👋</p>
          </div>
        </div>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <Bell size={16} className="text-brand-ink" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-pink" />
        </div>
      </div>

      {pkg && (
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-pink via-brand-pink to-brand-pink-dark p-4 text-white shadow-lg shadow-brand-pink/20">
          <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <PackageArt pkg={pkg} size={40} rounded="rounded-xl" />
              <div>
                <p className="text-sm font-semibold">{pkg.name}</p>
                <p className="text-[11px] text-white/75">Cared for by {cl.name}</p>
              </div>
            </div>
            <ProfileAvatar avatarKey={cl.id} name={cl.name} color={cl.avatarColor} size={40} editable={false} />
          </div>
          <div className="relative mt-4 flex items-center gap-2 text-[11px] text-white/80">
            <Clock size={12} /> Since Day 1
          </div>
          <div className="relative mt-1 flex items-center gap-2 text-[11px] text-white/80">
            <Repeat size={12} /> Next session tomorrow, 9:00 AM
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="flex items-center gap-1 text-[10px] font-medium text-brand-muted">
            <CreditCard size={11} /> Outstanding
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-ink">RM 1,200</p>
          <p className="text-[10px] text-brand-muted">Due after Day 10</p>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="flex items-center gap-1 text-[10px] font-medium text-brand-muted">
            <MessageCircle size={11} /> Messages
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-ink">2 unread</p>
          <p className="text-[10px] text-brand-muted">from NR Mothercare</p>
        </div>
      </div>

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
    </div>
  );
}

function MotherBookingsScreen({
  mother,
  onBuyPackage,
}: {
  mother: import('../types').Client;
  onBuyPackage: (packageId: string) => void;
}) {
  const { packages } = useSettings();
  const owned = new Set(mother.packageIds);
  const addOns = packages.filter((p) => !owned.has(p.id)).slice(0, 4);

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My bookings</h3>
      <div className="mt-3 space-y-2">
        {mother.packageIds.length === 0 && <p className="text-sm text-brand-muted">No packages yet — add one below.</p>}
        {mother.packageIds.map((pid) => {
          const pkg = packages.find((p) => p.id === pid);
          if (!pkg) return null;
          return (
            <div key={pid} className="flex items-center gap-3 rounded-xl border border-black/5 p-3">
              <PackageArt pkg={pkg} size={44} rounded="rounded-xl" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-ink">{pkg.name}</p>
                <p className="text-xs text-brand-muted">{pkg.durationEstimate}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mb-2 mt-5 text-[11px] font-semibold tracking-wide text-brand-muted">ADD-ON PACKAGES</p>
      <div className="space-y-2">
        {addOns.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-black/5 p-3">
            <PackageArt pkg={p} size={44} rounded="rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-brand-ink">{p.name}</p>
              <p className="truncate text-xs text-brand-muted">
                {p.tiers[0] ? `from ${formatRM(p.tiers[0].price)}` : p.sessionPrice ? `${formatRM(p.sessionPrice.perSession)}/session` : p.summary}
              </p>
            </div>
            <button
              onClick={() => onBuyPackage(p.id)}
              className="shrink-0 rounded-full bg-brand-amber px-3 py-1 text-xs font-medium text-white hover:opacity-90"
            >
              Add
            </button>
          </div>
        ))}
        {addOns.length === 0 && <p className="text-sm text-brand-muted">All available packages are already booked.</p>}
      </div>
    </div>
  );
}

type PurchaseStep = 'detail' | 'payment' | 'success';

const paymentMethods = [
  { id: 'card', label: 'Credit / Debit Card', hint: '•••• 4821', icon: CreditCard },
  { id: 'fpx', label: 'FPX Online Banking', hint: 'Maybank2u', icon: Landmark },
  { id: 'ewallet', label: "Touch 'n Go eWallet", hint: 'Linked', icon: Smartphone },
] as const;

/**
 * Real add-on package purchase flow for the Mother's App — unlike the rest of this tab (labeled
 * "Phase 2 preview"), this writes through to the live ClientStore via addPackageToClient, the
 * same action the admin-side "Add-on package" picker on ClientProfilePage already uses, so a
 * purchase here shows up immediately on both the mother's "My bookings" list and the admin side.
 */
function PackagePurchaseFlow({
  mother,
  packageId,
  onClose,
}: {
  mother: import('../types').Client;
  packageId: string;
  onClose: () => void;
}) {
  const { packageById } = useSettings();
  const { addPackageToClient } = useClientStore();
  const { logAction } = useActivityLog();
  const pkg = packageById(packageId);

  const [step, setStep] = useState<PurchaseStep>('detail');
  const [tierDays, setTierDays] = useState<number | null>(pkg?.tiers[0]?.days ?? null);
  const [methodId, setMethodId] = useState<(typeof paymentMethods)[number]['id']>('card');
  const [processing, setProcessing] = useState(false);

  if (!pkg) return null;

  const selectedTier = pkg.tiers.find((t) => t.days === tierDays) ?? null;
  const price = selectedTier?.price ?? pkg.sessionPrice?.perSession ?? 0;
  const deposit = Math.round((price * pkg.bookingDepositPct) / 100);

  function confirmPayment() {
    setProcessing(true);
    window.setTimeout(() => {
      addPackageToClient(mother.id, pkg!.id, tierDays ?? undefined);
      logAction(mother.name, 'Purchased add-on package', `${pkg!.name}${selectedTier ? ` — ${selectedTier.days} Hari` : ''} via mobile app`);
      setProcessing(false);
      setStep('success');
    }, 700);
  }

  if (step === 'success') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white shadow-lg shadow-brand-green/30">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-brand-ink">Package added!</h3>
        <p className="mt-2 max-w-[240px] text-sm text-brand-ink">
          <span className="font-semibold">{pkg.name}</span>
          {selectedTier ? ` (${selectedTier.days} Hari)` : ''} is now part of {mother.name.split(' ')[0]}'s bookings.
        </p>
        <p className="mt-3 max-w-[240px] text-xs text-brand-muted">
          A confirmation will be sent via WhatsApp/SMS. Our team will be in touch to schedule your sessions.
        </p>
        <button onClick={onClose} className="mt-6 w-full max-w-[240px] rounded-full bg-brand-pink py-3 text-sm font-semibold text-white">
          Back to My Bookings
        </button>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="flex flex-1 flex-col">
        <StepHeader step={2} totalSteps={2} label="Payment" onBack={() => setStep('detail')} />

        <div className="mt-3 rounded-xl bg-brand-cream p-3">
          <div className="flex items-center gap-2.5">
            <PackageArt pkg={pkg} size={36} rounded="rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-ink">{pkg.name}</p>
              <p className="text-xs text-brand-muted">{selectedTier ? `${selectedTier.days} Hari` : 'Per session'}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-brand-ink">{formatRM(price)}</p>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 text-xs">
            <span className="text-brand-muted">Deposit due today ({pkg.bookingDepositPct}%)</span>
            <span className="font-semibold text-brand-pink">{formatRM(deposit)}</span>
          </div>
        </div>

        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-brand-muted">Pay with</p>
        <div className="space-y-2">
          {paymentMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethodId(m.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                methodId === m.id ? 'border-brand-pink bg-brand-pink-light' : 'border-black/10 hover:bg-brand-cream'
              }`}
            >
              <m.icon size={18} className={methodId === m.id ? 'text-brand-pink' : 'text-brand-muted'} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-brand-ink">{m.label}</p>
                <p className="text-xs text-brand-muted">{m.hint}</p>
              </div>
              {methodId === m.id && <CheckCircle2 size={16} className="shrink-0 text-brand-pink" />}
            </button>
          ))}
        </div>

        <button
          disabled={processing}
          onClick={confirmPayment}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {processing ? 'Processing…' : `Pay ${formatRM(deposit)} now`}
        </button>
        <p className="mt-2 text-center text-[10px] text-brand-muted">Remaining balance is due per your package's payment schedule.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <StepHeader step={1} totalSteps={2} label="Package details" onBack={onClose} />

      <div className="mt-3 flex items-center gap-3">
        <PackageArt pkg={pkg} size={52} rounded="rounded-xl" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-ink">{pkg.name}</p>
          <p className="text-xs text-brand-muted">{pkg.durationEstimate}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-brand-ink">{pkg.summary}</p>

      {pkg.dailyMotherCare.length > 0 && (
        <ul className="mt-3 space-y-1">
          {pkg.dailyMotherCare.slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-xs text-brand-ink">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-brand-green" /> {item}
            </li>
          ))}
        </ul>
      )}

      {pkg.tiers.length > 0 ? (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">Choose duration</p>
          <div className="flex flex-wrap gap-1.5">
            {pkg.tiers.map((t) => (
              <button
                key={t.days}
                onClick={() => setTierDays(t.days)}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  tierDays === t.days ? 'border-brand-pink bg-brand-pink text-white' : 'border-black/10 text-brand-ink hover:bg-brand-cream'
                }`}
              >
                {t.days} Hari · {formatRM(t.price)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        pkg.sessionPrice && (
          <div className="mt-4 rounded-xl bg-brand-cream p-3 text-sm text-brand-ink">
            {formatRM(pkg.sessionPrice.perSession)} per session
          </div>
        )
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-black/5 p-3 text-sm">
        <span className="text-brand-muted">Total price</span>
        <span className="font-semibold text-brand-ink">{formatRM(price)}</span>
      </div>

      <button
        disabled={pkg.tiers.length > 0 && !tierDays}
        onClick={() => setStep('payment')}
        className="mt-4 w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white disabled:opacity-30"
      >
        Continue to payment
      </button>
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
      <div className="flex justify-center">
        <ProfileAvatar avatarKey={mother.id} name={mother.name} size={72} />
      </div>
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
