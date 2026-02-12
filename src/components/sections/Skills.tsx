import { memo, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { getSkillCategories, getAdditionalSkills, type Skill } from '../../data/skills';
import './Skills.css';

// Lazy load del componente 3D para mejor rendimiento inicial
const SkillsGalaxy = lazy(() => import('./SkillsGalaxy'));

const Skills = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [viewMode, setViewMode] = useState<'galaxy' | 'classic'>('galaxy');
  const [hoveredSkillInfo, setHoveredSkillInfo] = useState<{ skill: Skill; category: string } | null>(null);
  
  const skillCategories = useMemo(() => getSkillCategories(language), [language]);
  const additionalSkills = useMemo(() => getAdditionalSkills(language), [language]);

  const handleSkillSelect = useCallback((skill: Skill | null, category: string) => {
    if (skill) {
      setHoveredSkillInfo({ skill, category });
    } else {
      setHoveredSkillInfo(null);
    }
  }, []);

  // Textos para el modo de vista
  const viewModeTexts = {
    galaxy: language === 'es' ? '🌌 Galaxia 3D' : '🌌 3D Galaxy',
    classic: language === 'es' ? '📊 Vista Clásica' : '📊 Classic View',
    switchToClassic: language === 'es' ? 'Ver lista' : 'View list',
    switchToGalaxy: language === 'es' ? 'Ver galaxia' : 'View galaxy',
  };

  return (
    <div className="section-content skills-section">
      {/* Toggle de vista */}
      <div className="skills-view-toggle">
        <button 
          className={`view-toggle-btn ${viewMode === 'galaxy' ? 'active' : ''}`}
          onClick={() => setViewMode('galaxy')}
        >
          {viewModeTexts.galaxy}
        </button>
        <button 
          className={`view-toggle-btn ${viewMode === 'classic' ? 'active' : ''}`}
          onClick={() => setViewMode('classic')}
        >
          {viewModeTexts.classic}
        </button>
      </div>

      {viewMode === 'galaxy' ? (
        /* Vista de Galaxia 3D */
        <div className="skills-galaxy-wrapper">
          <Suspense fallback={
            <div className="galaxy-loading">
              <div className="galaxy-loading-spinner" />
              <p>{language === 'es' ? 'Cargando galaxia...' : 'Loading galaxy...'}</p>
            </div>
          }>
            <SkillsGalaxy 
              categories={skillCategories} 
              onSkillSelect={handleSkillSelect}
            />
          </Suspense>
          
          {/* Info del skill hover (fuera del canvas) */}
          {hoveredSkillInfo && (
            <div className="hovered-skill-tooltip">
              <strong>{hoveredSkillInfo.skill.name}</strong>
              <span className="tooltip-category">{hoveredSkillInfo.category}</span>
            </div>
          )}
        </div>
      ) : (
        /* Vista Clásica */
        <>
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
        </>
      )}
    </div>
  );
});

Skills.displayName = 'Skills';

export default Skills;
