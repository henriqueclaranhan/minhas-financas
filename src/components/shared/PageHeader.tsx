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
      
      <header className="page-header-main">
        <h1>{title}</h1>
        
        {primaryButton && (
          <button 
            className="btn btn-primary hover-glow hide-on-mobile page-header-primary-action"
            onClick={primaryButton.onClick}
          >
            {primaryButton.icon} {primaryButton.label}
          </button>
        )}
      </header>
      {description && <p className="text-secondary page-header-description">{description}</p>}
      <div className="page-header-spacing" aria-hidden="true" />
    </>
  );
}
