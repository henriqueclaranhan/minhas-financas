import { useState } from 'react';
import { AuthService } from '../../../services/AuthService';
import { useLocale } from '../../../store/LocaleContext';

export function useAuthViewModel() {
  const { t } = useLocale();
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
        setMessage(t('auth.successResetLinkSent'));
        setIsReset(false);
      } else if (isLogin) {
        await AuthService.login(email, password);
      } else {
        await AuthService.signup(email, password, name);
        setMessage(t('auth.successAccountCreated'));
        setIsLogin(true); // Switch to login view
      }
    } catch (err: any) {
      console.error(err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError(t('auth.errorEmailInUse'));
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError(t('auth.errorInvalidCredentials'));
          break;
        case 'auth/weak-password':
          setError(t('auth.errorWeakPassword'));
          break;
        default:
          setError(t('auth.errorUnexpected'));
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
