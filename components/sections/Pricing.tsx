'use client';

import { useEffect, useRef } from 'react';
import { PRICING, formatCurrency } from '@/lib/pricing';
import type { Format } from '@/lib/pricing';

const FORMAT_DESCRIPTIONS: Record<Format, string> = {
  mini:      'Perfect voor kinderen en feestjes',
  standaard: 'Meest gekozen voor verjaardagen en feestjes',
  xl:        'Extra groot voor maximale impact',
};

const FEATURES = ['Inclusief fotocheck', 'Strakke uitsnede', 'Haarscherpe print', 'Kartonnen standaard'];

// ─── Check icon ──────────────────────────────────────────────────────────────

function CheckIcon({ dark, orange }: { dark?: boolean; orange?: boolean }) {
  return (
    <span className={[
      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
      dark   ? 'border-white/30 text-white/60'   :
      orange ? 'border-white/50 text-white/80'   :
               'border-ink text-ink',
    ].join(' ')}>
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sectionRef.current?.querySelectorAll('.pricing-card').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        return;
      }
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;
      sectionRef.current.querySelectorAll('.pricing-card').forEach((card, i) => {
        gsap.fromTo(card, { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: i * 0.1,
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        });
      });
    }
    animate();
  }, []);

  const handleSelectFormat = (e: React.MouseEvent<HTMLAnchorElement>, format: Format) => {
    e.preventDefault();
    window.sessionStorage.setItem('kb_preselect_format', format);
    window.dispatchEvent(new CustomEvent('kb-preselect-format', { detail: format }));
    document.getElementById('bestellen')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} id="prijzen" className="py-24 md:py-32 px-6 bg-orange-50">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="max-w-xl mb-16">
          <div className="inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-1.5 mb-5 shadow-bold">
            <span className="text-sm font-black text-ink uppercase tracking-widest">Prijzen</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight text-balance">
            Kies je formaat
          </h2>
          <p className="mt-4 text-gray-600 font-medium leading-relaxed">
            Alle formaten worden gratis geleverd met een kartonnen standaard. Zo staat hij meteen.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
          {(Object.entries(PRICING.formats) as [Format, typeof PRICING.formats[Format]][]).map(([key, config]) => {
            const isOrange = key === 'standaard';
            const isDark   = key === 'xl';

            const textColor   = isDark ? 'text-white' : 'text-ink';
            const mutedColor  = isDark ? 'text-gray-400' : isOrange ? 'text-orange-100' : 'text-gray-500';
            const cardBase    = isDark
              ? 'bg-ink border-ink'
              : isOrange
              ? 'bg-orange-500 border-ink'
              : 'bg-white border-ink';

            const btnClass = isOrange
              ? 'bg-white text-ink border-ink shadow-bold hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              : isDark
              ? 'bg-orange-500 text-white border-orange-500 shadow-[4px_4px_0px_#f97316] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
              : 'bg-ink text-white border-ink shadow-bold hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]';

            return (
              /* Outer wrapper: badge container + GSAP target (no overflow-hidden) */
              <div
                key={key}
                className={[
                  'pricing-card relative',
                  isOrange ? '-mt-4' : '',
                ].join(' ')}
                style={{ opacity: 0 }}
              >
                {/* "Meest gekozen" badge — sits on the outer wrapper, never clipped */}
                {isOrange && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 bg-white border-2 border-ink rounded-full px-4 py-1 shadow-bold whitespace-nowrap">
                    <span className="text-xs font-black text-ink uppercase tracking-wider">⭐ Meest gekozen</span>
                  </div>
                )}

                {/* Inner card: overflow-hidden kept here for the shine sweep */}
                <div
                  className={[
                    'relative rounded-3xl p-8 flex flex-col border-2',
                    'shine overflow-hidden',
                    'transition-all duration-240 ease-spring',
                    !isOrange ? 'hover:-translate-y-1 hover:shadow-bold-lg' : '',
                    isOrange  ? 'pb-12 pt-12 shadow-bold-lg hover:-translate-y-2' : 'shadow-bold',
                    cardBase,
                  ].join(' ')}
                >
                  {/* Format + height */}
                  <h3 className={`text-xl font-black mb-1 ${textColor}`}>{config.label}</h3>
                  <p className={`text-sm font-bold mb-6 ${mutedColor}`}>{config.height}</p>

                  {/* Price */}
                  <div className={`text-5xl font-black mb-1 ${textColor}`}>
                    {formatCurrency(config.price)}
                  </div>
                  <p className={`text-sm font-medium mb-8 ${mutedColor}`}>{FORMAT_DESCRIPTIONS[key]}</p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8">
                    {FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <CheckIcon dark={isDark} orange={isOrange} />
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : isOrange ? 'text-orange-50' : 'text-gray-700'}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href="#bestellen"
                    onClick={(e) => handleSelectFormat(e, key)}
                    className={[
                      'mt-auto w-full py-3.5 px-6 rounded-2xl text-center text-sm font-black border-2',
                      'transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
                      btnClass,
                    ].join(' ')}
                  >
                    Bestel {config.label}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
