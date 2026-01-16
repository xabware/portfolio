import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { useWebLLM } from '../hooks/useWebLLM';
import './Chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const { isLoading: isModelLoading, isInitialized, error: modelError, sendMessage, initProgress } = useWebLLM();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Agregar mensaje de bienvenida cuando el modelo esté listo
  useEffect(() => {
    if (isInitialized && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: '¡Hola! Soy tu asistente virtual con IA ejecutándose localmente en tu navegador. Puedo responder preguntas sobre tecnología, desarrollo y mucho más. ¿En qué puedo ayudarte?',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isInitialized, messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoadingResponse || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoadingResponse(true);

    try {
      const botResponse = await sendMessage(currentInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error en el chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mostrar estado de carga del modelo
  if (isModelLoading || !isInitialized) {
    return (
      <div className="chatbot-container">
        <div className="chatbot-loading">
          <Bot size={48} />
          <h3>Cargando modelo de IA...</h3>
          <p>{initProgress}</p>
          <div className="loading-spinner"></div>
          <small>Esto puede tardar unos minutos la primera vez. El modelo se descarga y ejecuta completamente en tu navegador.</small>
        </div>
      </div>
    );
  }

  // Mostrar error si hay alguno
  if (modelError) {
    return (
      <div className="chatbot-container">
        <div className="chatbot-error">
          <AlertCircle size={48} />
          <h3>Error al cargar el modelo</h3>
          <p>{modelError}</p>
          <small>Por favor, recarga la página o verifica que tu navegador soporte WebGPU.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-icon">
              {message.sender === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoadingResponse && (
          <div className="message bot">
            <div className="message-icon">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoadingResponse || !isInitialized}
        />
        <button onClick={handleSend} disabled={isLoadingResponse || !inputValue.trim() || !isInitialized}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
