import { lazy, Suspense, memo, useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { useWebLLM } from '../../hooks/useWebLLM';
import { usePopupWindow } from '../WindowPortal';
import { PopupContext } from '../PopupContext';
import MobileModal from '../MobileModal';
import './Chat.css';

const Chatbot = lazy(() => import('../Chatbot'));
const PDFViewer = lazy(() => import('../PDFViewer'));
const DebugPanel = lazy(() => import('../DebugPanel'));

/** Hook para detectar si estamos en móvil */
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  
  return isMobile;
};

const Chat = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const isMobile = useIsMobile();
  const { 
    pdfFiles, 
    activePdfFile, 
    activePdfPage, 
    setActivePdfFile,
    setActivePdfPage,
    openPdfAtPage,
    lastSearchResults,
    debugMode,
    setDebugMode,
    lastDebugInfo,
  } = useWebLLM();

  // Estado para modales móviles
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  
  // Ventanas popup para desktop (open() se llama desde click handlers)
  const pdfPopup = usePopupWindow({ windowId: 'pdf-viewer-window', width: 700, height: 900 });
  const debugPopup = usePopupWindow({ windowId: 'debug-panel-window', width: 600, height: 750 });
  
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
    // Pipeline status
    statusSearching: language === 'es' ? 'Buscando...' : 'Searching...',
    statusPrompting: language === 'es' ? 'Prompt...' : 'Prompting...',
    statusGenerating: language === 'es' ? 'Generando...' : 'Generating...',
    statusAnnotating: language === 'es' ? 'Anotando...' : 'Annotating...',
    statusComplete: language === 'es' ? 'Hecho' : 'Done',
    statusError: language === 'es' ? 'Error' : 'Error',
  };

  // --- Funciones de control de popups (llamadas desde click handlers via PopupContext) ---

  const openPdfPopup = useCallback((fileName: string, page: number) => {
    openPdfAtPage(fileName, page);
    if (isMobile) {
      setPdfModalOpen(true);
    } else {
      const pdf = pdfFiles.get(fileName);
      pdfPopup.open(`PDF — ${pdf?.fileName || fileName}`);
    }
  }, [isMobile, openPdfAtPage, pdfPopup, pdfFiles]);

  const closePdfPopup = useCallback(() => {
    pdfPopup.close();
    setPdfModalOpen(false);
    setActivePdfFile(null);
  }, [pdfPopup, setActivePdfFile]);

  const openDebugPopup = useCallback(() => {
    if (isMobile) return; // Debug no disponible en móvil
    setDebugMode(true);
    debugPopup.open('Debug RAG');
  }, [isMobile, setDebugMode, debugPopup]);

  const closeDebugPopup = useCallback(() => {
    debugPopup.close();
    setDebugMode(false);
  }, [debugPopup, setDebugMode]);

  const popupContextValue = useMemo(() => ({
    openPdfPopup,
    closePdfPopup,
    openDebugPopup,
    closeDebugPopup,
    isMobile,
  }), [openPdfPopup, closePdfPopup, openDebugPopup, closeDebugPopup, isMobile]);
  
  return (
    <div className="chat-full-screen">
      <Suspense fallback={<div className="loading">{t.chatLoading}</div>}>
        <PopupContext.Provider value={popupContextValue}>
          <Chatbot />
        </PopupContext.Provider>

        {/* Desktop: renderizar en ventanas popup via createPortal */}
        {!isMobile && pdfPopup.container && activePdf && createPortal(
          <Suspense fallback={<div className="loading">Loading PDF viewer...</div>}>
            <PDFViewer
              pdfFile={activePdf}
              currentPage={activePdfPage}
              onPageChange={setActivePdfPage}
              onClose={closePdfPopup}
              highlightedPages={highlightedPages}
              translations={pdfViewerTranslations}
            />
          </Suspense>,
          pdfPopup.container
        )}

        {!isMobile && debugPopup.container && debugMode && createPortal(
          <Suspense fallback={<div className="loading">Loading debug panel...</div>}>
            <DebugPanel
              debugInfo={lastDebugInfo}
              translations={debugPanelTranslations}
            />
          </Suspense>,
          debugPopup.container
        )}

        {/* Mobile: modales a pantalla completa */}
        {isMobile && pdfModalOpen && activePdf && (
          <MobileModal
            title={activePdf.fileName}
            icon={<FileText size={16} />}
            onClose={closePdfPopup}
          >
            <PDFViewer
              pdfFile={activePdf}
              currentPage={activePdfPage}
              onPageChange={setActivePdfPage}
              onClose={closePdfPopup}
              highlightedPages={highlightedPages}
              translations={pdfViewerTranslations}
            />
          </MobileModal>
        )}
      </Suspense>
    </div>
  );
});

Chat.displayName = 'Chat';

export default Chat;
