import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  showBackButton?: boolean;
}

export function PageHeader({ title, description, primaryButton, showBackButton }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      {showBackButton && (
        <header className="hide-on-desktop mb-xl flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="btn hide-on-desktop"
            style={{ background: 'transparent', padding: '0', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: 500 }}
          >
            <ChevronLeft size={24} /> Voltar
          </button>
        </header>
      )}
      
      <header className="page-header" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{title}</h1>
          {description && <p className="text-secondary" style={{ marginTop: 'var(--spacing-xs)' }}>{description}</p>}
        </div>
        
        {primaryButton && (
          <button 
            className="btn btn-primary hover-glow hide-on-mobile" 
            onClick={primaryButton.onClick}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {primaryButton.icon} {primaryButton.label}
          </button>
        )}
      </header>
    </>
  );
}
