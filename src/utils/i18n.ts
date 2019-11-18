import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-electron-language-detector';
import { initReactI18next } from 'react-i18next';

i18n
  // load translation using xhr -> see /public/locales
  // learn more: https://github.com/i18next/i18next-xhr-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  // .init({
  //   fallbackLng: 'en',
  //   debug: true,
  //   load: 'languageOnly',
  //   interpolation: {
  //     escapeValue: false, // not needed for react as it escapes by default
  //   },
  // });
  .init({
    preload: ['en-US', 'de', 'es', 'fr', 'ja', 'ko', 'pt-BR', 'tr', 'zh-CN'],
    load: 'currentOnly',
    debug: true,
    backend: {
      loadPath: 'locales/{{lng}}.json'
    },
    fallbackLng: 'en-US',
    // whitelist: ['en', 'de', 'es', 'fr', 'ja', 'ko', 'pt-BR', 'tr', 'zh'],
    interpolation: {
      escapeValue: false
    },
    react: {
      wait: true
    }
  });

export default i18n;
