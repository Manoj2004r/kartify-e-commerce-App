/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B1F3A',
          light: '#132A4D',
        },
        brand: {
          50: '#EBF1FF',
          100: '#D6E3FF',
          200: '#ADC7FF',
          300: '#84AAFF',
          400: '#5B8EFF',
          500: '#2A6DF4',
          600: '#1E56C9',
          700: '#16409B',
          800: '#0F2D6E',
          900: '#0B1F3A',
        },
        sunburst: {
          DEFAULT: '#FF7A00',
          light: '#FF9B3D',
          dark: '#D96600',
        },
        cream: '#F7F8FA',
        success: '#16A34A',
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 31, 58, 0.06), 0 4px 12px rgba(11, 31, 58, 0.06)',
        cardHover: '0 8px 24px rgba(11, 31, 58, 0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
