import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // Load translation using http -> see /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // Fix for JSON parsing error
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      parse: (data) => {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse translation JSON:', e);
          return {}; // Return empty object to prevent app from crashing
        }
      }
    },
    
    react: {
      useSuspense: false, // This prevents issues during SSR or when translations aren't loaded yet
    }
  });

export default i18n;