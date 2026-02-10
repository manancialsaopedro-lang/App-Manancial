
import { StateCreator } from 'zustand';
import { AppState, User } from '../../types';

export interface AuthSlice {
  user: User | null;
  authReady: boolean;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  setAuthReady: (ready: boolean) => void;
}

export const createAuthSlice: StateCreator<
  AppState,
  [],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  authReady: false,
  signIn: (email: string, name?: string) => set(() => ({
    user: {
      id: `user-${Date.now()}`, // Fallback ID, usually overridden by sync logic
      email: email,
      name: name || email.split('@')[0],
      role: 'admin'
    }
  })),
  signOut: () => set(() => ({ user: null })),
  setAuthReady: (ready: boolean) => set(() => ({ authReady: ready })),
});
