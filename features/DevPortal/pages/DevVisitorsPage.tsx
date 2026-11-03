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
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useChurchStore } from '../../../store/churchStore';
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

interface VisitorItem {
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
}

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
    wants_visit: false,
    visit_count: 1,
    notes:
      'Momento: QUERO_SER_MEMBRO | Opção Membresia: DEPOIS | Histórico de Fé: PROTESTANTE | Denominação: Batista | Pedido de Oração: Por recolocação profissional',
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
    notes: 'Momento: APENAS_VISITANTE | Histórico de Fé: CATOLICA',
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
    notes:
      'Momento: QUERO_SER_MEMBRO | Opção Membresia: AGORA | Nascimento: 12/03/1998 | Batizado nas águas: SIM | Denominação: Assembleia de Deus',
  },
];

// Helper para parsear as notas estruturadas do Wizard de Visitantes
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
  const [visitors, setVisitors] = useState<VisitorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<
    'TODOS' | 'PRIMEIRA_VEZ' | 'QUER_MEMBRAR' | 'ORACAO'
  >('TODOS');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const visitorPublicUrl = `${window.location.origin}${window.location.pathname}#/visitante`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const { data } = await supabase()
        .from('church_members')
        .select('*')
        .or('source.eq.QR_WIZARD,member_type.eq.Visitante')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
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

  const openWhatsAppContact = (visitor: VisitorItem) => {
    const rawNumber = visitor.whatsapp || visitor.phone || '';
    const cleanPhone = rawNumber.replace(/\D/g, '');
    const firstName = visitor.full_name.split(' ')[0];

    const isMemberInterest =
      visitor.member_type === 'Membro' ||
      visitor.notes?.includes('QUERO_SER_MEMBRO');

    let text = `Olá, ${firstName}! A paz do Senhor! Aqui é da equipe de acolhimento da Igreja Manancial.\n\nFoi uma grande alegria ter você conosco em nosso culto!`;

    if (isMemberInterest) {
      text += `\n\nVimos que você demonstrou interesse em caminhar conosco como membro desta família. Segue o link para você acompanhar nossa igreja e concluir seu cadastro com calma quando quiser:\n${visitorPublicUrl}\n\nEstamos à sua total disposição para orar e conversar. Que Deus abençoe imensamente a sua semana!`;
    } else {
      text += `\n\nEsperamos que tenha se sentido acolhido e em casa. Sempre que desejar, as portas da Manancial estão abertas para você e sua família!\n\nQue Deus abençoe seus passos nesta semana!`;
    }

    const encoded = encodeURIComponent(text);
    const link = `https://wa.me/55${cleanPhone}?text=${encoded}`;
    window.open(link, '_blank');
  };

  const handleIntegrateAsMember = (visitor: VisitorItem) => {
    addMember({
      fullName: visitor.full_name,
      phoneWhatsApp: visitor.whatsapp || visitor.phone || '',
      role: 'Membro',
      ministry: 'Nenhum',
      status: 'Ativo',
    });
    showToast(
      `${visitor.full_name} foi integrado(a) à lista oficial de Membros da Igreja!`
    );
    if (selectedVisitor?.id === visitor.id) {
      setSelectedVisitor(null);
    }
  };

  const handleRemoveVisitor = (id: string, name: string) => {
    setVisitors((prev) => prev.filter((v) => v.id !== id));
    if (selectedVisitor?.id === id) setSelectedVisitor(null);
    showToast(`Registro de visitante "${name}" removido.`);
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter((item) => {
      const matchesSearch =
        item.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.whatsapp && item.whatsapp.includes(search));

      if (!matchesSearch) return false;

      if (filterType === 'PRIMEIRA_VEZ') return item.is_first_time;
      if (filterType === 'QUER_MEMBRAR')
        return (
          item.member_type === 'Membro' ||
          item.notes?.includes('QUERO_SER_MEMBRO')
        );
      if (filterType === 'ORACAO')
        return item.needs_prayer || item.notes?.includes('Oração');

      return true;
    });
  }, [visitors, search, filterType]);

  // Colunas do DataTable de Visitantes
  const columns = useMemo<ColumnDef<VisitorItem>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'Visitante',
        enableHiding: false,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-900 text-cyan-200 font-black text-xs flex items-center justify-center shrink-0">
                {v.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  {v.full_name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {v.visit_count || 1}ª presença registrada
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'whatsapp',
        header: 'WhatsApp',
        cell: ({ row }) => {
          const phone = row.original.whatsapp || row.original.phone;
          return phone ? (
            <span className="font-semibold text-slate-700 tabular-nums">
              {phone}
            </span>
          ) : (
            <span className="text-slate-400 italic">Não informado</span>
          );
        },
      },
      {
        id: 'profile',
        accessorFn: (row) =>
          row.member_type === 'Membro' || row.notes?.includes('QUERO_SER_MEMBRO')
            ? 'Quer Membrar'
            : 'Visitante',
        header: 'Intenção / Momento',
        cell: ({ row }) => {
          const v = row.original;
          const isMemberInterest =
            v.member_type === 'Membro' || v.notes?.includes('QUERO_SER_MEMBRO');
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              {v.is_first_time && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  1ª Visita
                </span>
              )}
              {isMemberInterest ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-200 flex items-center gap-1">
                  <Church className="w-2.5 h-2.5" />
                  Quer Membrar
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Visitante
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: 'pastoralCare',
        accessorFn: (row) => (row.needs_prayer ? 'Oração' : 'Normal'),
        header: 'Cuidado Pastoral',
        cell: ({ row }) => {
          const v = row.original;
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              {v.needs_prayer ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-purple-800 font-bold bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-lg">
                  <Heart className="w-3 h-3 text-purple-600" />
                  Pediu Oração
                </span>
              ) : v.wants_visit ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-bold bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg">
                  Deseja Visita
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Acolhimento padrão</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Data da Visita',
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
              <button
                type="button"
                onClick={() => openWhatsAppContact(v)}
                disabled={!v.whatsapp && !v.phone}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-2xs transition-colors disabled:opacity-40"
                title="Enviar boas-vindas no WhatsApp"
              >
                <MessageSquare size={12} />
                <span className="hidden sm:inline">Boas-Vindas</span>
              </button>

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
                  <DropdownMenuLabel>Acolhimento</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setSelectedVisitor(v)}>
                    <Eye size={14} className="text-cyan-700" />
                    <span>Ver Ficha de Acolhimento</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openWhatsAppContact(v)}>
                    <MessageSquare size={14} className="text-emerald-600" />
                    <span>Enviar WhatsApp de Boas-Vindas</span>
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
                    <span>Remover da Lista</span>
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
    <div className="space-y-6 pb-20">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header com Ações Rápidas */}
      <div className="bg-gradient-to-r from-[#0a2f38] via-[#0d3b46] to-[#0a3f4a] p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-semibold mb-2">
            <Droplet className="w-3.5 h-3.5 text-cyan-300" />
            Recepção de Visitantes & Conexão
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Visitantes da Manancial
          </h1>
          <p className="text-xs text-cyan-100/80 mt-1 max-w-xl">
            Acompanhe em tempo real quem participou do culto, clique em qualquer linha para abrir a gaveta pastoral e integre novos membros com 1 clique.
          </p>
        </div>

        {/* Link / QR Code do Wizard */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-colors active:scale-95"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir Wizard</span>
          </a>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredVisitors}
          loading={loading}
          enableRowSelection
          onRowClick={(v) => setSelectedVisitor(v)}
          columnLabels={{
            full_name: 'Visitante',
            whatsapp: 'WhatsApp',
            profile: 'Intenção / Momento',
            pastoralCare: 'Cuidado Pastoral',
            created_at: 'Data da Visita',
          }}
          emptyTitle="Nenhum visitante encontrado"
          emptyDescription="Compartilhe o link do wizard durante os cultos para que os visitantes preencham em tempo real."
          toolbarLeft={
            <>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou WhatsApp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
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
                  { id: 'TODOS', label: 'Todos' },
                  { id: 'PRIMEIRA_VEZ', label: '1ª Vez' },
                  { id: 'QUER_MEMBRAR', label: 'Quer Membrar' },
                  { id: 'ORACAO', label: 'Pediu Oração' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterType(f.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      filterType === f.id
                        ? 'bg-[#082f38] text-cyan-200 shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          }
          toolbarRight={
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className="p-1.5 rounded-lg bg-white text-[#082f38] shadow-2xs"
                title="Visualização em Tabela"
              >
                <Table2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
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
        /* Modo Cards alternativo */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou WhatsApp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
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
                  className="p-1.5 rounded-lg bg-white text-[#082f38] shadow-2xs"
                  title="Visualização em Cards"
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVisitors.map((item) => {
              const isMemberInterest =
                item.member_type === 'Membro' ||
                item.notes?.includes('QUERO_SER_MEMBRO');
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedVisitor(item)}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">
                          {item.full_name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {item.whatsapp ? `+55 ${item.whatsapp}` : 'Sem número'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {item.is_first_time && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            1ª Visita
                          </span>
                        )}
                        {isMemberInterest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 flex items-center gap-1">
                            <Church className="w-2.5 h-2.5" />
                            Quer Membrar
                          </span>
                        )}
                      </div>
                    </div>

                    {item.notes && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                        <p className="line-clamp-3 leading-relaxed">{item.notes}</p>
                      </div>
                    )}

                    {item.needs_prayer && (
                      <div className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-lg">
                        <Heart className="w-3 h-3 text-purple-600" />
                        <span>Solicitou oração pastoral</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>

                    <button
                      type="button"
                      onClick={() => openWhatsAppContact(item)}
                      disabled={!item.whatsapp && !item.phone}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors active:scale-95 disabled:opacity-40"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chamar no WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- GAVETA LATERAL (SHEET) DE ACOLHIMENTO DO VISITANTE --- */}
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
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {/* Botão Primário de Boas-Vindas no WhatsApp */}
                <button
                  type="button"
                  onClick={() => openWhatsAppContact(selectedVisitor)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all"
                >
                  <MessageSquare size={16} />
                  <span>Enviar Mensagem de Boas-Vindas no WhatsApp</span>
                </button>

                {/* Resumo Estruturado do Formulário de Recepção */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-800 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Ficha de Recepção (QR Wizard)</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        WhatsApp
                      </span>
                      <span className="font-bold text-slate-800">
                        {selectedVisitor.whatsapp ||
                          selectedVisitor.phone ||
                          'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">
                        Data do Culto
                      </span>
                      <span className="font-bold text-slate-800">
                        {new Date(selectedVisitor.created_at).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                    {Object.entries(selectedNotesMap).map(([label, val]) => (
                      <div key={label} className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">
                          {label}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Destaque de Oração se houver */}
                {selectedVisitor.needs_prayer && (
                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200/80 space-y-1.5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-800 flex items-center gap-1.5">
                      <Heart size={13} />
                      <span>Pedido de Oração Pastoral</span>
                    </h4>
                    <p className="text-xs text-purple-900 font-medium leading-relaxed">
                      {selectedNotesMap['Pedido de Oração'] ||
                        'O visitante solicitou cobertura de oração da equipe pastoral.'}
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
