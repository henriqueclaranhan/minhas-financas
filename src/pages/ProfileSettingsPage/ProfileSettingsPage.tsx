import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, User as UserIcon, Mail, Shield, Loader, MailCheck } from 'lucide-react';
import { useProfileSettingsViewModel } from './hooks/useProfileSettingsViewModel';
import './ProfileSettingsPage.css';

export function ProfileSettingsPage() {
  const navigate = useNavigate();
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
          <h2>Confirme seu novo e-mail</h2>
          <p>
            Enviamos um link de confirmação para <strong>{email}</strong>.
            Clique nele para concluir a troca de e-mail.
          </p>
          <p className="profile-email-sent-hint">
            Não encontrou? Verifique a pasta de spam. O link expira em 1 hora.
          </p>
          <div className="profile-email-sent-actions">
            <button type="button" className="btn btn-primary" onClick={dismissEmailVerification}>
              OK, entendi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container animate-fade-in">
      <header className="mb-xl flex items-center">
        <button
          className="btn"
          onClick={() => navigate(-1)}
          type="button"
          style={{ background: 'transparent', padding: '0', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: 500 }}
        >
          <ChevronLeft size={24} /> Voltar
        </button>
      </header>

      <header className="page-header" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Meu Perfil</h1>
          <p className="text-secondary" style={{ marginTop: 'var(--spacing-xs)' }}>Gerencie suas informações pessoais e a segurança da sua conta.</p>
        </div>
      </header>

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
              <h2 className="profile-section-title">Informações Pessoais</h2>
              <p className="profile-section-desc">Como você será identificado no aplicativo.</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome de Exibição</label>
              <div className="input-with-icon">
                <UserIcon size={18} className="input-icon" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Endereço de E-mail</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="form-input"
                />
              </div>
              {user?.email === email && !user?.emailVerified && (
                <div className="profile-email-status">
                  <span className="text-danger">E-mail não verificado.</span>
                  <button
                    type="button"
                    className="profile-inline-link"
                    onClick={handleResendVerification}
                    disabled={verificationSent}
                  >
                    {verificationSent ? 'E-mail enviado' : 'Enviar verificação'}
                  </button>
                </div>
              )}
              {user?.email === email && user?.emailVerified && (
                <span className="profile-email-verified">✓ E-mail verificado</span>
              )}
              {email !== user?.email && (
                <span className="profile-email-hint">
                  Um link de confirmação será enviado para <strong>{email}</strong> para concluir a troca.
                </span>
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
              <h2 className="profile-section-title">Segurança da Conta</h2>
              <p className="profile-section-desc">Defina uma nova senha para sua conta.</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <div className="input-with-icon">
                <Shield size={18} className="input-icon" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
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
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary profile-save-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-sm"><Loader size={16} className="spin" /> Salvando...</span>
            ) : (
              <span className="flex items-center gap-sm">
                <Save size={18} /> Salvar Alterações
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
