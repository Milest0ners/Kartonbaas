'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Configurator from '@/components/Configurator';

const TIPS = [
  { icon: '🧍', text: 'Volledig lichaam zichtbaar (verplicht voor goede uitsnede)' },
  { icon: '🌿', text: 'Rustige, uniforme achtergrond' },
  { icon: '☀️', text: 'Goede belichting, geen schaduwen' },
  { icon: '🔍', text: 'Scherpe foto — niet via WhatsApp' },
];

const REASSURANCE = [
  { text: 'Betaling via iDEAL' },
  { text: 'Fotocheck binnen 24 uur' },
  { text: 'Levering in stevige verpakking' },
  { text: 'Geleverd met kartonnen standaard' },
];

export default function Order() {
  const sectionRef = useRef<HTMLElement>(null);
  const [previewImage, setPreviewImage] = useState('/images/hero.jpg');
  const isDefaultPreview = previewImage === '/images/hero.jpg';

  useEffect(() => {
    async function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const el = sectionRef.current?.querySelector('.order-content') as HTMLElement | null;
        if (el) el.style.opacity = '1';
        return;
      }
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelector('.order-content'),
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      );
    }
    animate();
  }, []);

  return (
    <section ref={sectionRef} id="bestellen" className="py-24 md:py-32 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Left: sticky tips ───────────────────────────────────────────── */}
          <div className="order-content lg:sticky lg:top-24 lg:self-start" style={{ opacity: 0 }}>
            <div className="inline-flex items-center gap-2 bg-orange-100 border-2 border-orange-300 rounded-full px-4 py-1.5 mb-5">
              <span className="text-sm font-black text-orange-700 uppercase tracking-widest">Bestellen</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight mb-8 text-balance">
              Maak jouw clone
            </h2>

            {/* Doubt callout */}
            <div className="mb-6 bg-orange-100 border-2 border-orange-300 rounded-2xl p-5 flex gap-3">
              <span className="text-xl flex-shrink-0" aria-hidden="true">💡</span>
              <p className="text-sm font-medium text-ink leading-relaxed">
                <span className="font-black">Fotocheck is altijd inbegrepen.</span> Bij een foutieve foto nemen we contact met je op. Zorg wel dat het volledige lichaam zichtbaar is voor een correcte uitsnede.
              </p>
            </div>

            <div className="mb-6 bg-white border-2 border-ink rounded-3xl p-4 shadow-bold">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-ink bg-orange-50">
                <Image
                  src={previewImage}
                  alt="Jouw product voorbeeld"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  quality={92}
                  className={isDefaultPreview ? 'object-cover object-top' : 'object-contain object-center'}
                />
              </div>
            </div>

            <div className="space-y-5">

              {/* Tips card */}
              <div className="bg-white border-2 border-ink rounded-2xl p-6 shadow-bold">
                <h3 className="text-xs font-black text-ink mb-4 uppercase tracking-widest">
                  Dit werkt het best
                </h3>
                <ul className="space-y-3">
                  {TIPS.map(({ icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <span className="text-lg w-7 flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                      <span className="text-sm font-medium text-gray-700 leading-snug">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reassurance list */}
              <div className="space-y-2">
                {REASSURANCE.map(({ text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className={[
                      'w-5 h-5 rounded-full border-2 border-ink flex items-center justify-center flex-shrink-0',
                      'bg-orange-500',
                    ].join(' ')}>
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-gray-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: configurator ─────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl border-2 border-ink shadow-bold-lg p-8">
            <Configurator onPreviewImageChange={setPreviewImage} />
          </div>

        </div>
      </div>
    </section>
  );
}
