'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Lightbox, { type LightboxItem } from '@/components/ui/Lightbox';

const examples: LightboxItem[] = [
  {
    label: 'Verjaardag',
    emoji: '🎂',
    src: '/images/examples/verjaardag.png',
  },
  {
    label: 'Vrijgezellenfeest',
    emoji: '🥂',
    src: '/images/examples/vrijgezellen.png',
  },
  {
    label: 'Kantoor',
    emoji: '💼',
    src: '/images/examples/kantoor.png',
  },
  {
    label: 'Festival',
    emoji: '🎉',
    src: '/images/examples/festival.png',
  },
  {
    label: 'Vrijgezellenfeest',
    emoji: '🥂',
    src: '/images/examples/vrijgezellenfeest-2.png',
  },
  {
    label: 'Verjaardag',
    emoji: '🎂',
    src: '/images/examples/kinderverjaardag-2.png',
  },
];

// Explicit desktop layout so the collage stays visually balanced.
const CARD_LAYOUT = [
  'sm:col-start-1 sm:row-start-1 sm:row-span-2', // Verjaardag (groot)
  'sm:col-start-2 sm:row-start-1', // Vrijgezellenfeest
  'sm:col-start-3 sm:row-start-1 sm:row-span-2', // Kantoor (groot)
  'sm:col-start-2 sm:row-start-2 sm:row-span-2', // Festival (groot)
  'sm:col-start-1 sm:row-start-3', // Vrijgezellenfeest
  'sm:col-start-3 sm:row-start-3', // Kinderverjaardag onder Kantoor
];

export default function Examples() {
  const sectionRef = useRef<HTMLElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Lightbox handlers
  const openAt  = useCallback((i: number) => setLightboxIndex(i), []);
  const close    = useCallback(() => setLightboxIndex(null), []);
  const prev     = useCallback(() => setLightboxIndex((i) => i === null ? null : (i - 1 + examples.length) % examples.length), []);
  const next     = useCallback(() => setLightboxIndex((i) => i === null ? null : (i + 1) % examples.length), []);

  useEffect(() => {
    async function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sectionRef.current?.querySelectorAll('.example-item').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        return;
      }
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.example-item'),
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      );
    }
    animate();
  }, []);

  return (
    <>
      <section ref={sectionRef} id="voorbeelden" className="py-24 md:py-32 px-6 bg-orange-50">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-1.5 mb-5 shadow-bold">
                <span className="text-sm font-black text-ink uppercase tracking-widest">Voorbeelden</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight text-balance">
                Wat klanten maken
              </h2>
              <p className="mt-3 text-gray-600 font-medium leading-relaxed max-w-md">
                Van verjaardag tot vrijgezellenfeest — elke cut-out is uniek en levensecht.{' '}
                <span className="text-gray-400 text-sm">Klik op een foto voor meer detail.</span>
              </p>
            </div>
            <a
              href="#bestellen"
              onClick={(e) => { e.preventDefault(); document.getElementById('bestellen')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={[
                'flex-shrink-0 inline-flex items-center justify-center px-6 py-3',
                'bg-orange-500 text-white font-black text-sm',
                'rounded-2xl border-2 border-ink shadow-bold',
                'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                'transition-all duration-180',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
              ].join(' ')}
            >
              Maak mijn clone →
            </a>
          </div>

          {/* Masonry grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-[180px]">
            {examples.map((item, i) => (
              <button
                key={`${item.label}-${i}`}
                type="button"
                aria-label={`Bekijk foto: ${item.label}`}
                onClick={() => openAt(i)}
                className={[
                  'example-item text-left',
                  CARD_LAYOUT[i],
                  'relative rounded-2xl border-2 border-ink overflow-hidden shadow-bold',
                  'group cursor-zoom-in',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
                ].join(' ')}
                style={{ opacity: 0 }}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 33vw"
                  quality={90}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition-all duration-300" />

                {/* Zoom icon — appears on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <div className="w-8 h-8 flex items-center justify-center bg-white border-2 border-ink rounded-lg shadow-bold">
                    <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>

                {/* Label badge */}
                <div className="absolute bottom-3 left-3">
                  <div className="inline-flex items-center gap-1.5 bg-white border-2 border-ink rounded-full px-3 py-1 shadow-bold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-sm">{item.emoji}</span>
                    <span className="text-xs font-black text-ink">{item.label}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            {['Leverbaar in Nederland & België', 'Gratis bestandscontrole', 'Standaard binnen 5 werkdagen in huis'].map((pill) => (
              <div key={pill} className="inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-2 shadow-bold">
                <span className="text-orange-500 text-sm leading-none flex-shrink-0" aria-hidden="true">✓</span>
                <span className="text-sm font-black text-ink">{pill}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Lightbox — rendered outside section for correct stacking */}
      <Lightbox
        items={examples}
        current={lightboxIndex}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
