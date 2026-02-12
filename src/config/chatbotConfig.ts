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
 * Genera el system prompt para la IA basado en los datos reales
 * 
 * NOTA: Este system prompt ahora se genera dinámicamente desde
 * los datos en la carpeta src/data/
 * 
 * Para actualizar la información del chatbot, edita los archivos:
 * - src/data/about.ts (experiencia, educación, descripción personal)
 * - src/data/skills.ts (habilidades técnicas)
 * - src/data/projects.ts (proyectos destacados)
 * 
 * @param language Idioma actual de la interfaz
 */
export { generateSystemPrompt } from '../data/contextGenerator';

