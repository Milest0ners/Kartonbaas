import { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'bold' | 'soft' | 'flat';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<CardVariant, string> = {
  bold: 'bg-white border-2 border-ink rounded-3xl shadow-bold',
  soft: 'bg-white border border-gray-200 rounded-2xl shadow-soft',
  flat: 'bg-white border border-gray-100 rounded-2xl',
};

const PADDINGS: Record<CardPadding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

const HOVER: Record<CardVariant, string> = {
  bold: 'hover:-translate-y-1 hover:shadow-bold-lg transition-all duration-240',
  soft: 'hover:-translate-y-1 hover:shadow-soft-md hover:border-gray-300 transition-all duration-240',
  flat: 'hover:-translate-y-1 hover:shadow-soft hover:border-gray-200 transition-all duration-240',
};

export default function Card({
  variant   = 'bold',
  padding   = 'md',
  hoverable = false,
  children,
  className = '',
  ...rest
}: CardProps) {
  const classes = [
    VARIANTS[variant],
    PADDINGS[padding],
    hoverable ? HOVER[variant] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
