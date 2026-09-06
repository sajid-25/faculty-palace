"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "faculty_palace_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to 'system' mode as requested
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Check if user previously saved a preference
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initialTheme: Theme = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    setThemeState(initialTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (currentTheme: Theme) => {
      const isDark =
        currentTheme === "dark" || (currentTheme === "system" && mediaQuery.matches);
      const activeResolved: ResolvedTheme = isDark ? "dark" : "light";

      startTransition(() => {
        setResolvedTheme(activeResolved);
      });

      const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
      }
    };

    applyTheme(initialTheme);

    const handleSystemChange = () => {
      // If currently on system, react dynamically to OS appearance changes
      setThemeState((prev) => {
        if (prev === "system") {
          applyTheme("system");
        }
        return prev;
      });
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = newTheme === "dark" || (newTheme === "system" && mediaQuery.matches);
    const activeResolved: ResolvedTheme = isDark ? "dark" : "light";

    setResolvedTheme(activeResolved);

    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

