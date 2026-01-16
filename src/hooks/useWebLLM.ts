import { useState, useEffect, useCallback } from 'react';
import * as webllm from '@mlc-ai/web-llm';

export interface UseWebLLMReturn {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<string>;
  initProgress: string;
}

export const useWebLLM = () => {
  const [engine, setEngine] = useState<webllm.MLCEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState<string>('No inicializado');

  useEffect(() => {
    let isMounted = true;

    const initEngine = async () => {
      try {
        setIsLoading(true);
        setInitProgress('Inicializando motor de IA...');

        const newEngine = await webllm.CreateMLCEngine(
          // Usar un modelo pequeño y eficiente para el navegador
          'Phi-3.5-mini-instruct-q4f16_1-MLC',
          {
            initProgressCallback: (progress) => {
              if (isMounted) {
                setInitProgress(progress.text);
              }
            },
          }
        );

        if (isMounted) {
          setEngine(newEngine);
          setIsInitialized(true);
          setInitProgress('Modelo cargado y listo');
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          setError(`Error al inicializar el modelo: ${errorMessage}`);
          setInitProgress('Error en la inicialización');
          console.error('Error initializing WebLLM:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initEngine();

    return () => {
      isMounted = false;
    };
  }, []);

  const sendMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!engine || !isInitialized) {
        throw new Error('El modelo aún no está listo. Por favor espera...');
      }

      try {
        const systemPrompt = `Eres un asistente virtual de un portafolio profesional. 
Tu objetivo es responder preguntas sobre la experiencia, proyectos y habilidades del desarrollador de manera profesional y amigable.
Si no tienes información específica, proporciona una respuesta general útil y profesional.
Mantén las respuestas concisas pero informativas (máximo 3-4 oraciones).`;

        const messages: webllm.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ];

        const reply = await engine.chat.completions.create({
          messages,
          temperature: 0.7,
          max_tokens: 256,
        });

        return reply.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
      } catch (err) {
        console.error('Error sending message:', err);
        throw new Error('Error al procesar tu mensaje. Por favor intenta de nuevo.');
      }
    },
    [engine, isInitialized]
  );

  return {
    isLoading,
    isInitialized,
    error,
    sendMessage,
    initProgress,
  };
};
