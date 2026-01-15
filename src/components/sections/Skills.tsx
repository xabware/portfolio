import Card from '../Card';
import './Skills.css';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Frontend',
      skills: [
        { name: 'React', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'CSS/Sass', level: 85 },
        { name: 'Vue.js', level: 75 },
      ],
    },
    {
      title: 'Backend',
      skills: [
        { name: 'Node.js', level: 90 },
        { name: 'Python', level: 85 },
        { name: 'Express', level: 88 },
        { name: 'FastAPI', level: 80 },
      ],
    },
    {
      title: 'Bases de Datos',
      skills: [
        { name: 'MongoDB', level: 85 },
        { name: 'PostgreSQL', level: 82 },
        { name: 'Redis', level: 75 },
        { name: 'Pinecone', level: 70 },
      ],
    },
    {
      title: 'DevOps & Tools',
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
        <h2>Habilidades Técnicas</h2>
        <p>Tecnologías y herramientas que domino</p>
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

      <Card title="Otras Competencias" className="additional-skills">
        <div className="tags-container">
          {[
            'Agile/Scrum',
            'REST APIs',
            'GraphQL',
            'Microservicios',
            'Testing (Jest, Pytest)',
            'UI/UX Design',
            'Responsive Design',
            'Performance Optimization',
            'Security Best Practices',
            'Team Leadership',
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
