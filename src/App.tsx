import { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Portfolio from './components/sections/Portfolio';
import { CMSLoader } from './components/CMSLoader';
import { useAnalytics } from './hooks/useAnalytics';
import { useLanguage } from './contexts/LanguageContext';
import { useTranslations } from './translations';
import './App.css';

// Lazy load non-critical sections
const Projects = lazy(() => import('./components/sections/Projects'));
const Space = lazy(() => import('./components/sections/Space'));
const Contact = lazy(() => import('./components/sections/Contact'));
const ContentAdmin = lazy(() => import('./components/admin/ContentAdmin'));

// Lazy load Chat AND WebLLMProvider together - solo se carga cuando se accede al chat
const Chat = lazy(() => import('./components/sections/Chat'));
const WebLLMProvider = lazy(() => import('./contexts/WebLLMContext').then(module => ({ default: module.WebLLMProvider })));

const appSections = new Set(['portfolio', 'projects', 'space', 'chat', 'contact', 'admin']);

function getInitialSection() {
  const hashSection = window.location.hash.replace('#', '');
  return appSections.has(hashSection) ? hashSection : 'portfolio';
}

function App() {
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [chatMounted, setChatMounted] = useState(getInitialSection() === 'chat');
  const { language } = useLanguage();
  const t = useTranslations(language);
  const { trackPageView, trackEvent } = useAnalytics();

  const handleSectionChange = useCallback((section: string) => {
    if (!appSections.has(section)) return;

    setActiveSection(section);
    const nextHash = section === 'portfolio' ? '' : `#${section}`;
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    window.history.replaceState(null, '', nextUrl);
    // Trackear cambio de sección
    trackPageView(section);
    // Montar el chat la primera vez que se accede
    if (section === 'chat' && !chatMounted) {
      setChatMounted(true);
      trackEvent('chat_first_open');
    }
    // Scroll al inicio cuando cambia de sección
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chatMounted, trackPageView, trackEvent]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextSection = getInitialSection();
      if (nextSection !== activeSection) {
        handleSectionChange(nextSection);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeSection, handleSectionChange]);

  const renderSection = () => {
    switch (activeSection) {
      case 'portfolio':
        return <Portfolio onNavigate={handleSectionChange} />;
      case 'projects':
        return <Projects onNavigate={handleSectionChange} />;
      case 'space':
        return <Space />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <ContentAdmin />;
      default:
        return <Portfolio onNavigate={handleSectionChange} />;
    }
  };

  return (
    <CMSLoader>
      <div className="app">
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        <div className="main-content">
          <Header onNavigate={handleSectionChange} />
          <main className={`content-area ${activeSection === 'chat' ? 'chat-active' : ''} ${activeSection === 'space' ? 'space-active' : ''}`}>
            {activeSection !== 'chat' && (
              <Suspense fallback={<div className="loading">{t.appLoading}</div>}>
                {renderSection()}
              </Suspense>
            )}
            {/* Chat con WebLLM cargado solo cuando se accede por primera vez */}
            {chatMounted && (
              <Suspense fallback={<div className="loading">{t.appChatLoading}</div>}>
                <WebLLMProvider>
                  <div style={{ display: activeSection === 'chat' ? 'block' : 'none' }}>
                    <Chat />
                  </div>
                </WebLLMProvider>
              </Suspense>
            )}
          </main>
        </div>
      </div>
    </CMSLoader>
  );
}

export default App;
