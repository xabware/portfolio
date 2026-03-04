/**
 * Carga datos CMS desde Firebase al arrancar la app.
 * Mientras carga, no renderiza hijos (flash invisible).
 * Si falla, se usan los datos estáticos.
 */
import { useState, useEffect, type ReactNode } from 'react';
import { loadAllCMSData } from '../services/cmsService';
import { cmsStore } from '../stores/cmsDataStore';

export function CMSLoader({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(cmsStore.loaded);

  useEffect(() => {
    if (cmsStore.loaded) return;

    loadAllCMSData()
      .then(({ projects, about, skills }) => {
        if (projects) cmsStore.projects = projects;
        if (about) {
          cmsStore.personalInfo = about.personalInfo;
          cmsStore.experiences = about.experiences;
          cmsStore.education = about.education;
        }
        if (skills) {
          cmsStore.skillCategories = skills.categories;
          cmsStore.additionalSkills = skills.additionalSkills;
        }
      })
      .catch((err) => {
        console.warn('[CMS] Failed to load, using static data:', err);
      })
      .finally(() => {
        cmsStore.loaded = true;
        setReady(true);
      });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
