import { supabase } from "../supabase";
import { Product } from "../../types";

const TABLE = "products";

type ProductDbRow = {
  id?: string | null;
  name?: string | null;
  cost_price?: number | null;
  costPrice?: number | null;
  sell_price?: number | null;
  sellPrice?: number | null;
  stock?: number | null;
  min_stock?: number | null;
  minStock?: number | null;
  category?: string | null;
};

const PRODUCTS_SELECT = "id,name,cost_price,sell_price,stock,min_stock,category";

const fromDb = (row: ProductDbRow): Product => ({
  id: row.id ?? `product-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: row.name ?? "Produto sem nome",
  costPrice: Number(row.cost_price ?? row.costPrice ?? 0),
  sellPrice: Number(row.sell_price ?? row.sellPrice ?? 0),
  stock: Number(row.stock ?? 0),
  minStock: Number(row.min_stock ?? row.minStock ?? 0),
  category: row.category ?? "Geral",
});

const toDb = (payload: Partial<Product>) => {
  const row: Record<string, unknown> = {};

  if (payload.id !== undefined) row.id = payload.id;
  if (payload.name !== undefined) row.name = payload.name;
  if (payload.costPrice !== undefined) row.cost_price = payload.costPrice;
  if (payload.sellPrice !== undefined) row.sell_price = payload.sellPrice;
  if (payload.stock !== undefined) row.stock = payload.stock;
  if (payload.minStock !== undefined) row.min_stock = payload.minStock;
  if (payload.category !== undefined) row.category = payload.category;

  return row;
};

const handleProductsError = (action: string, rawError: unknown): Error => {
  const err = (rawError ?? {}) as { message?: string; details?: string; hint?: string; code?: string };

  console.error("Erro Supabase products:", {
    message: err.message,
    details: err.details,
    hint: err.hint,
    code: err.code,
    rawError,
  });

  return new Error(`${action}: ${err.message ?? "Erro desconhecido"}`);
};

export const listProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase().from(TABLE).select(PRODUCTS_SELECT).order("name", { ascending: true });

  if (error) throw handleProductsError("Nao foi possivel listar produtos", error);
  return ((data ?? []) as ProductDbRow[]).map(fromDb);
};

export const createProduct = async (payload: Omit<Product, "id">): Promise<Product> => {
  const { data, error } = await supabase().from(TABLE).insert(toDb(payload)).select(PRODUCTS_SELECT).single();

  if (error) throw handleProductsError("Nao foi possivel criar produto", error);
  return fromDb((data ?? {}) as ProductDbRow);
};

export const upsertProduct = async (payload: Partial<Product>): Promise<Product> => {
  const dbPayload = toDb(payload);
  if (!dbPayload.id) {
    dbPayload.id = `product-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  const { data, error } = await supabase().from(TABLE).upsert(dbPayload, { onConflict: "id" }).select(PRODUCTS_SELECT).single();

  if (error) throw handleProductsError("Nao foi possivel salvar produto", error);
  return fromDb((data ?? {}) as ProductDbRow);
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase().from(TABLE).update(toDb(updates)).eq("id", id).select(PRODUCTS_SELECT).single();

  if (error) throw handleProductsError("Nao foi possivel atualizar produto", error);
  return fromDb((data ?? {}) as ProductDbRow);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase().from(TABLE).delete().eq("id", id);

  if (error) throw handleProductsError("Nao foi possivel remover produto", error);
};
