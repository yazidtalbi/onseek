"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Hardcode to light mode for now as requested
  const theme = "light" as Theme;

  React.useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const setTheme = React.useCallback((newTheme: Theme) => {
    // No-op to disable theme switching
  }, []);

  const toggleTheme = React.useCallback(() => {
    // No-op to disable theme switching
  }, []);

  // Always provide context, even before mount (with default values)
  const contextValue = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    // Return default values instead of throwing during SSR or if provider not available
    return {
      theme: "light" as Theme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}

