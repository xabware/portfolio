import { memo } from 'react';
import { X, ExternalLink, Calendar, Users } from 'lucide-react';
import { GithubIcon } from '../BrandIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './ProjectDetail.css';

interface ProjectDetailProps {
  project: {
    id: number;
    title: string;
    description: string;
    tech: string[];
    github: string;
    demo: string;
    detailedContent: {
      overview: readonly string[];
      challenge: readonly string[];
      solution: readonly string[];
      features: readonly string[];
      techDetails: string;
      results: string;
      date?: string;
      team?: string;
      images?: string[];
    };
  };
  onClose: () => void;
}

const ProjectDetail = memo(({ project, onClose }: ProjectDetailProps) => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const overviewParagraphs = project.detailedContent.overview.filter(paragraph => paragraph.trim().length > 0);
  const challengeParagraphs = project.detailedContent.challenge.filter(paragraph => paragraph.trim().length > 0);
  const solutionParagraphs = project.detailedContent.solution.filter(paragraph => paragraph.trim().length > 0);
  const featureItems = project.detailedContent.features.filter(feature => feature.trim().length > 0);
  const hasTechDetails = project.detailedContent.techDetails.trim().length > 0;
  const hasResults = project.detailedContent.results.trim().length > 0;

  return (
    <div className="project-detail-overlay" onClick={onClose}>
      <div className="project-detail-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label={t.close}>
          <X size={24} />
        </button>

        <div className="project-detail-content">
          <header className="project-detail-header">
            <h1 className="project-detail-title">{project.title}</h1>
            <p className="project-detail-subtitle">{project.description}</p>
            
            <div className="project-meta">
              {project.detailedContent.date && (
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{project.detailedContent.date}</span>
                </div>
              )}
              {project.detailedContent.team && (
                <div className="meta-item">
                  <Users size={16} />
                  <span>{project.detailedContent.team}</span>
                </div>
              )}
            </div>

            <div className="project-tech-stack">
              {project.tech.map((tech, index) => (
                <span key={index} className="tech-badge">
                  {tech}
                </span>
              ))}
            </div>

            <div className="project-actions">
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="action-button">
                <GithubIcon size={20} />
                {t.viewCode}
              </a>
              <a href={project.demo} target="_blank" rel="noopener noreferrer" className="action-button primary">
                <ExternalLink size={20} />
                {t.viewDemo}
              </a>
            </div>
          </header>

          <article className="project-detail-article">
            {overviewParagraphs.length > 0 && (
              <section className="article-section">
                <h2>{t.projectOverview}</h2>
                {overviewParagraphs.map((paragraph, index) => (
                  <p key={`overview-${index}`}>{paragraph}</p>
                ))}
              </section>
            )}

            {challengeParagraphs.length > 0 && (
              <section className="article-section">
                <h2>{t.projectChallenge}</h2>
                {challengeParagraphs.map((paragraph, index) => (
                  <p key={`challenge-${index}`}>{paragraph}</p>
                ))}
              </section>
            )}

            {solutionParagraphs.length > 0 && (
              <section className="article-section">
                <h2>{t.projectSolution}</h2>
                {solutionParagraphs.map((paragraph, index) => (
                  <p key={`solution-${index}`}>{paragraph}</p>
                ))}
              </section>
            )}

            {featureItems.length > 0 && (
              <section className="article-section">
                <h2>{t.keyFeatures}</h2>
                <ul className="features-list">
                  {featureItems.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </section>
            )}

            {hasTechDetails && (
              <section className="article-section">
                <h2>{t.technicalDetails}</h2>
                <p>{project.detailedContent.techDetails}</p>
              </section>
            )}

            {hasResults && (
              <section className="article-section">
                <h2>{t.resultsImpact}</h2>
                <p>{project.detailedContent.results}</p>
              </section>
            )}
          </article>
        </div>
      </div>
    </div>
  );
});

ProjectDetail.displayName = 'ProjectDetail';

export default ProjectDetail;
