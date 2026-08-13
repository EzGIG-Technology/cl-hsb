import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

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
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">{monthLabel}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-white/50">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {cells.map(({ day, inMonth, date }, i) => {
          const selected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={i}
              onClick={() => onSelect?.(date)}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                selected
                  ? 'bg-white font-semibold text-brand-maroon-dark'
                  : isToday
                    ? 'border border-white/60 text-white'
                    : inMonth
                      ? 'text-white/85 hover:bg-white/10'
                      : 'text-white/30'
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
