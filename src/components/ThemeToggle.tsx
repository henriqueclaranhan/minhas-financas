import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

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
      style={{ 
        position: 'relative',
        width: '56px',
        height: '30px',
        borderRadius: '15px',
        background: isDark ? 'var(--clr-primary)' : 'var(--clr-surface-alt)',
        border: '1px solid var(--clr-border)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        transition: 'background 0.3s ease'
      }}
      title={`Mudar para modo ${isDark ? 'claro' : 'escuro'}`}
      aria-pressed={isDark}
    >
      <div style={{ position: 'absolute', width: '100%', left: 0, display: 'flex', justifyContent: 'space-between', padding: '0 6px', pointerEvents: 'none', color: isDark ? '#fff' : 'var(--clr-text-secondary)' }}>
        <Moon size={14} opacity={isDark ? 1 : 0.4} />
        <Sun size={14} opacity={isDark ? 0.4 : 1} />
      </div>
      
      <div 
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transform: `translateX(${isDark ? '26px' : '0px'})`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        {isDark ? <Moon size={14} color="var(--clr-primary)" /> : <Sun size={14} color="#f59e0b" />}
      </div>
    </button>
  );
}
