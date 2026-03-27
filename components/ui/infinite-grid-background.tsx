'use client';

import { useMotionValue, useMotionTemplate, useAnimationFrame, motion } from 'framer-motion';
import type React from 'react';

// ─── SVG grid pattern ─────────────────────────────────────────────────────────

function GridPattern({
  offsetX,
  offsetY,
  size,
  patternId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offsetX: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offsetY: any;
  size: number;
  patternId: string;
}) {
  return (
    <svg className="w-full h-full" aria-hidden="true">
      <defs>
        <motion.pattern
          id={patternId}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

interface InfiniteGridBackgroundProps {
  gridSize?: number;
  className?: string;
  color?: string;
}

export function InfiniteGridBackground({
  gridSize = 32,
  className = '',
}: InfiniteGridBackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  // Continuously scroll the grid
  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.4) % gridSize);
    gridOffsetY.set((gridOffsetY.get() + 0.4) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      onMouseMove={handleMouseMove}
      style={{ pointerEvents: 'none' }}
    >
      {/* Subtle base grid — always visible */}
      <div className="absolute inset-0 opacity-[0.045] text-blue-400">
        <GridPattern
          offsetX={gridOffsetX}
          offsetY={gridOffsetY}
          size={gridSize}
          patternId="footer-grid-base"
        />
      </div>

      {/* Flashlight grid — revealed on mouse hover */}
      <motion.div
        className="absolute inset-0 opacity-25 text-blue-400"
        style={{ maskImage, WebkitMaskImage: maskImage, pointerEvents: 'none' }}
      >
        <GridPattern
          offsetX={gridOffsetX}
          offsetY={gridOffsetY}
          size={gridSize}
          patternId="footer-grid-active"
        />
      </motion.div>
    </div>
  );
}
