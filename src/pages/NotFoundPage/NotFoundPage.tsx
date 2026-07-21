import { FileQuestion, House } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../store/LocaleContext';
import './NotFoundPage.css';

export function NotFoundPage() {
  const { t } = useLocale();

  return (
    <div className="not-found-page animate-fade-in">
      <section className="glass-panel not-found-panel" aria-labelledby="not-found-title">
        <div className="not-found-ledger" aria-hidden="true">
          <span className="not-found-ledger-line" />
          <span className="not-found-code">404</span>
          <span className="not-found-ledger-line" />
        </div>

        <div className="not-found-icon" aria-hidden="true">
          <FileQuestion size={28} />
        </div>

        <p className="not-found-eyebrow">{t('notFound.eyebrow')}</p>
        <h1 id="not-found-title" className="not-found-title">{t('notFound.title')}</h1>
        <p className="not-found-description">{t('notFound.description')}</p>

        <Link to="/" replace className="btn btn-primary not-found-action">
          <House size={18} aria-hidden="true" />
          {t('notFound.backHome')}
        </Link>
      </section>
    </div>
  );
}
