import { PieChart, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthViewModel } from './hooks/useAuthViewModel';
import './AuthPage.css';

export function AuthPage() {
  const { state, actions } = useAuthViewModel();

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
            <span>Minhas Finanças</span>
          </div>
          <h1 className="auth-headline">O controle do seu dinheiro, simples e claro.</h1>
          <p className="auth-subheadline">Gerencie, planeje e alcance seus objetivos financeiros em uma plataforma desenhada para sua tranquilidade.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-form-wrapper">
        <div className="auth-form-container">
          
          {/* Logo for mobile only */}
          <div className="mobile-only-logo">
            <PieChart size={32} />
            <span>Minhas Finanças</span>
          </div>

          <h2 className="auth-form-title">
            {state.isReset ? 'Redefinir senha' : state.isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="auth-form-subtitle">
            {state.isReset ? 'Enviaremos um link seguro para o seu e-mail' : state.isLogin ? 'Insira seus dados para acessar seu painel' : 'Comece a organizar suas finanças hoje mesmo'}
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
                  placeholder="Seu nome" 
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
                placeholder="Seu e-mail" 
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
                  placeholder="Sua senha" 
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
                  Esqueci minha senha
                </button>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={state.loading}>
              {state.loading ? 'Processando...' : state.isReset ? 'Enviar Link' : state.isLogin ? 'Acessar Plataforma' : 'Criar Conta Agora'} 
              {!state.loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="auth-switch-text">
            {state.isReset ? (
              <>
                Lembrou a senha?{' '}
                <button type="button" className="auth-link" onClick={() => actions.setIsReset(false)}>
                  Voltar para o login
                </button>
              </>
            ) : state.isLogin ? (
              <>
                Ainda não tem uma conta?{' '}
                <button type="button" className="auth-link" onClick={() => { actions.setIsLogin(false); actions.setError(''); actions.setMessage(''); }}>
                  Cadastre-se grátis
                </button>
              </>
            ) : (
              <>
                Já possui uma conta?{' '}
                <button type="button" className="auth-link" onClick={() => { actions.setIsLogin(true); actions.setError(''); actions.setMessage(''); }}>
                  Faça login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
