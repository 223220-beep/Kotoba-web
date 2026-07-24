"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { es, type Translations } from "./es";
import { en } from "./en";

type Lang = "es" | "en";

const translations: Record<Lang, Translations> = { es, en };

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "es";
  return (localStorage.getItem("kotoba_lang") as Lang) || "es";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("kotoba_lang", l);
  };

  const t = translations[lang];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}
