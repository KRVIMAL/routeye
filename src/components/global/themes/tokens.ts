export const designTokens = {
    colors: {
        // Primary Colors - From your Figma
        primary: {
            50: '#E8EFFE',
            100: '#C3D4FD',
            200: '#9BB8FC',
            300: '#749CFB',
            400: '#4D80FA',
            500: '#2463EB', // Your primary #2463EB
            600: '#1D4ED8',
            700: '#1E40AF',
            800: '#1E3A8A',
            900: '#1F3A8A',
        },

        // Secondary Colors - From your Figma  
        secondary: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155', // Your #334155
            800: '#1E293B', // Your #1E293B
            900: '#0F172A',
        },

        // Neutral colors
        neutral: {
            0: '#FFFFFF',    // Pure white - #FFFFFF from Figma
            50: '#F9FAFB',
            100: '#F3F4F6',  // Your #F3F4F6
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

        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },
} as const;