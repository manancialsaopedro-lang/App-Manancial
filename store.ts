
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, ScoreEvent, TeamId } from './types';
import { INITIAL_PROJECTIONS } from './constants';

import { createAuthSlice, AuthSlice } from './store/slices/authSlice';
import { createPeopleSlice, PeopleSlice } from './store/slices/peopleSlice';
import { createGymkhanaSlice, GymkhanaSlice } from './store/slices/gymkhanaSlice';
import { createFinancialSlice, FinancialSlice } from './store/slices/financialSlice';

// Combine all slices into one AppState
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a) as AuthSlice,
      ...createPeopleSlice(...a) as PeopleSlice,
      ...createGymkhanaSlice(...a) as GymkhanaSlice,
      ...createFinancialSlice(...a) as FinancialSlice,
    }),
    { 
      name: 'manancial_v7_complete',
      // Migration logic for backward compatibility
      onRehydrateStorage: () => (state) => {
        if (state && !state.expenseProjections) {
           state.expenseProjections = INITIAL_PROJECTIONS;
        }
        
        if (state && state.scoreEvents.length === 0 && (Object.values(state.teamScores) as number[]).some(s => s > 0)) {
           const newEvents: ScoreEvent[] = [];
           (Object.keys(state.teamScores) as TeamId[]).forEach(tid => {
              if (state.teamScores[tid] > 0) {
                 newEvents.push({
                   id: `legacy-migrated-${tid}`,
                   timestamp: new Date().toISOString(),
                   teamId: tid,
                   pointsDelta: state.teamScores[tid],
                   reason: 'Migração de Dados Legados',
                   source: 'SISTEMA'
                 });
              }
           });
           state.scoreEvents = newEvents;
        }
      }
    }
  )
);
