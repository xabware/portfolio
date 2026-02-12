import { memo, useMemo } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { getPersonalInfo, getExperiences, getEducation } from '../../data/about';
import { getSkillCategories, getAdditionalSkills } from '../../data/skills';
import './About.css';

const About = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  // La información personal ahora se carga desde src/data/about.ts
  // Edita ese archivo para añadir, modificar o eliminar información
  const personalDescription = useMemo(() => getPersonalInfo(language), [language]);
  const experiences = useMemo(() => getExperiences(language), [language]);
  const educationItems = useMemo(() => getEducation(language), [language]);
  
  // Habilidades desde src/data/skills.ts
  const skillCategories = useMemo(() => getSkillCategories(language), [language]);
  const additionalSkills = useMemo(() => getAdditionalSkills(language), [language]);
  
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

      {/* Sección de habilidades técnicas - al final */}
      <div className="skills-section-about">
        <h2 className="section-title">{t.technicalSkills}</h2>
        <p className="section-subtitle">{t.skillsSubtitle}</p>
        
        <div className="skills-grid">
          {skillCategories.map((category, idx) => (
            <Card key={idx} title={category.title} className="skills-card">
              <div className="skills-list">
                {category.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-info">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div
                        className="skill-progress"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card title={t.otherCompetencies} className="additional-skills">
          <div className="tags-container">
            {additionalSkills.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

About.displayName = 'About';

export default About;
