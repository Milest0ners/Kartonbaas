import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ─── Colors ────────────────────────────────────────────────────────────
      colors: {
        orange: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6a0a',
          700: '#c2570a',
        },
        cream: '#fffbf5',
        ink:   '#111827',
        // subtle border variants
        border: {
          light: '#e5e7eb',     // gray-200
          medium: '#d1d5db',    // gray-300
          accent: '#fdba74',    // orange-300
        },
      },

      // ─── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ─── Box Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        // Neo-brutalist (keep existing)
        bold:            '4px 4px 0px #111827',
        'bold-lg':       '6px 6px 0px #111827',
        'bold-orange':   '4px 4px 0px #f97316',
        // Soft / layered (new — vibefy style)
        'soft-sm':       '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'soft':          '0 4px 12px 0 rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'soft-md':       '0 8px 24px 0 rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)',
        'soft-lg':       '0 16px 40px 0 rgb(0 0 0 / 0.1),  0 8px 16px -8px rgb(0 0 0 / 0.06)',
        'soft-xl':       '0 24px 64px 0 rgb(0 0 0 / 0.12), 0 12px 24px -12px rgb(0 0 0 / 0.08)',
        'orange-glow':   '0 8px 24px -4px rgb(249 115 22 / 0.35)',
        'orange-glow-sm':'0 4px 12px -2px rgb(249 115 22 / 0.25)',
        'card-hover':    '0 20px 48px 0 rgb(0 0 0 / 0.12), 0 8px 16px -8px rgb(0 0 0 / 0.08)',
      },

      // ─── Keyframes ─────────────────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'gradient-drift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // ─── Animations ────────────────────────────────────────────────────────
      animation: {
        'accordion-down':  'accordion-down 0.25s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-in',
        'fade-in':         'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':         'shimmer 1.8s ease-in-out infinite',
        'float':           'float 3s ease-in-out infinite',
        'gradient-drift':  'gradient-drift 6s ease infinite',
        'pulse-dot':       'pulse-dot 2s ease-in-out infinite',
        'slide-up':        'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },

      // ─── Transition timing ─────────────────────────────────────────────────
      transitionTimingFunction: {
        'spring':         'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out-back':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'premium':        'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        '120': '120ms',
        '180': '180ms',
        '240': '240ms',
        '350': '350ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
