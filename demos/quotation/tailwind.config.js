/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Meridian Industrial Flooring's own identity — a deep industrial blue.
        // Deliberately distinct from Halcyon's gold/teal: each client gets their
        // own branded tool, and Halcyon stays the quiet builder underneath.
        brand: {
          50: '#eef6fd',
          100: '#d7e9fa',
          200: '#b0d2f4',
          300: '#7fb4ea',
          400: '#4a90dc',
          500: '#2470c4',
          600: '#1459a6',
          700: '#0f4785',
          800: '#0e3a6b',
          900: '#0d3159',
        },
        // Meridian's secondary — a warm signal orange for line marking / safety
        // cues, which is what this trade actually paints on floors.
        signal: {
          400: '#f59e42',
          500: '#e8801a',
          600: '#c46410',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
