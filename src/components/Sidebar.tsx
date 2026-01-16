import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Home, User, MessageSquare, Briefcase, Code, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import './Sidebar.css';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = memo(({ activeSection, onSectionChange }: SidebarProps) => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [isCollapsed]);
  
  const menuItems = useMemo(() => [
    { id: 'home', label: t.home, icon: Home },
    { id: 'about', label: t.about, icon: User },
    { id: 'projects', label: t.projects, icon: Briefcase },
    { id: 'skills', label: t.skills, icon: Code },
    { id: 'chat', label: t.chatbot, icon: MessageSquare },
    { id: 'contact', label: t.contact, icon: Mail },
  ], [t]);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{t.portfolio}</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <button 
        className="sidebar-toggle" 
        onClick={handleToggleCollapse}
        aria-label={isCollapsed ? t.sidebarExpandLabel : t.sidebarCollapseLabel}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
