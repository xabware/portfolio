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
                <h4>{t.seniorFullStack}</h4>
                <p className="timeline-company">{t.techCompany}</p>
                <p>
                  {t.seniorDescription}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>{t.fullStackDeveloper}</h4>
                <p className="timeline-company">{t.startupTech}</p>
                <p>
                  {t.fullStackDescription}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>{t.juniorDeveloper}</h4>
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
        <div className="education-item">
          <h4>{t.degree}</h4>
          <p className="education-institution">{t.university}</p>
          <p>{t.degreeDescription}</p>
        </div>
      </Card>
    </div>
  );
});

About.displayName = 'About';

export default About;
