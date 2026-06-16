/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ["'Playfair Display'", 'Georgia', 'serif'],
        heading: ["'Space Grotesk'", 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        premium: {
          50:  '#f0f5fa',
          100: '#e0ebf5',
          200: '#c2d8eb',
          300: '#a3c4e0',
          400: '#7C9FC9',
          500: '#527FB0',
          600: '#3d6a9e',
          700: '#2a5589',
          800: '#1a4070',
          900: '#052558',
          950: '#011023',
        },
        accent: {
          blue:  '#527FB0',
          cyan:  '#7C9FC9',
          emerald: '#10b981',
          purple: '#8b5cf6',
          orange: '#f97316',
          pink:  '#ec4899',
        },
        surface: {
          DEFAULT: '#011023',
          light:   '#02142D',
          card:    '#052558',
          hover:   '#0a2f5e',
          border:  'rgba(82,127,176,0.10)',
          'border-hover': 'rgba(82,127,176,0.18)',
        },
        'surface-light': {
          DEFAULT: '#ffffff',
          light:   '#EFF3F9',
          card:    '#ffffff',
          hover:   '#E5EBF3',
          border:  'rgba(5,37,88,0.08)',
          'border-hover': 'rgba(5,37,88,0.12)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'premium-gradient': 'linear-gradient(135deg, #527FB0 0%, #7C9FC9 50%, #C2E8FF 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.6)',
        'glass-sm': '0 4px 16px rgba(0,0,0,0.4)',
        'glow': '0 0 40px rgba(82,127,176,0.15)',
        'glow-cyan': '0 0 40px rgba(124,159,201,0.15)',
        'glow-emerald': '0 0 40px rgba(16,185,129,0.15)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease forwards',
        'slide-down': 'slideDown 0.3s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%':    { backgroundPosition: '-200% 0' },
          '100%':  { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%':    { opacity: '0', transform: 'translateY(20px)' },
          '100%':  { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':    { opacity: '0', transform: 'translateY(-20px)' },
          '100%':  { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':    { opacity: '0', transform: 'scale(0.95)' },
          '100%':  { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%':    { opacity: '0' },
          '100%':  { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
