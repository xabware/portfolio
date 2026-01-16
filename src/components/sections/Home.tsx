import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Home.css';

const Home = () => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  return (
    <div className="section-content">
      <div className="hero-section">
        <h1 className="hero-title">{t.welcomeTitle}</h1>
        <p className="hero-subtitle">
          {t.welcomeSubtitle}
        </p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-number">5+</div>
          <div className="stat-label">{t.yearsExperience}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-number">50+</div>
          <div className="stat-label">{t.projectsCompleted}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-number">30+</div>
          <div className="stat-label">{t.satisfiedClients}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-number">10+</div>
          <div className="stat-label">{t.techMastered}</div>
        </Card>
      </div>

      <div className="info-grid">
        <Card title={t.aboutDashboard}>
          <p>
            {t.dashboardDescription}
          </p>
        </Card>
        <Card title={t.features}>
          <ul className="features-list">
            <li>{t.modernDesign}</li>
            <li>{t.darkModeSupport}</li>
            <li>{t.aiChatbot}</li>
            <li>{t.responsiveDesign}</li>
            <li>{t.viteOptimized}</li>
            <li>{t.elegantInterface}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Home;
