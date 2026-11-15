import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  PieChart,
  ShieldCheck,
  Receipt,
  FileText,
  ChevronDown,
  X
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { ProjectionItem, Person } from '../../../types';
import { CAMP_TOTAL_PRICE, INSTALLMENT_VALUE } from '../../../constants';
import { createTransaction } from '../../../lib/api/transactions';

interface CampCostsBalanceSectionProps {
  people: Person[];
  isDarkMode: boolean;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CampCostsBalanceSection: React.FC<CampCostsBalanceSectionProps> = ({
  people,
  isDarkMode,
  showToast
}) => {
  const {
    expenseProjections,
    addProjectionItem,
    updateProjectionItem,
    deleteProjectionItem,
    transactions,
    setTransactions
  } = useAppStore();

  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'PAGO' | 'PENDENTE'>('TODOS');
  const [isAddCostModalOpen, setIsAddCostModalOpen] = useState(false);
  const [newCostLabel, setNewCostLabel] = useState('');
  const [newCostAmount, setNewCostAmount] = useState('');
  const [newCostIsPaid, setNewCostIsPaid] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingCostId, setTogglingCostId] = useState<string | null>(null);
  const [isSavingCost, setIsSavingCost] = useState(false);

  // Cálculos de Arrecadação e Custos
  const totalArrecadado = useMemo(() => {
    return people.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
  }, [people]);

  const totalEsperadoInscricoes = useMemo(() => {
    return people.reduce((acc, p) => acc + (p.totalPrice || CAMP_TOTAL_PRICE), 0);
  }, [people]);

  const totalCustosOrcados = useMemo(() => {
    return expenseProjections.reduce((acc, item) => acc + (item.amount || 0), 0);
  }, [expenseProjections]);

  const totalCustosPagos = useMemo(() => {
    return expenseProjections
      .filter((item) => item.isExecuted)
      .reduce((acc, item) => acc + (item.amount || 0), 0);
  }, [expenseProjections]);

  const totalCustosPendentes = Math.max(0, totalCustosOrcados - totalCustosPagos);

  // Balanço: Arrecadado vs Custos
  const saldoOperacional = totalArrecadado - totalCustosOrcados;
  const coberturaCustosPct = totalCustosOrcados > 0 ? (totalArrecadado / totalCustosOrcados) * 100 : 0;
  
  // Ponto de Equilíbrio: Quantos pagantes integrais de R$ 582 são necessários
  const inscritosNecessarios = Math.ceil(totalCustosOrcados / CAMP_TOTAL_PRICE);
  const quitadosCount = people.filter((p) => (p.amountPaid || 0) >= (p.totalPrice || CAMP_TOTAL_PRICE)).length;

  // Filtragem dos Custos
  const filteredCosts = useMemo(() => {
    return expenseProjections.filter((item) => {
      if (filterStatus === 'PAGO') return !!item.isExecuted;
      if (filterStatus === 'PENDENTE') return !item.isExecuted;
      return true;
    });
  }, [expenseProjections, filterStatus]);

  // Ação: Adicionar Novo Custo
  const handleCreateCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingCost) return;
    setFormError(null);
    const trimmedLabel = newCostLabel.trim();
    if (!trimmedLabel) {
      setFormError('Informe uma descrição para o custo.');
      return;
    }
    const amountVal = parseFloat(newCostAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormError('Informe um valor de custo válido maior que zero.');
      return;
    }

    setIsSavingCost(true);
    try {
      if (newCostIsPaid) {
        const createdTx = await createTransaction({
          description: `Pagamento de Custo Retiro: ${trimmedLabel}`,
          amount: amountVal,
          type: 'SAIDA',
          category: 'DESPESA_FIXA',
          date: new Date().toISOString(),
          paymentMethod: 'Pix'
        });
        setTransactions([createdTx, ...transactions.filter((t) => t.id !== createdTx.id)]);
      }

      addProjectionItem(trimmedLabel, amountVal);

      if (newCostIsPaid) {
        const created = useAppStore.getState().expenseProjections.slice(-1)[0];
        if (created) {
          updateProjectionItem(created.id, { isExecuted: true });
        }
      }

      showToast(`Custo "${trimmedLabel}" adicionado com sucesso!`, 'success');
      setNewCostLabel('');
      setNewCostAmount('');
      setNewCostIsPaid(false);
      setFormError(null);
      setIsAddCostModalOpen(false);
    } catch (err) {
      console.error('Erro ao registrar pagamento de custo no Supabase:', err);
      const message = err instanceof Error ? err.message : 'Falha de conexão ou permissão.';
      setFormError(`Não foi possível lançar a saída no Supabase: ${message}`);
    } finally {
      setIsSavingCost(false);
    }
  };

  // Ação: Alternar Status do Custo (Pago / Pendente)
  const handleToggleCostStatus = async (item: ProjectionItem) => {
    if (togglingCostId) return;
    const nextExecuted = !item.isExecuted;

    if (nextExecuted) {
      setTogglingCostId(item.id);
      try {
        const createdTx = await createTransaction({
          description: `Pagamento de Custo Retiro: ${item.label}`,
          amount: item.amount,
          type: 'SAIDA',
          category: 'DESPESA_FIXA',
          date: new Date().toISOString(),
          paymentMethod: 'Pix'
        });
        setTransactions([createdTx, ...transactions.filter((t) => t.id !== createdTx.id)]);
        updateProjectionItem(item.id, { isExecuted: true });
        showToast(`Custo "${item.label}" marcado como PAGO e lançado no caixa!`, 'success');
      } catch (err) {
        console.error('Erro ao registrar saída de custo no Supabase:', err);
        showToast(`Erro ao lançar saída de "${item.label}" no Supabase. Status mantido como PENDENTE.`, 'error');
      } finally {
        setTogglingCostId(null);
      }
    } else {
      updateProjectionItem(item.id, { isExecuted: false });
      showToast(`Custo "${item.label}" marcado como PENDENTE.`);
    }
  };

  // Ação: Excluir Custo (confirmação em duas etapas na própria linha)
  const handleDeleteCost = (id: string, label: string) => {
    deleteProjectionItem(id);
    setConfirmDeleteId(null);
    showToast(`Custo "${label}" removido.`);
  };

  const themeColors = {
    card: isDarkMode ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200/80',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className="space-y-6">
      
      {/* 4 CARDS DE BALANÇO & INDICADORES EXECUTIVOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Arrecadado */}
        <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Arrecadado
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
            R$ {totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            De R$ {totalEsperadoInscricoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} previstos
          </span>
        </div>

        {/* Card 2: Custos Totais Orçados */}
        <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Custos do Retiro
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
            R$ {totalCustosOrcados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            R$ {totalCustosPagos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} já liquidados
          </span>
        </div>

        {/* Card 3: Saldo Líquido Operacional */}
        <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              saldoOperacional >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
            }`}>
              {saldoOperacional >= 0 ? 'Superávit / Margem' : 'Déficit Atual'}
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              saldoOperacional >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {saldoOperacional >= 0 ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
            </div>
          </div>
          <div className={`text-lg md:text-xl font-black ${
            saldoOperacional >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
          }`}>
            R$ {Math.abs(saldoOperacional).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {saldoOperacional >= 0 ? 'Custos 100% cobertos!' : 'Falta para cobrir os custos'}
          </span>
        </div>

        {/* Card 4: Ponto de Equilíbrio */}
        <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Ponto de Equilíbrio
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <PieChart size={16} />
            </div>
          </div>
          <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
            {quitadosCount} <span className="text-xs font-normal text-slate-400">/ {inscritosNecessarios} pessoas</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {quitadosCount >= inscritosNecessarios ? 'Meta de cobertura alcançada' : `Faltam ${Math.max(0, inscritosNecessarios - quitadosCount)} quitarem`}
          </span>
        </div>

      </div>

      {/* TERMÔMETRO VISUAL DE COBERTURA DE CUSTOS */}
      <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${themeColors.card}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className={`text-sm font-black flex items-center gap-2 ${themeColors.textMain}`}>
              <span>Termômetro de Cobertura Financeira</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                coberturaCustosPct >= 100
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
              }`}>
                {coberturaCustosPct.toFixed(1)}% Coberto
              </span>
            </h3>
            <p className={`text-xs ${themeColors.textSec}`}>
              Quanto do valor total de custos orçados já foi arrecadado através das inscrições dos participantes
            </p>
          </div>

          <div className="text-xs font-bold text-slate-400 text-left sm:text-right">
            <span>R$ {totalArrecadado.toFixed(2)} de R$ {totalCustosOrcados.toFixed(2)}</span>
          </div>
        </div>

        {/* Barra de Progresso Dupla */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(100, coberturaCustosPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>R$ 0,00</span>
            <span>Meta de Custos: R$ {totalCustosOrcados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span>Meta de Receita: R$ {totalEsperadoInscricoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* TABELA DE GESTÃO DE CUSTOS DO ACAMPAMENTO */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${themeColors.card}`}>
        
        {/* Header da Tabela com Filtros & Botão Novo Custo */}
        <div className="p-4 md:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div>
            <h3 className={`text-sm md:text-base font-black ${themeColors.textMain}`}>
              Orçamento de Custos & Despesas do Retiro
            </h3>
            <p className={`text-xs ${themeColors.textSec}`}>
              Gerencie cada despesa contratada (chácara, alimentação, cozinheiro, tenda, som)
            </p>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Filtro Status */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {(['TODOS', 'PAGO', 'PENDENTE'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all ${
                    filterStatus === st
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {st === 'TODOS' ? 'Todos' : st === 'PAGO' ? 'Pagos' : 'Pendentes'}
                </button>
              ))}
            </div>

            {/* Botão Adicionar Custo */}
            <button
              type="button"
              onClick={() => setIsAddCostModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-transform active:scale-95 shrink-0"
            >
              <Plus size={14} />
              <span>Adicionar Custo</span>
            </button>

          </div>

        </div>

        {/* Tabela de Custos */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <th className="py-3 px-4">Item / Despesa</th>
                <th className="py-3 px-4 text-right">Valor Orçado</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
              {filteredCosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    <p className="font-bold text-xs">Nenhum custo cadastrado com esse filtro.</p>
                  </td>
                </tr>
              ) : (
                filteredCosts.map((item) => {
                  const isPaid = !!item.isExecuted;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Descrição */}
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100 text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>{item.label}</span>
                        </div>
                      </td>

                      {/* Valor */}
                      <td className="py-3.5 px-4 text-right font-black text-xs md:text-sm text-slate-900 dark:text-white">
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={togglingCostId === item.id}
                          onClick={() => handleToggleCostStatus(item)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 transition-all disabled:opacity-50 ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{togglingCostId === item.id ? 'Salvando...' : isPaid ? 'Pago' : 'Pendente'}</span>
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={togglingCostId === item.id}
                            onClick={() => handleToggleCostStatus(item)}
                            title={isPaid ? 'Marcar como pendente' : 'Marcar como pago'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                          {confirmDeleteId === item.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteCost(item.id, item.label)}
                                className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              title="Excluir custo"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Totais dos Custos */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div>
            <span>Total de itens listados: <strong>{filteredCosts.length}</strong></span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400">
              Já Pagos: R$ {totalCustosPagos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-amber-500">
              Pendentes: R$ {totalCustosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>

      {/* MODAL: ADICIONAR NOVO CUSTO */}
      {isAddCostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl ${themeColors.card}`}>
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Receipt size={20} />
                <h3 className={`text-base font-black ${themeColors.textMain}`}>Adicionar Custo do Retiro</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCostModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCost} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Descrição do Custo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Combustível Van, Açougue, Som..."
                  value={newCostLabel}
                  onChange={(e) => setNewCostLabel(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Valor Orçado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0,00"
                  value={newCostAmount}
                  onChange={(e) => setNewCostAmount(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>

              {formError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="costIsPaid"
                  checked={newCostIsPaid}
                  onChange={(e) => setNewCostIsPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                />
                <label htmlFor="costIsPaid" className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                  Marcar este custo como já liquidado (Pago)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCostModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCost}
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSavingCost ? 'Salvando...' : 'Salvar Custo'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
