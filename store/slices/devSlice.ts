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
  isDevMode: true, // Habilitado para facilitar desenvolvimento
  devRole: 'pastoral', // Inicia no modo Pastoral (visão executiva ampla)
  simulatedPersonId: null,
  toggleDevMode: () => set((state) => ({ isDevMode: !state.isDevMode })),
  setDevRole: (role) => set(() => ({ devRole: role })),
  setSimulatedPersonId: (personId) => set(() => ({ simulatedPersonId: personId })),
});
