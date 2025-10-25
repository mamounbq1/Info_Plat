/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    // 🔽 SCALE DOWN: Reduce all spacing by 30%
    spacing: {
      '0': '0',
      '0.5': '0.0875rem',  // 0.125rem * 0.7
      '1': '0.175rem',     // 0.25rem * 0.7
      '1.5': '0.2625rem',  // 0.375rem * 0.7
      '2': '0.35rem',      // 0.5rem * 0.7
      '2.5': '0.4375rem',  // 0.625rem * 0.7
      '3': '0.525rem',     // 0.75rem * 0.7
      '3.5': '0.6125rem',  // 0.875rem * 0.7
      '4': '0.7rem',       // 1rem * 0.7
      '5': '0.875rem',     // 1.25rem * 0.7
      '6': '1.05rem',      // 1.5rem * 0.7
      '7': '1.225rem',     // 1.75rem * 0.7
      '8': '1.4rem',       // 2rem * 0.7
      '9': '1.575rem',     // 2.25rem * 0.7
      '10': '1.75rem',     // 2.5rem * 0.7
      '11': '1.925rem',    // 2.75rem * 0.7
      '12': '2.1rem',      // 3rem * 0.7
      '14': '2.45rem',     // 3.5rem * 0.7
      '16': '2.8rem',      // 4rem * 0.7
      '20': '3.5rem',      // 5rem * 0.7
      '24': '4.2rem',      // 6rem * 0.7
      '28': '4.9rem',      // 7rem * 0.7
      '32': '5.6rem',      // 8rem * 0.7
      '36': '6.3rem',      // 9rem * 0.7
      '40': '7rem',        // 10rem * 0.7
      '44': '7.7rem',      // 11rem * 0.7
      '48': '8.4rem',      // 12rem * 0.7
      '52': '9.1rem',      // 13rem * 0.7
      '56': '9.8rem',      // 14rem * 0.7
      '60': '10.5rem',     // 15rem * 0.7
      '64': '11.2rem',     // 16rem * 0.7
      '72': '12.6rem',     // 18rem * 0.7
      '80': '14rem',       // 20rem * 0.7
      '96': '16.8rem',     // 24rem * 0.7
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4b8fc',
          400: '#8094f8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          50: '#fef3f2',
          100: '#fee5e2',
          200: '#fecfca',
          300: '#fdaea6',
          400: '#fb7f72',
          500: '#f35c47',
          600: '#e03f29',
          700: '#bc321e',
          800: '#9c2d1c',
          900: '#812c1e',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
      },
      animation: {
        'confetti': 'confetti 5s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      scale: {
        '102': '1.02',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
