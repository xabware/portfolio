import { useState, lazy, Suspense, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './components/sections/Home';
import './App.css';

// Lazy load non-critical sections
const About = lazy(() => import('./components/sections/About'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Chat = lazy(() => import('./components/sections/Chat'));
const Contact = lazy(() => import('./components/sections/Contact'));

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [chatMounted, setChatMounted] = useState(false);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    // Montar el chat la primera vez que se accede
    if (section === 'chat' && !chatMounted) {
      setChatMounted(true);
    }
  }, [chatMounted]);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home />;
      case 'about':
        return <About />;
      case 'projects':
        return <Projects />;
      case 'skills':
        return <Skills />;
      case 'contact':
        return <Contact />;
      default:
        return <Home />;
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
          {/* Chat permanece montado pero oculto para mantener la conversación */}
          {chatMounted && activeSection === 'chat' && (
            <Suspense fallback={<div className="loading">Cargando chat...</div>}>
              <Chat />
            </Suspense>
          )}
          {/* Mantener chat en memoria pero sin renderizar cuando no está activo */}
          {chatMounted && activeSection !== 'chat' && (
            <div style={{ display: 'none' }}>
              <Suspense fallback={null}>
                <Chat />
              </Suspense>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
