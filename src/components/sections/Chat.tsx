import { lazy, Suspense, memo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { useWebLLM } from '../../hooks/useWebLLM';
import './Chat.css';

const Chatbot = lazy(() => import('../Chatbot'));
const PDFViewer = lazy(() => import('../PDFViewer'));
const DebugPanel = lazy(() => import('../DebugPanel'));

const Chat = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { 
    pdfFiles, 
    activePdfFile, 
    activePdfPage, 
    setActivePdfFile, 
    setActivePdfPage,
    lastSearchResults,
    debugMode,
    lastDebugInfo,
  } = useWebLLM();
  
  const activePdf = activePdfFile ? pdfFiles.get(activePdfFile) : null;
  
  // Páginas referenciadas por las últimas fuentes RAG
  const highlightedPages = activePdf 
    ? [...new Set(
        lastSearchResults
          .filter(r => r.chunk.fileName === activePdfFile)
          .map(r => r.chunk.pageNumber)
      )]
    : [];
  
  const pdfViewerTranslations = {
    page: t.ragPage,
    of: language === 'es' ? 'de' : 'of',
    close: language === 'es' ? 'Cerrar visor' : 'Close viewer',
    zoomIn: language === 'es' ? 'Acercar' : 'Zoom in',
    zoomOut: language === 'es' ? 'Alejar' : 'Zoom out',
    referencedPage: language === 'es' ? 'Referenciada' : 'Referenced',
  };

  const debugPanelTranslations = {
    title: language === 'es' ? 'Debug RAG' : 'RAG Debug',
    noData: language === 'es' ? 'Envía un mensaje con RAG activo para ver los pasos intermedios' : 'Send a message with RAG active to see intermediate steps',
    query: language === 'es' ? 'Consulta del usuario' : 'User query',
    sourcesFound: language === 'es' ? 'Fuentes encontradas' : 'Sources found',
    ragPrompt: language === 'es' ? 'Prompt RAG enviado' : 'RAG prompt sent',
    rawResponse: language === 'es' ? 'Respuesta cruda del LLM' : 'Raw LLM response',
    reverseSearch: language === 'es' ? 'Búsqueda inversa' : 'Reverse search',
    annotatedResponse: language === 'es' ? 'Respuesta anotada final' : 'Final annotated response',
    page: t.ragPage,
    relevance: language === 'es' ? 'Relevancia' : 'Relevance',
    mainChunk: language === 'es' ? 'Chunk principal' : 'Main chunk',
    expandedContext: language === 'es' ? 'Contexto expandido' : 'Expanded context',
    sentence: language === 'es' ? 'Oración' : 'Sentence',
    assigned: language === 'es' ? 'Asignada' : 'Assigned',
    notAssigned: language === 'es' ? 'Sin asignar' : 'Unassigned',
    reason: language === 'es' ? 'Razón' : 'Reason',
    scores: language === 'es' ? 'Puntuaciones' : 'Scores',
    coverage: language === 'es' ? 'Cobert.' : 'Cover.',
    distinctive: language === 'es' ? 'Distint.' : 'Distint.',
  };

  const hasSidePanel = activePdf || debugMode;
  
  return (
    <div className="chat-full-screen">
      <Suspense fallback={<div className="loading">{t.chatLoading}</div>}>
        {hasSidePanel ? (
          <div className="chat-split-layout">
            <Chatbot />
            <div className="chat-side-panels">
              {activePdf && (
                <PDFViewer
                  pdfFile={activePdf}
                  currentPage={activePdfPage}
                  onPageChange={setActivePdfPage}
                  onClose={() => setActivePdfFile(null)}
                  highlightedPages={highlightedPages}
                  translations={pdfViewerTranslations}
                />
              )}
              {debugMode && (
                <DebugPanel
                  debugInfo={lastDebugInfo}
                  translations={debugPanelTranslations}
                />
              )}
            </div>
          </div>
        ) : (
          <Chatbot />
        )}
      </Suspense>
    </div>
  );
});

Chat.displayName = 'Chat';

export default Chat;
