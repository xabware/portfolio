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
 *       overview: 'Descripción general del proyecto...',
 *       challenge: 'El desafío que resolviste...',
 *       solution: 'Cómo lo resolviste...',
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
 *       overview: 'Project overview...',
 *       challenge: 'The challenge you solved...',
 *       solution: 'How you solved it...',
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
  overview: string;
  challenge: string;
  solution: string;
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
        overview: 'Este proyecto es una plantilla de portfolio diseñada para desarrolladores que buscan destacar en el mercado laboral. Combina un diseño de dashboard moderno con funcionalidades avanzadas como un chatbot con IA integrado que se ejecuta completamente en el navegador, soporte multilingüe (español/inglés), tema claro/oscuro, y una experiencia de usuario fluida y profesional.',
        challenge: 'Crear un portfolio que no sea solo una página estática, sino una experiencia interactiva que demuestre habilidades técnicas reales. El mayor reto fue integrar un modelo de lenguaje que funcione localmente en el navegador sin depender de APIs externas, manteniendo al mismo tiempo un rendimiento óptimo y tiempos de carga rápidos.',
        solution: 'Implementé una arquitectura modular con React y TypeScript que permite escalar fácilmente. Utilicé WebLLM para ejecutar modelos de IA directamente en el navegador aprovechando WebGPU. El sistema de traducciones está centralizado para facilitar la internacionalización, y el diseño responsivo garantiza una experiencia perfecta en cualquier dispositivo.',
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
        date: '2024 - Presente',
        team: 'Proyecto personal',
      },
      en: {
        overview: 'This project is a portfolio template designed for developers looking to stand out in the job market. It combines a modern dashboard design with advanced features like an integrated AI chatbot that runs entirely in the browser, multilingual support (Spanish/English), light/dark theme, and a smooth, professional user experience.',
        challenge: 'Create a portfolio that is not just a static page, but an interactive experience that demonstrates real technical skills. The biggest challenge was integrating a language model that works locally in the browser without relying on external APIs, while maintaining optimal performance and fast load times.',
        solution: 'I implemented a modular architecture with React and TypeScript that scales easily. I used WebLLM to run AI models directly in the browser leveraging WebGPU. The translation system is centralized for easy internationalization, and the responsive design ensures a perfect experience on any device.',
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
        date: '2024 - Present',
        team: 'Personal project',
      },
    },
  },
  {
    id: 2,
    title: {
      es: 'Medidor de Raíces',
      en: 'Root Measurement App',
    },
    description: {
      es: 'Aplicación móvil para medición precisa de raíces mediante visión por computadora y marcadores ArUco',
      en: 'Mobile application for precise root measurement using computer vision and ArUco markers',
    },
    tech: ['Flutter', 'Dart', 'OpenCV', 'ArUco', 'Google Sheets API'],
    github: 'https://github.com/xabware/medidor-raices',
    demo: 'https://github.com/xabware/medidor-raices',
    details: {
      es: {
        overview: 'Aplicación móvil desarrollada con Flutter para facilitar la medición precisa de raíces en estudios agrícolas y de botánica. Utiliza visión por computadora con OpenCV y marcadores ArUco para establecer una referencia de escala automática, permitiendo mediciones exactas sin necesidad de instrumentos físicos complejos. Incluye integración con Google Sheets para exportar datos automáticamente.',
        challenge: 'Los métodos tradicionales de medición de raíces son lentos, propensos a errores humanos y requieren equipos especializados. El desafío era crear una solución móvil que pudiera realizar mediciones precisas usando solo la cámara del teléfono, con calibración automática de escala y procesamiento en tiempo real, sin depender de conexión a internet.',
        solution: 'Implementé un sistema de visión por computadora usando opencv_dart que detecta automáticamente marcadores ArUco en las imágenes para establecer la escala real. El procesamiento se realiza completamente en el dispositivo, garantizando privacidad y funcionamiento offline. Los usuarios imprimen una hoja A4 con marcadores ArUco generados por la app, colocan las raíces sobre ella y capturan una foto. La app calcula automáticamente las mediciones reales.',
        features: [
          'Detección automática de marcadores ArUco para calibración de escala',
          'Captura de imágenes desde cámara o galería',
          'Procesamiento local de imágenes con OpenCV',
          'Generador integrado de PDF con marcadores ArUco para imprimir',
          'Historial de mediciones con fecha y hora',
          'Exportación automática a Google Sheets mediante webhook',
          'Interfaz intuitiva con Material Design 3',
          'No requiere conexión a internet para medir (solo para exportar)',
          'Soporte completo para Android y iOS',
        ],
        techDetails: 'La aplicación está construida con Flutter 3 y utiliza opencv_dart para el procesamiento de imágenes. Los marcadores ArUco se detectan mediante detectores configurables, y el cálculo de escala se realiza en base al tamaño conocido de los marcadores (200mm). El paquete pdf genera documentos para imprimir los marcadores, y la integración con Google Sheets se logra mediante HTTP requests a un Google Apps Script desplegado como webhook. El estado se gestiona con StatefulWidgets y shared_preferences para persistencia local.',
        results: 'Una herramienta práctica que simplifica significativamente el proceso de medición de raíces en campo. Elimina la necesidad de equipos costosos y reduce el tiempo de medición en más del 60%. La precisión alcanzada es comparable a métodos tradicionales. La integración con Google Sheets permite análisis de datos inmediato. Ideal para investigadores, estudiantes y profesionales de agricultura.',
        date: '2024',
        team: 'Proyecto personal',
      },
      en: {
        overview: 'Mobile application developed with Flutter to facilitate precise root measurement in agricultural and botanical studies. Uses computer vision with OpenCV and ArUco markers to establish automatic scale reference, enabling exact measurements without complex physical instruments. Includes Google Sheets integration for automatic data export.',
        challenge: 'Traditional root measurement methods are slow, prone to human error, and require specialized equipment. The challenge was to create a mobile solution that could perform accurate measurements using only the phone camera, with automatic scale calibration and real-time processing, without depending on internet connection.',
        solution: 'I implemented a computer vision system using opencv_dart that automatically detects ArUco markers in images to establish the real scale. Processing is done entirely on the device, ensuring privacy and offline functionality. Users print an A4 sheet with ArUco markers generated by the app, place the roots on it, and capture a photo. The app automatically calculates the real measurements.',
        features: [
          'Automatic ArUco marker detection for scale calibration',
          'Image capture from camera or gallery',
          'Local image processing with OpenCV',
          'Integrated PDF generator with ArUco markers for printing',
          'Measurement history with date and time',
          'Automatic export to Google Sheets via webhook',
          'Intuitive interface with Material Design 3',
          'No internet connection required for measuring (only for exporting)',
          'Full support for Android and iOS',
        ],
        techDetails: 'The application is built with Flutter 3 and uses opencv_dart for image processing. ArUco markers are detected using configurable detectors, and scale calculation is performed based on the known marker size (200mm). The pdf package generates documents to print the markers, and Google Sheets integration is achieved via HTTP requests to a Google Apps Script deployed as a webhook. State is managed with StatefulWidgets and shared_preferences for local persistence.',
        results: 'A practical tool that significantly simplifies the root measurement process in the field. Eliminates the need for expensive equipment and reduces measurement time by over 60%. The accuracy achieved is comparable to traditional methods. Google Sheets integration enables immediate data analysis. Ideal for researchers, students, and agriculture professionals.',
        date: '2024',
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
      es: 'Visualizador interactivo de mapas infinitos generados proceduralmente con algoritmo de ruido Perlin',
      en: 'Interactive viewer of infinite procedurally generated maps using Perlin noise algorithm',
    },
    tech: ['React', 'TypeScript', 'Vite', 'Perlin Noise'],
    github: 'https://github.com/xabware/mapa-procedural',
    demo: 'https://github.com/xabware/mapa-procedural',
    details: {
      es: {
        overview: 'Un proyecto de visualización interactiva que implementa un sistema de mundo infinito con generación procedural de terreno. Utiliza el algoritmo de ruido Perlin para crear paisajes coherentes y naturales que se generan dinámicamente mientras el usuario explora. El mapa está dividido en chunks que se cargan bajo demanda, permitiendo una exploración fluida sin límites.',
        challenge: 'Crear un sistema de mapa infinito requiere resolver varios desafíos técnicos: generar terreno que sea consistente y reproducible, gestionar eficientemente la memoria usando un sistema de chunks, mantener el rendimiento con múltiples chunks en pantalla, y proporcionar una experiencia de navegación suave. Todo esto mientras se mantiene el código simple y mantenible.',
        solution: 'Implementé un sistema de chunks de 16x16 tiles con generación procedural basada en ruido Perlin. Cada chunk tiene coordenadas únicas que se usan como semilla para el generador, garantizando que el mismo chunk siempre genere el mismo terreno. El sistema carga y descarga chunks dinámicamente según la posición del viewport. La navegación se maneja con eventos de arrastre del mouse, proporcionando una experiencia intuitiva similar a Google Maps.',
        features: [
          'Mapa verdaderamente infinito en todas direcciones',
          'Generación procedural con algoritmo de ruido Perlin',
          'Sistema de chunks con carga dinámica',
          'Cinco tipos de terreno: agua, arena, césped, bosque y montaña',
          'Navegación fluida con arrastre del mouse',
          'Generación determinista (mismo chunk = mismo terreno)',
          'Renderizado optimizado con React memo',
          'Interfaz limpia y minimalista',
          'Sin backend, completamente en el navegador',
        ],
        techDetails: 'El proyecto usa React 19 con TypeScript para type-safety. La generación de terreno se basa en ruido Perlin 2D con múltiples octavas para crear variación natural. Cada chunk se renderiza como un componente React independiente memoizado para evitar re-renders innecesarios. El hook personalizado useInfiniteMap gestiona el estado del mapa, coordenadas de viewport y lógica de carga de chunks. Los tiles se renderizan como divs con colores basados en el valor del ruido, lo que permite un renderizado rápido sin canvas.',
        results: 'Un demostrador técnico efectivo de generación procedural y sistemas de chunks. El código es educativo y bien estructurado, ideal para aprender sobre generación procedural, optimización de React y manejo de grandes datasets. La experiencia de usuario es fluida incluso con múltiples chunks en pantalla. Puede servir como base para juegos roguelike o aplicaciones de visualización de datos geográficos.',
        date: '2024',
        team: 'Proyecto personal',
      },
      en: {
        overview: 'An interactive visualization project that implements an infinite world system with procedural terrain generation. Uses the Perlin noise algorithm to create coherent and natural landscapes that generate dynamically as the user explores. The map is divided into chunks that load on demand, allowing smooth exploration without limits.',
        challenge: 'Creating an infinite map system requires solving several technical challenges: generating terrain that is consistent and reproducible, efficiently managing memory using a chunk system, maintaining performance with multiple chunks on screen, and providing a smooth navigation experience. All while keeping the code simple and maintainable.',
        solution: 'I implemented a 16x16 tile chunk system with procedural generation based on Perlin noise. Each chunk has unique coordinates used as a seed for the generator, ensuring the same chunk always generates the same terrain. The system dynamically loads and unloads chunks based on viewport position. Navigation is handled with mouse drag events, providing an intuitive experience similar to Google Maps.',
        features: [
          'Truly infinite map in all directions',
          'Procedural generation with Perlin noise algorithm',
          'Chunk system with dynamic loading',
          'Five terrain types: water, sand, grass, forest, and mountain',
          'Smooth navigation with mouse drag',
          'Deterministic generation (same chunk = same terrain)',
          'Optimized rendering with React memo',
          'Clean and minimalist interface',
          'No backend, completely in-browser',
        ],
        techDetails: 'The project uses React 19 with TypeScript for type-safety. Terrain generation is based on 2D Perlin noise with multiple octaves to create natural variation. Each chunk is rendered as an independent memoized React component to avoid unnecessary re-renders. The custom useInfiniteMap hook manages map state, viewport coordinates, and chunk loading logic. Tiles are rendered as divs with colors based on noise value, enabling fast rendering without canvas.',
        results: 'An effective technical demonstrator of procedural generation and chunk systems. The code is educational and well-structured, ideal for learning about procedural generation, React optimization, and handling large datasets. The user experience is smooth even with multiple chunks on screen. Can serve as a foundation for roguelike games or geographic data visualization applications.',
        date: '2024',
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
