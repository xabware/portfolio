import { memo, useMemo } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { getSkillCategories, getAdditionalSkills } from '../../data/skills';
import './Skills.css';

const Skills = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  // Las habilidades ahora se cargan desde src/data/skills.ts
  // Edita ese archivo para añadir, modificar o eliminar habilidades
  const skillCategories = useMemo(() => getSkillCategories(language), [language]);
  const additionalSkills = useMemo(() => getAdditionalSkills(language), [language]);

  return (
    <div className="section-content">
      <div className="skills-header">
        <p className="section-subtitle">{t.skillsSubtitle}</p>
      </div>

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
  );
});

Skills.displayName = 'Skills';

export default Skills;
