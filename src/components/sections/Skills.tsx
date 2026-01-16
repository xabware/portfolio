import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Skills.css';

const Skills = () => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const skillCategories = [
    {
      title: t.frontend,
      skills: [
        { name: 'React', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'CSS/Sass', level: 85 },
        { name: 'Vue.js', level: 75 },
      ],
    },
    {
      title: t.backend,
      skills: [
        { name: 'Node.js', level: 90 },
        { name: 'Python', level: 85 },
        { name: 'Express', level: 88 },
        { name: 'FastAPI', level: 80 },
      ],
    },
    {
      title: t.databases,
      skills: [
        { name: 'MongoDB', level: 85 },
        { name: 'PostgreSQL', level: 82 },
        { name: 'Redis', level: 75 },
        { name: 'Pinecone', level: 70 },
      ],
    },
    {
      title: t.devopsTools,
      skills: [
        { name: 'Git', level: 92 },
        { name: 'Docker', level: 80 },
        { name: 'AWS', level: 75 },
        { name: 'CI/CD', level: 78 },
      ],
    },
  ];

  return (
    <div className="section-content">
      <div className="skills-header">
        <h2>{t.technicalSkills}</h2>
        <p>{t.skillsSubtitle}</p>
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
          {[
            t.skillAgileScrum,
            t.skillRestApis,
            t.skillGraphQL,
            t.skillMicroservices,
            t.skillTesting,
            t.skillUIUX,
            t.skillResponsiveDesign,
            t.skillPerformanceOptimization,
            t.skillSecurityBestPractices,
            t.skillTeamLeadership,
          ].map((skill, idx) => (
            <span key={idx} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Skills;
