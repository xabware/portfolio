// Este archivo ahora es un re-export del contexto para mantener compatibilidad
import type { Message } from '../contexts/WebLLMContext';
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
}
