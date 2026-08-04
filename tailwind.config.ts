// tailwind.config.ts
import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', srf: 'var(--srf)', card: 'var(--card)', card2: 'var(--card2)',
        txt: 'var(--txt)', mut: 'var(--mut)', brd: 'var(--brd)',
        inc: 'var(--inc)', exp: 'var(--exp)', dang: 'var(--dang)', acc: 'var(--acc)'
      },
      fontFamily: { sans: ['-apple-system', 'SF Pro Display', 'Inter', 'Roboto', 'sans-serif'] }
    }
  },
  plugins: []
} satisfies Config;