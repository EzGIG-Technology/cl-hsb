import { HoneySpaMark } from './Logo';
import { useOpenStatus } from '../lib/hours';
import { useSettings } from '../store/SettingsContext';

/**
 * Overview welcome block: a flat field of the price-list magenta, the day, a greeting and whether
 * the Bangi Sentral outlet is open right now (live, from the real clock), with the flower mark
 * enlarged and cropped off the right edge as the one motif.
 */
export function HeroBanner({ name, dateLabel }: { name: string; dateLabel: string }) {
  const status = useOpenStatus();
  const { company } = useSettings();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-pink px-8 py-9 text-white">
      <HoneySpaMark size={260} className="pointer-events-none absolute -right-10 -top-8 hidden opacity-25 sm:block" />
      <div className="relative max-w-xl">
        <p className="text-base text-white/80">{dateLabel}</p>
        <h2 className="mt-2 text-5xl font-semibold leading-none tracking-tight">Hello, {name.split(' ')[0]}</h2>
        <p className="mt-4 text-lg leading-snug text-white/90">
          {status.label}. {company.address.split(',').slice(2, 4).join(',').trim()}.
        </p>
      </div>
    </div>
  );
}
