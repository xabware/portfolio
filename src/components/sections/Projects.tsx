import { useMemo, memo, useState } from 'react';
import Card from '../Card';
import { ExternalLink, ArrowRight, Play, Star } from 'lucide-react';
import { GithubIcon } from '../BrandIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { getProjects } from '../../data/projects';
import type { ResolvedProject } from '../../data/projects';
import ProjectDetail from './ProjectDetail';
import './Projects.css';

interface ProjectsProps {
  onNavigate?: (section: string) => void;
}

const ProjectCard = memo(({ project, onSelect, onNavigate, t, featured }: {
  project: ResolvedProject;
  onSelect: (id: number) => void;
  onNavigate?: (section: string) => void;
  t: ReturnType<typeof useTranslations>;
  featured?: boolean;
}) => (
  <Card className={`project-card ${featured ? 'project-card-featured' : 'project-card-secondary'}`}>
    {featured && (
      <div className="featured-badge">
        <Star size={14} />
        {t.featuredProject}
      </div>
    )}
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
        onClick={() => onSelect(project.id)}
      >
        {t.learnMore}
        <ArrowRight size={18} />
      </button>
      <a href={project.github} target="_blank" rel="noopener noreferrer">
        <GithubIcon size={18} />
        {t.code}
      </a>
      {project.demo.startsWith('#') ? (
        <button
          className="demo-internal-button"
          onClick={() => onNavigate?.(project.demo.slice(1))}
        >
          <Play size={18} />
          {t.tryIt}
        </button>
      ) : (
        <a href={project.demo} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={18} />
          {t.demo}
        </a>
      )}
    </div>
  </Card>
));

ProjectCard.displayName = 'ProjectCard';

const Projects = memo(({ onNavigate }: ProjectsProps) => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  
  // Los proyectos ahora se cargan desde src/data/projects.ts
  // Edita ese archivo para añadir, modificar o eliminar proyectos
  const projects = useMemo(() => getProjects(language), [language]);
  const featuredProjects = useMemo(() => projects.filter(p => p.featured), [projects]);
  const secondaryProjects = useMemo(() => projects.filter(p => !p.featured), [projects]);

  return (
    <div className="section-content">
      <div className="projects-header">
        <p className="section-subtitle">{t.projectsSubtitle}</p>
      </div>

      {featuredProjects.length > 0 && (
        <div className="projects-section">
          <h3 className="projects-section-title">
            <Star size={20} />
            {t.featuredProjects}
          </h3>
          <div className="projects-grid projects-grid-featured">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={setSelectedProject}
                onNavigate={onNavigate}
                t={t}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {secondaryProjects.length > 0 && (
        <div className="projects-section">
          <h3 className="projects-section-title">{t.otherProjects}</h3>
          <div className="projects-grid projects-grid-secondary">
            {secondaryProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={setSelectedProject}
                onNavigate={onNavigate}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

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
