'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../locales/en.json';
import ko from '../locales/ko.json';


const translations = { en, ko };

type Locale = 'en' | 'ko';



interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('ko'); // Default to Korean
  const [t, setT] = useState<TranslationKeys>(translations[locale] as TranslationKeys);

  // Load from session storage on initial render
  useEffect(() => {
    const savedLocale = sessionStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ko')) {
      setLocale(savedLocale);
    }
  }, []);

  // Update translations and save to session storage when locale changes
  useEffect(() => {
    setT(translations[locale]);
    sessionStorage.setItem('locale', locale);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};
