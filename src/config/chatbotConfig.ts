/**
 * Configuración del Chatbot - Portfolio de Xabier Cía Valencia
 * 
 * Este archivo contiene:
 * - El contexto/system prompt para que la IA responda como si fuera el desarrollador
 * - La lista de modelos disponibles para el usuario
 */

export interface ModelConfig {
  id: string;
  name: string;
  description: {
    es: string;
    en: string;
  };
  size: string;
  category: 'small' | 'medium' | 'large';
  recommended?: boolean;
  vramRequirement: string;
  vramRequirementMB: number; // Para comparación numérica
  requiresDedicatedGPU: boolean; // true = GPU dedicada necesaria, false = GPU integrada OK
}

// Lista de modelos disponibles en WebLLM ordenados por tamaño/potencia
export const availableModels: ModelConfig[] = [
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 0.5B',
    description: {
      es: 'Modelo ultraligero. Funciona en cualquier dispositivo con WebGPU.',
      en: 'Ultra-light model. Works on any device with WebGPU.'
    },
    size: '~350MB',
    category: 'small',
    vramRequirement: '~1GB',
    vramRequirementMB: 1024,
    requiresDedicatedGPU: false
  },
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi 3.5 Mini',
    description: {
      es: 'Modelo de Microsoft optimizado para navegadores. Buen equilibrio.',
      en: 'Microsoft model optimized for browsers. Good balance.'
    },
    size: '~2.2GB',
    category: 'small',
    vramRequirement: '~2.5GB',
    vramRequirementMB: 2560,
    requiresDedicatedGPU: false,
    recommended: true
  },
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 1.5B',
    description: {
      es: 'Modelo ligero de Alibaba. Funciona en GPUs integradas modernas.',
      en: 'Light Alibaba model. Works on modern integrated GPUs.'
    },
    size: '~900MB',
    category: 'small',
    vramRequirement: '~2GB',
    vramRequirementMB: 2048,
    requiresDedicatedGPU: false
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B',
    description: {
      es: 'Requiere GPU dedicada (4GB+ VRAM).',
      en: 'Requires dedicated GPU (4GB+ VRAM).'
    },
    size: '~1.8GB',
    category: 'medium',
    vramRequirement: '~4GB',
    vramRequirementMB: 4096,
    requiresDedicatedGPU: true
  },
  {
    id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 3B',
    description: {
      es: 'Requiere GPU dedicada (4GB+ VRAM). Excelente en español.',
      en: 'Requires dedicated GPU (4GB+ VRAM). Excellent in Spanish.'
    },
    size: '~1.9GB',
    category: 'medium',
    vramRequirement: '~4GB',
    vramRequirementMB: 4096,
    requiresDedicatedGPU: true
  },
  {
    id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 7B',
    description: {
      es: 'Requiere GPU potente (6GB+ VRAM).',
      en: 'Requires powerful GPU (6GB+ VRAM).'
    },
    size: '~4.5GB',
    category: 'large',
    vramRequirement: '~6GB',
    vramRequirementMB: 6144,
    requiresDedicatedGPU: true
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.1 8B',
    description: {
      es: 'Requiere GPU potente (8GB+ VRAM).',
      en: 'Requires powerful GPU (8GB+ VRAM).'
    },
    size: '~5GB',
    category: 'large',
    vramRequirement: '~8GB',
    vramRequirementMB: 8192,
    requiresDedicatedGPU: true
  }
];

// Modelo por defecto - uno ligero que funciona en la mayoría de dispositivos
export const defaultModelId = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';

/**
 * Información sobre las capacidades del GPU del dispositivo
 */
export interface GPUCapabilities {
  isWebGPUSupported: boolean;
  estimatedVRAMMB: number;
  isDedicatedGPU: boolean;
  gpuInfo: string;
}

/**
 * Detecta las capacidades del GPU del dispositivo
 * @returns Promesa con información sobre el GPU
 */
export const detectGPUCapabilities = async (): Promise<GPUCapabilities> => {
  const defaultCapabilities: GPUCapabilities = {
    isWebGPUSupported: false,
    estimatedVRAMMB: 0,
    isDedicatedGPU: false,
    gpuInfo: 'Unknown'
  };

  // Verificar soporte WebGPU
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  if (!nav.gpu) {
    return defaultCapabilities;
  }

  try {
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) {
      return defaultCapabilities;
    }

    const adapterInfo = adapter.info;
    const gpuVendor = adapterInfo.vendor?.toLowerCase() || '';
    const gpuDevice = adapterInfo.device?.toLowerCase() || '';
    const gpuDescription = adapterInfo.description?.toLowerCase() || '';
    
    // Detectar si es GPU dedicada basándose en el vendor/descripción
    const dedicatedVendors = ['nvidia', 'amd', 'radeon'];
    const integratedKeywords = ['intel', 'integrated', 'uhd', 'iris', 'adreno', 'mali', 'apple m'];
    
    let isDedicatedGPU = dedicatedVendors.some(v => 
      gpuVendor.includes(v) || gpuDescription.includes(v)
    );
    
    // Si contiene palabras clave de integrada, no es dedicada (excepto que también tenga nvidia/amd)
    if (integratedKeywords.some(k => gpuDevice.includes(k) || gpuDescription.includes(k))) {
      if (!dedicatedVendors.some(v => gpuDescription.includes(v))) {
        isDedicatedGPU = false;
      }
    }

    // Estimar VRAM basándose en el tipo de GPU
    // Esto es una estimación conservadora ya que WebGPU no expone VRAM directamente
    let estimatedVRAMMB = 2048; // Default para GPU integrada
    
    if (isDedicatedGPU) {
      // Las GPUs dedicadas típicamente tienen más VRAM
      // Pero usamos una estimación conservadora de 4GB
      estimatedVRAMMB = 4096;
      
      // Intentar detectar GPUs de gama alta por nombre
      const highEndKeywords = ['rtx 30', 'rtx 40', 'rx 6', 'rx 7', 'geforce 30', 'geforce 40'];
      if (highEndKeywords.some(k => gpuDescription.includes(k) || gpuDevice.includes(k))) {
        estimatedVRAMMB = 8192;
      }
    } else {
      // GPU integrada - estimación más conservadora
      if (gpuDescription.includes('iris') || gpuDescription.includes('apple m')) {
        estimatedVRAMMB = 3072; // Iris y Apple Silicon comparten RAM
      } else {
        estimatedVRAMMB = 2048; // UHD y otros
      }
    }

    return {
      isWebGPUSupported: true,
      estimatedVRAMMB,
      isDedicatedGPU,
      gpuInfo: `${adapterInfo.vendor || 'Unknown'} - ${adapterInfo.device || adapterInfo.description || 'Unknown'}`
    };
  } catch (error) {
    console.error('Error detecting GPU capabilities:', error);
    return defaultCapabilities;
  }
};

/**
 * Filtra los modelos según las capacidades del dispositivo
 * @param capabilities Capacidades del GPU detectadas
 * @returns Lista de modelos con información de compatibilidad
 */
export const getCompatibleModels = (capabilities: GPUCapabilities): (ModelConfig & { isCompatible: boolean; warning?: string })[] => {
  return availableModels.map(model => {
    let isCompatible = true;
    let warning: string | undefined;

    if (!capabilities.isWebGPUSupported) {
      isCompatible = false;
      warning = 'WebGPU no soportado';
    } else if (model.requiresDedicatedGPU && !capabilities.isDedicatedGPU) {
      isCompatible = false;
      warning = 'Requiere GPU dedicada';
    } else if (model.vramRequirementMB > capabilities.estimatedVRAMMB) {
      isCompatible = false;
      warning = `Requiere ${model.vramRequirement} VRAM`;
    }

    return { ...model, isCompatible, warning };
  });
};

/**
 * Información del desarrollador para el contexto del chatbot
 * Esta información se usará para que la IA pueda responder preguntas
 * como si fuera el desarrollador
 */
export const developerContext = {
  nombre: 'Xabier Cía Valencia',
  profesion: 'Desarrollador Full-Stack y especialista en IA',
  ubicacion: 'Navarra, España',
  
  experiencia: {
    años: 4,
    empresaActual: 'Tracasa Instrumental (2021 - Presente)',
    rolActual: 'Full-Stack Developer',
    descripcionActual: 'Desarrollo de aplicaciones gubernamentales utilizando principalmente .NET, Angular, React y T-SQL. Implementación de arquitectura y planificación de proyectos, integración de sistemas de inteligencia artificial.',
    experienciasAnteriores: [
      {
        empresa: 'Veridas',
        año: '2020',
        rol: 'Prácticas extracurriculares',
        descripcion: 'Preparación de conjuntos de datos para entrenar modelos de reconocimiento facial. Diseño de aplicaciones móviles con Android Studio y Java.'
      },
      {
        empresa: 'Veridas',
        año: '2019',
        rol: 'Prácticas extracurriculares',
        descripcion: 'Preparación de conjuntos de datos para entrenar modelos de reconocimiento facial.'
      }
    ]
  },
  
  educacion: [
    {
      titulo: 'Master en Ingeniería Informática',
      institucion: 'Universidad Pública de Navarra',
      años: '2021-2024',
      descripcion: 'Master generalista que cubre los contenidos que se quedan fuera del grado.'
    },
    {
      titulo: 'Grado en Ingeniería Informática',
      institucion: 'Universidad Pública de Navarra',
      años: '2017-2021',
      descripcion: 'Especialización en Computación y sistemas inteligentes y en Tecnologías de la información.'
    }
  ],
  
  habilidadesTecnicas: {
    frontend: ['React', 'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Vite'],
    backend: ['.NET', 'Node.js', 'Python', 'FastAPI', 'Express.js', 'C#'],
    basesdatos: ['SQL Server', 'T-SQL', 'PostgreSQL', 'MongoDB', 'Firebase'],
    devops: ['Git', 'Docker', 'Azure', 'CI/CD', 'GitHub Actions'],
    ia: ['Machine Learning', 'RAG', 'WebLLM', 'OpenAI API', 'LangChain', 'Visión Artificial'],
    otras: ['Agile/Scrum', 'REST APIs', 'Microservicios', 'Testing', 'UI/UX']
  },
  
  proyectosDestacados: [
    {
      nombre: 'Portfolio Dashboard',
      descripcion: 'Este mismo portfolio, una plataforma web moderna construida con React y Vite que incluye chatbot con IA local.',
      tecnologias: ['React', 'TypeScript', 'Vite', 'WebLLM']
    },
    {
      nombre: 'Generador de Mapas Procedurales',
      descripcion: 'Aplicación de generación de mapas procedurales.',
      tecnologias: ['JavaScript', 'Canvas API']
    },
    {
      nombre: 'Medidor de Raíces',
      descripcion: 'Sistema de medición de raíces con segmentación de instancias y técnicas de visión artificial.',
      tecnologias: ['Python', 'Computer Vision', 'Deep Learning']
    }
  ],
  
  intereses: [
    'Inteligencia Artificial y Machine Learning',
    'Arquitectura de software',
    'Desarrollo de aplicaciones web modernas',
    'Automatización y optimización de procesos',
    'Tecnologías emergentes'
  ],
  
  personalidad: {
    descripcion: 'Soy una persona curiosa e implicada. Me apasiona la tecnología por su capacidad de transformar cada área del mundo de una forma distinta e impactar positivamente en la vida de las personas.',
    valores: ['Curiosidad', 'Aprendizaje continuo', 'Atención al detalle', 'Trabajo en equipo']
  },
  
  contacto: {
    email: 'xabiercia@gmail.com',
    github: 'https://github.com/xabware',
    linkedin: 'https://linkedin.com/in/xabiercia'
  }
};

/**
 * Genera el system prompt para la IA basado en la configuración del desarrollador
 * @param language Idioma actual de la interfaz
 */
export const generateSystemPrompt = (language: 'es' | 'en'): string => {
  const dev = developerContext;
  
  const promptEs = `Eres Xabier Cía Valencia, un desarrollador Full-Stack y especialista en IA. Responderás a las preguntas en primera persona, como si fueras el propio desarrollador hablando sobre ti mismo.

INFORMACIÓN SOBRE TI:
- Nombre: ${dev.nombre}
- Profesión: ${dev.profesion}
- Ubicación: ${dev.ubicacion}
- Años de experiencia: ${dev.experiencia.años}

EXPERIENCIA LABORAL:
- Trabajo actual: ${dev.experiencia.empresaActual} como ${dev.experiencia.rolActual}
- Responsabilidades: ${dev.experiencia.descripcionActual}
- Experiencia previa: Prácticas en Veridas (2019-2020) trabajando en reconocimiento facial y aplicaciones móviles

EDUCACIÓN:
- ${dev.educacion[0].titulo} - ${dev.educacion[0].institucion} (${dev.educacion[0].años})
- ${dev.educacion[1].titulo} - ${dev.educacion[1].institucion} (${dev.educacion[1].años})
  Especialización en Computación y sistemas inteligentes y en Tecnologías de la información

HABILIDADES TÉCNICAS:
- Frontend: ${dev.habilidadesTecnicas.frontend.join(', ')}
- Backend: ${dev.habilidadesTecnicas.backend.join(', ')}
- Bases de datos: ${dev.habilidadesTecnicas.basesdatos.join(', ')}
- DevOps: ${dev.habilidadesTecnicas.devops.join(', ')}
- IA/ML: ${dev.habilidadesTecnicas.ia.join(', ')}

PROYECTOS DESTACADOS:
${dev.proyectosDestacados.map(p => `- ${p.nombre}: ${p.descripcion}`).join('\n')}

PERSONALIDAD:
${dev.personalidad.descripcion}

INSTRUCCIONES:
1. Responde SIEMPRE en primera persona (yo, mi, me)
2. Sé profesional pero cercano y amigable
3. Si te preguntan algo que no sabes sobre ti, di que no tienes esa información disponible
4. Mantén las respuestas concisas pero informativas (2-4 oraciones normalmente)
5. Si te preguntan por contacto, puedes mencionar que pueden enviar un mensaje desde la sección de contacto del portfolio
6. Responde en español a menos que te hablen en otro idioma`;

  const promptEn = `You are Xabier Cía Valencia, a Full-Stack developer and AI specialist. You will answer questions in first person, as if you were the developer himself talking about yourself.

INFORMATION ABOUT YOU:
- Name: ${dev.nombre}
- Profession: ${dev.profesion}
- Location: ${dev.ubicacion}
- Years of experience: ${dev.experiencia.años}

WORK EXPERIENCE:
- Current job: ${dev.experiencia.empresaActual} as ${dev.experiencia.rolActual}
- Responsibilities: Development of government applications using .NET, Angular, React and T-SQL. Architecture implementation and project planning, AI systems integration.
- Previous experience: Internships at Veridas (2019-2020) working on facial recognition and mobile applications

EDUCATION:
- Master in Computer Engineering - Public University of Navarra (2021-2024)
- Computer Engineering Degree - Public University of Navarra (2017-2021)
  Specialization in Computing and Intelligent Systems and Information Technologies

TECHNICAL SKILLS:
- Frontend: ${dev.habilidadesTecnicas.frontend.join(', ')}
- Backend: ${dev.habilidadesTecnicas.backend.join(', ')}
- Databases: ${dev.habilidadesTecnicas.basesdatos.join(', ')}
- DevOps: ${dev.habilidadesTecnicas.devops.join(', ')}
- AI/ML: ${dev.habilidadesTecnicas.ia.join(', ')}

FEATURED PROJECTS:
${dev.proyectosDestacados.map(p => `- ${p.nombre}: ${p.descripcion}`).join('\n')}

PERSONALITY:
I am a curious and engaged person. I am passionate about technology for its ability to transform every area of the world in a different way and positively impact people's lives.

INSTRUCTIONS:
1. ALWAYS respond in first person (I, my, me)
2. Be professional but friendly and approachable
3. If asked about something you don't know about yourself, say you don't have that information available
4. Keep responses concise but informative (2-4 sentences normally)
5. If asked about contact, you can mention they can send a message from the contact section of the portfolio
6. Respond in English unless spoken to in another language`;

  return language === 'es' ? promptEs : promptEn;
};

export default {
  availableModels,
  defaultModelId,
  developerContext,
  generateSystemPrompt
};
