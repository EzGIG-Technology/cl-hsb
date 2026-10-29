interface Segment {
  label: string;
  count: number;
  color: string;
  /** false = legend-only row (e.g. a backlog count that isn't a slice of the ring's total) */
  arc?: boolean;
}

/** Session-mix ring with its legend: a flat white card, brand colours, the ring itself is the data. */
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
  const hasData = arcSegments.some((s) => s.count > 0);
  // The conic fill is the chart itself (hard stops, one per segment), not a decorative gradient.
  const ring = hasData ? `conic-gradient(${stops.join(', ')})` : '#f3e4ec'; // taste-skill-ignore: chart data

  return (
    <div className="rounded-2xl bg-white p-6">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold text-brand-ink">{title}</h3>
        <span className="text-sm text-brand-muted">{periodLabel}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: ring }}>
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-3xl font-semibold tracking-tight text-brand-ink">{total}</span>
            <span className="text-xs text-brand-muted">{totalLabel}</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2.5">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-brand-ink">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold text-brand-ink">{s.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
