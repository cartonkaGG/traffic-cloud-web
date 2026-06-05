/** @type {import('tailwindcss').Config} */
export default {
  content: ['./apps/panel/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#030712',
          raised: '#0a0f1a',
          panel: '#0f172a',
          graphite: '#111827',
          muted: '#1f2937'
        },
        frost: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          strong: 'rgba(255,255,255,0.10)'
        },
        accent: {
          DEFAULT: '#5ec8ff',
          dim: 'rgba(94, 200, 255, 0.14)',
          glow: 'rgba(94, 200, 255, 0.35)'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glass: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px -32px rgba(0,0,0,0.85)',
        glow: '0 0 40px -8px rgba(94, 200, 255, 0.35)'
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'radial-fog':
          'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(94,200,255,0.18), transparent 55%)'
      },
      backgroundSize: {
        grid: '48px 48px'
      },
      animation: {
        'gradient-shift': 'gradient-shift 14s ease infinite',
        shimmer: 'shimmer 2.2s ease-in-out infinite'
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        shimmer: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
