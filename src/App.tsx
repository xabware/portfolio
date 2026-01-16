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

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

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
      case 'chat':
        return <Chat />;
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
        <main className="content-area">
          <Suspense fallback={<div className="loading">Cargando...</div>}>
            {renderSection()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
