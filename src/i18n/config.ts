import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import main translation resources
import en_GB from './locales/en-GB.json';
import en_US from './locales/en-US.json';
import en_AU from './locales/en-AU.json';
import en_CA from './locales/en-CA.json';

// Import pillar analysis translations
import lisPillarAnalysis_AU from './locales/lis-pillar-analysis-en-AU.json';
import lisPillarAnalysis_US from './locales/lis-pillar-analysis-en-US.json';
import nutritionPillarAnalysis_AU from './locales/nutrition-pillar-analysis-en-AU.json';
import nutritionPillarAnalysis_US from './locales/nutrition-pillar-analysis-en-US.json';

const resources = {
  'en-GB': { translation: { ...en_GB, ...lisPillarAnalysis_AU, ...nutritionPillarAnalysis_AU } },
  'en-US': { translation: { ...en_US, ...lisPillarAnalysis_US, ...nutritionPillarAnalysis_US } },
  'en-AU': { translation: { ...en_AU, ...lisPillarAnalysis_AU, ...nutritionPillarAnalysis_AU } },
  'en-CA': { translation: { ...en_CA, ...lisPillarAnalysis_US, ...nutritionPillarAnalysis_US } },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-AU',
    lng: 'en-AU', // Set AU English as default
    supportedLngs: ['en-AU', 'en-GB', 'en-US', 'en-CA'],
    load: 'currentOnly',
    react: {
      useSuspense: false, // Prevent race conditions with translation loading
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;