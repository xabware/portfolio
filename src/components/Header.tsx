import { memo, useCallback } from 'react';
import { Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import SearchBar from './SearchBar';
import './Header.css';

interface HeaderProps {
  onNavigate?: (section: string) => void;
}

const Header = memo(({ onNavigate }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  const handleNavigate = useCallback((section: string) => {
    onNavigate?.(section);
  }, [onNavigate]);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-search">
          <SearchBar onNavigate={handleNavigate} />
        </div>
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
});

Header.displayName = 'Header';

export default Header;
