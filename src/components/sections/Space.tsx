import { memo, lazy, Suspense } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './Space.css';

// Lazy load del componente 3D para mejor rendimiento inicial
const PortfolioSolarSystem = lazy(() => import('./PortfolioSolarSystem'));

const Space = memo(() => {
  const { language } = useLanguage();

  return (
    <div className="space-fullscreen">
      <Suspense fallback={
        <div className="space-loading">
          <div className="space-loading-spinner" />
          <p>{language === 'es' ? 'Cargando sistema solar...' : 'Loading solar system...'}</p>
        </div>
      }>
        <PortfolioSolarSystem language={language} />
      </Suspense>
    </div>
  );
});

Space.displayName = 'Space';

export default Space;
