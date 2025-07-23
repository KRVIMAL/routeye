/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Your exact Figma colors
        primary: {
          50: '#E8EFFE',
          100: '#C3D4FD',
          200: '#9BB8FC',
          300: '#749CFB',
          400: '#4D80FA',
          500: '#2463EB', // Your primary
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1F3A8A',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155', // Your Figma secondary
          800: '#1E293B', // Your Figma dark
          900: '#0F172A',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        // Theme-aware colors using CSS variables
        'surface': 'var(--bg-surface)',
        'background': 'var(--bg-background)',
        'border-default': 'var(--border-default)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },

      // Your Figma typography
      fontSize: {
        'heading': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body': ['0.75rem', { lineHeight: '1rem' }],
        'body-small': ['0.5rem', { lineHeight: '1rem' }],
        'submenu': ['0.75rem', { lineHeight: '1rem' }],
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}