'use client';

import { useState } from 'react';
import Link from 'next/link';
const PRODUCT_LINKS = [
  { label: 'Bestellen', href: '/#bestellen' },
  { label: 'Hoe het werkt', href: '/#hoe-het-werkt' },
  { label: 'Prijzen', href: '/#prijzen' },
  { label: 'Voorbeelden', href: '/#voorbeelden' },
];

const INFO_LINKS = [
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Retouren', href: '/retouren' },
  { label: 'Voorwaarden', href: '/voorwaarden' },
  { label: 'Privacybeleid', href: '/privacy' },
  { label: 'Cookiebeleid', href: '/cookies' },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto:');
  const className = 'text-sm font-medium text-gray-600 hover:text-ink transition-colors';
  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer className="bg-orange-50 border-t-2 border-ink">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-xl border-2 border-ink bg-orange-500 text-white font-black text-sm flex items-center justify-center shadow-bold">
                K
              </span>
              <span className="text-xl font-black text-ink">Kartonbaas</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Levensgrote kartonnen cut-outs voor verjaardagen, vrijgezellenfeesten en verrassingen.
            </p>
            <p className="text-xs text-gray-500">
              info@kartonbaas.nl
            </p>
          </div>

          <div>
            <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4">Product</h3>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4">Informatie</h3>
            <ul className="space-y-2">
              {INFO_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4">Blijf op de hoogte</h3>
            {subscribed ? (
              <p className="text-sm font-bold text-orange-600">Je bent ingeschreven. Bedankt!</p>
            ) : (
              <form className="flex gap-2" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Jouw e-mailadres"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-10 rounded-xl px-3 text-sm bg-white border-2 border-ink focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="h-10 px-3 rounded-xl bg-orange-500 text-white text-sm font-black border-2 border-ink shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  Aanmelden
                </button>
              </form>
            )}
            <div className="mt-5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Betalen met</p>
              <div className="flex flex-wrap gap-2">
                {['iDEAL (Wero)'].map((item) => (
                  <span key={item} className="text-xs font-bold px-2.5 py-1 rounded-lg border border-ink bg-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Kartonbaas. Alle rechten voorbehouden.
          </p>
          <p className="text-xs text-gray-500">
            Dit product is gemaakt door &copy;{' '}
            <a href="https://milestoners.nl" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
              Milestoners B.V.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
