import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  isLoading: true,
  setUser: (user) => set({ firebaseUser: user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
