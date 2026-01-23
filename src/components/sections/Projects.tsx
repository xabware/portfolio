import { useMemo, memo } from 'react';
import Card from '../Card';
import { ExternalLink } from 'lucide-react';
import { GithubIcon } from '../BrandIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Projects.css';

const Projects = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const projects = useMemo(() => [
    {
      id: 1,
      title: t.ecommercePlatform,
      description: t.ecommerceDescription,
      tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      github: 'https://github.com',
      demo: 'https://demo.com',
    },
    {
      id: 2,
      title: t.taskManagementApp,
      description: t.taskManagementDescription,
      tech: ['React', 'Firebase', 'Material-UI'],
      github: 'https://github.com',
      demo: 'https://demo.com',
    },
    {
      id: 3,
      title: t.aiChatbotSystem,
      description: t.aiChatbotDescription,
      tech: ['Python', 'FastAPI', 'OpenAI', 'Pinecone'],
      github: 'https://github.com',
      demo: 'https://demo.com',
    },
    {
      id: 4,
      title: t.analyticsDashboard,
      description: t.analyticsDashboardDescription,
      tech: ['React', 'D3.js', 'Express', 'PostgreSQL'],
      github: 'https://github.com',
      demo: 'https://demo.com',
    },
  ], [t]);

  return (
    <div className="section-content">
      <div className="projects-header">
        <p className="section-subtitle">{t.projectsSubtitle}</p>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <Card key={project.id} className="project-card">
            <h2 className="project-title">{project.title}</h2>
            <p className="project-description">{project.description}</p>
            <div className="project-tech">
              {project.tech.map((tech, index) => (
                <span key={index} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
            <div className="project-links">
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <GithubIcon size={18} />
                {t.code}
              </a>
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={18} />
                {t.demo}
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});

Projects.displayName = 'Projects';

export default Projects;
