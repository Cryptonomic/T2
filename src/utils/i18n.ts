import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-electron-language-detector';
import { initReactI18next } from 'react-i18next';
import { getLocalData } from './localData';
const savedLocale = getLocalData('settings.locale');

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    preload: ['en-US', 'de', 'es', 'fr', 'ja', 'ko', 'pt-BR', 'tr', 'ru', 'zh-CN'],
    load: 'currentOnly',
    debug: true,
    backend: {
      loadPath: './locales/{{lng}}.json'
    },
    lng: savedLocale,
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false
    },
    react: {
      wait: true
    }
  });

export default i18n;
