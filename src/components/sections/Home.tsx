import { Download } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { getProjectCount } from '../../data/projects';
import { generateCVPdf } from '../../services/cvPdfService';
import './Home.css';

interface HomeProps {
  onNavigate?: (section: string) => void;
}

const Home = memo(({ onNavigate }: HomeProps) => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [isGeneratingCv, setIsGeneratingCv] = useState(false);
  
  const stats = useMemo(() => [
    { number: '5+', label: t.yearsExperience, clickable: false },
    { number: `${getProjectCount()}`, label: t.projectsCompleted, clickable: true, navigateTo: 'projects' },
  ], [t]);

  const handleDownloadCv = useCallback(() => {
    if (isGeneratingCv) {
      return;
    }

    setIsGeneratingCv(true);
    try {
      generateCVPdf(language);
    } catch (error) {
      console.error('Error generating CV PDF:', error);
    } finally {
      setIsGeneratingCv(false);
    }
  }, [isGeneratingCv, language]);

  return (
    <div className="section-content home-no-scroll">
      <div className="hero-section">
        <h1 className="hero-title">{t.welcomeTitle}</h1>
        <p className="hero-subtitle">{t.welcomeSubtitle}</p>

        <div className="hero-actions">
          <button
            type="button"
            className="download-cv-button"
            onClick={handleDownloadCv}
            disabled={isGeneratingCv}
          >
            <Download size={18} aria-hidden="true" />
            <span>{isGeneratingCv ? t.generatingCv : t.downloadCv}</span>
          </button>
        </div>
        
        <div className="stats-inline">
          {stats.map((stat, index) => (
            <div 
              key={`stat-${index}`} 
              className={`stat-item ${stat.clickable ? 'stat-item-clickable' : ''}`}
              onClick={() => stat.clickable && stat.navigateTo && onNavigate?.(stat.navigateTo)}
              role={stat.clickable ? 'button' : undefined}
              tabIndex={stat.clickable ? 0 : undefined}
              onKeyDown={(e) => {
                if (stat.clickable && stat.navigateTo && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onNavigate?.(stat.navigateTo);
                }
              }}
            >
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="description-section">
        <Card className="description-card">
          <h3 className="description-title">{t.aboutDashboard}</h3>
          <p className="description-text">{t.dashboardDescription}</p>
        </Card>
      </div>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
