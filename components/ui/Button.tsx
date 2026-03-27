'use client';

import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'orange-outline';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement>  & { href: string };

type Props = ButtonProps | AnchorProps;

// ─── Style maps ──────────────────────────────────────────────────────────────

const VARIANTS: Record<Variant, string> = {
  primary: [
    'bg-orange-500 text-white border-2 border-ink shadow-bold',
    'hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
    'focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
    'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
  ].join(' '),

  secondary: [
    'bg-white text-ink border-2 border-ink shadow-bold',
    'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
    'focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
    'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
  ].join(' '),

  ghost: [
    'bg-transparent text-gray-600 border border-transparent',
    'hover:bg-gray-100 hover:text-ink hover:border-gray-200',
    'focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1',
    'active:bg-gray-200',
  ].join(' '),

  'orange-outline': [
    'bg-transparent text-orange-600 border-2 border-orange-400',
    'hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700',
    'focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2',
    'active:bg-orange-100',
  ].join(' '),
};

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-6 py-3 text-sm rounded-2xl gap-2',
  lg: 'px-8 py-4 text-base rounded-2xl gap-2.5',
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>((props, ref) => {
  const {
    variant    = 'primary',
    size       = 'md',
    isLoading  = false,
    leftIcon,
    rightIcon,
    children,
    className  = '',
    ...rest
  } = props;

  const base = [
    'inline-flex items-center justify-center font-black select-none cursor-pointer',
    'transition-all',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ');

  const inner = (
    <>
      {isLoading ? <Spinner /> : leftIcon && <span aria-hidden="true">{leftIcon}</span>}
      {children && (
        <span style={{ opacity: isLoading ? 0.7 : 1 }}>
          {children}
        </span>
      )}
      {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </>
  );

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as AnchorProps;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={base}
        {...anchorRest}
      >
        {inner}
      </a>
    );
  }

  const { ...btnRest } = rest as ButtonProps;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={base}
      disabled={(btnRest as ButtonHTMLAttributes<HTMLButtonElement>).disabled || isLoading}
      {...(btnRest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {inner}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
