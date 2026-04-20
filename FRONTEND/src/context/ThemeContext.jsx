import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const ThemeContext = createContext(null);

export const DEFAULT_THEME = {
  bg: "#1a1a1a",
  fg: "#ffffff",
  accent: "#00d4ff",
  fontDisplay: "'Inter', sans-serif",
  fontBody: "'Inter', sans-serif",
  filter: "none",
  scanlines: false,
  source: null, // "era" | "director" | null
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("cinemaVault_theme");
    return stored ? JSON.parse(stored) : DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--xp-bg", theme.bg);
    root.style.setProperty("--xp-fg", theme.fg);
    root.style.setProperty("--xp-accent", theme.accent);
    root.style.setProperty("--xp-font-display", theme.fontDisplay);
    root.style.setProperty("--xp-font-body", theme.fontBody);
    root.style.setProperty("--xp-filter", theme.filter);
  }, [theme]);

  const applyTheme = useCallback((config) => {
    const nextTheme = { ...DEFAULT_THEME, ...config };
    setTheme(nextTheme);
    localStorage.setItem("cinemaVault_theme", JSON.stringify(nextTheme));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    localStorage.removeItem("cinemaVault_theme");
  }, []);

  const value = useMemo(() => ({ theme, applyTheme, resetTheme }), [theme, applyTheme, resetTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
