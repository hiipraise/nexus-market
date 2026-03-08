import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf8e9',
          100: '#f9edbe',
          200: '#f3d97a',
          300: '#e1b983',
          400: '#d4a05a',
          500: '#c88b00',
          600: '#a87200',
          700: '#875a00',
          800: '#664300',
          900: '#452d00',
        },
        purple: {
          50:  '#f3eef8',
          100: '#e0d3ef',
          200: '#c3a9e0',
          300: '#a57fcf',
          400: '#8a5ab0',
          500: '#7a5498',
          600: '#634080',
          700: '#4d2f70',
          800: '#3a2056',
          900: '#27133d',
        },
        brand: {
          primary:   '#c88b00',
          secondary: '#e1b983',
          accent:    '#7a5498',
          dark:      '#4d2f70',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'monospace'],
      },
      animation: {
        'fade-in':       'fadeIn 0.5s ease-in-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'slide-down':    'slideDown 0.4s ease-out',
        'slide-left':    'slideLeft 0.4s ease-out',
        'slide-right':   'slideRight 0.4s ease-out',
        'scale-in':      'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'shimmer':       'shimmer 2s infinite',
        'pulse-gold':    'pulseGold 2s infinite',
        'spin-slow':     'spin 3s linear infinite',
        'marquee':       'marquee 25s linear infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown:    { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideLeft:    { '0%': { transform: 'translateX(20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        slideRight:   { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        scaleIn:      { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        bounceSubtle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseGold:    { '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,139,0,0.4)' }, '70%': { boxShadow: '0 0 0 10px rgba(200,139,0,0)' } },
        marquee:      { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      backgroundImage: {
        'gradient-gold':   'linear-gradient(135deg, #c88b00 0%, #e1b983 100%)',
        'gradient-purple': 'linear-gradient(135deg, #4d2f70 0%, #7a5498 100%)',
        'gradient-brand':  'linear-gradient(135deg, #4d2f70 0%, #7a5498 50%, #c88b00 100%)',
        'gradient-dark':   'linear-gradient(180deg, #1a0a2e 0%, #0d0517 100%)',
        'shimmer-bg':      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        'noise':           "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'gold':         '0 4px 24px rgba(200,139,0,0.3)',
        'gold-lg':      '0 8px 40px rgba(200,139,0,0.4)',
        'purple':       '0 4px 24px rgba(122,84,152,0.3)',
        'purple-lg':    '0 8px 40px rgba(77,47,112,0.4)',
        'card':         '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover':   '0 8px 32px rgba(0,0,0,0.16)',
        'inner-gold':   'inset 0 0 20px rgba(200,139,0,0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}

export default config
