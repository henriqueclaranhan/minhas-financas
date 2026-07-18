import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import './ThemeToggle.css';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('@financas:theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('@financas:theme', theme);
  }, [theme]);

  const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const isDark = theme === 'dark';

  return (
    <button 
      onClick={toggle} 
      className={`theme-toggle-btn ${isDark ? 'theme-toggle-btn-dark' : 'theme-toggle-btn-light'}`}
      title={`Mudar para modo ${isDark ? 'claro' : 'escuro'}`}
      aria-pressed={isDark}
    >
      <div className={`theme-toggle-icons ${isDark ? 'theme-toggle-icons-dark' : 'theme-toggle-icons-light'}`}>
        <Moon size={14} opacity={isDark ? 1 : 0.4} />
        <Sun size={14} opacity={isDark ? 0.4 : 1} />
      </div>
      
      <div 
        className={`theme-toggle-thumb ${isDark ? 'theme-toggle-thumb-dark' : 'theme-toggle-thumb-light'}`}
      />
    </button>
  );
}
