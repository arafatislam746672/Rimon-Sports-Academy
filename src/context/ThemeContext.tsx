import * as React from 'react';

export type ThemeType = 'default' | 'ocean' | 'neon' | 'sunset' | 'royal' | 'cherry' | 'forest' | 'cyberpunk' | 'monochrome';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeType>(() => {
    const saved = localStorage.getItem('app-theme') as ThemeType;
    return saved || 'default';
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    const themeClasses = ['theme-ocean', 'theme-neon', 'theme-sunset', 'theme-royal', 'theme-cherry', 'theme-forest', 'theme-cyberpunk', 'theme-monochrome'];
    root.classList.remove(...themeClasses);
    
    // Add current theme class
    if (theme !== 'default') {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
