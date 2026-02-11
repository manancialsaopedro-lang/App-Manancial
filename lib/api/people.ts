import { supabase } from "../supabase";
import { AgeGroup, PaymentStatus, Person, PersonType, TeamId } from "../../types";

const TABLE = "people";

type PersonDbRow = {
  id?: string | null;
  name?: string | null;
  amount_paid?: number | null;
  total_price?: number | null;
  age_group?: string | null;
  person_type?: string | null;
  team_id?: string | null;
  payment_status?: string | null;
  last_payment_date?: string | null;
};

type ToDbOptions = {
  withDefaults?: boolean;
  ensureId?: boolean;
};

const AGE_GROUPS: AgeGroup[] = ["Adulto", "Jovem", "Criança", "Indefinido"];
const PERSON_TYPES: PersonType[] = ["Membro", "Visitante"];
const TEAM_IDS: TeamId[] = ["alianca", "segredo", "caminho", "org", "none"];
const PAYMENT_STATUSES: PaymentStatus[] = ["PAGO", "PENDENTE"];

const isOneOf = <T extends string>(value: string | undefined | null, allowed: T[]): value is T =>
  typeof value === "string" && allowed.includes(value as T);

const createRandomId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `person-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const fromDb = (row: PersonDbRow): Person => ({
  id: row.id ?? createRandomId(),
  name: row.name ?? "Sem nome",
  amountPaid: Number(row.amount_paid ?? 0),
  totalPrice: Number(row.total_price ?? 0),
  ageGroup: isOneOf(row.age_group, AGE_GROUPS) ? row.age_group : "Indefinido",
  personType: isOneOf(row.person_type, PERSON_TYPES) ? row.person_type : "Membro",
  teamId: isOneOf(row.team_id, TEAM_IDS) ? row.team_id : "none",
  paymentStatus: isOneOf(row.payment_status, PAYMENT_STATUSES) ? row.payment_status : "PENDENTE",
  lastPaymentDate: row.last_payment_date ?? undefined,
});

export const toDb = (person: Partial<Person>, options: ToDbOptions = {}): PersonDbRow => {
  const withDefaults = options.withDefaults ?? false;
  const ensureId = options.ensureId ?? false;

  const source: Partial<Person> = withDefaults
    ? {
        name: person.name ?? "Novo Participante",
        amountPaid: person.amountPaid ?? 0,
        totalPrice: person.totalPrice ?? 0,
        ageGroup: person.ageGroup ?? "Indefinido",
        personType: person.personType ?? "Membro",
        teamId: person.teamId ?? "none",
        paymentStatus: person.paymentStatus ?? "PENDENTE",
        lastPaymentDate: person.lastPaymentDate,
        id: person.id,
      }
    : person;

  const row: PersonDbRow = {};

  if (source.id !== undefined) row.id = source.id;
  if (source.name !== undefined) row.name = source.name;
  if (source.amountPaid !== undefined) row.amount_paid = source.amountPaid;
  if (source.totalPrice !== undefined) row.total_price = source.totalPrice;
  if (source.ageGroup !== undefined) row.age_group = source.ageGroup;
  if (source.personType !== undefined) row.person_type = source.personType;
  if (source.teamId !== undefined) row.team_id = source.teamId;
  if (source.paymentStatus !== undefined) row.payment_status = source.paymentStatus;
  if (source.lastPaymentDate !== undefined) row.last_payment_date = source.lastPaymentDate ?? null;

  if (ensureId && !row.id) {
    row.id = createRandomId();
  }

  return row;
};

type SupabaseErrorShape = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

const handlePeopleError = (action: string, rawError: unknown): Error => {
  const err = (rawError ?? {}) as SupabaseErrorShape;
  const message = err.message ?? "Erro desconhecido";
  const details = err.details ?? "";
  const hint = err.hint ?? "";
  const code = err.code ?? "";

  console.error("Erro Supabase people:", {
    message,
    details,
    hint,
    code,
    rawError,
  });

  const readableParts = [message, details, hint].filter(Boolean);
  const readable = readableParts.length > 0 ? readableParts.join(" | ") : "Erro desconhecido no Supabase";
  return new Error(`${action}: ${readable}`);
};

const PEOPLE_SELECT = "id,name,amount_paid,total_price,age_group,person_type,team_id,payment_status,last_payment_date";

type ListPeopleOptions = {
  alphabetical?: boolean;
};

export const listPeople = async (options: ListPeopleOptions = {}): Promise<Person[]> => {
  const alphabetical = options.alphabetical ?? true;
  let query = supabase().from(TABLE).select(PEOPLE_SELECT);
  if (alphabetical) {
    query = query.order("name", { ascending: true });
  }
  const { data, error } = await query;

  if (error) throw handlePeopleError("Nao foi possivel listar pessoas", error);
  return ((data ?? []) as PersonDbRow[]).map(fromDb);
};

export const createPerson = async (payload: Omit<Person, "id">): Promise<Person> => {
  const dbPayload = toDb(payload, { withDefaults: true, ensureId: true });

  const { data, error } = await supabase().from(TABLE).insert(dbPayload).select(PEOPLE_SELECT).single();

  if (error) throw handlePeopleError("Nao foi possivel criar a pessoa", error);
  return fromDb((data ?? {}) as PersonDbRow);
};

export const upsertPerson = async (payload: Partial<Person>): Promise<Person> => {
  const dbPayload = toDb(payload, { ensureId: true });

  const { data, error } = await supabase().from(TABLE).upsert(dbPayload, { onConflict: "id" }).select(PEOPLE_SELECT).single();

  if (error) throw handlePeopleError("Nao foi possivel salvar a pessoa", error);
  return fromDb((data ?? {}) as PersonDbRow);
};

export const updatePerson = async (id: string, payload: Partial<Person>): Promise<Person> => {
  const dbPayload = toDb(payload);

  const { data, error } = await supabase().from(TABLE).update(dbPayload).eq("id", id).select(PEOPLE_SELECT).single();

  if (error) throw handlePeopleError("Nao foi possivel atualizar a pessoa", error);
  return fromDb((data ?? {}) as PersonDbRow);
};

export const deletePerson = async (id: string): Promise<void> => {
  const { error } = await supabase().from(TABLE).delete().eq("id", id);

  if (error) throw handlePeopleError("Nao foi possivel remover a pessoa", error);
};
