/**
 * Almacén en memoria para datos CMS cargados desde Firebase.
 * Si un campo es null, los módulos de datos caen al dato estático por defecto.
 */
import type { Project } from '../data/projects';
import type { PersonalInfo, Experience, Education } from '../data/about';
import type { SkillCategory } from '../data/skills';

export const cmsStore = {
  projects: null as Project[] | null,
  personalInfo: null as PersonalInfo | null,
  experiences: null as Experience[] | null,
  education: null as Education[] | null,
  skillCategories: null as SkillCategory[] | null,
  additionalSkills: null as { es: string[]; en: string[] } | null,
  loaded: false,
};
