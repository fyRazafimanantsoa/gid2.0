module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './components/**/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        calmBlue: {
          DEFAULT: '#4A90E2',
          light: '#79B1F2',
          dark: '#357ABD',
        },
        cyanAccent: {
          DEFAULT: '#00BFA6',
          light: '#33CCB8',
          dark: '#009985',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        sparkle: 'sparkle 1.5s ease-in-out infinite',
        'toast-in': 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'toast-in': {
          '0%': { transform: 'translateY(100%) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
