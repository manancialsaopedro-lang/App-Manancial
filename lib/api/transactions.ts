import { supabase } from "../supabase";
import { Transaction } from "../../types";

const TABLE = "transactions";

const createRandomId = (prefix: string): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type DbTransactionRow = {
  id: string;
  description: string;
  amount: number;
  type: "ENTRADA" | "SAIDA";
  category: string;
  date: string;
  payment_method?: Transaction["paymentMethod"];
  paymentMethod?: Transaction["paymentMethod"];
  reference_id?: string | null;
  referenceId?: string | null;
  person_id?: string | null;
  personId?: string | null;
  person_name?: string | null;
  personName?: string | null;
  is_settled?: boolean | null;
  isSettled?: boolean | null;
  items?: Transaction["items"];
};

type SupabaseErrorShape = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

const extractMissingColumn = (rawError: unknown): string | null => {
  const err = (rawError ?? {}) as SupabaseErrorShape;
  const source = `${err.message ?? ""} ${err.details ?? ""}`;
  const match = source.match(/Could not find the '([^']+)' column/i);
  return match?.[1] ?? null;
};

const handleTransactionsError = (action: string, rawError: unknown): Error => {
  const err = (rawError ?? {}) as SupabaseErrorShape;
  const message = err.message ?? "Erro desconhecido";
  const details = err.details ?? "";
  const hint = err.hint ?? "";
  const readable = [message, details, hint].filter(Boolean).join(" | ");
  return new Error(`${action}: ${readable || "Erro desconhecido no Supabase"}`);
};

const fromDb = (row: DbTransactionRow): Transaction => ({
  id: row.id,
  description: row.description,
  amount: row.amount,
  type: row.type,
  category: row.category as Transaction["category"],
  date: row.date,
  paymentMethod: row.paymentMethod ?? row.payment_method,
  referenceId: row.referenceId ?? row.reference_id ?? undefined,
  personId: row.personId ?? row.person_id ?? undefined,
  personName: row.personName ?? row.person_name ?? undefined,
  isSettled: row.isSettled ?? row.is_settled ?? undefined,
  items: row.items ?? undefined,
});

const toDb = (payload: Partial<Omit<Transaction, "id">>) => {
  const row: Record<string, unknown> = {};
  if (payload.description !== undefined) row.description = payload.description;
  if (payload.amount !== undefined) row.amount = payload.amount;
  if (payload.type !== undefined) row.type = payload.type;
  if (payload.category !== undefined) row.category = payload.category;
  if (payload.date !== undefined) row.date = payload.date;
  if (payload.paymentMethod !== undefined) row.payment_method = payload.paymentMethod;
  if (payload.referenceId !== undefined) row.reference_id = payload.referenceId;
  if (payload.personId !== undefined) row.person_id = payload.personId;
  if (payload.personName !== undefined) row.person_name = payload.personName;
  if (payload.isSettled !== undefined) row.is_settled = payload.isSettled;
  return row;
};

const insertWithSchemaFallback = async (row: Record<string, unknown>) => {
  let payload = { ...row };
  for (let attempts = 0; attempts < 3; attempts += 1) {
    const { data, error } = await supabase().from(TABLE).insert(payload).select("*").single();
    if (!error) return { data, error: null };
    const missingColumn = extractMissingColumn(error);
    if (!missingColumn || !(missingColumn in payload)) return { data: null, error };
    delete payload[missingColumn];
  }
  return { data: null, error: new Error("Falha ao inserir transacao apos tentativas de fallback de schema") };
};

const updateWithSchemaFallback = async (id: string, row: Record<string, unknown>) => {
  let payload = { ...row };
  for (let attempts = 0; attempts < 3; attempts += 1) {
    const { data, error } = await supabase().from(TABLE).update(payload).eq("id", id).select("*").single();
    if (!error) return { data, error: null };
    const missingColumn = extractMissingColumn(error);
    if (!missingColumn || !(missingColumn in payload)) return { data: null, error };
    delete payload[missingColumn];
  }
  return { data: null, error: new Error("Falha ao atualizar transacao apos tentativas de fallback de schema") };
};

export const listTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .order("date", { ascending: false });

  if (error) throw handleTransactionsError("Nao foi possivel listar transacoes", error);
  return ((data ?? []) as DbTransactionRow[]).map(fromDb);
};

export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw handleTransactionsError("Nao foi possivel buscar transacao", error);
  return data ? fromDb(data as DbTransactionRow) : null;
};

export const createTransaction = async (
  payload: Omit<Transaction, "id">
): Promise<Transaction> => {
  const dbPayload = { id: createRandomId("tx"), ...toDb(payload) };
  const { data, error } = await insertWithSchemaFallback(dbPayload);

  if (error) throw handleTransactionsError("Nao foi possivel criar transacao", error);
  return fromDb(data as DbTransactionRow);
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction> => {
  const { id: _, ...updatesWithoutId } = updates as Partial<Transaction> & { id?: string };
  const { data, error } = await updateWithSchemaFallback(id, toDb(updatesWithoutId));

  if (error) throw handleTransactionsError("Nao foi possivel atualizar transacao", error);
  return fromDb(data as DbTransactionRow);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase()
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw handleTransactionsError("Nao foi possivel remover transacao", error);
};
