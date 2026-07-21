import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { AuthService } from '../../../services/AuthService';
import { useLocale } from '../../../store/LocaleContext';

function getAuthErrorMessage(err: unknown, t: (key: string, values?: Record<string, string | number>) => string): string {
  const code = (err as any)?.code ?? '';
  const message = (err as any)?.message ?? '';
  
  switch (code) {
    case 'auth/requires-recent-login': return t('authError.requiresRecentLogin');
    case 'auth/email-already-in-use': return t('authError.emailAlreadyInUse');
    case 'auth/invalid-email': return t('authError.invalidEmail');
    case 'auth/operation-not-allowed': return t('authError.operationNotAllowed');
    case 'auth/weak-password': return t('authError.weakPassword');
    default: return t('authError.fallback', { message: message ? `: ${message}` : '' });
  }
}

export function useProfileSettingsViewModel() {
  const { user, resendVerification } = useAuth();
  const { t } = useLocale();

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
  }, [user]);

  const handleResendVerification = useCallback(async () => {
    try {
      await resendVerification();
      setVerificationSent(true);
      setStatus({ type: 'success', message: t('profile.verificationSentSuccess') });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: t('profile.verificationSentError') });
    }
  }, [resendVerification, t]);

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
        setStatus({ type: 'success', message: t('profile.noChanges') });
        return;
      }

      await Promise.all(promises);
      await user.reload();

      if (emailChanged) {
        setEmailVerificationSent(true);
      } else {
        setStatus({ type: 'success', message: t('profile.updateSuccess') });
        setNewPassword('');
      }
    } catch (err: unknown) {
      console.error('Profile update error:', err);
      setStatus({ type: 'error', message: getAuthErrorMessage(err, t) });
    } finally {
      setLoading(false);
    }
  }, [user, name, email, newPassword, t]);

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
