import { useState } from 'react';
import { AuthService } from '../../../services/AuthService';

export function useAuthViewModel() {
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
        await AuthService.resetPassword(email);
        setMessage('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
        setIsReset(false);
      } else if (isLogin) {
        await AuthService.login(email, password);
      } else {
        await AuthService.signup(email, password, name);
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

  return {
    state: {
      isLogin,
      isReset,
      name,
      email,
      password,
      error,
      message,
      loading
    },
    actions: {
      setIsLogin,
      setIsReset,
      setName,
      setEmail,
      setPassword,
      setError,
      setMessage,
      handleSubmit
    }
  };
}
