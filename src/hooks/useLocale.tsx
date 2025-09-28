import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

export const useLocale = () => {
  const { i18n } = useTranslation();
  const { profile } = useAuth();

  const getCurrentLocale = () => {
    return {
      language: i18n.language,
      country: profile?.country || 'GB',
      currency: profile?.currency || 'GBP',
      measurementSystem: profile?.measurement_system || 'metric',
      timezone: profile?.timezone || 'Europe/London'
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