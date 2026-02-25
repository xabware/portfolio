/**
 * =====================================================
 * CONFIGURACIÓN DE INFORMACIÓN PERSONAL
 * =====================================================
 * 
 * Aquí puedes editar toda tu información personal,
 * experiencia profesional y educación.
 * 
 * PLANTILLA PARA EXPERIENCIA:
 * {
 *   title: {
 *     es: 'Título del puesto en español',
 *     en: 'Job title in English',
 *   },
 *   company: {
 *     es: 'Nombre de la empresa en español',
 *     en: 'Company name in English',
 *   },
 *   description: {
 *     es: 'Descripción en español...',
 *     en: 'Description in English...',
 *   },
 *   period: '2020 - 2023', // Mismo en ambos idiomas
 * }
 * 
 * =====================================================
 */

import type { Language } from '../contexts/LanguageContext';

// Interfaz para información personal
export interface PersonalInfo {
  description: {
    es: string[];
    en: string[];
  };
}

// Interfaz para experiencia profesional
export interface Experience {
  title: {
    es: string;
    en: string;
  };
  company: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  period?: {
    es: string;
    en: string;
  };
  /** Fecha de inicio de la experiencia (ISO string o formato Date-compatible) */
  startDate: string;
  /** Fecha de fin de la experiencia. Si no se indica, se considera que sigue activa */
  endDate?: string;
}

// Interfaz para educación
export interface Education {
  degree: {
    es: string;
    en: string;
  };
  institution: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  period?: {
    es: string;
    en: string;
  };
}

// Interfaces para datos resueltos
export interface ResolvedExperience {
  title: string;
  company: string;
  description: string;
  period?: string;
}

export interface ResolvedEducation {
  degree: string;
  institution: string;
  description: string;
  period?: string;
}

/**
 * =====================================================
 * INFORMACIÓN PERSONAL
 * =====================================================
 * Descripción sobre ti y tu perfil profesional.
 * =====================================================
 */
export const personalInfo: PersonalInfo = {
  description: {
    es: [
      'Soy una persona curiosa e implicada. Elegí como carrera la ingeniería de software porque estaba dudando entre demasiadas carreras, física, biología, matemáticas... Y sentí que la ingeniería de software, por su caracter transversal, me permitiría explorar muchas áreas y llegar a encontrar qué era lo que más me apasionaba en la vida.',
      'A día de hoy, soy consciente de que lo que me llamó de la informática, es su capacidad para transformar cada área del mundo de una forma distinta, y de impactar en tantas vidas de una forma positiva. Me gusta estar al día con los últimos avances tecnológicos, y encontrar formas de las que pueden mejorar la calidad de vida de las personas.',
      'A lo largo de los últimos 5 años, el mundo ha cambiado radicalmente, y todavía parece que va a cambiar mucho más. Los avances de todo tipo en inteligencia artificial me resultan extremadamente atractivos, disfruto planteando formas de las que la IA puede solucionar problemas que antes eran irresolubles o requerían muchísimos recursos. Los últimos avances en agentes e IA generativa me están permitiendo desarrollar proyectos a un ritmo que hasta ahora nunca habría podido imaginar',
    ],
    en: [
      'I am a curious and engaged person. I chose software engineering as a career because I was torn between too many fields—physics, biology, mathematics... And I felt that software engineering, due to its cross-cutting nature, would allow me to explore many areas and eventually discover what I was most passionate about in life.',
      'Nowadays, I am aware that what drew me to computer science is its ability to transform every area of the world in a different way, and to positively impact so many lives. I like to stay up to date with the latest technological advances, and to find ways they can improve people’s quality of life.',
      'Over the last 5 years, the world has changed radically, and it still seems likely to change much more. Advances of all kinds in artificial intelligence are extremely attractive to me; I enjoy exploring ways in which AI can solve problems that were previously unsolvable or required huge amounts of resources. The latest advances in agents and generative AI are allowing me to develop projects at a pace I could never have imagined until now.',
    ],
  },
};

/**
 * =====================================================
 * EXPERIENCIA PROFESIONAL
 * =====================================================
 * Tu historial de experiencia laboral en orden cronológico
 * (más reciente primero).
 * =====================================================
 */
export const experiences: Experience[] = [
  {
    title: {
      es: 'Full-Stack Developer',
      en: 'Full-Stack Developer',
    },
    company: {
      es: 'Tracasa Instrumental',
      en: 'Tracasa Instrumental',
    },
    description: {
      es: 'Desarrollo de aplicaciones gubernamentales utilizando principalmente .NET, angular, react y T-SQL. Implementación de arquitectura y planificación de proyectos, integración de sistemas de inteligencia artificial.',
      en: 'Development of government applications using mainly .NET, Angular, React and T-SQL. Architecture implementation and project planning, integration of artificial intelligence systems.',
    },
    period: {
      es: '2021 - Presente',
      en: '2021 - Present',
    },
    startDate: '2021-08-01',
  },
  {
    title: {
      es: 'Prácticas extracurriculares',
      en: 'Extracurricular Internship',
    },
    company: {
      es: 'Veridas',
      en: 'Veridas',
    },
    description: {
      es: 'Preparación de conjuntos de datos para entrenar modelos de reconocimiento facial. Diseño de aplicaciones móviles con Android Studio y Java.',
      en: 'Preparation of datasets to train facial recognition models. Design of mobile applications with Android Studio and Java.',
    },
    period: {
      es: '2020',
      en: '2020',
    },
    startDate: '2020-06-01',
    endDate: '2020-07-31',
  },
  {
    title: {
      es: 'Prácticas extracurriculares',
      en: 'Extracurricular Internship',
    },
    company: {
      es: 'Veridas',
      en: 'Veridas',
    },
    description: {
      es: 'Preparación de conjuntos de datos para entrenar modelos de reconocimiento facial.',
      en: 'Preparation of datasets to train facial recognition models.',
    },
    period: {
      es: '2019',
      en: '2019',
    },
    startDate: '2019-06-01',
    endDate: '2019-07-31',
  },
];

/**
 * =====================================================
 * EDUCACIÓN
 * =====================================================
 * Tu formación académica y certificaciones.
 * =====================================================
 */
export const education: Education[] = [
  {
    degree: {
      es: 'Master en Ingeniería informática',
      en: 'Master in Computer Engineering',
    },
    institution: {
      es: 'Universidad pública de Navarra',
      en: 'Public University of Navarre',
    },
    description: {
      es: 'Master generalista que cubre los contenidos que se quedan fuera del grado.',
      en: 'Generalist master covering contents that are outside the undergraduate degree.',
    },
    period: {
      es: '2021 - 2024',
      en: '2021 - 2024',
    },
  },
  {
    degree: {
      es: 'Ingeniería informática',
      en: 'Computer Engineering',
    },
    institution: {
      es: 'Universidad pública de Navarra',
      en: 'Public University of Navarre',
    },
    description: {
      es: 'Especialización en Computación y sistemas inteligentes y en Tecnologías de la información.',
      en: 'Specialization in Computing and intelligent systems and in Information Technology.',
    },
    period: {
      es: '2017 - 2021',
      en: '2017 - 2021',
    },
  },
];

/**
 * Calcula el total de milisegundos de experiencia profesional acumulada.
 * Para experiencias sin endDate, se usa la fecha actual (experiencia activa).
 */
export function getTotalExperienceMs(): number {
  const now = Date.now();
  return experiences.reduce((total, exp) => {
    const start = new Date(exp.startDate).getTime();
    const end = exp.endDate ? new Date(exp.endDate).getTime() : now;
    return total + (end - start);
  }, 0);
}

/**
 * Resuelve la información personal al idioma especificado
 */
export function getPersonalInfo(language: Language): string[] {
  return personalInfo.description[language];
}

/**
 * Obtiene las experiencias profesionales en el idioma especificado
 */
export function getExperiences(language: Language): ResolvedExperience[] {
  return experiences.map(exp => ({
    title: exp.title[language],
    company: exp.company[language],
    description: exp.description[language],
    period: exp.period ? exp.period[language] : undefined,
  }));
}

/**
 * Obtiene la educación en el idioma especificado
 */
export function getEducation(language: Language): ResolvedEducation[] {
  return education.map(edu => ({
    degree: edu.degree[language],
    institution: edu.institution[language],
    description: edu.description[language],
    period: edu.period ? edu.period[language] : undefined,
  }));
}
