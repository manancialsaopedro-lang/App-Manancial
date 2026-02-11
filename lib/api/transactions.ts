import { supabase } from "../supabase";
import { Transaction } from "../../types";

const TABLE = "transactions";

export const listTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Transaction[];
};

export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Transaction | null;
};

export const createTransaction = async (
  payload: Omit<Transaction, "id">
): Promise<Transaction> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as Transaction;
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Transaction;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase()
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
};
