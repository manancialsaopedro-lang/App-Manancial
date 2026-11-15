import { supabase } from "../supabase";
import { FixedBillItem, TransactionCategory } from "../../types";

const TABLE = "fixed_bills";

type DbFixedBillRow = {
  id: string;
  title: string;
  category: string;
  amount: number;
  due_day: number;
  status: "PAGO" | "PENDENTE" | "ATRASADO";
  recurring?: boolean | null;
  notes?: string | null;
  event_id?: string | null;
  last_paid_tx_id?: string | null;
};

const fromDb = (row: DbFixedBillRow): FixedBillItem => ({
  id: row.id,
  title: row.title,
  category: (row.category as TransactionCategory) || "DESPESA_FIXA",
  amount: Number(row.amount ?? 0),
  dueDay: Number(row.due_day ?? 10),
  status: row.status || "PENDENTE",
  recurring: row.recurring !== false,
  notes: row.notes ?? undefined,
  eventId: row.event_id ?? undefined,
  lastPaidTxId: row.last_paid_tx_id ?? undefined,
});

const toDb = (bill: Partial<FixedBillItem>): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  if (bill.id !== undefined) row.id = bill.id;
  if (bill.title !== undefined) row.title = bill.title;
  if (bill.category !== undefined) row.category = bill.category;
  if (bill.amount !== undefined) row.amount = bill.amount;
  if (bill.dueDay !== undefined) row.due_day = bill.dueDay;
  if (bill.status !== undefined) row.status = bill.status;
  if (bill.recurring !== undefined) row.recurring = bill.recurring;
  if (bill.notes !== undefined) row.notes = bill.notes ?? null;
  if (bill.eventId !== undefined) row.event_id = bill.eventId ?? null;
  if (bill.lastPaidTxId !== undefined) row.last_paid_tx_id = bill.lastPaidTxId ?? null;
  return row;
};

export const listFixedBills = async (): Promise<FixedBillItem[]> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .select("*")
    .order("due_day", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as DbFixedBillRow[]).map(fromDb);
};

export const upsertFixedBill = async (bill: FixedBillItem): Promise<FixedBillItem> => {
  const { data, error } = await supabase()
    .from(TABLE)
    .upsert(toDb(bill), { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return fromDb(data as DbFixedBillRow);
};

export const deleteFixedBillApi = async (id: string): Promise<void> => {
  const { error } = await supabase().from(TABLE).delete().eq("id", id);
  if (error) throw error;
};
