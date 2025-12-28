import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, LanguageCode } from '@/i18n';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  favorites: { questions: string[]; signs: string[] };
  toggleFavorite: (type: 'questions' | 'signs', id: string) => void;
  stats: { quizzesTaken: number; bestScore: number; totalCorrect: number; totalAnswered: number; totalScore: number };
  updateStats: (correct: number, total: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  
  const [language, setLanguageState] = useState<LanguageCode>(() => 
    (localStorage.getItem('language') as LanguageCode) || 'en'
  );
  
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => 
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'light'
  );
  
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(() => 
    localStorage.getItem('hasSeenOnboarding') === 'true'
  );
  
  const [favorites, setFavorites] = useState<{ questions: string[]; signs: string[] }>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : { questions: [], signs: [] };
  });
  
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('stats');
    const fallback = { quizzesTaken: 0, bestScore: 0, totalCorrect: 0, totalAnswered: 0, totalScore: 0 };
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return { ...fallback, ...parsed };
  });

  const [soundEnabled, setSoundEnabledState] = useState(() => 
    localStorage.getItem('soundEnabled') !== 'false'
  );

  const [vibrationEnabled, setVibrationEnabledState] = useState(() => 
    localStorage.getItem('vibrationEnabled') !== 'false'
  );

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('soundEnabled', String(enabled));
  };

  const setVibrationEnabled = (enabled: boolean) => {
    setVibrationEnabledState(enabled);
    localStorage.setItem('vibrationEnabled', String(enabled));
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    const langInfo = languages.find(l => l.code === lang);
    document.documentElement.dir = langInfo?.dir || 'ltr';
    document.documentElement.lang = lang;
    if (langInfo) {
      document.documentElement.style.setProperty('--lang-font-size', `${langInfo.fontSize}px`);
      document.documentElement.style.setProperty('--lang-line-height', String(langInfo.lineHeight));
      document.documentElement.style.setProperty('--lang-heading-line-height', String(langInfo.headingLineHeight));
      document.documentElement.style.setProperty('--lang-pad', String(langInfo.pad));
      document.documentElement.style.setProperty('--lang-text-width', langInfo.textWidth);
    }
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setHasSeenOnboarding = (seen: boolean) => {
    setHasSeenOnboardingState(seen);
    localStorage.setItem('hasSeenOnboarding', String(seen));
  };

  const toggleFavorite = (type: 'questions' | 'signs', id: string) => {
    setFavorites(prev => {
      const list = prev[type];
      const newList = list.includes(id) ? list.filter(i => i !== id) : [...list, id];
      const newFavorites = { ...prev, [type]: newList };
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const updateStats = (correct: number, total: number) => {
    setStats((prev: typeof stats) => {
      const score = Math.round((correct / total) * 100);
      const newStats = {
        quizzesTaken: prev.quizzesTaken + 1,
        bestScore: Math.max(prev.bestScore, score),
        totalCorrect: prev.totalCorrect + correct,
        totalAnswered: prev.totalAnswered + total,
        totalScore: (prev.totalScore ?? 0) + score,
      };
      localStorage.setItem('stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  useEffect(() => {
    const langInfo = languages.find(l => l.code === language);
    document.documentElement.dir = langInfo?.dir || 'ltr';
    document.documentElement.lang = language;
    i18n.changeLanguage(language);
    if (langInfo) {
      document.documentElement.style.setProperty('--lang-font-size', `${langInfo.fontSize}px`);
      document.documentElement.style.setProperty('--lang-line-height', String(langInfo.lineHeight));
      document.documentElement.style.setProperty('--lang-heading-line-height', String(langInfo.headingLineHeight));
      document.documentElement.style.setProperty('--lang-pad', String(langInfo.pad));
      document.documentElement.style.setProperty('--lang-text-width', langInfo.textWidth);
    }
  }, [language, i18n]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const value: AppContextType = {
    language,
    setLanguage,
    theme,
    setTheme,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    favorites,
    toggleFavorite,
    stats,
    updateStats,
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
