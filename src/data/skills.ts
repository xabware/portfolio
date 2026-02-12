/**
 * =====================================================
 * CONFIGURACIÓN DE HABILIDADES
 * =====================================================
 * 
 * Aquí puedes añadir, modificar o eliminar tus habilidades.
 * Los datos están estructurados en categorías para una mejor
 * organización.
 * 
 * PLANTILLA PARA CATEGORÍA:
 * {
 *   title: {
 *     es: 'Categoría en español',
 *     en: 'Category in English',
 *   },
 *   skills: [
 *     { name: 'Nombre de la habilidad', level: 85 },
 *   ],
 * }
 * 
 * El nivel (level) debe ser un número entre 0 y 100.
 * 
 * =====================================================
 */

import type { Language } from '../contexts/LanguageContext';

// Interfaz para una habilidad individual
export interface Skill {
  name: string;
  level: number;
}

// Interfaz para una categoría de habilidades
export interface SkillCategory {
  title: {
    es: string;
    en: string;
  };
  skills: Skill[];
}

// Interfaz para categoría con idioma resuelto
export interface ResolvedSkillCategory {
  title: string;
  skills: Skill[];
}

/**
 * =====================================================
 * CATEGORÍAS DE HABILIDADES
 * =====================================================
 * Define tus categorías principales de habilidades aquí.
 * =====================================================
 */
export const skillCategories: SkillCategory[] = [
  {
    title: {
      es: 'Frontend',
      en: 'Frontend',
    },
    skills: [
      { name: 'React', level: 95 },
      { name: 'ASP', level: 90 },
      { name: 'CSS', level: 70 },
      { name: 'Angular.js', level: 90 },
    ],
  },
  {
    title: {
      es: 'Backend',
      en: 'Backend',
    },
    skills: [
      { name: '.NET', level: 90 },
      { name: 'Python', level: 85 },
      { name: 'Java', level: 75 },
      { name: 'PHP', level: 80 },
    ],
  },
  {
    title: {
      es: 'Bases de Datos',
      en: 'Databases',
    },
    skills: [
      { name: 'Microsoft SQL Server', level: 95 },
      { name: 'SQL', level: 95 },
      { name: 'Entity Framework', level: 90 },
      { name: 'T-SQL', level: 90 },
    ],
  },
  {
    title: {
      es: 'DevOps y Herramientas',
      en: 'DevOps & Tools',
    },
    skills: [
      { name: 'Git', level: 100 },
      { name: 'Docker', level: 70 },
      { name: 'Azure DevOps', level: 70 },
      { name: 'AWS', level: 60 },
      { name: 'CI/CD', level: 80 },
    ],
  },
];

/**
 * =====================================================
 * HABILIDADES ADICIONALES
 * =====================================================
 * Otras competencias y conocimientos que no tienen nivel
 * numérico pero son importantes mencionar.
 * =====================================================
 */
export const additionalSkills = {
  es: [
    'Metodologías Ágiles / Scrum',
    'APIs REST',
    'Arquitectura de Microservicios',
    'Testing y Pruebas Automatizadas',
    'Diseño UI/UX',
    'Diseño Responsive',
    'Optimización de Rendimiento',
    'Mejores Prácticas de Seguridad',
    'Liderazgo de Equipos',
    'Trabajo Autónomo',
  ],
  en: [
    'Agile Methodologies / Scrum',
    'REST APIs',
    'Microservices Architecture',
    'Testing & Automated Testing',
    'UI/UX Design',
    'Responsive Design',
    'Performance Optimization',
    'Security Best Practices',
    'Team Leadership',
    'Autonomous Work',
  ],
};

/**
 * Resuelve las categorías al idioma especificado
 */
export function getSkillCategories(language: Language): ResolvedSkillCategory[] {
  return skillCategories.map(category => ({
    title: category.title[language],
    skills: category.skills,
  }));
}

/**
 * Obtiene las habilidades adicionales en el idioma especificado
 */
export function getAdditionalSkills(language: Language): string[] {
  return additionalSkills[language];
}
