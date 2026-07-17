import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { PieChart, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import './AuthPage.css';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        setMessage('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
        setIsReset(false);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await sendEmailVerification(cred.user);
        setMessage('Conta criada com sucesso! Enviamos um link de verificação para o seu e-mail.');
        setIsLogin(true); // Switch to login view
      }
    } catch (err: any) {
      console.error(err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este e-mail já está em uso por outra conta.');
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('E-mail ou senha incorretos.');
          break;
        case 'auth/weak-password':
          setError('Sua senha deve ter pelo menos 6 caracteres.');
          break;
        default:
          setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

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
            {isReset ? 'Redefinir senha' : isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="auth-form-subtitle">
            {isReset ? 'Enviaremos um link seguro para o seu e-mail' : isLogin ? 'Insira seus dados para acessar seu painel' : 'Comece a organizar suas finanças hoje mesmo'}
          </p>

          {error && (
            <div className="auth-alert-error">
              <AlertCircle size={20} className="auth-alert-icon" /> 
              <div>{error}</div>
            </div>
          )}

          {message && (
            <div className="auth-alert-success">
              <CheckCircle2 size={20} className="auth-alert-icon" />
              <div>{message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && !isReset && (
              <div className="auth-input-wrapper">
                <input 
                  type="text" 
                  className="auth-input" 
                  placeholder="Seu nome" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
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
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required 
              />
              <Mail className="auth-input-icon" size={20} />
            </div>

            {!isReset && (
              <div className="auth-input-wrapper">
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="Sua senha" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  required 
                  minLength={6}
                />
                <Lock className="auth-input-icon" size={20} />
              </div>
            )}

            {isLogin && !isReset && (
              <div className="auth-forgot-password-wrapper">
                <button type="button" className="auth-link auth-forgot-password-link" onClick={() => setIsReset(true)}>
                  Esqueci minha senha
                </button>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Processando...' : isReset ? 'Enviar Link' : isLogin ? 'Acessar Plataforma' : 'Criar Conta Agora'} 
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="auth-switch-text">
            {isReset ? (
              <>
                Lembrou a senha?{' '}
                <button type="button" className="auth-link" onClick={() => setIsReset(false)}>
                  Voltar para o login
                </button>
              </>
            ) : isLogin ? (
              <>
                Ainda não tem uma conta?{' '}
                <button type="button" className="auth-link" onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}>
                  Cadastre-se grátis
                </button>
              </>
            ) : (
              <>
                Já possui uma conta?{' '}
                <button type="button" className="auth-link" onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}>
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
