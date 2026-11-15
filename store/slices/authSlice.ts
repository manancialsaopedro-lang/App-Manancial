import { StateCreator } from 'zustand';
import { AppState } from '../../types';

export const DEFAULT_ADMIN_USER: NonNullable<AppState['user']> = {
  id: 'd6bfb5d9-66dd-463f-8928-8259c538e3ee',
  email: 'stcaioaug@gmail.com',
  name: 'Caio Augusto',
  role: 'admin',
  churchMemberId: 'm-caio-augusto',
  isWorshipMember: true,
  isWorshipLeader: true,
};

export interface AuthSlice {
  user: AppState['user'];
  authReady: boolean;
  signIn: AppState['signIn'];
  signOut: () => void;
  setAuthReady: (ready: boolean) => void;
}

export const createAuthSlice: StateCreator<
  AppState,
  [],
  [],
  AuthSlice
> = (set) => ({
  user: DEFAULT_ADMIN_USER,
  authReady: true,
  signIn: (email, name, role, personId, extras) =>
    set(() => ({
      user: {
        id: extras?.id || DEFAULT_ADMIN_USER.id,
        email: email,
        name: name || email.split('@')[0],
        avatar_url: extras?.avatar_url,
        role: role || 'admin',
        personId,
        churchMemberId: extras?.churchMemberId,
        isWorshipMember: extras?.isWorshipMember ?? true,
        isWorshipLeader: extras?.isWorshipLeader ?? true,
        worshipTeamId: extras?.worshipTeamId,
      },
    })),
  signOut: () =>
    set((state) => ({
      // Se estiver em Modo Construção, mantém acesso Admin livre para não bloquear navegação
      user: state.isDevMode ? DEFAULT_ADMIN_USER : null,
      devRole: state.isDevMode ? 'admin' : null,
      simulatedPersonId: null,
    })),
  setAuthReady: (ready: boolean) => set(() => ({ authReady: ready })),
});
