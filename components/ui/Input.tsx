'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  success,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...rest
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const borderClass = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
    : success
    ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20'
    : 'border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-orange-500/20';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-bold text-ink"
        >
          {label}
          {rest.required && <span className="text-orange-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-medium text-ink',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2',
            'transition-all duration-180',
            leftIcon  ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            borderClass,
            className,
          ].filter(Boolean).join(' ')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </span>
        )}

        {/* Success icon */}
        {success && !error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}

        {/* Error icon */}
        {error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs font-medium text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs font-medium text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  className = '',
  id,
  ...rest
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const borderClass = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
    : 'border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-orange-500/20';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-ink">
          {label}
          {rest.required && <span className="text-orange-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        className={[
          'w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-medium text-ink resize-none',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2',
          'transition-all duration-180',
          borderClass,
          className,
        ].filter(Boolean).join(' ')}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />

      {error && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs font-medium text-gray-500">{hint}</p>
      )}
    </div>
  );
});
Textarea.displayName = 'Textarea';

export default Input;
