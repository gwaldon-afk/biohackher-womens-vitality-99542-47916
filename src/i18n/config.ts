import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import en_GB from './locales/en-GB.json';
import en_US from './locales/en-US.json';
import en_AU from './locales/en-AU.json';
import en_CA from './locales/en-CA.json';

const resources = {
  'en-GB': { translation: en_GB },
  'en-US': { translation: en_US },
  'en-AU': { translation: en_AU },
  'en-CA': { translation: en_CA },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-GB',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;