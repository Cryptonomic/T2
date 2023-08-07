import i18n from 'i18next';
// import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { getLocalData } from './localData';

import translationEN from '../locales/en-US/locale.json';

const savedLocale = getLocalData('settings.locale');

// the translations
const resources = {
    'en-US': {
        locale: translationEN,
    },
    // de: {
    //   translation: translationDE
    // }
};
i18n
    // .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)

    .init({
        // preload: ['en-US', 'de', 'es', 'fr', 'ja', 'ko', 'pt-BR', 'tr', 'ru', 'zh-CN'],
        // load: 'currentOnly',
        resources,
        debug: true,
        backend: {
            loadPath: './locales/{{lng}}/{{ns}}.json',
        },
        lng: savedLocale,
        fallbackLng: 'en-US',
        interpolation: {
            escapeValue: false,
        },
        ns: 'locale',
    });

export default i18n;
