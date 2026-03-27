'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Rotating target words in main title ──────────────────────────────────────

const TITLE_TARGETS = [
  'jezelf',
  'je vriend',
  'je vriendin',
  'je collega',
  'je partner',
  'je teamgenoot',
];

function RotatingTarget({ word }: { word: string }) {
  const maxLen = Math.max(...TITLE_TARGETS.map((o) => o.length));

  return (
    <span
      className="relative inline-block overflow-hidden align-baseline"
      style={{ minWidth: `${maxLen * 0.62}em`, height: '1em', lineHeight: '1em', verticalAlign: 'baseline' }}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          className="absolute left-0 right-0 bottom-0 block text-orange-500 font-black leading-[1em]"
          aria-hidden="true"
        >
          {word}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{word}</span>
    </span>
  );
}

export default function Hero() {
  const titleRef   = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctasRef    = useRef<HTMLDivElement>(null);
  const trustRef   = useRef<HTMLDivElement>(null);
  const imageRef   = useRef<HTMLDivElement>(null);
  const badgeRef   = useRef<HTMLDivElement>(null);
  const [targetIndex, setTargetIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTargetIndex((i) => (i + 1) % TITLE_TARGETS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let killed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any;

    async function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        [titleRef, subtextRef, ctasRef, trustRef, imageRef, badgeRef].forEach((r) => {
          if (r.current) r.current.style.opacity = '1';
        });
        return;
      }
      const { gsap } = await import('gsap');
      if (killed) return;            // cleanup already ran (React Strict Mode unmount)
      tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(badgeRef.current,   { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
        .fromTo(titleRef.current,   { y: 28,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.2')
        .fromTo(subtextRef.current, { y: 20,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
        .fromTo(ctasRef.current,    { y: 16,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
        .fromTo(imageRef.current,   { x: 32,  opacity: 0 }, { x: 0, opacity: 1, duration: 0.9 }, '-=0.8')
        .fromTo(trustRef.current?.children ?? [], { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, '-=0.4');
    }
    animate();
    return () => { killed = true; tl?.kill(); };
  }, []);

  const currentTarget = TITLE_TARGETS[targetIndex];

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center pt-16 px-6 bg-gradient-to-b from-orange-50 via-cream to-orange-100 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-24 right-8 w-48 h-48 md:w-72 md:h-72 rounded-full bg-orange-200 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 left-4 w-40 h-40 rounded-full bg-orange-100 opacity-80 blur-2xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto w-full py-20 md:py-28">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: text content */}
          <div>
            {/* Animated badge */}
            <div
              ref={badgeRef}
              style={{ opacity: 0 }}
              className="inline-flex items-center gap-2 bg-orange-100 border-2 border-orange-300 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-dot" />
              <span className="text-sm font-bold text-orange-700">Fotocheck binnen 24 uur</span>
            </div>

            <h1
              ref={titleRef}
              style={{ opacity: 0 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black text-ink leading-[1.05] tracking-tight"
            >
              Maak een levensgrote kartonnen{' '}
              <span className="relative inline-block">
                <span className="relative z-10">clone</span>
                <span className="absolute bottom-1 left-0 right-0 h-4 bg-orange-300 rounded -z-0" />
              </span>{' '}
              <span className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none lg:hidden">
                <span>van</span>
                <RotatingTarget word={currentTarget} />
              </span>
              <span className="hidden lg:inline">van</span>
              <span className="hidden lg:block mt-1 leading-none">
                <RotatingTarget word={currentTarget} />
              </span>
            </h1>

            {/* Mobile hero image directly under title */}
            <div className="mt-6 lg:hidden">
              <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-3xl border-2 border-ink overflow-hidden bg-orange-50 shadow-bold-lg">
                <Image
                  src="/images/hero.jpg"
                  alt="Voorbeeld kartonnen cut-out"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  quality={92}
                  className="object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  priority
                />
                <div className="absolute bottom-3 left-3 bg-orange-500 border-2 border-ink rounded-xl px-3 py-1.5 shadow-bold">
                  <p className="text-white font-black text-[10px] uppercase tracking-widest">Nieuw in NL</p>
                </div>
              </div>
            </div>

            <p
              ref={subtextRef}
              style={{ opacity: 0 }}
              className="mt-5 text-base text-gray-500 leading-relaxed font-medium"
            >
              Upload één foto. Kartonbaas snijdt de persoon strak uit, zet alles op schaal en print het haarscherp op stevig karton.
            </p>

            <div
              ref={ctasRef}
              style={{ opacity: 0 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <a
                href="/#bestellen"
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 text-white font-black text-base rounded-2xl border-2 border-ink shadow-bold-lg hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Maak mijn clone
              </a>
              <a
                href="/#hoe-het-werkt"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-ink font-black text-base rounded-2xl border-2 border-ink shadow-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
              >
                Zo werkt het
              </a>
            </div>

            <div
              ref={trustRef}
              className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3"
            >
              {[
                'Leverbaar in Nederland & België',
                'Gratis bestandscontrole',
                'Standaard binnen 5 werkdagen in huis',
              ].map((bullet) => (
                <div
                  key={bullet}
                  className="inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-2 shadow-bold"
                >
                  <span className="text-orange-500 text-sm leading-none flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-sm font-bold text-ink">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image */}
          <div ref={imageRef} style={{ opacity: 0 }} className="relative hidden lg:flex justify-center lg:justify-end rotate-[5deg]">
            {/* Rotated background card */}
            <div className="absolute inset-4 bg-orange-200 rounded-3xl border-2 border-ink rotate-3 shadow-bold" />

            {/* Main image container */}
            <div className="relative w-full max-w-sm lg:max-w-none aspect-[3/4] rounded-3xl border-2 border-ink overflow-hidden bg-orange-50 shadow-bold-lg">
              {/* Placeholder shown when no image is set */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-ink">Jouw foto hier</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Plaats een voorbeeldfoto<br />in <code className="bg-orange-100 px-1 rounded text-orange-600">/public/images/hero.jpg</code></p>
                </div>
              </div>

              {/* Actual image — rendered on top when file exists */}
              <Image
                src="/images/hero.jpg"
                alt="Voorbeeld kartonnen cut-out"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={92}
                className="object-cover object-top"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                priority
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 lg:left-auto lg:-right-4 bg-orange-500 border-2 border-ink rounded-2xl px-4 py-2.5 shadow-bold rotate-[-2deg]">
              <p className="text-white font-black text-xs uppercase tracking-widest">Nieuw in NL</p>
            </div>
            <div className="absolute -top-5 left-0 bg-white border-2 border-ink rounded-2xl px-3 py-2 shadow-bold rotate-[-6deg]">
              <p className="text-ink font-black text-xs">⏱️ Fotocheck &lt;24u</p>
            </div>
            <div className="absolute top-10 -right-5 bg-white border-2 border-ink rounded-2xl px-3 py-2 shadow-bold rotate-[6deg]">
              <p className="text-ink font-black text-xs">✨ Haarscherpe print</p>
            </div>
            <div className="absolute bottom-14 -left-6 bg-white border-2 border-ink rounded-2xl px-3 py-2 shadow-bold rotate-[4deg]">
              <p className="text-ink font-black text-xs">📦 Stevig karton</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
