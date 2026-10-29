import { useMemo, type ReactNode } from 'react';
import { Download, CheckCheck, Clock } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Avatar, Badge, formatRM } from '../components/ui';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useCLStore } from '../store/CLStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { HOURLY_RATE } from '../lib/clMetrics';
import { downloadCSV } from '../lib/csv';

function hoursFor(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

export default function PayrollPage() {
  const { assignments, markPaymentStatus } = useAssignmentStore();
  const { cls } = useCLStore();
  const { logAction } = useActivityLog();

  const monthAssignments = assignments.filter((a) => a.date.startsWith('2026-08') && a.status === 'completed');
  // Sessions nobody ever ran through session approval are eligible for month-end payout. Anything
  // sitting 'in-review' is left untouched here since that can also mean a live rejection, not
  // just an unreviewed session; only an approve/reject on Session records should resolve it.
  const unreviewed = monthAssignments.filter((a) => (a.paymentStatus ?? 'pending') === 'pending');

  const rows = useMemo(() => {
    const byCL: Record<string, { hours: number; count: number; paymentStatuses: string[] }> = {};
    monthAssignments.forEach((a) => {
      const entry = byCL[a.clId] ?? { hours: 0, count: 0, paymentStatuses: [] };
      entry.hours += hoursFor(a.startTime, a.endTime);
      entry.count += 1;
      entry.paymentStatuses.push(a.paymentStatus ?? 'pending');
      byCL[a.clId] = entry;
    });
    return Object.entries(byCL)
      .map(([clId, data]) => {
        const cl = cls.find((c) => c.id === clId);
        const allReleased = data.paymentStatuses.every((s) => s === 'released');
        const anyReview = data.paymentStatuses.some((s) => s === 'in-review');
        const status = allReleased ? 'Paid' : anyReview ? 'Awaiting review' : 'Pending month-end';
        return { cl, hours: Math.round(data.hours * 10) / 10, sessions: data.count, pay: Math.round(data.hours * HOURLY_RATE), status };
      })
      .filter((r) => r.cl);
  }, [monthAssignments, cls]);

  const approvedHours = rows.filter((r) => r.status === 'Paid').reduce((s, r) => s + r.hours, 0);
  const disputedHours = rows.filter((r) => r.status !== 'Paid').reduce((s, r) => s + r.hours, 0);
  const totalPay = rows.reduce((s, r) => s + r.pay, 0);

  function markAllPaid() {
    unreviewed.forEach((a) => markPaymentStatus(a.id, 'released'));
    logAction('Front Desk', 'Marked Aug 2026 payroll as paid', `${unreviewed.length} sessions released for payment`);
  }

  function exportCSV(kind: 'CSV' | 'Excel') {
    downloadCSV(`honeyspa-payroll-aug-2026.csv`, [
      ['Therapist', 'Sessions', 'Hours', 'Pay (RM)', 'Status'],
      ...rows.map((r) => [r.cl!.name, r.sessions, r.hours, r.pay, r.status]),
    ]);
    logAction('Front Desk', `Exported payroll ${kind}`, 'Aug 2026');
  }

  const secondaryButton =
    'flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink';

  return (
    <PageShell
      title="Payroll"
      subtitle={`August 2026. Session hours and pay for each therapist, at ${formatRM(HOURLY_RATE)} an hour.`}
      icon={Clock}
      headerAction={
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportCSV('CSV')} className={secondaryButton}>
            <Download size={15} /> CSV
          </button>
          <button onClick={() => exportCSV('Excel')} className={secondaryButton}>
            <Download size={15} /> Excel
          </button>
          <button
            onClick={markAllPaid}
            disabled={unreviewed.length === 0}
            className="flex items-center gap-1.5 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 disabled:opacity-40"
          >
            <CheckCheck size={15} /> {unreviewed.length === 0 ? 'All sessions paid' : 'Mark August as paid'}
          </button>
        </div>
      }
    >
      <Card className="grid grid-cols-1 gap-6 !p-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-sm text-brand-muted">Total pay this month</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-brand-pink">{formatRM(totalPay)}</p>
        </div>
        <Figure label="Paid hours" value={`${approvedHours}h`} tone="text-brand-lavender" />
        <Figure label="Hours awaiting review or month-end" value={`${disputedHours}h`} tone="text-brand-amber" />
        <Figure label="Therapists with sessions" value={rows.length} tone="text-brand-ink" />
      </Card>

      <h2 className="mb-4 mt-8 text-lg font-semibold text-brand-ink">By therapist</h2>
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="px-6 py-4 font-medium">Therapist</th>
                <th className="px-6 py-4 text-right font-medium">Sessions</th>
                <th className="px-6 py-4 text-right font-medium">Hours</th>
                <th className="px-6 py-4 text-right font-medium">Pay</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.cl!.id} className="border-t border-brand-cream">{/* taste-skill-ignore: table row */}
                  <td className="px-6 py-3.5">
                    <span className="flex items-center gap-2.5 font-medium text-brand-ink">
                      <Avatar name={r.cl!.name} color={r.cl!.avatarColor} size={30} />
                      {r.cl!.name}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right tabular-nums text-brand-ink">{r.sessions}</td>
                  <td className="px-6 py-3.5 text-right tabular-nums text-brand-ink">{r.hours}h</td>
                  <td className="px-6 py-3.5 text-right font-medium tabular-nums text-brand-ink">{formatRM(r.pay)}</td>
                  <td className="px-6 py-3.5">
                    <Badge status={r.status === 'Paid' ? 'completed' : r.status === 'Awaiting review' ? 'pending' : 'upcoming'}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-brand-muted">
                    No completed sessions this month yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-2" />
      </Card>
      <div className="h-6" />
    </PageShell>
  );
}

function Figure({ label, value, tone }: { label: string; value: ReactNode; tone: string }) {
  return (
    <div>
      <p className="text-sm text-brand-muted">{label}</p>
      <p className={`mt-2 text-4xl font-semibold tracking-tight tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
