interface Segment {
  label: string;
  count: number;
  color: string;
  /** false = legend-only row (e.g. a backlog count that isn't a slice of the ring's total) */
  arc?: boolean;
}

/** Donut-chart engagement widget (ring + legend), styled after "Attendance today" cards. */
export function EngagementDonut({
  title,
  periodLabel,
  total,
  totalLabel,
  segments,
}: {
  title: string;
  periodLabel: string;
  total: number;
  totalLabel: string;
  segments: Segment[];
}) {
  const arcSegments = segments.filter((s) => s.arc !== false);
  const arcTotal = arcSegments.reduce((sum, s) => sum + s.count, 0) || 1;

  let acc = 0;
  const stops = arcSegments.map((s) => {
    const start = (acc / arcTotal) * 360;
    acc += s.count;
    const end = (acc / arcTotal) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  });
  const gradient = stops.length ? `conic-gradient(${stops.join(', ')})` : '#e5e7eb';

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-brand-ink">{title}</h3>
        <span className="text-xs text-brand-muted">{periodLabel}</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-2xl font-semibold text-brand-ink">{total}</span>
            <span className="text-[10px] text-brand-muted">{totalLabel}</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-brand-ink">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-medium text-brand-ink">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
