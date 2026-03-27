'use client';

import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import type { AnimationPlaybackControls } from 'framer-motion';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // Keep a stable ref to the current animation controls so we can stop it
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  // Keep a ref to the loop starter so onComplete closures always see latest version
  const loopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const size = direction === 'horizontal' ? width : height;
    if (!size) return;

    const contentSize = size + gap;
    const loopFrom = reverse ? -contentSize / 2 : 0;
    const loopTo   = reverse ? 0 : -contentSize / 2;
    const activeDuration = isHovered && durationOnHover ? durationOnHover : duration;

    // Helper: start one animation leg from `from` to `loopTo`, then loop
    const startFrom = (from: number) => {
      const totalLen   = Math.abs(loopTo - loopFrom);
      const remaining  = Math.abs(loopTo - from);
      const scaledDur  = totalLen > 0
        ? activeDuration * (remaining / totalLen)
        : activeDuration;

      // Stop any running animation first
      controlsRef.current?.stop();

      // Snap to start position without animation
      translation.set(from);

      controlsRef.current = animate(translation, loopTo, {
        ease: 'linear',
        duration: scaledDur > 0.05 ? scaledDur : 0.05,
        onComplete: () => {
          // Seamless teleport: positions look identical because content is duplicated
          translation.set(loopFrom);
          loopRef.current();
        },
      });
    };

    // Store the loop-from-start function so onComplete closures can call it
    loopRef.current = () => startFrom(loopFrom);

    // On first run or after a size change: start from wherever we currently are
    // (avoids a visible snap when dimensions change mid-animation)
    const currentPos = translation.get();
    const alreadyInRange =
      (loopFrom <= loopTo && currentPos >= loopFrom && currentPos <= loopTo) ||
      (loopFrom >= loopTo && currentPos <= loopFrom && currentPos >= loopTo);

    if (alreadyInRange && currentPos !== loopFrom) {
      // Resume from current position — proportional duration
      const totalLen  = Math.abs(loopTo - loopFrom);
      const remaining = Math.abs(loopTo - currentPos);
      const scaledDur = totalLen > 0
        ? activeDuration * (remaining / totalLen)
        : activeDuration;

      controlsRef.current?.stop();
      controlsRef.current = animate(translation, loopTo, {
        ease: 'linear',
        duration: scaledDur > 0.05 ? scaledDur : 0.05,
        onComplete: () => {
          translation.set(loopFrom);
          loopRef.current();
        },
      });
    } else {
      startFrom(loopFrom);
    }

    return () => {
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, gap, direction, reverse, duration, durationOnHover, isHovered]);

  const hoverProps = durationOnHover
    ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      }
    : {};

  return (
    <div
      className={cn('overflow-hidden', className)}
      {...hoverProps}
    >
      <motion.div
        className="flex w-max"
        style={{
          ...(direction === 'horizontal' ? { x: translation } : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
