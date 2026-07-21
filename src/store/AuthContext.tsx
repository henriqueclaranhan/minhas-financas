import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut,
  sendEmailVerification
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  const resendVerification = async () => {
    if (user) {
      await sendEmailVerification(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, resendVerification }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Kept with the provider to preserve the stable context module consumed by the application and tests.
// oxlint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext);
