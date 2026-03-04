/**
 * Servicio CMS — Lee contenido del portfolio desde Firestore.
 * Los documentos se almacenan en la colección "portfolio_content".
 */
import { db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import type { Project } from '../data/projects';
import type { PersonalInfo, Experience, Education } from '../data/about';
import type { SkillCategory } from '../data/skills';

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

async function loadDoc<T>(docId: string): Promise<T | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, docId));
    return snap.exists() ? (snap.data() as T) : null;
  } catch (e) {
    console.warn(`[CMS] Error loading ${docId}:`, e);
    return null;
  }
}

export async function loadAllCMSData() {
  const [projectsDoc, aboutDoc, skillsDoc] = await Promise.all([
    loadDoc<{ items: Project[] }>('projects'),
    loadDoc<CMSAboutData>('about'),
    loadDoc<CMSSkillsData>('skills'),
  ]);

  return {
    projects: projectsDoc?.items ?? null,
    about: aboutDoc,
    skills: skillsDoc,
  };
}
