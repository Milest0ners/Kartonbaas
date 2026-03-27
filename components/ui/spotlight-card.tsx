'use client';

import React, { useEffect, useRef, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
}

const glowColorMap = {
  blue:   { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green:  { base: 120, spread: 200 },
  red:    { base: 0,   spread: 200 },
  orange: { base: 30,  spread: 200 },
};

// ─── Injected CSS (once per page) ────────────────────────────────────────────

const GLOW_STYLES = `
  [data-glow-card]::before,
  [data-glow-card]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--glow-border-size) * -1);
    border: var(--glow-border-size) solid transparent;
    border-radius: calc(var(--glow-radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--glow-border-size))) calc(100% + (2 * var(--glow-border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }
  [data-glow-card]::before {
    background-image: radial-gradient(
      calc(var(--glow-spot-size) * 0.75) calc(var(--glow-spot-size) * 0.75) at
      calc(var(--glow-x, 0) * 1px) calc(var(--glow-y, 0) * 1px),
      hsl(var(--glow-hue, 210) calc(var(--glow-saturation, 100) * 1%) calc(var(--glow-lightness, 50) * 1%) / var(--glow-border-spot-opacity, 1)),
      transparent 100%
    );
    filter: brightness(2);
  }
  [data-glow-card]::after {
    background-image: radial-gradient(
      calc(var(--glow-spot-size) * 0.5) calc(var(--glow-spot-size) * 0.5) at
      calc(var(--glow-x, 0) * 1px) calc(var(--glow-y, 0) * 1px),
      hsl(0 100% 100% / var(--glow-border-light-opacity, 0.4)),
      transparent 100%
    );
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function GlowCard({
  children,
  className = '',
  glowColor = 'orange',
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { base, spread } = glowColorMap[glowColor];

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty('--glow-x',  e.clientX.toFixed(2));
      cardRef.current.style.setProperty('--glow-xp', (e.clientX / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty('--glow-y',  e.clientY.toFixed(2));
      cardRef.current.style.setProperty('--glow-yp', (e.clientY / window.innerHeight).toFixed(2));
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const cssVars = {
    '--glow-base':        base,
    '--glow-spread':      spread,
    '--glow-radius':      '20',
    '--glow-border':      '2',
    '--glow-border-size': 'calc(var(--glow-border, 2) * 1px)',
    '--glow-spot-size':   '200px',
    '--glow-hue':         'calc(var(--glow-base) + (var(--glow-xp, 0) * var(--glow-spread, 0)))',
  } as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOW_STYLES }} />
      <div
        ref={cardRef}
        data-glow-card
        style={cssVars}
        className={`relative ${className}`}
      >
        {children}
      </div>
    </>
  );
}
