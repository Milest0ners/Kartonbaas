'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SuccessBanner() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === '1';
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSuccess || !bannerRef.current) return;

    async function animate() {
      const { gsap } = await import('gsap');
      gsap.fromTo(
        bannerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.3 }
      );
    }

    animate();

    window.history.replaceState({}, '', '/');
  }, [isSuccess]);

  if (!isSuccess) return null;

  return (
    <div
      ref={bannerRef}
      style={{ opacity: 0 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Betaling ontvangen</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Bedankt voor je bestelling. Je ontvangt een bevestigingsmail zodra we je betaling hebben verwerkt en je foto hebben gecheckt.
        </p>
      </div>
    </div>
  );
}
