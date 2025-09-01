import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Palette EY officielle
        'ey-yellow': '#FFE600',
        'ey-black': '#1A1A24',
        'ey-white': '#FFFFFF',
        'ey-light-gray': '#F6F6FA',
        'ey-dark-gray': '#E7E7EA',
        'ey-accent-blue': '#4EBEEB',
        'ey-red': '#DC2626',
        'ey-green': '#10B981',
        'ey-purple': '#6E2585',
        'ey-orange': '#F97316',
        
        // Alias sémantiques
        'ey-primary': '#FFE600',
        'ey-secondary': '#1A1A24',
        'ey-tertiary': '#4EBEEB',
        'ey-success': '#10B981',
        'ey-danger': '#DC2626',
        'ey-warning': '#F97316',
        'ey-info': '#4EBEEB',
        
        // Nuances supplémentaires
        'ey-yellow-light': '#FFF4B3',
        'ey-yellow-dark': '#E6CE00',
        'ey-gray-50': '#FAFAFA',
        'ey-gray-100': '#F4F4F5',
        'ey-gray-200': '#E4E4E7',
        'ey-gray-300': '#D4D4D8',
        'ey-gray-400': '#A1A1AA',
        'ey-gray-500': '#71717A',
        'ey-gray-600': '#52525B',
        'ey-gray-700': '#3F3F46',
        'ey-gray-800': '#27272A',
        'ey-gray-900': '#18181B',
        
        // Variables CSS par défaut
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#FFE600',
          foreground: '#1A1A24',
        },
        secondary: {
          DEFAULT: '#1A1A24',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F6F6FA',
          foreground: '#71717A',
        },
        accent: {
          DEFAULT: '#4EBEEB',
          foreground: '#1A1A24',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        'ey-sm': '0.25rem',
        'ey-md': '0.5rem',
        'ey-lg': '0.75rem',
        'ey-xl': '1rem',
        'ey-2xl': '1.5rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        'ey-sans': ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'ey-xs': ['0.75rem', { lineHeight: '1rem' }],
        'ey-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'ey-base': ['1rem', { lineHeight: '1.5rem' }],
        'ey-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'ey-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'ey-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'ey-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'ey-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        'ey-5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        'ey-xs': '0.5rem',
        'ey-sm': '1rem',
        'ey-md': '1.5rem',
        'ey-lg': '2rem',
        'ey-xl': '3rem',
        'ey-2xl': '4rem',
      },
      boxShadow: {
        'ey-sm': '0 1px 2px 0 rgba(26, 26, 36, 0.05)',
        'ey-md': '0 4px 6px -1px rgba(26, 26, 36, 0.1), 0 2px 4px -1px rgba(26, 26, 36, 0.06)',
        'ey-lg': '0 10px 15px -3px rgba(26, 26, 36, 0.1), 0 4px 6px -2px rgba(26, 26, 36, 0.05)',
        'ey-xl': '0 20px 25px -5px rgba(26, 26, 36, 0.1), 0 10px 10px -5px rgba(26, 26, 36, 0.04)',
        'ey-2xl': '0 25px 50px -12px rgba(26, 26, 36, 0.25)',
        'ey-inner': 'inset 0 2px 4px 0 rgba(26, 26, 36, 0.06)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config