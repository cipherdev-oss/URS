import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';
export type ThemeAccent = 'blue' | 'indigo' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose';

export interface ThemeAccentConfig {
  id: ThemeAccent;
  name: string;
  colorHex: string;
  bgGradient: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  btnBg: string;
  btnHover: string;
  ringColor: string;
}

export const THEME_ACCENTS: ThemeAccentConfig[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    colorHex: '#3b82f6',
    bgGradient: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeBorder: 'border-blue-500/30',
    textColor: 'text-blue-500 dark:text-blue-400',
    btnBg: 'bg-blue-600',
    btnHover: 'hover:bg-blue-500',
    ringColor: 'ring-blue-500',
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    colorHex: '#6366f1',
    bgGradient: 'from-indigo-600 to-violet-600',
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    badgeBorder: 'border-indigo-500/30',
    textColor: 'text-indigo-500 dark:text-indigo-400',
    btnBg: 'bg-indigo-600',
    btnHover: 'hover:bg-indigo-500',
    ringColor: 'ring-indigo-500',
  },
  {
    id: 'emerald',
    name: 'Cyber Mint',
    colorHex: '#10b981',
    bgGradient: 'from-emerald-600 to-teal-600',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/30',
    textColor: 'text-emerald-500 dark:text-emerald-400',
    btnBg: 'bg-emerald-600',
    btnHover: 'hover:bg-emerald-500',
    ringColor: 'ring-emerald-500',
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    colorHex: '#06b6d4',
    bgGradient: 'from-cyan-600 to-blue-600',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeBorder: 'border-cyan-500/30',
    textColor: 'text-cyan-500 dark:text-cyan-400',
    btnBg: 'bg-cyan-600',
    btnHover: 'hover:bg-cyan-500',
    ringColor: 'ring-cyan-500',
  },
  {
    id: 'purple',
    name: 'Cosmic Violet',
    colorHex: '#a855f7',
    bgGradient: 'from-purple-600 to-fuchsia-600',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeBorder: 'border-purple-500/30',
    textColor: 'text-purple-500 dark:text-purple-400',
    btnBg: 'bg-purple-600',
    btnHover: 'hover:bg-purple-500',
    ringColor: 'ring-purple-500',
  },
  {
    id: 'amber',
    name: 'Solar Gold',
    colorHex: '#f59e0b',
    bgGradient: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeBorder: 'border-amber-500/30',
    textColor: 'text-amber-500 dark:text-amber-400',
    btnBg: 'bg-amber-600',
    btnHover: 'hover:bg-amber-500',
    ringColor: 'ring-amber-500',
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    colorHex: '#f43f5e',
    bgGradient: 'from-rose-600 to-pink-600',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeBorder: 'border-rose-500/30',
    textColor: 'text-rose-500 dark:text-rose-400',
    btnBg: 'bg-rose-600',
    btnHover: 'hover:bg-rose-500',
    ringColor: 'ring-rose-500',
  },
];

interface ThemeContextType {
  mode: ThemeMode;
  accent: ThemeAccent;
  accentConfig: ThemeAccentConfig;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_MODE_KEY = 'lnbti_theme_mode';
const STORAGE_ACCENT_KEY = 'lnbti_theme_accent';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MODE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'dark';
  });

  const [accent, setAccentState] = useState<ThemeAccent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACCENT_KEY) as ThemeAccent;
      if (THEME_ACCENTS.some(a => a.id === saved)) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'blue';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_MODE_KEY, newMode);
    } catch (e) {
      console.error(e);
    }
  };

  const setAccent = (newAccent: ThemeAccent) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem(STORAGE_ACCENT_KEY, newAccent);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-accent', accent);
    if (mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [mode, accent]);

  const accentConfig = THEME_ACCENTS.find(a => a.id === accent) || THEME_ACCENTS[0];

  return (
    <ThemeContext.Provider value={{ mode, accent, accentConfig, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
