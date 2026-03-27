'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'kartonbaas-cookie-consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const saveConsent = (value: 'necessary' | 'all') => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-6 md:right-6">
      <div className="max-w-4xl mx-auto rounded-2xl border-2 border-ink bg-white shadow-bold p-4 md:p-5">
        <p className="text-sm text-gray-700 leading-relaxed">
          Wij gebruiken cookies om de website goed te laten werken en om je ervaring te verbeteren.
          Lees meer in ons{' '}
          <Link href="/cookies" className="font-bold text-orange-600 underline underline-offset-2">
            cookiebeleid
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => saveConsent('necessary')}
            className="px-4 py-2 rounded-xl border-2 border-ink bg-white text-ink text-sm font-bold shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            Alleen noodzakelijk
          </button>
          <button
            type="button"
            onClick={() => saveConsent('all')}
            className="px-4 py-2 rounded-xl border-2 border-ink bg-orange-500 text-white text-sm font-bold shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            Alles accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
