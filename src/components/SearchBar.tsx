import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import './SearchBar.css';

interface SearchResult {
  section: string;
  title: string;
  content: string;
  relevance: number;
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

  // Contenido indexado de todas las secciones (memoizado)
  const searchableContent = useMemo(() => [
    // Home
    {
      section: 'home',
      title: t.home,
      content: `${t.welcomeTitle} ${t.welcomeSubtitle} ${t.yearsExperience} ${t.projectsCompleted} ${t.aboutDashboard} ${t.dashboardDescription} ${t.features} ${t.modernDesign} ${t.darkModeSupport} ${t.aiChatbot} ${t.responsiveDesign} ${t.viteOptimized}`,
    },
    // About
    {
      section: 'about',
      title: t.about,
      content: `${t.aboutMe} ${t.aboutDescription1} ${t.aboutDescription2} ${t.professionalExperience} ${t.seniorFullStack} ${t.fullStackDeveloper} ${t.juniorDeveloper} ${t.education} desarrollador full-stack react node.js backend frontend`,
    },
    // Projects
    {
      section: 'projects',
      title: t.projects,
      content: `${t.myProjects} ${t.ecommercePlatform} ${t.ecommerceDescription} ${t.taskManagementApp} ${t.taskManagementDescription} ${t.aiChatbotSystem} ${t.aiChatbotDescription} ${t.analyticsDashboard} ${t.analyticsDashboardDescription} e-commerce MongoDB React Firebase Python FastAPI`,
    },
    // Skills
    {
      section: 'skills',
      title: t.skills,
      content: `${t.technicalSkills} ${t.frontend} ${t.backend} ${t.databases} ${t.devopsTools} React TypeScript JavaScript HTML CSS Node.js Express Python MongoDB PostgreSQL Docker Git AWS`,
    },
    // Chat
    {
      section: 'chat',
      title: t.chatbot,
      content: `${t.virtualAssistant} ${t.chatDescription} ${t.conversationalAI} RAG chatbot asistente inteligencia artificial`,
    },
    // Contact
    {
      section: 'contact',
      title: t.contact,
      content: `${t.contactTitle} ${t.contactSubtitle} ${t.email} ${t.sendMessage} ${t.contactInfo} contacto mensaje`,
    },
  ], [t]);

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
