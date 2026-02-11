import { supabase } from "../supabase";
import { PaymentMethod, Sale, SaleItem } from "../../types";

const SALES_TABLE = "sales";
const ITEMS_TABLE = "sale_items";

const createRandomId = (prefix: string): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type DbSaleRow = {
  id: string;
  total: number;
  totalCost?: number;
  total_cost?: number;
  date: string;
  paymentMethod?: PaymentMethod;
  payment_method?: PaymentMethod;
  personId?: string;
  person_id?: string;
  personName?: string;
  person_name?: string;
  status: "PAID" | "PENDING";
  sale_items?: any[];
  items?: any[];
};

type SupabaseErrorShape = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

const handleSalesError = (action: string, rawError: unknown): Error => {
  const err = (rawError ?? {}) as SupabaseErrorShape;
  const message = err.message ?? "Erro desconhecido";
  const details = err.details ?? "";
  const hint = err.hint ?? "";
  const readable = [message, details, hint].filter(Boolean).join(" | ");
  return new Error(`${action}: ${readable || "Erro desconhecido no Supabase"}`);
};

const mapSaleItem = (row: any): SaleItem => ({
  productId: row.productId ?? row.product_id,
  productName: row.productName ?? row.product_name,
  quantity: row.quantity,
  unitPrice: row.unitPrice ?? row.unit_price,
  unitCost: row.unitCost ?? row.unit_cost
});

const mapSaleRow = (row: DbSaleRow): Sale => {
  const items = (row.sale_items ?? row.items ?? []).map(mapSaleItem);
  const totalCost =
    row.totalCost ??
    row.total_cost ??
    items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);

  return {
    id: row.id,
    items,
    total: row.total,
    totalCost,
    date: row.date,
    paymentMethod: row.paymentMethod ?? row.payment_method ?? "Outro",
    personId: row.personId ?? row.person_id,
    personName: row.personName ?? row.person_name,
    status: row.status
  };
};

const toSaleDb = (payload: Partial<Sale>) => {
  const row: Record<string, unknown> = {};
  if ((payload as Sale & { id?: string }).id !== undefined) row.id = (payload as Sale & { id?: string }).id;
  if (payload.total !== undefined) row.total = payload.total;
  if (payload.totalCost !== undefined) row.total_cost = payload.totalCost;
  if (payload.date !== undefined) row.date = payload.date;
  if (payload.paymentMethod !== undefined) row.payment_method = payload.paymentMethod;
  if (payload.personId !== undefined) row.person_id = payload.personId;
  if (payload.personName !== undefined) row.person_name = payload.personName;
  if (payload.status !== undefined) row.status = payload.status;
  return row;
};

const toSaleItemDb = (saleId: string, item: SaleItem) => ({
  sale_id: saleId,
  product_id: item.productId,
  product_name: item.productName,
  quantity: item.quantity,
  unit_price: item.unitPrice,
  unit_cost: item.unitCost,
});

export const listSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase()
    .from(SALES_TABLE)
    .select("*, sale_items(*)")
    .order("date", { ascending: false });

  if (error) throw handleSalesError("Nao foi possivel listar vendas", error);
  return (data ?? []).map(mapSaleRow);
};

export const getSaleById = async (id: string): Promise<Sale | null> => {
  const { data, error } = await supabase()
    .from(SALES_TABLE)
    .select("*, sale_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw handleSalesError("Nao foi possivel buscar venda", error);
  return data ? mapSaleRow(data as DbSaleRow) : null;
};

export const createSale = async (payload: Omit<Sale, "id">): Promise<Sale> => {
  const { items, ...saleFields } = payload;
  const saleInsert = toSaleDb({ ...(saleFields as Partial<Sale>), id: createRandomId("sale") } as Partial<Sale>);

  const { data: sale, error: saleError } = await supabase()
    .from(SALES_TABLE)
    .insert(saleInsert)
    .select("*")
    .single();

  if (saleError) throw handleSalesError("Nao foi possivel criar venda", saleError);

  const saleId = (sale as { id: string }).id;
  if (items.length > 0) {
    const itemsInsert = items.map(item => toSaleItemDb(saleId, item));

    const { error: itemsError } = await supabase()
      .from(ITEMS_TABLE)
      .insert(itemsInsert);

    if (itemsError) throw handleSalesError("Nao foi possivel salvar itens da venda", itemsError);
  }

  return mapSaleRow({
    ...(sale as DbSaleRow),
    sale_items: items
  });
};

export const updateSale = async (
  id: string,
  updates: Partial<Sale>
): Promise<Sale> => {
  const { items, ...saleUpdates } = updates;

  const { data, error } = await supabase()
    .from(SALES_TABLE)
    .update(toSaleDb(saleUpdates))
    .eq("id", id)
    .select("*, sale_items(*)")
    .single();

  if (error) throw handleSalesError("Nao foi possivel atualizar venda", error);
  return mapSaleRow(data as DbSaleRow);
};
