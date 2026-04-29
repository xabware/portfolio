import { projects } from './projects';
import { personalInfo, experiences, education } from './about';
import { skillCategories, additionalSkills } from './skills';
import { translations } from '../translations';
import { siteSettings } from './siteSettings';
import { spaceContent } from './spaceContent';
import type { CMSContentData } from '../services/cmsService';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createDefaultCMSContent(): CMSContentData {
  return clone({
    projects,
    about: {
      personalInfo,
      experiences,
      education,
    },
    skills: {
      categories: skillCategories,
      additionalSkills,
    },
    translations,
    settings: siteSettings,
    space: spaceContent,
  });
}
