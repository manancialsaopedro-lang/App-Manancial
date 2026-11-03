// ==============================================================================
// TYPES: GESTÃO ECLESIÁSTICA - IGREJA EVANGÉLICA MANANCIAL
// ==============================================================================

export type ChurchRole = 
  | 'Pastor'
  | 'Presbítero'
  | 'Diácono'
  | 'Líder'
  | 'Membro'
  | 'Congregado'
  | 'Visitante';

export type ChurchMinistry = 
  | 'Louvor'
  | 'Recepção'
  | 'Infantil'
  | 'Mídia & Som'
  | 'Intercessão'
  | 'Diaconia'
  | 'Jovens'
  | 'Nenhum';

export type ChurchMemberStatus = 
  | 'Ativo'
  | 'Em Observação'
  | 'Afastado';

export interface ChurchMember {
  id: string;
  fullName: string;
  phoneWhatsApp: string;
  email?: string;
  birthDate?: string; // YYYY-MM-DD
  baptismDate?: string; // YYYY-MM-DD
  role: ChurchRole;
  ministry: ChurchMinistry;
  status: ChurchMemberStatus;
  address?: string;
  avatarUrl?: string;
  pastoralNotes?: string;
  consecutiveAbsences?: number; // Calculado dinamicamente
  lastAttendanceDate?: string;
  createdAt: string;
  registrationStatus?: 'PENDENTE' | 'CONCLUIDO';
  inviteToken?: string;
  familyGroupId?: string;
  // Campos unificados do Ministério de Louvor
  isWorshipMember?: boolean;
  worshipDisplayName?: string;
  worshipRole?: string;
  worshipCategory?: string;
  isWorshipLeader?: boolean;
  worshipTeamId?: string;
}

export interface ChurchService {
  id: string;
  title: string;
  dayOfWeek: string;
  defaultTime: string;
  description?: string;
  isActive: boolean;
}

export interface ChurchServiceSession {
  id: string;
  serviceId: string;
  sessionDate: string; // YYYY-MM-DD
  theme?: string;
  preacher?: string;
  attendancesCount?: number;
}

export interface ChurchAttendance {
  id: string;
  sessionId: string;
  memberId: string;
  checkedInAt: string;
  checkinMethod: 'Portaria' | 'WhatsApp' | 'QR Code' | 'Líder';
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: 'Aniversário' | 'Ausência' | 'Boas-Vindas' | 'Lembrete';
  messageBody: string;
}

export interface PastoralAlert {
  id: string;
  memberId: string;
  memberName: string;
  phoneWhatsApp: string;
  avatarUrl?: string;
  type: 'aniversario' | 'ausencia' | 'visitante';
  title: string;
  description: string;
  date?: string;
  consecutiveAbsences?: number;
}
