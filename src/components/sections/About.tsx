import { memo } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './About.css';

const About = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  return (
    <div className="section-content">
      <Card title={t.aboutMe}>
        <p>
          {t.aboutDescription1}
        </p>
        <p>
          {t.aboutDescription2}
        </p>
      </Card>

      <div className="experience-section">
        <Card title={t.professionalExperience}>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>{t.seniorFullStack}</h3>
                <p className="timeline-company">{t.techCompany}</p>
                <p>
                  {t.seniorDescription}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>{t.fullStackDeveloper}</h3>
                <p className="timeline-company">{t.startupTech}</p>
                <p>
                  {t.fullStackDescription}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>{t.juniorDeveloper}</h3>
                <p className="timeline-company">{t.softwareAgency}</p>
                <p>
                  {t.juniorDescription}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title={t.education}>
        <div className="timeline">
          {t.educationItems.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>{item.degree}</h3>
                <p className="timeline-company">{item.institution}</p>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});

About.displayName = 'About';

export default About;
