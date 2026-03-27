'use client';

import { useEffect, useRef } from 'react';
import { GlowCard } from '@/components/ui/spotlight-card';

const usps = [
  {
    icon:  '📷',
    title: 'Eén foto, dat is alles',
    desc:  'Upload gewoon een foto. Wij regelen de uitsnede, schaling en print. Geen gedoe, geen technische kennis nodig.',
  },
  {
    icon:  '✅',
    title: 'Fotocheck binnen 24 uur',
    desc:  'Elke foto wordt persoonlijk beoordeeld. Niet goed genoeg? We nemen contact op en helpen je naar het beste resultaat.',
  },
  {
    icon:  '🚚',
    title: 'Binnen 5 werkdagen geleverd',
    desc:  'Sneller nodig? Tegen een meerprijs kun je jouw bestelling maximaal 2 werkdagen eerder laten leveren.',
  },
  {
    icon:  '📦',
    title: 'Inclusief kartonnen standaard',
    desc:  'Elke cut-out krijgt een stevige kartonnen standaard meegeleverd. Plaatsen, klaarzetten en verrassen — klaar.',
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sectionRef.current?.querySelectorAll('.about-animate').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        return;
      }
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.about-animate'),
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      );
    }
    animate();
  }, []);

  return (
    <section ref={sectionRef} id="over-ons" className="py-24 md:py-32 px-6 bg-ink overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* Intro */}
          <div className="about-animate max-w-2xl mb-16" style={{ opacity: 0 }}>
            <div className="inline-flex items-center gap-2 bg-orange-500 border-2 border-orange-400 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm font-black text-white uppercase tracking-widest">Over ons</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4 text-balance">
              Waarom Kartonbaas?
            </h2>
            <p className="text-lg text-gray-400 font-medium leading-relaxed">
              Kartonbaas komt uit de wereld van print en drukwerk. Daarom zijn we streng op kwaliteit en verhoudingen.
              Jij uploadt een foto — wij regelen de rest.
            </p>
          </div>

          {/* USP grid — spotlight GlowCard on each card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {usps.map((usp) => (
              <div
                key={usp.title}
                className="about-animate"
                style={{ opacity: 0 }}
              >
                <GlowCard glowColor="orange" className="rounded-3xl">
                  <div className={[
                    'group relative flex gap-5 items-start',
                    'bg-white/[0.04] border border-white/10 rounded-3xl p-7',
                    'hover:bg-white/[0.08]',
                    'transition-all duration-240 ease-spring',
                    'cursor-default',
                  ].join(' ')}>
                    {/* Icon box */}
                    <div className={[
                      'flex-shrink-0 w-14 h-14 rounded-2xl',
                      'bg-orange-500 border-2 border-orange-400',
                      'flex items-center justify-center',
                      'shadow-bold-orange',
                      'transition-transform duration-240 ease-out-back',
                      'group-hover:rotate-[-4deg] group-hover:scale-105',
                      'about-icon-float',
                    ].join(' ')}>
                      <span className="text-2xl" aria-hidden="true">{usp.icon}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white mb-1.5">{usp.title}</h3>
                      <p className="text-sm text-gray-400 font-medium leading-relaxed">{usp.desc}</p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            ))}
          </div>

        </div>
    </section>
  );
}
