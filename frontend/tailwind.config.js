/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          bg: '#050811',
          card: 'rgba(10, 16, 28, 0.82)',
          cardLight: 'rgba(18, 28, 48, 0.75)',
          border: 'rgba(56, 189, 248, 0.20)',
          borderHover: 'rgba(56, 189, 248, 0.45)',
          glow: 'rgba(14, 165, 233, 0.25)',
          critical: '#ef4444',
          high: '#f97316',
          moderate: '#eab308',
          low: '#10b981',
          cyan: '#06b6d4',
          blue: '#3b82f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.65)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.45)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.35)'
      }
    },
  },
  plugins: [],
}
