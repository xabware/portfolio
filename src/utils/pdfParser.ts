/**
 * =====================================================
 * PDF PARSER - Extracción de texto de documentos PDF
 * =====================================================
 * 
 * Utiliza pdfjs-dist para extraer texto de PDFs en el navegador.
 * Preserva la información de página para referencias de origen.
 * =====================================================
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configurar el worker de PDF.js desde el bundle local (Vite lo resuelve)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Representa un fragmento de texto extraído de un PDF
 */
export interface PDFPageContent {
  /** Número de página (1-indexed) */
  pageNumber: number;
  /** Texto extraído de la página */
  text: string;
}

/**
 * Resultado de la extracción completa de un PDF
 */
export interface PDFDocument {
  /** Nombre del archivo */
  fileName: string;
  /** Número total de páginas */
  totalPages: number;
  /** Contenido por página */
  pages: PDFPageContent[];
  /** Texto completo del documento */
  fullText: string;
}

/**
 * Extrae el texto de un archivo PDF
 * @param file Archivo PDF desde un input file
 * @returns Documento con texto extraído por página
 */
export async function extractTextFromPDF(file: File): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const pages: PDFPageContent[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Reconstruir texto preservando estructura
    let pageText = '';
    let lastY: number | null = null;
    
    for (const item of textContent.items) {
      if ('str' in item) {
        const textItem = item as { str: string; transform: number[] };
        const currentY = textItem.transform[5];
        
        // Detectar salto de línea por cambio en posición Y
        if (lastY !== null && Math.abs(currentY - lastY) > 2) {
          pageText += '\n';
        } else if (lastY !== null && pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }
        
        pageText += textItem.str;
        lastY = currentY;
      }
    }
    
    // Limpiar texto
    pageText = pageText
      .replace(/\n{3,}/g, '\n\n')  // Máximo 2 saltos de línea
      .replace(/[ \t]+/g, ' ')      // Normalizar espacios
      .trim();
    
    if (pageText.length > 0) {
      pages.push({
        pageNumber: i,
        text: pageText,
      });
    }
  }
  
  return {
    fileName: file.name,
    totalPages: pdf.numPages,
    pages,
    fullText: pages.map(p => p.text).join('\n\n'),
  };
}

/**
 * Valida que el archivo sea un PDF válido
 */
export function isValidPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Formatea el tamaño del archivo para mostrar al usuario
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
