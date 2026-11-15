import { getSupabaseClient } from '../../../supabaseClient';
import {
  ChurchRequestItem,
  STORAGE_COURSES_KEY,
  STORAGE_REQUESTS_KEY,
  getStoredPastoralRequests,
  saveStoredPastoralRequests,
} from './churchMemberData';

export type ChurchRequestSource =
  | 'MEMBER_PORTAL'
  | 'LANDING_PAGE'
  | 'CAMP_LEAD'
  | 'VISITOR_WIZARD'
  | 'DEV_PORTAL';

export interface ChurchRequestRecord extends ChurchRequestItem {
  email?: string;
  pastoralNotes?: string;
  source?: ChurchRequestSource;
  memberId?: string;
  userId?: string;
}

export interface ChurchCellGroup {
  id: string;
  name: string;
  leaderName: string;
  leaderPhone: string;
  hostName: string;
  neighborhood: string;
  address: string;
  meetingDay: string;
  meetingTime: string;
  category: 'Famílias' | 'Jovens' | 'Casais' | 'Mulheres' | 'Homens' | 'Mista';
  membersCount: number;
}

export type ChurchCourseTitle =
  | 'Curso de Teologia'
  | 'Batismo nas Águas'
  | 'Novos Convertidos'
  | 'Escola Bíblica de Maturidade'
  | 'Academia de Líderes'
  | 'Curso de Casais'
  | 'Curso de Pais';

export interface ChurchCourseStudent {
  id: string;
  studentName: string;
  phoneWhatsApp: string;
  courseTitle: ChurchCourseTitle;
  teacherName: string;
  startDate: string;
  completedLessons: number;
  totalLessons: number;
  status: 'Em Andamento' | 'Concluído' | 'Trancado';
  notes?: string;
  userId?: string;
}

export interface SyncResult<T> {
  data: T;
  syncedRemote: boolean;
  error?: string;
}

export const STORAGE_CELLS_KEY = 'manancial_church_cells';

const createRecordId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const extractErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  if (err instanceof Error) return err.message;
  return 'Falha de conexão com o servidor.';
};

const emitUpdateEvent = (name: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(name));
  }
};

// ============================================================================
// CHURCH REQUESTS (Atendimentos Pastorais & Leads)
// ============================================================================

interface DbRequestRow {
  id: string;
  user_id?: string | null;
  member_id?: string | null;
  source?: ChurchRequestSource | null;
  type: string;
  sub_category?: string | null;
  subject: string;
  requester: string;
  phone?: string | null;
  email?: string | null;
  details?: string | null;
  urgency?: 'Normal' | 'Urgente' | null;
  preferred_shift?: string | null;
  privacy_level?: 'Pastores' | 'Intercessão' | null;
  status: 'Atendido' | 'Em Análise' | 'Pendente';
  pastoral_notes?: string | null;
  assigned_pastor?: string | null;
  routing_mode?: 'Atendimento Direto' | 'Direcionado' | null;
  pastor_notified?: boolean | null;
  created_at_label?: string | null;
  created_at?: string | null;
}

const mapRequestFromDb = (row: DbRequestRow): ChurchRequestRecord => ({
  id: row.id,
  userId: row.user_id ?? undefined,
  memberId: row.member_id ?? undefined,
  source: row.source ?? 'MEMBER_PORTAL',
  type: row.type,
  subCategory: row.sub_category ?? undefined,
  subject: row.subject,
  requester: row.requester,
  phone: row.phone ?? undefined,
  email: row.email ?? undefined,
  details: row.details ?? undefined,
  urgency: row.urgency ?? 'Normal',
  preferredShift: row.preferred_shift ?? undefined,
  privacyLevel: row.privacy_level ?? 'Pastores',
  status: row.status,
  pastoralNotes: row.pastoral_notes ?? undefined,
  assignedPastor: row.assigned_pastor ?? undefined,
  routingMode: row.routing_mode ?? 'Atendimento Direto',
  pastorNotified: row.pastor_notified ?? true,
  createdAt:
    row.created_at_label ||
    (row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')),
});

const readRequestsCache = (fallback: ChurchRequestRecord[] = []): ChurchRequestRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage read failure
  }
  return fallback.length > 0 ? fallback : getStoredPastoralRequests();
};

export async function fetchChurchRequests(
  fallback: ChurchRequestRecord[] = []
): Promise<SyncResult<ChurchRequestRecord[]>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: readRequestsCache(fallback), syncedRemote: false };
  }

  try {
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      return { data: readRequestsCache(fallback), syncedRemote: false };
    }

    const { data, error } = await client
      .from('church_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        data: readRequestsCache(fallback),
        syncedRemote: false,
        error: extractErrorMessage(error),
      };
    }

    const mapped = ((data ?? []) as DbRequestRow[]).map(mapRequestFromDb);
    saveStoredPastoralRequests(mapped);
    return { data: mapped, syncedRemote: true };
  } catch (err) {
    return {
      data: readRequestsCache(fallback),
      syncedRemote: false,
      error: extractErrorMessage(err),
    };
  }
}

export async function createChurchRequest(
  input: Omit<ChurchRequestRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<SyncResult<ChurchRequestRecord>> {
  const id = input.id || createRecordId('req');
  const createdAtLabel = input.createdAt || new Date().toLocaleDateString('pt-BR');
  const localRecord: ChurchRequestRecord = {
    ...input,
    id,
    createdAt: createdAtLabel,
    status: input.status || 'Pendente',
    urgency: input.urgency || 'Normal',
    privacyLevel: input.privacyLevel || 'Pastores',
    routingMode: input.routingMode || 'Atendimento Direto',
    pastorNotified: input.pastorNotified ?? true,
  };

  const client = getSupabaseClient();
  if (!client) {
    const current = readRequestsCache();
    saveStoredPastoralRequests([localRecord, ...current]);
    return { data: localRecord, syncedRemote: false };
  }

  try {
    const {
      data: { session },
    } = await client.auth.getSession();

    const isAuthenticated = !!session?.user;
    const dbRow = {
      id,
      user_id: isAuthenticated ? session.user.id : null,
      member_id: input.memberId ?? null,
      source: input.source || (isAuthenticated ? 'MEMBER_PORTAL' : 'LANDING_PAGE'),
      type: input.type,
      sub_category: input.subCategory ?? null,
      subject: input.subject,
      requester: input.requester,
      phone: input.phone ?? null,
      email: input.email ?? null,
      details: input.details ?? '',
      urgency: input.urgency ?? 'Normal',
      preferred_shift: input.preferredShift ?? null,
      privacy_level: input.privacyLevel ?? 'Pastores',
      status: isAuthenticated ? input.status || 'Pendente' : 'Pendente',
      pastoral_notes: input.pastoralNotes ?? null,
      assigned_pastor: input.assignedPastor ?? null,
      routing_mode: input.routingMode ?? 'Atendimento Direto',
      pastor_notified: input.pastorNotified ?? true,
      created_at_label: createdAtLabel,
    };

    if (isAuthenticated) {
      const { data, error } = await client.from('church_requests').insert(dbRow).select('*').single();
      if (error) {
        return { data: localRecord, syncedRemote: false, error: extractErrorMessage(error) };
      }
      const mapped = mapRequestFromDb(data as DbRequestRow);
      const current = readRequestsCache();
      saveStoredPastoralRequests([mapped, ...current.filter((r) => r.id !== mapped.id)]);
      return { data: mapped, syncedRemote: true };
    }

    // Usuários anônimos podem inserir leads públicos, mas a RLS bloqueia SELECT para anon.
    const { error } = await client.from('church_requests').insert(dbRow);
    if (error) {
      return { data: localRecord, syncedRemote: false, error: extractErrorMessage(error) };
    }
    return { data: localRecord, syncedRemote: true };
  } catch (err) {
    return { data: localRecord, syncedRemote: false, error: extractErrorMessage(err) };
  }
}

export async function updateChurchRequest(
  id: string,
  patch: Partial<ChurchRequestRecord>
): Promise<SyncResult<ChurchRequestRecord | null>> {
  const client = getSupabaseClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.assignedPastor !== undefined) dbPatch.assigned_pastor = patch.assignedPastor ?? null;
  if (patch.routingMode !== undefined) dbPatch.routing_mode = patch.routingMode ?? null;
  if (patch.pastoralNotes !== undefined) dbPatch.pastoral_notes = patch.pastoralNotes ?? null;
  if (patch.details !== undefined) dbPatch.details = patch.details ?? '';

  if (!client) {
    const current = readRequestsCache();
    const updated = current.map((item) => (item.id === id ? { ...item, ...patch } : item));
    saveStoredPastoralRequests(updated);
    return { data: updated.find((r) => r.id === id) ?? null, syncedRemote: false };
  }

  try {
    const { data, error } = await client
      .from('church_requests')
      .update(dbPatch)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      return { data: null, syncedRemote: false, error: extractErrorMessage(error) };
    }

    const mapped = data ? mapRequestFromDb(data as DbRequestRow) : null;
    const current = readRequestsCache();
    const updated = current.map((item) => (item.id === id ? mapped || { ...item, ...patch } : item));
    saveStoredPastoralRequests(updated);
    return { data: mapped, syncedRemote: true };
  } catch (err) {
    return { data: null, syncedRemote: false, error: extractErrorMessage(err) };
  }
}

export async function deleteChurchRequest(id: string): Promise<SyncResult<void>> {
  const client = getSupabaseClient();
  if (!client) {
    const current = readRequestsCache();
    saveStoredPastoralRequests(current.filter((r) => r.id !== id));
    return { data: undefined, syncedRemote: false };
  }

  try {
    const { error } = await client.from('church_requests').delete().eq('id', id);
    if (error) {
      return { data: undefined, syncedRemote: false, error: extractErrorMessage(error) };
    }
    const current = readRequestsCache();
    saveStoredPastoralRequests(current.filter((r) => r.id !== id));
    return { data: undefined, syncedRemote: true };
  } catch (err) {
    return { data: undefined, syncedRemote: false, error: extractErrorMessage(err) };
  }
}

// ============================================================================
// CHURCH CELLS (Células & Pequenos Grupos)
// ============================================================================

interface DbCellRow {
  id: string;
  name: string;
  leader_name: string;
  leader_phone?: string | null;
  host_name?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  meeting_day: string;
  meeting_time: string;
  category: ChurchCellGroup['category'];
  members_count: number;
}

const mapCellFromDb = (row: DbCellRow): ChurchCellGroup => ({
  id: row.id,
  name: row.name,
  leaderName: row.leader_name,
  leaderPhone: row.leader_phone ?? '',
  hostName: row.host_name ?? '',
  neighborhood: row.neighborhood ?? '',
  address: row.address ?? '',
  meetingDay: row.meeting_day,
  meetingTime: row.meeting_time,
  category: row.category,
  membersCount: Number(row.members_count ?? 0),
});

export const getStoredCells = (fallback: ChurchCellGroup[] = []): ChurchCellGroup[] => {
  try {
    const raw = localStorage.getItem(STORAGE_CELLS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage read error
  }
  return fallback;
};

export const saveStoredCells = (list: ChurchCellGroup[]): void => {
  try {
    localStorage.setItem(STORAGE_CELLS_KEY, JSON.stringify(list));
    emitUpdateEvent('manancial-cells-updated');
  } catch {
    // ignore storage write error
  }
};

export async function fetchChurchCells(
  fallback: ChurchCellGroup[] = []
): Promise<SyncResult<ChurchCellGroup[]>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: getStoredCells(fallback), syncedRemote: false };
  }

  try {
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      return { data: getStoredCells(fallback), syncedRemote: false };
    }

    const { data, error } = await client
      .from('church_cells')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: getStoredCells(fallback), syncedRemote: false, error: extractErrorMessage(error) };
    }

    const mapped = ((data ?? []) as DbCellRow[]).map(mapCellFromDb);
    saveStoredCells(mapped);
    return { data: mapped, syncedRemote: true };
  } catch (err) {
    return { data: getStoredCells(fallback), syncedRemote: false, error: extractErrorMessage(err) };
  }
}

export async function saveChurchCell(
  cell: Omit<ChurchCellGroup, 'id'> & { id?: string },
  isEdit: boolean
): Promise<SyncResult<ChurchCellGroup>> {
  const id = cell.id || createRecordId('cell');
  const fullItem: ChurchCellGroup = { ...cell, id };
  const client = getSupabaseClient();

  if (!client) {
    const current = getStoredCells();
    const updated = isEdit ? current.map((c) => (c.id === id ? fullItem : c)) : [fullItem, ...current];
    saveStoredCells(updated);
    return { data: fullItem, syncedRemote: false };
  }

  const dbPayload = {
    name: cell.name.trim(),
    leader_name: cell.leaderName.trim(),
    leader_phone: cell.leaderPhone.trim(),
    host_name: cell.hostName.trim(),
    neighborhood: cell.neighborhood.trim(),
    address: cell.address.trim(),
    meeting_day: cell.meetingDay,
    meeting_time: cell.meetingTime,
    category: cell.category,
    members_count: Number(cell.membersCount) || 0,
    is_active: true,
  };

  try {
    const { data, error } = isEdit
      ? await client.from('church_cells').update(dbPayload).eq('id', id).select('*').single()
      : await client.from('church_cells').insert({ id, ...dbPayload }).select('*').single();

    if (error) {
      return { data: fullItem, syncedRemote: false, error: extractErrorMessage(error) };
    }

    const mapped = mapCellFromDb(data as DbCellRow);
    const current = getStoredCells();
    const updated = isEdit
      ? current.map((c) => (c.id === mapped.id ? mapped : c))
      : [mapped, ...current.filter((c) => c.id !== mapped.id)];
    saveStoredCells(updated);
    return { data: mapped, syncedRemote: true };
  } catch (err) {
    return { data: fullItem, syncedRemote: false, error: extractErrorMessage(err) };
  }
}

export async function deleteChurchCell(id: string): Promise<SyncResult<void>> {
  const client = getSupabaseClient();
  if (!client) {
    saveStoredCells(getStoredCells().filter((c) => c.id !== id));
    return { data: undefined, syncedRemote: false };
  }

  try {
    const { error } = await client.from('church_cells').delete().eq('id', id);
    if (error) {
      return { data: undefined, syncedRemote: false, error: extractErrorMessage(error) };
    }
    saveStoredCells(getStoredCells().filter((c) => c.id !== id));
    return { data: undefined, syncedRemote: true };
  } catch (err) {
    return { data: undefined, syncedRemote: false, error: extractErrorMessage(err) };
  }
}

// ============================================================================
// CHURCH COURSES (Cursos, Batismo & Discipulado)
// ============================================================================

interface DbCourseRow {
  id: string;
  user_id?: string | null;
  student_name: string;
  phone_whatsapp?: string | null;
  course_title: ChurchCourseTitle;
  teacher_name: string;
  start_date: string;
  completed_lessons: number;
  total_lessons: number;
  status: ChurchCourseStudent['status'];
  notes?: string | null;
}

const mapCourseFromDb = (row: DbCourseRow): ChurchCourseStudent => ({
  id: row.id,
  userId: row.user_id ?? undefined,
  studentName: row.student_name,
  phoneWhatsApp: row.phone_whatsapp ?? '',
  courseTitle: row.course_title,
  teacherName: row.teacher_name,
  startDate: row.start_date,
  completedLessons: Number(row.completed_lessons ?? 0),
  totalLessons: Number(row.total_lessons ?? 1),
  status: row.status,
  notes: row.notes ?? undefined,
});

export const getStoredCourses = (fallback: ChurchCourseStudent[] = []): ChurchCourseStudent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_COURSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage read error
  }
  return fallback;
};

export const saveStoredCourses = (list: ChurchCourseStudent[]): void => {
  try {
    localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(list));
    emitUpdateEvent('manancial-courses-updated');
  } catch {
    // ignore storage write error
  }
};

export async function fetchChurchCourses(
  fallback: ChurchCourseStudent[] = []
): Promise<SyncResult<ChurchCourseStudent[]>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: getStoredCourses(fallback), syncedRemote: false };
  }

  try {
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      return { data: getStoredCourses(fallback), syncedRemote: false };
    }

    const { data, error } = await client
      .from('church_courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: getStoredCourses(fallback), syncedRemote: false, error: extractErrorMessage(error) };
    }

    const mapped = ((data ?? []) as DbCourseRow[]).map(mapCourseFromDb);
    saveStoredCourses(mapped);
    return { data: mapped, syncedRemote: true };
  } catch (err) {
    return { data: getStoredCourses(fallback), syncedRemote: false, error: extractErrorMessage(err) };
  }
}

export async function saveChurchCourse(
  student: Omit<ChurchCourseStudent, 'id'> & { id?: string },
  isEdit: boolean
): Promise<SyncResult<ChurchCourseStudent>> {
  const id = student.id || createRecordId('crs');
  const fullItem: ChurchCourseStudent = { ...student, id };
  const client = getSupabaseClient();

  if (!client) {
    const current = getStoredCourses();
    const updated = isEdit ? current.map((s) => (s.id === id ? fullItem : s)) : [fullItem, ...current];
    saveStoredCourses(updated);
    return { data: fullItem, syncedRemote: false };
  }

  try {
    const {
      data: { session },
    } = await client.auth.getSession();

    const dbPayload = {
      student_name: student.studentName.trim(),
      phone_whatsapp: student.phoneWhatsApp.trim(),
      course_title: student.courseTitle,
      teacher_name: student.teacherName.trim() || 'Pr. Adenilson Freitas',
      start_date: student.startDate,
      completed_lessons: Number(student.completedLessons) || 0,
      total_lessons: Number(student.totalLessons) || 1,
      status: student.status,
      notes: student.notes?.trim() || null,
    };

    const { data, error } = isEdit
      ? await client.from('church_courses').update(dbPayload).eq('id', id).select('*').single()
      : await client
          .from('church_courses')
          .insert({ id, user_id: session?.user?.id ?? null, ...dbPayload })
          .select('*')
          .single();

    if (error) {
      return { data: fullItem, syncedRemote: false, error: extractErrorMessage(error) };
    }

    const mapped = mapCourseFromDb(data as DbCourseRow);
    const current = getStoredCourses();
    const updated = isEdit
      ? current.map((s) => (s.id === mapped.id ? mapped : s))
      : [mapped, ...current.filter((s) => s.id !== mapped.id)];
    saveStoredCourses(updated);
    return { data: mapped, syncedRemote: true };
  } catch (err) {
    return { data: fullItem, syncedRemote: false, error: extractErrorMessage(err) };
  }
}

export async function deleteChurchCourse(id: string): Promise<SyncResult<void>> {
  const client = getSupabaseClient();
  if (!client) {
    saveStoredCourses(getStoredCourses().filter((s) => s.id !== id));
    return { data: undefined, syncedRemote: false };
  }

  try {
    const { error } = await client.from('church_courses').delete().eq('id', id);
    if (error) {
      return { data: undefined, syncedRemote: false, error: extractErrorMessage(error) };
    }
    saveStoredCourses(getStoredCourses().filter((s) => s.id !== id));
    return { data: undefined, syncedRemote: true };
  } catch (err) {
    return { data: undefined, syncedRemote: false, error: extractErrorMessage(err) };
  }
}
