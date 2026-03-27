'use client';

import { useEffect } from 'react';

export default function GsapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {});
    }

    init();

    return () => {
      ctx?.revert();
    };
  }, []);

  return <>{children}</>;
}
