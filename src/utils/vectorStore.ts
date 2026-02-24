/**
 * =====================================================
 * VECTOR STORE - Almacén vectorial con BM25
 * =====================================================
 * 
 * Implementa un vector store client-side usando BM25 para
 * retrieval eficiente sin necesidad de un modelo de embeddings.
 * 
 * BM25 (Best Matching 25) es un algoritmo de ranking estándar
 * en información retrieval, usado por Elasticsearch, Lucene, etc.
 * =====================================================
 */

import type { PDFDocument } from './pdfParser';

/**
 * Un fragmento (chunk) del documento con metadata de origen
 */
export interface DocumentChunk {
  /** Texto del fragmento */
  text: string;
  /** Número de página origen */
  pageNumber: number;
  /** Índice del chunk dentro de la página */
  chunkIndex: number;
  /** Nombre del archivo de origen */
  fileName: string;
  /** ID único del chunk */
  id: string;
}

/**
 * Resultado de búsqueda con score de relevancia
 */
export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  /** Porcentaje de relevancia normalizado 0-100 */
  relevance: number;
}

/**
 * Fuente numerada con contexto expandido para referenciación inline
 */
export interface NumberedSource {
  /** ID de referencia [1], [2], etc. */
  refId: number;
  /** Chunk principal (hit directo de BM25) */
  chunk: DocumentChunk;
  /** Texto expandido con chunks adyacentes para mayor contexto */
  expandedText: string;
  /** Relevancia normalizada 0-100 */
  relevance: number;
}

/**
 * Detalle de la búsqueda inversa para una oración
 */
export interface ReverseSearchSentenceDetail {
  sentence: string;
  scores: { refId: number; coverage: number; distinctiveScore: number }[];
  assignedRefId: number | null;
  reason: string;
}

/**
 * Resultado completo de la búsqueda inversa
 */
export interface ReverseSearchResult {
  annotatedText: string;
  details: ReverseSearchSentenceDetail[];
}

/**
 * Información de debug completa de una interacción RAG
 */
export interface RAGDebugInfo {
  timestamp: Date;
  query: string;
  /** Fuentes encontradas con texto expandido */
  sources: {
    refId: number;
    fileName: string;
    pageNumber: number;
    relevance: number;
    mainChunkText: string;
    expandedText: string;
  }[];
  /** Fragmento del prompt RAG enviado al LLM */
  ragPrompt: string;
  /** Respuesta cruda del LLM (sin anotar) */
  rawResponse: string;
  /** Detalle de la búsqueda inversa por oración */
  reverseSearchDetails: ReverseSearchSentenceDetail[];
  /** Respuesta final anotada */
  annotatedResponse: string;
}

/**
 * Configuración del chunking
 */
interface ChunkingConfig {
  /** Tamaño máximo de cada chunk en caracteres */
  chunkSize: number;
  /** Solapamiento entre chunks consecutivos */
  overlap: number;
}

const DEFAULT_CONFIG: ChunkingConfig = {
  chunkSize: 500,
  overlap: 100,
};

/**
 * Parámetros BM25
 */
const BM25_K1 = 1.5;  // Saturación de frecuencia de término
const BM25_B = 0.75;  // Normalización por longitud del documento

/**
 * Stopwords en español e inglés para mejorar la calidad de búsqueda
 */
const STOPWORDS = new Set([
  // Español
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por',
  'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero',
  'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando',
  'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien',
  'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra',
  'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos',
  'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos',
  'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas',
  'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus',
  'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos',
  'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas',
  'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros',
  'vuestras', 'esos', 'esas', 'estoy', 'estás', 'está', 'estamos', 'estáis',
  'están', 'esté', 'estés', 'estemos', 'estéis', 'estén', 'estaré', 'estarás',
  'estará', 'estaremos', 'estaréis', 'estarán', 'estaría', 'estarías',
  'ser', 'soy', 'eres', 'es', 'somos', 'sois', 'son', 'sea', 'seas', 'seamos',
  'seáis', 'sean', 'seré', 'serás', 'será', 'seremos', 'seréis', 'serán',
  'sería', 'serías', 'he', 'has', 'ha', 'hemos', 'habéis', 'han', 'haya',
  'hayas', 'hayamos', 'hayáis', 'hayan', 'habré', 'habrás', 'habrá',
  'habremos', 'habréis', 'habrán', 'habría', 'habrías',
  'tener', 'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen',
  'hacer', 'hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen',
  'poder', 'puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden',
  'decir', 'digo', 'dices', 'dice', 'decimos', 'decís', 'dicen',
  'ir', 'voy', 'vas', 'va', 'vamos', 'vais', 'van',
  'ver', 'veo', 'ves', 've', 'vemos', 'veis', 'ven',
  'dar', 'doy', 'das', 'da', 'damos', 'dais', 'dan',
  'saber', 'sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben',
  'querer', 'quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren',
  'llegar', 'llego', 'llegas', 'llega', 'llegamos', 'llegáis', 'llegan',
  'pasar', 'paso', 'pasas', 'pasa', 'pasamos', 'pasáis', 'pasan',
  'deber', 'debo', 'debes', 'debe', 'debemos', 'debéis', 'deben',
  'poner', 'pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen',
  'parecer', 'parezco', 'pareces', 'parece', 'parecemos', 'parecéis', 'parecen',
  'quedar', 'quedo', 'quedas', 'queda', 'quedamos', 'quedáis', 'quedan',
  'creer', 'creo', 'crees', 'cree', 'creemos', 'creéis', 'creen',
  'hablar', 'hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan',
  'llevar', 'llevo', 'llevas', 'lleva', 'llevamos', 'lleváis', 'llevan',
  'dejar', 'dejo', 'dejas', 'deja', 'dejamos', 'dejáis', 'dejan',
  'seguir', 'sigo', 'sigues', 'sigue', 'seguimos', 'seguís', 'siguen',
  'encontrar', 'encuentro', 'encuentras', 'encuentra', 'encontramos', 'encontráis', 'encuentran',
  'llamar', 'llamo', 'llamas', 'llama', 'llamamos', 'llamáis', 'llaman',
  'venir', 'vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen',
  'pensar', 'pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan',
  'salir', 'salgo', 'sales', 'sale', 'salimos', 'salís', 'salen',
  'las', 'los', 'un', 'una', 'unos', 'unas',
  // English
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but',
  'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will',
  'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
  'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can',
  'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into',
  'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
  'most', 'us', 'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had',
  'did', 'does', 'doing', 'am',
]);

/**
 * Tokeniza un texto en palabras significativas
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos para búsqueda
    .replace(/[^\w\s]/g, ' ')        // Reemplazar puntuación por espacios
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOPWORDS.has(word));
}

/**
 * Divide el texto de un documento en chunks con solapamiento
 */
function chunkText(
  text: string,
  pageNumber: number,
  fileName: string,
  config: ChunkingConfig = DEFAULT_CONFIG
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Dividir primero por párrafos
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const paragraph of paragraphs) {
    // Si el párrafo solo excede el tamaño, dividirlo por oraciones
    if (paragraph.length > config.chunkSize) {
      // Guardar el chunk actual si tiene contenido
      if (currentChunk.trim().length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          pageNumber,
          chunkIndex: chunkIndex++,
          fileName,
          id: `${fileName}-p${pageNumber}-c${chunkIndex}`,
        });
        currentChunk = '';
      }
      
      // Dividir párrafo largo por oraciones
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      for (const sentence of sentences) {
        if ((currentChunk + ' ' + sentence).length > config.chunkSize && currentChunk.length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            pageNumber,
            chunkIndex: chunkIndex++,
            fileName,
            id: `${fileName}-p${pageNumber}-c${chunkIndex}`,
          });
          // Incluir overlap del chunk anterior
          const words = currentChunk.split(/\s+/);
          const overlapWords = words.slice(-Math.floor(config.overlap / 5));
          currentChunk = overlapWords.join(' ') + ' ' + sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }
    } else if ((currentChunk + '\n\n' + paragraph).length > config.chunkSize && currentChunk.length > 0) {
      // El chunk actual + nuevo párrafo excede el tamaño
      chunks.push({
        text: currentChunk.trim(),
        pageNumber,
        chunkIndex: chunkIndex++,
        fileName,
        id: `${fileName}-p${pageNumber}-c${chunkIndex}`,
      });
      // Incluir overlap
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(config.overlap / 5));
      currentChunk = overlapWords.join(' ') + '\n\n' + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Guardar el último chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      pageNumber,
      chunkIndex: chunkIndex++,
      fileName,
      id: `${fileName}-p${pageNumber}-c${chunkIndex}`,
    });
  }
  
  return chunks;
}

/**
 * Vector Store con BM25 para retrieval
 */
export class VectorStore {
  private chunks: DocumentChunk[] = [];
  private documentFrequency: Map<string, number> = new Map();
  private totalDocuments: number = 0;
  private avgDocLength: number = 0;
  private tokenizedChunks: string[][] = [];

  /**
   * Indexa un documento PDF en el vector store
   */
  indexDocument(document: PDFDocument, config?: Partial<ChunkingConfig>): number {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Crear chunks de cada página
    const newChunks: DocumentChunk[] = [];
    for (const page of document.pages) {
      const pageChunks = chunkText(page.text, page.pageNumber, document.fileName, fullConfig);
      newChunks.push(...pageChunks);
    }
    
    // Agregar al store
    this.chunks.push(...newChunks);
    
    // Recalcular índices BM25
    this._buildIndex();
    
    return newChunks.length;
  }

  /**
   * Construye el índice BM25 (IDF + estadísticas)
   */
  private _buildIndex(): void {
    this.totalDocuments = this.chunks.length;
    this.documentFrequency.clear();
    this.tokenizedChunks = [];
    
    let totalLength = 0;
    
    for (const chunk of this.chunks) {
      const tokens = tokenize(chunk.text);
      this.tokenizedChunks.push(tokens);
      totalLength += tokens.length;
      
      // Contar frecuencia de documento (cuántos chunks contienen cada término)
      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        this.documentFrequency.set(token, (this.documentFrequency.get(token) || 0) + 1);
      }
    }
    
    this.avgDocLength = this.totalDocuments > 0 ? totalLength / this.totalDocuments : 0;
  }

  /**
   * Busca los chunks más relevantes para una consulta
   * @param query Texto de búsqueda
   * @param topK Número de resultados a retornar
   * @returns Resultados ordenados por relevancia
   */
  search(query: string, topK: number = 5): SearchResult[] {
    if (this.chunks.length === 0) return [];
    
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];
    
    const scores: { chunk: DocumentChunk; score: number }[] = [];
    
    for (let i = 0; i < this.chunks.length; i++) {
      const docTokens = this.tokenizedChunks[i];
      const docLength = docTokens.length;
      let score = 0;
      
      // Contar frecuencia de cada query token en el documento
      const termFrequency = new Map<string, number>();
      for (const token of docTokens) {
        termFrequency.set(token, (termFrequency.get(token) || 0) + 1);
      }
      
      for (const queryToken of queryTokens) {
        const tf = termFrequency.get(queryToken) || 0;
        if (tf === 0) continue;
        
        const df = this.documentFrequency.get(queryToken) || 0;
        
        // IDF con suavizado
        const idf = Math.log((this.totalDocuments - df + 0.5) / (df + 0.5) + 1);
        
        // BM25 score
        const tfNorm = (tf * (BM25_K1 + 1)) / (tf + BM25_K1 * (1 - BM25_B + BM25_B * (docLength / this.avgDocLength)));
        
        score += idf * tfNorm;
      }
      
      if (score > 0) {
        scores.push({ chunk: this.chunks[i], score });
      }
    }
    
    // Ordenar por score descendente
    scores.sort((a, b) => b.score - a.score);
    
    // Normalizar scores a 0-100
    const maxScore = scores.length > 0 ? scores[0].score : 1;
    
    return scores.slice(0, topK).map(result => ({
      chunk: result.chunk,
      score: result.score,
      relevance: Math.round((result.score / maxScore) * 100),
    }));
  }

  /**
   * Busca chunks relevantes, los expande con contexto adyacente
   * y los numera para referenciación inline.
   * Agrupa resultados de la misma página para evitar referencias redundantes.
   */
  searchWithContext(query: string, topK: number = 5): NumberedSource[] {
    const results = this.search(query, topK);
    if (results.length === 0) return [];

    // Agrupar resultados por archivo + página
    const pageGroups = new Map<string, SearchResult[]>();
    for (const result of results) {
      const key = `${result.chunk.fileName}::${result.chunk.pageNumber}`;
      const group = pageGroups.get(key) || [];
      group.push(result);
      pageGroups.set(key, group);
    }

    const numberedSources: NumberedSource[] = [];
    let refId = 1;

    for (const [, group] of pageGroups) {
      const primaryChunk = group[0].chunk;

      // Recoger índices de chunks relevantes + adyacentes (±1)
      const chunkIndices = new Set<number>();
      for (const result of group) {
        chunkIndices.add(result.chunk.chunkIndex);
        chunkIndices.add(result.chunk.chunkIndex - 1);
        chunkIndices.add(result.chunk.chunkIndex + 1);
      }

      // Obtener textos expandidos
      const expandedChunks: { chunkIndex: number; text: string }[] = [];
      for (const chunk of this.chunks) {
        if (
          chunk.fileName === primaryChunk.fileName &&
          chunk.pageNumber === primaryChunk.pageNumber &&
          chunkIndices.has(chunk.chunkIndex)
        ) {
          expandedChunks.push({ chunkIndex: chunk.chunkIndex, text: chunk.text });
        }
      }

      // Ordenar por posición para texto coherente
      expandedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
      const expandedText = expandedChunks.map(c => c.text).join('\n\n');

      numberedSources.push({
        refId: refId++,
        chunk: primaryChunk,
        expandedText,
        relevance: Math.max(...group.map(r => r.relevance)),
      });
    }

    // Ordenar por posición en el documento para navegación intuitiva
    numberedSources.sort((a, b) => {
      if (a.chunk.fileName !== b.chunk.fileName)
        return a.chunk.fileName.localeCompare(b.chunk.fileName);
      return a.chunk.pageNumber - b.chunk.pageNumber;
    });

    // Re-numerar después de ordenar
    numberedSources.forEach((source, i) => {
      source.refId = i + 1;
    });

    return numberedSources;
  }

  /**
   * Obtiene los documentos cargados (nombres únicos)
   */
  getLoadedDocuments(): string[] {
    return [...new Set(this.chunks.map(c => c.fileName))];
  }

  /**
   * Obtiene el número total de chunks indexados
   */
  getChunkCount(): number {
    return this.chunks.length;
  }

  /**
   * Elimina un documento del store
   */
  removeDocument(fileName: string): void {
    this.chunks = this.chunks.filter(c => c.fileName !== fileName);
    this._buildIndex();
  }

  /**
   * Limpia todo el store
   */
  clear(): void {
    this.chunks = [];
    this.documentFrequency.clear();
    this.totalDocuments = 0;
    this.avgDocLength = 0;
    this.tokenizedChunks = [];
  }

  /**
   * Comprueba si hay documentos cargados
   */
  hasDocuments(): boolean {
    return this.chunks.length > 0;
  }
}

/**
 * Formatea los resultados de búsqueda como contexto para el LLM
 */
export function formatRAGContext(results: SearchResult[], language: 'es' | 'en' = 'es'): string {
  if (results.length === 0) return '';
  
  const header = language === 'es'
    ? 'CONTEXTO DEL DOCUMENTO (usa esta información para responder, cita la página de origen):'
    : 'DOCUMENT CONTEXT (use this information to answer, cite the source page):';
  
  const chunks = results.map((r, i) => {
    const sourceLabel = language === 'es' ? 'Fuente' : 'Source';
    const pageLabel = language === 'es' ? 'Página' : 'Page';
    const relevanceLabel = language === 'es' ? 'Relevancia' : 'Relevance';
    
    return `[${sourceLabel} ${i + 1}: ${r.chunk.fileName}, ${pageLabel} ${r.chunk.pageNumber}, ${relevanceLabel}: ${r.relevance}%]
${r.chunk.text}`;
  }).join('\n\n');
  
  const instruction = language === 'es'
    ? '\nIMPORTANTE: Basa tu respuesta en el contexto del documento anterior. Siempre indica la página de origen entre paréntesis, por ejemplo: (Página X). Si la información no está en el documento, indícalo claramente.'
    : '\nIMPORTANT: Base your answer on the document context above. Always indicate the source page in parentheses, for example: (Page X). If the information is not in the document, clearly state so.';
  
  return `${header}\n\n${chunks}\n${instruction}`;
}

/**
 * Formatea fuentes numeradas como contexto para el LLM.
 * Incluye el texto expandido (con chunks adyacentes) para dar más contexto.
 * Instruye al LLM a NO usar marcadores — el sistema los añade automáticamente.
 */
export function formatRAGContextNumbered(sources: NumberedSource[], language: 'es' | 'en' = 'es'): string {
  if (sources.length === 0) return '';

  const header = language === 'es'
    ? 'CONTEXTO DEL DOCUMENTO (usa esta información para responder):'
    : 'DOCUMENT CONTEXT (use this information to answer):';

  const pageLabel = language === 'es' ? 'Página' : 'Page';

  const chunks = sources.map(s =>
    `[Fuente ${s.refId}: ${s.chunk.fileName}, ${pageLabel} ${s.chunk.pageNumber}]\n${s.expandedText}`
  ).join('\n\n---\n\n');

  const instruction = language === 'es'
    ? '\nIMPORTANTE: Responde de manera natural y detallada usando la información del documento. NO incluyas marcadores de referencia como [1] o [2] ni menciones "Fuente" en tu respuesta; el sistema añadirá las referencias automáticamente. Si la información no está en el documento, indícalo claramente.'
    : '\nIMPORTANT: Answer naturally and in detail using the document information. Do NOT include reference markers like [1] or [2] or mention "Source" in your response; the system will add references automatically. If the information is not in the document, clearly state so.';

  return `${header}\n\n${chunks}\n${instruction}`;
}

/**
 * Búsqueda inversa: analiza la respuesta del LLM y añade
 * referencias [N] inline en las partes que corresponden a cada fuente.
 * 
 * Algoritmo mejorado con TF-IDF por distinctividad:
 * 1. Divide la respuesta en párrafos → oraciones
 * 2. Tokeniza cada oración y cada fuente
 * 3. Calcula la distinctividad de cada token (inverso del nº de fuentes que lo contienen)
 * 4. Score ponderado: tokens exclusivos de una fuente pesan más
 * 5. Solo asigna referencia si hay diferenciación clara entre fuentes
 */
export function reverseSearchAnnotate(
  responseText: string,
  sources: NumberedSource[],
): ReverseSearchResult {
  const details: ReverseSearchSentenceDetail[] = [];

  if (sources.length === 0) return { annotatedText: responseText, details };

  // Pre-tokenizar fuentes
  const sourceTokenSets = sources.map(s => new Set(tokenize(s.expandedText)));

  // Distinctividad: tokens en pocas fuentes son más informativos
  const tokenSourceCount = new Map<string, number>();
  for (const tokenSet of sourceTokenSets) {
    for (const token of tokenSet) {
      tokenSourceCount.set(token, (tokenSourceCount.get(token) || 0) + 1);
    }
  }

  const paragraphs = responseText.split(/\n/);

  const annotatedParagraphs = paragraphs.map(paragraph => {
    if (paragraph.trim().length === 0) return paragraph;

    const sentences = paragraph.split(/(?<=[.!?:;])\s+/);

    const annotatedSentences = sentences.map(sentence => {
      // Si ya tiene referencia, dejar como está
      if (/\[\d+\]/.test(sentence)) {
        details.push({
          sentence,
          scores: [],
          assignedRefId: null,
          reason: 'Ya tiene referencia',
        });
        return sentence;
      }

      const sentTokens = tokenize(sentence);
      if (sentTokens.length < 3) {
        details.push({
          sentence,
          scores: [],
          assignedRefId: null,
          reason: `Oración demasiado corta (${sentTokens.length} tokens)`,
        });
        return sentence;
      }

      const sentTokenSet = new Set(sentTokens);

      // Calcular score ponderado por distinctividad para cada fuente
      const scored: { refId: number; coverage: number; distinctiveScore: number }[] = [];

      for (let i = 0; i < sources.length; i++) {
        let rawIntersection = 0;
        let weightedScore = 0;

        for (const token of sentTokenSet) {
          if (sourceTokenSets[i].has(token)) {
            rawIntersection++;
            // Peso inversamente proporcional al nº de fuentes que contienen el token
            const distinctiveness = 1 / (tokenSourceCount.get(token) || 1);
            weightedScore += distinctiveness;
          }
        }

        const coverage = rawIntersection / sentTokenSet.size;
        // Normalizar score ponderado por tamaño de oración
        const normalizedDistinctive = weightedScore / sentTokenSet.size;

        scored.push({
          refId: sources[i].refId,
          coverage,
          distinctiveScore: normalizedDistinctive,
        });
      }

      // Ordenar por score distintivo
      scored.sort((a, b) => b.distinctiveScore - a.distinctiveScore);
      const best = scored[0];
      const secondBest = scored.length > 1 ? scored[1] : null;

      // Criterios para asignar referencia:
      // 1. Cobertura bruta mínima ≥ 30% y ≥ 3 tokens coincidentes
      // 2. Si hay varias fuentes, el score distintivo debe ser significativamente mayor
      const rawIntersection = Math.round(best.coverage * sentTokenSet.size);
      const hasMinCoverage = best.coverage >= 0.30 && rawIntersection >= 3;

      let assignable = false;
      let reason = '';

      if (!hasMinCoverage) {
        reason = `Cobertura insuficiente: ${(best.coverage * 100).toFixed(0)}% (ref ${best.refId})`;
      } else if (sources.length === 1) {
        assignable = true;
        reason = `Única fuente, cobertura ${(best.coverage * 100).toFixed(0)}%`;
      } else if (secondBest && best.distinctiveScore > 0) {
        // Ratio de diferenciación
        const ratio = secondBest.distinctiveScore > 0
          ? best.distinctiveScore / secondBest.distinctiveScore
          : Infinity;

        if (ratio >= 1.3) {
          assignable = true;
          reason = `Ref [${best.refId}] mejor con ratio ${ratio.toFixed(2)} vs ref [${secondBest.refId}]`;
        } else {
          reason = `Sin diferenciación clara: ratio ${ratio.toFixed(2)} entre ref [${best.refId}] y ref [${secondBest.refId}]`;
        }
      }

      details.push({
        sentence,
        scores: scored,
        assignedRefId: assignable ? best.refId : null,
        reason,
      });

      if (assignable) {
        const trimmed = sentence.trimEnd();
        const lastChar = trimmed[trimmed.length - 1];
        if ('.!?:;'.includes(lastChar)) {
          return trimmed.slice(0, -1) + ` [${best.refId}]` + lastChar;
        }
        return trimmed + ` [${best.refId}]`;
      }

      return sentence;
    });

    return annotatedSentences.join(' ');
  });

  return {
    annotatedText: annotatedParagraphs.join('\n'),
    details,
  };
}
