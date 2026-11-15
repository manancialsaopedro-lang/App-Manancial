import { getSupabaseClient } from '../../../supabaseClient';
import { SyncResult } from './churchModulesApi';

export type SiteGallerySectionKey =
  | 'quem-somos'
  | 'grupo-jovens'
  | 'ministerio-familia'
  | 'ministerio-infantil'
  | 'mercado-solidario'
  | 'vigilia'
  | 'manha-com-deus'
  | 'evangelismo'
  | 'acamp-manancial'
  | 'dia-da-familia'
  | 'cursos-discipulado';

export interface SiteGallerySectionMeta {
  key: SiteGallerySectionKey;
  label: string;
  shortLabel: string;
  description: string;
  badgeColor: string;
}

export const SITE_GALLERY_SECTIONS: SiteGallerySectionMeta[] = [
  {
    key: 'quem-somos',
    label: 'Quem Somos & Nossa História',
    shortLabel: 'Quem Somos',
    description: 'Fotos históricas da fundação, templo sede e celebrações da família Manancial.',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  },
  {
    key: 'grupo-jovens',
    label: 'Nosso Grupo de Jovens',
    shortLabel: 'Grupo Jovens',
    description: 'Cultos de jovens, encontros, conferências, comunhão e eventos anteriores da juventude.',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  {
    key: 'ministerio-familia',
    label: 'Ministério da Família (Casais & Pais)',
    shortLabel: 'Min. da Família',
    description: 'Curso de Casais, Curso de Pais, jantares de aliança e encontros de lares.',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  {
    key: 'ministerio-infantil',
    label: 'Ministério Infantil',
    shortLabel: 'Min. Infantil',
    description: 'Espaço Kids, ensino bíblico criativo, cultos infantis e atividades com as crianças.',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  {
    key: 'mercado-solidario',
    label: 'Assistência Social & Mercado Solidário',
    shortLabel: 'Mercado Solidário',
    description: 'Ações diaconais, arrecadação, cestas de amor e atendimento digno às famílias.',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  {
    key: 'acamp-manancial',
    label: 'Acamp Manancial',
    shortLabel: 'Acamp Manancial',
    description: 'Retiro espiritual de Carnaval, Gincana das Tribos (Salmos 25:14), batismos e lazer.',
    badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  {
    key: 'vigilia',
    label: 'Vigília no Altar',
    shortLabel: 'Vigília',
    description: 'Madrugadas de clamor, intercessão profética pelas famílias e busca pelo Espírito Santo.',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
  {
    key: 'manha-com-deus',
    label: 'Manhã com Deus',
    shortLabel: 'Manhã com Deus',
    description: 'Domingos especiais de consagração matinal, Santa Ceia, Palavra e comunhão.',
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  },
  {
    key: 'evangelismo',
    label: 'Evangelismo & Missões',
    shortLabel: 'Evangelismo',
    description: 'Mobilizações nas praças e bairros de São Pedro levando a mensagem de salvação.',
    badgeColor: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
  },
  {
    key: 'dia-da-familia',
    label: 'Dia da Família',
    shortLabel: 'Dia da Família',
    description: 'Grande celebração anual unindo pais, filhos e gerações em comunhão e alegria.',
    badgeColor: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  },
  {
    key: 'cursos-discipulado',
    label: 'Nossos Cursos & Formação',
    shortLabel: 'Nossos Cursos',
    description: 'Aulas de Teologia, Batismo nas Águas, Novos Convertidos, Curso de Casais e Curso de Pais.',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
];

export type ChurchEventCategory =
  | 'Acamp Manancial'
  | 'Vigília'
  | 'Manhã com Deus'
  | 'Evangelismo'
  | 'Dia da Família'
  | 'Ministério da Família'
  | 'Grupo Jovens'
  | 'Ministério Infantil'
  | 'Mercado Solidário'
  | 'Culto Especial'
  | 'Conferência';

export interface ChurchEventRecord {
  id: string;
  title: string;
  category: ChurchEventCategory | string;
  eventDate: string; // YYYY-MM-DD
  eventTime: string;
  location: string;
  description: string;
  targetAudience: string;
  registeredCount: number;
  capacity?: number;
  directLink?: string;
  bannerColor: string;
  badgeText?: string;
  gallerySlug?: SiteGallerySectionKey;
  coverImageUrl?: string;
  photosUrl?: string;
  isUpcoming: boolean;
  isFeatured: boolean;
}

export interface ChurchSitePhotoRecord {
  id: string;
  sectionKey: SiteGallerySectionKey;
  eventId?: string;
  title: string;
  caption: string;
  categoryTag: string;
  imageUrl: string;
  storagePath?: string;
  eventDateLabel: string;
  isFeatured: boolean;
  sortOrder: number;
  uploadedBy?: string;
  createdAt?: string;
}

export const STORAGE_SITE_EVENTS_KEY = 'manancial_church_site_events_v2';
export const STORAGE_SITE_PHOTOS_KEY = 'manancial_church_site_photos_v2';

export const DEFAULT_SITE_EVENTS: ChurchEventRecord[] = [
  {
    id: 'ev-acampamento-2027',
    title: 'Acamp Manancial 2027 — Temporada 25:14',
    category: 'Acamp Manancial',
    eventDate: '2027-02-05',
    eventTime: 'Saída às 06:00 (05 a 09/02)',
    location: 'Estância São Pedro - SP',
    description:
      'Cinco dias inesquecíveis de ministração da Palavra, adoração, comunhão nas tribos, gincana bíblica 25:14 e lazer completo para toda a família.',
    targetAudience: 'Toda a Igreja, Jovens & Famílias',
    registeredCount: 148,
    capacity: 200,
    directLink: '/acampamento',
    bannerColor: 'from-amber-600 via-orange-600 to-amber-800',
    badgeText: 'Inscrições Abertas',
    gallerySlug: 'acamp-manancial',
    coverImageUrl: '/acampamento-2027.jpg',
    isUpcoming: true,
    isFeatured: true,
  },
  {
    id: 'ev-vigilia-clamor',
    title: 'Vigília Rompendo em Fé & Clamor no Altar',
    category: 'Vigília',
    eventDate: '2026-11-27',
    eventTime: '23:00 às 04:30',
    location: 'Templo Sede Manancial • São Pedro - SP',
    description:
      'Uma madrugada inteira consagrada ao clamor pelas famílias, adoração espontânea, intercessão profética e renovo do Espírito Santo.',
    targetAudience: 'Toda a Igreja, Jovens e Intercessores',
    registeredCount: 92,
    capacity: 180,
    bannerColor: 'from-indigo-950 via-slate-900 to-cyan-950',
    badgeText: 'Toda Última Sexta',
    gallerySlug: 'vigilia',
    coverImageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    isUpcoming: true,
    isFeatured: true,
  },
  {
    id: 'ev-manha-com-deus',
    title: 'Manhã com Deus & Consagração Familiar',
    category: 'Manhã com Deus',
    eventDate: '2026-12-06',
    eventTime: '08:00 às 11:30',
    location: 'Templo Sede Manancial • São Pedro - SP',
    description:
      'Manhã especial de busca, Santa Ceia, louvor congregacional, oração pelos enfermos e mesa de comunhão fraterna entre os irmãos.',
    targetAudience: 'Famílias, Membros e Visitantes',
    registeredCount: 110,
    capacity: 200,
    bannerColor: 'from-cyan-700 via-teal-700 to-[#082f38]',
    badgeText: 'Comunhão & Altar',
    gallerySlug: 'manha-com-deus',
    coverImageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    isUpcoming: true,
    isFeatured: false,
  },
  {
    id: 'ev-evangelismo-impacto',
    title: 'Evangelismo nas Ruas & Ação de Amor',
    category: 'Evangelismo',
    eventDate: '2026-12-12',
    eventTime: '09:00 às 12:30',
    location: 'Praça Central & Bairros de São Pedro - SP',
    description:
      'Mobilização missionária levando a mensagem do Evangelho, oração nas praças, acolhimento às famílias e apoio através do Mercado Solidário.',
    targetAudience: 'Jovens, Obreiros e Voluntários',
    registeredCount: 64,
    capacity: 120,
    bannerColor: 'from-emerald-700 via-teal-800 to-cyan-900',
    badgeText: 'Missão Urbana',
    gallerySlug: 'evangelismo',
    coverImageUrl: '/assets/images/manancial_camp_gathering_1794615447967.jpg',
    isUpcoming: true,
    isFeatured: false,
  },
  {
    id: 'ev-dia-da-familia',
    title: 'Dia da Família Manancial',
    category: 'Dia da Família',
    eventDate: '2026-12-20',
    eventTime: '09:30 às 17:00',
    location: 'Espaço de Eventos Manancial • São Pedro - SP',
    description:
      'Um dia inteiro dedicado à celebração dos lares: palavra para casais e pais, recreação do Ministério Infantil, almoço em comunhão e louvor ao ar livre.',
    targetAudience: 'Casais, Pais, Filhos e Visitantes',
    registeredCount: 165,
    capacity: 250,
    bannerColor: 'from-rose-600 via-pink-700 to-amber-700',
    badgeText: 'Celebração dos Lares',
    gallerySlug: 'dia-da-familia',
    coverImageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    isUpcoming: true,
    isFeatured: true,
  },
  {
    id: 'ev-passado-acamp-2026',
    title: 'Acamp Manancial 2026 — Edição Histórica',
    category: 'Acamp Manancial',
    eventDate: '2026-02-14',
    eventTime: 'Realizado em Fevereiro de 2026',
    location: 'Estância São Pedro - SP',
    description:
      'Mais de 160 acampantes reunidos em dias sobrenaturais de batismo no Espírito Santo, união entre as gerações e gincana das tribos.',
    targetAudience: 'Toda a Igreja',
    registeredCount: 164,
    capacity: 164,
    directLink: '/acampamento',
    bannerColor: 'from-slate-800 via-[#082f38] to-cyan-950',
    badgeText: 'Evento Realizado',
    gallerySlug: 'acamp-manancial',
    coverImageUrl: '/assets/images/manancial_camp_gathering_1794615447967.jpg',
    isUpcoming: false,
    isFeatured: false,
  },
  {
    id: 'ev-passado-encontro-casais',
    title: 'Encontro de Casais & Jantar Aliança',
    category: 'Ministério da Família',
    eventDate: '2026-08-22',
    eventTime: 'Realizado em Agosto de 2026',
    location: 'Auditório Manancial • São Pedro - SP',
    description:
      'Noite memorável de renovação de votos, ministração para os lares e formatura das turmas do Curso de Casais e Curso de Pais.',
    targetAudience: 'Casais da Igreja e Convidados',
    registeredCount: 96,
    capacity: 100,
    bannerColor: 'from-rose-900 via-slate-900 to-purple-950',
    badgeText: 'Evento Realizado',
    gallerySlug: 'ministerio-familia',
    coverImageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    isUpcoming: false,
    isFeatured: false,
  },
  {
    id: 'ev-passado-conferencia-jovens',
    title: 'Conferência Grupo Jovens — Geração Eleita',
    category: 'Grupo Jovens',
    eventDate: '2026-09-19',
    eventTime: 'Realizado em Setembro de 2026',
    location: 'Templo Sede Manancial • São Pedro - SP',
    description:
      'Louvor intenso, palavra viva sobre santidade e vocação, testemunhos impactantes e integração da juventude Manancial.',
    targetAudience: 'Jovens e Adolescentes',
    registeredCount: 135,
    capacity: 150,
    bannerColor: 'from-cyan-900 via-blue-950 to-slate-950',
    badgeText: 'Evento Realizado',
    gallerySlug: 'grupo-jovens',
    coverImageUrl: '/assets/images/manancial_camp_gathering_1794615447967.jpg',
    isUpcoming: false,
    isFeatured: false,
  },
];

export const DEFAULT_SITE_PHOTOS: ChurchSitePhotoRecord[] = [
  {
    id: 'ph-historia-1',
    sectionKey: 'quem-somos',
    title: 'Nossa Família Reunida em Adoração',
    caption: 'Culto de celebração e comunhão no templo sede em São Pedro - SP.',
    categoryTag: 'Nossa História',
    imageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    eventDateLabel: 'Templo Sede Manancial',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-jovens-1',
    sectionKey: 'grupo-jovens',
    eventId: 'ev-passado-conferencia-jovens',
    title: 'Juventude Manancial em Clamor',
    caption: 'Nossos jovens unidos em adoração, discipulado e amizade verdadeira.',
    categoryTag: 'Grupo Jovens',
    imageUrl: '/assets/images/manancial_camp_gathering_1794615447967.jpg',
    eventDateLabel: 'Setembro 2026',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-familia-1',
    sectionKey: 'ministerio-familia',
    eventId: 'ev-passado-encontro-casais',
    title: 'Aliança nos Lares & Curso de Casais',
    caption: 'Edificando casamentos e preparando pais segundo o coração de Deus.',
    categoryTag: 'Ministério da Família',
    imageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    eventDateLabel: 'Agosto 2026',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-infantil-1',
    sectionKey: 'ministerio-infantil',
    title: 'Crianças Aprendendo a Palavra com Alegria',
    caption: 'Espaço preparado com amor, segurança e ensino bíblico criativo para cada faixa etária.',
    categoryTag: 'Ministério Infantil',
    imageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    eventDateLabel: 'Domingos & Cultos',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-social-1',
    sectionKey: 'mercado-solidario',
    eventId: 'ev-evangelismo-impacto',
    title: 'Assistência Social & Mercado Solidário',
    caption: 'Amor prático que acolhe famílias com dignidade, alimentos e cuidado pastoral.',
    categoryTag: 'Mercado Solidário',
    imageUrl: '/assets/images/manancial_camp_gathering_1794615447967.jpg',
    eventDateLabel: 'Ação Contínua',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-acamp-1',
    sectionKey: 'acamp-manancial',
    eventId: 'ev-acampamento-2027',
    title: 'Acamp Manancial — Temporada 25:14',
    caption: 'Momentos inesquecíveis de comunhão, gincana das tribos e renovo espiritual.',
    categoryTag: 'Acamp Manancial',
    imageUrl: '/acampamento-2027.jpg',
    eventDateLabel: 'Fevereiro 2026 / 2027',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-acamp-2',
    sectionKey: 'acamp-manancial',
    eventId: 'ev-passado-acamp-2026',
    title: 'Celebração das Tribos no Retiro',
    caption: 'União de todas as idades durante o retiro espiritual em São Pedro.',
    categoryTag: 'Acamp Manancial',
    imageUrl: '/assets/images/manancial_camp_gathering_1794615447967.jpg',
    eventDateLabel: 'Fevereiro 2026',
    isFeatured: false,
    sortOrder: 2,
  },
  {
    id: 'ph-vigilia-1',
    sectionKey: 'vigilia',
    eventId: 'ev-vigilia-clamor',
    title: 'Noite de Vigília e Intercessão',
    caption: 'Igreja reunida em clamor pelas famílias e avivamento espiritual.',
    categoryTag: 'Vigília',
    imageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    eventDateLabel: 'Mensal',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-manha-1',
    sectionKey: 'manha-com-deus',
    eventId: 'ev-manha-com-deus',
    title: 'Manhã com Deus no Templo',
    caption: 'Consagração matinal, estudo da Palavra e comunhão à mesa.',
    categoryTag: 'Manhã com Deus',
    imageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    eventDateLabel: 'Domingos Especiais',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-evangelismo-1',
    sectionKey: 'evangelismo',
    eventId: 'ev-evangelismo-impacto',
    title: 'Evangelismo & Missão nas Ruas',
    caption: 'Levando esperança, oração e o amor de Cristo a cada lar de nossa cidade.',
    categoryTag: 'Evangelismo',
    imageUrl: '/assets/images/manancial_camp_gathering_1794615447967.jpg',
    eventDateLabel: 'Ação Evangelística',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    id: 'ph-dia-familia-1',
    sectionKey: 'dia-da-familia',
    eventId: 'ev-dia-da-familia',
    title: 'Celebração do Dia da Família',
    caption: 'Pais, filhos e gerações adorando juntos na Casa do Senhor.',
    categoryTag: 'Dia da Família',
    imageUrl: '/assets/images/manancial_church_community_1794615448217.jpg',
    eventDateLabel: 'Evento Anual',
    isFeatured: true,
    sortOrder: 1,
  },
];

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const emitSiteEvent = (eventName: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName));
  }
};

// ============================================================================
// CHURCH EVENTS (Próximos Eventos & Eventos Anteriores Sincronizados)
// ============================================================================

interface DbEventRow {
  id: string;
  title: string;
  category?: string | null;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  description?: string | null;
  target_audience?: string | null;
  registered_count?: number | null;
  capacity?: number | null;
  direct_link?: string | null;
  banner_color?: string | null;
  badge_text?: string | null;
  gallery_slug?: string | null;
  cover_image_url?: string | null;
  photos_url?: string | null;
  is_upcoming?: boolean | null;
  is_featured?: boolean | null;
}

const mapEventFromDb = (row: DbEventRow): ChurchEventRecord => ({
  id: row.id,
  title: row.title,
  category: row.category || 'Celebração',
  eventDate: row.event_date,
  eventTime: row.event_time || '19:30',
  location: row.location || 'Templo Sede Manancial • São Pedro - SP',
  description: row.description || '',
  targetAudience: row.target_audience || 'Toda a Igreja & Família',
  registeredCount: Number(row.registered_count ?? 0),
  capacity: row.capacity ? Number(row.capacity) : undefined,
  directLink: row.direct_link ?? undefined,
  bannerColor: row.banner_color || 'from-[#082f38] to-[#0e4b57]',
  badgeText: row.badge_text ?? undefined,
  gallerySlug: (row.gallery_slug as SiteGallerySectionKey) ?? undefined,
  coverImageUrl: row.cover_image_url ?? undefined,
  photosUrl: row.photos_url ?? undefined,
  isUpcoming: row.is_upcoming ?? true,
  isFeatured: row.is_featured ?? false,
});

export function getStoredSiteEvents(fallback: ChurchEventRecord[] = DEFAULT_SITE_EVENTS): ChurchEventRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_SITE_EVENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage read error
  }
  return fallback;
}

export function saveStoredSiteEvents(events: ChurchEventRecord[]): void {
  try {
    localStorage.setItem(STORAGE_SITE_EVENTS_KEY, JSON.stringify(events));
    emitSiteEvent('manancial-site-events-updated');
  } catch {
    // ignore storage write error
  }
}

export async function fetchChurchSiteEvents(): Promise<SyncResult<ChurchEventRecord[]>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: getStoredSiteEvents(), syncedRemote: false };
  }

  try {
    const { data, error } = await client
      .from('church_events')
      .select('*')
      .not('id', 'like', 'worship-%')
      .order('event_date', { ascending: true });

    if (error) {
      return { data: getStoredSiteEvents(), syncedRemote: false, error: error.message };
    }

    const mapped = ((data ?? []) as DbEventRow[]).map(mapEventFromDb);
    if (mapped.length === 0) {
      return { data: getStoredSiteEvents(), syncedRemote: true };
    }
    saveStoredSiteEvents(mapped);
    return { data: mapped, syncedRemote: true };
  } catch (err: any) {
    return {
      data: getStoredSiteEvents(),
      syncedRemote: false,
      error: err?.message || 'Erro ao buscar eventos.',
    };
  }
}

export async function upsertChurchSiteEvent(
  input: Omit<ChurchEventRecord, 'id'> & { id?: string }
): Promise<SyncResult<ChurchEventRecord>> {
  const id = input.id || createId('ev');
  const fullRecord: ChurchEventRecord = { ...input, id };

  const current = getStoredSiteEvents();
  const exists = current.some((e) => e.id === id);
  const nextLocal = exists ? current.map((e) => (e.id === id ? fullRecord : e)) : [fullRecord, ...current];
  saveStoredSiteEvents(nextLocal);

  const client = getSupabaseClient();
  if (!client) {
    return { data: fullRecord, syncedRemote: false };
  }

  const dbRow = {
    id,
    title: fullRecord.title.trim(),
    category: fullRecord.category,
    event_date: fullRecord.eventDate,
    event_time: fullRecord.eventTime.trim(),
    location: fullRecord.location.trim(),
    description: fullRecord.description.trim(),
    target_audience: fullRecord.targetAudience.trim(),
    registered_count: Number(fullRecord.registeredCount) || 0,
    capacity: fullRecord.capacity ? Number(fullRecord.capacity) : null,
    direct_link: fullRecord.directLink?.trim() || null,
    banner_color: fullRecord.bannerColor,
    badge_text: fullRecord.badgeText?.trim() || null,
    gallery_slug: fullRecord.gallerySlug || null,
    cover_image_url: fullRecord.coverImageUrl?.trim() || null,
    photos_url: fullRecord.photosUrl?.trim() || null,
    is_upcoming: Boolean(fullRecord.isUpcoming),
    is_featured: Boolean(fullRecord.isFeatured),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await client
      .from('church_events')
      .upsert(dbRow, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      return { data: fullRecord, syncedRemote: false, error: error.message };
    }

    const mapped = mapEventFromDb(data as DbEventRow);
    const updatedList = getStoredSiteEvents().map((e) => (e.id === mapped.id ? mapped : e));
    saveStoredSiteEvents(updatedList);
    return { data: mapped, syncedRemote: true };
  } catch (err: any) {
    return { data: fullRecord, syncedRemote: false, error: err?.message || 'Erro ao salvar evento.' };
  }
}

export async function deleteChurchSiteEvent(id: string): Promise<SyncResult<void>> {
  const nextLocal = getStoredSiteEvents().filter((e) => e.id !== id);
  saveStoredSiteEvents(nextLocal);

  const client = getSupabaseClient();
  if (!client) {
    return { data: undefined, syncedRemote: false };
  }

  try {
    const { error } = await client.from('church_events').delete().eq('id', id);
    if (error) {
      return { data: undefined, syncedRemote: false, error: error.message };
    }
    return { data: undefined, syncedRemote: true };
  } catch (err: any) {
    return { data: undefined, syncedRemote: false, error: err?.message || 'Erro ao excluir evento.' };
  }
}

// ============================================================================
// CHURCH SITE PHOTOS (Galeria por Iniciativa, Ministério e Eventos)
// ============================================================================

interface DbPhotoRow {
  id: string;
  section_key: string;
  event_id?: string | null;
  title: string;
  caption?: string | null;
  category_tag?: string | null;
  image_url: string;
  storage_path?: string | null;
  event_date_label?: string | null;
  is_featured?: boolean | null;
  sort_order?: number | null;
  uploaded_by?: string | null;
  created_at?: string | null;
}

const mapPhotoFromDb = (row: DbPhotoRow): ChurchSitePhotoRecord => ({
  id: row.id,
  sectionKey: (row.section_key as SiteGallerySectionKey) || 'quem-somos',
  eventId: row.event_id ?? undefined,
  title: row.title,
  caption: row.caption || '',
  categoryTag: row.category_tag || '',
  imageUrl: row.image_url,
  storagePath: row.storage_path ?? undefined,
  eventDateLabel: row.event_date_label || '',
  isFeatured: Boolean(row.is_featured),
  sortOrder: Number(row.sort_order ?? 0),
  uploadedBy: row.uploaded_by ?? undefined,
  createdAt: row.created_at ?? undefined,
});

export function getStoredSitePhotos(fallback: ChurchSitePhotoRecord[] = DEFAULT_SITE_PHOTOS): ChurchSitePhotoRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_SITE_PHOTOS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return fallback;
}

export function saveStoredSitePhotos(photos: ChurchSitePhotoRecord[]): void {
  try {
    localStorage.setItem(STORAGE_SITE_PHOTOS_KEY, JSON.stringify(photos));
    emitSiteEvent('manancial-site-photos-updated');
  } catch {
    // ignore
  }
}

export async function fetchChurchSitePhotos(): Promise<SyncResult<ChurchSitePhotoRecord[]>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: getStoredSitePhotos(), syncedRemote: false };
  }

  try {
    const { data, error } = await client
      .from('church_site_photos')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: getStoredSitePhotos(), syncedRemote: false, error: error.message };
    }

    const mapped = ((data ?? []) as DbPhotoRow[]).map(mapPhotoFromDb);
    if (mapped.length === 0) {
      return { data: getStoredSitePhotos(), syncedRemote: true };
    }
    saveStoredSitePhotos(mapped);
    return { data: mapped, syncedRemote: true };
  } catch (err: any) {
    return {
      data: getStoredSitePhotos(),
      syncedRemote: false,
      error: err?.message || 'Erro ao carregar galeria de fotos.',
    };
  }
}

/**
 * Faz upload de um arquivo de imagem para o bucket `church-media` no Supabase Storage
 * (com fallback seguro em DataURL se offline) e retorna a URL pública.
 */
export async function uploadChurchMediaFile(
  file: File,
  sectionKey: SiteGallerySectionKey
): Promise<{ publicUrl: string; storagePath?: string; syncedRemote: boolean; error?: string }> {
  const client = getSupabaseClient();

  const readAsDataUrl = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler imagem local.'));
      reader.readAsDataURL(f);
    });

  if (!client) {
    const dataUrl = await readAsDataUrl(file);
    return { publicUrl: dataUrl, syncedRemote: false };
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .slice(0, 40);
  const storagePath = `${sectionKey}/${Date.now()}-${safeName || 'foto'}.${ext || 'jpg'}`;

  try {
    const { error: uploadErr } = await client.storage
      .from('church-media')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (uploadErr) {
      const fallbackUrl = await readAsDataUrl(file);
      return { publicUrl: fallbackUrl, syncedRemote: false, error: uploadErr.message };
    }

    const { data } = client.storage.from('church-media').getPublicUrl(storagePath);
    return {
      publicUrl: data.publicUrl,
      storagePath,
      syncedRemote: true,
    };
  } catch (err: any) {
    const fallbackUrl = await readAsDataUrl(file);
    return {
      publicUrl: fallbackUrl,
      syncedRemote: false,
      error: err?.message || 'Erro no upload para o Storage.',
    };
  }
}

export async function createChurchSitePhoto(
  input: Omit<ChurchSitePhotoRecord, 'id'> & { id?: string }
): Promise<SyncResult<ChurchSitePhotoRecord>> {
  const id = input.id || createId('ph');
  const fullPhoto: ChurchSitePhotoRecord = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };

  const current = getStoredSitePhotos();
  saveStoredSitePhotos([fullPhoto, ...current.filter((p) => p.id !== id)]);

  const client = getSupabaseClient();
  if (!client) {
    return { data: fullPhoto, syncedRemote: false };
  }

  const dbRow = {
    id,
    section_key: fullPhoto.sectionKey,
    event_id: fullPhoto.eventId || null,
    title: fullPhoto.title.trim(),
    caption: fullPhoto.caption.trim(),
    category_tag: fullPhoto.categoryTag.trim(),
    image_url: fullPhoto.imageUrl,
    storage_path: fullPhoto.storagePath || null,
    event_date_label: fullPhoto.eventDateLabel.trim(),
    is_featured: Boolean(fullPhoto.isFeatured),
    sort_order: Number(fullPhoto.sortOrder) || 0,
    uploaded_by: fullPhoto.uploadedBy || 'Portal Gerencial',
  };

  try {
    const { data, error } = await client
      .from('church_site_photos')
      .upsert(dbRow, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      return { data: fullPhoto, syncedRemote: false, error: error.message };
    }

    const mapped = mapPhotoFromDb(data as DbPhotoRow);
    const updated = [mapped, ...getStoredSitePhotos().filter((p) => p.id !== mapped.id)];
    saveStoredSitePhotos(updated);
    return { data: mapped, syncedRemote: true };
  } catch (err: any) {
    return { data: fullPhoto, syncedRemote: false, error: err?.message || 'Erro ao salvar foto.' };
  }
}

export async function deleteChurchSitePhoto(photo: ChurchSitePhotoRecord): Promise<SyncResult<void>> {
  const nextLocal = getStoredSitePhotos().filter((p) => p.id !== photo.id);
  saveStoredSitePhotos(nextLocal);

  const client = getSupabaseClient();
  if (!client) {
    return { data: undefined, syncedRemote: false };
  }

  try {
    if (photo.storagePath) {
      await client.storage.from('church-media').remove([photo.storagePath]).catch(() => null);
    }
    const { error } = await client.from('church_site_photos').delete().eq('id', photo.id);
    if (error) {
      return { data: undefined, syncedRemote: false, error: error.message };
    }
    return { data: undefined, syncedRemote: true };
  } catch (err: any) {
    return { data: undefined, syncedRemote: false, error: err?.message || 'Erro ao remover foto.' };
  }
}
