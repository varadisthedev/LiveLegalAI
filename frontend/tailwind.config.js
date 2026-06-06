/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Core palette ──────────────────────────────
        brand: {
          bg:      '#07020d',   // deepest bg
          surface: '#0d0517',   // cards / panels
          panel:   '#160a26',   // elevated panels
          border:  '#2d1b4e',   // default border
          purple:  '#7c3aed',   // primary accent
          violet:  '#9333ea',   // secondary accent
          lilac:   '#c4b5fd',   // soft text
          lavender:'#a78bfa',   // muted text
          glow:    '#d8b4fe',   // glow highlight
        },
        // ── Status colours ───────────────────────────
        safe:    '#10B981',
        warning: '#f59e0b',
        danger:  '#ef4444',
        info:    '#3A86FF',
        // ── Legacy aliases so existing dashboard code doesn't break ──
        darkbg:     '#07020d',
        darkpanel:  '#0d0517',
        darkborder: '#2d1b4e',
        primary: {
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          bold:   '#9333ea',
          accent: '#a855f7',
        },
      },
      boxShadow: {
        soft:   '0 4px 20px rgba(0,0,0,0.5)',
        purple: '0 0 24px rgba(124,58,237,0.35)',
        blue:   '0 0 24px rgba(58,134,255,0.35)',
      },
      borderRadius: {
        '2xl':  '1rem',
        '3xl':  '1.5rem',
        '4xl':  '2rem',
      },
    },
  },
  plugins: [],
};
