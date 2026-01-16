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
    { number: '50+', label: t.projectsCompleted },
    { number: '30+', label: t.satisfiedClients },
    { number: '10+', label: t.techMastered },
  ], [t]);

  const features = useMemo(() => [
    t.modernDesign,
    t.darkModeSupport,
    t.aiChatbot,
    t.responsiveDesign,
    t.viteOptimized,
    t.elegantInterface,
  ], [t]);
  
  return (
    <div className="section-content">
      <div className="hero-section">
        <h1 className="hero-title">{t.welcomeTitle}</h1>
        <p className="hero-subtitle">
          {t.welcomeSubtitle}
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={`stat-${index}`} className="stat-card">
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="info-grid">
        <Card title={t.aboutDashboard}>
          <p>
            {t.dashboardDescription}
          </p>
        </Card>
        <Card title={t.features}>
          <ul className="features-list">
            {features.map((feature, index) => (
              <li key={`feature-${index}`}>{feature}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
