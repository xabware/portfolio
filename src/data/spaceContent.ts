import type { Language } from '../contexts/LanguageContext';
import { cmsStore } from '../stores/cmsDataStore';

export type SpacePlanetType = 'terrestrial' | 'gas_giant' | 'ice' | 'volcanic';

export interface SpacePlanetContent {
  id: 'projects' | 'experience' | 'education' | 'skills';
  name: Record<Language, string>;
  description: Record<Language, string>;
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  planetType: SpacePlanetType;
}

export interface SpaceContent {
  planets: SpacePlanetContent[];
}

export const spaceContent: SpaceContent = {
  planets: [
    {
      id: 'projects',
      name: { es: 'Proyectos', en: 'Projects' },
      description: {
        es: 'Mis proyectos destacados y trabajos realizados',
        en: 'My featured projects and completed works',
      },
      color: '#60a5fa',
      size: 5,
      orbitRadius: 50,
      orbitSpeed: 0.02,
      planetType: 'terrestrial',
    },
    {
      id: 'experience',
      name: { es: 'Experiencia', en: 'Experience' },
      description: {
        es: 'Mi trayectoria profesional',
        en: 'My professional journey',
      },
      color: '#e8a850',
      size: 9,
      orbitRadius: 85,
      orbitSpeed: 0.012,
      planetType: 'gas_giant',
    },
    {
      id: 'education',
      name: { es: 'Educación', en: 'Education' },
      description: {
        es: 'Mi formación académica',
        en: 'My academic background',
      },
      color: '#88ccff',
      size: 4,
      orbitRadius: 125,
      orbitSpeed: 0.01,
      planetType: 'ice',
    },
    {
      id: 'skills',
      name: { es: 'Habilidades', en: 'Skills' },
      description: {
        es: 'Tecnologías y herramientas que domino',
        en: 'Technologies and tools I master',
      },
      color: '#ff6644',
      size: 4.5,
      orbitRadius: 160,
      orbitSpeed: 0.008,
      planetType: 'volcanic',
    },
  ],
};

export function getSpaceContent(): SpaceContent {
  return cmsStore.space ?? spaceContent;
}

export function getSpacePlanetContent(id: SpacePlanetContent['id']): SpacePlanetContent {
  return getSpaceContent().planets.find(planet => planet.id === id)
    ?? spaceContent.planets.find(planet => planet.id === id)!;
}
