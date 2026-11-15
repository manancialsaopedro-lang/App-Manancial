import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  Search,
  MessageSquare,
  ExternalLink,
  Heart,
  Church,
  CheckCircle2,
  Copy,
  Droplet,
  LayoutGrid,
  Table2,
  Eye,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Calendar,
  Sparkles,
  X,
  Phone,
  Clock,
  UserCheck,
  Shield,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  Check,
  Send,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAppStore } from '../../../store';
import { useChurchStore } from '../../../store/churchStore';
import { useCurrentRole } from '../../../hooks/useCurrentRole';
import { DataTable } from '../../../components/ui/DataTable';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../../../components/ui/Sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/DropdownMenu';

export interface VisitorItem {
  id: string;
  full_name: string;
  phone?: string;
  whatsapp?: string;
  created_at: string;
  is_first_time?: boolean;
  member_type?: string;
  needs_prayer?: boolean;
  wants_visit?: boolean;
  visit_count?: number;
  notes?: string;
  address?: string;
  // Gestão Pastoral de Visitas
  assigned_pastor_id?: string | null;
  assigned_pastor_name?: string | null;
  visit_status?: 'PENDENTE' | 'EM_CONTATO' | 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA';
  visit_scheduled_date?: string | null;
  visit_scheduled_time?: string | null;
  pastoral_notes?: string | null;
}

// Pastores e Líderes Oficiais da Manancial para atribuição
export const CHURCH_PASTORS_LIST = [
  { id: 'm-pastor-carlos', name: 'Pr. Carlos Eduardo Santos', role: 'Pastor Presidente (Fundador)', phone: '11988887771' },
  { id: 'm-sidney-veiga', name: 'Pr. Sidney Veiga', role: 'Presbítero / Pastor', phone: '19998425060' },
  { id: 'm-caio-augusto', name: 'Pr. Caio Augusto', role: 'Pastor / Admin', phone: '19993843839' },
  { id: 'm-rodrigo-correa', name: 'Líder Rodrigo Correa', role: 'Líder Pastoral', phone: '19996090594' },
  { id: 'm-paulo-smaniotto', name: 'Paulo Smaniotto (Paulinho)', role: 'Equipe Pastoral / Diaconia', phone: '19998917842' },
  { id: 'm-wilson', name: 'Wilson', role: 'Equipe Pastoral / Diaconia', phone: '19981141000' },
  { id: 'm-jackson-luthero', name: 'Jackson Luthero', role: 'Equipe Pastoral', phone: '19998423555' }
];

// Mocks realistas de visitantes para demonstração/fallback
const MOCK_VISITORS: VisitorItem[] = [
  {
    id: 'mock-1',
    full_name: 'Gabriel Siqueira Rocha',
    whatsapp: '11988776655',
    phone: '11988776655',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_first_time: true,
    member_type: 'Membro',
    needs_prayer: true,
    wants_visit: true,
    visit_count: 1,
    assigned_pastor_id: 'm-caio-augusto',
    assigned_pastor_name: 'Pr. Caio Augusto',
    visit_status: 'EM_CONTATO',
    notes:
      'Momento: QUERO_SER_MEMBRO | Opção Membresia: DEPOIS | Histórico de Fé: PROTESTANTE | Denominação: Batista | Pedido de Oração: Por recolocação profissional e bênção na família',
    address: 'Rua São Pedro, 450 - Centro'
  },
  {
    id: 'mock-2',
    full_name: 'Mariana Duarte Costa',
    whatsapp: '11977665544',
    phone: '11977665544',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    is_first_time: true,
    member_type: 'Visitante',
    needs_prayer: false,
    wants_visit: false,
    visit_count: 1,
    visit_status: 'PENDENTE',
    notes: 'Momento: APENAS_VISITANTE | Histórico de Fé: CATOLICA',
    address: 'Bairro Recanto das Flores'
  },
  {
    id: 'mock-3',
    full_name: 'Lucas Henrique de Oliveira',
    whatsapp: '11966554433',
    phone: '11966554433',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_first_time: false,
    member_type: 'Membro',
    needs_prayer: false,
    wants_visit: true,
    visit_count: 2,
    assigned_pastor_id: 'm-sidney-veiga',
    assigned_pastor_name: 'Pr. Sidney Veiga',
    visit_status: 'AGENDADA',
    visit_scheduled_date: '2026-11-16',
    visit_scheduled_time: '19:30',
    notes:
      'Momento: QUERO_SER_MEMBRO | Opção Membresia: AGORA | Nascimento: 12/03/1998 | Batizado nas águas: SIM | Denominação: Assembleia de Deus',
    address: 'Av. das Palmeiras, 102 - Jardim São Pedro'
  },
];

function parseVisitorNotes(notes?: string): Record<string, string> {
  if (!notes) return {};
  const result: Record<string, string> = {};
  notes.split('|').forEach((part) => {
    const [key, ...rest] = part.split(':');
    if (key && rest.length > 0) {
      result[key.trim()] = rest.join(':').trim();
    }
  });
  return result;
}

export const DevVisitorsPage: React.FC = () => {
  const { addMember } = useChurchStore();
  const { user } = useAppStore();
  const { activeRole, roleLabel } = useCurrentRole();

  const [visitors, setVisitors] = useState<VisitorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<
    'TODOS' | 'SOLICITOU_VISITA' | 'MINHAS_ATRIBUIDAS' | 'AGENDADAS' | 'CONCLUIDAS' | 'ORACAO'
  >('TODOS');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modais de Gestão Pastoral
  const [assignModalVisitor, setAssignModalVisitor] = useState<VisitorItem | null>(null);
  const [scheduleModalVisitor, setScheduleModalVisitor] = useState<VisitorItem | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('19:30');
  const [scheduleStatus, setScheduleStatus] = useState<'PENDENTE' | 'EM_CONTATO' | 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA'>('AGENDADA');
  const [pastoralNotesInput, setPastoralNotesInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const visitorPublicUrl = `${window.location.origin}${window.location.pathname}#/visitante`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase()
        .from('church_members')
        .select('*')
        .or('source.eq.QR_WIZARD,member_type.eq.Visitante,wants_visit.eq.true')
        .order('created_at', { ascending: false });

      if (data && data.length > 0 && !error) {
        setVisitors(data);
      } else {
        const local = JSON.parse(
          localStorage.getItem('manancial_pending_visitors') || '[]'
        );
        if (local.length > 0) {
          setVisitors([...local, ...MOCK_VISITORS]);
        } else {
          setVisitors(MOCK_VISITORS);
        }
      }
    } catch {
      setVisitors(MOCK_VISITORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(visitorPublicUrl);
    setCopiedLink(true);
    showToast('Link público de recepção de visitantes copiado!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ==============================================================================
  // AÇÃO 1-CLIQUE NO WHATSAPP (SEM NENHUMA API EXTERNA)
  // ==============================================================================
  const openWhatsAppContact = (visitor: VisitorItem, customPastorName?: string) => {
    const rawNumber = visitor.whatsapp || visitor.phone || '';
    const cleanPhone = rawNumber.replace(/\D/g, '');
    const firstName = visitor.full_name.split(' ')[0];

    const pastorName = customPastorName || visitor.assigned_pastor_name || 'Pastor da Igreja Manancial';

    let text = '';

    if (visitor.wants_visit) {
      // Mensagem personalizada para solicitação de visita pastoral
      text = `Graça e Paz, ${firstName}! 🕊️✨\n\nAqui é o ${pastorName}, da Igreja Evangélica Manancial.\nRecebemos o seu pedido de visita com muita alegria e carinho no coração!\n\nGostaria de saber qual dia e horário fica melhor para fazermos uma visita e orarmos com você e sua família?\n\nFicamos à disposição! Que Deus abençoe ricamente a sua semana.`;
    } else if (visitor.member_type === 'Membro' || visitor.notes?.includes('QUERO_SER_MEMBRO')) {
      // Mensagem para quem tem interesse em se tornar membro
      text = `Olá, ${firstName}! A paz do Senhor! 🕊️\n\nAqui é o ${pastorName}, da Igreja Evangélica Manancial.\nFoi uma grande alegria ter você em nosso culto! Vimos que você tem o desejo de caminhar conosco como membro desta família de fé.\n\nSegue o link exclusivo para você preencher ou atualizar seus dados:\n${visitorPublicUrl}\n\nEstamos sempre à sua disposição. Deus abençoe!`;
    } else {
      // Mensagem acolhedora de boas-vindas geral
      text = `Olá, ${firstName}! A paz do Senhor! 🕊️\n\nAqui é da equipe pastoral da Igreja Evangélica Manancial.\nFoi uma alegria enorme ter você conosco em nosso culto! Esperamos que você e sua família tenham se sentido muito acolhidos em nossa casa.\n\nSempre que precisar de oração ou apoio, conte conosco! Um forte abraço e uma semana abençoada!`;
    }

    const encoded = encodeURIComponent(text);
    const link = `https://wa.me/55${cleanPhone}?text=${encoded}`;
    window.open(link, '_blank');
  };

  // Atribuição de Pastor
  const handleAssignPastor = async (visitor: VisitorItem, pastorId: string, pastorName: string) => {
    setIsSaving(true);
    try {
      await supabase()
        .from('church_members')
        .update({
          assigned_pastor_id: pastorId,
          assigned_pastor_name: pastorName,
          visit_status: visitor.visit_status === 'PENDENTE' ? 'EM_CONTATO' : visitor.visit_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitor.id);

      setVisitors(prev => prev.map(v => 
        v.id === visitor.id 
          ? { ...v, assigned_pastor_id: pastorId, assigned_pastor_name: pastorName, visit_status: v.visit_status === 'PENDENTE' ? 'EM_CONTATO' : v.visit_status } 
          : v
      ));

      if (selectedVisitor?.id === visitor.id) {
        setSelectedVisitor(prev => prev ? { ...prev, assigned_pastor_id: pastorId, assigned_pastor_name: pastorName } : null);
      }

      showToast(`Visitante direcionado(a) com sucesso para ${pastorName}!`);
      setAssignModalVisitor(null);
    } catch (err) {
      console.warn('Erro ao atribuir pastor:', err);
      showToast('Atribuição salva localmente.');
      setAssignModalVisitor(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Abrir Modal de Agendamento
  const handleOpenScheduleModal = (visitor: VisitorItem) => {
    setScheduleModalVisitor(visitor);
    setScheduleDate(visitor.visit_scheduled_date || new Date().toISOString().split('T')[0]);
    setScheduleTime(visitor.visit_scheduled_time || '19:30');
    setScheduleStatus(visitor.visit_status || 'AGENDADA');
    setPastoralNotesInput(visitor.pastoral_notes || '');
  };

  // Salvar Agendamento de Visita
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalVisitor) return;

    setIsSaving(true);
    try {
      await supabase()
        .from('church_members')
        .update({
          visit_status: scheduleStatus,
          visit_scheduled_date: scheduleDate || null,
          visit_scheduled_time: scheduleTime || null,
          pastoral_notes: pastoralNotesInput.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleModalVisitor.id);

      setVisitors(prev => prev.map(v => 
        v.id === scheduleModalVisitor.id 
          ? { 
              ...v, 
              visit_status: scheduleStatus, 
              visit_scheduled_date: scheduleDate, 
              visit_scheduled_time: scheduleTime,
              pastoral_notes: pastoralNotesInput.trim() 
            } 
          : v
      ));

      if (selectedVisitor?.id === scheduleModalVisitor.id) {
        setSelectedVisitor(prev => prev ? { 
          ...prev, 
          visit_status: scheduleStatus, 
          visit_scheduled_date: scheduleDate, 
          visit_scheduled_time: scheduleTime,
          pastoral_notes: pastoralNotesInput.trim() 
        } : null);
      }

      showToast('Status e agendamento da visita atualizados!');
      setScheduleModalVisitor(null);
    } catch (err) {
      console.warn('Erro ao atualizar agendamento:', err);
      showToast('Atualizado localmente.');
      setScheduleModalVisitor(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntegrateAsMember = (visitor: VisitorItem) => {
    addMember({
      fullName: visitor.full_name,
      phoneWhatsApp: visitor.whatsapp || visitor.phone || '',
      role: 'Membro',
      ministry: 'Nenhum',
      status: 'Ativo',
      registrationStatus: 'PENDENTE',
      pastoralNotes: visitor.notes || undefined
    });
    showToast(
      `${visitor.full_name} foi integrado(a) ao rol oficial de Membros da Igreja!`
    );
    if (selectedVisitor?.id === visitor.id) {
      setSelectedVisitor(null);
    }
  };

  const handleRemoveVisitor = (id: string, name: string) => {
    setVisitors((prev) => prev.filter((v) => v.id !== id));
    if (selectedVisitor?.id === id) setSelectedVisitor(null);
    showToast(`Registro de visitante "${name}" arquivado.`);
  };

  // Contadores e Alertas de Visitas
  const totalVisitorsCount = visitors.length;
  const pendingVisitsCount = visitors.filter(v => v.wants_visit && (v.visit_status === 'PENDENTE' || !v.visit_status)).length;
  const scheduledVisitsCount = visitors.filter(v => v.visit_status === 'AGENDADA').length;
  const completedVisitsCount = visitors.filter(v => v.visit_status === 'CONCLUIDA').length;

  const filteredVisitors = useMemo(() => {
    return visitors.filter((item) => {
      const matchesSearch =
        item.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.whatsapp && item.whatsapp.includes(search)) ||
        (item.assigned_pastor_name && item.assigned_pastor_name.toLowerCase().includes(search.toLowerCase())) ||
        (item.address && item.address.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterType === 'SOLICITOU_VISITA') return item.wants_visit;
      if (filterType === 'MINHAS_ATRIBUIDAS') {
        const currentName = (user?.name || '').trim().toLowerCase();
        const firstToken = currentName.split(' ')[0] || '';
        const memberId = user?.churchMemberId;
        if (memberId && item.assigned_pastor_id === memberId) return true;
        if (!item.assigned_pastor_name) return false;
        const assignedLower = item.assigned_pastor_name.toLowerCase();
        return (
          (currentName.length > 0 && assignedLower.includes(currentName)) ||
          (firstToken.length > 2 && assignedLower.includes(firstToken))
        );
      }
      if (filterType === 'AGENDADAS') return item.visit_status === 'AGENDADA';
      if (filterType === 'CONCLUIDAS') return item.visit_status === 'CONCLUIDA';
      if (filterType === 'ORACAO') return item.needs_prayer || item.notes?.includes('Oração');

      return true;
    });
  }, [visitors, search, filterType]);

  // Colunas do DataTable de Visitantes
  const columns = useMemo<ColumnDef<VisitorItem>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'Visitante & Contato',
        enableHiding: false,
        cell: ({ row }) => {
          const v = row.original;
          const phone = v.whatsapp || v.phone;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-900 to-[#0a2f38] text-cyan-200 font-black text-xs flex items-center justify-center shrink-0 shadow-sm border border-cyan-700/30">
                {v.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate text-xs sm:text-sm">
                  {v.full_name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Phone size={10} className="text-cyan-600" />
                  {phone || 'Sem telefone'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'visit_status',
        header: 'Solicitação & Status',
        cell: ({ row }) => {
          const v = row.original;
          if (v.wants_visit) {
            if (v.visit_status === 'AGENDADA') {
              return (
                <div className="space-y-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                    <CalendarDays size={11} className="text-purple-600" />
                    Agendada: {v.visit_scheduled_date ? v.visit_scheduled_date.split('-').reverse().slice(0, 2).join('/') : ''} {v.visit_scheduled_time || ''}
                  </span>
                  <span className="text-[10px] text-purple-700 block font-bold">Visita Marcada</span>
                </div>
              );
            }
            if (v.visit_status === 'CONCLUIDA') {
              return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  Visita Concluída
                </span>
              );
            }
            if (v.visit_status === 'EM_CONTATO') {
              return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  <Clock size={11} className="text-blue-600" />
                  Em Contato
                </span>
              );
            }
            return (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                <AlertCircle size={11} className="text-amber-600" />
                Pediu Visita (Pendente)
              </span>
            );
          }

          if (v.needs_prayer) {
            return (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg">
                <Heart size={10} className="text-purple-600" />
                Pediu Oração
              </span>
            );
          }

          return (
            <span className="text-[10px] font-semibold text-slate-400">
              Acolhimento de Culto
            </span>
          );
        },
      },
      {
        id: 'pastor',
        header: 'Pastor Responsável',
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {v.assigned_pastor_name ? (
                <button
                  type="button"
                  onClick={() => setAssignModalVisitor(v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-900 text-[11px] font-bold transition-all"
                  title="Clique para alterar o pastor responsável"
                >
                  <UserCheck size={12} className="text-cyan-600" />
                  <span className="truncate max-w-[130px]">{v.assigned_pastor_name}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAssignModalVisitor(v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black transition-all"
                >
                  <UserPlus size={12} className="text-amber-600" />
                  <span>Direcionar Pastor</span>
                </button>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Data do Culto',
        cell: ({ row }) => (
          <span className="text-slate-600 font-medium text-[11px] tabular-nums">
            {new Date(row.original.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div
              className="flex items-center justify-end gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botão 1-Clique no WhatsApp */}
              <button
                type="button"
                onClick={() => openWhatsAppContact(v)}
                disabled={!v.whatsapp && !v.phone}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                title="Abrir WhatsApp com mensagem acolhedora pronta"
              >
                <Send size={12} />
                <span>WhatsApp</span>
              </button>

              {/* Botão de Agendamento */}
              {v.wants_visit && (
                <button
                  type="button"
                  onClick={() => handleOpenScheduleModal(v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold transition-all"
                  title="Agendar ou atualizar visita"
                >
                  <Calendar size={12} className="text-purple-600" />
                  <span className="hidden lg:inline">Agendar</span>
                </button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    aria-label="Opções do visitante"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Gestão Pastoral</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setSelectedVisitor(v)}>
                    <Eye size={14} className="text-cyan-700" />
                    <span>Ver Ficha Completa</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setAssignModalVisitor(v)}>
                    <UserCheck size={14} className="text-amber-600" />
                    <span>Direcionar para Outro Pastor</span>
                  </DropdownMenuItem>
                  {v.wants_visit && (
                    <DropdownMenuItem onSelect={() => handleOpenScheduleModal(v)}>
                      <Calendar size={14} className="text-purple-600" />
                      <span>Agendar Visita Residencial</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => openWhatsAppContact(v)}>
                    <Send size={14} className="text-emerald-600" />
                    <span>Falar no WhatsApp</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleIntegrateAsMember(v)}>
                    <UserPlus size={14} className="text-cyan-700" />
                    <span>Integrar como Membro Oficial</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="danger"
                    onSelect={() => handleRemoveVisitor(v.id, v.full_name)}
                  >
                    <Trash2 size={14} />
                    <span>Arquivar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  const selectedNotesMap = useMemo(
    () => parseVisitorNotes(selectedVisitor?.notes),
    [selectedVisitor]
  );

  return (
    <div className="space-y-6 pb-28">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header com Ações Rápidas */}
      <div className="bg-gradient-to-r from-[#0a2f38] via-[#0d3b46] to-[#0a3f4a] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-semibold mb-2">
            <Droplet className="w-3.5 h-3.5 text-cyan-300" />
            Radar de Acolhimento & Pastoreio
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Apoio aos Novos Visitantes</span>
          </h1>
          <p className="text-xs text-cyan-100/80 mt-1 max-w-xl leading-relaxed">
            Acompanhe em tempo real quem participou dos cultos, direcione solicitações de visitas para pastores específicos da equipe e fale com 1 toque no WhatsApp.
          </p>
        </div>

        {/* Link / QR Code do Wizard */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all active:scale-95"
          >
            {copiedLink ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-cyan-300" />
            )}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link /visitante'}</span>
          </button>

          <a
            href={visitorPublicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir Formulário</span>
          </a>
        </div>
      </div>

      {/* BANNER DE ALERTA: SOLICITAÇÕES DE VISITA PENDENTES */}
      {pendingVisitsCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                {pendingVisitsCount === 1 ? '1 Solicitação de Visita Aguardando Atendimento' : `${pendingVisitsCount} Solicitações de Visita Aguardando Atendimento`}
              </h3>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Visitantes pediram visita pastoral. Direcione para um pastor da equipe para iniciar o contato no WhatsApp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterType('SOLICITOU_VISITA')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider self-start sm:self-auto shrink-0 shadow-sm transition-all"
          >
            Ver Solicitações ({pendingVisitsCount})
          </button>
        </div>
      )}

      {/* CARDS DE MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Visitantes</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalVisitorsCount}
          </div>
          <span className="text-[10px] text-slate-400">Registrados no app</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#11192e] border border-amber-500/30 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Aguardando Contato</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingVisitsCount}
          </div>
          <span className="text-[10px] text-amber-600/70">Pediram visita</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#11192e] border border-purple-500/30 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">Visitas Agendadas</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {scheduledVisitsCount}
          </div>
          <span className="text-[10px] text-purple-600/70">Com data e hora</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#11192e] border border-emerald-500/30 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Visitas Concluídas</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {completedVisitsCount}
          </div>
          <span className="text-[10px] text-emerald-600/70">Pastoreio realizado</span>
        </div>
      </div>

      {/* FILTROS E TABELA/CARDS */}
      {viewMode === 'table' ? (
        <DataTable<VisitorItem, unknown>
          columns={columns}
          data={filteredVisitors}
          loading={loading}
          enableRowSelection
          onRowClick={(v) => setSelectedVisitor(v)}
          columnLabels={{
            full_name: 'Visitante & Contato',
            visit_status: 'Solicitação & Status',
            pastor: 'Pastor Responsável',
            created_at: 'Data do Culto',
          }}
          emptyTitle="Nenhum visitante encontrado"
          emptyDescription="Compartilhe o link /visitante nos cultos para receber as solicitações em tempo real."
          toolbarLeft={
            <>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por visitante, pastor, WhatsApp ou bairro..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11192e] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'TODOS', label: `Todos (${totalVisitorsCount})` },
                  { id: 'SOLICITOU_VISITA', label: `Pediram Visita (${pendingVisitsCount})` },
                  { id: 'MINHAS_ATRIBUIDAS', label: 'Minhas Visitas' },
                  { id: 'AGENDADAS', label: `Agendadas (${scheduledVisitsCount})` },
                  { id: 'CONCLUIDAS', label: `Concluídas (${completedVisitsCount})` },
                  { id: 'ORACAO', label: 'Pediu Oração' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterType(f.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      filterType === f.id
                        ? 'bg-[#082f38] text-cyan-200 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          }
          toolbarRight={
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-[#082f38] dark:text-cyan-400 shadow-2xs"
                title="Visualização em Tabela"
              >
                <Table2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
                title="Visualização em Cards"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          }
          renderBulkActions={(selectedRows, clearSelection) => (
            <>
              <button
                type="button"
                onClick={() => {
                  selectedRows.forEach((v) => handleIntegrateAsMember(v));
                  clearSelection();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-cyan-950 hover:bg-cyan-400 text-xs font-black transition-colors"
              >
                <UserPlus size={13} />
                <span>Integrar como Membros ({selectedRows.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = selectedRows
                    .map((v) => `${v.full_name}: ${v.whatsapp || v.phone || ''}`)
                    .join('\n');
                  navigator.clipboard.writeText(text);
                  showToast('Contatos dos visitantes copiados!');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-100 text-xs font-bold transition-colors border border-white/15"
              >
                <Copy size={13} />
                <span>Copiar Contatos</span>
              </button>
            </>
          )}
        />
      ) : (
        /* Modo Cards */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#11192e] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por visitante, pastor ou bairro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                  title="Visualização em Tabela"
                >
                  <Table2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-[#082f38] dark:text-cyan-400 shadow-2xs"
                  title="Visualização em Cards"
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVisitors.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedVisitor(item)}
                  className="bg-white dark:bg-[#11192e] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                          {item.full_name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {item.whatsapp ? `+55 ${item.whatsapp}` : 'Sem número'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {item.wants_visit && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            Pediu Visita
                          </span>
                        )}
                        {item.is_first_time && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            1ª Visita
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pastor Responsável */}
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Pastor:</span>
                      <span className="font-bold text-cyan-700 dark:text-cyan-400">
                        {item.assigned_pastor_name || 'Não direcionado'}
                      </span>
                    </div>

                    {item.notes && (
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                        <p className="line-clamp-2 leading-relaxed">{item.notes}</p>
                      </div>
                    )}

                    {item.visit_status === 'AGENDADA' && item.visit_scheduled_date && (
                      <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-2xl border border-purple-200 dark:border-purple-800">
                        <Calendar size={13} />
                        <span>Visita: {item.visit_scheduled_date.split('-').reverse().join('/')} às {item.visit_scheduled_time || '19:30'}</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setAssignModalVisitor(item)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Direcionar
                    </button>

                    <button
                      type="button"
                      onClick={() => openWhatsAppContact(item)}
                      disabled={!item.whatsapp && !item.phone}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                    >
                      <Send size={12} />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- MODAL: DIRECIONAR VISITANTE PARA UM PASTOR --- */}
      {assignModalVisitor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-white dark:bg-[#11192e] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-cyan-600">
                <UserCheck size={20} />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Direcionar para Pastor / Líder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalVisitor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Selecione o pastor ou líder responsável pelo acompanhamento e visita de <strong className="text-slate-900 dark:text-white">{assignModalVisitor.full_name}</strong>:
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {CHURCH_PASTORS_LIST.map((pastor) => {
                const isSelected = assignModalVisitor.assigned_pastor_id === pastor.id;
                return (
                  <button
                    key={pastor.id}
                    type="button"
                    onClick={() => handleAssignPastor(assignModalVisitor, pastor.id, pastor.name)}
                    disabled={isSaving}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-900 dark:text-cyan-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{pastor.name}</div>
                      <div className="text-[10px] text-slate-400">{pastor.role}</div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 size={16} className="text-cyan-600" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setAssignModalVisitor(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: AGENDAMENTO E STATUS DA VISITA --- */}
      {scheduleModalVisitor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-lg w-full bg-white dark:bg-[#11192e] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-purple-600">
                <Calendar size={20} />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Agendar / Acompanhar Visita Pastoral
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalVisitor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
              <div>
                <span className="font-bold block">{scheduleModalVisitor.full_name}</span>
                <span className="text-[10px] opacity-80">{scheduleModalVisitor.address || 'Endereço residencial não informado'}</span>
              </div>
              <button
                type="button"
                onClick={() => openWhatsAppContact(scheduleModalVisitor)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
              >
                <Send size={11} /> Chamar no WhatsApp
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status da Visita
                  </label>
                  <select
                    value={scheduleStatus}
                    onChange={(e) => setScheduleStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  >
                    <option value="PENDENTE">Aguardando Contato</option>
                    <option value="EM_CONTATO">Em Contato via WhatsApp</option>
                    <option value="AGENDADA">Visita Agendada</option>
                    <option value="CONCLUIDA">Visita Realizada (Concluída)</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horário da Visita
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Data Agendada
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Anotações Pastorais Confidenciais
                </label>
                <textarea
                  rows={3}
                  value={pastoralNotesInput}
                  onChange={(e) => setPastoralNotesInput(e.target.value)}
                  placeholder="Observações da visita, motivo de oração da família, pontos de atenção..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalVisitor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Check size={14} /> Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- GAVETA LATERAL (SHEET) DE FICHA DO VISITANTE --- */}
      <Sheet
        open={!!selectedVisitor}
        onOpenChange={(open) => !open && setSelectedVisitor(null)}
      >
        <SheetContent side="right">
          {selectedVisitor && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#082f38] text-cyan-200 font-black text-lg flex items-center justify-center shadow-md shrink-0">
                    {selectedVisitor.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="truncate">
                      {selectedVisitor.full_name}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1 flex-wrap">
                      {selectedVisitor.is_first_time && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                          1ª Visita
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
                        {selectedVisitor.visit_count || 1}ª presença
                      </span>
                      {selectedVisitor.wants_visit && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Pediu Visita
                        </span>
                      )}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {/* Botão Primário: 1-Clique no WhatsApp */}
                <button
                  type="button"
                  onClick={() => openWhatsAppContact(selectedVisitor)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all hover:scale-[1.01]"
                >
                  <Send size={15} />
                  <span>Falar com Visitante no WhatsApp</span>
                </button>

                {/* Botão de Agendamento Pastoral */}
                {selectedVisitor.wants_visit && (
                  <button
                    type="button"
                    onClick={() => handleOpenScheduleModal(selectedVisitor)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold border border-purple-200 transition-all"
                  >
                    <Calendar size={15} className="text-purple-700" />
                    <span>
                      {selectedVisitor.visit_status === 'AGENDADA'
                        ? 'Atualizar Data da Visita Agendada'
                        : 'Agendar Visita Residencial'}
                    </span>
                  </button>
                )}

                {/* Bloco do Pastor Atribuído */}
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 block">
                      Pastor Responsável
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {selectedVisitor.assigned_pastor_name || 'Ainda não direcionado'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssignModalVisitor(selectedVisitor)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-[11px] font-bold shadow-sm"
                  >
                    Alterar
                  </button>
                </div>

                {/* Resumo Estruturado */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-800 dark:text-cyan-400 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Ficha de Acolhimento</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        WhatsApp
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedVisitor.whatsapp ||
                          selectedVisitor.phone ||
                          'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Data do Culto
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(selectedVisitor.created_at).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>

                    {selectedVisitor.address && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase flex items-center gap-1">
                          <MapPin size={10} /> Endereço Residencial
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {selectedVisitor.address}
                        </span>
                      </div>
                    )}

                    {Object.entries(selectedNotesMap).map(([label, val]) => (
                      <div key={label} className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">
                          {label}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pedido de Oração */}
                {selectedVisitor.needs_prayer && (
                  <div className="bg-purple-50 dark:bg-purple-950/40 rounded-2xl p-4 border border-purple-200/80 dark:border-purple-800 space-y-1.5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <Heart size={13} />
                      <span>Pedido de Oração Pastoral</span>
                    </h4>
                    <p className="text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed">
                      {selectedNotesMap['Pedido de Oração'] ||
                        'O visitante solicitou cobertura de oração da equipe pastoral.'}
                    </p>
                  </div>
                )}

                {/* Anotações Pastorais Confidenciais */}
                {selectedVisitor.pastoral_notes && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block">
                      Observação Pastoral Confidencial
                    </span>
                    <p className="text-xs text-amber-950 dark:text-amber-200 italic">
                      "{selectedVisitor.pastoral_notes}"
                    </p>
                  </div>
                )}
              </div>

              <SheetFooter>
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveVisitor(
                      selectedVisitor.id,
                      selectedVisitor.full_name
                    )
                  }
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Arquivar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleIntegrateAsMember(selectedVisitor)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md transition-all"
                >
                  <UserPlus size={15} />
                  <span>Integrar como Membro</span>
                </button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
