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
 *     { name: 'Nombre', description: { es: '...', en: '...' } },
 *   ],
 * }
 * 
 * =====================================================
 */

import type { Language } from '../contexts/LanguageContext';

// Interfaz para una habilidad individual
export interface Skill {
  name: string;
  description: {
    es: string;
    en: string;
  };
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
export interface ResolvedSkill {
  name: string;
  description: string;
}

export interface ResolvedSkillCategory {
  title: string;
  skills: ResolvedSkill[];
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
      {
        name: 'React',
        description: {
          es: 'Empecé a usar React migrando pantallas antiguas en ASP y Angular de nuestra aplicación. Actualmente uso React con Vite para la mayoría de mis proyectos personales, por su versatilidad y carácter multiplataforma.',
          en: 'I started using React by migrating old screens in ASP and Angular from our application. Currently, I use React with Vite for most of my personal projects, due to its versatility and cross-platform nature.'
        },
      },
      {
        name: 'ASP',
        description: {
          es: 'He trabajado durante años con dos aplicaciones web basadas en ASP.NET, una de ellas en C# y la otra en Visual Basic. En los últimos años ha sido principalmente corrección de bugs, mantenimiento del sistema e integración del mismo con otras tecnologías.',
          en: 'I have worked for years with two web applications based on ASP.NET, one in C# and the other in Visual Basic. In recent years, it has been mainly bug fixing, system maintenance, and integration with other technologies.'
        },
      },
      {
        name: 'CSS',
        description: {
          es: 'A lo largo de toda mi trayectoria he usado CSS en múltiples frameworks y tecnologías. He usado Flexbox, Tailwind y SCSS.',
          en: 'Throughout my career, I have used CSS in multiple frameworks and technologies. I have used Flexbox, Tailwind, and SCSS.'
        },
      },
      {
        name: 'Angular.js',
        description: {
          es: 'He trabajado extensamente en frontend Angular a lo largo de mi trayectoria profesional. El enfoque no ha sido tanto orientado a SPA, sino a aplicaciones de múltiples ventanas, aunque también hemos hecho módulos en SPA.',
          en: 'I have worked extensively with Angular.js throughout my professional career. The focus has not been so much on SPA development, but on multi-window applications, although we have also created SPA modules.',
        },
      },
    ],
  },
  {
    title: {
      es: 'Backend',
      en: 'Backend',
    },
    skills: [
      {
        name: '.NET',
        description: {
          es: '.NET es el framework con el que más experiencia tengo, lo he usado durante años en aplicaciones empresariales de gran escala. He trabajado con .NET Framework, .NET Core y .NET 6+, haciendo web services para arquitecturas modernas y mantenimiento y desarrollo de aplicaciones monolíticas antiguas.',
          en: '.NET is the framework I have the most experience with, having used it for years in large-scale enterprise applications. I have worked with .NET Framework, .NET Core, and .NET 6+, developing web services for modern architectures and maintaining and developing legacy monolithic applications.',
        },
      },
      {
        name: 'Python',
        description: {
          es: 'Me siento muy cómodo usando Python; es el lenguaje que más he usado en mi formación. Principalmente lo he usado para scripts, para sistemas de inteligencia artificial y, alguna vez, a nivel profesional para pequeñas APIs y webs con Django.',
          en: 'I feel very comfortable using Python; it is the language I have used the most during my education. I have mainly used it for scripts, artificial intelligence systems, and occasionally at a professional level for small APIs and websites with Django.'
        },
      },
      {
        name: 'Java',
        description: {
          es: 'He usado Java mucho durante mi etapa académica y, aunque no tengo una amplia experiencia profesional, conozco muy bien el lenguaje. He desarrollado una app Android con Java como proyecto académico. Usé Java en mi trabajo de fin de máster para aplicaciones de computación distribuida e Internet de las Cosas.',
          en: 'I used Java extensively during my academic years and, although I do not have broad professional experience, I know the language very well. I developed an Android app with Java as an academic project. I used Java in my master\'s thesis for distributed computing and Internet of Things applications.'
        },
      },
    ],
  },
  {
    title: {
      es: 'Bases de Datos',
      en: 'Databases',
    },
    skills: [
      {
        name: 'Microsoft SQL Server',
        description: {
          es: 'Administración de instancias, optimización de consultas, índices y planes de ejecución.',
          en: 'Instance administration, query optimization, indexes and execution plans.',
        },
      },
      {
        name: 'SQL',
        description: {
          es: 'Gran experiencia en cualquier ámbito de SQL, desde la parte más matemática del funcionamiento de una base de datos hasta la aplicación práctica.',
          en: 'Extensive experience in all areas of SQL, from the theoretical and mathematical aspects of database internals to practical application.'
        },
      },
      {
        name: 'Entity Framework',
        description: {
          es: 'Uso cómodo de Entity Framework a diferentes escalas, comprensión de su funcionamiento interno, optimización de consultas, manejo de relaciones complejas y uso avanzado de LINQ.',
          en: 'Comfortable use of Entity Framework at different scales, understanding of its internal workings, query optimization, handling of complex relationships, and advanced use of LINQ.'
        },
      },
      {
        name: 'T-SQL',
        description: {
          es: 'Amplia experiencia en el uso de stored procedures, triggers, funciones escalares y de tabla, cursores y transacciones.',
          en: 'Extensive experience in the use of stored procedures, triggers, scalar and table-valued functions, cursors and transactions.',
        },
      },
    ],
  },
  {
    title: {
      es: 'DevOps y Herramientas',
      en: 'DevOps & Tools',
    },
    skills: [
      {
        name: 'Git',
        description: {
          es: 'Comprensión total de Git.',
          en: 'Comprehensive understanding of Git.'
        },
      },
      {
        name: 'Docker',
        description: {
          es: 'Contenerización de aplicaciones, Docker Compose para entornos multi-servicio y optimización de imágenes.',
          en: 'Application containerization, Docker Compose for multi-service environments and image optimization.',
        },
      },
      {
        name: 'Azure DevOps',
        description: {
          es: 'Gestión de proyectos, repos, pipelines de CI/CD, artifacts y boards para metodologías ágiles.',
          en: 'Project management, repos, CI/CD pipelines, artifacts and boards for agile methodologies.',
        },
      },
      {
        name: 'AWS',
        description: {
          es: 'Despliegue en EC2, S3, Lambda y RDS. Configuración de VPCs y gestión de servicios cloud.',
          en: 'Deployment on EC2, S3, Lambda and RDS. VPC configuration and cloud services management.',
        },
      },
      {
        name: 'CI/CD',
        description: {
          es: 'Automatización de builds, tests y despliegues con Azure Pipelines, GitHub Actions y Jenkins.',
          en: 'Build, test and deployment automation with Azure Pipelines, GitHub Actions and Jenkins.',
        },
      },
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
    skills: category.skills.map(skill => ({
      name: skill.name,
      description: skill.description[language],
    })),
  }));
}

/**
 * Obtiene las habilidades adicionales en el idioma especificado
 */
export function getAdditionalSkills(language: Language): string[] {
  return additionalSkills[language];
}
