import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const lightColors = {
    background: '#F4F7F9', // Crisp light, calming background
    card: '#FFFFFF', // Clean structure
    checkboxBg: '#EEF2F6', // Subtle interaction area

    // Gradients transition from a vibrant trustworthy blue to a deep, secure navy
    primaryGradientStart: '#0052FF',
    primaryGradientMid: '#0047E0',
    primaryGradientEnd: '#0033B8',

    primary: '#0052FF', // "Trust/Security" Blue (Common in banking)
    accent: '#059669', // "Wealth/Growth" Green

    text: '#111827', // High contrast readability
    textSecondary: '#6B7280', // Less cognitive load for sub-info

    danger: '#DC2626', // Sharp alert red
    success: '#059669', // Positive balance green
    warning: '#D97706', // Cautionary orange

    border: '#E5E7EB', // Soft boundaries

    // Chart specifics mapped for psychology
    chartIncome: '#059669', // Leftover/Income 
    chartUnpaid: '#F59E0B', // Unpaid (Warning)
    chartPaid: '#0052FF', // Paid/Spent (Reliable action)
};

export const darkColors = {
    background: '#0D1117', // Very deep, sleek navy/black (reduced eye strain)
    card: '#161B22', // Elevated depth
    checkboxBg: '#21262D',

    primaryGradientStart: '#3B82F6',
    primaryGradientMid: '#2563EB',
    primaryGradientEnd: '#1D4ED8',

    primary: '#3B82F6', // Vibrant blue for dark mode visibility
    accent: '#10B981',

    text: '#F9FAFB',
    textSecondary: '#9CA3AF',

    danger: '#EF4444',
    success: '#10B981',
    warning: '#FBBF24',

    border: '#30363D', // Subtle structural lines

    chartIncome: '#10B981',
    chartUnpaid: '#FBBF24',
    chartPaid: '#3B82F6',
};

export type ThemeColors = typeof lightColors;

interface ThemeContextType {
    isDark: boolean;
    colors: ThemeColors;
    currency: string;
    setCurrency: (c: string) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: true,
    colors: darkColors,
    currency: '$',
    setCurrency: () => { },
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState<boolean>(true); // Default to dark for the "professional dark mode" feel
    const [currency, setCurrencyState] = useState<string>('$');

    useEffect(() => {
        (async () => {
            const storedTheme = await AsyncStorage.getItem('@theme_pref');
            if (storedTheme === 'light') setIsDark(false);
            else if (storedTheme === 'dark') setIsDark(true);
            else setIsDark(systemScheme === 'dark');

            const storedCurrency = await AsyncStorage.getItem('@currency_pref');
            if (storedCurrency) setCurrencyState(storedCurrency);
        })();
    }, [systemScheme]);

    const setCurrency = async (sym: string) => {
        setCurrencyState(sym);
        await AsyncStorage.setItem('@currency_pref', sym);
    };

    const toggleTheme = async () => {
        const nextState = !isDark;
        setIsDark(nextState);
        await AsyncStorage.setItem('@theme_pref', nextState ? 'dark' : 'light');
    };

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDark, colors, currency, setCurrency, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
