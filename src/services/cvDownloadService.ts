import type { Language } from '../contexts/LanguageContext';
import { getCVDownloadSettings } from '../data/siteSettings';

interface CVDownload {
  href: string;
  fileName: string;
}

export function getCVDownload(language: Language): CVDownload {
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const cvDownload = getCVDownloadSettings(language);

  return {
    ...cvDownload,
    href: cvDownload.href.startsWith('http') ? cvDownload.href : `${baseUrl}${cvDownload.href}`,
  };
}
