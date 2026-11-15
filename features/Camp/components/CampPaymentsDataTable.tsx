import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  DollarSign,
  UserPlus,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  CheckSquare,
  X,
  CreditCard,
  QrCode,
  Users
} from 'lucide-react';
import { Person, PaymentMethod, TeamId } from '../../../types';
import { CAMP_TOTAL_PRICE, INSTALLMENT_VALUE, INSTALLMENT_COUNT, TEAM_UI } from '../../../constants';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/DropdownMenu';

interface CampPaymentsDataTableProps {
  people: Person[];
  isDarkMode: boolean;
  onOpenPaymentModal: (person: Person, suggestedInstallment?: number) => void;
  onSendPastorMessage: (person: Person) => void;
  onOpenAddPersonModal: () => void;
  onCopyReport: () => void;
  onQuickToggleInstallment?: (person: Person, installmentNumber: number) => void;
}

export const CampPaymentsDataTable: React.FC<CampPaymentsDataTableProps> = ({
  people,
  isDarkMode,
  onOpenPaymentModal,
  onSendPastorMessage,
  onOpenAddPersonModal,
  onCopyReport,
  onQuickToggleInstallment
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'QUITADO' | 'PARCIAL' | 'PENDENTE'>('TODOS');
  const [teamFilter, setTeamFilter] = useState<string>('TODAS');
  const [typeFilter, setTypeFilter] = useState<string>('TODOS');
  
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'remaining', desc: true }
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Filtragem dos dados
  const filteredData = useMemo(() => {
    return people.filter((p) => {
      const targetPrice = p.totalPrice || CAMP_TOTAL_PRICE;
      const paid = p.amountPaid || 0;
      
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'QUITADO') matchesStatus = paid >= targetPrice;
      else if (statusFilter === 'PARCIAL') matchesStatus = paid > 0 && paid < targetPrice;
      else if (statusFilter === 'PENDENTE') matchesStatus = paid === 0;

      let matchesTeam = true;
      if (teamFilter !== 'TODAS') matchesTeam = p.teamId === teamFilter;

      let matchesType = true;
      if (typeFilter !== 'TODOS') matchesType = p.personType === typeFilter;

      return matchesSearch && matchesStatus && matchesTeam && matchesType;
    });
  }, [people, search, statusFilter, teamFilter, typeFilter]);

  // Exportar dados para CSV
  const exportRowsToCSV = (rowsToExport: Person[], filenamePrefix: string) => {
    const headers = ['Nome', 'Tipo', 'Equipe', 'Status', 'Valor Total', 'Valor Pago', 'Saldo Restante', 'Parcelas Pagas', 'Forma Pgto', 'Último Pgto'];
    const rows = rowsToExport.map(p => {
      const price = p.totalPrice || CAMP_TOTAL_PRICE;
      const paid = p.amountPaid || 0;
      const remaining = Math.max(0, price - paid);
      const parcels = Math.min(INSTALLMENT_COUNT, Math.floor(paid / INSTALLMENT_VALUE));
      const teamName = p.teamId && TEAM_UI[p.teamId] ? TEAM_UI[p.teamId].name : 'Sem Equipe';
      const status = paid >= price ? '100% Quitado' : paid > 0 ? `${parcels}/6 Pago` : 'Pendente';
      const dateStr = p.lastPaymentDate ? new Date(p.lastPaymentDate).toLocaleDateString('pt-BR') : '-';
      
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        p.personType || 'Membro',
        teamName,
        status,
        price.toFixed(2),
        paid.toFixed(2),
        remaining.toFixed(2),
        `${parcels}/6`,
        p.paymentMethod || '-',
        dateStr
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    exportRowsToCSV(filteredData, 'acampamento_pagamentos');
  };

  // Definição das Colunas
  const columns = useMemo<ColumnDef<Person>[]>(() => [
    {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Selecionar todos"
            className="h-4 w-4 rounded border-slate-400 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Selecionar linha"
            className="h-4 w-4 rounded border-slate-400 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
          />
        </div>
      ),
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Participante',
      cell: ({ row }) => {
        const person = row.original;
        const teamInfo = person.teamId && person.teamId !== 'none' && person.teamId !== 'org' ? TEAM_UI[person.teamId] : null;

        return (
          <div className="flex items-center gap-2.5 min-w-[180px]">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
              teamInfo ? `${teamInfo.color} ${teamInfo.text}` : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {person.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-black text-xs md:text-sm block truncate text-slate-900 dark:text-slate-100">
                {person.name}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span>{person.personType || 'Membro'}</span>
                <span>•</span>
                <span>{person.ageGroup || 'Adulto'}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'team',
      header: 'Tribo / Equipe',
      cell: ({ row }) => {
        const tid = row.original.teamId;
        const info = tid && tid !== 'none' && tid !== 'org' ? TEAM_UI[tid] : null;
        if (!info) {
          return <span className="text-[11px] text-slate-400 font-semibold italic">Sem Equipe</span>;
        }
        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase inline-flex items-center gap-1 ${info.color} ${info.text}`}>
            {info.name}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const p = row.original;
        const targetPrice = p.totalPrice || CAMP_TOTAL_PRICE;
        const paid = p.amountPaid || 0;
        const isFullyPaid = paid >= targetPrice;
        const parcelsPaid = Math.min(INSTALLMENT_COUNT, Math.floor(paid / INSTALLMENT_VALUE));

        if (isFullyPaid) {
          return (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
              <CheckCircle2 size={12} /> Quitado
            </span>
          );
        }
        if (paid > 0) {
          return (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 inline-flex items-center gap-1">
              <Clock size={12} /> {parcelsPaid}/6 Pago
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
            <AlertCircle size={12} /> Pendente
          </span>
        );
      },
    },
    {
      id: 'amountPaid',
      accessorKey: 'amountPaid',
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-black text-right w-full justify-end"
        >
          <span>Valor Pago</span>
          {column.getIsSorted() === 'asc' ? <ArrowUp size={12} /> : column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ),
      cell: ({ row }) => {
        const paid = row.original.amountPaid || 0;
        return (
          <div className="text-right font-black text-xs md:text-sm text-emerald-600 dark:text-emerald-400">
            R$ {paid.toFixed(2)}
          </div>
        );
      },
    },
    {
      id: 'remaining',
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 font-black text-right w-full justify-end"
        >
          <span>Saldo Restante</span>
          {column.getIsSorted() === 'asc' ? <ArrowUp size={12} /> : column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ),
      sortingFn: (rowA, rowB) => {
        const targetA = rowA.original.totalPrice || CAMP_TOTAL_PRICE;
        const targetB = rowB.original.totalPrice || CAMP_TOTAL_PRICE;
        const remA = targetA - (rowA.original.amountPaid || 0);
        const remB = targetB - (rowB.original.amountPaid || 0);
        return remA - remB;
      },
      cell: ({ row }) => {
        const p = row.original;
        const target = p.totalPrice || CAMP_TOTAL_PRICE;
        const paid = p.amountPaid || 0;
        const rem = Math.max(0, target - paid);

        return (
          <div className={`text-right font-black text-xs md:text-sm ${rem > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
            {rem > 0 ? `R$ ${rem.toFixed(2)}` : 'R$ 0,00'}
          </div>
        );
      },
    },
    {
      id: 'installments',
      header: 'Parcelas (6x de R$ 97)',
      cell: ({ row }) => {
        const person = row.original;
        const paid = person.amountPaid || 0;

        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const targetSlot = num * INSTALLMENT_VALUE;
              const isCovered = paid >= targetSlot;

              return (
                <button
                  key={num}
                  type="button"
                  title={
                    isCovered
                      ? `${num}ª Parcela: PAGA (R$ ${INSTALLMENT_VALUE.toFixed(2)})`
                      : `Clique para lançar ${num}ª parcela (R$ ${INSTALLMENT_VALUE.toFixed(2)})`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQuickToggleInstallment) {
                      onQuickToggleInstallment(person, num);
                    } else {
                      onOpenPaymentModal(person, num);
                    }
                  }}
                  className={`w-6 h-6 rounded-lg text-[10px] font-black transition-all flex items-center justify-center ${
                    isCovered
                      ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 scale-100'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-300'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        );
      },
    },
    {
      id: 'paymentMethod',
      header: 'Forma Pgto',
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        if (!method) return <span className="text-[11px] text-slate-400">-</span>;
        
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            {method === 'Pix' ? <QrCode size={11} className="text-emerald-500" /> : <CreditCard size={11} className="text-blue-500" />}
            {method}
          </span>
        );
      },
    },
    {
      id: 'lastPaymentDate',
      header: 'Último Pgto',
      cell: ({ row }) => {
        const date = row.original.lastPaymentDate;
        if (!date) return <span className="text-[11px] text-slate-400">-</span>;
        return (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {new Date(date).toLocaleDateString('pt-BR')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => <span className="text-right block">Ações</span>,
      cell: ({ row }) => {
        const person = row.original;
        const targetPrice = person.totalPrice || CAMP_TOTAL_PRICE;
        const paid = person.amountPaid || 0;
        const isFullyPaid = paid >= targetPrice;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Botão WhatsApp */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSendPastorMessage(person);
              }}
              title="Enviar recibo ou mensagem pastoral via WhatsApp"
              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 transition-colors"
            >
              <MessageSquare size={14} />
            </button>

            {/* Botão Lançar Pagamento */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPaymentModal(person);
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-sm transition-all active:scale-95 ${
                isFullyPaid
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              <DollarSign size={13} />
              <span>{isFullyPaid ? 'Ajustar' : 'Lançar'}</span>
            </button>
          </div>
        );
      },
    },
  ], [onOpenPaymentModal, onSendPastorMessage, onQuickToggleInstallment]);

  const table = useReactTable<Person>({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(r => r.original);

  const columnLabels: Record<string, string> = {
    name: 'Participante',
    team: 'Tribo / Equipe',
    status: 'Status',
    amountPaid: 'Valor Pago',
    remaining: 'Saldo Restante',
    installments: 'Parcelas (6x)',
    paymentMethod: 'Forma Pgto',
    lastPaymentDate: 'Último Pgto',
    actions: 'Ações'
  };

  const hideableColumns = table.getAllColumns().filter(
    (col) => typeof col.accessorFn !== 'undefined' && col.getCanHide()
  );

  return (
    <div className="space-y-4">
      
      {/* BARRA DE FERRAMENTAS SUPERIOR: Busca, Filtros Rápidos & Ações */}
      <div className={`p-4 rounded-3xl border shadow-sm space-y-3.5 ${
        isDarkMode ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Busca por Nome */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar participante por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-700 text-white focus:border-purple-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-500 focus:bg-white'
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Botões de Ação Direta */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Exportar CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Exportar tabela para planilha CSV"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* Copiar Resumo Executivo */}
            <button
              type="button"
              onClick={onCopyReport}
              className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Copiar relatório formatado para WhatsApp"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Relatório WhatsApp</span>
            </button>

            {/* Menu de Colunas Visíveis */}
            {hideableColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isDarkMode
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span className="hidden sm:inline">Colunas</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Colunas da Tabela</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hideableColumns.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {columnLabels[col.id] || col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Novo Participante */}
            <button
              type="button"
              onClick={onOpenAddPersonModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            >
              <UserPlus size={15} />
              <span>Novo Inscrito</span>
            </button>

          </div>
        </div>

        {/* Pílulas de Filtro de Status & Seletores */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">Status:</span>
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'QUITADO', label: '100% Quitado' },
              { id: 'PARCIAL', label: 'Parcial (X/6)' },
              { id: 'PENDENTE', label: 'Pendente (R$ 0)' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  statusFilter === st.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Filtro Equipe */}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <option value="TODAS">Todas as Tribos</option>
              <option value="alianca">Tribo Aliança</option>
              <option value="segredo">Tribo Segredo</option>
              <option value="caminho">Tribo Caminho</option>
              <option value="none">Sem Equipe</option>
            </select>

            {/* Filtro Tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="Membro">Membro</option>
              <option value="Visitante">Visitante</option>
            </select>
          </div>

        </div>

      </div>

      {/* AÇÕES EM MASSA (Quando houver seleção) */}
      {selectedRows.length > 0 && (
        <div className="bg-purple-900/90 text-white rounded-2xl px-4 py-3 shadow-lg border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <CheckSquare size={15} />
            </div>
            <span className="text-xs font-black tracking-wide">
              {selectedRows.length} {selectedRows.length === 1 ? 'participante selecionado' : 'participantes selecionados'}
            </span>
            <button
              type="button"
              onClick={() => setRowSelection({})}
              className="text-[11px] text-purple-300 hover:text-white underline ml-1 inline-flex items-center gap-1"
            >
              <X size={12} /> Desmarcar todos
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="text-purple-200 font-bold">
              Total Pago Selecionados: R$ {selectedRows.reduce((acc, p) => acc + (p.amountPaid || 0), 0).toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => exportRowsToCSV(selectedRows, 'acampamento_selecionados')}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-[11px] inline-flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              <span>Exportar Selecionados</span>
            </button>
          </div>
        </div>
      )}

      {/* TABELA COMPLETA (Responsiva com Rolagem Horizontal Suave) */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${
        isDarkMode ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className={`border-b text-[10px] font-black uppercase tracking-wider ${
                    isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200/80 text-slate-500'
                  }`}
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className={`py-3.5 px-4 select-none whitespace-nowrap ${
                          header.id === 'select' ? 'w-10 px-3' : ''
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertCircle size={32} className="mx-auto text-slate-400 opacity-50" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Nenhum participante encontrado</p>
                      <p className="text-xs text-slate-400">Tente ajustar os filtros ou cadastrar um novo participante.</p>
                      <button
                        type="button"
                        onClick={onOpenAddPersonModal}
                        className="mt-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        <UserPlus size={14} /> Cadastrar Participante
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.getIsSelected()
                        ? isDarkMode ? 'bg-purple-950/30' : 'bg-purple-50/70'
                        : isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO & TOTAIS */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50/60 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <span>
              Exibindo <strong>{table.getRowModel().rows.length}</strong> de <strong>{filteredData.length}</strong> participantes
            </span>
            <span className="text-slate-400">•</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className={`py-1 px-2 rounded-lg text-xs font-bold border outline-none ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {[10, 15, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} por página
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold mr-2">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
            </span>
            <button
              type="button"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
