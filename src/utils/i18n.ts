import adminEn from '../locales/en/admin.json';
import assistantEn from '../locales/en/assistant.json';
import bookingEn from '../locales/en/booking.json';
import commonEn from '../locales/en/common.json';
import partnerEn from '../locales/en/partner.json';
import travelerEn from '../locales/en/traveler.json';
import walletEn from '../locales/en/wallet.json';
import adminVi from '../locales/vi/admin.json';
import assistantVi from '../locales/vi/assistant.json';
import bookingVi from '../locales/vi/booking.json';
import commonVi from '../locales/vi/common.json';
import partnerVi from '../locales/vi/partner.json';
import travelerVi from '../locales/vi/traveler.json';
import walletVi from '../locales/vi/wallet.json';

export type AppLanguage = 'vi' | 'en';

export const localeText: Record<AppLanguage, Record<string, string>> = {
  vi: {
    ...commonVi,
    ...travelerVi,
    ...walletVi,
    ...bookingVi,
    ...partnerVi,
    ...adminVi,
    ...assistantVi,
  },
  en: {
    ...commonEn,
    ...travelerEn,
    ...walletEn,
    ...bookingEn,
    ...partnerEn,
    ...adminEn,
    ...assistantEn,
  },
};

export function translate(language: AppLanguage, key: string, fallback = key) {
  return localeText[language]?.[key] || fallback;
}

export function createTranslator(language: AppLanguage) {
  return (key: string, fallback?: string) => translate(language, key, fallback);
}
