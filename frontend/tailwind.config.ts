import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101418',
        panel: '#182027',
        line: '#2b3640',
        buy: '#13b981',
        sell: '#f05d5e',
        amber: '#eab308',
        cyan: '#35b8d4',
      },
      boxShadow: {
        panel: '0 18px 50px rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
} satisfies Config;
