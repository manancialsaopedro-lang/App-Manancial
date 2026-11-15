import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, ScoreEvent, TeamId } from './types';
import {
  INITIAL_PROJECTIONS,
  INITIAL_FINANCIAL_EVENTS,
  INITIAL_FIXED_BILLS,
  INITIAL_CAMP_2026_PROJECTIONS,
  INITIAL_CAMP_2026_PEOPLE,
  OFFICIAL_CAMP_2027_PEOPLE,
} from './constants';

import { createAuthSlice, AuthSlice, DEFAULT_ADMIN_USER } from './store/slices/authSlice';
import { createPeopleSlice, PeopleSlice } from './store/slices/peopleSlice';
import { createGymkhanaSlice, GymkhanaSlice } from './store/slices/gymkhanaSlice';
import { createFinancialSlice, FinancialSlice } from './store/slices/financialSlice';
import { createDevSlice, DevSlice } from './store/slices/devSlice';

// Combine all slices into one AppState
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...(createAuthSlice(...a) as AuthSlice),
      ...(createPeopleSlice(...a) as PeopleSlice),
      ...(createGymkhanaSlice(...a) as GymkhanaSlice),
      ...(createFinancialSlice(...a) as FinancialSlice),
      ...(createDevSlice(...a) as DevSlice),
    }),
    {
      name: 'manancial_v7_complete',
      // Migration logic for backward compatibility & Builder Admin guarantee
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Garante Modo Construção Admin ativo para nunca obstruir o acesso às telas
        state.isDevMode = true;
        if (!state.devRole) {
          state.devRole = 'admin';
        }
        if (!state.user) {
          state.user = DEFAULT_ADMIN_USER;
        }
        state.authReady = true;

        if (!state.expenseProjections) {
          state.expenseProjections = INITIAL_PROJECTIONS;
        }
        if (!state.financialEvents || state.financialEvents.length === 0) {
          state.financialEvents = INITIAL_FINANCIAL_EVENTS;
        }
        if (!state.fixedBills || state.fixedBills.length === 0) {
          state.fixedBills = INITIAL_FIXED_BILLS;
        }
        if (!state.camp2026Projections || state.camp2026Projections.length === 0) {
          state.camp2026Projections = INITIAL_CAMP_2026_PROJECTIONS;
        }
        if (!state.camp2026People || state.camp2026People.length === 0) {
          state.camp2026People = INITIAL_CAMP_2026_PEOPLE;
        }
        // If people was overwritten by 2026 Supabase dump (totalPrice === 432), restore 2027 people and keep 2026 in camp2026People
        if (state.people?.length) {
          const rows2026 = state.people.filter((p) => p.totalPrice === 432 || p.id.startsWith('p-1770'));
          const rows2027 = state.people.filter((p) => p.totalPrice !== 432 && !p.id.startsWith('p-1770'));
          if (rows2026.length > 0) {
            state.camp2026People = rows2026;
          }
          if (rows2027.length === 0) {
            state.people = OFFICIAL_CAMP_2027_PEOPLE;
          } else {
            state.people = rows2027;
          }
        }
        if (state.expenseProjections?.length) {
          state.expenseProjections = state.expenseProjections.map((item) => {
            if (item.id === 'proj-7' && item.categoryMapping === 'CANTINA') {
              return { ...item, categoryMapping: undefined, source: item.source || 'BASE' };
            }
            return { ...item, source: item.source || 'BASE' };
          });
        }

        if (state.scoreEvents.length === 0 && (Object.values(state.teamScores) as number[]).some((s) => s > 0)) {
          const newEvents: ScoreEvent[] = [];
          (Object.keys(state.teamScores) as TeamId[]).forEach((tid) => {
            if (state.teamScores[tid] > 0) {
              newEvents.push({
                id: `legacy-migrated-${tid}`,
                timestamp: new Date().toISOString(),
                teamId: tid,
                pointsDelta: state.teamScores[tid],
                reason: 'Migração de Dados Legados',
                source: 'SISTEMA',
              });
            }
          });
          state.scoreEvents = newEvents;
        }
      },
    }
  )
);
