import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, Bot, User, AlertCircle, Sparkles, ChevronDown, Cpu, Monitor, Paperclip, FileText, X, ToggleLeft, ToggleRight, Loader2, BookOpen, Bug, ExternalLink } from 'lucide-react';
import { useWebLLM, type Message } from '../hooks/useWebLLM';
import { usePopup } from './PopupContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import { detectGPUCapabilities, getCompatibleModels, type GPUCapabilities } from '../config/chatbotConfig';
import { formatFileSize } from '../utils/pdfParser';
import './Chatbot.css';

const Chatbot = memo(() => {
  const { 
    isLoading: isModelLoading, 
    isInitialized, 
    error: modelError, 
    sendMessage, 
    initProgress, 
    initialize,
    reset,
    hasStarted, 
    setHasStarted,
    messages,
    addMessage,
    isLoadingResponse,
    setIsLoadingResponse,
    selectedModelId,
    setSelectedModelId,
    availableModels,
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
    // Debug
    debugMode,
    // Streaming
    streamingText,
  } = useWebLLM();
  const { openPdfPopup, closePdfPopup, openDebugPopup, closeDebugPopup, isMobile } = usePopup();
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const [inputValue, setInputValue] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [gpuCapabilities, setGpuCapabilities] = useState<GPUCapabilities | null>(null);
  const [isDetectingGPU, setIsDetectingGPU] = useState(true);
  const [showRAGPanel, setShowRAGPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef(false);

  // Detectar capacidades del GPU al montar
  useEffect(() => {
    const detectGPU = async () => {
      setIsDetectingGPU(true);
      try {
        const capabilities = await detectGPUCapabilities();
        setGpuCapabilities(capabilities);
        
        // Ya no auto-seleccionamos modelo compatible - el usuario puede elegir cualquiera
      } catch (error) {
        console.error('Error detecting GPU:', error);
      } finally {
        setIsDetectingGPU(false);
      }
    };
    detectGPU();
  }, []);

  // Sincronizar el idioma del contexto con el idioma de la aplicación
  useEffect(() => {
    setCurrentLanguage(language);
  }, [language, setCurrentLanguage]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  // Agregar mensaje de bienvenida cuando el modelo esté listo (solo una vez)
  useEffect(() => {
    if (isInitialized && messages.length === 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const welcomeMessage: Message = {
        id: 'welcome-1',
        text: t.chatbotWelcomeMessage,
        sender: 'bot',
        timestamp: new Date(),
      };
      addMessage(welcomeMessage);
    }
  }, [isInitialized, messages.length, t.chatbotWelcomeMessage, addMessage]);

  const handleStartChat = useCallback(async () => {
    setHasStarted(true);
    await initialize();
  }, [initialize, setHasStarted]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoadingResponse || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoadingResponse(true);

    try {
      const { text: annotatedText, sources: numberedSources } = await sendMessage(currentInput);
      // Mapear NumberedSource a formato de Message.sources con refId
      const sources = numberedSources.length > 0 ? numberedSources.map(ns => ({
        refId: ns.refId,
        fileName: ns.chunk.fileName,
        pageNumber: ns.chunk.pageNumber,
        relevance: ns.relevance,
        excerpt: ns.chunk.text.substring(0, 150) + '...',
      })) : undefined;
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: annotatedText,
        sender: 'bot',
        timestamp: new Date(),
        sources,
      };
      addMessage(botMessage);
    } catch (error) {
      console.error('Error en el chat:', error);
      
      const errorMsg = error instanceof Error ? error.message : '';
      
      // Si es error de memoria o técnico, o el modelo no está listo (porque ya se reseteó)
      if (errorMsg === 'MEMORY_ERROR' || errorMsg === 'TECHNICAL_ERROR' || errorMsg.includes('no está listo')) {
        // El contexto ya ha manejado el reseteo o el modelo se cayó
        return;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMsg || t.chatbotErrorMessage,
        sender: 'bot',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoadingResponse(false);
    }
  }, [inputValue, isLoadingResponse, isInitialized, sendMessage, t.chatbotErrorMessage, addMessage, setIsLoadingResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // RAG: Manejar subida de PDF
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadPDF(file);
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [loadPDF]);

  // Mostrar botón inicial si aún no se ha iniciado
  if (!hasStarted) {
    const compatibleModels = gpuCapabilities ? getCompatibleModels(gpuCapabilities) : [];
    const selectedModel = compatibleModels.find(m => m.id === selectedModelId) || availableModels.find(m => m.id === selectedModelId);
    
    return (
      <div className="chatbot-container">
        <div className="chatbot-welcome">
          <div className="welcome-icon">
            <Bot size={48} />
          </div>
          <h3>{t.chatbotWelcomeTitle}</h3>
          <p className="welcome-description">
            {t.chatbotWelcomeDescription}
          </p>
          
          {/* Información del GPU */}
          {gpuCapabilities && !isDetectingGPU && (
            <div className="gpu-info">
              <Monitor size={14} />
              <span className="gpu-info-text">
                {gpuCapabilities.isDedicatedGPU ? t.chatbotDedicatedGPU : t.chatbotIntegratedGPU}
                {gpuCapabilities.gpuInfo !== 'Unknown' && ` - ${gpuCapabilities.gpuInfo}`}
              </span>
            </div>
          )}
          
          {/* Selector de modelos */}
          <div className="model-selector-container">
            <label className="model-selector-label">
              <Cpu size={16} />
              {t.chatbotSelectModel}
            </label>
            <div className="model-selector-wrapper">
              <button 
                className="model-selector-button"
                onClick={() => setShowModelSelector(!showModelSelector)}
                disabled={isDetectingGPU}
              >
                {isDetectingGPU ? (
                  <span className="model-name">{t.chatbotDetectingGPU}</span>
                ) : (
                  <>
                    <span className={`model-category-badge ${selectedModel?.category}`}>
                      {selectedModel?.category === 'small' ? t.chatbotModelSmall : 
                       selectedModel?.category === 'medium' ? t.chatbotModelMedium : t.chatbotModelLarge}
                    </span>
                    <span className="model-name">{selectedModel?.name}</span>
                    <ChevronDown size={16} className={showModelSelector ? 'rotated' : ''} />
                  </>
                )}
              </button>
              
              {showModelSelector && gpuCapabilities && (
                <div className="model-dropdown">
                  {compatibleModels.map((model) => (
                    <button
                      key={model.id}
                      className={`model-option ${model.id === selectedModelId ? 'selected' : ''} ${!model.isCompatible ? 'warning' : ''}`}
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setShowModelSelector(false);
                      }}
                    >
                      <div className="model-option-header">
                        <span className={`model-category-badge ${model.category}`}>
                          {model.category === 'small' ? t.chatbotModelSmall : 
                           model.category === 'medium' ? t.chatbotModelMedium : t.chatbotModelLarge}
                        </span>
                        <span className="model-option-name">{model.name}</span>
                        {model.recommended && <span className="recommended-badge">{t.chatbotRecommended}</span>}
                        {!model.isCompatible && <span className="warning-badge">{t.chatbotMayNotWork}</span>}
                      </div>
                      <p className="model-option-description">
                        {language === 'es' ? model.description.es : model.description.en}
                        {!model.isCompatible && model.warning && (
                          <span className="model-warning"> ⚠️ {model.warning}</span>
                        )}
                      </p>
                      <div className="model-option-specs">
                        <span>{t.chatbotModelSize}: {model.size}</span>
                        <span>VRAM: {model.vramRequirement}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button className="start-chat-button" onClick={handleStartChat}>
            <Sparkles size={18} />
            {t.chatbotStartButton}
          </button>
          <small className="welcome-note">
            {selectedModel?.size} {t.chatbotDownloadNote}
          </small>
          <small className="welcome-note" style={{ color: 'var(--warning-color, #ff9800)', marginTop: '0.5rem' }}>
            {t.chatbotResourceWarning}
          </small>
        </div>
      </div>
    );
  }

  // Mostrar estado de carga del modelo
  if (isModelLoading || !isInitialized) {
    return (
      <div className="chatbot-container">
        <div className="chatbot-loading">
          <Bot size={48} />
          <h3>{t.chatbotLoadingTitle}</h3>
          <p>{initProgress}</p>
          <div className="loading-spinner"></div>
          <small>{t.chatbotLoadingNote}</small>
        </div>
      </div>
    );
  }

  // Mostrar error si hay alguno
  if (modelError) {
    // Error específico de memoria GPU
    if (modelError === 'MEMORY_ERROR') {
      return (
        <div className="chatbot-container">
          <div className="chatbot-error">
            <AlertCircle size={48} color="var(--warning-color, #ff9800)" />
            <h3>{t.chatbotMemoryError}</h3>
            <p>{t.chatbotMemoryErrorNote}</p>
            <button 
              className="start-chat-button" 
              onClick={reset}
              style={{ marginTop: '1rem' }}
            >
              {t.chatbotTryAgain}
            </button>
          </div>
        </div>
      );
    }
    
    // Error técnico general
    if (modelError === 'TECHNICAL_ERROR') {
      return (
        <div className="chatbot-container">
          <div className="chatbot-error">
            <AlertCircle size={48} color="var(--warning-color, #ff9800)" />
            <h3>{t.chatbotTechnicalError}</h3>
            <p>{t.chatbotTechnicalErrorNote}</p>
            <button 
              className="start-chat-button" 
              onClick={reset}
              style={{ marginTop: '1rem' }}
            >
              {t.chatbotTryAgain}
            </button>
          </div>
        </div>
      );
    }
    
    // Otros errores
    return (
      <div className="chatbot-container">
        <div className="chatbot-error">
          <AlertCircle size={48} />
          <h3>{t.chatbotErrorTitle}</h3>
          <p>{modelError}</p>
          <small>{t.chatbotErrorNote}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      {/* RAG Panel */}
      {showRAGPanel && (
        <div className="rag-panel">
          <div className="rag-panel-header">
            <div className="rag-panel-title">
              <BookOpen size={16} />
              <span>RAG - {t.ragUploadPDF}</span>
            </div>
            <button className="rag-panel-close" onClick={() => setShowRAGPanel(false)}>
              <X size={16} />
            </button>
          </div>
          
          <div className="rag-panel-content">
            {/* Toggle RAG */}
            <div className="rag-toggle">
              <button 
                className={`rag-toggle-button ${ragEnabled ? 'active' : ''}`}
                onClick={() => setRagEnabled(!ragEnabled)}
                title={t.ragToggle}
              >
                {ragEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{ragEnabled ? t.ragEnabled : t.ragDisabled}</span>
              </button>
              {!isMobile && (
                <button 
                  className={`rag-toggle-button debug-toggle ${debugMode ? 'active' : ''}`}
                  onClick={() => debugMode ? closeDebugPopup() : openDebugPopup()}
                  title={t.debugToggle}
                >
                  <Bug size={16} />
                  <span>{t.debugMode}</span>
                  {debugMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
              )}
            </div>
            
            {/* Upload button */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button 
              className="rag-upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingPDF}
            >
              {isProcessingPDF ? (
                <><Loader2 size={16} className="spinning" /> {t.ragProcessing}</>
              ) : (
                <><Paperclip size={16} /> {t.ragUploadPDF}</>
              )}
            </button>
            
            {/* PDF Error */}
            {pdfError && (
              <div className="rag-error">
                <AlertCircle size={14} />
                <span>{pdfError}</span>
              </div>
            )}
            
            {/* Loaded documents list */}
            {loadedDocuments.length > 0 ? (
              <div className="rag-documents">
                <div className="rag-documents-header">
                  <span>{loadedDocuments.length} {loadedDocuments.length === 1 ? t.ragDocumentLoaded : t.ragDocumentsLoaded}</span>
                  {loadedDocuments.length > 1 && (
                    <button className="rag-clear-all" onClick={() => { clearAllPDFs(); closePdfPopup(); }}>
                      {t.ragClearAll}
                    </button>
                  )}
                </div>
                {loadedDocuments.map((doc) => (
                  <div key={doc.fileName} className="rag-document-item">
                    <FileText size={14} />
                    <div className="rag-document-info">
                      <span className="rag-document-name">{doc.fileName}</span>
                      <span className="rag-document-meta">
                        {doc.totalPages} {t.ragPages} · {doc.chunkCount} {t.ragChunks} · {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                    <button 
                      className="rag-document-view" 
                      onClick={() => openPdfPopup(doc.fileName, 1)}
                      title={t.ragOpenViewer}
                    >
                      <ExternalLink size={12} />
                    </button>
                    <button className="rag-document-remove" onClick={() => { removePDF(doc.fileName); closePdfPopup(); }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rag-no-documents">{t.ragNoDocuments}</p>
            )}
          </div>
        </div>
      )}
      
      {/* RAG status bar */}
      {loadedDocuments.length > 0 && !showRAGPanel && (
        <div className="rag-status-bar" onClick={() => setShowRAGPanel(true)}>
          <BookOpen size={14} />
          <span>
            {loadedDocuments.length} {loadedDocuments.length === 1 ? t.ragDocumentLoaded : t.ragDocumentsLoaded}
            {ragEnabled ? ` · ${t.ragEnabled}` : ` · ${t.ragDisabled}`}
          </span>
        </div>
      )}
      
      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-icon">
              {message.sender === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-content">
              {/* Renderizar texto con referencias inline [N] clicables */}
              {message.sources && message.sources.length > 0 ? (
                <div className="message-text-annotated">
                  {message.text.split(/(\[\d+\])/).map((part, idx) => {
                    const refMatch = part.match(/^\[(\d+)\]$/);
                    if (refMatch) {
                      const refId = parseInt(refMatch[1]);
                      const source = message.sources!.find(s => s.refId === refId);
                      if (source) {
                        return (
                          <button
                            key={idx}
                            className="inline-ref"
                            onClick={() => openPdfPopup(source.fileName, source.pageNumber)}
                            title={`${source.fileName} — ${t.ragPage} ${source.pageNumber}\n${source.excerpt}`}
                          >
                            {refId}
                          </button>
                        );
                      }
                    }
                    return <span key={idx}>{part}</span>;
                  })}
                </div>
              ) : (
                <p>{message.text}</p>
              )}
              {/* Leyenda de referencias: mapa refId → fuente */}
              {message.sources && message.sources.length > 0 && (
                <div className="ref-legend">
                  <span className="ref-legend-title">{t.ragSourcesTitle}</span>
                  <div className="ref-legend-items">
                    {message.sources.map((source) => (
                      <button
                        key={source.refId}
                        className="ref-legend-item"
                        onClick={() => openPdfPopup(source.fileName, source.pageNumber)}
                        title={source.excerpt}
                      >
                        <span className="ref-legend-id">[{source.refId}]</span>
                        <FileText size={10} />
                        <span className="ref-legend-file">{source.fileName}</span>
                        <span className="ref-legend-page">p.{source.pageNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              {streamingText ? (
                <div className="message-text-streaming">
                  <p>{streamingText}</p>
                  <span className="streaming-cursor" />
                </div>
              ) : (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <button 
          className="rag-attach-button"
          onClick={() => setShowRAGPanel(!showRAGPanel)}
          title={t.ragUploadHint}
        >
          <BookOpen size={18} className={loadedDocuments.length > 0 ? 'has-documents' : ''} />
          {loadedDocuments.length > 0 && <span className="rag-badge">{loadedDocuments.length}</span>}
        </button>
        <input
          type="text"
          placeholder={t.chatbotInputPlaceholder}
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
});

Chatbot.displayName = 'Chatbot';

export default Chatbot;
