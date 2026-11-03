import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Search,
  Plus,
  Minus,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  Share2,
  DollarSign,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  Receipt,
  Users,
  ArrowLeft,
  Trash2,
  AlertCircle,
  X,
  ChevronDown,
  Sparkles,
  Percent,
  ShieldCheck,
  Check,
  Download,
  HeartHandshake
} from 'lucide-react';
import { useAppStore } from '../../store';
import { Transaction, TransactionCategory, TransactionType, PaymentMethod, Person } from '../../types';
import { listTransactions, createTransaction, deleteTransaction } from '../../lib/api/transactions';
import { listPeople } from '../../lib/api/people';

interface BillScheduleItem {
  id: string;
  title: string;
  category: TransactionCategory;
  amount: number;
  dueDay: number;
  status: 'PENDENTE' | 'PAGO';
  assignee?: string;
}

const DEFAULT_FIXED_BILLS: BillScheduleItem[] = [
  { id: 'bill-1', title: 'Aluguel do Templo Manancial', category: 'DESPESA_FIXA', amount: 3500, dueDay: 10, status: 'PENDENTE' },
  { id: 'bill-2', title: 'Energia Elétrica (Enel)', category: 'DESPESA_FIXA', amount: 620, dueDay: 15, status: 'PENDENTE' },
  { id: 'bill-3', title: 'Água e Saneamento (Sabesp)', category: 'DESPESA_FIXA', amount: 140, dueDay: 18, status: 'PENDENTE' },
  { id: 'bill-4', title: 'Internet Fibra Óptica & Streaming', category: 'DESPESA_FIXA', amount: 160, dueDay: 5, status: 'PAGO' },
  { id: 'bill-5', title: 'Manutenção Sistema de Som & Mídia', category: 'MANUTENCAO', amount: 350, dueDay: 20, status: 'PENDENTE' },
  { id: 'bill-6', title: 'Cestas Básicas / Ação Social', category: 'ACAO_SOCIAL', amount: 450, dueDay: 25, status: 'PENDENTE' },
];

export const ChurchFinancialPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, setTransactions, people, setPeople } = useAppStore();

  // Abas do Financeiro: 'fluxo' | 'entradas' | 'saidas' | 'contas' | 'balancete'
  const [activeTab, setActiveTab] = useState<'fluxo' | 'entradas' | 'saidas' | 'contas' | 'balancete'>('fluxo');

  // Filtros de Período: 'mes_atual' | 'mes_anterior' | 'ano' | 'tudo'
  const [periodFilter, setPeriodFilter] = useState<'mes_atual' | 'mes_anterior' | 'ano' | 'tudo'>('mes_atual');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TODAS');

  // Modais de Entrada e Saída
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'DIZIMO' as TransactionCategory,
    paymentMethod: 'Pix' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    personId: '',
    personName: '',
  });
  const [personSearch, setPersonSearch] = useState('');
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Lista de Contas Fixas
  const [fixedBills, setFixedBills] = useState<BillScheduleItem[]>(DEFAULT_FIXED_BILLS);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carregar transações e pessoas
  const loadFinancialData = useCallback(async () => {
    try {
      const [txData, peopleData] = await Promise.all([
        listTransactions(),
        listPeople()
      ]);
      if (txData && txData.length) setTransactions(txData);
      if (peopleData && peopleData.length) setPeople(peopleData);
    } catch (e) {
      console.warn("Erro ao buscar dados remotos do financeiro:", e);
    }
  }, [setPeople, setTransactions]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // Filtragem de Transações por Período
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter(t => {
      const txDate = new Date(t.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      // Filtro de Período
      if (periodFilter === 'mes_atual') {
        if (txYear !== currentYear || txMonth !== currentMonth) return false;
      } else if (periodFilter === 'mes_anterior') {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        if (txYear !== prevYear || txMonth !== prevMonth) return false;
      } else if (periodFilter === 'ano') {
        if (txYear !== currentYear) return false;
      }

      // Filtro de Categoria
      if (selectedCategoryFilter !== 'TODAS' && t.category !== selectedCategoryFilter) {
        return false;
      }

      // Filtro de Busca
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const personMatch = (t.personName || '').toLowerCase().includes(q);
        const catMatch = (t.category || '').toLowerCase().includes(q);
        if (!descMatch && !personMatch && !catMatch) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, periodFilter, selectedCategoryFilter, searchTerm]);

  // Cálculos Consolidados
  const metrics = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;

    // Métricas por categorias de entrada
    let totalDizimos = 0;
    let totalOfertas = 0;
    let totalCantina = 0;
    let totalInscricoes = 0;
    let totalOutrasEntradas = 0;

    // Métricas por categorias de saída
    let totalDespesasFixas = 0;
    let totalMinisterios = 0;
    let totalManutencao = 0;
    let totalAcaoSocial = 0;
    let totalOutrasSaidas = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'ENTRADA') {
        totalEntradas += t.amount;
        if (t.category === 'DIZIMO') totalDizimos += t.amount;
        else if (t.category === 'OFERTA') totalOfertas += t.amount;
        else if (t.category === 'CANTINA') totalCantina += t.amount;
        else if (t.category === 'INSCRICAO') totalInscricoes += t.amount;
        else totalOutrasEntradas += t.amount;
      } else {
        totalSaidas += t.amount;
        if (t.category === 'DESPESA_FIXA') totalDespesasFixas += t.amount;
        else if (t.category === 'MINISTERIO') totalMinisterios += t.amount;
        else if (t.category === 'MANUTENCAO') totalManutencao += t.amount;
        else if (t.category === 'ACAO_SOCIAL') totalAcaoSocial += t.amount;
        else totalOutrasSaidas += t.amount;
      }
    });

    const saldoLiquido = totalEntradas - totalSaidas;

    // Saldo Total Histórico (acumulado de todas as transações)
    const saldoGeralAcumulado = transactions.reduce((acc, t) => {
      return t.type === 'ENTRADA' ? acc + t.amount : acc - t.amount;
    }, 0);

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido,
      saldoGeralAcumulado,
      totalDizimos,
      totalOfertas,
      totalCantina,
      totalInscricoes,
      totalOutrasEntradas,
      totalDespesasFixas,
      totalMinisterios,
      totalManutencao,
      totalAcaoSocial,
      totalOutrasSaidas,
      count: filteredTransactions.length
    };
  }, [filteredTransactions, transactions]);

  // Autocomplete de pessoas para vínculo
  const filteredPeople = useMemo(() => {
    if (!personSearch.trim()) return people.slice(0, 6);
    return people
      .filter(p => p.name.toLowerCase().includes(personSearch.toLowerCase()))
      .slice(0, 6);
  }, [people, personSearch]);

  // Submissão de Nova Entrada ou Saída
  const handleSaveTransaction = async () => {
    if (!formData.description.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      showToast('Preencha a descrição e um valor válido.');
      return;
    }

    setIsSaving(true);
    try {
      await createTransaction({
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: modalType || 'ENTRADA',
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        paymentMethod: formData.paymentMethod,
        personId: formData.personId || undefined,
        personName: formData.personName || undefined,
        isSettled: true
      });

      showToast(
        modalType === 'ENTRADA'
          ? `✅ Entrada de R$ ${parseFloat(formData.amount).toFixed(2)} registrada com sucesso!`
          : `✅ Saída de R$ ${parseFloat(formData.amount).toFixed(2)} lançada na tesouraria!`
      );

      setModalType(null);
      setFormData({
        description: '',
        amount: '',
        category: 'DIZIMO',
        paymentMethod: 'Pix',
        date: new Date().toISOString().split('T')[0],
        personId: '',
        personName: ''
      });
      await loadFinancialData();
    } catch (err: any) {
      showToast(`Erro ao registrar: ${err.message || 'Tente novamente.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Exclusão de Transação
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento financeiro?')) return;
    try {
      await deleteTransaction(id);
      showToast('Lançamento excluído.');
      await loadFinancialData();
    } catch (err: any) {
      showToast(`Erro ao excluir: ${err.message}`);
    }
  };

  // Exportar Balancete formatado para WhatsApp
  const handleShareBalancete = () => {
    const periodLabel =
      periodFilter === 'mes_atual'
        ? 'Mês Atual'
        : periodFilter === 'mes_anterior'
        ? 'Mês Anterior'
        : periodFilter === 'ano'
        ? 'Ano Completo'
        : 'Geral';

    const text =
      `📑 *BALANCETE FINANCEIRO - IGREJA MANANCIAL*\n` +
      `📅 *Período:* ${periodLabel} (${new Date().toLocaleDateString('pt-BR')})\n\n` +
      `🟢 *TOTAL DE ENTRADAS:* R$ ${metrics.totalEntradas.toFixed(2)}\n` +
      `• Dízimos: R$ ${metrics.totalDizimos.toFixed(2)}\n` +
      `• Ofertas: R$ ${metrics.totalOfertas.toFixed(2)}\n` +
      `• Cantina & Eventos: R$ ${metrics.totalCantina.toFixed(2)}\n` +
      `• Inscrições de Retiro: R$ ${metrics.totalInscricoes.toFixed(2)}\n` +
      `• Outras Entradas: R$ ${metrics.totalOutrasEntradas.toFixed(2)}\n\n` +
      `🔴 *TOTAL DE SAÍDAS:* R$ ${metrics.totalSaidas.toFixed(2)}\n` +
      `• Despesas Fixas (Templo, Água, Luz): R$ ${metrics.totalDespesasFixas.toFixed(2)}\n` +
      `• Ministérios (Louvor, Infantil, Jovens): R$ ${metrics.totalMinisterios.toFixed(2)}\n` +
      `• Manutenção & Equipamentos: R$ ${metrics.totalManutencao.toFixed(2)}\n` +
      `• Ação Social / Cestas: R$ ${metrics.totalAcaoSocial.toFixed(2)}\n` +
      `• Outras Despesas: R$ ${metrics.totalOutrasSaidas.toFixed(2)}\n\n` +
      `⚖️ *SUPERÁVIT/DÉFICIT DO PERÍODO:* ${metrics.saldoLiquido >= 0 ? '+' : ''}R$ ${metrics.saldoLiquido.toFixed(2)}\n` +
      `💰 *SALDO ATUAL EM CAIXA/BANCO:* R$ ${metrics.saldoGeralAcumulado.toFixed(2)}\n\n` +
      `_Emitido pela Tesouraria Manancial • Prestação de Contas Ministerial_`;

    navigator.clipboard.writeText(text);
    showToast('📋 Balancete copiado com sucesso! Pronto para colar no WhatsApp dos pastores ou conselho.');
  };

  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-purple-400/40 text-white text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Sparkles size={16} className="text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Principal da Tesouraria */}
      <header className="sticky top-0 z-30 bg-[#070c14]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Logo & Título */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Voltar ao Hub"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
              <Wallet size={20} className="stroke-[2.4]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg text-white tracking-tight">
                  Financeiro Manancial
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Tesouraria Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestão contábil, dízimos, ofertas, despesas fixas e balancetes
              </p>
            </div>
          </div>

          {/* Ações Rápidas de Lançamento */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                setModalType('ENTRADA');
                setFormData({
                  description: '',
                  amount: '',
                  category: 'DIZIMO',
                  paymentMethod: 'Pix',
                  date: new Date().toISOString().split('T')[0],
                  personId: '',
                  personName: ''
                });
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-black transition-all active:scale-95 shadow-md"
            >
              <Plus size={15} />
              <span>Nova Entrada</span>
            </button>

            <button
              onClick={() => {
                setModalType('SAIDA');
                setFormData({
                  description: '',
                  amount: '',
                  category: 'DESPESA_FIXA',
                  paymentMethod: 'Pix',
                  date: new Date().toISOString().split('T')[0],
                  personId: '',
                  personName: ''
                });
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 text-xs font-black transition-all active:scale-95 shadow-md"
            >
              <Minus size={15} />
              <span>Nova Saída</span>
            </button>

            <button
              onClick={() => navigate('/igreja')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
              title="Abrir Painel de Gestão"
            >
              <span>Gestão</span>
            </button>
          </div>
        </div>
      </header>

      {/* Abas e Filtro de Período */}
      <div className="border-b border-white/10 bg-[#070c14]/70 backdrop-blur-md px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2.5">
          {/* Abas */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('fluxo')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'fluxo'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Receipt size={14} />
              <span>Fluxo & Extrato</span>
            </button>

            <button
              onClick={() => setActiveTab('entradas')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'entradas'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp size={14} className="text-emerald-400" />
              <span>Dízimos & Entradas</span>
            </button>

            <button
              onClick={() => setActiveTab('saidas')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'saidas'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingDown size={14} className="text-rose-400" />
              <span>Despesas & Custos</span>
            </button>

            <button
              onClick={() => setActiveTab('contas')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'contas'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Clock size={14} />
              <span>Contas a Pagar</span>
            </button>

            <button
              onClick={() => setActiveTab('balancete')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'balancete'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText size={14} />
              <span>Balancete Mensal</span>
            </button>
          </div>

          {/* Seletor de Período */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setPeriodFilter('mes_atual')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                periodFilter === 'mes_atual' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriodFilter('mes_anterior')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                periodFilter === 'mes_anterior' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mês Anterior
            </button>
            <button
              onClick={() => setPeriodFilter('ano')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                periodFilter === 'ano' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ano {new Date().getFullYear()}
            </button>
            <button
              onClick={() => setPeriodFilter('tudo')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                periodFilter === 'tudo' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Saldo em Caixa / Banco */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#0e172a] to-[#0c1424] border border-purple-500/30 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Saldo em Caixa Geral
              </span>
              <Wallet size={16} className="text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              R$ {metrics.saldoGeralAcumulado.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Disponível em conta e cofre</p>
          </div>

          {/* Card 2: Entradas do Período */}
          <div className="p-5 rounded-3xl bg-[#0d1424] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Entradas no Período
              </span>
              <ArrowUpRight size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              R$ {metrics.totalEntradas.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Dízimos, ofertas, cantina e eventos</p>
          </div>

          {/* Card 3: Saídas do Período */}
          <div className="p-5 rounded-3xl bg-[#0d1424] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Despesas no Período
              </span>
              <ArrowDownRight size={16} className="text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
              R$ {metrics.totalSaidas.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Custos fixos, reformas e ministérios</p>
          </div>

          {/* Card 4: Resultado Líquido */}
          <div
            className={`p-5 rounded-3xl border shadow-xl ${
              metrics.saldoLiquido >= 0
                ? 'bg-gradient-to-br from-emerald-950/30 to-[#0c1424] border-emerald-500/30'
                : 'bg-gradient-to-br from-rose-950/30 to-[#0c1424] border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Resultado Líquido
              </span>
              <Percent size={16} />
            </div>
            <div
              className={`text-2xl sm:text-3xl font-black mt-1 ${
                metrics.saldoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {metrics.saldoLiquido >= 0 ? '+' : ''}R$ {metrics.saldoLiquido.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {metrics.saldoLiquido >= 0 ? 'Superávit operacional' : 'Déficit no período'}
            </p>
          </div>
        </div>

        {/* =========================================================================
            ABA 1: FLUXO DE CAIXA & EXTRATO DE LANÇAMENTOS
           ========================================================================= */}
        {activeTab === 'fluxo' && (
          <div className="p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
            {/* Barra de Filtros e Busca */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por descrição, membro ou categoria..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Filtro por Categoria */}
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="p-2.5 rounded-xl bg-[#0e172a] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                >
                  <option value="TODAS">Todas as Categorias</option>
                  <option value="DIZIMO">Dízimos</option>
                  <option value="OFERTA">Ofertas</option>
                  <option value="CANTINA">Cantina & PDV</option>
                  <option value="INSCRICAO">Inscrições</option>
                  <option value="DESPESA_FIXA">Despesas Fixas</option>
                  <option value="MINISTERIO">Ministérios</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="ACAO_SOCIAL">Ação Social</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
            </div>

            {/* Tabela do Extrato */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-3 font-semibold">Data</th>
                    <th className="pb-3 font-semibold">Descrição</th>
                    <th className="pb-3 font-semibold">Categoria</th>
                    <th className="pb-3 font-semibold">Vínculo</th>
                    <th className="pb-3 font-semibold">Método</th>
                    <th className="pb-3 font-semibold text-right">Valor</th>
                    <th className="pb-3 font-semibold text-center w-12">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.map(t => {
                    const isIncome = t.type === 'ENTRADA';
                    return (
                      <tr key={t.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 text-slate-400 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 font-bold text-white max-w-xs truncate">
                          {t.description}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300 whitespace-nowrap">
                          {t.personName ? (
                            <span className="font-semibold text-purple-300">
                              {t.personName}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 text-slate-400 whitespace-nowrap">
                          {t.paymentMethod || 'Pix'}
                        </td>
                        <td
                          className={`py-3 font-black text-right whitespace-nowrap ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isIncome ? '+ ' : '- '}R$ {t.amount.toFixed(2)}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            title="Excluir lançamento"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Receipt size={36} className="mx-auto text-slate-600 mb-2 opacity-50" />
                Nenhuma transação encontrada no período selecionado.<br />
                Clique em <strong>Nova Entrada</strong> ou <strong>Nova Saída</strong> para lançar.
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ABA 2: DÍZIMOS & ENTRADAS
           ========================================================================= */}
        {activeTab === 'entradas' && (
          <div className="space-y-6">
            {/* Grade de Categorias de Entrada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <HeartHandshake size={16} />
                  <span className="text-xs font-bold uppercase">Dízimos Eclesiásticos</span>
                </div>
                <div className="text-2xl font-black text-white mt-2">
                  R$ {metrics.totalDizimos.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Contribuição dos membros</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <DollarSign size={16} />
                  <span className="text-xs font-bold uppercase">Ofertas dos Cultos</span>
                </div>
                <div className="text-2xl font-black text-white mt-2">
                  R$ {metrics.totalOfertas.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Celebrações de domingo e ensino</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <Receipt size={16} />
                  <span className="text-xs font-bold uppercase">Cantina & Eventos</span>
                </div>
                <div className="text-2xl font-black text-white mt-2">
                  R$ {metrics.totalCantina.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Faturamento PDV da cantina</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Users size={16} />
                  <span className="text-xs font-bold uppercase">Inscrições de Retiro</span>
                </div>
                <div className="text-2xl font-black text-white mt-2">
                  R$ {metrics.totalInscricoes.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Pagamentos de acampamento</p>
              </div>
            </div>

            {/* Lista dos Dízimos e Ofertas Nominais */}
            <div className="p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
              <h4 className="font-black text-sm text-white">Últimas Entradas Registradas</h4>
              <div className="space-y-2">
                {filteredTransactions
                  .filter(t => t.type === 'ENTRADA')
                  .slice(0, 15)
                  .map(t => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                          {t.category === 'DIZIMO' ? 'D' : t.category === 'CANTINA' ? 'C' : 'O'}
                        </div>
                        <div>
                          <div className="font-bold text-white">{t.description}</div>
                          <span className="text-[11px] text-slate-400">
                            {t.personName ? `Membro: ${t.personName} • ` : ''}
                            {new Date(t.date).toLocaleDateString('pt-BR')} via {t.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-400 text-sm">
                          + R$ {t.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: DESPESAS & CUSTOS
           ========================================================================= */}
        {activeTab === 'saidas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10">
                <span className="text-xs font-bold text-rose-400 uppercase">
                  Despesas Fixas
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  R$ {metrics.totalDespesasFixas.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Aluguel, luz, água e internet</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10">
                <span className="text-xs font-bold text-purple-400 uppercase">
                  Ministérios
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  R$ {metrics.totalMinisterios.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Louvor, infantil e jovens</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  Manutenção
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  R$ {metrics.totalManutencao.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Som, iluminação e templo</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d1424] border border-white/10">
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  Ação Social
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  R$ {metrics.totalAcaoSocial.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cestas e apoio comunitário</p>
              </div>
            </div>

            {/* Lista das Despesas Realizadas */}
            <div className="p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
              <h4 className="font-black text-sm text-white">Últimas Despesas Pagas</h4>
              <div className="space-y-2">
                {filteredTransactions
                  .filter(t => t.type === 'SAIDA')
                  .slice(0, 15)
                  .map(t => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold">
                          -
                        </div>
                        <div>
                          <div className="font-bold text-white">{t.description}</div>
                          <span className="text-[11px] text-slate-400">
                            {t.category} • {new Date(t.date).toLocaleDateString('pt-BR')} via {t.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="font-black text-rose-400 text-sm">
                        - R$ {t.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: CONTAS A PAGAR & PREVISÕES
           ========================================================================= */}
        {activeTab === 'contas' && (
          <div className="p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-base text-white">Contas Fixas & Vencimentos do Mês</h4>
                <p className="text-xs text-slate-400">
                  Previsão de compromissos recorrentes da congregação
                </p>
              </div>
              <div className="text-xs font-bold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                Total Previsto: R${' '}
                {fixedBills.reduce((acc, b) => acc + b.amount, 0).toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              {fixedBills.map(bill => {
                const isPaid = bill.status === 'PAGO';
                return (
                  <div
                    key={bill.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          isPaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        <Building size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{bill.title}</div>
                        <span className="text-slate-400">
                          Vencimento todo dia {bill.dueDay} • Categoria: {bill.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="font-black text-white text-base">
                          R$ {bill.amount.toFixed(2)}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isPaid ? 'Quitado este mês' : 'Pendente de Pagamento'}
                        </span>
                      </div>

                      {!isPaid && (
                        <button
                          onClick={async () => {
                            await createTransaction({
                              description: `Pagamento: ${bill.title}`,
                              amount: bill.amount,
                              type: 'SAIDA',
                              category: bill.category,
                              date: new Date().toISOString(),
                              paymentMethod: 'Pix',
                              isSettled: true
                            });
                            setFixedBills(prev =>
                              prev.map(b => (b.id === bill.id ? { ...b, status: 'PAGO' } : b))
                            );
                            showToast(`✅ Pagamento de "${bill.title}" lançado na tesouraria!`);
                            await loadFinancialData();
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shrink-0"
                        >
                          Dar Baixa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 5: BALANCETE MENSAL (PRESTAÇÃO DE CONTAS)
           ========================================================================= */}
        {activeTab === 'balancete' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1424] border border-white/10 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  Documento Oficial
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Balancete Mensal de Prestação de Contas
                </h3>
                <p className="text-xs text-slate-400">
                  Resumo contábil estruturado para assembleia e conselho pastoral
                </p>
              </div>

              <button
                onClick={handleShareBalancete}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg active:scale-95"
              >
                <Share2 size={14} />
                <span>Copiar Balancete p/ WhatsApp</span>
              </button>
            </div>

            {/* Corpo do Balancete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entradas Detalhadas */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-bold text-emerald-400 text-sm">
                    1. Receitas & Entradas
                  </span>
                  <span className="font-black text-emerald-400 text-sm">
                    R$ {metrics.totalEntradas.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.1 Dízimos Ministeriais</span>
                    <span className="font-bold text-white">R$ {metrics.totalDizimos.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.2 Ofertas de Cultos</span>
                    <span className="font-bold text-white">R$ {metrics.totalOfertas.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.3 Faturamento Cantina / Eventos</span>
                    <span className="font-bold text-white">R$ {metrics.totalCantina.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.4 Inscrições de Retiro / Acampamento</span>
                    <span className="font-bold text-white">R$ {metrics.totalInscricoes.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.5 Doações & Outras Entradas</span>
                    <span className="font-bold text-white">R$ {metrics.totalOutrasEntradas.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Saídas Detalhadas */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-bold text-rose-400 text-sm">
                    2. Despesas & Custos
                  </span>
                  <span className="font-black text-rose-400 text-sm">
                    R$ {metrics.totalSaidas.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.1 Despesas Fixas (Templo, Água, Luz)</span>
                    <span className="font-bold text-white">R$ {metrics.totalDespesasFixas.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.2 Ministérios (Louvor, Infantil, Jovens)</span>
                    <span className="font-bold text-white">R$ {metrics.totalMinisterios.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.3 Manutenção & Equipamentos</span>
                    <span className="font-bold text-white">R$ {metrics.totalManutencao.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.4 Ação Social & Doações</span>
                    <span className="font-bold text-white">R$ {metrics.totalAcaoSocial.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.5 Outras Saídas Especiais</span>
                    <span className="font-bold text-white">R$ {metrics.totalOutrasSaidas.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Totalizador Consolidado */}
            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-purple-300">
                  Saldo Líquido do Exercício:
                </span>
                <div
                  className={`text-2xl font-black ${
                    metrics.saldoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {metrics.saldoLiquido >= 0 ? '+' : ''}R$ {metrics.saldoLiquido.toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">
                  Saldo Acumulado em Caixa / Banco:
                </span>
                <div className="text-2xl font-black text-white">
                  R$ {metrics.saldoGeralAcumulado.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: LANÇAMENTO DE ENTRADA OU SAÍDA
         ========================================================================= */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                {modalType === 'ENTRADA' ? (
                  <>
                    <Plus size={18} className="text-emerald-400" />
                    <span>Lançar Nova Entrada</span>
                  </>
                ) : (
                  <>
                    <Minus size={18} className="text-rose-400" />
                    <span>Lançar Nova Saída</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder={
                    modalType === 'ENTRADA'
                      ? 'Ex: Dízimo referente a Outubro, Oferta Culto de Domingo...'
                      : 'Ex: Conta de Luz Enel, Material Escola Bíblica...'
                  }
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value as TransactionCategory })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                  >
                    {modalType === 'ENTRADA' ? (
                      <>
                        <option value="DIZIMO">Dízimo</option>
                        <option value="OFERTA">Oferta</option>
                        <option value="INSCRICAO">Inscrição Retiro</option>
                        <option value="CANTINA">Cantina & Eventos</option>
                        <option value="OUTROS">Outras Entradas</option>
                      </>
                    ) : (
                      <>
                        <option value="DESPESA_FIXA">Despesa Fixa (Templo)</option>
                        <option value="MINISTERIO">Ministérios (Louvor/Infantil)</option>
                        <option value="MANUTENCAO">Manutenção & Som</option>
                        <option value="ACAO_SOCIAL">Ação Social</option>
                        <option value="OUTROS">Outras Saídas</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Forma de Pagto</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e =>
                      setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value="Pix">PIX</option>
                    <option value="Dinheiro">Dinheiro em Espécie</option>
                    <option value="Débito">Cartão de Débito</option>
                    <option value="Crédito">Cartão de Crédito</option>
                    <option value="Outro">Transferência / Boleto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Vínculo de Membro Opcional */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Vincular a Membro (Opcional)
                </label>
                {formData.personName ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs">
                    <span className="font-bold text-white">{formData.personName}</span>
                    <button
                      onClick={() => setFormData({ ...formData, personId: '', personName: '' })}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Buscar membro na congregação..."
                    value={personSearch}
                    onFocus={() => setIsPersonDropdownOpen(true)}
                    onChange={e => {
                      setPersonSearch(e.target.value);
                      setIsPersonDropdownOpen(true);
                    }}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                )}

                {isPersonDropdownOpen && !formData.personName && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-36 overflow-y-auto rounded-xl bg-[#0e172a] border border-white/15 shadow-2xl p-1 z-40">
                    {filteredPeople.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            personId: p.id,
                            personName: p.name
                          });
                          setPersonSearch('');
                          setIsPersonDropdownOpen(false);
                        }}
                        className="w-full p-2 rounded-lg text-left text-xs hover:bg-purple-500/20 text-white font-bold"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={isSaving}
                onClick={handleSaveTransaction}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg"
              >
                {isSaving ? 'Lançando...' : 'Confirmar e Lançar no Livro Caixa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
