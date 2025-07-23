import { designTokens } from './tokens';

export interface Theme {
    name: string;
    colors: typeof designTokens.colors & {
        background: string;
        surface: string;
        border: string;
        textPrimary: string;
        textSecondary: string;
        textMuted: string;
    };
    isDark: boolean;
}

// Light Theme (Day mode from your Figma)
export const lightTheme: Theme = {
    name: 'light',
    isDark: false,
    colors: {
        ...designTokens.colors,
        // Card/Surface colors
        background: designTokens.colors.neutral[0],      // #FFFFFF
        surface: designTokens.colors.neutral[50],        // #F9FAFB  
        border: designTokens.colors.neutral[200],        // #E5E7EB

        // Text colors
        textPrimary: designTokens.colors.neutral[900],   // Dark text
        textSecondary: designTokens.colors.neutral[600], // Medium text
        textMuted: designTokens.colors.neutral[400],     // Light text
    },
};

// Dark Theme (Night mode from your Figma)  
export const darkTheme: Theme = {
    name: 'dark',
    isDark: true,
    colors: {
        ...designTokens.colors,
        // Card/Surface colors - using your Figma dark values
        background: designTokens.colors.secondary[900],  // Very dark
        surface: designTokens.colors.secondary[800],     // #1E293B from Figma
        border: designTokens.colors.secondary[700],      // #334155 from Figma

        // Text colors for dark mode
        textPrimary: designTokens.colors.neutral[100],   // Light text
        textSecondary: designTokens.colors.neutral[300], // Medium light text  
        textMuted: designTokens.colors.neutral[500],     // Muted text
    },
};

export const themes = {
    light: lightTheme,
    dark: darkTheme,
} as const;

export type ThemeMode = keyof typeof themes;

// Export design tokens for direct access if needed
export { designTokens } from './tokens';