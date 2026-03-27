'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { key: string; label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'bestellen', label: 'Bestellen', href: '/#bestellen' },
  { key: 'blog', label: 'Blog', href: '/blog' },
  { key: 'contact', label: 'Contact', href: '/contact' },
];

export default function Header() {
  const headerRef  = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const pathname = usePathname();

  const getHashFromHref = (href: string): string => {
    const hashIndex = href.indexOf('#');
    return hashIndex === -1 ? '' : href.slice(hashIndex);
  };

  const syncActiveHashFromHref = (href: string) => {
    setCurrentHash(getHashFromHref(href));
  };

  // Scroll state → glass effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // GSAP entrance
  useEffect(() => {
    async function animate() {
      const { gsap } = await import('gsap');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(headerRef.current, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        headerRef.current,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.05 }
      );
    }
    animate();
  }, []);

  // Close mobile nav after route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  // Move focus into the opened menu for keyboard users.
  useEffect(() => {
    if (!mobileOpen) return;
    const firstLink = mobileMenuRef.current?.querySelector('a');
    if (firstLink instanceof HTMLElement) firstLink.focus();
  }, [mobileOpen]);

  // Track hash so Home/Bestellen active state is correct on homepage anchors.
  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const isNavItemActive = (href: string): boolean => {
    if (href === '/') return pathname === '/' && currentHash !== '#bestellen';
    if (href === '/#bestellen') return pathname === '/' && currentHash === '#bestellen';
    return pathname.startsWith(href);
  };

  return (
    <header
      ref={headerRef}
      style={{ opacity: 0 }}
      className={[
        'fixed top-0 left-0 right-0 z-50',
        'bg-white border-b-2 border-ink',
        'transition-shadow duration-300',
        scrolled ? 'shadow-soft-sm' : 'shadow-none',
      ].join(' ')}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">

        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-ink font-black text-xl tracking-tight"
          aria-label="Kartonbaas — terug naar homepage"
        >
          {/* Small logo mark */}
          <span
            className={[
              'w-8 h-8 rounded-xl border-2 border-ink flex items-center justify-center',
              'bg-orange-500 text-white text-xs font-black',
              'transition-all duration-180 ease-spring',
              'group-hover:bg-orange-400 group-hover:rotate-[-4deg] group-hover:shadow-bold',
              'shadow-[2px_2px_0px_#111827]',
            ].join(' ')}
            aria-hidden="true"
          >
            K
          </span>
          <span className="transition-colors duration-180 group-hover:text-orange-600">
            Kartonbaas
          </span>
        </Link>

        {/* Mobile visual cue + menu */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Sluit menu' : 'Open menu'}
            className="w-10 h-10 rounded-xl border-2 border-ink bg-white text-ink shadow-bold flex items-center justify-center"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Hoofdnavigatie">
          {NAV_ITEMS.map(({ key, label, href }) => {
            const isActive = isNavItemActive(href);
            return (
              <Link
                key={key}
                href={href}
                onClick={() => syncActiveHashFromHref(href)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'relative px-3 py-2 text-sm font-bold rounded-lg',
                  'transition-all duration-180',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1',
                  // Active / hover text color
                  isActive
                    ? 'text-ink'
                    : 'text-gray-500 hover:text-ink hover:bg-gray-50',
                ].join(' ')}
              >
                {label}
                {/* Animated underline */}
                <span
                  aria-hidden="true"
                  className={[
                    'absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-orange-500',
                    'transition-all duration-240 ease-spring origin-left',
                    isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
                  ].join(' ')}
                />
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          href="/#bestellen"
          className={[
            'hidden md:inline-flex items-center gap-2 px-5 py-2.5',
            'bg-orange-500 text-white text-sm font-black',
            'rounded-xl border-2 border-ink shadow-bold',
            'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
            'active:translate-x-[3px] active:translate-y-[3px]',
            'transition-all duration-180 ease-spring',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
          ].join(' ')}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h11m0 0-4-4m4 4-4 4" />
          </svg>
          Bestel nu
        </Link>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div ref={mobileMenuRef} id="mobile-menu" className="md:hidden border-t-2 border-ink bg-white px-4 pb-4 pt-3">
          <nav className="flex flex-col gap-2" aria-label="Mobiele navigatie">
            {NAV_ITEMS.map(({ key, label, href }) => {
              const isActive = isNavItemActive(href);
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => syncActiveHashFromHref(href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'px-3 py-2.5 rounded-lg border-2 border-ink text-sm font-bold',
                    isActive ? 'bg-orange-500 text-white' : 'bg-white text-ink',
                  ].join(' ')}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/#bestellen"
              className="mt-1 inline-flex items-center justify-center px-4 py-3 rounded-xl border-2 border-ink bg-orange-500 text-white font-black shadow-bold"
            >
              Bestel nu
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
