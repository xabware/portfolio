/**
 * =====================================================
 * PDF VIEWER - Visualizador de PDF integrado en el chat
 * =====================================================
 * 
 * Renderiza páginas de PDF usando pdfjs-dist canvas rendering.
 * Permite navegación por páginas y resaltado de fuentes RAG.
 * =====================================================
 */

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFFileData } from '../contexts/WebLLMContext';
import './PDFViewer.css';

interface PDFViewerProps {
  pdfFile: PDFFileData;
  currentPage: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
  /** Páginas que tienen fuentes referenciadas (para marcarlas) */
  highlightedPages?: number[];
  translations: {
    page: string;
    of: string;
    close: string;
    zoomIn: string;
    zoomOut: string;
    referencedPage: string;
  };
}

const PDFViewer = memo(({ pdfFile, currentPage, onPageChange, onClose, highlightedPages = [], translations: t }: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.0);
  const [isRendering, setIsRendering] = useState(false);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  // Guardamos el ownerDocument del canvas para pasarlo a pdfjs (fix popup fonts)
  const [canvasMounted, setCanvasMounted] = useState(false);
  const ownerDocRef = useRef<Document>(document);

  // Callback ref para detectar cuándo el canvas se monta y capturar su ownerDocument
  const canvasCallbackRef = useCallback((node: HTMLCanvasElement | null) => {
    (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
    if (node) {
      ownerDocRef.current = node.ownerDocument;
      setCanvasMounted(true);
    } else {
      setCanvasMounted(false);
    }
  }, []);

  // Cargar el documento PDF, esperando a que el canvas esté montado
  // para obtener el ownerDocument correcto (crucial para popup windows)
  useEffect(() => {
    if (!canvasMounted) return;
    let cancelled = false;
    const loadPdf = async () => {
      try {
        const doc = await pdfjsLib.getDocument({
          data: pdfFile.data.slice(0),
          ownerDocument: ownerDocRef.current as HTMLDocument,
        }).promise;
        if (!cancelled) {
          pdfDocRef.current = doc;
          // Trigger render
          setIsRendering(false);
        }
      } catch (err) {
        console.error('Error loading PDF for viewer:', err);
      }
    };
    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfFile.data, canvasMounted]);

  // Renderizar la página actual
  const renderPage = useCallback(async () => {
    const pdf = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas || isRendering) return;

    // Cancelar render anterior si existe
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setIsRendering(true);
    try {
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const context = canvas.getContext('2d');
      if (!context) return;

      const renderTask = page.render({
        canvasContext: context,
        canvas: canvas,
        viewport,
      });
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
    } catch (err) {
      // Ignorar errores de cancelación
      if (err instanceof Error && err.message.includes('Rendering cancelled')) return;
      console.error('Error rendering PDF page:', err);
    } finally {
      setIsRendering(false);
      renderTaskRef.current = null;
    }
  }, [currentPage, scale, isRendering]);

  // Re-render cuando cambia la página, el scale, o el documento
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage();
    }
  }, [currentPage, scale, pdfFile.fileName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render cuando el doc se carga por primera vez
  useEffect(() => {
    const interval = setInterval(() => {
      if (pdfDocRef.current && canvasRef.current) {
        renderPage();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [pdfFile.data, canvasMounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (currentPage < pdfFile.totalPages) onPageChange(currentPage + 1);
  }, [currentPage, pdfFile.totalPages, onPageChange]);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const isHighlighted = highlightedPages.includes(currentPage);

  return (
    <div className="pdf-viewer">
      {/* Header / Toolbar */}
      <div className="pdf-viewer-toolbar">
        <div className="pdf-viewer-file-info">
          <FileText size={14} />
          <span className="pdf-viewer-filename">{pdfFile.fileName}</span>
        </div>
        <div className="pdf-viewer-controls">
          <button onClick={zoomOut} title={t.zoomOut} className="pdf-viewer-btn">
            <ZoomOut size={14} />
          </button>
          <span className="pdf-viewer-zoom">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} title={t.zoomIn} className="pdf-viewer-btn">
            <ZoomIn size={14} />
          </button>
        </div>
        <button onClick={onClose} title={t.close} className="pdf-viewer-btn pdf-viewer-close">
          <X size={16} />
        </button>
      </div>

      {/* Page navigation */}
      <div className="pdf-viewer-nav">
        <button onClick={goToPrevPage} disabled={currentPage <= 1} className="pdf-viewer-btn">
          <ChevronLeft size={16} />
        </button>
        <span className={`pdf-viewer-page-info ${isHighlighted ? 'highlighted' : ''}`}>
          {t.page} {currentPage} {t.of} {pdfFile.totalPages}
          {isHighlighted && <span className="pdf-viewer-ref-badge">{t.referencedPage}</span>}
        </span>
        <button onClick={goToNextPage} disabled={currentPage >= pdfFile.totalPages} className="pdf-viewer-btn">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Highlighted pages quick nav */}
      {highlightedPages.length > 0 && (
        <div className="pdf-viewer-highlights">
          {highlightedPages.map(page => (
            <button
              key={page}
              className={`pdf-viewer-highlight-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {t.page} {page}
            </button>
          ))}
        </div>
      )}

      {/* Canvas container */}
      <div className="pdf-viewer-canvas-container" ref={containerRef}>
        <canvas ref={canvasCallbackRef} className="pdf-viewer-canvas" />
        {isRendering && (
          <div className="pdf-viewer-loading">
            <div className="loading-spinner small" />
          </div>
        )}
      </div>
    </div>
  );
});

PDFViewer.displayName = 'PDFViewer';

export default PDFViewer;
