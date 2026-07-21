import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import authEn from './locales/en/auth.json';
import clientsEn from './locales/en/clients.json';
import commonEn from './locales/en/common.json';
import contractsEn from './locales/en/contracts.json';
import authPtBR from './locales/pt-BR/auth.json';
import clientsPtBR from './locales/pt-BR/clients.json';
import commonPtBR from './locales/pt-BR/common.json';
import contractsPtBR from './locales/pt-BR/contracts.json';

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { common: commonPtBR, auth: authPtBR, clients: clientsPtBR, contracts: contractsPtBR },
      en: { common: commonEn, auth: authEn, clients: clientsEn, contracts: contractsEn },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en'],
    ns: ['common', 'auth', 'clients', 'contracts'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18next;
