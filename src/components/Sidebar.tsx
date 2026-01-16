import { Home, User, MessageSquare, Briefcase, Code, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import './Sidebar.css';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  const menuItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'about', label: t.about, icon: User },
    { id: 'projects', label: t.projects, icon: Briefcase },
    { id: 'skills', label: t.skills, icon: Code },
    { id: 'chat', label: t.chatbot, icon: MessageSquare },
    { id: 'contact', label: t.contact, icon: Mail },
  ];

  return (
    <aside className="sidebar">
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
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
