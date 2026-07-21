import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useLocale } from '../../store/LocaleContext';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  showBackButton?: boolean;
  forceShowBackButtonOnDesktop?: boolean;
  backFallback?: string;
}

export function PageHeader({ title, description, primaryButton, showBackButton, forceShowBackButtonOnDesktop, backFallback = '/' }: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useLocale();

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;

    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(backFallback, { replace: true });
  };

  return (
    <>
      {showBackButton && (
        <header className={`page-back-header ${forceShowBackButtonOnDesktop ? '' : 'hide-on-desktop'} mb-xl flex items-center`}>
          <button 
            onClick={handleBack}
            className={`btn ${forceShowBackButtonOnDesktop ? '' : 'hide-on-desktop'}`}
            style={{ background: 'transparent', padding: '0', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: 500 }}
          >
            <ChevronLeft size={24} /> {t('common.back')}
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
