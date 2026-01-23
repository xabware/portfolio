import { memo, useMemo } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Skills.css';

const Skills = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const skillCategories = useMemo(() => [
    {
      title: t.frontend,
      skills: [
        { name: 'React', level: 95 },
        { name: 'ASP', level: 90 },
        { name: 'CSS', level: 70 },
        { name: 'Angular.js', level: 90 },
      ],
    },
    {
      title: t.backend,
      skills: [
        { name: '.NET', level: 90 },
        { name: 'Python', level: 85 },
        { name: 'Java', level: 75 },
        { name: 'PHP', level: 80 },
      ],
    },
    {
      title: t.databases,
      skills: [
        { name: 'Microsoft SQL Server', level: 95 },
        { name: 'SQL', level: 95 },
        { name: 'Entity Framework', level: 90 },
        { name: 'T-SQL', level: 90 },
      ],
    },
    {
      title: t.devopsTools,
      skills: [
        { name: 'Git', level: 100 },
        { name: 'Docker', level: 70 },
        { name: 'Azure DevOps', level: 70 },
        { name: 'AWS', level: 60 },
        { name: 'CI/CD', level: 80 },
      ],
    },
  ], [t]);

  const additionalSkills = useMemo(() => [
    t.skillAgileScrum,
    t.skillRestApis,
    t.skillMicroservices,
    t.skillTesting,
    t.skillUIUX,
    t.skillResponsiveDesign,
    t.skillPerformanceOptimization,
    t.skillSecurityBestPractices,
    t.skillTeamLeadership,
    t.skillAutonomia,
  ], [t]);

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
            <span key={`skill-${idx}`} className="skill-tag">
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
