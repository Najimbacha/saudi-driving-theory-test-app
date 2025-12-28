import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ar from './locales/ar.json';
import ur from './locales/ur.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';

export const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    fontSize: 16,
    lineHeight: 1.5,
    headingLineHeight: 1.2,
    pad: 1,
    textWidth: '72ch',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    fontSize: 17,
    lineHeight: 1.7,
    headingLineHeight: 1.3,
    pad: 1.15,
    textWidth: '68ch',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    dir: 'rtl',
    fontSize: 17,
    lineHeight: 1.8,
    headingLineHeight: 1.35,
    pad: 1.2,
    textWidth: '68ch',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    dir: 'ltr',
    fontSize: 16.5,
    lineHeight: 1.6,
    headingLineHeight: 1.25,
    pad: 1.1,
    textWidth: '60ch',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    dir: 'ltr',
    fontSize: 17.5,
    lineHeight: 1.75,
    headingLineHeight: 1.3,
    pad: 1.15,
    textWidth: '58ch',
  },
] as const;

export type LanguageCode = typeof languages[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      ur: { translation: ur },
      hi: { translation: hi },
      bn: { translation: bn },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
