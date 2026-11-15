import { supabase } from "../supabase";
import { FinancialEvent } from "../../types";

const TABLE = "financial_events";

type DbFinancialEventRow = {
  id: string;
  name: string;
  badge?: string | null;
  date_label?: string | null;
  color?: string | null;
  status?: "ATIVO" | "ENCERRADO" | "PLANEJADO" | null;
  target_budget?: number | null;
  target_revenue?: number | null;
  camp_year?: "2026" | "2027" | null;
  description?: string | null;
};

const fromDb = (row: DbFinancialEventRow): FinancialEvent => ({
  id: row.id,
  name: row.name,
  badge: row.badge || "Evento Oficial",
  dateLabel: row.date_label || "",
  color: row.color || "from-purple-500 to-indigo-600",
  status: row.status || "ATIVO",
  targetBudget: Number(row.target_budget ?? 0),
  targetRevenue: Number(row.target_revenue ?? 0),
  campYear: row.camp_year ?? undefined,
  description: row.description ?? undefined,
});

const toDb = (ev: Partial<FinancialEvent>): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  if (ev.id !== undefined) row.id = ev.id;
  if (ev.name !== undefined) row.name = ev.name;
  if (ev.badge !== undefined) row.badge = ev.badge;
  if (ev.dateLabel !== undefined) row.date_label = ev.dateLabel;
  if (ev.color !== undefined) row.color = ev.color;
  if (ev.status !== undefined) row.status = ev.status;
  if (ev.targetBudget !== undefined) row.target_budget = ev.targetBudget;
  if (ev.targetRevenue !== undefined) row.target_revenue = ev.targetRevenue;
  if (ev.campYear !== undefined) row.camp_year = ev.campYear ?? null;
  if (ev.description !== undefined) row.description = ev.description ?? null;
  return row;
};

export const listFinancialEvents = async (): Promise<FinancialEvent[]> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as DbFinancialEventRow[]).map(fromDb);
};

export const upsertFinancialEvent = async (ev: FinancialEvent): Promise<FinancialEvent> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .upsert(toDb(ev), { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return fromDb(data as DbFinancialEventRow);
};

export const deleteFinancialEventApi = async (id: string): Promise<void> => {
  const { error } = await supabase().from(TABLE).delete().eq("id", id);
  if (error) throw error;
};
