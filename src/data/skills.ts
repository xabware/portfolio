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
          es: 'Desarrollo de SPAs y componentes reutilizables con hooks, Context API y gestión de estado avanzada.',
          en: 'SPA development and reusable components with hooks, Context API and advanced state management.',
        },
      },
      {
        name: 'ASP',
        description: {
          es: 'Aplicaciones web con ASP.NET MVC y Razor Pages, integración con servicios backend .NET.',
          en: 'Web applications with ASP.NET MVC and Razor Pages, integration with .NET backend services.',
        },
      },
      {
        name: 'CSS',
        description: {
          es: 'Maquetación responsive con Flexbox y Grid, animaciones, custom properties y diseño adaptativo.',
          en: 'Responsive layouts with Flexbox and Grid, animations, custom properties and adaptive design.',
        },
      },
      {
        name: 'Angular.js',
        description: {
          es: 'Desarrollo de aplicaciones SPA con data binding bidireccional, directivas y servicios inyectables.',
          en: 'SPA development with two-way data binding, directives and injectable services.',
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
          es: 'APIs REST y servicios con .NET Core/6+, arquitectura limpia, middlewares y autenticación JWT.',
          en: 'REST APIs and services with .NET Core/6+, clean architecture, middlewares and JWT authentication.',
        },
      },
      {
        name: 'Python',
        description: {
          es: 'Scripts de automatización, procesamiento de datos, machine learning y desarrollo de APIs con FastAPI/Flask.',
          en: 'Automation scripts, data processing, machine learning and API development with FastAPI/Flask.',
        },
      },
      {
        name: 'Java',
        description: {
          es: 'Aplicaciones empresariales con Spring Boot, patrones de diseño y programación orientada a objetos.',
          en: 'Enterprise applications with Spring Boot, design patterns and object-oriented programming.',
        },
      },
      {
        name: 'PHP',
        description: {
          es: 'Desarrollo web con Laravel y WordPress, gestión de bases de datos y APIs RESTful.',
          en: 'Web development with Laravel and WordPress, database management and RESTful APIs.',
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
          es: 'Consultas complejas con JOINs, subconsultas, CTEs, funciones de ventana y agregaciones.',
          en: 'Complex queries with JOINs, subqueries, CTEs, window functions and aggregations.',
        },
      },
      {
        name: 'Entity Framework',
        description: {
          es: 'ORM con Code First y Database First, migraciones, lazy/eager loading y optimización de queries.',
          en: 'ORM with Code First and Database First, migrations, lazy/eager loading and query optimization.',
        },
      },
      {
        name: 'T-SQL',
        description: {
          es: 'Stored procedures, triggers, funciones escalares y de tabla, cursores y transacciones.',
          en: 'Stored procedures, triggers, scalar and table-valued functions, cursors and transactions.',
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
          es: 'Control de versiones avanzado, branching strategies (GitFlow), rebases, cherry-picks y resolución de conflictos.',
          en: 'Advanced version control, branching strategies (GitFlow), rebases, cherry-picks and conflict resolution.',
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
