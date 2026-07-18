import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { AuthService } from '../../../services/AuthService';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/requires-recent-login': 'Por segurança, saia da conta e entre novamente antes de alterar dados sensíveis.',
  'auth/email-already-in-use': 'Este e-mail já está em uso por outra conta.',
  'auth/invalid-email': 'Endereço de e-mail inválido.',
  'auth/operation-not-allowed': 'Operação não permitida. Verifique as configurações do Firebase.',
  'auth/weak-password': 'Senha muito fraca. Use ao menos 6 caracteres.',
};

function getAuthErrorMessage(err: unknown): string {
  const code = (err as any)?.code ?? '';
  const fallback = (err as any)?.message ? `Erro: ${(err as any).message}` : 'Erro ao atualizar o perfil.';
  return AUTH_ERROR_MESSAGES[code] ?? fallback;
}

export function useProfileSettingsViewModel() {
  const { user, resendVerification } = useAuth();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');

  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  // Sync local state whenever Firebase user object updates
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user?.displayName, user?.email]);

  const handleResendVerification = useCallback(async () => {
    try {
      await resendVerification();
      setVerificationSent(true);
      setStatus({ type: 'success', message: 'E-mail de verificação enviado! Verifique sua caixa de entrada.' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Erro ao enviar e-mail de verificação.' });
    }
  }, [resendVerification]);

  const handleSubmit = useCallback(async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setStatus(null);

    try {
      const promises: Promise<void>[] = [];

      if (name !== user.displayName) {
        promises.push(AuthService.updateDisplayName(user, name));
      }

      let emailChanged = false;
      if (email !== user.email) {
        promises.push(AuthService.updateEmail(user, email));
        emailChanged = true;
      }

      if (newPassword) {
        promises.push(AuthService.updatePassword(user, newPassword));
      }

      if (promises.length === 0) {
        setStatus({ type: 'success', message: 'Nenhuma alteração para salvar.' });
        return;
      }

      await Promise.all(promises);
      await user.reload();

      if (emailChanged) {
        setEmailVerificationSent(true);
      } else {
        setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });
        setNewPassword('');
      }
    } catch (err: unknown) {
      console.error('Profile update error:', err);
      setStatus({ type: 'error', message: getAuthErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [user, name, email, newPassword]);

  const dismissEmailVerification = useCallback(() => {
    setEmailVerificationSent(false);
    setEmail(user?.email || '');
    setStatus(null);
  }, [user?.email]);

  return {
    state: {
      user,
      name,
      email,
      newPassword,
      status,
      loading,
      verificationSent,
      emailVerificationSent,
    },
    actions: {
      setName,
      setEmail,
      setNewPassword,
      handleSubmit,
      handleResendVerification,
      dismissEmailVerification,
    },
  };
}
