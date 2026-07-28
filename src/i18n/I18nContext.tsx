import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Locale,
  TranslationDictionary,
  translations,
  formatCurrencyLocale,
  formatDateLocale,
  formatNumberLocale,
  formatPercentLocale,
} from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: string | Date | number, formatStyle?: 'short' | 'medium' | 'long') => string;
  formatNumber: (value: number, decimals?: number) => string;
  formatPercent: (value: number, decimals?: number) => string;
  isMaori: boolean;
  languageName: string;
  languageFlag: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCAL_STORAGE_I18N_KEY = 'kiwiledger_locale';

export interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLocale = 'en-NZ',
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_I18N_KEY);
      if (saved === 'en-NZ' || saved === 'mi-NZ' || saved === 'my-MM' || saved === 'zom-MM') {
        return saved;
      }
    } catch {
      // Fallback if localStorage unavailable
    }
    return defaultLocale;
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCAL_STORAGE_I18N_KEY, newLocale);
    } catch {
      // Ignore write errors
    }
  };

  const t = (key: keyof TranslationDictionary, fallback?: string): string => {
    const activeDict = translations[locale] || translations['en-NZ'];
    return activeDict[key] || fallback || translations['en-NZ'][key] || String(key);
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    return formatCurrencyLocale(amount, locale, currency);
  };

  const formatDate = (
    date: string | Date | number,
    formatStyle: 'short' | 'medium' | 'long' = 'medium'
  ): string => {
    return formatDateLocale(date, locale, formatStyle);
  };

  const formatNumber = (value: number, decimals: number = 2): string => {
    return formatNumberLocale(value, locale, decimals);
  };

  const formatPercent = (value: number, decimals: number = 1): string => {
    return formatPercentLocale(value, locale, decimals);
  };

  const isMaori = locale === 'mi-NZ';
  const getLanguageDetails = (loc: Locale) => {
    switch (loc) {
      case 'mi-NZ':
        return { name: 'Te Reo Māori', flag: '🇳🇿 Māori', short: 'Māori' };
      case 'my-MM':
        return { name: 'မြန်မာဘာသာ', flag: '🇲🇲 မြန်မာ', short: 'မြန်မာ' };
      case 'zom-MM':
        return { name: 'Zomi (Tedim)', flag: '🇲🇲 Zomi', short: 'Zomi' };
      case 'en-NZ':
      default:
        return { name: 'English (NZ)', flag: '🇳🇿 English', short: 'EN' };
    }
  };

  const langDetails = getLanguageDetails(locale);
  const languageName = langDetails.name;
  const languageFlag = langDetails.flag;

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatCurrency,
        formatDate,
        formatNumber,
        formatPercent,
        isMaori,
        languageName,
        languageFlag,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Provide a safe fallback if used outside Provider
    return {
      locale: 'en-NZ',
      setLocale: () => {},
      t: (key, fallback) => translations['en-NZ'][key] || fallback || String(key),
      formatCurrency: (amount, currency) => formatCurrencyLocale(amount, 'en-NZ', currency),
      formatDate: (date, formatStyle) => formatDateLocale(date, 'en-NZ', formatStyle),
      formatNumber: (value, decimals) => formatNumberLocale(value, 'en-NZ', decimals),
      formatPercent: (value, decimals) => formatPercentLocale(value, 'en-NZ', decimals),
      isMaori: false,
      languageName: 'English (NZ)',
      languageFlag: '🇳🇿 English',
    };
  }
  return context;
}
