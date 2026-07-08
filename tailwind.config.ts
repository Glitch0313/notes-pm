import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        cairo: ['var(--font-cairo)', 'sans-serif'],
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'orbit-reverse': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(-360deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.15', transform: 'scale(0.8)' },
          '50%':       { opacity: '1',    transform: 'scale(1.2)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 16px 4px rgba(139,92,246,0.35)' },
          '50%':       { boxShadow: '0 0 40px 14px rgba(139,92,246,0.65)' },
        },
        'counter-spin': {
          from: { transform: 'translateX(-50%) rotate(0deg)' },
          to:   { transform: 'translateX(-50%) rotate(-360deg)' },
        },
        'counter-spin-reverse': {
          from: { transform: 'translateX(-50%) rotate(0deg)' },
          to:   { transform: 'translateX(-50%) rotate(360deg)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        scan:                   'scan 2s linear infinite',
        float:                  'float 4s ease-in-out infinite',
        'fade-up':              'fade-up 0.6s ease forwards',
        blob:                   'blob 8s ease-in-out infinite',
        'orbit-slow':           'orbit 28s linear infinite',
        'orbit-medium':         'orbit 18s linear infinite',
        'orbit-fast':           'orbit 11s linear infinite',
        'orbit-reverse-slow':   'orbit-reverse 22s linear infinite',
        'orbit-reverse-medium': 'orbit-reverse 14s linear infinite',
        twinkle:                'twinkle 3s ease-in-out infinite',
        'pulse-glow':           'pulse-glow 3s ease-in-out infinite',
        'counter-slow':         'counter-spin 28s linear infinite',
        'counter-medium':       'counter-spin 18s linear infinite',
        'counter-fast':         'counter-spin 11s linear infinite',
        'counter-rev-slow':     'counter-spin-reverse 22s linear infinite',
        'counter-rev-medium':   'counter-spin-reverse 14s linear infinite',
        'marquee':              'marquee 28s linear infinite',
        'marquee-slow':         'marquee 42s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
