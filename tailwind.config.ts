import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      /* ── Brand Colors ─────────────────────────────────────────── */
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary orange
          600: '#ea6e10',
          700: '#c2540a',
          800: '#9a3c05',
          900: '#7c2d05',
          950: '#431407',
        },
        surface: {
          DEFAULT: '#0a0a0a', // Near-black canvas
          1: '#111111',
          2: '#1a1a1a',
          3: '#242424',
          4: '#2e2e2e',
        },
        ink: {
          DEFAULT: '#f5f5f5',
          muted: '#a3a3a3',
          faint: '#525252',
        },
      },

      /* ── Typography ────────────────────────────────────────────── */
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],  // Bold headings — Google Font
        body: ['DM Sans', 'sans-serif'],        // Clean body copy — Google Font
        mono: ['JetBrains Mono', 'monospace'],
      },

      /* ── Spacing scale additions ───────────────────────────────── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '128': '32rem',
        '144': '36rem',
      },

      /* ── Border radius ─────────────────────────────────────────── */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      /* ── Box shadows ───────────────────────────────────────────── */
      boxShadow: {
        'glow-brand': '0 0 40px -8px rgba(249, 115, 22, 0.5)',
        'glow-sm': '0 0 20px -4px rgba(249, 115, 22, 0.35)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4)',
      },

      /* ── Custom Keyframes ──────────────────────────────────────── */
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-out-right': 'slide-out-right 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },

      /* ── Transition timing ─────────────────────────────────────── */
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      /* ── Screens (matches SCSS breakpoints) ───────────────────── */
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },

  plugins: [],
};

export default config;