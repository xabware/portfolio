import { Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../translations';
import './Header.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslations(language);

  return (
    <header className="header">
      <div className="header-content">
        <h1>{t.dashboardPortfolio}</h1>
        <div className="header-actions">
          <button className="language-toggle" onClick={toggleLanguage} aria-label="Toggle language">
            <Languages size={20} />
            <span>{language.toUpperCase()}</span>
          </button>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
