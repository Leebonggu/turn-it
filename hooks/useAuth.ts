import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { subscribeToAuth } from '../services/auth';

export function useAuth() {
  const { firebaseUser, isLoading, setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuth(setUser);
    return unsubscribe;
  }, [setUser]);

  return { user: firebaseUser, isLoading };
}
