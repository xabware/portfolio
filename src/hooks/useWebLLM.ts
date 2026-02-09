// Este archivo ahora es un re-export del contexto para mantener compatibilidad
import type { Message } from '../contexts/WebLLMContext';
import type { ModelConfig } from '../config/chatbotConfig';
export { useWebLLM, type Message } from '../contexts/WebLLMContext';

export interface UseWebLLMReturn {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<string>;
  initProgress: string;
  initialize: () => Promise<void>;
  reset: () => void;
  hasStarted: boolean;
  setHasStarted: (value: boolean) => void;
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isLoadingResponse: boolean;
  setIsLoadingResponse: (value: boolean) => void;
  // Nuevas propiedades para selección de modelos
  selectedModelId: string;
  setSelectedModelId: (modelId: string) => void;
  availableModels: ModelConfig[];
  currentLanguage: 'es' | 'en';
  setCurrentLanguage: (language: 'es' | 'en') => void;
}
