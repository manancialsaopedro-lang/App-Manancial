import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  Search,
  Plus,
  Phone,
  User,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Heart,
  Shield,
  FileText,
  MoreHorizontal,
  Eye,
  Copy,
  Filter,
  AlertTriangle,
  Music,
  Briefcase
} from 'lucide-react';
import { useChurchStore } from '../../../store/churchStore';
import { ChurchMember, ChurchRole, ChurchMinistry } from '../../../types/church';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/AlertDialog';
import { Combobox } from '../../../components/ui/Combobox';

export const DevMembersPage: React.FC = () => {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    generateWhatsAppUrl
  } = useChurchStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<'lista' | 'formulario'>('lista');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [ministryFilters, setMinistryFilters] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<ChurchMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<ChurchMember | null>(null);
  const [bulkDeleteList, setBulkDeleteList] = useState<ChurchMember[] | null>(null);

  // Form State (Idêntico à Imagem 3 da Basiléia)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneWhatsApp: '',
    naturalidade: '',
    rg: '',
    isForeigner: 'Não',
    maritalStatus: 'CASADO(A)',
    gender: 'MASCULINO',
    spouse: '',
    profession: '',
    hasChildren: 'Não',
    isDonor: 'Não',
    bloodType: 'O+',
    isBaptized: 'Sim',
    baptismDate: '',
    isFirstTimeAcceptingJesus: false,
    isReconcilingWithJesus: false,
    interestsAndHobbies: '',
    role: 'Membro' as ChurchRole,
    ministry: 'Nenhum' as ChurchMinistry,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenNewForm = () => {
    setEditingMemberId(null);
    setFormData({
      fullName: '',
      phoneWhatsApp: '',
      naturalidade: '',
      rg: '',
      isForeigner: 'Não',
      maritalStatus: 'CASADO(A)',
      gender: 'MASCULINO',
      spouse: '',
      profession: '',
      hasChildren: 'Não',
      isDonor: 'Não',
      bloodType: 'O+',
      isBaptized: 'Sim',
      baptismDate: '',
      isFirstTimeAcceptingJesus: false,
      isReconcilingWithJesus: false,
      interestsAndHobbies: '',
      role: 'Membro',
      ministry: 'Nenhum',
    });
    setActiveView('formulario');
  };

  const handleEditMember = (m: ChurchMember) => {
    setEditingMemberId(m.id);
    setFormData({
      fullName: m.fullName || '',
      phoneWhatsApp: m.phoneWhatsApp || '',
      naturalidade: (m as any).naturalidade || '',
      rg: (m as any).rg || '',
      isForeigner: (m as any).isForeigner || 'Não',
      maritalStatus: (m as any).maritalStatus || 'CASADO(A)',
      gender: (m as any).gender || 'MASCULINO',
      spouse: (m as any).spouse || '',
      profession: (m as any).profession || '',
      hasChildren: (m as any).hasChildren || 'Não',
      isDonor: (m as any).isDonor || 'Não',
      bloodType: (m as any).bloodType || 'O+',
      isBaptized: m.baptismDate ? 'Sim' : 'Não',
      baptismDate: m.baptismDate || '',
      isFirstTimeAcceptingJesus: !!(m as any).isFirstTimeAcceptingJesus,
      isReconcilingWithJesus: !!(m as any).isReconcilingWithJesus,
      interestsAndHobbies: (m as any).interestsAndHobbies || '',
      role: m.role || 'Membro',
      ministry: m.ministry || 'Nenhum',
    });
    setActiveView('formulario');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phoneWhatsApp.trim()) {
      showToast('Por favor, preencha o Nome e o Celular WhatsApp.');
      return;
    }

    if (editingMemberId) {
      updateMember(editingMemberId, {
        fullName: formData.fullName.trim(),
        phoneWhatsApp: formData.phoneWhatsApp.trim(),
        baptismDate: formData.baptismDate || undefined,
        role: formData.role,
        ministry: formData.ministry,
        ...formData
      } as any);
      showToast(`Membro "${formData.fullName}" atualizado com sucesso!`);
    } else {
      addMember({
        fullName: formData.fullName.trim(),
        phoneWhatsApp: formData.phoneWhatsApp.trim(),
        baptismDate: formData.baptismDate || undefined,
        role: formData.role,
        ministry: formData.ministry,
        status: 'Ativo',
        ...formData
      } as any);
      showToast(`Membro "${formData.fullName}" cadastrado com sucesso!`);
    }

    setActiveView('lista');
  };

  // Handle URL parameters from Spotlight (?memberId=... or ?action=new)
  useEffect(() => {
    const memberIdParam = searchParams.get('memberId');
    const actionParam = searchParams.get('action');

    if (actionParam === 'new') {
      handleOpenNewForm();
      setSearchParams({}, { replace: true });
    } else if (memberIdParam) {
      const found = members.find((m) => m.id === memberIdParam);
      if (found) {
        setActiveView('lista');
        setSelectedMember(found);
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, members]);

  const confirmSingleDelete = () => {
    if (!memberToDelete) return;
    deleteMember(memberToDelete.id);
    if (selectedMember?.id === memberToDelete.id) {
      setSelectedMember(null);
    }
    showToast(`Membro "${memberToDelete.fullName}" excluído com sucesso.`);
    setMemberToDelete(null);
  };

  const confirmBulkDelete = (clearSelection: () => void) => {
    if (!bulkDeleteList || bulkDeleteList.length === 0) return;
    bulkDeleteList.forEach((m) => deleteMember(m.id));
    showToast(`${bulkDeleteList.length} cadastros excluídos com sucesso.`);
    setBulkDeleteList(null);
    clearSelection();
  };

  const handleBulkAssignMinistry = (
    selectedRows: ChurchMember[],
    ministry: ChurchMinistry,
    clearSelection: () => void
  ) => {
    selectedRows.forEach((m) => updateMember(m.id, { ministry }));
    showToast(
      `Ministério "${ministry}" atribuído para ${selectedRows.length} ${
        selectedRows.length === 1 ? 'membro' : 'membros'
      }!`
    );
    clearSelection();
  };

  const handleBulkCopyPhones = (selectedRows: ChurchMember[]) => {
    const listText = selectedRows
      .map((m) => `${m.fullName}: ${m.phoneWhatsApp || 'Sem telefone'}`)
      .join('\n');
    navigator.clipboard.writeText(listText);
    showToast(`Contatos de ${selectedRows.length} membros copiados!`);
  };

  // Opções dinâmicas de Ministérios e Cargos para o Combobox
  const ministryOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const min = m.ministry || 'Nenhum';
      counts[min] = (counts[min] || 0) + 1;
    });
    const allMinistries = Array.from(
      new Set(['Louvor', 'Recepção', 'Mídia', 'Infantil', 'Jovens', 'Intercessão', 'Ação Social', 'Nenhum', ...Object.keys(counts)])
    );
    return allMinistries.map((min) => ({
      value: min,
      label: min === 'Nenhum' ? 'Sem Ministério' : `Min. ${min}`,
      count: counts[min] || 0,
    }));
  }, [members]);

  const roleOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const r = m.role || 'Membro';
      counts[r] = (counts[r] || 0) + 1;
    });
    return [
      { value: 'todos', label: 'Todos os Cargos', count: members.length },
      { value: 'Pastor', label: 'Pastor', count: counts['Pastor'] || 0 },
      { value: 'Líder', label: 'Líder', count: counts['Líder'] || 0 },
      { value: 'Membro', label: 'Membro', count: counts['Membro'] || 0 },
      { value: 'Visitante', label: 'Visitante', count: counts['Visitante'] || 0 },
      { value: 'Criança', label: 'Criança / Infantil', count: counts['Criança'] || 0 },
    ];
  }, [members]);

  // Filtragem combinada da Lista
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const term = search.toLowerCase();
      const matchSearch =
        m.fullName.toLowerCase().includes(term) ||
        (m.phoneWhatsApp && m.phoneWhatsApp.includes(term)) ||
        (m.ministry && m.ministry.toLowerCase().includes(term));
      const matchRole = !roleFilter || roleFilter === 'todos' || m.role === roleFilter;
      const matchMinistry =
        ministryFilters.length === 0 ||
        ministryFilters.includes(m.ministry || 'Nenhum');
      return matchSearch && matchRole && matchMinistry;
    });
  }, [members, search, roleFilter, ministryFilters]);

  // Definição das Colunas do DataTable (@tanstack/react-table)
  const columns = useMemo<ColumnDef<ChurchMember>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Nome Completo',
        enableHiding: false,
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#082f38] to-cyan-700 text-cyan-100 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {m.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate group-hover:text-[#082f38] transition-colors">
                  {m.fullName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                  <span>{m.status || 'Ativo'}</span>
                  {m.isWorshipMember && (
                    <span className="inline-flex items-center gap-0.5 text-cyan-700 font-bold">
                      • <Music size={10} /> {m.worshipCategory || 'Louvor'}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'phoneWhatsApp',
        header: 'WhatsApp / Celular',
        cell: ({ row }) => {
          const phone = row.original.phoneWhatsApp;
          return phone ? (
            <span className="font-semibold text-slate-700 tabular-nums">{phone}</span>
          ) : (
            <span className="text-slate-400 italic">Não informado</span>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Cargo / Função',
        cell: ({ row }) => {
          const role = row.original.role || 'Membro';
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                role === 'Pastor'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : role === 'Líder'
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-200'
                  : role === 'Visitante'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: 'ministry',
        header: 'Ministério',
        cell: ({ row }) => {
          const min = row.original.ministry;
          return min && min !== 'Nenhum' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-cyan-50 text-[#082f38] border border-cyan-200/60 text-[11px] font-bold">
              {min}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">—</span>
          );
        },
      },
      {
        id: 'maritalStatus',
        accessorFn: (row) => (row as any).maritalStatus || 'CASADO(A)',
        header: 'Estado Civil',
        cell: ({ getValue }) => (
          <span className="text-slate-600 font-medium text-[11px]">
            {String(getValue())}
          </span>
        ),
      },
      {
        id: 'baptized',
        accessorFn: (row) => (row.baptismDate ? 'Sim' : 'Não informado'),
        header: 'Batizado',
        cell: ({ row }) =>
          row.original.baptismDate ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
              <CheckCircle2 size={13} />
              <span>Sim</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">Não informado</span>
          ),
      },
      {
        accessorKey: 'consecutiveAbsences',
        header: 'Assiduidade',
        cell: ({ row }) => {
          const absences = row.original.consecutiveAbsences || 0;
          if (absences >= 2) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black">
                <AlertTriangle size={11} />
                {absences} faltas
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              Regular
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const m = row.original;
          const waUrl = generateWhatsAppUrl(
            m.phoneWhatsApp,
            `A paz do Senhor, ${m.fullName.split(' ')[0]}! Tudo bem com você?`
          );

          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {m.phoneWhatsApp && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Conversar no WhatsApp"
                >
                  <MessageCircle size={15} />
                </a>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    aria-label="Menu de ações do membro"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações do Membro</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setSelectedMember(m)}>
                    <Eye size={14} className="text-cyan-700" />
                    <span>Ver Ficha Pastoral</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleEditMember(m)}>
                    <Edit2 size={14} className="text-slate-600" />
                    <span>Editar Cadastro</span>
                  </DropdownMenuItem>
                  {m.phoneWhatsApp && (
                    <DropdownMenuItem
                      onSelect={() => window.open(waUrl, '_blank')}
                    >
                      <MessageCircle size={14} className="text-emerald-600" />
                      <span>Chamar no WhatsApp</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onSelect={() => {
                      const inviteUrl = `${window.location.origin}${window.location.pathname}#/completar-cadastro?token=${m.inviteToken || m.id}`;
                      navigator.clipboard.writeText(inviteUrl);
                      showToast(`Link de atualização copiado para ${m.fullName.split(' ')[0]}!`);
                    }}
                  >
                    <Copy size={14} className="text-slate-600" />
                    <span>Copiar Link de Cadastro</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="danger"
                    onSelect={() => setMemberToDelete(m)}
                  >
                    <Trash2 size={14} />
                    <span>Excluir Membro</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [generateWhatsAppUrl]
  );

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Navegação entre Visualizações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('lista')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === 'lista'
                ? 'bg-[#082f38] text-cyan-200 shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users size={15} />
            <span>Lista de Membros ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewForm}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === 'formulario' && !editingMemberId
                ? 'bg-[#082f38] text-cyan-200 shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus size={15} />
            <span>Novo Cadastro</span>
          </button>
        </div>

        {activeView === 'formulario' && (
          <button
            type="button"
            onClick={() => setActiveView('lista')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Voltar para a Lista</span>
          </button>
        )}
      </div>

      {activeView === 'formulario' ? (
        /* --- FORMULÁRIO ESTILO BASILÉIA (IMAGEM 3) --- */
        <form onSubmit={handleSaveForm} className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            {/* Header da Seção */}
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <User size={20} className="text-[#082f38]" />
              <h3 className="text-base font-black tracking-tight text-slate-900">
                Informações Pessoais
              </h3>
            </div>

            {/* Grid Cadastral Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Nome Completo */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Nome completo do membro"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>

              {/* Celular / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Celular *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phoneWhatsApp}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneWhatsApp: e.target.value }))
                  }
                  placeholder="(11) 96427-5949"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
                <span className="block text-[10px] text-slate-400 mt-1">
                  * O número acima deve estar disponível para WhatsApp
                </span>
              </div>

              {/* Naturalidade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Naturalidade
                </label>
                <input
                  type="text"
                  value={formData.naturalidade}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, naturalidade: e.target.value }))
                  }
                  placeholder="Ex: São Paulo - SP"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* RG */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  RG
                </label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rg: e.target.value }))
                  }
                  placeholder="00.000.000-0"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* É Estrangeiro? */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  É estrangeiro?
                </label>
                <select
                  value={formData.isForeigner}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isForeigner: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              {/* Estado Civil */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado Civil
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, maritalStatus: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="CASADO(A)">CASADO(A)</option>
                  <option value="SOLTEIRO(A)">SOLTEIRO(A)</option>
                  <option value="DIVORCIADO(A)">DIVORCIADO(A)</option>
                  <option value="VIÚVO(A)">VIÚVO(A)</option>
                  <option value="UNIÃO ESTÁVEL">UNIÃO ESTÁVEL</option>
                </select>
              </div>

              {/* Sexo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sexo
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gender: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="MASCULINO">MASCULINO</option>
                  <option value="FEMININO">FEMININO</option>
                </select>
              </div>

              {/* Cônjuge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cônjuge
                </label>
                <input
                  type="text"
                  value={formData.spouse}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, spouse: e.target.value }))
                  }
                  placeholder="Nome do cônjuge se houver"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* Profissão */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profissão
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, profession: e.target.value }))
                  }
                  placeholder="Ex: Engenheiro, Professor, Autônomo..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* Tem filhos? */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tem filhos?
                </label>
                <select
                  value={formData.hasChildren}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hasChildren: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Não">Não</option>
                  <option value="Sim (1)">Sim (1)</option>
                  <option value="Sim (2)">Sim (2)</option>
                  <option value="Sim (3 ou mais)">Sim (3 ou mais)</option>
                </select>
              </div>

              {/* Doador de Sangue / Órgãos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doador
                </label>
                <select
                  value={formData.isDonor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isDonor: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              {/* Tipo Sanguíneo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo Sanguíneo
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bloodType: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Não sei">Não sei</option>
                </select>
              </div>

              {/* Batizado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batizado
                </label>
                <select
                  value={formData.isBaptized}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isBaptized: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Data de Batismo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data de Batismo
                </label>
                <input
                  type="date"
                  value={formData.baptismDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, baptismDate: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* Papel Eclesiástico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Função / Cargo na Igreja
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value as ChurchRole }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Membro">Membro</option>
                  <option value="Líder">Líder</option>
                  <option value="Pastor">Pastor</option>
                  <option value="Visitante">Visitante</option>
                  <option value="Criança">Criança / Infantil</option>
                </select>
              </div>
            </div>

            {/* Checkboxes de Vida Cristã (Idêntico ao Print 3) */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isFirstTimeAcceptingJesus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFirstTimeAcceptingJesus: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-[#082f38] focus:ring-cyan-500"
                />
                <span>Aceitando Jesus pela primeira vez</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isReconcilingWithJesus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isReconcilingWithJesus: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-[#082f38] focus:ring-cyan-500"
                />
                <span>Reconciliando com Jesus</span>
              </label>
            </div>

            {/* Áreas de Interesse / Hobbies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Áreas de Interesse / Hobbies
              </label>
              <textarea
                rows={3}
                value={formData.interestsAndHobbies}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    interestsAndHobbies: e.target.value,
                  }))
                }
                placeholder="Ex: Louvor, Mídia, Recepção, Ação Social, Esportes, Música..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none resize-y"
              />
            </div>

            {/* Ações do Formulário */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveView('lista')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-950/20 active:scale-95 transition-all"
              >
                <Save size={15} />
                <span>{editingMemberId ? 'Salvar Alterações' : 'Cadastrar Membro'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* --- VISUALIZAÇÃO EM DATATABLE AVANÇADO CORPORATIVO --- */
        <DataTable
          columns={columns}
          data={filteredMembers}
          enableRowSelection
          initialPageSize={10}
          onRowClick={(m) => setSelectedMember(m)}
          columnLabels={{
            fullName: 'Nome Completo',
            phoneWhatsApp: 'WhatsApp / Celular',
            role: 'Cargo / Função',
            ministry: 'Ministério',
            maritalStatus: 'Estado Civil',
            baptized: 'Batizado',
            consecutiveAbsences: 'Assiduidade',
          }}
          emptyTitle="Nenhum membro encontrado para os filtros aplicados"
          emptyDescription="Experimente limpar os filtros ou clique em '+ Novo Cadastro' para registrar uma nova pessoa."
          emptyAction={
            <button
              type="button"
              onClick={handleOpenNewForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#082f38] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-sm hover:bg-[#0a434d] transition-all"
            >
              <Plus size={14} />
              <span>Novo Cadastro</span>
            </button>
          }
          toolbarLeft={
            <>
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, telefone ou ministério..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 outline-none"
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

              <div className="w-full sm:w-48">
                <Combobox
                  options={roleOptions}
                  value={roleFilter}
                  onChange={(val) => setRoleFilter(val || 'todos')}
                  placeholder="Cargo / Função"
                  searchPlaceholder="Buscar cargo..."
                  icon={<Shield size={14} />}
                />
              </div>

              <div className="w-full sm:w-56">
                <Combobox
                  multiple
                  options={ministryOptions}
                  values={ministryFilters}
                  onMultiChange={setMinistryFilters}
                  placeholder="Ministérios"
                  searchPlaceholder="Filtrar ministério..."
                  icon={<Filter size={14} />}
                />
              </div>
            </>
          }
          renderBulkActions={(selectedRows, clearSelection) => (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-cyan-950 hover:bg-cyan-400 text-xs font-black transition-colors"
                  >
                    <Briefcase size={13} />
                    <span>Atribuir Ministério</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Definir Ministério em Lote</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(
                    [
                      'Louvor',
                      'Recepção',
                      'Mídia',
                      'Infantil',
                      'Jovens',
                      'Intercessão',
                      'Ação Social',
                      'Nenhum',
                    ] as ChurchMinistry[]
                  ).map((min) => (
                    <DropdownMenuItem
                      key={min}
                      onSelect={() =>
                        handleBulkAssignMinistry(selectedRows, min, clearSelection)
                      }
                    >
                      <span>{min === 'Nenhum' ? 'Remover Ministério' : `Min. ${min}`}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                onClick={() => handleBulkCopyPhones(selectedRows)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-100 text-xs font-bold transition-colors border border-white/15"
              >
                <Copy size={13} />
                <span>Copiar Contatos</span>
              </button>

              <button
                type="button"
                onClick={() => setBulkDeleteList(selectedRows)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white text-xs font-bold transition-colors border border-rose-500/30"
              >
                <Trash2 size={13} />
                <span>Excluir ({selectedRows.length})</span>
              </button>
            </>
          )}
        />
      )}

      {/* --- GAVETA LATERAL (SHEET) DE FICHA PASTORAL DO MEMBRO --- */}
      <Sheet
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
      >
        <SheetContent side="right">
          {selectedMember && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#082f38] to-cyan-700 text-cyan-100 font-black text-lg flex items-center justify-center shadow-md shrink-0">
                    {selectedMember.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="truncate">
                      {selectedMember.fullName}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#082f38] text-cyan-200">
                        {selectedMember.role || 'Membro'}
                      </span>
                      {selectedMember.ministry &&
                        selectedMember.ministry !== 'Nenhum' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
                            Min. {selectedMember.ministry}
                          </span>
                        )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedMember.status || 'Ativo'}
                      </span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {/* Ações Rápidas Pastorais */}
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedMember.phoneWhatsApp && (
                    <a
                      href={generateWhatsAppUrl(
                        selectedMember.phoneWhatsApp,
                        `A paz do Senhor, ${selectedMember.fullName.split(' ')[0]}! Tudo bem com você?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-colors"
                    >
                      <MessageCircle size={15} />
                      <span>Chamar WhatsApp</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const inviteUrl = `${window.location.origin}${window.location.pathname}#/completar-cadastro?token=${selectedMember.inviteToken || selectedMember.id}`;
                      navigator.clipboard.writeText(inviteUrl);
                      showToast('Link de atualização cadastral copiado!');
                    }}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-[#082f38] border border-cyan-200 text-xs font-bold transition-colors"
                  >
                    <Copy size={14} />
                    <span>Link de Cadastro</span>
                  </button>
                </div>

                {/* Bloco 1: Contato e Dados Pessoais */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-800 flex items-center gap-1.5">
                    <User size={13} />
                    <span>Dados Pessoais & Contato</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        WhatsApp / Celular
                      </span>
                      <span className="font-bold text-slate-800">
                        {selectedMember.phoneWhatsApp || 'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Estado Civil
                      </span>
                      <span className="font-bold text-slate-800">
                        {(selectedMember as any).maritalStatus || 'Casado(a)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Profissão
                      </span>
                      <span className="font-semibold text-slate-700">
                        {(selectedMember as any).profession || 'Não informada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Tipo Sanguíneo
                      </span>
                      <span className="font-semibold text-slate-700">
                        {(selectedMember as any).bloodType || 'O+'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloco 2: Vida Eclesiástica & Batismo */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-800 flex items-center gap-1.5">
                    <Shield size={13} />
                    <span>Vida Eclesiástica & Assiduidade</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Batismo nas Águas
                      </span>
                      <span className="font-bold text-slate-800">
                        {selectedMember.baptismDate
                          ? `Batizado (${selectedMember.baptismDate})`
                          : 'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Faltas Consecutivas
                      </span>
                      <span
                        className={`font-black ${
                          (selectedMember.consecutiveAbsences || 0) >= 2
                            ? 'text-rose-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {selectedMember.consecutiveAbsences || 0} faltas registradas
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Status Cadastral
                      </span>
                      <span className="font-semibold text-slate-700">
                        {selectedMember.registrationStatus || 'COMPLETO'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Desde
                      </span>
                      <span className="font-semibold text-slate-700">
                        {selectedMember.createdAt || '2026'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloco 3: Ministério de Louvor (se aplicável) */}
                {selectedMember.isWorshipMember && (
                  <div className="bg-cyan-950 text-cyan-100 rounded-2xl p-4 border border-cyan-800 space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
                      <Music size={13} />
                      <span>Integrante do Ministério de Louvor</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-cyan-400/80 block text-[10px] font-bold">
                          Função Musical
                        </span>
                        <span className="font-bold text-white">
                          {selectedMember.worshipRole || selectedMember.worshipCategory}
                        </span>
                      </div>
                      <div>
                        <span className="text-cyan-400/80 block text-[10px] font-bold">
                          Liderança de Escala
                        </span>
                        <span className="font-bold text-white">
                          {selectedMember.isWorshipLeader ? 'Líder de Louvor' : 'Integrante'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bloco 4: Interesses / Observações */}
                {(selectedMember as any).interestsAndHobbies && (
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-800">
                      Interesses & Dons
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {(selectedMember as any).interestsAndHobbies}
                    </p>
                  </div>
                )}
              </div>

              <SheetFooter>
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedMember;
                    setSelectedMember(null);
                    setMemberToDelete(target);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Excluir</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedMember;
                    setSelectedMember(null);
                    handleEditMember(target);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md transition-all"
                >
                  <Edit2 size={14} />
                  <span>Editar Ficha Completa</span>
                </button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO INDIVIDUAL --- */}
      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão de membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o cadastro de{' '}
              <strong className="text-slate-900">{memberToDelete?.fullName}</strong>?
              Esta ação removerá o registro da lista ativa da secretaria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={confirmSingleDelete}>
              Sim, Excluir Membro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO EM LOTE --- */}
      <AlertDialog
        open={!!bulkDeleteList}
        onOpenChange={(open) => !open && setBulkDeleteList(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {bulkDeleteList?.length} membros selecionados?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir{' '}
              <strong className="text-slate-900">
                {bulkDeleteList?.length} registros
              </strong>{' '}
              em lote. Confirme apenas se tiver certeza desta operação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              onClick={() => confirmBulkDelete(() => {})}
            >
              Confirmar Exclusão em Lote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
