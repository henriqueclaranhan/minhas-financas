import { PieChart, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthViewModel } from './hooks/useAuthViewModel';
import { useLocale } from '../../store/LocaleContext';
import './AuthPage.css';

export function AuthPage() {
  const { state, actions } = useAuthViewModel();
  const { t } = useLocale();

  return (
    <div className="auth-container animate-fade-in">
      {/* Left Panel - Hero for Desktop */}
      <div className="auth-hero">
        <div className="auth-hero-background">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
        <div className="auth-hero-content">
          <div className="auth-logo">
            <PieChart size={32} />
            <span>{t('app.name')}</span>
          </div>
          <h1 className="auth-headline">{t('auth.headline')}</h1>
          <p className="auth-subheadline">{t('auth.subheadline')}</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-form-wrapper">
        <div className="auth-form-container">
          
          {/* Logo for mobile only */}
          <div className="mobile-only-logo">
            <PieChart size={32} />
            <span>{t('app.name')}</span>
          </div>

          <h2 className="auth-form-title">
            {state.isReset ? t('auth.resetPassword') : state.isLogin ? t('auth.welcomeBack') : t('auth.createAccountTitle')}
          </h2>
          <p className="auth-form-subtitle">
            {state.isReset ? t('auth.resetSubtitle') : state.isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </p>

          {state.error && (
            <div className="auth-alert-error">
              <AlertCircle size={20} className="auth-alert-icon" /> 
              <div>{state.error}</div>
            </div>
          )}

          {state.message && (
            <div className="auth-alert-success">
              <CheckCircle2 size={20} className="auth-alert-icon" />
              <div>{state.message}</div>
            </div>
          )}

          <form onSubmit={actions.handleSubmit}>
            {!state.isLogin && !state.isReset && (
              <div className="auth-input-wrapper">
                <input 
                  type="text" 
                  className="auth-input" 
                  placeholder={t('auth.namePlaceholder')}
                  value={state.name} 
                  onChange={e => actions.setName(e.target.value)}
                  required 
                />
                <User className="auth-input-icon" size={20} />
              </div>
            )}

            <div className="auth-input-wrapper">
              <input 
                type="email" 
                className="auth-input" 
                placeholder={t('auth.emailPlaceholder')}
                value={state.email} 
                onChange={e => actions.setEmail(e.target.value)}
                required 
              />
              <Mail className="auth-input-icon" size={20} />
            </div>

            {!state.isReset && (
              <div className="auth-input-wrapper">
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder={t('auth.passwordPlaceholder')}
                  value={state.password} 
                  onChange={e => actions.setPassword(e.target.value)}
                  required 
                  minLength={6}
                />
                <Lock className="auth-input-icon" size={20} />
              </div>
            )}

            {state.isLogin && !state.isReset && (
              <div className="auth-forgot-password-wrapper">
                <button type="button" className="auth-link auth-forgot-password-link" onClick={() => actions.setIsReset(true)}>
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={state.loading}>
              {state.loading ? t('auth.processing') : state.isReset ? t('auth.sendLink') : state.isLogin ? t('auth.login') : t('auth.createAccount')} 
              {!state.loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="auth-switch-text">
            {state.isReset ? (
              <>
                {t('auth.rememberedPassword')} {' '}
                <button type="button" className="auth-link" onClick={() => actions.setIsReset(false)}>
                  {t('auth.backToLogin')}
                </button>
              </>
            ) : state.isLogin ? (
              <>
                {t('auth.noAccount')} {' '}
                <button type="button" className="auth-link" onClick={() => { actions.setIsLogin(false); actions.setError(''); actions.setMessage(''); }}>
                  {t('auth.signUp')}
                </button>
              </>
            ) : (
              <>
                {t('auth.hasAccount')} {' '}
                <button type="button" className="auth-link" onClick={() => { actions.setIsLogin(true); actions.setError(''); actions.setMessage(''); }}>
                  {t('auth.signIn')}
                </button>
              </>
            )}
          </div>
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/privacidade" className="auth-link" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {t('app.name')} • Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
