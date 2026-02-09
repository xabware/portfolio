import { useState, lazy, Suspense, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './components/sections/Home';
import './App.css';

// Lazy load non-critical sections
const About = lazy(() => import('./components/sections/About'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Contact = lazy(() => import('./components/sections/Contact'));

// Lazy load Chat AND WebLLMProvider together - solo se carga cuando se accede al chat
const Chat = lazy(() => import('./components/sections/Chat'));
const WebLLMProvider = lazy(() => import('./contexts/WebLLMContext').then(module => ({ default: module.WebLLMProvider })));

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [chatMounted, setChatMounted] = useState(false);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    // Montar el chat la primera vez que se accede
    if (section === 'chat' && !chatMounted) {
      setChatMounted(true);
    }
    // Scroll al inicio cuando cambia de sección
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chatMounted]);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home onNavigate={handleSectionChange} />;
      case 'about':
        return <About />;
      case 'projects':
        return <Projects />;
      case 'skills':
        return <Skills />;
      case 'contact':
        return <Contact />;
      default:
        return <Home onNavigate={handleSectionChange} />;
    }
  };

  return (
    <div className="app">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <div className="main-content">
        <Header onNavigate={handleSectionChange} />
        <main className={`content-area ${activeSection === 'chat' ? 'chat-active' : ''}`}>
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
