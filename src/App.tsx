import { useState, lazy, Suspense, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Portfolio from './components/sections/Portfolio';
import { useAnalytics } from './hooks/useAnalytics';
import './App.css';

// Lazy load non-critical sections
const Projects = lazy(() => import('./components/sections/Projects'));
const Space = lazy(() => import('./components/sections/Space'));
const Contact = lazy(() => import('./components/sections/Contact'));

// Lazy load Chat AND WebLLMProvider together - solo se carga cuando se accede al chat
const Chat = lazy(() => import('./components/sections/Chat'));
const WebLLMProvider = lazy(() => import('./contexts/WebLLMContext').then(module => ({ default: module.WebLLMProvider })));

function App() {
  const [activeSection, setActiveSection] = useState('portfolio');
  const [chatMounted, setChatMounted] = useState(false);
  const { trackPageView, trackEvent } = useAnalytics();

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
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
      default:
        return <Portfolio onNavigate={handleSectionChange} />;
    }
  };

  return (
    <div className="app">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <div className="main-content">
        <Header onNavigate={handleSectionChange} />
        <main className={`content-area ${activeSection === 'chat' ? 'chat-active' : ''} ${activeSection === 'space' ? 'space-active' : ''}`}>
          {activeSection !== 'chat' && (
            <Suspense fallback={<div className="loading">Cargando...</div>}>
              {renderSection()}
            </Suspense>
          )}
          {/* Chat con WebLLM cargado solo cuando se accede por primera vez */}
          {chatMounted && (
            <Suspense fallback={<div className="loading">Cargando chat y modelo de IA...</div>}>
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
  );
}

export default App;
