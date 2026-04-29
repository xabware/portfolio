/**
 * Almacen en memoria para datos CMS cargados desde Firebase.
 * Si un campo es null, los modulos de datos caen al dato estatico por defecto.
 */
import { useSyncExternalStore } from 'react';
import type { Project } from '../data/projects';
import type { PersonalInfo, Experience, Education } from '../data/about';
import type { SkillCategory } from '../data/skills';
import type { SiteSettings } from '../data/siteSettings';
import type { SpaceContent } from '../data/spaceContent';
import type { TranslationOverrides } from '../translations';
import type { CMSAboutData, CMSSkillsData } from '../services/cmsService';

export const cmsStore = {
  projects: null as Project[] | null,
  personalInfo: null as PersonalInfo | null,
  experiences: null as Experience[] | null,
  education: null as Education[] | null,
  skillCategories: null as SkillCategory[] | null,
  additionalSkills: null as { es: string[]; en: string[] } | null,
  translations: null as TranslationOverrides | null,
  settings: null as SiteSettings | null,
  space: null as SpaceContent | null,
  loaded: false,
  version: 0,
};

export interface CMSStorePatch {
  projects?: Project[] | null;
  about?: CMSAboutData | null;
  skills?: CMSSkillsData | null;
  translations?: TranslationOverrides | null;
  settings?: SiteSettings | null;
  space?: SpaceContent | null;
}

const listeners = new Set<() => void>();

function emitCMSStoreChange() {
  cmsStore.version += 1;
  listeners.forEach(listener => listener());
}

function subscribeCMSStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getCMSStoreVersion() {
  return cmsStore.version;
}

export function useCMSDataVersion(): number {
  return useSyncExternalStore(subscribeCMSStore, getCMSStoreVersion, getCMSStoreVersion);
}

export function applyCMSData(patch: CMSStorePatch): void {
  if ('projects' in patch) cmsStore.projects = patch.projects ?? null;

  if ('about' in patch) {
    cmsStore.personalInfo = patch.about?.personalInfo ?? null;
    cmsStore.experiences = patch.about?.experiences ?? null;
    cmsStore.education = patch.about?.education ?? null;
  }

  if ('skills' in patch) {
    cmsStore.skillCategories = patch.skills?.categories ?? null;
    cmsStore.additionalSkills = patch.skills?.additionalSkills ?? null;
  }

  if ('translations' in patch) cmsStore.translations = patch.translations ?? null;
  if ('settings' in patch) cmsStore.settings = patch.settings ?? null;
  if ('space' in patch) cmsStore.space = patch.space ?? null;

  cmsStore.loaded = true;
  emitCMSStoreChange();
}
