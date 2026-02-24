/**
 * =====================================================
 * CONFIGURACIÓN DE PROYECTOS
 * =====================================================
 * 
 * Para añadir un nuevo proyecto, simplemente copia el objeto
 * de plantilla a continuación y rellena los campos.
 * 
 * PLANTILLA:
 * {
 *   id: NUMERO_UNICO,
 *   title: {
 *     es: 'Título en español',
 *     en: 'Title in English',
 *   },
 *   description: {
 *     es: 'Descripción corta en español',
 *     en: 'Short description in English',
 *   },
 *   tech: ['React', 'TypeScript', 'Node.js'],
 *   github: 'https://github.com/tu-usuario/tu-repo',
 *   demo: 'https://tu-demo.com',
 *   details: {
 *     es: {
 *       overview: ['Descripción general del proyecto...'],
 *       challenge: ['El desafío que resolviste...'],
 *       solution: ['Cómo lo resolviste...'],
 *       features: [
 *         'Característica 1',
 *         'Característica 2',
 *       ],
 *       techDetails: 'Detalles técnicos profundos...',
 *       results: 'Resultados e impacto...',
 *       date: '2024',
 *       team: 'Proyecto personal',
 *     },
 *     en: {
 *       overview: ['Project overview...'],
 *       challenge: ['The challenge you solved...'],
 *       solution: ['How you solved it...'],
 *       features: [
 *         'Feature 1',
 *         'Feature 2',
 *       ],
 *       techDetails: 'Deep technical details...',
 *       results: 'Results and impact...',
 *       date: '2024',
 *       team: 'Personal project',
 *     },
 *   },
 * }
 * 
 * =====================================================
 */

import type { Language } from '../contexts/LanguageContext';

// Interfaz para el contenido detallado de un proyecto
export interface ProjectDetails {
  overview: readonly string[];
  challenge: readonly string[];
  solution: readonly string[];
  features: readonly string[];
  techDetails: string;
  results: string;
  date?: string;
  team?: string;
  images?: string[];
}

// Interfaz para un proyecto completo
export interface Project {
  id: number;
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  tech: string[];
  github: string;
  demo: string;
  details: {
    es: ProjectDetails;
    en: ProjectDetails;
  };
}

// Interfaz para proyecto con idioma resuelto (usado en componentes)
export interface ResolvedProject {
  id: number;
  title: string;
  description: string;
  tech: string[];
  github: string;
  demo: string;
  detailedContent: ProjectDetails;
}

/**
 * =====================================================
 * LISTA DE PROYECTOS
 * =====================================================
 * Añade tus proyectos aquí. El orden determina cómo
 * aparecen en la página.
 * =====================================================
 */
export const projects: Project[] = [
  {
    id: 1,
    title: {
      es: 'Portfolio Dashboard',
      en: 'Portfolio Dashboard',
    },
    description: {
      es: 'Plantilla moderna y elegante para crear tu portfolio profesional como desarrollador',
      en: 'Modern and elegant template to create your professional developer portfolio',
    },
    tech: ['React', 'TypeScript', 'Vite', 'CSS3', 'WebLLM'],
    github: 'https://github.com/xabware/portfolio',
    demo: 'https://xabware.github.io/portfolio',
    details: {
      es: {
        overview: ['Este proyecto es una plantilla de portfolio diseñada para desarrolladores que buscan destacar en el mercado laboral. Combina un diseño de dashboard moderno con funcionalidades avanzadas como un chatbot con IA integrado que se ejecuta completamente en el navegador, soporte multilingüe (español/inglés), tema claro/oscuro, y una experiencia de usuario fluida y profesional.'],
        challenge: ['Crear un portfolio que no sea solo una página estática, sino una experiencia interactiva que demuestre habilidades técnicas reales. El mayor reto fue integrar un modelo de lenguaje que funcione localmente en el navegador sin depender de APIs externas, manteniendo al mismo tiempo un rendimiento óptimo y tiempos de carga rápidos.'],
        solution: ['Implementé una arquitectura modular con React y TypeScript que permite escalar fácilmente. Utilicé WebLLM para ejecutar modelos de IA directamente en el navegador aprovechando WebGPU. El sistema de traducciones está centralizado para facilitar la internacionalización, y el diseño responsivo garantiza una experiencia perfecta en cualquier dispositivo.'],
        features: [
          'Chatbot con IA ejecutándose localmente en el navegador (WebLLM)',
          'Diseño de dashboard moderno e intuitivo',
          'Soporte completo para tema claro y oscuro',
          'Sistema multilingüe (español/inglés) fácil de extender',
          'Búsqueda global en todo el portfolio',
          'Sistema de proyectos fácilmente escalable',
          'Optimizado con Vite para cargas ultra-rápidas',
          'Diseño totalmente responsive',
          'Animaciones suaves y transiciones elegantes',
        ],
        techDetails: 'El frontend está construido con React 18 y TypeScript para type-safety. Vite proporciona un bundling ultrarrápido con HMR instantáneo. Los estilos utilizan CSS moderno con variables CSS para theming dinámico. El chatbot utiliza WebLLM con modelos Llama/Qwen que se ejecutan en WebGPU. El estado global se gestiona con React Context para temas e idiomas. La estructura de componentes sigue el patrón de composición con memo para optimización de renderizado.',
        results: 'Una plantilla de portfolio que cualquier desarrollador puede clonar y personalizar en minutos. El diseño ha recibido feedback positivo por su profesionalismo y modernidad. El chatbot integrado demuestra capacidades técnicas avanzadas sin costos de API. El código está bien documentado y estructurado para facilitar modificaciones.',
        date: '2026',
        team: 'Proyecto personal',
      },
      en: {
        overview: ['This project is a portfolio template designed for developers looking to stand out in the job market. It combines a modern dashboard design with advanced features like an integrated AI chatbot that runs entirely in the browser, multilingual support (Spanish/English), light/dark theme, and a smooth, professional user experience.'],
        challenge: ['Create a portfolio that is not just a static page, but an interactive experience that demonstrates real technical skills. The biggest challenge was integrating a language model that works locally in the browser without relying on external APIs, while maintaining optimal performance and fast load times.'],
        solution: ['I implemented a modular architecture with React and TypeScript that scales easily. I used WebLLM to run AI models directly in the browser leveraging WebGPU. The translation system is centralized for easy internationalization, and the responsive design ensures a perfect experience on any device.'],
        features: [
          'AI chatbot running locally in the browser (WebLLM)',
          'Modern and intuitive dashboard design',
          'Full support for light and dark themes',
          'Multilingual system (Spanish/English) easy to extend',
          'Global search across the entire portfolio',
          'Easily scalable project system',
          'Optimized with Vite for ultra-fast loads',
          'Fully responsive design',
          'Smooth animations and elegant transitions',
        ],
        techDetails: 'The frontend is built with React 18 and TypeScript for type-safety. Vite provides ultra-fast bundling with instant HMR. Styles use modern CSS with CSS variables for dynamic theming. The chatbot uses WebLLM with Llama/Qwen models running on WebGPU. Global state is managed with React Context for themes and languages. The component structure follows the composition pattern with memo for render optimization.',
        results: 'A portfolio template that any developer can clone and customize in minutes. The design has received positive feedback for its professionalism and modernity. The integrated chatbot demonstrates advanced technical capabilities without API costs. The code is well documented and structured for easy modifications.',
        date: '2026',
        team: 'Personal project',
      },
    },
  },
  {
    id: 2,
    title: {
      es: 'Medidor de Raíces',
      en: 'Root Measurement Tool',
    },
    description: {
      es: 'Herramienta web para la medición de objetos en imágenes',
      en: 'Web tool for measuring objects in images',
    },
    tech: ['React', 'Vite', 'ArUco', 'Visión artificial', 'Redes convolucionales'],
    github: 'https://github.com/xabware/medidor',
    demo: 'https://xabware.github.io/medidor/',
    details: {
      es: {
        overview: ['Herramienta web para la medición de objetos en imágenes, fue planteada para simplificar la medición de raices en experimentos biológicos. Utiliza visión por computadora con OpenCV y marcadores ArUco para establecer una referencia de escala automática, permitiendo mediciones más rápidas y fiables que las manuales, además de sintetizar esta información en una hoja de excel.'],
        challenge: ['Muchos expedimentos relacionados con el desarrollo de productos agrícolas o pesticidas, requieren la medición de raices para evaluar los efectos de compuestos sobre el desarrollo de las plantas. Esto supone un proceso en el cual se cultivan cientos de plantas con diferentes extractos, y luego se miden y se anotan manualmente raiz a raiz. Este proceso es lento, y además se tiene que hacer en un plazo de tiempo corto, ya que si se deja pasar tiempo entre mediciones, las condiciones en las que se han desarrollado las raices cambian mucho, y por tanto el experimento deja de servir'],
        solution: ['El concepto de solución es simple. cultivar las semillas en bolsas zip planas con los extractos, y tomar fotografías de las mismas a contraluz, de forma que en las fotografías se distinga claramente las raices del sustrato translúcido sobre el que crecen. La herramienta web debe cargar esas fotografías, y una vez cargadas, una cómoda interfaz permite al usuario dibujar líneas sobre cada imagen. Cada línea es una medición, y se muestra a la derecha en un panel de mediciones.',' El usuario puede eliminar mediciones erróneas, modificar las existentes de este modo sobre una imagen con raices, acabará dibujando una línea que siga la trayectoria de cada raiz. además, en cada imagen, debe proporcionar una linea recta de referencia, marcando la referencia para esa imagen, e indicando el tamaño real de esta recta. En nuestro caso usamos el borde superior del rectángulo de sustrato, que siempre mide 12 cm. La web utiliza esta referencia, para determinar exactamente cuanto mide cada una de las líneas dibujadas, y al final, con un botón, descarga un excel con todas las mediciones estructuradas y etiquetadas acorde a los nombres de las imágenes.'],
        features: [
        ],
        techDetails: '',
        results: '',
        date: '2026',
        team: 'Proyecto personal',
      },
      en: {
        overview: ['Web tool for measuring objects in images, designed to simplify root measurement in biological experiments. It uses computer vision with OpenCV and ArUco markers to establish an automatic scale reference, enabling faster and more reliable measurements than manual methods, while also compiling this information into an Excel sheet.'],
        challenge: ['Many experiments related to the development of agricultural products or pesticides require root measurement to evaluate the effects of compounds on plant development. This involves growing hundreds of plants with different extracts, then measuring and recording each root manually. This process is slow, and it must also be done within a short time frame, because if too much time passes between measurements, the conditions in which the roots developed change significantly, making the experiment unusable.'],
        solution: ['The solution concept is simple: grow the seeds in flat zip bags with the extracts, and take backlit photos so the roots can be clearly distinguished from the translucent substrate where they grow. The web tool must load these photos, and once loaded, a comfortable interface allows the user to draw lines on each image. Each line is one measurement and is shown on the right in a measurements panel.', 'The user can delete incorrect measurements and modify existing ones. In this way, on an image with roots, they end up drawing one line that follows the path of each root. In addition, in each image, they must provide a straight reference line, marking the reference for that image and indicating the real size of that line. In our case, we used the upper edge of the substrate rectangle, which always measures 12 cm. The web tool uses this reference to determine exactly the length of each drawn line, and finally, with one button, it downloads an Excel file with all measurements structured and labeled according to the image names.'],
        features: [
        ],
        techDetails: '',
        results: '',
        date: '2026',
        team: 'Personal project',
      },
    },
  },
  {
    id: 3,
    title: {
      es: 'Mapa Procedural Infinito',
      en: 'Infinite Procedural Map',
    },
    description: {
      es: 'En construcción, carece de demo online',
      en: 'Under construction, no online demo available',
    },
    tech: ['React', 'TypeScript', 'Vite', 'Perlin Noise'],
    github: 'https://github.com/xabware/mapa-procedural',
    demo: 'https://github.com/xabware/mapa-procedural',
    details: {
      es: {
        overview: ['En construcción ...'],
        challenge: ['En construcción ...'],
        solution: ['En construcción ...'],
        features: [
        ],
        techDetails: '',
        results: '',
        date: '2026',
        team: 'Proyecto personal',
      },
      en: {
        overview: ['Under construction ...'],
        challenge: ['Under construction...'],
        solution: ['Under construction...'],
        features: [
        ],
        techDetails: '',
        results: '',
        date: '2026',
        team: 'Personal project',
      },
    },
  },
  {
    id: 4,
    title: {
      es: 'Juego RTS de navegador',
      en: 'RTS Browser Game',
    },
    description: {
      es: 'Videojuego de navegador de estrategia en tiempo real (RTS)',
      en: 'Real-time strategy (RTS) browser game',
    },
    tech: ['React', 'Vite', 'Three js'],
    github: 'https://github.com/xabware/RTENavegador',
    demo: 'https://xabware.github.io/RTENavegador/',
    details: {
      es: {
        overview: ['En construcción ...'],
        challenge: ['En construcción...'],
        solution: ['En construcción...'],
        features: [
        ],
        techDetails: '',
        results: '',
        date: '2026',
        team: 'Proyecto personal',
      },
      en: {
        overview: ['Under construction ...'],
        challenge: ['Under construction...'],
        solution: ['Under construction...'],
        features: [
        ],
        techDetails: '',
        results: '',
        date: '2026',
        team: 'Personal project',
      },
    },
  },
];

/**
 * Resuelve un proyecto al idioma especificado
 */
export function resolveProject(project: Project, language: Language): ResolvedProject {
  return {
    id: project.id,
    title: project.title[language],
    description: project.description[language],
    tech: project.tech,
    github: project.github,
    demo: project.demo,
    detailedContent: project.details[language],
  };
}

/**
 * Obtiene todos los proyectos resueltos para un idioma
 */
export function getProjects(language: Language): ResolvedProject[] {
  return projects.map(project => resolveProject(project, language));
}

/**
 * Obtiene el siguiente ID disponible para un nuevo proyecto
 */
export function getNextProjectId(): number {
  if (projects.length === 0) return 1;
  return Math.max(...projects.map(p => p.id)) + 1;
}
