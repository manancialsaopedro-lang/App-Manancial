import React, { useState } from 'react';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  CheckSquare,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { cn } from '../../lib/utils';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  renderBulkActions?: (
    selectedRows: TData[],
    clearSelection: () => void
  ) => React.ReactNode;
  columnLabels?: Record<string, string>;
  initialPageSize?: number;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = 'Tente ajustar os filtros de busca ou adicione um novo registro.',
  emptyAction,
  onRowClick,
  enableRowSelection = false,
  renderBulkActions,
  columnLabels = {},
  initialPageSize = 10,
  toolbarLeft,
  toolbarRight,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Inject selection checkbox column if enabled
  const tableColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!enableRowSelection) return columns;

    const selectionCol: ColumnDef<TData, TValue> = {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
              }
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Selecionar todos da página"
            className="h-4 w-4 rounded border-slate-300 text-[#082f38] focus:ring-cyan-500 cursor-pointer accent-[#082f38]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Selecionar linha"
            className="h-4 w-4 rounded border-slate-300 text-[#082f38] focus:ring-cyan-500 cursor-pointer accent-[#082f38]"
          />
        </div>
      ),
    };

    return [selectionCol, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original);

  const clearSelection = () => setRowSelection({});

  const hideableColumns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  return (
    <div className="space-y-3">
      {/* Barra de Ferramentas / Controle de Colunas */}
      {(toolbarLeft || toolbarRight || hideableColumns.length > 0) && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {toolbarLeft}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            {toolbarRight}

            {hideableColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <SlidersHorizontal size={14} className="text-cyan-700" />
                    <span>Colunas</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hideableColumns.map((column) => {
                    const label = columnLabels[column.id] || column.id;
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Barra Contextual de Seleção em Massa */}
      {selectedRows.length > 0 && (
        <div className="bg-[#082f38] text-white rounded-2xl px-4 py-3 shadow-lg border border-cyan-700/50 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <CheckSquare size={15} />
            </div>
            <span className="text-xs font-black tracking-wide">
              {selectedRows.length}{' '}
              {selectedRows.length === 1 ? 'registro selecionado' : 'registros selecionados'}
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-[11px] text-cyan-300 hover:text-white underline ml-1 inline-flex items-center gap-1"
            >
              <X size={12} /> Limpar
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {renderBulkActions?.(selectedRows, clearSelection)}
          </div>
        </div>
      )}

      {/* Contêiner da Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-black uppercase tracking-wider text-[10px]"
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'py-3.5 px-4 select-none whitespace-nowrap',
                          header.id === 'select' && 'w-10 px-3',
                          canSort &&
                            'cursor-pointer hover:bg-slate-100/80 hover:text-slate-800 transition-colors'
                        )}
                        onClick={
                          canSort ? header.column.getToggleSortingHandler() : undefined
                        }
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              'flex items-center gap-1.5',
                              header.id === 'actions' && 'justify-end'
                            )}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {canSort && (
                              <span className="text-slate-400">
                                {sorted === 'asc' ? (
                                  <ArrowUp size={12} className="text-cyan-700 stroke-[2.5]" />
                                ) : sorted === 'desc' ? (
                                  <ArrowDown size={12} className="text-cyan-700 stroke-[2.5]" />
                                ) : (
                                  <ArrowUpDown size={12} className="opacity-50" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {table.getVisibleFlatColumns().map((col) => (
                      <td key={col.id} className="py-4 px-4">
                        <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'transition-colors group',
                      onRowClick && 'cursor-pointer',
                      row.getIsSelected()
                        ? 'bg-cyan-50/60 hover:bg-cyan-50'
                        : 'hover:bg-slate-50/90'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          'py-3.5 px-4 align-middle',
                          cell.column.id === 'select' && 'w-10 px-3'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={table.getVisibleFlatColumns().length || 1}
                    className="py-12 px-6 text-center"
                  >
                    <p className="text-sm font-black text-slate-700">{emptyTitle}</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      {emptyDescription}
                    </p>
                    {emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        {!loading && data.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-500">
                Total:{' '}
                <strong className="text-slate-900 font-black">{data.length}</strong>{' '}
                {data.length === 1 ? 'registro' : 'registros'}
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 hidden sm:inline">Exibir:</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  aria-label="Itens por página"
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-cyan-600 outline-none"
                >
                  {[10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} / pág
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 mr-1">
                Página {table.getState().pagination.pageIndex + 1} de{' '}
                {Math.max(1, table.getPageCount())}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Primeira página"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Página anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Próxima página"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  title="Última página"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
