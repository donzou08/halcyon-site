/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F1F5F8',
        /* Kestrel Castings. The blue from the company mark. */
        brand: '#0B67B2',
        branddark: '#08528C',
        brandsoft: '#E8F1F9',
        card: '#FFFFFF',
        ink: '#0F172A',
        muted: '#64748B',
        faint: '#94A3B8',
        line: '#E2E8F0',
        good: '#16A34A',
        goodsoft: '#DCFCE7',
        warn: '#D97706',
        warnsoft: '#FEF3C7',
        bad: '#DC2626',
        badsoft: '#FEE2E2',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        wordmark: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        card: '16px',
        control: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.18)',
        lift: '0 2px 4px rgba(15,23,42,0.08), 0 12px 32px -14px rgba(15,23,42,0.24)',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(15,23,42,0)' },
          '20%': { boxShadow: '0 0 0 4px rgba(37,99,235,0.28)' },
          '100%': { boxShadow: '0 0 0 0 rgba(15,23,42,0)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sheetIn: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1000ms ease-out 1',
        riseIn: 'riseIn 260ms ease-out 1',
        sheetIn: 'sheetIn 240ms cubic-bezier(0.22, 1, 0.36, 1) 1',
        fadeIn: 'fadeIn 200ms ease-out 1',
      },
    },
  },
  plugins: [],
};
