"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type ThemeMode = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: "dark" | "light";
  mode: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  mode: "system",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  function applyTheme(t: "dark" | "light") {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }

  const resolveAndApply = useCallback((m: ThemeMode) => {
    const resolved = m === "system" ? getSystemTheme() : m;
    setThemeState(resolved);
    applyTheme(resolved);
  }, []);

  // On mount, read preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kotoba-theme") as ThemeMode | null;
    const preferred: ThemeMode = saved === "light" || saved === "system" ? saved : "dark";
    setModeState(preferred);
    resolveAndApply(preferred);
  }, [resolveAndApply]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => resolveAndApply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, resolveAndApply]);

  function setTheme(m: ThemeMode) {
    setModeState(m);
    resolveAndApply(m);
    localStorage.setItem("kotoba-theme", m);
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
