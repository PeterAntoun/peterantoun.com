import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Electric blue accent with cyan highlights — looks best on a dark canvas.
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          cyan: '#06B6D4',
        },
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
