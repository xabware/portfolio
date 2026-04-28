import type { Language } from '../contexts/LanguageContext';

interface CVDownload {
  href: string;
  fileName: string;
}

const cvDownloadsByLanguage: Record<Language, CVDownload> = {
  es: {
    href: 'cv/xabier-cia-valencia-cv-es.pdf',
    fileName: 'Xabier-Cia-Valencia-CV-ES.pdf',
  },
  en: {
    href: 'cv/xabier-cia-valencia-cv-en.pdf',
    fileName: 'Xabier-Cia-Valencia-CV-EN.pdf',
  },
};

export function getCVDownload(language: Language): CVDownload {
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const cvDownload = cvDownloadsByLanguage[language];

  return {
    ...cvDownload,
    href: `${baseUrl}${cvDownload.href}`,
  };
}
