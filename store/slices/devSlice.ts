import { StateCreator } from 'zustand';
import { AppState, UserRole } from '../../types';

export interface DevSlice {
  isDevMode: boolean;
  devRole: UserRole | null;
  simulatedPersonId: string | null;
  toggleDevMode: () => void;
  setDevRole: (role: UserRole | null) => void;
  setSimulatedPersonId: (personId: string | null) => void;
}

export const createDevSlice: StateCreator<
  AppState,
  [],
  [],
  DevSlice
> = (set) => ({
  isDevMode: true, // Modo Construção ativo por padrão para nunca bloquear o acesso às telas
  devRole: 'admin', // Papel Admin ativo por padrão para acesso irrestrito a todos os módulos
  simulatedPersonId: null,
  toggleDevMode: () => set((state) => ({ isDevMode: !state.isDevMode })),
  setDevRole: (role) => set(() => ({ devRole: role, isDevMode: true })),
  setSimulatedPersonId: (personId) => set(() => ({ simulatedPersonId: personId })),
});
