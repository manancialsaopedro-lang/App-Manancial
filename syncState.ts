
import { supabase } from "./lib/supabase";
import { useAppStore } from "./store";

export async function saveAppState() {
  const state = useAppStore.getState();

  // cuidado: não salvar funções, só dados
  const payload = {
    user: state.user,
    people: state.people,
    proofs: state.proofs,
    teamScores: state.teamScores,
    scoreEvents: state.scoreEvents,
    materials: state.materials,
    schedule: state.schedule,
    transactions: state.transactions,
    fixedCostRent: state.fixedCostRent,
    expenseProjections: state.expenseProjections,
    products: state.products,
    sales: state.sales,
    judgeEvaluations: state.judgeEvaluations,
    isDarkMode: state.isDarkMode,
  };

  const { error } = await supabase()
    .from("app_state")
    .upsert({ state_key: "default", state: payload, updated_at: new Date().toISOString() }, { onConflict: "state_key" });

  if (error) throw error;
}
