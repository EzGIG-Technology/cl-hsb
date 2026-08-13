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
  FileSignature,
  PartyPopper,
  Phone,
  CreditCard,
  Repeat,
  Sparkles,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { IconRail } from '../components/IconRail';
import { Logo } from '../components/Logo';
import { Avatar } from '../components/ui';
import { assignments } from '../data/assignments';
import { clientById } from '../data/clients';
import { useSettings } from '../store/SettingsContext';
import { useCLStore } from '../store/CLStore';
import { formatTime12, formatDateLabel } from '../lib/date';
import type { ConfinementLady, Package } from '../types';

const FEATURED_CL_ID = 'cl-01'; // Sarah Yusof
const FEATURED_MOTHER_ID = 'cli-01'; // Sofea Rahman — her long-running client, matches seeded assignments

type AppMode = 'cl' | 'mother-review' | 'mother-app';
type DemoTab = 'today' | 'schedule' | 'reports' | 'profile';
type MotherTab = 'home' | 'bookings' | 'reviews' | 'profile';

const clTabs: { id: DemoTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'reports', label: 'Reports', icon: ClipboardList },
  { id: 'profile', label: 'Profile', icon: User },
];

const motherTabs: { id: MotherTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'profile', label: 'Profile', icon: User },
];

const features = ['GPS + selfie attendance', 'Package checklist with photo proof', 'Care reporting', 'Leave & performance'];

export default function MobileAppPage() {
  const [appMode, setAppMode] = useState<AppMode>('cl');
  const [tab, setTab] = useState<DemoTab>('today');
  const [motherTab, setMotherTab] = useState<MotherTab>('home');
  const { clById } = useCLStore();
  const { packageById } = useSettings();
  const cl = clById(FEATURED_CL_ID);
  const mother = clientById(FEATURED_MOTHER_ID);

  const nextAssignment = assignments.find((a) => a.clId === FEATURED_CL_ID && a.date === '2026-08-13');
  const upcoming = assignments.filter((a) => a.clId === FEATURED_CL_ID).slice(0, 5);
  const reviewedAssignment = assignments.find((a) => a.id === 'asg-06'); // Sofea Rahman's most recent completed Melur session

  if (!cl || !mother) return null;
  const motherPkg = packageById(mother.packageIds[0]);

  const headings: Record<AppMode, { title: string; subtitle: string }> = {
    cl: {
      title: 'CL mobile application',
      subtitle: 'The Confinement Lady experience — daily assignments, attendance, and package checklists.',
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
        <IconRail />
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
                  <h2 className="mt-4 text-4xl font-semibold text-brand-ink">Good morning, {cl.name.split(' ')[0]}</h2>
                  <p className="mt-3 max-w-sm text-brand-muted">
                    Tap through Start Session on the Today tab to see the full checklist + photo-proof flow.
                  </p>
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
                    {clTabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          tab === t.id ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
                        }`}
                      >
                        <t.icon size={15} />
                        {t.label}
                      </button>
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
              {appMode === 'cl' && (
                <PhoneFrame>
                  {tab === 'today' && <CLTodayScreen cl={cl} nextAssignment={nextAssignment} />}
                  {tab === 'schedule' && <ScheduleScreen assignmentsForCL={upcoming} />}
                  {tab === 'reports' && <ReportsScreen cl={cl} />}
                  {tab === 'profile' && <ProfileScreen cl={cl} />}
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
                </PhoneFrame>
              )}

              {appMode === 'mother-review' && (
                <PhoneFrame noPadding>
                  <MotherReviewScreen cl={cl} mother={mother} assignment={reviewedAssignment} pkg={motherPkg} />
                </PhoneFrame>
              )}

              {appMode === 'mother-app' && (
                <PhoneFrame>
                  <div className="mb-2 flex justify-center">
                    <span className="rounded-full bg-brand-amber-light px-2.5 py-0.5 text-[10px] font-semibold text-brand-amber">
                      PHASE 2 PREVIEW
                    </span>
                  </div>
                  {motherTab === 'home' && <MotherHomeScreen mother={mother} pkg={motherPkg} cl={cl} />}
                  {motherTab === 'bookings' && <MotherBookingsScreen mother={mother} />}
                  {motherTab === 'reviews' && <MotherReviewsScreen cl={cl} />}
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

type SessionStep = 'idle' | 'checklist' | 'final-photo' | 'completed';

function CLTodayScreen({ cl, nextAssignment }: { cl: ConfinementLady; nextAssignment?: (typeof assignments)[number] }) {
  const { packageById } = useSettings();
  const client = nextAssignment ? clientById(nextAssignment.clientId) : undefined;
  const pkg = nextAssignment ? packageById(nextAssignment.packageId) : undefined;

  const checklistLabels = pkg ? [...pkg.dailyMotherCare, ...pkg.babyCare] : [];
  const [step, setStep] = useState<SessionStep>('idle');
  const [items, setItems] = useState<{ label: string; photoTaken: boolean; done: boolean }[]>(
    checklistLabels.map((label) => ({ label, photoTaken: false, done: false })),
  );
  const [formPhotoTaken, setFormPhotoTaken] = useState(false);

  const doneCount = items.filter((i) => i.done).length;
  const allDone = items.length > 0 && doneCount === items.length;

  function startSession() {
    setItems(checklistLabels.map((label) => ({ label, photoTaken: false, done: false })));
    setFormPhotoTaken(false);
    setStep('checklist');
  }

  function takePhoto(index: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, photoTaken: true } : it)));
  }

  function markDone(index: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, done: true } : it)));
  }

  if (step === 'checklist') {
    return (
      <div className="flex flex-1 flex-col">
        <StepHeader step={2} totalSteps={4} label="Package checklist" onBack={() => setStep('idle')} />
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
                    <button
                      onClick={() => takePhoto(i)}
                      className="flex items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1.5 text-xs font-medium text-brand-ink"
                    >
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
          <button
            onClick={() => setFormPhotoTaken(true)}
            className="flex items-center gap-2 rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-ink"
          >
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

  if (step === 'completed') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <PartyPopper size={48} className="text-brand-pink" />
        <h3 className="mt-3 text-xl font-semibold text-brand-ink">Session completed!</h3>
        <p className="mt-1 max-w-[220px] text-sm text-brand-muted">
          {items.length} tasks logged with photo proof. Admin has been notified and payment follow-up will begin.
        </p>
        <button onClick={() => setStep('idle')} className="mt-6 rounded-full bg-brand-green px-5 py-2.5 text-sm font-medium text-white">
          Back to Today
        </button>
      </div>
    );
  }

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
      <h3 className="text-xl font-semibold text-brand-ink">Good morning, {cl.name.split(' ')[0]}</h3>

      {client && pkg && nextAssignment && (
        <div className="mt-4 rounded-2xl bg-brand-pink p-4 text-white">
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
          <MapPin size={16} className="text-brand-pink" />
          Ready to clock in
        </div>
        <p className="text-xs text-brand-muted">GPS location verified</p>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-cream px-3 py-2 text-xs text-brand-ink">
          <span className="flex items-center gap-1.5">
            <Camera size={14} /> Selfie required
          </span>
          <ShieldCheck size={14} className="text-brand-green" />
        </div>
        <button
          onClick={startSession}
          disabled={checklistLabels.length === 0}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand-green py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Camera size={15} /> Check in & start session
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-brand-muted">
        Starting the session opens today's checklist — one photo per task, then a final signed-form photo to close out.
      </p>
    </div>
  );
}

function StepHeader({ step, totalSteps, label, onBack }: { step: number; totalSteps: number; label: string; onBack: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-xs text-brand-muted hover:text-brand-ink">
          ‹ Back
        </button>
        <span className="text-[10px] font-semibold tracking-wide text-brand-muted">
          STEP {step} OF {totalSteps}
        </span>
      </div>
      <h3 className="mt-1 text-lg font-semibold text-brand-ink">{label}</h3>
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

function ReportsScreen({ cl }: { cl: ConfinementLady }) {
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

function ProfileScreen({ cl }: { cl: ConfinementLady }) {
  return (
    <div className="flex-1 text-center">
      <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink text-lg font-semibold text-white">
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
          <span key={s} className="rounded-full bg-brand-pink-light px-2.5 py-1 text-[10px] text-brand-pink">
            {s}
          </span>
        ))}
      </div>
      <p className="mt-4 text-left text-xs text-brand-muted">{cl.bio}</p>
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
  assignment?: (typeof assignments)[number];
  pkg?: Package;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [signed, setSigned] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allRated = reviewCategories.every((c) => ratings[c.key] > 0);
  const canSubmit = allRated && signed;

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-brand-cream px-6 text-center">
        <PartyPopper size={44} className="text-brand-pink" />
        <h3 className="mt-3 text-lg font-semibold text-brand-ink">Thank you, {mother.name.split(' ')[0]}!</h3>
        <p className="mt-1 text-sm text-brand-muted">Your review helps us keep every confinement lady's care at its best.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-pink to-brand-pink-dark px-5 pb-8 pt-5 text-white">
        <div className="absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute -left-8 bottom-0 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-2 text-xs font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
            <Sparkles size={13} />
          </div>
          NR Mothercare
        </div>
        <h2 className="relative mt-3 text-2xl font-semibold">How was your session, {mother.name.split(' ')[0]}?</h2>
        <p className="relative mt-1 text-sm text-white/85">
          A quick, honest review helps us keep every confinement lady's care at its best.
        </p>
      </div>

      <div className="flex-1 space-y-4 px-5 pb-4 -mt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Avatar name={cl.name} color={cl.avatarColor} size={44} />
          <div>
            <p className="font-semibold text-brand-ink">{cl.name}</p>
            <p className="text-xs text-brand-muted">
              {pkg?.name ?? 'Package'} {assignment ? `· ${formatDateLabel(assignment.date)}` : ''}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-[11px] font-semibold tracking-wide text-brand-muted">RATE YOUR SESSION</p>
          <div className="space-y-3">
            {reviewCategories.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-2 border-b border-black/5 pb-3 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-brand-ink">{c.label}</p>
                  <p className="text-[11px] text-brand-muted">{c.sub}</p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRatings((r) => ({ ...r, [c.key]: n }))}>
                      <Star
                        size={18}
                        className={(ratings[c.key] ?? 0) >= n ? 'fill-brand-pink text-brand-pink' : 'text-brand-pink-light'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-brand-ink">Tell us more (optional — and honesty is always welcome)</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What went well? What could be better?"
            rows={3}
            className="w-full resize-none rounded-lg border border-black/10 bg-brand-cream p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-brand-muted">CONFIRM & SIGN OFF</p>
          <button
            onClick={() => setSigned((s) => !s)}
            className={`flex w-full items-center gap-2 rounded-xl border-2 border-dashed p-3 text-left text-xs ${
              signed ? 'border-brand-green bg-brand-green-light text-brand-green' : 'border-black/10 text-brand-muted'
            }`}
          >
            {signed ? <CheckCircle2 size={16} className="shrink-0" /> : <FileSignature size={16} className="shrink-0" />}
            {signed ? 'Signed — thank you!' : 'Tap here to sign and confirm this session took place as described'}
          </button>
        </div>

        <button
          disabled={!canSubmit}
          onClick={() => setSubmitted(true)}
          className="w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white disabled:opacity-30"
        >
          Submit Review
        </button>

        <p className="pb-2 text-center text-[11px] text-brand-muted">
          Something urgent?{' '}
          <span className="font-semibold text-brand-pink">Call NR Mothercare</span> directly instead of waiting on this form.
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
