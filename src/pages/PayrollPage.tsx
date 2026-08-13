import { useMemo, useState } from 'react';
import { Download, CheckCheck } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Avatar, Badge, formatRM } from '../components/ui';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useCLStore } from '../store/CLStore';
import { useActivityLog } from '../store/ActivityLogContext';

const HOURLY_RATE = 22;

function hoursFor(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

export default function PayrollPage() {
  const { assignments } = useAssignmentStore();
  const { cls } = useCLStore();
  const { logAction } = useActivityLog();
  const [paidMonth, setPaidMonth] = useState(false);

  const monthAssignments = assignments.filter((a) => a.date.startsWith('2026-08') && a.status === 'completed');

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
        const status = allReleased ? 'Approved' : anyReview ? 'Awaiting Review' : 'Pending Month-End';
        return { cl, hours: Math.round(data.hours * 10) / 10, sessions: data.count, pay: Math.round(data.hours * HOURLY_RATE), status };
      })
      .filter((r) => r.cl);
  }, [monthAssignments, cls]);

  const approvedHours = rows.filter((r) => r.status === 'Approved').reduce((s, r) => s + r.hours, 0);
  const disputedHours = rows.filter((r) => r.status !== 'Approved').reduce((s, r) => s + r.hours, 0);
  const totalPay = rows.reduce((s, r) => s + r.pay, 0);

  function markAllPaid() {
    setPaidMonth(true);
    logAction('Admin Amy', 'Marked Aug 2026 payroll as paid', `${rows.length} caregivers, ${formatRM(totalPay)}`);
  }

  return (
    <PageShell
      title="Hourly Payroll"
      subtitle="Aug 2026 — approved hours, disputed hours, and total pay by caregiver."
      headerAction={
        <div className="flex gap-2">
          <button
            onClick={() => logAction('Admin Amy', 'Exported payroll CSV', 'Aug 2026')}
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-brand-ink hover:bg-brand-cream"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => logAction('Admin Amy', 'Exported payroll Excel', 'Aug 2026')}
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-brand-ink hover:bg-brand-cream"
          >
            <Download size={14} /> Excel
          </button>
          <button
            onClick={markAllPaid}
            disabled={paidMonth}
            className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark disabled:opacity-40"
          >
            <CheckCheck size={14} /> {paidMonth ? 'Marked as Paid' : 'Mark Aug 2026 as Paid'}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Caregivers</p>
          <p className="mt-1 text-3xl font-semibold text-brand-ink">{rows.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Approved hours</p>
          <p className="mt-1 text-3xl font-semibold text-brand-green">{approvedHours}h</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Disputed / pending hours</p>
          <p className="mt-1 text-3xl font-semibold text-brand-amber">{disputedHours}h</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Total pay</p>
          <p className="mt-1 text-3xl font-semibold text-brand-ink">{formatRM(totalPay)}</p>
        </Card>
      </div>

      <Card className="mt-5 !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Caregiver</th>
                <th className="px-5 py-3 font-medium">Sessions</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium">Pay</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.cl!.id} className="border-t border-black/5">
                  <td className="flex items-center gap-2 px-5 py-3">
                    <Avatar name={r.cl!.name} color={r.cl!.avatarColor} size={26} />
                    {r.cl!.name}
                  </td>
                  <td className="px-5 py-3 text-brand-muted">{r.sessions}</td>
                  <td className="px-5 py-3 text-brand-muted">{r.hours}h</td>
                  <td className="px-5 py-3 text-brand-muted">{formatRM(r.pay)}</td>
                  <td className="px-5 py-3">
                    <Badge status={paidMonth ? 'completed' : r.status === 'Approved' ? 'confirmed' : r.status === 'Awaiting Review' ? 'pending' : 'upcoming'}>
                      {paidMonth ? 'Paid' : r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-brand-muted">
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
