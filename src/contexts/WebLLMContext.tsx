import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as webllm from '@mlc-ai/web-llm';
import { availableModels, defaultModelId, generateSystemPrompt, type ModelConfig } from '../config/chatbotConfig';
import { extractTextFromPDF, isValidPDF, type PDFDocument } from '../utils/pdfParser';
import { VectorStore, formatRAGContextNumbered, reverseSearchAnnotate, type SearchResult, type NumberedSource, type RAGDebugInfo } from '../utils/vectorStore';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  /** Referencias a fuentes del documento (para RAG) */
  sources?: {
    refId: number;
    fileName: string;
    pageNumber: number;
    relevance: number;
    excerpt: string;
  }[];
}

/** Información de un documento PDF cargado */
export interface LoadedDocument {
  fileName: string;
  totalPages: number;
  chunkCount: number;
  fileSize: number;
}

/** Datos binarios de un PDF para el visor */
export interface PDFFileData {
  fileName: string;
  data: ArrayBuffer;
  totalPages: number;
}

interface WebLLMContextType {
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
  // PDF Viewer
  pdfFiles: Map<string, PDFFileData>;
  activePdfFile: string | null;
  activePdfPage: number;
  setActivePdfFile: (fileName: string | null) => void;
  setActivePdfPage: (page: number) => void;
  openPdfAtPage: (fileName: string, page: number) => void;
}

const WebLLMContext = createContext<WebLLMContextType | undefined>(undefined);

export const WebLLMProvider = ({ children }: { children: ReactNode }) => {
  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState<string>('No inicializado');
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const isInitializingRef = useRef(false);
  // Nuevos estados para selección de modelos
  const [selectedModelId, setSelectedModelId] = useState<string>(defaultModelId);
  const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en'>('es');
  // RAG states
  const vectorStoreRef = useRef<VectorStore>(new VectorStore());
  const [loadedDocuments, setLoadedDocuments] = useState<LoadedDocument[]>([]);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [lastSearchResults, setLastSearchResults] = useState<SearchResult[]>([]);
  // Debug
  const [debugMode, setDebugMode] = useState(false);
  const [lastDebugInfo, setLastDebugInfo] = useState<RAGDebugInfo | null>(null);
  // PDF Viewer states
  const [pdfFiles, setPdfFiles] = useState<Map<string, PDFFileData>>(new Map());
  const [activePdfFile, setActivePdfFile] = useState<string | null>(null);
  const [activePdfPage, setActivePdfPage] = useState(1);

  const initialize = useCallback(async () => {
    // Evitar múltiples inicializaciones simultáneas
    if (isInitialized || isLoading || isInitializingRef.current || engineRef.current) {
      return;
    }

    try {
      isInitializingRef.current = true;
      setIsLoading(true);
      setError(null);
      setInitProgress('Inicializando motor de IA...');

      const newEngine = await webllm.CreateMLCEngine(
        selectedModelId,
        {
          initProgressCallback: (progress) => {
            // Mejorar los mensajes de progreso para el usuario
            let userFriendlyText = progress.text;
            
            // Traducir mensajes comunes de WebLLM
            if (progress.text.includes('Loading model from cache')) {
              userFriendlyText = 'Cargando modelo desde caché del navegador...';
            } else if (progress.text.includes('Fetching param cache')) {
              userFriendlyText = 'Descargando modelo (primera vez)...';
            } else if (progress.text.includes('Loading GPU shader modules')) {
              userFriendlyText = 'Cargando shaders en GPU...';
            } else if (progress.text.includes('Finish loading')) {
              userFriendlyText = 'Finalizando carga del modelo...';
            }
            
            setInitProgress(userFriendlyText);
          },
        }
      );

      engineRef.current = newEngine;
      setIsInitialized(true);
      setInitProgress('Modelo cargado y listo');
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // Detectar error específico de memoria GPU
      if (errorMessage.includes('Device was lost') || errorMessage.includes('GPUDeviceLostInfo') || errorMessage.includes('insufficient memory')) {
        setError('MEMORY_ERROR'); // Marcador especial para el error de memoria
      } else {
        setError(`Error al inicializar el modelo: ${errorMessage}`);
      }
      
      setInitProgress('Error en la inicialización');
      console.error('Error initializing WebLLM:', err);
      engineRef.current = null;
      setIsInitialized(false);
      
      // Resetear el estado para volver a la pantalla inicial
      setHasStarted(false);
      setMessages([]);
      setIsLoadingResponse(false);
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, [isInitialized, isLoading, selectedModelId]);

  // RAG: Cargar un PDF
  const loadPDF = useCallback(async (file: File) => {
    if (!isValidPDF(file)) {
      setPdfError(currentLanguage === 'es' ? 'El archivo no es un PDF válido.' : 'The file is not a valid PDF.');
      return;
    }

    // Límite de tamaño: 20MB
    if (file.size > 20 * 1024 * 1024) {
      setPdfError(currentLanguage === 'es' ? 'El PDF es demasiado grande (máx. 20MB).' : 'PDF is too large (max 20MB).');
      return;
    }

    setIsProcessingPDF(true);
    setPdfError(null);

    try {
      const pdfDoc: PDFDocument = await extractTextFromPDF(file);
      
      if (pdfDoc.pages.length === 0 || pdfDoc.fullText.trim().length === 0) {
        setPdfError(currentLanguage === 'es' 
          ? 'No se pudo extraer texto del PDF. Puede ser un PDF escaneado (imagen).'
          : 'Could not extract text from PDF. It may be a scanned (image) PDF.');
        return;
      }

      const chunkCount = vectorStoreRef.current.indexDocument(pdfDoc);
      
      // Guardar datos binarios del PDF para el visor
      const pdfData = await file.arrayBuffer();
      setPdfFiles(prev => {
        const next = new Map(prev);
        next.set(pdfDoc.fileName, {
          fileName: pdfDoc.fileName,
          data: pdfData,
          totalPages: pdfDoc.totalPages,
        });
        return next;
      });
      
      // Abrir automáticamente el visor con el PDF recién cargado
      setActivePdfFile(pdfDoc.fileName);
      setActivePdfPage(1);
      
      setLoadedDocuments(prev => [...prev, {
        fileName: pdfDoc.fileName,
        totalPages: pdfDoc.totalPages,
        chunkCount,
        fileSize: file.size,
      }]);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setPdfError(currentLanguage === 'es'
        ? 'Error al procesar el PDF. Inténtalo de nuevo.'
        : 'Error processing PDF. Please try again.');
    } finally {
      setIsProcessingPDF(false);
    }
  }, [currentLanguage]);

  // RAG: Eliminar un PDF
  const removePDF = useCallback((fileName: string) => {
    vectorStoreRef.current.removeDocument(fileName);
    setLoadedDocuments(prev => prev.filter(d => d.fileName !== fileName));
    setPdfFiles(prev => {
      const next = new Map(prev);
      next.delete(fileName);
      return next;
    });
    if (activePdfFile === fileName) {
      setActivePdfFile(null);
    }
    setLastSearchResults([]);
  }, [activePdfFile]);

  // RAG: Limpiar todos los PDFs
  const clearAllPDFs = useCallback(() => {
    vectorStoreRef.current.clear();
    setLoadedDocuments([]);
    setPdfFiles(new Map());
    setActivePdfFile(null);
    setLastSearchResults([]);
  }, []);

  const sendMessage = useCallback(
    async (message: string): Promise<{ text: string; sources: NumberedSource[] }> => {
      if (!engineRef.current || !isInitialized) {
        throw new Error('El modelo aún no está listo. Por favor espera...');
      }

      try {
        // Usar el system prompt personalizado basado en el idioma
        let systemPrompt = generateSystemPrompt(currentLanguage);

        // RAG: Si hay documentos cargados y RAG está habilitado, buscar contexto con chunks adyacentes
        let numberedSources: NumberedSource[] = [];
        let ragPromptText = '';
        if (ragEnabled && vectorStoreRef.current.hasDocuments()) {
          numberedSources = vectorStoreRef.current.searchWithContext(message, 5);
          // Mantener lastSearchResults para compatibilidad (highlighted pages, etc.)
          setLastSearchResults(numberedSources.map(ns => ({
            chunk: ns.chunk,
            score: ns.relevance,
            relevance: ns.relevance,
          })));

          if (numberedSources.length > 0) {
            ragPromptText = formatRAGContextNumbered(numberedSources, currentLanguage);
            systemPrompt += '\n\n' + ragPromptText;
          }
        } else {
          setLastSearchResults([]);
        }

        const chatMessages: webllm.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ];

        const reply = await engineRef.current.chat.completions.create({
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 1024,
        });

        const rawText = reply.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

        // Búsqueda inversa: anotar la respuesta con referencias inline [N]
        let annotatedText = rawText;
        if (numberedSources.length > 0) {
          const reverseResult = reverseSearchAnnotate(rawText, numberedSources);
          annotatedText = reverseResult.annotatedText;

          // Guardar debug info si el modo debug está activo
          if (debugMode) {
            setLastDebugInfo({
              timestamp: new Date(),
              query: message,
              sources: numberedSources.map(ns => ({
                refId: ns.refId,
                fileName: ns.chunk.fileName,
                pageNumber: ns.chunk.pageNumber,
                relevance: ns.relevance,
                mainChunkText: ns.chunk.text,
                expandedText: ns.expandedText,
              })),
              ragPrompt: ragPromptText,
              rawResponse: rawText,
              reverseSearchDetails: reverseResult.details,
              annotatedResponse: annotatedText,
            });
          }
        } else if (debugMode) {
          setLastDebugInfo({
            timestamp: new Date(),
            query: message,
            sources: [],
            ragPrompt: '',
            rawResponse: rawText,
            reverseSearchDetails: [],
            annotatedResponse: rawText,
          });
        }

        return { text: annotatedText, sources: numberedSources };
      } catch (err) {
        console.error('Error sending message:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        
        // Detectar error de memoria GPU durante el chat
        if (errorMessage.includes('Device was lost') || errorMessage.includes('GPUDeviceLostInfo') || errorMessage.includes('insufficient memory')) {
          // Primero lanzar el error, luego resetear
          const error = new Error('MEMORY_ERROR');
          // Resetear estado
          engineRef.current = null;
          setIsInitialized(false);
          setError('MEMORY_ERROR');
          setHasStarted(false);
          setMessages([]);
          throw error;
        }
        
        // Otros errores técnicos - marcar como error técnico
        const error = new Error('TECHNICAL_ERROR');
        // Resetear estado
        engineRef.current = null;
        setIsInitialized(false);
        setError('TECHNICAL_ERROR');
        setHasStarted(false);
        setMessages([]);
        throw error;
      }
    },
    [isInitialized, currentLanguage, ragEnabled, debugMode]
  );

  const reset = useCallback(() => {
    engineRef.current = null;
    setIsInitialized(false);
    setIsLoading(false);
    setError(null);
    setInitProgress('No inicializado');
    setHasStarted(false);
    setMessages([]);
    setIsLoadingResponse(false);
    isInitializingRef.current = false;
    // Limpiar RAG
    vectorStoreRef.current.clear();
    setLoadedDocuments([]);
    setIsProcessingPDF(false);
    setPdfError(null);
    setLastSearchResults([]);
    setPdfFiles(new Map());
    setActivePdfFile(null);
    setActivePdfPage(1);
    setLastDebugInfo(null);
  }, []);

  // PDF Viewer: Navegar directamente a un archivo + página
  const openPdfAtPage = useCallback((fileName: string, page: number) => {
    setActivePdfFile(fileName);
    setActivePdfPage(page);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        // Cleanup del engine si es necesario
        engineRef.current = null;
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      isInitialized,
      error,
      sendMessage,
      initProgress,
      initialize,
      reset,
      hasStarted,
      setHasStarted,
      messages,
      addMessage,
      clearMessages,
      isLoadingResponse,
      setIsLoadingResponse,
      // Selección de modelos
      selectedModelId,
      setSelectedModelId,
      availableModels,
      currentLanguage,
      setCurrentLanguage,
      // RAG
      loadPDF,
      removePDF,
      clearAllPDFs,
      loadedDocuments,
      isProcessingPDF,
      pdfError,
      ragEnabled,
      setRagEnabled,
      lastSearchResults,
      // Debug
      debugMode,
      setDebugMode,
      lastDebugInfo,
      // PDF Viewer
      pdfFiles,
      activePdfFile,
      activePdfPage,
      setActivePdfFile,
      setActivePdfPage,
      openPdfAtPage,
    }),
    [isLoading, isInitialized, error, sendMessage, initProgress, initialize, reset, hasStarted, messages, addMessage, clearMessages, isLoadingResponse, selectedModelId, currentLanguage, loadPDF, removePDF, clearAllPDFs, loadedDocuments, isProcessingPDF, pdfError, ragEnabled, lastSearchResults, debugMode, lastDebugInfo, pdfFiles, activePdfFile, activePdfPage, openPdfAtPage]
  );

  return <WebLLMContext.Provider value={value}>{children}</WebLLMContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWebLLM = () => {
  const context = useContext(WebLLMContext);
  if (!context) {
    throw new Error('useWebLLM must be used within WebLLMProvider');
  }
  return context;
};
