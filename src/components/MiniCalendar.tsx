import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function buildMonthGrid(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  // Convert JS Sunday=0 start to Monday=0 start
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const cells: { day: number; inMonth: boolean; date: Date }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false, date: new Date(year, monthIndex - 1, daysInPrevMonth - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, date: new Date(year, monthIndex, d) });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ day: next.getDate(), inMonth: false, date: next });
  }
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface MiniCalendarProps {
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
}

export function MiniCalendar({ selectedDate, onSelect }: MiniCalendarProps) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(selectedDate ?? today));

  const cells = buildMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const monthLabel = cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-base font-semibold text-brand-ink">{monthLabel}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-cream text-brand-ink transition-colors hover:bg-brand-pink-light hover:text-brand-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-cream text-brand-ink transition-colors hover:bg-brand-pink-light hover:text-brand-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-xs text-brand-muted">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map(({ day, inMonth, date }, i) => {
          const selected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={i}
              onClick={() => onSelect?.(date)}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                selected
                  ? 'bg-brand-pink font-semibold text-white'
                  : isToday
                    ? 'bg-brand-pink-light font-semibold text-brand-pink'
                    : inMonth
                      ? 'text-brand-ink hover:bg-brand-cream'
                      : 'text-brand-muted/40'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
