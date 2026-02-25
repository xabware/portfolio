import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { projects } from '../../data/projects';
import { getPersonalInfo, getExperiences, getEducation, getTotalExperienceMs } from '../../data/about';
import { getSkillCategories, getAdditionalSkills } from '../../data/skills';
import './Portfolio.css';

interface PortfolioProps {
  onNavigate?: (section: string) => void;
}

const Portfolio = memo(({ onNavigate }: PortfolioProps) => {
  const { language } = useLanguage();
  const t = useTranslations(language);

  const calcElapsed = useCallback(() => {
    const totalMs = getTotalExperienceMs();
    
    const totalSeconds = Math.floor(totalMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);
    const years = Math.floor(totalDays / 365.25);
    const remainingDays = Math.floor(totalDays - years * 365.25);
    const months = Math.floor(remainingDays / 30.44);
    const days = Math.floor(remainingDays - months * 30.44);

    return { years, months, days, hours, minutes, seconds };
  }, []);

  const [elapsed, setElapsed] = useState(calcElapsed);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(calcElapsed());
    }, 1000);
    return () => clearInterval(timer);
  }, [calcElapsed]);

  const pad = (n: number) => String(n).padStart(2, '0');

  const personalDescription = useMemo(() => getPersonalInfo(language), [language]);
  const experiences = useMemo(() => getExperiences(language), [language]);
  const educationItems = useMemo(() => getEducation(language), [language]);
  const skillCategories = useMemo(() => getSkillCategories(language), [language]);
  const additionalSkills = useMemo(() => getAdditionalSkills(language), [language]);

  return (
    <div className="section-content">
      {/* Hero section */}
      <div className="hero-section">
        <h1 className="hero-title">
          <button className="hero-title-button" onClick={() => onNavigate?.('contact')} type="button">
            {t.welcomeTitle}
          </button>
        </h1>
        <p className="hero-subtitle">{t.welcomeSubtitle}</p>

        <div className="counters-row">
          <div className="experience-counter" onClick={() => document.getElementById('experience-section')?.scrollIntoView({ behavior: 'smooth' })} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('experience-section')?.scrollIntoView({ behavior: 'smooth' }); } }}>
            <div className="counter-label">{t.experienceCounter}</div>
            <div className="counter-hero">
              <span className="counter-years-value">{elapsed.years}</span>
              <span className="counter-years-label">{t.counterYears}</span>
            </div>
            <div className="counter-sub">
              <span className="counter-mid-value">{elapsed.months}</span>
              <span className="counter-mid-label">{t.counterMonths}</span>
              <span className="counter-dot">&middot;</span>
              <span className="counter-mid-value">{elapsed.days}</span>
              <span className="counter-mid-label">{t.counterDays}</span>
            </div>
            <div className="counter-clock">
              <span className="counter-clock-value">{pad(elapsed.hours)}</span>
              <span className="counter-clock-sep">:</span>
              <span className="counter-clock-value">{pad(elapsed.minutes)}</span>
              <span className="counter-clock-sep">:</span>
              <span className="counter-clock-value counter-seconds">{pad(elapsed.seconds)}</span>
            </div>
          </div>

          <div
            className="projects-counter"
            onClick={() => onNavigate?.('projects')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate?.('projects');
              }
            }}
          >
            <div className="counter-label">{t.projectsCompleted}</div>
            <div className="projects-number">{projects.length}</div>
          </div>
        </div>
      </div>

      {/* About me */}
      <Card title={t.aboutMe}>
        {personalDescription.map((paragraph, index) => (
          <p key={index}>
            {paragraph}
          </p>
        ))}
      </Card>

      {/* Experience */}
      <div id="experience-section" className="experience-section">
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

      {/* Education */}
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

      {/* Skills */}
      <div className="skills-section-about">
        <h2 className="section-title">{t.technicalSkills}</h2>
        <p className="section-subtitle">{t.skillsSubtitle}</p>

        <div className="skills-unified">
          {skillCategories.map((category, idx) => (
            <div key={idx} className="skills-category">
              <h3 className="skills-category-title">{category.title}</h3>
              <div className="skills-list">
                {category.skills.map((skill, index) => (
                  <details key={index} className="skill-item">
                    <summary className="skill-summary">
                      <span className="skill-name">{skill.name}</span>
                    </summary>
                    <p className="skill-description">{skill.description}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="additional-skills-section">
          <h3 className="skills-category-title">{t.otherCompetencies}</h3>
          <div className="tags-container">
            {additionalSkills.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

Portfolio.displayName = 'Portfolio';

export default Portfolio;
