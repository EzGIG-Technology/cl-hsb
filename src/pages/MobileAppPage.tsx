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
  Phone,
  CreditCard,
  Repeat,
  BookOpen,
  Send,
  LogOut,
  IdCard,
  ArrowLeft,
  Clock,
  Landmark,
  Smartphone,
  Store,
  CalendarDays,
} from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PackageArt } from '../components/PackageArt';
import { Logo, HoneySpaMark } from '../components/Logo';
import { Avatar, ProfileAvatar, formatRM } from '../components/ui';
import { assignments } from '../data/assignments';
import { useSettings } from '../store/SettingsContext';
import { useCLStore } from '../store/CLStore';
import { useClientStore } from '../store/ClientStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { formatTime12, formatDateLabel, formatWeekdayDate, TODAY, TODAY_STR } from '../lib/date';
import { HOURLY_RATE } from '../lib/clMetrics';
import { tierForCL, type Assignment, type Staff, type Package, type Client } from '../types';

const FEATURED_CLIENT_ID = 'cli-01'; // matches the seeded assignments
const REVIEWED_ASSIGNMENT_ID = 'asg-06'; // that client's most recent completed session
const PERSONA_IDS = ['cl-01', 'cl-04', 'cl-05', 'cl-06'];
const THIS_MONTH = TODAY_STR.slice(0, 7);

type AppMode = 'staff' | 'customer-review' | 'customer-app';
type StaffTab = 'home' | 'jobs' | 'messages' | 'earnings' | 'profile';
type ClientTab = 'home' | 'bookings' | 'reviews' | 'payments' | 'profile';

const staffMemberTabs: { id: StaffTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

const clientTabs: { id: ClientTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: User },
];

const staffMemberFeatures = ['GPS and selfie check-in', 'Treatment checklist with a photo per step', 'Photo of the signed session form', 'Earnings and payslips'];
const reviewFeatures = ['Four quick star ratings', 'Optional comments', 'Tap to sign', 'Call us instead'];

/** Staff number shown on the staff member's own app screens. */
function staffId(clId: string) {
  const n = parseInt(clId.replace('cl-', ''), 10);
  return `HS-${n + 118}`;
}

function telHref(phone: string) {
  return `tel:+6${phone.replace(/\D/g, '')}`;
}

/** Booked length of a session, from its start and end times. */
function sessionMinutes(a: Assignment) {
  const [sh, sm] = a.startTime.split(':').map(Number);
  const [eh, em] = a.endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/** The tier a customer booked for a treatment, falling back to its first (shortest) tier. */
function bookedTier(pkg: Package, minutes?: number) {
  return pkg.tiers.find((t) => t.minutes === minutes) ?? pkg.tiers[0];
}

function priceLabel(pkg: Package, price?: number) {
  if (pkg.estimated) return 'Price to confirm';
  return price !== undefined ? formatRM(price) : 'Price to confirm';
}

export default function MobileAppPage() {
  const [appMode, setAppMode] = useState<AppMode>('staff');
  const [clientTab, setClientTab] = useState<ClientTab>('home');
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const { clById } = useCLStore();
  const { clientById } = useClientStore();
  const { packageById } = useSettings();
  const client = clientById(FEATURED_CLIENT_ID);

  const reviewedAssignment = assignments.find((a) => a.id === REVIEWED_ASSIGNMENT_ID);
  const [reviewStaff] = useState(() => clById(reviewedAssignment?.clId ?? 'cl-01'));

  if (!client || !reviewStaff) return null;
  const clientPkg = packageById(client.packageIds[0]);
  const reviewedPkg = reviewedAssignment ? packageById(reviewedAssignment.packageId) : clientPkg;

  const headings: Record<AppMode, { title: string; subtitle: string }> = {
    staff: {
      title: 'Staff app',
      subtitle: 'What a CL or spa staff member uses on the day: her sessions, the treatment checklist with photo proof, messages and earnings.',
    },
    'customer-review': {
      title: 'Customer review form',
      subtitle: 'Phase 1. A short link sent to the customer after each session, and the only customer-facing piece built for launch.',
    },
    'customer-app': {
      title: 'Customer app',
      subtitle: 'Phase 2 preview. Not part of the current build: shown so the team can plan bookings, add-on treatments, reviews and payments.',
    },
  };

  return (
    <PageShell
      title={headings[appMode].title}
      subtitle={headings[appMode].subtitle}
      headerAction={
        <Link
          to="/"
          className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
        >
          Admin dashboard <ChevronRight size={14} />
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="App preview">
        {(
          [
            { id: 'staff', label: 'Staff app' },
            { id: 'customer-review', label: 'Customer review form' },
            { id: 'customer-app', label: 'Customer app (Phase 2)' },
          ] as { id: AppMode; label: string }[]
        ).map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={appMode === m.id}
            onClick={() => setAppMode(m.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              appMode === m.id ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {appMode === 'customer-review' ? (
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
            <div>
              <span className="inline-block rounded-full bg-brand-lavender-light px-3 py-1 text-sm font-medium text-brand-lavender">
                Phase 1 · built now
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-brand-ink">A review link, not an app</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink">
                Sent by WhatsApp or SMS after each completed session. It opens in the browser, with no login and nothing
                to install. Ratings and comments go to the spa manager only. They are never shown to the staff member.
              </p>
              <ul className="mt-6 space-y-3 rounded-2xl bg-white p-5">
                {reviewFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-brand-ink">
                    <CheckCircle2 size={16} className="shrink-0 text-brand-lavender" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6">
              <BrowserFrame url="review.honeyspabangi.my/r/8f2a91">
                <ClientReviewWebScreen
                  staffMember={reviewStaff}
                  client={client}
                  assignment={reviewedAssignment}
                  pkg={reviewedPkg}
                />
              </BrowserFrame>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            {appMode === 'staff' && (
              <>
                <span className="inline-block rounded-full bg-brand-pink-light px-3 py-1 text-sm font-medium text-brand-pink">
                  iOS and Android
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-brand-ink">Built for CLs and spa staff between sessions</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-ink">
                  Tap "Open session" on Home or Jobs to walk through check-in, the treatment checklist with a photo per
                  step, and the signed session form. Switch staff member under Profile, then Demo persona.
                </p>
                <ul className="mt-6 max-w-md space-y-3 rounded-2xl bg-white p-5">
                  {staffMemberFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-brand-ink">
                      <CheckCircle2 size={16} className="shrink-0 text-brand-lavender" />
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {appMode === 'customer-app' && (
              <>
                <span className="inline-block rounded-full bg-brand-amber-light px-3 py-1 text-sm font-medium text-brand-amber">
                  Phase 2 · planning preview
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-brand-ink">A companion app for customers</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-ink">
                  Only the review form is scoped for launch. This is a preview of where the customer experience could go
                  next: her profile, bookings, add-on treatments, reviews, payments and reschedule requests.
                </p>
                <p className="mb-3 mt-8 text-sm font-semibold text-brand-ink">Preview tabs</p>
                <div className="flex flex-wrap gap-2">
                  {clientTabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setPurchasingPackageId(null);
                        setClientTab(t.id);
                      }}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                        clientTab === t.id ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
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

          <div className="flex justify-center rounded-3xl bg-white p-8">
            {appMode === 'staff' && <StaffAppSection />}

            {appMode === 'customer-app' && (
              <PhoneFrame
                tabBar={
                  purchasingPackageId ? undefined : (
                    <TabBar tabs={clientTabs} active={clientTab} onSelect={setClientTab} />
                  )
                }
              >
                {purchasingPackageId ? (
                  <AddOnPurchaseFlow
                    client={client}
                    packageId={purchasingPackageId}
                    onClose={() => setPurchasingPackageId(null)}
                  />
                ) : (
                  <>
                    <div className="mb-3 flex justify-center">
                      <span className="rounded-full bg-brand-amber-light px-3 py-0.5 text-xs font-medium text-brand-amber">
                        Phase 2 preview
                      </span>
                    </div>
                    {clientTab === 'home' && (
                      <ClientHomeScreen client={client} pkg={clientPkg} staffMember={reviewStaff} onGoTo={setClientTab} />
                    )}
                    {clientTab === 'bookings' && <ClientBookingsScreen client={client} onAddTreatment={setPurchasingPackageId} />}
                    {clientTab === 'reviews' && <ClientReviewsScreen client={client} />}
                    {clientTab === 'payments' && <ClientPaymentsScreen client={client} />}
                    {clientTab === 'profile' && <ClientProfileScreen client={client} />}
                  </>
                )}
              </PhoneFrame>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

// ---------- Device chrome ----------

function PhoneFrame({ children, tabBar }: { children: ReactNode; tabBar?: ReactNode }) {
  return (
    <div data-ui className="relative flex h-[720px] w-[360px] flex-col overflow-hidden rounded-[2.5rem] border-[6px] border-black bg-brand-cream">
      <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center justify-between px-6 pb-1 pt-3 text-xs font-medium text-brand-ink">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Wifi size={12} />
          <Battery size={14} />
        </div>
      </div>
      <div className="scrollbar-thin flex flex-1 flex-col overflow-y-auto px-5 pb-4 pt-2">{children}</div>
      {tabBar}
    </div>
  );
}

function TabBar<T extends string>({
  tabs,
  active,
  onSelect,
}: {
  tabs: { id: T; label: string; icon: typeof Home }[];
  active: T;
  onSelect: (id: T) => void;
}) {
  return (
    <nav data-ui className="flex shrink-0 items-center justify-around bg-white px-2 pb-4 pt-2.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-xs transition-colors ${active === t.id ? 'font-medium text-brand-pink' : 'text-brand-muted'}`}
        >
          <t.icon size={18} />
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function BrowserFrame({ children, url }: { children: ReactNode; url: string }) {
  return (
    <div data-ui className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div data-ui className="flex items-center gap-3 border-b border-black/5 bg-brand-cream px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-brand-muted">
          <ShieldCheck size={12} className="shrink-0 text-brand-lavender" />
          <span className="truncate">{url}</span>
        </div>
      </div>
      <div className="scrollbar-thin max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  );
}

/** Position in a short in-app flow, shown as a segmented bar rather than "step 2 of 4". */
function FlowHeader({ current, total, label, onBack }: { current: number; total: number; label: string; onBack: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-brand-muted transition-colors hover:text-brand-ink">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex flex-1 justify-end gap-1" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i < current ? 'bg-brand-pink' : 'bg-brand-pink-light'}`} />
          ))}
        </div>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-brand-ink">{label}</h3>
    </div>
  );
}

// ---------- Staff app ----------

function StaffAppSection() {
  const { clById } = useCLStore();
  const [personaId, setPersonaId] = useState('cl-01');
  const [tab, setTab] = useState<StaffTab>('home');
  const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null);

  const staffMember = clById(personaId);
  const myAssignments = assignments.filter((a) => a.clId === personaId);
  const openAssignment = openAssignmentId ? myAssignments.find((a) => a.id === openAssignmentId) : null;

  if (!staffMember) return null;

  return (
    <PhoneFrame tabBar={openAssignment ? undefined : <TabBar tabs={staffMemberTabs} active={tab} onSelect={setTab} />}>
      {openAssignment ? (
        <SessionFlow
          key={openAssignment.id}
          assignment={openAssignment}
          staffMember={staffMember}
          myAssignments={myAssignments}
          onClose={() => setOpenAssignmentId(null)}
        />
      ) : (
        <>
          {tab === 'home' && (
            <StaffHomeScreen staffMember={staffMember} assignments={myAssignments} onOpenJob={setOpenAssignmentId} onGoTo={setTab} />
          )}
          {tab === 'jobs' && <StaffJobsScreen staffMember={staffMember} assignments={myAssignments} onOpenJob={setOpenAssignmentId} />}
          {tab === 'messages' && <StaffMessagesScreen />}
          {tab === 'earnings' && <StaffEarningsScreen staffMember={staffMember} assignments={myAssignments} />}
          {tab === 'profile' && (
            <StaffProfileScreen
              staffMember={staffMember}
              personaId={personaId}
              onPersonaChange={(id) => {
                setPersonaId(id);
                setOpenAssignmentId(null);
              }}
            />
          )}
        </>
      )}
    </PhoneFrame>
  );
}

function StaffHomeScreen({
  staffMember,
  assignments: myAssignments,
  onOpenJob,
  onGoTo,
}: {
  staffMember: Staff;
  assignments: Assignment[];
  onOpenJob: (id: string) => void;
  onGoTo: (tab: StaffTab) => void;
}) {
  const { packageById, company } = useSettings();
  const { clientById } = useClientStore();
  const todaysSessions = myAssignments
    .filter((a) => a.date === TODAY_STR && (a.status === 'confirmed' || a.status === 'pending'))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nextSession = todaysSessions[0];
  const laterToday = todaysSessions.slice(1);
  const client = nextSession ? clientById(nextSession.clientId) : undefined;
  const pkg = nextSession ? packageById(nextSession.packageId) : undefined;

  const monthAssignments = myAssignments.filter((a) => a.date.startsWith(THIS_MONTH));
  const completedThisMonth = monthAssignments.filter((a) => a.status === 'completed');
  const hoursThisMonth = completedThisMonth.reduce((sum, a) => sum + sessionMinutes(a) / 60, 0);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <HoneySpaMark size={30} />
        <button aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
          <Bell size={16} className="text-brand-ink" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4">
        <ProfileAvatar avatarKey={staffMember.id} name={staffMember.name} color={staffMember.avatarColor} size={44} editable={false} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-brand-ink">Hi, {staffMember.name.split(' ')[0]}</p>
          <p className="truncate text-xs text-brand-muted">
            {staffId(staffMember.id)} · {staffMember.location.split(',')[0]}
          </p>
        </div>
        <span className="ml-auto flex shrink-0 items-center gap-1 text-sm font-medium text-brand-ink">
          <Star size={13} className="fill-brand-amber text-brand-amber" /> {staffMember.rating}
        </span>
      </div>
      <p className="mt-2 text-xs text-brand-muted">Synced · {formatWeekdayDate(TODAY)}</p>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-4">
        <div>
          <p className="text-xl font-semibold tracking-tight text-brand-ink">{monthAssignments.length}</p>
          <p className="text-xs text-brand-muted">Sessions this month</p>
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight text-brand-ink">{Math.round(hoursThisMonth)}</p>
          <p className="text-xs text-brand-muted">Hours done</p>
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight text-brand-ink">RM {Math.round(hoursThisMonth * HOURLY_RATE).toLocaleString()}</p>
          <p className="text-xs text-brand-muted">Est. pay</p>
        </div>
      </div>

      <p className="mb-2 mt-5 text-sm font-semibold text-brand-ink">Today's sessions</p>
      {nextSession && client && pkg ? (
        <div className="rounded-2xl bg-brand-pink p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-white/80">Next up</p>
              <p className="mt-0.5 truncate text-lg font-semibold">{client.name}</p>
              <p className="text-xs text-white/85">
                {pkg.shortName} · {sessionMinutes(nextSession)} min · {pkg.treatmentSteps.length} treatment steps
              </p>
            </div>
            <Avatar name={client.name} color="#6f76b0" size={40} />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-white/90">
            <Clock size={12} /> {formatTime12(nextSession.startTime)} to {formatTime12(nextSession.endTime)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-white/90">
            <MapPin size={12} /> {nextSession.location}
          </div>
          <button
            onClick={() => onOpenJob(nextSession.id)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-white py-2 text-sm font-semibold text-brand-pink transition-colors hover:bg-brand-pink-light"
          >
            Open session <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-4 text-center text-sm text-brand-muted">No session scheduled right now.</div>
      )}
      {laterToday.length > 0 && (
        <div className="mt-2 space-y-2">
          {laterToday.map((a) => (
            <button
              key={a.id}
              onClick={() => onOpenJob(a.id)}
              className="flex w-full items-center justify-between rounded-2xl bg-white p-3 text-left transition-colors hover:bg-brand-pink-light"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-ink">{clientById(a.clientId)?.name}</p>
                <p className="text-xs text-brand-muted">
                  {packageById(a.packageId)?.shortName} · {sessionMinutes(a)} min
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-brand-pink">{formatTime12(a.startTime)}</span>
            </button>
          ))}
        </div>
      )}

      <p className="mb-2 mt-5 text-sm font-semibold text-brand-ink">Quick actions</p>
      <div className="space-y-1 rounded-2xl bg-white p-2">
        <button
          onClick={() => onGoTo('messages')}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-brand-ink transition-colors hover:bg-brand-cream"
        >
          <MessageCircle size={16} className="text-brand-pink" /> Message the front desk
          <ChevronRight size={14} className="ml-auto text-brand-muted" />
        </button>
        <a
          href={telHref(company.phone)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-brand-ink transition-colors hover:bg-brand-cream"
        >
          <Phone size={16} className="text-brand-pink" /> Call the spa
          <span className="ml-auto text-xs text-brand-muted">{company.phone}</span>
        </a>
        <button
          onClick={() => onGoTo('earnings')}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-brand-ink transition-colors hover:bg-brand-cream"
        >
          <Wallet size={16} className="text-brand-pink" /> My earnings
          <ChevronRight size={14} className="ml-auto text-brand-muted" />
        </button>
      </div>
    </div>
  );
}

function StaffJobsScreen({
  staffMember,
  assignments: myAssignments,
  onOpenJob,
}: {
  staffMember: Staff;
  assignments: Assignment[];
  onOpenJob: (id: string) => void;
}) {
  const { packageById } = useSettings();
  const { clientById } = useClientStore();
  const [jobTab, setJobTab] = useState<'active' | 'upcoming' | 'past'>('active');

  const active = myAssignments.filter((a) => a.date === TODAY_STR && a.status !== 'cancelled' && a.status !== 'completed');
  const upcoming = myAssignments.filter((a) => a.date > TODAY_STR && a.status !== 'cancelled');
  const past = myAssignments.filter((a) => a.status === 'completed');
  const rows = jobTab === 'active' ? active : jobTab === 'upcoming' ? upcoming : past;

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My jobs</h3>
      <p className="text-xs text-brand-muted">{staffMember.name}</p>
      <div className="mt-3 flex gap-1 rounded-full bg-white p-1">
        {(['active', 'upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setJobTab(t)}
            className={`flex-1 rounded-full py-1.5 text-xs font-medium capitalize transition-colors ${
              jobTab === t ? 'bg-brand-pink text-white' : 'text-brand-muted hover:text-brand-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((a) => {
          const client = clientById(a.clientId);
          const pkg = packageById(a.packageId);
          return (
            <div key={a.id} className="rounded-2xl bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-ink">{client?.name}</p>
                  <p className="text-xs text-brand-muted">
                    {pkg?.shortName} · {sessionMinutes(a)} min
                    {pkg ? ` · ${pkg.treatmentSteps.length} steps` : ''}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-muted">
                    <MapPin size={11} /> {a.location}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-pink-light px-2 py-0.5 text-xs font-medium text-brand-pink">
                  {jobTab === 'active' ? formatTime12(a.startTime) : jobTab === 'upcoming' ? formatDateLabel(a.date) : 'Completed'}
                </span>
              </div>
              {jobTab === 'active' && (
                <button onClick={() => onOpenJob(a.id)} className="mt-2 flex items-center gap-1 text-sm font-semibold text-brand-pink">
                  Open session <ChevronRight size={13} />
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

function StaffMessagesScreen() {
  const [messages, setMessages] = useState([
    { id: 'm1', from: 'spa', text: "Morning! Today's first booking is confirmed. Please be at Bangi Sentral by 10.15am.", time: '08:15' },
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
      <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-cream">
          <HoneySpaMark size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-ink">Front desk</p>
          <p className="text-xs text-brand-muted">Honey Spa Bangi</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${m.from === 'me' ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink'}`}>
              <p>{m.text}</p>
              <p className={`mt-0.5 text-xs ${m.from === 'me' ? 'text-white/70' : 'text-brand-muted'}`}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message the front desk…"
          aria-label="Message the front desk"
          className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
        <button onClick={send} aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white transition-colors hover:bg-brand-pink-dark">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

const PAST_PAYSLIPS = [
  { month: 'Jul 2026', sessions: 52, hours: 64, pay: 1410 },
  { month: 'Jun 2026', sessions: 58, hours: 71, pay: 1560 },
  { month: 'May 2026', sessions: 47, hours: 57, pay: 1250 },
];

const CURRENT_MONTH_LABEL = 'Aug 2026 (current)';

function StaffEarningsScreen({ staffMember, assignments: myAssignments }: { staffMember: Staff; assignments: Assignment[] }) {
  const [month, setMonth] = useState(CURRENT_MONTH_LABEL);
  const monthAssignments = myAssignments.filter((a) => a.date.startsWith(THIS_MONTH) && a.status === 'completed');
  const hours = monthAssignments.reduce((sum, a) => sum + sessionMinutes(a) / 60, 0);
  const past = PAST_PAYSLIPS.find((x) => x.month === month);

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My earnings</h3>
      <p className="text-xs text-brand-muted">{staffMember.name}</p>

      <div className="relative mt-3">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          aria-label="Month"
          className="w-full appearance-none rounded-full bg-white px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
        >
          <option>{CURRENT_MONTH_LABEL}</option>
          {PAST_PAYSLIPS.map((p) => (
            <option key={p.month}>{p.month}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted" />
      </div>

      <div className="mt-3 rounded-2xl bg-white p-4">
        {!past ? (
          <>
            <p className="text-xs text-brand-muted">Approved pay so far</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-brand-ink">RM {Math.round(hours * HOURLY_RATE).toLocaleString()}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-brand-ink">
              <span>{monthAssignments.length} sessions</span>
              <span>{Math.round(hours)} hours</span>
              <span className="ml-auto rounded-full bg-brand-amber-light px-2 py-0.5 text-xs font-medium text-brand-amber">Paid at month-end</span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-brand-muted">Paid</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-brand-ink">RM {past.pay.toLocaleString()}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-brand-ink">
              <span>{past.sessions} sessions</span>
              <span>{past.hours} hours</span>
            </div>
          </>
        )}
      </div>

      <p className="mb-2 mt-5 text-sm font-semibold text-brand-ink">Past payslips</p>
      <div className="space-y-2">
        {PAST_PAYSLIPS.map((p) => (
          <button
            key={p.month}
            onClick={() => setMonth(p.month)}
            className={`flex w-full items-center justify-between rounded-2xl p-3 text-left text-sm transition-colors ${
              month === p.month ? 'bg-brand-pink-light' : 'bg-white hover:bg-brand-pink-light'
            }`}
          >
            <div>
              <p className="font-medium text-brand-ink">{p.month}</p>
              <p className="text-xs text-brand-muted">
                {p.sessions} sessions · {p.hours} h
              </p>
            </div>
            <p className="font-semibold text-brand-ink">RM {p.pay.toLocaleString()}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StaffProfileScreen({
  staffMember,
  personaId,
  onPersonaChange,
}: {
  staffMember: Staff;
  personaId: string;
  onPersonaChange: (id: string) => void;
}) {
  const { clById } = useCLStore();
  const { company } = useSettings();
  const [open, setOpen] = useState<'particulars' | 'support' | null>('particulars');

  return (
    <div className="flex-1">
      <div className="text-center">
        <div className="mx-auto flex justify-center">
          <ProfileAvatar avatarKey={staffMember.id} name={staffMember.name} color={staffMember.avatarColor} size={72} />
        </div>
        <h3 className="mt-2 text-lg font-semibold text-brand-ink">{staffMember.name}</h3>
        <p className="text-xs text-brand-muted">
          {staffId(staffMember.id)} · {staffMember.phone}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="rounded-full bg-brand-lavender-light px-2.5 py-0.5 text-xs font-medium text-brand-lavender">
            {tierForCL(staffMember.completedAssignments)} tier
          </span>
          <span className="flex items-center gap-1 text-sm text-brand-ink">
            <Star size={13} className="fill-brand-amber text-brand-amber" /> {staffMember.rating}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <button
          onClick={() => setOpen(open === 'particulars' ? null : 'particulars')}
          aria-expanded={open === 'particulars'}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-3 text-sm font-medium text-brand-ink"
        >
          <span className="flex items-center gap-2">
            <IdCard size={15} className="text-brand-pink" /> My particulars
          </span>
          <ChevronDown size={14} className={`transition-transform ${open === 'particulars' ? 'rotate-180' : ''}`} />
        </button>
        {open === 'particulars' && (
          <dl className="space-y-1.5 rounded-2xl bg-white px-4 py-3 text-sm text-brand-ink">
            <div>
              <dt className="text-xs text-brand-muted">IC</dt>
              <dd>{staffMember.icNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Address</dt>
              <dd>{staffMember.address}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Languages</dt>
              <dd>{staffMember.languages.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted">Experience</dt>
              <dd>{staffMember.yearsExperience} years</dd>
            </div>
          </dl>
        )}

        <button
          onClick={() => setOpen(open === 'support' ? null : 'support')}
          aria-expanded={open === 'support'}
          className="flex w-full items-center justify-between rounded-2xl bg-white p-3 text-sm font-medium text-brand-ink"
        >
          <span className="flex items-center gap-2">
            <MessageCircle size={15} className="text-brand-pink" /> Support
          </span>
          <ChevronDown size={14} className={`transition-transform ${open === 'support' ? 'rotate-180' : ''}`} />
        </button>
        {open === 'support' && (
          <div className="rounded-2xl bg-white px-4 py-3 text-sm">
            <a href={telHref(company.phone)} className="flex items-center gap-2 text-brand-ink hover:text-brand-pink">
              <Phone size={14} /> Call the spa · {company.phone}
            </a>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-brand-lavender-light p-3">
        <label htmlFor="demo-persona" className="mb-1.5 block text-sm font-medium text-brand-lavender-dark">
          Demo persona
        </label>
        <select
          id="demo-persona"
          value={personaId}
          onChange={(e) => onPersonaChange(e.target.value)}
          className="w-full rounded-full bg-white px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
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

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
        <LogOut size={14} /> Log out
      </button>
    </div>
  );
}

// ---------- Session flow (check-in, treatment checklist with photo proof, signed form) ----------

type SessionStage = 'checkin' | 'checklist' | 'final-photo' | 'completed';

/** A running clock (m:ss or h:mm:ss). */
function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` // taste-skill-ignore: clock
    : `${m}:${String(s).padStart(2, '0')}`; // taste-skill-ignore: clock
}

function ElapsedClock({ seconds }: { seconds: number }) {
  return (
    <div className="mt-2 flex items-center gap-1.5 self-start rounded-full bg-brand-ink px-2.5 py-1 text-xs font-semibold tabular-nums text-white">
      <Clock size={12} /> {formatElapsed(seconds)}
    </div>
  );
}

function SessionFlow({
  assignment,
  staffMember,
  myAssignments,
  onClose,
}: {
  assignment: Assignment;
  staffMember: Staff;
  myAssignments: Assignment[];
  onClose: () => void;
}) {
  const { packageById } = useSettings();
  const { clientById } = useClientStore();
  const client = clientById(assignment.clientId);
  const pkg = packageById(assignment.packageId);
  const checklistLabels = pkg ? pkg.treatmentSteps : [];
  const minutes = sessionMinutes(assignment);

  const [stage, setStage] = useState<SessionStage>('checkin');
  // Demo only: the check-in selfie is simulated, so no camera or file upload is involved.
  const [selfie, setSelfie] = useState<'none' | 'taking' | 'taken'>('none');
  const [items, setItems] = useState<{ label: string; photoUrl?: string; done: boolean }[]>(
    checklistLabels.map((label) => ({ label, done: false })),
  );
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalElapsed, setFinalElapsed] = useState(0);

  useEffect(() => {
    if (startedAt === null || stage === 'completed') return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [startedAt, stage]);

  const doneCount = items.filter((i) => i.done).length;
  const allDone = items.length > 0 && doneCount === items.length;
  const remaining = items.length - doneCount;

  const otherSessionsToday = myAssignments.filter(
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

  if (stage === 'checkin') {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader current={1} total={3} label="Check in" onBack={onClose} />
        <div className="mt-3 rounded-2xl bg-white p-4">
          <p className="text-base font-semibold text-brand-ink">{client?.name}</p>
          <p className="text-sm text-brand-ink">
            {pkg?.name} · {minutes} min
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-brand-muted">
            <Clock size={11} /> {formatTime12(assignment.startTime)} to {formatTime12(assignment.endTime)}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-muted">
            <MapPin size={11} /> {assignment.location}
          </p>
          {client?.notes && <p className="mt-3 rounded-xl bg-brand-cream px-3 py-2 text-xs text-brand-ink">{client.notes}</p>}
        </div>
        <div className="mt-3 rounded-2xl bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-ink">
            <MapPin size={16} className="text-brand-pink" /> Ready to check in
          </div>
          <p className="mt-0.5 text-xs text-brand-muted">GPS location verified</p>
          <button
            type="button"
            disabled={selfie !== 'none'}
            onClick={() => {
              setSelfie('taking');
              window.setTimeout(() => setSelfie('taken'), 700);
            }}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-brand-cream px-3 py-2.5 text-left text-sm text-brand-ink transition-colors enabled:hover:bg-brand-pink-light"
          >
            <span className="flex items-center gap-1.5">
              <Camera size={14} /> {selfie === 'taken' ? 'Selfie taken' : selfie === 'taking' ? 'Taking selfie…' : 'Take a selfie to check in'}
            </span>
            {selfie === 'taken' ? (
              <Avatar name={staffMember.name} color={staffMember.avatarColor} size={32} />
            ) : (
              <ShieldCheck size={14} className="text-brand-muted" />
            )}
          </button>
          <p className="mt-1.5 text-xs text-brand-muted">Demo: the selfie is simulated, no camera needed.</p>
        </div>
        <button
          onClick={() => {
            setStartedAt(Date.now());
            setStage('checklist');
          }}
          disabled={checklistLabels.length === 0 || selfie !== 'taken'}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-40"
        >
          Check in and start session
        </button>
      </div>
    );
  }

  if (stage === 'checklist') {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader current={2} total={3} label="Treatment checklist" onBack={() => setStage('checkin')} />
        <ElapsedClock seconds={elapsed} />
        <p className="mt-3 text-sm text-brand-ink">
          {pkg?.shortName ?? 'Treatment'} · {doneCount} of {items.length} steps done
        </p>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-brand-lavender transition-[width] duration-300"
            style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-brand-muted">Take one photo per step, then mark it done.</p>

        <ol className="mt-3 flex-1 space-y-2">
          {items.map((item, i) => (
            <li key={item.label} className={`rounded-2xl p-3 ${item.done ? 'bg-brand-lavender-light' : 'bg-white'}`}>
              <div className="flex items-center gap-2">
                {item.done ? (
                  <CheckCircle2 size={16} className="shrink-0 text-brand-lavender" />
                ) : (
                  <Circle size={16} className="shrink-0 text-brand-muted" />
                )}
                <p className="text-sm text-brand-ink">{item.label}</p>
                {item.done && item.photoUrl && <img src={item.photoUrl} alt="" className="ml-auto h-7 w-7 rounded-lg object-cover" />}
              </div>
              {!item.done && (
                <div className="mt-2 flex items-center gap-2 pl-6">
                  {!item.photoUrl ? (
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1.5 text-xs font-medium text-brand-ink transition-colors hover:bg-brand-pink-light">
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
                      <img src={item.photoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
                      <span className="text-xs text-brand-lavender">Photo attached</span>
                      <button
                        onClick={() => markDone(i)}
                        className="ml-auto rounded-full bg-brand-lavender px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-lavender-dark"
                      >
                        Mark done
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>

        <button
          disabled={!allDone}
          onClick={() => setStage('final-photo')}
          className="mt-4 w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-30"
        >
          {allDone ? 'Finish treatment' : `${remaining} ${remaining === 1 ? 'step' : 'steps'} to go`}
        </button>
      </div>
    );
  }

  if (stage === 'final-photo') {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader current={3} total={3} label="Signed session form" onBack={() => setStage('checklist')} />
        <ElapsedClock seconds={elapsed} />
        <p className="mt-3 text-sm text-brand-ink">
          Ask {client?.name.split(' ')[0] ?? 'the customer'} to sign the session form, then take a photo of it to close the session.
        </p>
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6">
          {formPhotoUrl ? (
            <>
              <img src={formPhotoUrl} alt="Signed session form" className="h-28 w-28 rounded-xl object-cover" />
              <p className="text-sm font-medium text-brand-ink">Form photo attached</p>
            </>
          ) : (
            <>
              <FileSignature size={40} className="text-brand-lavender" />
              <p className="text-center text-sm text-brand-muted">Photograph the signed form, flat and in good light</p>
            </>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light">
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
            setStage('completed');
          }}
          className="mt-4 w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-30"
        >
          Complete session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center px-2 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-pink text-white">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-brand-ink">Session complete</h3>
        <p className="mt-2 max-w-[260px] text-sm text-brand-ink">
          <span className="font-semibold">{pkg?.name}</span> for <span className="font-semibold">{client?.name}</span>, all{' '}
          {items.length} treatment steps photographed.
        </p>

        <div className="mt-4 grid w-full grid-cols-2 gap-2 rounded-2xl bg-white p-4 text-left">
          <div>
            <p className="text-xl font-semibold tabular-nums tracking-tight text-brand-ink">{formatElapsed(finalElapsed)}</p>
            <p className="text-xs text-brand-muted">Time taken</p>
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight text-brand-ink">{minutes} min</p>
            <p className="text-xs text-brand-muted">Booked</p>
          </div>
        </div>

        <p className="mt-4 max-w-[260px] text-xs text-brand-muted">
          Sent to the front desk for review. Your selfie, step photos and the signed form are attached.
        </p>
      </div>

      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
        <Briefcase size={14} className="text-brand-pink" /> Your other sessions today
      </p>
      {otherSessionsToday.length === 0 ? (
        <p className="rounded-2xl bg-white p-3 text-center text-sm text-brand-muted">
          Nothing else today. Enjoy the rest of your day, {staffMember.name.split(' ')[0]}.
        </p>
      ) : (
        <div className="space-y-2">
          {otherSessionsToday.map((a) => {
            const upClient = clientById(a.clientId);
            const upPkg = packageById(a.packageId);
            return (
              <div key={a.id} className="flex items-center justify-between rounded-2xl bg-white p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-ink">{upClient?.name}</p>
                  <p className="text-xs text-brand-muted">
                    {upPkg?.shortName} · {sessionMinutes(a)} min · {a.location}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-pink-light px-2 py-0.5 text-xs font-medium text-brand-pink">
                  {formatTime12(a.startTime)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-4 w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
      >
        Back to home
      </button>
    </div>
  );
}

// ---------- Client review form (Phase 1) ----------

const reviewCategories = [
  { key: 'skill', label: 'Staff skill', sub: 'Technique, and how well she listened to what you needed' },
  { key: 'pressure', label: 'Pressure and comfort', sub: 'The pressure felt right and you were at ease' },
  { key: 'cleanliness', label: 'Cleanliness of room', sub: 'Room, towels and linen were fresh and tidy' },
  { key: 'value', label: 'Punctuality and value', sub: 'Started on time and was worth the price' },
] as const;

function ClientReviewWebScreen({
  staffMember,
  client,
  assignment,
  pkg,
}: {
  staffMember: Staff;
  client: Client;
  assignment?: Assignment;
  pkg?: Package;
}) {
  const { addReview } = useCLStore();
  const { company } = useSettings();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [signed, setSigned] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstName = client.name.split(' ')[0];

  const allRated = reviewCategories.every((c) => ratings[c.key] > 0);
  const avgRating = allRated ? (Object.values(ratings).reduce((s, v) => s + v, 0) / reviewCategories.length).toFixed(1) : null;
  const canSubmit = allRated && signed;

  function submitReview() {
    if (!canSubmit || !avgRating) return;
    // Stored against the staff member for the admin side only; the staff member app never shows ratings.
    addReview(staffMember.id, {
      rating: Number(avgRating),
      text: feedback.trim() || undefined,
      date: TODAY_STR,
      clientName: client.name,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[560px] flex-col items-center justify-center bg-brand-pink-light px-8 py-20 text-center">
        <HoneySpaMark size={72} />
        <h3 className="mt-6 text-2xl font-semibold text-brand-ink">Thank you, {firstName}</h3>
        <p className="mt-2 max-w-sm text-sm text-brand-ink">
          Your review goes to the spa manager only, and helps us keep every session at its best. You can close this page now.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
      <div className="flex flex-col bg-brand-pink-light px-7 py-9">
        <Logo size={44} className="self-start" />
        <h2 className="mt-8 text-2xl font-semibold leading-tight tracking-tight text-brand-ink">How was your session, {firstName}?</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink">
          A quick, honest review helps us keep every treatment at its best. Your ratings go to the spa manager only,
          never to the CL or spa staff who looked after you.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white p-4">
          <Avatar name={staffMember.name} color={staffMember.avatarColor} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-brand-ink">{staffMember.name}</p>
            <p className="truncate text-xs text-brand-ink">
              {pkg?.name ?? 'Treatment'}
              {assignment ? ` · ${sessionMinutes(assignment)} min` : ''}
            </p>
            {assignment && <p className="truncate text-xs text-brand-muted">{formatDateLabel(assignment.date)}</p>}
          </div>
        </div>

        {avgRating && (
          <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-pink">
            <Star size={16} className="fill-brand-pink text-brand-pink" /> {avgRating} average so far
          </div>
        )}

        <div className="mt-auto pt-10">
          <p className="text-sm text-brand-ink">Something urgent? Call us instead of waiting on this form.</p>
          <a
            href={telHref(company.phone)}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-pink transition-colors hover:bg-brand-cream"
          >
            <Phone size={14} /> Call {company.phone}
          </a>
        </div>
      </div>

      <div className="space-y-8 px-7 py-9">
        <div>
          <p className="mb-3 text-lg font-semibold text-brand-ink">Rate your session</p>
          <div className="space-y-2">
            {reviewCategories.map((c) => (
              <div key={c.key} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-cream px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-ink">{c.label}</p>
                  <p className="text-xs text-brand-muted">{c.sub}</p>
                </div>
                <div className="flex shrink-0 gap-1.5" role="radiogroup" aria-label={c.label}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      role="radio"
                      aria-checked={ratings[c.key] === n}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      onClick={() => setRatings((r) => ({ ...r, [c.key]: n }))}
                      className="rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink active:scale-95"
                    >
                      <Star
                        size={24}
                        className={(ratings[c.key] ?? 0) >= n ? 'fill-brand-pink text-brand-pink' : 'fill-transparent text-brand-pink/30'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="review-feedback" className="text-lg font-semibold text-brand-ink">
            Tell us more
          </label>
          <p className="mb-2 text-sm text-brand-muted">Optional, and honesty is always welcome.</p>
          <textarea
            id="review-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What went well? What could be better?"
            rows={4}
            className="w-full resize-none rounded-2xl bg-brand-cream p-4 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        <div>
          <p className="mb-3 text-lg font-semibold text-brand-ink">Confirm and sign</p>
          <button
            onClick={() => setSigned((s) => !s)}
            aria-pressed={signed}
            className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left text-sm font-medium transition-colors ${
              signed ? 'bg-brand-lavender-light text-brand-lavender-dark' : 'bg-brand-cream text-brand-ink hover:bg-brand-pink-light'
            }`}
          >
            {signed ? <CheckCircle2 size={20} className="shrink-0 text-brand-lavender" /> : <FileSignature size={20} className="shrink-0 text-brand-pink" />}
            {signed ? 'Signed. Thank you.' : 'Tap to sign and confirm this session took place as described'}
          </button>
        </div>

        <button
          disabled={!canSubmit}
          onClick={submitReview}
          className="w-full rounded-full bg-brand-pink py-4 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-30 disabled:hover:bg-brand-pink"
        >
          Send my review
        </button>
      </div>
    </div>
  );
}

// ---------- Client app (Phase 2 preview) ----------

function ClientHomeScreen({
  client,
  pkg,
  staffMember,
  onGoTo,
}: {
  client: Client;
  pkg?: Package;
  staffMember: Staff;
  onGoTo: (tab: ClientTab) => void;
}) {
  const { company } = useSettings();
  const nextBooking = assignments
    .filter((a) => a.clientId === client.id && a.date > TODAY_STR && a.status !== 'cancelled')
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];
  const tier = pkg ? bookedTier(pkg, client.packageMinutes?.[pkg.id]) : undefined;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <Logo size={32} />
        <button aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white">
          <Bell size={16} className="text-brand-ink" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-pink" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ProfileAvatar avatarKey={client.id} name={client.name} size={40} />
        <div>
          <p className="text-xs text-brand-muted">Good morning</p>
          <p className="text-base font-semibold text-brand-ink">{client.name.split(' ')[0]}</p>
        </div>
      </div>

      {pkg && (
        <div className="mt-4 rounded-2xl bg-brand-pink p-4 text-white">
          <p className="text-xs text-white/80">Your next session</p>
          <div className="mt-2 flex items-center gap-3">
            <PackageArt pkg={pkg} size={44} rounded="rounded-xl" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{pkg.name}</p>
              <p className="text-xs text-white/85">
                {tier ? `${tier.minutes} min · ` : ''}with {staffMember.name.split(' ')[0]}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/90">
            <CalendarDays size={12} />
            {nextBooking ? `${formatDateLabel(nextBooking.date)}, ${formatTime12(nextBooking.startTime)}` : 'Not booked yet'}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/90">
            <MapPin size={12} /> {nextBooking?.location ?? 'Honey Spa, Bangi Sentral'}
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-white p-4">
        <button onClick={() => onGoTo('payments')} className="text-left">
          <p className="text-xs text-brand-muted">To pay</p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight text-brand-ink">{pkg && tier ? priceLabel(pkg, tier.price) : 'RM 0'}</p>
          <p className="text-xs text-brand-muted">After your session</p>
        </button>
        <div>
          <p className="text-xs text-brand-muted">Messages</p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight text-brand-ink">2 unread</p>
          <p className="text-xs text-brand-muted">From the front desk</p>
        </div>
      </div>

      <div className="mt-3 space-y-1 rounded-2xl bg-white p-2">
        {[
          { label: 'Reschedule', icon: Repeat, onClick: () => onGoTo('bookings') },
          { label: 'Message us', icon: MessageCircle, onClick: undefined },
          { label: 'Make a payment', icon: CreditCard, onClick: () => onGoTo('payments') },
        ].map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-brand-ink transition-colors hover:bg-brand-cream"
          >
            <a.icon size={16} className="text-brand-pink" /> {a.label}
            <ChevronRight size={14} className="ml-auto text-brand-muted" />
          </button>
        ))}
        <a
          href={telHref(company.phone)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-brand-ink transition-colors hover:bg-brand-cream"
        >
          <Phone size={16} className="text-brand-pink" /> Call us
          <span className="ml-auto text-xs text-brand-muted">{company.phone}</span>
        </a>
      </div>
    </div>
  );
}

function ClientBookingsScreen({ client, onAddTreatment }: { client: Client; onAddTreatment: (packageId: string) => void }) {
  const { packages } = useSettings();
  const owned = new Set(client.packageIds);
  const addOns = packages.filter((p) => !owned.has(p.id)).slice(0, 5);

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My bookings</h3>
      <div className="mt-3 space-y-2">
        {client.packageIds.length === 0 && <p className="text-sm text-brand-muted">No treatments yet. Add one below.</p>}
        {client.packageIds.map((pid) => {
          const pkg = packages.find((p) => p.id === pid);
          if (!pkg) return null;
          const tier = bookedTier(pkg, client.packageMinutes?.[pid]);
          return (
            <div key={pid} className="flex items-center gap-3 rounded-2xl bg-white p-3">
              <PackageArt pkg={pkg} size={44} rounded="rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-ink">{pkg.name}</p>
                <p className="text-xs text-brand-muted">
                  {tier ? `${tier.minutes} min · ` : ''}
                  {priceLabel(pkg, tier?.price)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mb-2 mt-5 text-sm font-semibold text-brand-ink">Add a treatment</p>
      <div className="space-y-2">
        {addOns.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
            <PackageArt pkg={p} size={44} rounded="rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-ink">{p.name}</p>
              <p className="truncate text-xs text-brand-muted">
                {p.estimated ? 'Price to confirm' : p.tiers[0] ? `From ${formatRM(p.tiers[0].price)}` : p.summary}
              </p>
            </div>
            <button
              onClick={() => onAddTreatment(p.id)}
              className="shrink-0 rounded-full bg-brand-pink-light px-3 py-1.5 text-xs font-semibold text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
            >
              Add
            </button>
          </div>
        ))}
        {addOns.length === 0 && <p className="text-sm text-brand-muted">You have every treatment on the menu booked.</p>}
      </div>
    </div>
  );
}

type PurchaseStep = 'detail' | 'payment' | 'success';

const paymentMethods = [
  { id: 'card', label: 'Credit or debit card', hint: '•••• 4821', icon: CreditCard },
  { id: 'fpx', label: 'FPX online banking', hint: 'Maybank2u', icon: Landmark },
  { id: 'ewallet', label: "Touch 'n Go eWallet", hint: 'Linked', icon: Smartphone },
  { id: 'spa', label: 'Pay at the spa', hint: 'Cash, card or DuitNow QR after your session', icon: Store },
] as const;

/**
 * Real add-on treatment purchase flow for the Client App. Unlike the rest of this tab (a Phase 2
 * preview), this writes through to the live ClientStore via addPackageToClient, the same action the
 * admin-side add-on picker on ClientProfilePage uses, so a purchase here shows up on both the
 * customer's "My bookings" list and the admin side.
 */
function AddOnPurchaseFlow({ client, packageId, onClose }: { client: Client; packageId: string; onClose: () => void }) {
  const { packageById } = useSettings();
  const { addPackageToClient } = useClientStore();
  const { logAction } = useActivityLog();
  const pkg = packageById(packageId);

  const [step, setStep] = useState<PurchaseStep>('detail');
  const [tierMinutes, setTierMinutes] = useState<number | null>(pkg?.tiers[0]?.minutes ?? null);
  const [methodId, setMethodId] = useState<(typeof paymentMethods)[number]['id']>('card');
  const [processing, setProcessing] = useState(false);

  if (!pkg) return null;

  const selectedTier = pkg.tiers.find((t) => t.minutes === tierMinutes) ?? null;
  const price = selectedTier?.price ?? 0;
  const hasDeposit = pkg.bookingDepositPct > 0;
  const deposit = Math.round((price * pkg.bookingDepositPct) / 100);
  const payAtSpa = methodId === 'spa';
  const dueNow = payAtSpa ? 0 : hasDeposit ? deposit : price;
  const isRequest = !!pkg.estimated;

  function confirm() {
    setProcessing(true);
    window.setTimeout(() => {
      addPackageToClient(client.id, pkg!.id, tierMinutes ?? undefined);
      logAction(
        client.name,
        isRequest ? 'Requested add-on treatment' : 'Booked add-on treatment',
        `${pkg!.name}${selectedTier ? ` · ${selectedTier.minutes} min` : ''} via customer app`,
      );
      setProcessing(false);
      setStep('success');
    }, 700);
  }

  if (step === 'success') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-lavender text-white">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-brand-ink">{isRequest ? 'Request sent' : 'Treatment added'}</h3>
        <p className="mt-2 max-w-[250px] text-sm text-brand-ink">
          <span className="font-semibold">{pkg.name}</span>
          {selectedTier ? ` (${selectedTier.minutes} min)` : ''} is now in {client.name.split(' ')[0]}'s bookings.
        </p>
        <p className="mt-3 max-w-[250px] text-xs text-brand-muted">
          {isRequest
            ? 'The front desk will confirm the price and a time with you on WhatsApp.'
            : 'A confirmation is on its way by WhatsApp. The front desk will be in touch to book a time.'}
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full max-w-[250px] rounded-full bg-brand-pink py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          Back to my bookings
        </button>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="flex flex-1 flex-col">
        <FlowHeader current={2} total={2} label="Payment" onBack={() => setStep('detail')} />

        <div className="mt-3 rounded-2xl bg-white p-3">
          <div className="flex items-center gap-2.5">
            <PackageArt pkg={pkg} size={36} rounded="rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-ink">{pkg.name}</p>
              <p className="text-xs text-brand-muted">{selectedTier ? `${selectedTier.minutes} min` : 'Per session'}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-brand-ink">{formatRM(price)}</p>
          </div>
          {hasDeposit && (
            <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-cream px-3 py-2 text-xs">
              <span className="text-brand-ink">Deposit due today ({pkg.bookingDepositPct}%)</span>
              <span className="font-semibold text-brand-pink">{formatRM(deposit)}</span>
            </div>
          )}
        </div>

        <p className="mb-2 mt-4 text-sm font-semibold text-brand-ink">Pay with</p>
        <div className="space-y-2" role="radiogroup" aria-label="Payment method">
          {paymentMethods.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={methodId === m.id}
              onClick={() => setMethodId(m.id)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
                methodId === m.id ? 'bg-brand-pink-light' : 'bg-white hover:bg-brand-pink-light'
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
          onClick={confirm}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-60"
        >
          {processing ? 'Processing…' : payAtSpa ? 'Confirm booking' : `Pay ${formatRM(dueNow)} now`}
        </button>
        <p className="mt-2 text-center text-xs text-brand-muted">
          {payAtSpa
            ? 'Nothing to pay now. Settle up at the counter after your session.'
            : hasDeposit
              ? 'The balance is paid at the spa after your session.'
              : 'Paid in full. Nothing more to pay on the day.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader current={1} total={isRequest ? 1 : 2} label="Treatment details" onBack={onClose} />

      <div className="mt-3 flex items-center gap-3">
        <PackageArt pkg={pkg} size={52} rounded="rounded-xl" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-ink">{pkg.name}</p>
          <p className="text-xs text-brand-muted">{pkg.durationEstimate}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-brand-ink">{pkg.summary}</p>

      {pkg.treatmentSteps.length > 0 && (
        <ul className="mt-3 space-y-1">
          {pkg.treatmentSteps.slice(0, 4).map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-xs text-brand-ink">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-brand-lavender" /> {item}
            </li>
          ))}
        </ul>
      )}

      {pkg.tiers.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-brand-ink">Session length</p>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Session length">
            {pkg.tiers.map((t) => (
              <button
                key={t.minutes}
                role="radio"
                aria-checked={tierMinutes === t.minutes}
                onClick={() => setTierMinutes(t.minutes)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  tierMinutes === t.minutes ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
                }`}
              >
                {t.minutes} min{pkg.estimated ? '' : ` · ${formatRM(t.price)}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-3 text-sm">
        <span className="text-brand-ink">Total</span>
        <span className="font-semibold text-brand-ink">{priceLabel(pkg, selectedTier?.price)}</span>
      </div>
      {isRequest && (
        <p className="mt-2 text-xs text-brand-muted">
          We have not published a price for this treatment yet. The front desk will confirm it with you before your session.
        </p>
      )}

      <button
        disabled={(pkg.tiers.length > 0 && !tierMinutes) || processing}
        onClick={() => (isRequest ? confirm() : setStep('payment'))}
        className="mt-auto w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-30"
      >
        {isRequest ? (processing ? 'Sending…' : 'Send booking request') : 'Continue to payment'}
      </button>
    </div>
  );
}

function ClientReviewsScreen({ client }: { client: Client }) {
  const { clById } = useCLStore();
  const { packageById } = useSettings();
  const sessions = assignments
    .filter((a) => a.clientId === client.id && (a.status === 'completed' || (a.date === TODAY_STR && a.status !== 'cancelled')))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">My reviews</h3>
      <p className="text-xs text-brand-muted">Rate your sessions. Only the spa manager sees your ratings.</p>
      <div className="mt-3 space-y-2">
        {sessions.map((a) => {
          const staffMember = clById(a.clId);
          const reviewed = a.status === 'completed';
          return (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-2xl bg-white p-3">
              <div className="flex min-w-0 items-center gap-2">
                {staffMember && <Avatar name={staffMember.name} color={staffMember.avatarColor} size={30} />}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-ink">{packageById(a.packageId)?.shortName ?? 'Session'}</p>
                  <p className="text-xs text-brand-muted">
                    {formatDateLabel(a.date)} · {staffMember?.name.split(' ')[0]}
                  </p>
                </div>
              </div>
              {reviewed ? (
                <span className="flex shrink-0 items-center gap-1 text-sm text-brand-ink">
                  <Star size={13} className="fill-brand-amber text-brand-amber" /> 5.0
                </span>
              ) : (
                <button className="shrink-0 rounded-full bg-brand-pink px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-pink-dark">
                  Review
                </button>
              )}
            </div>
          );
        })}
        {sessions.length === 0 && <p className="py-4 text-center text-sm text-brand-muted">No sessions to review yet.</p>}
      </div>
    </div>
  );
}

function ClientPaymentsScreen({ client }: { client: Client }) {
  const { packageById } = useSettings();
  const pkg = packageById(client.packageIds[0]);
  const tier = pkg ? bookedTier(pkg, client.packageMinutes?.[pkg.id]) : undefined;
  const history = assignments
    .filter((a) => a.clientId === client.id && a.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-brand-ink">Payments</h3>

      <div className="mt-3 rounded-2xl bg-white p-4">
        <p className="text-xs text-brand-muted">Next session</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-brand-ink">{pkg && tier ? priceLabel(pkg, tier.price) : 'RM 0'}</p>
        <p className="mt-1 text-sm text-brand-ink">
          {pkg?.shortName}
          {tier ? ` · ${tier.minutes} min` : ''}
        </p>
        <p className="mt-0.5 text-xs text-brand-muted">Pay in the app now, or at the counter after your session.</p>
        <button className="mt-3 w-full rounded-full bg-brand-pink py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark">
          Pay now
        </button>
      </div>

      <p className="mb-2 mt-5 text-sm font-semibold text-brand-ink">Saved methods</p>
      <div className="space-y-2">
        {paymentMethods
          .filter((m) => m.id !== 'spa')
          .map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
              <m.icon size={16} className="text-brand-lavender" />
              <p className="flex-1 text-sm text-brand-ink">{m.label}</p>
              <p className="text-xs text-brand-muted">{m.hint}</p>
            </div>
          ))}
      </div>

      <p className="mb-2 mt-5 text-sm font-semibold text-brand-ink">History</p>
      <div className="space-y-2">
        {history.map((a) => {
          const p = packageById(a.packageId);
          const t = p ? bookedTier(p, sessionMinutes(a)) : undefined;
          return (
            <div key={a.id} className="flex items-center justify-between rounded-2xl bg-white p-3">
              <div>
                <p className="text-sm font-medium text-brand-ink">{p?.shortName ?? 'Session'}</p>
                <p className="text-xs text-brand-muted">
                  {formatDateLabel(a.date)} · Paid at the spa
                </p>
              </div>
              <p className="text-sm font-semibold text-brand-ink">{p && t ? priceLabel(p, t.price) : '–'}</p>
            </div>
          );
        })}
        {history.length === 0 && <p className="py-4 text-center text-sm text-brand-muted">No payments yet.</p>}
      </div>
    </div>
  );
}

function ClientProfileScreen({ client }: { client: Client }) {
  return (
    <div className="flex-1">
      <div className="text-center">
        <div className="flex justify-center">
          <ProfileAvatar avatarKey={client.id} name={client.name} size={72} />
        </div>
        <h3 className="mt-2 text-lg font-semibold text-brand-ink">{client.name}</h3>
        <p className="text-xs text-brand-muted">{client.location}</p>
      </div>

      <dl className="mt-4 space-y-3 rounded-2xl bg-white p-4">
        <div>
          <dt className="text-xs text-brand-muted">Phone</dt>
          <dd className="text-sm text-brand-ink">{client.phone}</dd>
        </div>
        <div>
          <dt className="text-xs text-brand-muted">Email</dt>
          <dd className="text-sm text-brand-ink">{client.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-brand-muted">Address</dt>
          <dd className="text-sm text-brand-ink">{client.address}</dd>
        </div>
        <div>
          <dt className="text-xs text-brand-muted">Preferred date</dt>
          <dd className="text-sm text-brand-ink">{formatDateLabel(client.preferredDate)}</dd>
        </div>
      </dl>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark">
        <MessageCircle size={15} /> Message Honey Spa
      </button>
    </div>
  );
}
