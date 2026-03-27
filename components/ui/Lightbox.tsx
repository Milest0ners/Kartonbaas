'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export interface LightboxItem {
  src:    string;
  label:  string;
  emoji:  string;
}

interface LightboxProps {
  items:     LightboxItem[];
  current:   number | null;          // null = closed
  onClose:   () => void;
  onPrev:    () => void;
  onNext:    () => void;
}

export default function Lightbox({
  items,
  current,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const isOpen = current !== null;
  const item   = current !== null ? items[current] : null;

  // Keyboard navigation
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape')     onClose();
    if (e.key === 'ArrowLeft')  onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [isOpen, onClose, onPrev, onNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label={`Foto: ${item.label}`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            key={current}
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={   { scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image container */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl border-2 border-ink overflow-hidden shadow-bold-lg bg-orange-50">
              <Image
                src={item.src.replace(/w=\d+&h=\d+/, 'w=1200&h=900')}
                alt={item.label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 75vw"
                quality={95}
                priority
              />
              {/* Label badge */}
              <div className="absolute bottom-4 left-4">
                <div className="inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-2 shadow-bold">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm font-black text-ink">{item.label}</span>
                </div>
              </div>
            </div>

            {/* Counter */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white border-2 border-ink rounded-full px-3 py-1 shadow-bold">
              <span className="text-xs font-black text-ink tabular-nums">
                {(current ?? 0) + 1} / {items.length}
              </span>
            </div>
          </motion.div>

          {/* ── Close button ── */}
          <button
            onClick={onClose}
            aria-label="Sluiten"
            className={[
              'absolute top-4 right-4 z-20',
              'w-11 h-11 flex items-center justify-center',
              'bg-white border-2 border-ink rounded-xl shadow-bold',
              'hover:bg-orange-500 hover:text-white hover:border-orange-500',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
              'transition-all duration-180',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            ].join(' ')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* ── Prev button ── */}
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Vorige foto"
            className={[
              'absolute left-4 top-1/2 -translate-y-1/2 z-20',
              'w-11 h-11 flex items-center justify-center',
              'bg-white border-2 border-ink rounded-xl shadow-bold',
              'hover:bg-orange-500 hover:text-white hover:border-orange-500',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
              'transition-all duration-180',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            ].join(' ')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* ── Next button ── */}
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Volgende foto"
            className={[
              'absolute right-4 top-1/2 -translate-y-1/2 z-20',
              'w-11 h-11 flex items-center justify-center',
              'bg-white border-2 border-ink rounded-xl shadow-bold',
              'hover:bg-orange-500 hover:text-white hover:border-orange-500',
              'hover:translate-x-[-2px] hover:translate-y-[2px] hover:shadow-none',
              'transition-all duration-180',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
            ].join(' ')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
