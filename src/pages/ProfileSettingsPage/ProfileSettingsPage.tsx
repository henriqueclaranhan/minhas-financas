import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, User as UserIcon, Mail, Shield, Loader, MailCheck } from 'lucide-react';
import { useProfileSettingsViewModel } from './hooks/useProfileSettingsViewModel';
import { useLocale } from '../../store/LocaleContext';
import { PageHeader } from '../../components/shared/PageHeader';
import './ProfileSettingsPage.css';

export function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { state, actions } = useProfileSettingsViewModel();
  const {
    user,
    name,
    email,
    newPassword,
    status,
    loading,
    verificationSent,
    emailVerificationSent,
  } = state;
  const {
    setName,
    setEmail,
    setNewPassword,
    handleSubmit,
    handleResendVerification,
    dismissEmailVerification,
  } = actions;

  if (emailVerificationSent) {
    return (
      <div className="profile-page-container animate-fade-in">
        <div className="profile-email-sent-card glass-panel">
          <MailCheck size={48} className="profile-email-sent-icon" />
          <h2>{t('profile.emailSentTitle')}</h2>
          <p dangerouslySetInnerHTML={{ __html: t('profile.emailSentDesc', { email }) }} />
          <p className="profile-email-sent-hint">
            {t('profile.emailSentHint')}
          </p>
          <div className="profile-email-sent-actions">
            <button type="button" className="btn btn-primary" onClick={dismissEmailVerification}>
              {t('profile.emailSentOk')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container animate-fade-in">
      <PageHeader
        title={t('settings.profile')}
        description={t('settings.profileDescription')}
        showBackButton={true}
        forceShowBackButtonOnDesktop={true}
      />

      {status && (
        <div className={`settings-status mb-lg ${status.type}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-sections-container">

        {/* Personal Info */}
        <section className="profile-section glass-panel">
          <div className="profile-section-header">
            <div className="profile-section-icon">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="profile-section-title">{t('profile.personalInfo')}</h2>
              <p className="profile-section-desc">{t('profile.personalInfoDesc')}</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="name">{t('profile.displayName')}</label>
              <div className="input-with-icon">
                <UserIcon size={18} className="input-icon" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('profile.namePlaceholder')}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('profile.emailAddress')}</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('profile.emailPlaceholder')}
                  className="form-input"
                />
              </div>
              {user?.email === email && !user?.emailVerified && (
                <div className="profile-email-status">
                  <span className="text-danger">{t('profile.emailNotVerified')}</span>
                  <button
                    type="button"
                    className="profile-inline-link"
                    onClick={handleResendVerification}
                    disabled={verificationSent}
                  >
                    {verificationSent ? t('profile.emailSent') : t('profile.sendVerification')}
                  </button>
                </div>
              )}
              {user?.email === email && user?.emailVerified && (
                <span className="profile-email-verified">{t('profile.emailVerified')}</span>
              )}
              {email !== user?.email && (
                <span className="profile-email-hint" dangerouslySetInnerHTML={{ __html: t('profile.emailChangeHint', { email }) }} />
              )}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="profile-section glass-panel">
          <div className="profile-section-header">
            <div className="profile-section-icon alt">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="profile-section-title">{t('profile.security')}</h2>
              <p className="profile-section-desc">{t('profile.securityDesc')}</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="newPassword">{t('profile.newPassword')}</label>
              <div className="input-with-icon">
                <Shield size={18} className="input-icon" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={t('profile.passwordPlaceholder')}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="profile-actions">
          <button
            type="button"
            className="btn profile-cancel-btn"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary profile-save-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-sm"><Loader size={16} className="spin" /> {t('profile.saving')}</span>
            ) : (
              <span className="flex items-center gap-sm">
                <Save size={18} /> {t('common.saveChanges')}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
