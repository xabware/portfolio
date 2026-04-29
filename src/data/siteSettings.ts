import type { Language } from '../contexts/LanguageContext';
import { cmsStore } from '../stores/cmsDataStore';

export interface LocalizedText {
  es: string;
  en: string;
}

export type ContactMethodType = 'email' | 'linkedin' | 'github' | 'website' | 'custom';

export interface ContactMethod {
  id: string;
  type: ContactMethodType;
  title: LocalizedText;
  value: string;
  href: string;
}

export interface CVDownloadSetting {
  href: string;
  fileName: string;
}

export interface EmailJSSettings {
  serviceId: string;
  templateId: string;
  publicKey: string;
  toEmail: string;
}

export interface SiteSettings {
  contactMethods: ContactMethod[];
  cvDownloads: Record<Language, CVDownloadSetting>;
  emailJs: EmailJSSettings;
}

export const siteSettings: SiteSettings = {
  contactMethods: [
    {
      id: 'email',
      type: 'email',
      title: { es: 'Email', en: 'Email' },
      value: 'xabierciava@gmail.com',
      href: 'mailto:xabierciava@gmail.com',
    },
    {
      id: 'linkedin',
      type: 'linkedin',
      title: { es: 'LinkedIn', en: 'LinkedIn' },
      value: 'linkedin.com/in/xabier-cia',
      href: 'https://www.linkedin.com/in/xabier-cia',
    },
    {
      id: 'github',
      type: 'github',
      title: { es: 'GitHub', en: 'GitHub' },
      value: 'github.com/xabware',
      href: 'https://github.com/xabware',
    },
  ],
  cvDownloads: {
    es: {
      href: 'cv/xabier-cia-valencia-cv-es.pdf',
      fileName: 'Xabier-Cia-Valencia-CV-ES.pdf',
    },
    en: {
      href: 'cv/xabier-cia-valencia-cv-en.pdf',
      fileName: 'Xabier-Cia-Valencia-CV-EN.pdf',
    },
  },
  emailJs: {
    serviceId: 'service_p926wet',
    templateId: 'template_4aupjtt',
    publicKey: 'Dg-aiS2kIuJ66I-Us',
    toEmail: 'tu@email.com',
  },
};

export function getSiteSettings(): SiteSettings {
  return cmsStore.settings ?? siteSettings;
}

export function getContactMethods(language: Language): Array<ContactMethod & { displayTitle: string }> {
  return getSiteSettings().contactMethods.map(method => ({
    ...method,
    displayTitle: method.title[language] || method.title.es || method.title.en,
  }));
}

export function getCVDownloadSettings(language: Language): CVDownloadSetting {
  return getSiteSettings().cvDownloads[language];
}

export function getEmailJSSettings(): EmailJSSettings {
  return getSiteSettings().emailJs;
}
