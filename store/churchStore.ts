import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { 
  ChurchMember, 
  ChurchRole,
  ChurchMinistry,
  ChurchService, 
  ChurchServiceSession, 
  ChurchAttendance, 
  WhatsAppTemplate, 
  PastoralAlert 
} from '../types/church';

// ==============================================================================
// BASE DE 29 MEMBROS PRÉ-CADASTRADOS (IGREJA EVANGÉLICA MANANCIAL)
// ==============================================================================
export const PRE_REGISTERED_MEMBERS: ChurchMember[] = [
  {
    id: 'm-arali-silva',
    fullName: 'Arali Silva',
    phoneWhatsApp: '19997518931',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_arali_99751',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-caio-augusto',
    fullName: 'Caio Augusto',
    phoneWhatsApp: '19993843839',
    role: 'Líder',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_caio_99384',
    familyGroupId: 'fam-correa',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-cristina',
    fullName: 'Cristina',
    phoneWhatsApp: '19998955334',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_cristina_99895',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-daiane-gomes',
    fullName: 'Daiane Gomes',
    phoneWhatsApp: '11970354945',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_daiane_70354',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-eliana-carrara',
    fullName: 'Eliana Sola Carrara',
    phoneWhatsApp: '19999627870',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_eliana_99962',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-enzo-gabriel',
    fullName: 'Enzo Gabriel',
    phoneWhatsApp: '19997130049',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_enzo_99713',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-fatima',
    fullName: 'Fátima',
    phoneWhatsApp: '19997444846',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_fatima_99744',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-franciele-moraes',
    fullName: 'Franciele Moraes',
    phoneWhatsApp: '19996241085',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_franciele_99624',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-gloria',
    fullName: 'Gloria',
    phoneWhatsApp: '19997795840',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_gloria_99779',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-jackson-luthero',
    fullName: 'Jackson Luthero',
    phoneWhatsApp: '19998423555',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_jackson_99842',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-juliana',
    fullName: 'Juliana',
    phoneWhatsApp: '19971525971',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_juliana_71525',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-luiz',
    fullName: 'Luiz',
    phoneWhatsApp: '19971133846',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_luiz_71133',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-milene-oliveira',
    fullName: 'Milene Oliveira',
    phoneWhatsApp: '19996090596',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_milene_99609',
    familyGroupId: 'fam-correa',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-nadir',
    fullName: 'Nadir',
    phoneWhatsApp: '19988276546',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_nadir_88276',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-nicoly',
    fullName: 'Nicoly',
    phoneWhatsApp: '19989553096',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_nicoly_89553',
    familyGroupId: 'fam-correa',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-paulo-braz',
    fullName: 'Paulo Braz',
    phoneWhatsApp: '19999165568',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_paulobraz_99916',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-paulo-smaniotto',
    fullName: 'Paulo Smaniotto (Paulinho)',
    phoneWhatsApp: '19998917842',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_paulinho_99891',
    familyGroupId: 'fam-smaniotto',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-pedro-smaniotto',
    fullName: 'Pedro Smaniotto',
    phoneWhatsApp: '19999298753',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_pedro_99929',
    familyGroupId: 'fam-smaniotto',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-regina-veiga',
    fullName: 'Regina Veiga',
    phoneWhatsApp: '19996962030',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_regina_99696',
    familyGroupId: 'fam-veiga',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-rodrigo-correa',
    fullName: 'Rodrigo Correa',
    phoneWhatsApp: '19996090594',
    role: 'Líder',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_rodrigo_99609',
    familyGroupId: 'fam-correa',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-rosana-madasqui',
    fullName: 'Rosana Madasqui',
    phoneWhatsApp: '19997410326',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_rosana_99741',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-sidney-veiga',
    fullName: 'Sidney Veiga',
    phoneWhatsApp: '19998425060',
    role: 'Presbítero',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_sidney_99842',
    familyGroupId: 'fam-veiga',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-silvia-smaniotto',
    fullName: 'Silvia Smaniotto',
    phoneWhatsApp: '19997920782',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_silvia_99792',
    familyGroupId: 'fam-smaniotto',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-sonia-gois',
    fullName: 'Sonia Maria Sanches Gois',
    phoneWhatsApp: '11984795577',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_sonia_84795',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-tania',
    fullName: 'Tânia',
    phoneWhatsApp: '19999941637',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_tania_99994',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-uliara',
    fullName: 'Uliara',
    phoneWhatsApp: '19998408531',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_uliara_99840',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-valeria',
    fullName: 'Valéria',
    phoneWhatsApp: '19996441659',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_valeria_99644',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-wellington-jr',
    fullName: 'Wellington Junior',
    phoneWhatsApp: '19971103993',
    role: 'Membro',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_wellington_71103',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  },
  {
    id: 'm-wilson',
    fullName: 'Wilson',
    phoneWhatsApp: '19981141000',
    role: 'Diácono',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'PENDENTE',
    inviteToken: 'tok_wilson_81141',
    consecutiveAbsences: 0,
    createdAt: '2026-11-01'
  }
];

// Liderança Pastoral Inicial
const INITIAL_LEADERSHIP: ChurchMember[] = [
  {
    id: 'm-pastor-carlos',
    fullName: 'Pastor Carlos Eduardo Santos',
    phoneWhatsApp: '11988887771',
    email: 'pastor.carlos@igrejamanancial.com.br',
    birthDate: '1978-04-12',
    baptismDate: '1995-10-15',
    role: 'Pastor',
    ministry: 'Nenhum',
    status: 'Ativo',
    registrationStatus: 'CONCLUIDO',
    address: 'Rua das Oliveiras, 120 - São Pedro',
    consecutiveAbsences: 0,
    lastAttendanceDate: '2026-10-25',
    createdAt: '2023-01-10'
  }
];

const INITIAL_MEMBERS: ChurchMember[] = [
  ...PRE_REGISTERED_MEMBERS,
  ...INITIAL_LEADERSHIP
];

const INITIAL_SERVICES: ChurchService[] = [
  {
    id: 's1',
    title: 'Culto da Família & Celebração',
    dayOfWeek: 'Domingo',
    defaultTime: '19:00',
    description: 'Culto principal de celebração com toda a igreja reunida',
    isActive: true
  },
  {
    id: 's2',
    title: 'Escola Bíblica & Santa Ceia',
    dayOfWeek: 'Domingo',
    defaultTime: '09:30',
    description: 'Edificação na Palavra e comunhão',
    isActive: true
  },
  {
    id: 's3',
    title: 'Culto de Doutrina e Oração',
    dayOfWeek: 'Quarta-Feira',
    defaultTime: '19:30',
    description: 'Estudo expositivo da Bíblia e clamor',
    isActive: true
  }
];

const INITIAL_SESSIONS: ChurchServiceSession[] = [
  {
    id: 'ses-last',
    serviceId: 's1',
    sessionDate: '2026-10-25',
    theme: 'O Segredo da Fidelidade',
    preacher: 'Pr. Carlos Eduardo',
    attendancesCount: 5
  },
  {
    id: 'ses-today',
    serviceId: 's1',
    sessionDate: '2026-11-01',
    theme: 'Vivendo em Aliança com Deus',
    preacher: 'Pr. Carlos Eduardo',
    attendancesCount: 2
  }
];

const INITIAL_ATTENDANCES: ChurchAttendance[] = [
  {
    id: 'att-1',
    sessionId: 'ses-last',
    memberId: 'm-sidney-veiga',
    checkedInAt: '2026-10-25T18:45:00Z',
    checkinMethod: 'Portaria'
  },
  {
    id: 'att-2',
    sessionId: 'ses-last',
    memberId: 'm-caio-augusto',
    checkedInAt: '2026-10-25T18:50:00Z',
    checkinMethod: 'Portaria'
  },
  {
    id: 'att-3',
    sessionId: 'ses-today',
    memberId: 'm-sidney-veiga',
    checkedInAt: '2026-11-01T18:40:00Z',
    checkinMethod: 'Portaria'
  }
];

const INITIAL_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'link_cadastro',
    title: 'Link de Finalização de Cadastro',
    category: 'Boas-Vindas',
    messageBody: 'Graça e Paz, {{nome}}! 🕊️✨\nSeja muito bem-vindo(a) à Família da Igreja Evangélica Manancial!\n\nPara mantermos nosso cuidado pastoral atualizado, clique no seu link exclusivo para confirmar e finalizar seu cadastro:\n{{link}}\n\nQue Deus abençoe ricamente sua vida e sua família!'
  },
  {
    id: 'aniversario',
    title: 'Parabéns pelo Aniversário',
    category: 'Aniversário',
    messageBody: 'Graça e Paz, {{nome}}! 🎂✨\nToda a família da Igreja Evangélica Manancial louva a Deus pela sua vida hoje. Que o Senhor renove suas forças, saúde e sabedoria!\n\n"O Senhor te abençoe e te guarde!" (Números 6:24)\nCom carinho, Pastor e Liderança Manancial.'
  },
  {
    id: 'falta',
    title: 'Sentimos sua Falta no Culto',
    category: 'Ausência',
    messageBody: 'Paz do Senhor, querido(a) {{nome}}! 🕊️\nSentimos muito a sua falta em nossos últimos cultos na Igreja Manancial. Você e sua família são preciosos para nós!\nEstá tudo bem com você? Se precisar de oração ou apoio da igreja, conte conosco.\nEsperamos você no próximo culto! Deus te abençoe.'
  },
  {
    id: 'visitante',
    title: 'Boas-Vindas ao Visitante',
    category: 'Boas-Vindas',
    messageBody: 'Olá, {{nome}}! Paz do Senhor! 🙏\nFoi uma grande alegria ter você conosco no culto da Igreja Evangélica Manancial. Nossa casa de oração está sempre de portas abertas para você e sua família!\nFicamos à disposição para orar pela sua vida. Um forte abraço!'
  },
  {
    id: 'lembrete',
    title: 'Lembrete do Culto de Hoje',
    category: 'Lembrete',
    messageBody: 'Graça e Paz, {{nome}}! ⛪\nPassando para lembrar que hoje temos culto especial na Igreja Manancial às 19:00.\nVenha com sua família com o coração aberto para o que Deus preparou. Esperamos você!'
  }
];

interface ChurchStoreState {
  members: ChurchMember[];
  services: ChurchService[];
  sessions: ChurchServiceSession[];
  attendances: ChurchAttendance[];
  templates: WhatsAppTemplate[];
  activeSessionId: string;

  // Actions
  addMember: (member: Omit<ChurchMember, 'id' | 'createdAt' | 'consecutiveAbsences'>) => void;
  updateMember: (id: string, updates: Partial<ChurchMember>) => void;
  deleteMember: (id: string) => void;
  
  toggleAttendance: (sessionId: string, memberId: string, method?: 'Portaria' | 'WhatsApp' | 'QR Code') => void;
  setActiveSessionId: (sessionId: string) => void;
  createNewSession: (serviceId: string, theme?: string, preacher?: string) => string;

  // Registration & Links
  getRegistrationInviteUrl: (member: ChurchMember) => string;
  generateInviteWhatsAppUrl: (member: ChurchMember) => string;
  completeRegistration: (tokenOrId: string, data: Partial<ChurchMember>) => Promise<boolean>;
  syncWithSupabase: () => Promise<void>;

  // Getters & Helpers
  getBirthdaysThisWeek: () => ChurchMember[];
  getAbsentMembersAlert: () => ChurchMember[];
  getAttendanceCountForSession: (sessionId: string) => number;
  generateWhatsAppUrl: (phone: string, templateId: string, memberName: string) => string;
}

export const useChurchStore = create<ChurchStoreState>()(
  persist(
    (set, get) => ({
      members: INITIAL_MEMBERS,
      services: INITIAL_SERVICES,
      sessions: INITIAL_SESSIONS,
      attendances: INITIAL_ATTENDANCES,
      templates: INITIAL_TEMPLATES,
      activeSessionId: 'ses-today',

      addMember: (memberData) => {
        const newMember: ChurchMember = {
          ...memberData,
          id: 'm_' + Date.now(),
          consecutiveAbsences: 0,
          registrationStatus: memberData.registrationStatus || 'PENDENTE',
          inviteToken: memberData.inviteToken || 'tok_' + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString()
        };
        set((state) => ({ members: [newMember, ...state.members] }));
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m))
        }));
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          attendances: state.attendances.filter((a) => a.memberId !== id)
        }));
      },

      toggleAttendance: (sessionId, memberId, method: 'Portaria' | 'WhatsApp' | 'QR Code' | 'Líder' = 'Portaria') => {
        set((state) => {
          const exists = state.attendances.find(
            (a) => a.sessionId === sessionId && a.memberId === memberId
          );

          if (exists) {
            return {
              attendances: state.attendances.filter((a) => a.id !== exists.id)
            };
          } else {
            const newAttendance: ChurchAttendance = {
              id: 'att_' + Date.now(),
              sessionId,
              memberId,
              checkedInAt: new Date().toISOString(),
              checkinMethod: method
            };
            return {
              attendances: [...state.attendances, newAttendance],
              members: state.members.map((m) =>
                m.id === memberId
                  ? { ...m, consecutiveAbsences: 0, lastAttendanceDate: new Date().toISOString().split('T')[0] }
                  : m
              )
            };
          }
        });
      },

      setActiveSessionId: (activeSessionId) => set({ activeSessionId }),

      createNewSession: (serviceId, theme, preacher) => {
        const id = 'ses_' + Date.now();
        const newSession: ChurchServiceSession = {
          id,
          serviceId,
          sessionDate: new Date().toISOString().split('T')[0],
          theme: theme || 'Culto de Celebração',
          preacher: preacher || 'Pastor Titular',
          attendancesCount: 0
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id
        }));
        return id;
      },

      getRegistrationInviteUrl: (member: ChurchMember) => {
        const token = member.inviteToken || member.id;
        const origin = window.location.origin;
        const pathname = window.location.pathname.replace(/\/$/, '');
        return `${origin}${pathname}/#/completar-cadastro?token=${token}`;
      },

      generateInviteWhatsAppUrl: (member: ChurchMember) => {
        const url = get().getRegistrationInviteUrl(member);
        let cleanPhone = member.phoneWhatsApp.replace(/\D/g, '');
        if (cleanPhone.length === 10 || cleanPhone.length === 11) {
          cleanPhone = '55' + cleanPhone;
        }
        const firstName = member.fullName.split(' ')[0] || member.fullName;
        const template = get().templates.find((t) => t.id === 'link_cadastro') || get().templates[0];
        
        const message = template.messageBody
          .replace(/\{\{nome\}\}/g, firstName)
          .replace(/\{\{link\}\}/g, url);

        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      },

      completeRegistration: async (tokenOrId: string, updates: Partial<ChurchMember>) => {
        // 1. Atualiza na memória local
        set((state) => ({
          members: state.members.map((m) =>
            m.inviteToken === tokenOrId || m.id === tokenOrId
              ? { ...m, ...updates, registrationStatus: 'CONCLUIDO' as const }
              : m
          )
        }));

        // 2. Sincroniza com Supabase se disponível
        try {
          const target = get().members.find(
            (m) => m.inviteToken === tokenOrId || m.id === tokenOrId
          );
          if (target) {
            const cleanPhone = (updates.phoneWhatsApp || target.phoneWhatsApp).replace(/\D/g, '');
            const whatsappInt = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
            
            await supabase()
              .from('church_members')
              .update({
                full_name: updates.fullName || target.fullName,
                phone: cleanPhone,
                whatsapp: whatsappInt,
                email: updates.email || target.email || null,
                birth_date: updates.birthDate || target.birthDate || null,
                baptism_date: updates.baptismDate || target.baptismDate || null,
                role: (updates.role as string) || target.role,
                ministry: (updates.ministry as string) || target.ministry,
                address: updates.address || target.address || null,
                notes: updates.pastoralNotes || target.pastoralNotes || null,
                registration_status: 'CONCLUIDO',
                status: 'ATIVO',
                updated_at: new Date().toISOString()
              })
              .or(`invite_token.eq.${tokenOrId},id.eq.${tokenOrId}`);
          }
          return true;
        } catch (err) {
          console.warn('Erro ao sincronizar finalização no Supabase:', err);
          return true;
        }
      },

      syncWithSupabase: async () => {
        try {
          const { data, error } = await supabase()
            .from('church_members')
            .select('*');

          if (data && data.length > 0 && !error) {
            set((state) => {
              const memberMap = new Map<string, ChurchMember>(state.members.map((m) => [m.id, m]));
              
              for (const row of data) {
                const existing = memberMap.get(row.id);
                if (existing) {
                  memberMap.set(row.id, {
                    ...existing,
                    fullName: row.full_name || existing.fullName,
                    phoneWhatsApp: row.phone || row.whatsapp || existing.phoneWhatsApp,
                    email: row.email || existing.email,
                    birthDate: row.birth_date || existing.birthDate,
                    baptismDate: row.baptism_date || existing.baptismDate,
                    role: (row.role as ChurchRole) || existing.role,
                    ministry: (row.ministry as ChurchMinistry) || existing.ministry,
                    address: row.address || existing.address,
                    registrationStatus: (row.registration_status as any) || existing.registrationStatus,
                    inviteToken: row.invite_token || existing.inviteToken,
                    familyGroupId: row.family_group_id || existing.familyGroupId,
                  });
                } else if (row.source === 'PRE_CADASTRO' || row.source === 'MANUAL') {
                  memberMap.set(row.id, {
                    id: row.id,
                    fullName: row.full_name,
                    phoneWhatsApp: row.phone || row.whatsapp || '',
                    email: row.email,
                    birthDate: row.birth_date,
                    baptismDate: row.baptism_date,
                    role: (row.role as ChurchRole) || 'Membro',
                    ministry: (row.ministry as ChurchMinistry) || 'Nenhum',
                    status: 'Ativo',
                    registrationStatus: (row.registration_status as any) || 'PENDENTE',
                    inviteToken: row.invite_token,
                    familyGroupId: row.family_group_id,
                    consecutiveAbsences: 0,
                    createdAt: row.created_at || new Date().toISOString()
                  });
                }
              }
              return { members: Array.from(memberMap.values()) };
            });
          }
        } catch (err) {
          console.warn('Sync com Supabase background:', err);
        }
      },

      getBirthdaysThisWeek: () => {
        const state = get();
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();

        return state.members.filter((m) => {
          if (!m.birthDate) return false;
          const [, monthStr, dayStr] = m.birthDate.split('-');
          const month = parseInt(monthStr, 10);
          const day = parseInt(dayStr, 10);

          if (month === currentMonth && Math.abs(day - currentDay) <= 7) {
            return true;
          }
          return false;
        });
      },

      getAbsentMembersAlert: () => {
        const state = get();
        return state.members.filter(
          (m) => (m.consecutiveAbsences || 0) >= 2 && m.status !== 'Afastado'
        );
      },

      getAttendanceCountForSession: (sessionId) => {
        const state = get();
        return state.attendances.filter((a) => a.sessionId === sessionId).length;
      },

      generateWhatsAppUrl: (phone, templateId, memberName) => {
        const state = get();
        const template = state.templates.find((t) => t.id === templateId) || state.templates[0];
        
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10 || cleanPhone.length === 11) {
          cleanPhone = '55' + cleanPhone;
        }

        const firstName = memberName.split(' ')[0] || memberName;
        const message = template.messageBody
          .replace(/\{\{nome\}\}/g, firstName)
          .replace(/\{\{culto\}\}/g, 'Culto da Família')
          .replace(/\{\{horario\}\}/g, '19:00');

        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      }
    }),
    {
      name: 'manancial_church_store_v2',
      merge: (persistedState: any, currentState: ChurchStoreState) => {
        const persistedMembers: ChurchMember[] = persistedState?.members || [];
        const existingMap = new Map(persistedMembers.map((m: any) => [m.id, m]));
        
        for (const pre of PRE_REGISTERED_MEMBERS) {
          if (!existingMap.has(pre.id)) {
            existingMap.set(pre.id, pre);
          } else {
            const existing = existingMap.get(pre.id)!;
            existingMap.set(pre.id, {
              ...pre,
              ...existing,
              inviteToken: existing.inviteToken || pre.inviteToken,
              familyGroupId: existing.familyGroupId || pre.familyGroupId,
              registrationStatus: existing.registrationStatus || pre.registrationStatus || 'PENDENTE',
            });
          }
        }
        
        return {
          ...currentState,
          ...persistedState,
          members: Array.from(existingMap.values()),
        };
      }
    }
  )
);
