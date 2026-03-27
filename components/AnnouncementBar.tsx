'use client';

import { useEffect, useState } from 'react';

function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate);
  let added = 0;

  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) added += 1;
  }

  return result;
}

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [deliveryDayLabel, setDeliveryDayLabel] = useState('over 4 werkdagen');

  useEffect(() => {
    const deliveryDate = addBusinessDays(new Date(), 4);
    const formatted = new Intl.DateTimeFormat('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'Europe/Amsterdam',
    }).format(deliveryDate);

    setDeliveryDayLabel(formatted);
  }, []);

  if (dismissed) return null;

  return (
    <div className="sticky top-16 z-40 bg-orange-500 border-b-2 border-ink py-2 px-4 shadow-bold">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
        <a
          href="/#bestellen"
          className="inline-flex items-center gap-2 text-center text-white text-sm font-black tracking-tight hover:opacity-90 transition-opacity"
        >
          <span
            className="w-6 h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Bestel voor 23:59, dan is je bestelling uiterlijk {deliveryDayLabel} in huis.
        </a>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Sluit aankondiging"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
