import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as webllm from '@mlc-ai/web-llm';
import { availableModels, defaultModelId, generateSystemPrompt, type ModelConfig } from '../config/chatbotConfig';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface WebLLMContextType {
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
      setError(`Error al inicializar el modelo: ${errorMessage}`);
      setInitProgress('Error en la inicialización');
      console.error('Error initializing WebLLM:', err);
      engineRef.current = null;
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, [isInitialized, isLoading, selectedModelId]);

  const sendMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!engineRef.current || !isInitialized) {
        throw new Error('El modelo aún no está listo. Por favor espera...');
      }

      try {
        // Usar el system prompt personalizado basado en el idioma
        const systemPrompt = generateSystemPrompt(currentLanguage);

        const chatMessages: webllm.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ];

        const reply = await engineRef.current.chat.completions.create({
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 512,
        });

        return reply.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
      } catch (err) {
        console.error('Error sending message:', err);
        throw new Error('Error al procesar tu mensaje. Por favor intenta de nuevo.');
      }
    },
    [isInitialized, currentLanguage]
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
      // Nuevas propiedades para selección de modelos
      selectedModelId,
      setSelectedModelId,
      availableModels,
      currentLanguage,
      setCurrentLanguage,
    }),
    [isLoading, isInitialized, error, sendMessage, initProgress, initialize, reset, hasStarted, messages, addMessage, clearMessages, isLoadingResponse, selectedModelId, currentLanguage]
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
