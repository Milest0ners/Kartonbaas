'use client';

import { useEffect, useRef } from 'react';
import * as Accordion from '@radix-ui/react-accordion';

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const faqs = [
    {
      q: 'Hoe snel is mijn cut-out klaar?',
      a: 'In de meeste gevallen wordt jouw kartonnen cut-out binnen 5 werkdagen geleverd. Sneller nodig? Tegen een meerprijs kun je jouw cut-out tot 2 werkdagen eerder ontvangen.',
      icon: '⏱️',
    },
    {
      q: 'Wat voor foto moet ik uploaden?',
      a: 'Een scherpe staande foto met goede belichting en liefst het volledige lichaam zichtbaar. Niet opnieuw opgeslagen via chat apps, want dat verlaagt de kwaliteit.',
      icon: '📷',
    },
    {
      q: 'Wat als mijn foto niet goed genoeg is?',
      a: 'We checken elke foto binnen 24 uur en laten je weten als er een betere foto nodig is. Je hoeft dus niet te twijfelen, upload gewoon wat je hebt.',
      icon: '✅',
    },
    {
      q: 'Kan de cut-out zelfstandig staan?',
      a: 'Ja. Elke cut-out krijgt een kartonnen standaard meegeleverd.',
      icon: '🗿',
    },
    {
      q: 'Hoe wordt mijn cut-out verzonden?',
      a: 'Je cut-out wordt opgestuurd in een stevige verpakking om beschadiging tijdens transport te voorkomen.',
      icon: '📦',
    },
    {
      q: 'Kan ik een cut-out als cadeau laten bezorgen?',
      a: 'Ja, vul gewoon het afleveradres in bij je bestelling. Dat kan een ander adres zijn dan je eigen adres.',
      icon: '🎁',
    },
  ];

  useEffect(() => {
    async function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sectionRef.current?.querySelectorAll('.faq-item').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        return;
      }
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.faq-item'),
        { x: -12, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      );
    }
    animate();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="py-24 md:py-32 px-6 bg-orange-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Left: header */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-1.5 mb-5 shadow-bold">
              <span className="text-sm font-black text-ink uppercase tracking-widest">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tight leading-tight text-balance">
              Veelgestelde vragen
            </h2>
            <p className="mt-4 text-gray-600 font-medium leading-relaxed">
              Staat je vraag er niet bij? Mail ons op{' '}
              <a
                href="mailto:info@kartonbaas.nl"
                className={[
                  'font-black text-orange-600',
                  'underline underline-offset-2 decoration-orange-400/50',
                  'hover:decoration-orange-500',
                  'transition-all duration-180',
                ].join(' ')}
              >
                info@kartonbaas.nl
              </a>
            </p>

            {/* Decorative card */}
            <div className="mt-10 p-5 bg-white border-2 border-ink rounded-2xl shadow-bold hidden lg:block">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-sm font-black text-ink mb-1">Snel antwoord</p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                We reageren doorgaans binnen een paar uur op werkdagen.
              </p>
            </div>
          </div>

          {/* Right: accordion */}
          <div className="lg:col-span-2">
            <Accordion.Root type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <Accordion.Item
                  key={faq.q}
                  value={`item-${i}`}
                  className={[
                    'faq-item group',
                    'bg-white border-2 border-ink rounded-2xl overflow-hidden',
                    'shadow-bold',
                    'hover:shadow-bold-lg hover:-translate-y-[1px]',
                    'data-[state=open]:bg-orange-50 data-[state=open]:border-orange-400',
                    'transition-all duration-240 ease-spring',
                  ].join(' ')}
                  style={{ opacity: 0 }}
                >
                  <Accordion.Header>
                    <Accordion.Trigger
                      className={[
                        'w-full flex items-center gap-4 p-5 text-left',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset',
                        'cursor-pointer',
                      ].join(' ')}
                    >
                      {/* Emoji */}
                      <span className="text-xl flex-shrink-0 w-8 text-center" aria-hidden="true">
                        {faq.icon}
                      </span>

                      {/* Question */}
                      <span className="flex-1 text-base font-black text-ink">
                        {faq.q}
                      </span>

                      {/* Toggle button */}
                      <span
                        aria-hidden="true"
                        className={[
                          'w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border-2',
                          'font-black text-base leading-none',
                          'transition-all duration-240 ease-spring',
                          // closed state
                          'border-ink text-ink bg-white',
                          // open state — Radix data attribute
                          'group-data-[state=open]:rotate-45',
                          'group-data-[state=open]:bg-orange-500',
                          'group-data-[state=open]:border-orange-500',
                          'group-data-[state=open]:text-white',
                        ].join(' ')}
                      >
                        +
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="px-5 pb-5 pl-[3.25rem]">
                      <p className="text-gray-600 font-medium leading-relaxed text-sm">{faq.a}</p>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </div>
      </div>
    </section>
  );
}
