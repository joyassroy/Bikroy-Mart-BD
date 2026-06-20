"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getTranslation } from "@/i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bikroy-mart-lang");
    if (saved && (saved === "en" || saved === "bn")) {
      setLanguage(saved);
    }
    setIsLoaded(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "bn" : "en";
    setLanguage(newLang);
    localStorage.setItem("bikroy-mart-lang", newLang);
  };

  const setLang = (lang) => {
    if (lang === "en" || lang === "bn") {
      setLanguage(lang);
      localStorage.setItem("bikroy-mart-lang", lang);
    }
  };

  const t = getTranslation(language);

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: "en", t: getTranslation("en"), toggleLanguage: () => {}, setLang: () => {} };
  }
  return context;
}
