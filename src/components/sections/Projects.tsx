import { useMemo, memo, useState } from 'react';
import Card from '../Card';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { GithubIcon } from '../BrandIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { getProjects } from '../../data/projects';
import ProjectDetail from './ProjectDetail';
import './Projects.css';

const Projects = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  
  // Los proyectos ahora se cargan desde src/data/projects.ts
  // Edita ese archivo para añadir, modificar o eliminar proyectos
  const projects = useMemo(() => getProjects(language), [language]);

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
              <button 
                className="learn-more-button"
                onClick={() => setSelectedProject(project.id)}
              >
                {t.learnMore}
                <ArrowRight size={18} />
              </button>
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

      {selectedProject !== null && (
        <ProjectDetail 
          project={projects.find(p => p.id === selectedProject)!}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
});

Projects.displayName = 'Projects';

export default Projects;
