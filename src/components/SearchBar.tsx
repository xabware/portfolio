import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import { generateSearchableContent } from '../data/contextGenerator';
import './SearchBar.css';

interface SearchResult {
  section: string;
  title: string;
  content: string;
  relevance: number;
  projectId?: number;
}

interface SearchBarProps {
  onNavigate: (section: string) => void;
}

const SearchBar = memo(({ onNavigate }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = useTranslations(language);

  // Contenido indexado de todas las secciones (generado dinámicamente desde la carpeta data)
  // Este contenido ahora se actualiza automáticamente cuando editas los archivos en src/data/
  const searchableContent = useMemo(() => 
    generateSearchableContent(language, t), 
    [language, t]
  );

  // Función de búsqueda memoizada
  const performSearch = useCallback(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const foundResults: SearchResult[] = [];

    searchableContent.forEach((item) => {
      const contentLower = item.content.toLowerCase();
      const titleLower = item.title.toLowerCase();

      // Calcular relevancia
      let relevance = 0;
      
      // Mayor peso si coincide con el título
      if (titleLower.includes(queryLower)) {
        relevance += 10;
      }

      // Peso por coincidencias en el contenido
      const matches = contentLower.match(new RegExp(queryLower, 'gi'));
      if (matches) {
        relevance += matches.length;
      }

      // Búsqueda de palabras individuales
      const queryWords = queryLower.split(' ').filter(w => w.length > 2);
      queryWords.forEach(word => {
        const wordMatches = contentLower.match(new RegExp(word, 'gi'));
        if (wordMatches) {
          relevance += wordMatches.length * 0.5;
        }
      });

      if (relevance > 0) {
        // Extraer un fragmento relevante del contenido
        const index = contentLower.indexOf(queryLower);
        let snippet = '';
        
        if (index !== -1) {
          const start = Math.max(0, index - 30);
          const end = Math.min(item.content.length, index + queryLower.length + 50);
          snippet = item.content.substring(start, end);
          if (start > 0) snippet = '...' + snippet;
          if (end < item.content.length) snippet = snippet + '...';
        } else {
          snippet = item.content.substring(0, 80) + '...';
        }

        foundResults.push({
          section: item.section,
          title: item.title,
          content: snippet,
          relevance,
        });
      }
    });

    // Ordenar por relevancia
    foundResults.sort((a, b) => b.relevance - a.relevance);
    setResults(foundResults.slice(0, 6)); // Máximo 6 resultados
  }, [query, searchableContent]);

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = useCallback((section: string) => {
    onNavigate(section);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, [onNavigate]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className={`search-bar ${isOpen ? 'search-bar-open' : ''}`}>
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button className="search-clear" onClick={handleClear} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          <div className="search-results-header">
            {results.length} {results.length === 1 ? t.searchResultSingular : t.searchResultPlural}
          </div>
          {results.map((result, index) => (
            <button
              key={`${result.section}-${index}`}
              className="search-result-item"
              onClick={() => handleResultClick(result.section)}
            >
              <div className="search-result-title">{result.title}</div>
              <div className="search-result-content">{result.content}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="search-results">
          <div className="search-no-results">{t.searchNoResults}</div>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
