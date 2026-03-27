'use client';

import { useEffect, useRef } from 'react';

// ─── Step icons — inline SVG ─────────────────────────────────────────────────

function IconRuler() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
      <path d="M21.5 7.5 14 15l-3-3 7.5-7.5a2.121 2.121 0 013 3z" />
      <path d="M7.5 2.5 2.5 7.5l7 7 5-5-7-7z" />
      <path d="m5 10 4 4" />
      <path d="m10 5 4 4" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconScissors() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

// ─── Step data ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon:        <IconRuler />,
    iconBg:      'bg-orange-100 text-orange-600',
    accent:      'bg-orange-200',
    step:        '01',
    title:       'Kies je formaat',
    description: (
      <>
        <strong>Kids</strong> voor kleinere formaten, <strong>Standaard</strong> voor verjaardagen of <strong>XXL</strong> voor de meeste impact.
      </>
    ),
  },
  {
    icon:        <IconUpload />,
    iconBg:      'bg-orange-200 text-orange-700',
    accent:      'bg-orange-300',
    step:        '02',
    title:       'Upload je foto',
    description: 'Staand, scherp en goed belicht werkt het best. Wij checken alles voor je.',
  },
  {
    icon:        <IconScissors />,
    iconBg:      'bg-orange-300 text-orange-800',
    accent:      'bg-orange-400',
    step:        '03',
    title:       'Wij maken hem printklaar',
    description: 'We snijden de persoon strak uit, controleren de kwaliteit en stellen alles scherp.',
  },
  {
    icon:        <IconTruck />,
    iconBg:      'bg-orange-500 text-white',
    accent:      'bg-orange-500',
    step:        '04',
    title:       'Print en levering',
    description: 'Productie en verzending in een stevige verpakking. Binnen 3–5 werkdagen bij je.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sectionRef.current?.querySelectorAll('.step-card').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        return;
      }
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;

      sectionRef.current.querySelectorAll('.step-card').forEach((card, i) => {
        gsap.fromTo(card,
          { y: 32, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.65, ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          }
        );
      });
    }
    animate();
  }, []);

  return (
    <section ref={sectionRef} id="hoe-het-werkt" className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="max-w-xl mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 border-2 border-orange-300 rounded-full px-4 py-1.5 mb-5">
            <span className="text-sm font-black text-orange-700 uppercase tracking-widest">Hoe het werkt</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight text-balance">
            Van foto naar kartonnen clone in 4 stappen
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, idx) => (
            <div
              key={step.step}
              className={[
                'step-card group relative rounded-3xl border-2 border-ink p-7 flex flex-col',
                'shadow-bold',
                'hover:-translate-y-1 hover:shadow-bold-lg',
                'transition-all duration-240 ease-spring',
                step.accent,
              ].join(' ')}
              style={{ opacity: 0 }}
            >
              {/* Step number — small, top right */}
              <span className="absolute top-5 right-6 text-xs font-black text-ink/30 tabular-nums">
                {step.step}
              </span>

              {/* Icon container */}
              <div className={[
                'w-14 h-14 rounded-2xl border-2 border-ink flex items-center justify-center mb-5',
                'shadow-[2px_2px_0px_#111827]',
                'transition-transform duration-240 ease-out-back',
                'group-hover:rotate-[-4deg] group-hover:scale-105',
                step.iconBg,
              ].join(' ')}>
                {step.icon}
              </div>

              <h3 className="text-lg font-black text-ink mb-2 leading-snug pr-6">
                {step.title}
              </h3>
              <p className="text-sm text-ink/70 font-medium leading-relaxed">
                {step.description}
              </p>

              {/* Connector arrow (not on last) */}
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-ink flex items-center justify-center shadow-[1px_1px_0px_#111827]">
                    <svg className="w-3 h-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
