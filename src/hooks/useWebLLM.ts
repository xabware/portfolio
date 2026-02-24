// Este archivo ahora es un re-export del contexto para mantener compatibilidad
import type { Message, LoadedDocument, PDFFileData } from '../contexts/WebLLMContext';
import type { ModelConfig } from '../config/chatbotConfig';
import type { SearchResult, NumberedSource, RAGDebugInfo } from '../utils/vectorStore';
export { useWebLLM, type Message, type LoadedDocument, type PDFFileData } from '../contexts/WebLLMContext';
export type { NumberedSource, RAGDebugInfo } from '../utils/vectorStore';

export interface UseWebLLMReturn {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<{ text: string; sources: NumberedSource[] }>;
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
  // RAG
  loadPDF: (file: File) => Promise<void>;
  removePDF: (fileName: string) => void;
  clearAllPDFs: () => void;
  loadedDocuments: LoadedDocument[];
  isProcessingPDF: boolean;
  pdfError: string | null;
  ragEnabled: boolean;
  setRagEnabled: (enabled: boolean) => void;
  lastSearchResults: SearchResult[];
  // Debug
  debugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
  lastDebugInfo: RAGDebugInfo | null;
  // Streaming
  streamingText: string;
  // PDF Viewer
  pdfFiles: Map<string, PDFFileData>;
  activePdfFile: string | null;
  activePdfPage: number;
  setActivePdfFile: (fileName: string | null) => void;
  setActivePdfPage: (page: number) => void;
  openPdfAtPage: (fileName: string, page: number) => void;
}
