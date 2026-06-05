import type { Config } from 'tailwindcss';

const config: Config = {
  // Theme is toggled by adding/removing `.dark` on <html>.
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Electric blue accent with cyan highlights — works on both canvases.
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          cyan: '#06B6D4',
        },
        // Semantic tokens driven by CSS variables in globals.css. Each resolves
        // per theme, so components can stay theme-agnostic. `<alpha-value>` lets
        // utilities like `text-fg/70` or `border-line/10` work as usual.
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: {
          950: '#08090c',
          900: '#0b0d12',
          850: '#0f1218',
          800: '#13161d',
          700: '#1c2029',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'gradient-pan': 'gradient-pan 12s ease infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
