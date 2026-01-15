import { Home, User, MessageSquare, Briefcase, Code, Mail } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'about', label: 'Sobre mí', icon: User },
    { id: 'projects', label: 'Proyectos', icon: Briefcase },
    { id: 'skills', label: 'Habilidades', icon: Code },
    { id: 'chat', label: 'Chatbot', icon: MessageSquare },
    { id: 'contact', label: 'Contacto', icon: Mail },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Portfolio</h2>
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
