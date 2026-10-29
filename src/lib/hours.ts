import { useEffect, useState } from 'react';

/** Honey Spa Bangi opens every day, 10.30am to 7.30pm (per its listings). Minutes after midnight. */
export const OPENS_AT = 10 * 60 + 30;
export const CLOSES_AT = 19 * 60 + 30;

export interface OpenStatus {
  open: boolean;
  /** e.g. "Open now · closes 7.30pm (in 3h 12m)" or "Closed · opens 10.30am" */
  label: string;
}

function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? `.${String(m).padStart(2, '0')}` : ''}${h >= 12 ? 'pm' : 'am'}`;
}

function duration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** Whether the outlet is open right now (Malaysia time), refreshed every minute. Uses the real clock, not the demo date. */
export function openStatusAt(now: Date): OpenStatus {
  const myt = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
  const mins = myt.getHours() * 60 + myt.getMinutes();
  if (mins >= OPENS_AT && mins < CLOSES_AT) {
    return { open: true, label: `Open now · closes ${fmt(CLOSES_AT)} (in ${duration(CLOSES_AT - mins)})` };
  }
  const until = mins < OPENS_AT ? OPENS_AT - mins : 24 * 60 - mins + OPENS_AT;
  return { open: false, label: `Closed · opens ${fmt(OPENS_AT)} (in ${duration(until)})` };
}

export function useOpenStatus(): OpenStatus {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return openStatusAt(now);
}
