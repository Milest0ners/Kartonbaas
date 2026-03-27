'use client';

import { motion } from 'framer-motion';

interface HeroPillProps {
  href: string;
  label: string;
  announcement?: string;
  className?: string;
  isExternal?: boolean;
}

export function HeroPill({
  href,
  label,
  announcement = '📣 Nieuw',
  className = '',
  isExternal = false,
}: HeroPillProps) {
  return (
    <motion.a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={[
        'inline-flex items-center gap-2 rounded-full',
        'bg-orange-500/15 ring-1 ring-orange-400/40',
        'px-2 py-1 whitespace-nowrap',
        'hover:bg-orange-500/25 transition-colors duration-180',
        className,
      ].join(' ')}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Badge */}
      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wide">
        {announcement}
      </span>
      {/* Label */}
      <span className="text-xs font-bold text-ink sm:text-sm">
        {label}
      </span>
      {/* Arrow */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className="text-ink"
      >
        <path
          d="M8.78141 5.33312L5.20541 1.75712L6.14808 0.814453L11.3334 5.99979L6.14808 11.1851L5.20541 10.2425L8.78141 6.66645H0.666748V5.33312H8.78141Z"
          fill="currentColor"
        />
      </svg>
    </motion.a>
  );
}
