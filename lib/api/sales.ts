import { supabase } from "../supabase";
import { PaymentMethod, Sale, SaleItem } from "../../types";

const SALES_TABLE = "sales";
const ITEMS_TABLE = "sale_items";

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

export const listSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase()
    .from(SALES_TABLE)
    .select("*, sale_items(*)")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapSaleRow);
};

export const getSaleById = async (id: string): Promise<Sale | null> => {
  const { data, error } = await supabase()
    .from(SALES_TABLE)
    .select("*, sale_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSaleRow(data as DbSaleRow) : null;
};

export const createSale = async (payload: Omit<Sale, "id">): Promise<Sale> => {
  const { items, totalCost, paymentMethod, personId, personName, ...saleFields } = payload;

  const saleInsert = {
    ...saleFields,
    totalCost,
    paymentMethod,
    personId,
    personName
  };

  const { data: sale, error: saleError } = await supabase()
    .from(SALES_TABLE)
    .insert(saleInsert)
    .select("*")
    .single();

  if (saleError) throw saleError;

  const saleId = (sale as { id: string }).id;
  if (items.length > 0) {
    const itemsInsert = items.map(item => ({
      saleId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost
    }));

    const { error: itemsError } = await supabase()
      .from(ITEMS_TABLE)
      .insert(itemsInsert);

    if (itemsError) throw itemsError;
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
    .update(saleUpdates)
    .eq("id", id)
    .select("*, sale_items(*)")
    .single();

  if (error) throw error;
  return mapSaleRow(data as DbSaleRow);
};
