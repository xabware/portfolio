import { memo, useMemo } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { getPersonalInfo, getExperiences, getEducation } from '../../data/about';
import './About.css';

const About = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  // La información personal ahora se carga desde src/data/about.ts
  // Edita ese archivo para añadir, modificar o eliminar información
  const personalDescription = useMemo(() => getPersonalInfo(language), [language]);
  const experiences = useMemo(() => getExperiences(language), [language]);
  const educationItems = useMemo(() => getEducation(language), [language]);
  
  return (
    <div className="section-content">
      <Card title={t.aboutMe}>
        {personalDescription.map((paragraph, index) => (
          <p key={index}>
            {paragraph}
          </p>
        ))}
      </Card>

      <div className="experience-section">
        <Card title={t.professionalExperience}>
          <div className="timeline">
            {experiences.map((exp, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3>{exp.title}</h3>
                  <p className="timeline-company">{exp.company}</p>
                  {exp.period && <p className="timeline-period">{exp.period}</p>}
                  <p>
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title={t.education}>
        <div className="timeline">
          {educationItems.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>{item.degree}</h3>
                <p className="timeline-company">{item.institution}</p>
                {item.period && <p className="timeline-period">{item.period}</p>}
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
