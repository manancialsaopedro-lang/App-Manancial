import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../../supabaseClient';

/** Dias e horários fixos de culto (tabela `church_weekly_services`). */
export interface WeeklyService {
  id: string;
  /** 0 = Domingo ... 6 = Sábado */
  dayOfWeek: number;
  /** Formato HH:MM */
  time: string;
  title: string;
  tag?: string;
  /** Culto de ensino — onde acontece o Curso de Teologia */
  isTeaching: boolean;
}

export const WEEKDAY_LABELS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

export const TEACHING_SERVICE_NOTE = 'Curso de Teologia';

/** Fallback offline / sem Supabase. Mantido igual ao seed do banco. */
export const DEFAULT_WEEKLY_SERVICES: WeeklyService[] = [
  { id: 'default-dom', dayOfWeek: 0, time: '19:00', title: 'Culto da Família', tag: 'Culto da Família', isTeaching: false },
  { id: 'default-seg', dayOfWeek: 1, time: '19:30', title: 'Tarde da Bênção', tag: 'Tarde da Bênção', isTeaching: false },
  { id: 'default-ter', dayOfWeek: 2, time: '08:00', title: 'Culto de Ensino', tag: TEACHING_SERVICE_NOTE, isTeaching: true },
  { id: 'default-qui', dayOfWeek: 4, time: '19:30', title: 'Culto de Adoração', tag: 'Adoração', isTeaching: false },
];

interface WeeklyServiceRow {
  id: string;
  day_of_week: number;
  start_time: string;
  title: string;
  tag: string | null;
  is_teaching: boolean;
}

const mapRow = (row: WeeklyServiceRow): WeeklyService => ({
  id: row.id,
  dayOfWeek: row.day_of_week,
  time: String(row.start_time).slice(0, 5),
  title: row.title,
  tag: row.tag ?? undefined,
  isTeaching: row.is_teaching,
});

export async function fetchWeeklyServices(): Promise<WeeklyService[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase não configurado.');

  const { data, error } = await client
    .from('church_weekly_services')
    .select('id, day_of_week, start_time, title, tag, is_teaching')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data as WeeklyServiceRow[]).map(mapRow);
}

/** Substitui toda a programação (exige permissão de programação no RLS). */
export async function saveWeeklyServices(items: WeeklyService[]): Promise<WeeklyService[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase não configurado.');

  const payload = items.map((item, index) => ({
    day_of_week: item.dayOfWeek,
    start_time: item.time,
    title: item.title.trim(),
    tag: item.tag?.trim() || null,
    is_teaching: item.isTeaching,
    is_active: true,
    sort_order: index + 1,
  }));

  const { error: deleteError } = await client
    .from('church_weekly_services')
    .delete()
    .not('id', 'is', null);
  if (deleteError) throw deleteError;

  if (payload.length === 0) return [];

  const { data, error } = await client
    .from('church_weekly_services')
    .insert(payload)
    .select('id, day_of_week, start_time, title, tag, is_teaching');
  if (error) throw error;
  return (data as WeeklyServiceRow[]).map(mapRow);
}

export const sortWeeklyServices = (items: WeeklyService[]): WeeklyService[] =>
  [...items].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.time.localeCompare(b.time));

/**
 * Carrega a programação semanal do Supabase.
 * Começa com o fallback para não "piscar" a tela; `error` indica que o
 * fallback está sendo exibido porque a leitura do banco falhou.
 */
export function useWeeklyServices() {
  const [services, setServices] = useState<WeeklyService[]>(DEFAULT_WEEKLY_SERVICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchWeeklyServices()
      .then((items) => {
        if (!active) return;
        setServices(items); // lista vazia é um estado válido (empty state)
        setError(false);
      })
      .catch((err) => {
        console.warn('Falha ao carregar dias de culto, usando padrão:', err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { services: sortWeeklyServices(services), loading, error };
}
