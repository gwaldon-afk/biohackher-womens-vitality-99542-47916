import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { detectUserLocale, type LocaleInfo } from '@/services/localeService';

const LOCALE_CACHE_KEY = 'biohackher_detected_locale';

export const useLocale = () => {
  const { i18n } = useTranslation();
  const { profile } = useAuth();
  
  // Load cached locale detection on mount
  const [detectedLocale, setDetectedLocale] = useState<LocaleInfo | null>(() => {
    try {
      const cached = localStorage.getItem(LOCALE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Detect locale for guests or when profile is unavailable
  useEffect(() => {
    if (!profile && !detectedLocale) {
      detectUserLocale().then(locale => {
        setDetectedLocale(locale);
        localStorage.setItem(LOCALE_CACHE_KEY, JSON.stringify(locale));
      }).catch(err => {
        console.error('Failed to detect locale:', err);
      });
    }
  }, [profile, detectedLocale]);

  // Clear cache when profile is loaded (handled in useAuth)
  useEffect(() => {
    if (profile) {
      localStorage.removeItem(LOCALE_CACHE_KEY);
      setDetectedLocale(null);
    }
  }, [profile]);

  const getCurrentLocale = () => {
    // Priority: profile → detected → fallback to GB
    return {
      language: profile?.language || detectedLocale?.language || i18n.language,
      country: profile?.country || detectedLocale?.country || 'GB',
      currency: profile?.currency || detectedLocale?.currency || 'GBP',
      measurementSystem: profile?.measurement_system || detectedLocale?.measurementSystem || 'metric',
      timezone: profile?.timezone || detectedLocale?.timezone || 'Europe/London'
    };
  };

  const formatCurrency = (amount: number) => {
    const locale = getCurrentLocale();
    return new Intl.NumberFormat(locale.language, {
      style: 'currency',
      currency: locale.currency
    }).format(amount);
  };

  const formatTemperature = (celsius: number) => {
    const locale = getCurrentLocale();
    if (locale.measurementSystem === 'imperial') {
      const fahrenheit = (celsius * 9/5) + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const formatWeight = (kg: number) => {
    const locale = getCurrentLocale();
    if (locale.measurementSystem === 'imperial') {
      const lbs = kg * 2.20462;
      return `${Math.round(lbs)} lbs`;
    }
    return `${Math.round(kg)} kg`;
  };

  const formatHeight = (cm: number) => {
    const locale = getCurrentLocale();
    if (locale.measurementSystem === 'imperial') {
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
    return `${Math.round(cm)} cm`;
  };

  return {
    getCurrentLocale,
    formatCurrency,
    formatTemperature,
    formatWeight,
    formatHeight,
    isMetric: getCurrentLocale().measurementSystem === 'metric'
  };
};