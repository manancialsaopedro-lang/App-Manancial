
import { StateCreator } from 'zustand';
import { AppState, Proof, ScoreEvent, Material, ScheduleItem, JudgeEvaluation, TeamId } from '../../types';
import { INITIAL_PROOFS, INITIAL_MATERIALS, INITIAL_SCHEDULE } from '../../constants';

export interface GymkhanaSlice {
  proofs: Proof[];
  teamScores: Record<TeamId, number>;
  scoreEvents: ScoreEvent[];
  materials: Material[];
  schedule: ScheduleItem[];
  judgeEvaluations: JudgeEvaluation[];
  isDarkMode: boolean;

  updateProof: (id: string, updates: Partial<Proof>) => void;
  updateScore: (teamId: TeamId, delta: number, reason?: string, proofId?: string, source?: 'MANUAL' | 'JUIZ') => void;
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addScheduleItem: (i: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  registerJudgeEvaluation: (evaluation: Omit<JudgeEvaluation, 'id' | 'timestamp'>) => void;
  toggleTheme: () => void;
}

export const createGymkhanaSlice: StateCreator<
  AppState,
  [],
  [],
  GymkhanaSlice
> = (set) => ({
  proofs: INITIAL_PROOFS as Proof[],
  teamScores: { alianca: 0, segredo: 0, caminho: 0, org: 0, none: 0 },
  scoreEvents: [],
  materials: INITIAL_MATERIALS.map((m, i) => ({ ...m, id: `mat-init-${i}` })) as Material[],
  schedule: INITIAL_SCHEDULE.map((s, i) => ({ ...s, id: `sch-init-${i}` })) as ScheduleItem[],
  judgeEvaluations: [],
  isDarkMode: false,

  updateProof: (id, updates) => set((state) => ({
    proofs: state.proofs.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  updateScore: (teamId, delta, reason = 'Ajuste Manual', proofId, source = 'MANUAL') => set((state) => {
    const newEvent: ScoreEvent = {
      id: `score-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId,
      pointsDelta: delta,
      reason,
      proofId,
      source: source as ScoreEvent['source']
    };

    const newScore = Math.max(0, state.teamScores[teamId] + delta);

    return {
      scoreEvents: [newEvent, ...state.scoreEvents],
      teamScores: { ...state.teamScores, [teamId]: newScore }
    };
  }),

  addMaterial: (m) => set((state) => ({
    materials: [...state.materials, { ...m, id: `mat-${Date.now()}`, isAcquired: false }]
  })),

  updateMaterial: (id, updates) => set((state) => ({
    materials: state.materials.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  deleteMaterial: (id) => set((state) => ({
    materials: state.materials.filter(m => m.id !== id)
  })),

  addScheduleItem: (i) => set((state) => ({
    schedule: [...state.schedule, { ...i, id: `sch-${Date.now()}` }]
  })),

  updateScheduleItem: (id, updates) => set((state) => ({
    schedule: state.schedule.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  deleteScheduleItem: (id) => set((state) => ({
    schedule: state.schedule.filter(s => s.id !== id)
  })),

  registerJudgeEvaluation: (evaluation) => set((state) => {
    const newEval: JudgeEvaluation = {
      ...evaluation,
      id: `judge-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    // Auto-apply score logic is kept here to maintain existing behavior
    const currentScore = state.teamScores[evaluation.teamId] || 0;
    const newScore = currentScore + evaluation.totalPoints;

    const newEvent: ScoreEvent = {
      id: `score-judge-${Date.now()}`,
      timestamp: new Date().toISOString(),
      teamId: evaluation.teamId,
      pointsDelta: evaluation.totalPoints,
      reason: `Avaliação Jurado: ${evaluation.judgeName}`,
      proofId: evaluation.proofId,
      source: 'JUIZ',
      judgeId: newEval.id
    };

    return {
      judgeEvaluations: [...state.judgeEvaluations, newEval],
      scoreEvents: [newEvent, ...state.scoreEvents],
      teamScores: { ...state.teamScores, [evaluation.teamId]: newScore }
    };
  }),

  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
});
