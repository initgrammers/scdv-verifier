/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#13131A',
        card: '#1C1C28',
        primary: '#7C6EF8',
        accent: '#C8F135',
        success: '#22D87A',
        danger: '#FF4D6A',
        muted: '#7A7A9D',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        'glow-accent': '0 0 8px #C8F135',
        'glow-success': '0 0 20px rgba(34, 216, 122, 0.3)',
        'glow-success-lg': '0 0 40px rgba(34, 216, 122, 0.6)',
        'glow-danger': '0 0 20px rgba(255, 77, 106, 0.3)',
        'glow-danger-lg': '0 0 40px rgba(255, 77, 106, 0.6)',
      },
      animation: {
        'scan-line': 'scan 2s linear infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse-success': 'glowSuccess 1.5s ease-in-out infinite',
        'glow-pulse-danger': 'glowDanger 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in forwards',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowSuccess: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 216, 122, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 216, 122, 0.6)' },
        },
        glowDanger: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 77, 106, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 77, 106, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
