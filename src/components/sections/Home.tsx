import { memo, useMemo } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Home.css';

const Home = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const stats = useMemo(() => [
    { number: '5+', label: t.yearsExperience },
    { number: '1', label: t.projectsCompleted },
  ], [t]);

  return (
    <div className="section-content home-no-scroll">
      <div className="hero-section">
        <h1 className="hero-title">{t.welcomeTitle}</h1>
        <p className="hero-subtitle">{t.welcomeSubtitle}</p>
        
        <div className="stats-inline">
          {stats.map((stat, index) => (
            <div key={`stat-${index}`} className="stat-item">
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
