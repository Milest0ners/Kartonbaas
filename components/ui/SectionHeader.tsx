import { ReactNode } from 'react';

interface SectionHeaderProps {
  pill?: string;
  pillBg?: string;         // tailwind bg class
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  maxWidth?: string;
}

export default function SectionHeader({
  pill,
  pillBg = 'bg-orange-100 border-2 border-orange-300 text-orange-700',
  title,
  description,
  align = 'left',
  className = '',
  maxWidth = 'max-w-xl',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto items-center' : '';

  return (
    <div className={`flex flex-col ${alignClass} ${maxWidth} ${className}`}>
      {pill && (
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 w-fit ${pillBg}`}>
          <span className="text-sm font-black uppercase tracking-widest">{pill}</span>
        </div>
      )}

      <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight text-balance">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-gray-600 font-medium leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
