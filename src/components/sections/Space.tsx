import { memo, lazy, Suspense } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Space.css';

// Lazy load del componente 3D para mejor rendimiento inicial
const PortfolioSolarSystem = lazy(() => import('./PortfolioSolarSystem.tsx'));

const Space = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);

  return (
    <div className="space-fullscreen">
      <Suspense fallback={
        <div className="space-loading">
          <div className="space-loading-spinner" />
          <p>{t.spaceLoading}</p>
        </div>
      }>
        <PortfolioSolarSystem language={language} />
      </Suspense>
    </div>
  );
});

Space.displayName = 'Space';

export default Space;
