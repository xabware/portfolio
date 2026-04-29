/**
 * Servicio CMS: lee y escribe contenido del portfolio en Firestore.
 * Los documentos viven en la coleccion "portfolio_content".
 */
import { db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Project } from '../data/projects';
import type { PersonalInfo, Experience, Education } from '../data/about';
import type { SkillCategory } from '../data/skills';
import type { SiteSettings } from '../data/siteSettings';
import type { SpaceContent } from '../data/spaceContent';
import type { TranslationOverrides } from '../translations';

const COLLECTION = 'portfolio_content';

export interface CMSAboutData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
}

export interface CMSSkillsData {
  categories: SkillCategory[];
  additionalSkills: { es: string[]; en: string[] };
}

export interface CMSContentData {
  projects: Project[];
  about: CMSAboutData;
  skills: CMSSkillsData;
  translations: TranslationOverrides;
  settings: SiteSettings;
  space: SpaceContent;
}

export interface LoadedCMSContent {
  projects: Project[] | null;
  about: CMSAboutData | null;
  skills: CMSSkillsData | null;
  translations: TranslationOverrides | null;
  settings: SiteSettings | null;
  space: SpaceContent | null;
}

export type CMSDocId = keyof CMSContentData;

async function loadDoc<T>(docId: string): Promise<T | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, docId));
    return snap.exists() ? (snap.data() as T) : null;
  } catch (e) {
    console.warn(`[CMS] Error loading ${docId}:`, e);
    return null;
  }
}

function sanitizeForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function saveCMSDoc<T extends CMSDocId>(docId: T, data: CMSContentData[T]) {
  const payload = docId === 'projects' ? { items: data } : data;
  await setDoc(doc(db, COLLECTION, docId), sanitizeForFirestore(payload));
}

export async function loadAllCMSData(): Promise<LoadedCMSContent> {
  const [projectsDoc, aboutDoc, skillsDoc, translationsDoc, settingsDoc, spaceDoc] = await Promise.all([
    loadDoc<{ items: Project[] }>('projects'),
    loadDoc<CMSAboutData>('about'),
    loadDoc<CMSSkillsData>('skills'),
    loadDoc<TranslationOverrides>('translations'),
    loadDoc<SiteSettings>('settings'),
    loadDoc<SpaceContent>('space'),
  ]);

  return {
    projects: projectsDoc?.items ?? null,
    about: aboutDoc,
    skills: skillsDoc,
    translations: translationsDoc,
    settings: settingsDoc,
    space: spaceDoc,
  };
}
