import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Theme, ThemeMode, themes } from '../components/global/themes';

export const useTheme = () => {
    // Use your existing localStorage hook
    const [savedTheme, setSavedTheme] = useLocalStorage<ThemeMode>('routeye-theme', 'light');
    const [currentTheme, setCurrentTheme] = useState<Theme>(themes[savedTheme]);

    // Update theme when saved theme changes
    useEffect(() => {
        const theme = themes[savedTheme];
        setCurrentTheme(theme);

        // Update CSS custom properties for your existing components
        const root = document.documentElement;

        // Set your design token colors as CSS variables
        Object.entries(theme.colors.primary).forEach(([key, value]) => {
            root.style.setProperty(`--color-primary-${key}`, value);
        });

        Object.entries(theme.colors.secondary).forEach(([key, value]) => {
            root.style.setProperty(`--color-secondary-${key}`, value);
        });

        // Set surface colors for your cards/backgrounds
        root.style.setProperty('--bg-surface', theme.colors.surface);
        root.style.setProperty('--bg-background', theme.colors.background);
        root.style.setProperty('--border-default', theme.colors.border);
        root.style.setProperty('--text-primary', theme.colors.textPrimary);
        root.style.setProperty('--text-secondary', theme.colors.textSecondary);

        // Add/remove dark class for Tailwind
        if (theme.isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [savedTheme]);

    const toggleTheme = () => {
        const newTheme = savedTheme === 'light' ? 'dark' : 'light';
        setSavedTheme(newTheme);
    };

    const setTheme = (mode: ThemeMode) => {
        setSavedTheme(mode);
    };

    return {
        theme: currentTheme,
        mode: savedTheme,
        toggleTheme,
        setTheme,
    };
};