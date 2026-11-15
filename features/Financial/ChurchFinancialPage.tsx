import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Building,
  Receipt,
  Users,
  ArrowLeft,
  Trash2,
  AlertCircle,
  X,
  Sparkles,
  Percent,
  Check,
  Download,
  HeartHandshake,
  Sun,
  Moon,
  ShoppingBag,
  Package,
  Edit3,
  Layers,
  Tent,
  Calculator,
  RotateCcw,
  ExternalLink,
  Tag,
  BarChart3,
  AlertTriangle,
  Archive,
  Play,
  Undo2,
  UserPlus,
  MessageCircle
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';
import {
  Transaction,
  TransactionCategory,
  TransactionType,
  PaymentMethod,
  Person,
  Product,
  ProjectionItem,
  FinancialEvent,
  FixedBillItem,
  TeamId
} from '../../types';
import {
  listTransactions,
  createTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction
} from '../../lib/api/transactions';
import {
  listPeople,
  createPerson as apiCreatePerson,
  updatePerson as apiUpdatePerson,
  deletePerson as apiDeletePerson
} from '../../lib/api/people';
import {
  listProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct
} from '../../lib/api/products';
import {
  listSales,
  updateSale as apiUpdateSale
} from '../../lib/api/sales';
import {
  listFinancialEvents,
  upsertFinancialEvent,
  deleteFinancialEventApi
} from '../../lib/api/financialEvents';
import {
  listFixedBills,
  upsertFixedBill,
  deleteFixedBillApi
} from '../../lib/api/fixedBills';
import {
  CAMP_TOTAL_PRICE,
  CAMP_CHILD_PRICE,
  INSTALLMENT_COUNT,
  INSTALLMENT_VALUE,
  CAMP_2027_CONFIG,
  TEAM_UI
} from '../../constants';

type FinancialTab =
  | 'visao_geral'
  | 'fluxo'
  | 'acamp_2026'
  | 'acamp_2027'
  | 'eventos'
  | 'estoque'
  | 'balancete';

type PeriodFilter =
  | 'tudo'
  | 'mes_atual'
  | 'mes_anterior'
  | 'fev_2026'
  | 'ano_2026'
  | 'ano_2027';

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  DIZIMO: 'Dízimo',
  OFERTA: 'Oferta',
  INSCRICAO: 'Inscrição Acampamento',
  CANTINA: 'Cantina & PDV',
  DESPESA_FIXA: 'Despesa Fixa',
  MINISTERIO: 'Ministérios',
  MANUTENCAO: 'Manutenção & Som',
  ACAO_SOCIAL: 'Ação Social',
  ALUGUEL_CHACARA: 'Aluguel Chácara',
  OUTROS: 'Outros'
};

const EVENT_COLORS = [
  { label: 'Roxo Real', value: 'from-purple-500 to-indigo-600' },
  { label: 'Esmeralda', value: 'from-emerald-500 to-teal-600' },
  { label: 'Laranja Solar', value: 'from-amber-500 to-orange-600' },
  { label: 'Azul Oceano', value: 'from-cyan-500 to-blue-600' },
  { label: 'Rosa Ministerial', value: 'from-pink-500 to-rose-600' }
];

const formatBRL = (val: number) =>
  val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ChurchFinancialPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAccessPastoral } = useCurrentRole();

  const {
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    people,
    syncSupabasePeople,
    updatePerson,
    deletePerson,
    resetToOfficialList,
    camp2026People,
    addCamp2026Person,
    updateCamp2026Person,
    deleteCamp2026Person,
    expenseProjections,
    addProjectionEntry,
    updateProjectionItem,
    deleteProjectionItem,
    camp2026Projections,
    addCamp2026Projection,
    updateCamp2026Projection,
    deleteCamp2026Projection,
    financialEvents,
    setFinancialEvents,
    addFinancialEvent,
    updateFinancialEvent,
    deleteFinancialEvent,
    fixedBills,
    setFixedBills,
    addFixedBill,
    updateFixedBill,
    deleteFixedBill,
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    sales,
    setSales,
    settleSale,
    settleAllCustomerDebt,
    isDarkMode,
    toggleTheme
  } = useAppStore();

  const handleBack = () => {
    if (canAccessPastoral) {
      navigate('/igreja');
    } else {
      navigate('/org/home');
    }
  };

  // Initial tab from URL query param if present
  const initialTab = (searchParams.get('tab') as FinancialTab) || 'visao_geral';
  const [activeTab, setActiveTab] = useState<FinancialTab>(
    ['visao_geral', 'fluxo', 'acamp_2026', 'acamp_2027', 'eventos', 'estoque', 'balancete'].includes(initialTab)
      ? initialTab
      : 'visao_geral'
  );

  useEffect(() => {
    const t = searchParams.get('tab') as FinancialTab | null;
    if (t && ['visao_geral', 'fluxo', 'acamp_2026', 'acamp_2027', 'eventos', 'estoque', 'balancete'].includes(t)) {
      setActiveTab(t);
    }
    const ev = searchParams.get('event');
    if (ev) {
      setSelectedEventFilter(ev);
    }
  }, [searchParams]);

  const handleTabChange = (tab: FinancialTab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  // Global Filters
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('tudo');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TODAS');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'TODOS' | 'ENTRADA' | 'SAIDA' | 'CONTAS'>('TODOS');

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  }, []);

  // Sync with Supabase without losing 2027 people or local state
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const loadFinancialData = useCallback(async () => {
    setIsLoadingRemote(true);
    try {
      const [txData, peopleData, prodData, salesData, eventsData, billsData] = await Promise.all([
        listTransactions().catch(() => null),
        listPeople().catch(() => null),
        listProducts().catch(() => null),
        listSales().catch(() => null),
        listFinancialEvents().catch(() => null),
        listFixedBills().catch(() => null)
      ]);
      if (txData && txData.length > 0) setTransactions(txData);
      if (peopleData && peopleData.length > 0) syncSupabasePeople(peopleData);
      if (prodData && prodData.length > 0) setProducts(prodData);
      if (salesData && salesData.length > 0) setSales(salesData);
      if (eventsData && eventsData.length > 0) setFinancialEvents(eventsData);
      if (billsData && billsData.length > 0) setFixedBills(billsData);
    } catch (e) {
      console.warn('Erro ao sincronizar dados remotos do financeiro:', e);
    } finally {
      setIsLoadingRemote(false);
    }
  }, [setFinancialEvents, setFixedBills, setProducts, setSales, setTransactions, syncSupabasePeople]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // ============================================================================
  // MODAL 1: CRIAR / EDITAR TRANSAÇÃO (ENTRADA OU SAÍDA + REPOSIÇÃO DE ESTOQUE)
  // ============================================================================
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'DIZIMO' as TransactionCategory,
    paymentMethod: 'Pix' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    personId: '',
    personName: '',
    eventId: 'tesouraria-geral',
    isSettled: true,
    stockProductId: '',
    stockQty: ''
  });
  const [personSearch, setPersonSearch] = useState('');
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openTransactionModal = (
    type: TransactionType,
    preset?: Partial<typeof formData>,
    txToEdit?: Transaction
  ) => {
    setModalType(type);
    if (txToEdit) {
      setEditingTxId(txToEdit.id);
      setFormData({
        description: txToEdit.description,
        amount: String(txToEdit.amount),
        category: txToEdit.category,
        paymentMethod: txToEdit.paymentMethod || 'Pix',
        date: txToEdit.date ? txToEdit.date.split('T')[0] : new Date().toISOString().split('T')[0],
        personId: txToEdit.personId || '',
        personName: txToEdit.personName || '',
        eventId: txToEdit.eventId || 'tesouraria-geral',
        isSettled: txToEdit.isSettled !== false,
        stockProductId: '',
        stockQty: ''
      });
    } else {
      setEditingTxId(null);
      setFormData({
        description: preset?.description || '',
        amount: preset?.amount || '',
        category: preset?.category || (type === 'ENTRADA' ? 'DIZIMO' : 'DESPESA_FIXA'),
        paymentMethod: preset?.paymentMethod || 'Pix',
        date: preset?.date || new Date().toISOString().split('T')[0],
        personId: preset?.personId || '',
        personName: preset?.personName || '',
        eventId:
          preset?.eventId ||
          (selectedEventFilter !== 'TODOS' ? selectedEventFilter : 'tesouraria-geral'),
        isSettled: preset?.isSettled !== undefined ? preset.isSettled : true,
        stockProductId: preset?.stockProductId || '',
        stockQty: preset?.stockQty || ''
      });
    }
  };

  // Combine 2027 and 2026 people for autocomplete
  const allKnownPeople = useMemo(() => {
    const map = new Map<string, Person>();
    people.forEach((p) => map.set(p.name.toLowerCase(), p));
    camp2026People.forEach((p) => {
      if (!map.has(p.name.toLowerCase())) map.set(p.name.toLowerCase(), p);
    });
    return Array.from(map.values());
  }, [people, camp2026People]);

  const filteredPeopleAutocomplete = useMemo(() => {
    if (!personSearch.trim()) return allKnownPeople.slice(0, 8);
    return allKnownPeople
      .filter((p) => p.name.toLowerCase().includes(personSearch.toLowerCase()))
      .slice(0, 8);
  }, [allKnownPeople, personSearch]);

  const handleSaveTransaction = async () => {
    const parsedAmount = parseFloat(formData.amount);
    if (!formData.description.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('⚠️ Preencha a descrição e um valor maior que zero.');
      return;
    }

    setIsSaving(true);
    const chosenEvent = financialEvents.find((e) => e.id === formData.eventId);
    const payload: Omit<Transaction, 'id'> = {
      description: formData.description.trim(),
      amount: parsedAmount,
      type: modalType || 'ENTRADA',
      category: formData.category,
      date: new Date(`${formData.date}T12:00:00`).toISOString(),
      paymentMethod: formData.paymentMethod,
      personId: formData.personId || undefined,
      personName: formData.personName || undefined,
      isSettled: formData.isSettled,
      eventId: formData.eventId || undefined,
      eventName: chosenEvent?.name || undefined
    };

    try {
      if (editingTxId) {
        updateTransaction(editingTxId, payload);
        await apiUpdateTransaction(editingTxId, payload).catch(() => null);
        showToast('✅ Lançamento atualizado com sucesso!');
      } else {
        const created = await createTransaction(payload).catch(() => null);
        if (created) {
          setTransactions([created, ...transactions]);
        } else {
          addTransaction(payload);
        }

        // If stock replenishment was selected on SAIDA + CANTINA
        if (modalType === 'SAIDA' && formData.stockProductId && Number(formData.stockQty) > 0) {
          const prod = products.find((p) => p.id === formData.stockProductId);
          if (prod) {
            const newStock = prod.stock + Number(formData.stockQty);
            updateProduct(prod.id, { stock: newStock });
            await apiUpdateProduct(prod.id, { stock: newStock }).catch(() => null);
          }
        }

        showToast(
          modalType === 'ENTRADA'
            ? `✅ Entrada de R$ ${formatBRL(parsedAmount)} registrada!`
            : `✅ Saída de R$ ${formatBRL(parsedAmount)} registrada!`
        );
      }

      setModalType(null);
      setEditingTxId(null);
    } catch (err: any) {
      showToast(`Erro ao salvar: ${err.message || 'Tente novamente.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento financeiro?')) return;
    removeTransaction(id);
    try {
      await apiDeleteTransaction(id);
      showToast('🗑️ Lançamento excluído do caixa.');
    } catch {
      showToast('🗑️ Lançamento removido localmente.');
    }
  };

  const handleToggleTxSettled = async (tx: Transaction) => {
    const nextSettled = tx.isSettled === false ? true : false;
    updateTransaction(tx.id, { isSettled: nextSettled });
    await apiUpdateTransaction(tx.id, { isSettled: nextSettled }).catch(() => null);
    showToast(nextSettled ? '✅ Lançamento marcado como Quitado!' : '⏳ Marcado como Pendente.');
  };

  // ============================================================================
  // FILTRAGEM DE TRANSAÇÕES E MÉTRICAS CONSOLIDADAS
  // ============================================================================
  const matchesEventFilter = useCallback(
    (tx: { eventId?: string; eventName?: string; category?: string; date?: string }, filterId: string) => {
      if (filterId === 'TODOS') return true;
      if (tx.eventId === filterId) return true;
      const evObj = financialEvents.find((e) => e.id === filterId);
      if (evObj && tx.eventName && tx.eventName.toLowerCase() === evObj.name.toLowerCase()) {
        return true;
      }
      // Smart inference for legacy transactions without eventId
      if (!tx.eventId && !tx.eventName && tx.date) {
        const year = new Date(tx.date).getFullYear();
        const month = new Date(tx.date).getMonth(); // 1 = Feb
        if (filterId === 'acampamento-2026' && year === 2026 && month === 1) return true;
        if (
          filterId === 'acampamento-2027' &&
          (tx.category === 'INSCRICAO' || tx.category === 'ALUGUEL_CHACARA') &&
          (year > 2026 || (year === 2026 && month >= 6))
        ) {
          return true;
        }
        if (
          filterId === 'tesouraria-geral' &&
          ['DIZIMO', 'OFERTA', 'DESPESA_FIXA', 'MANUTENCAO', 'ACAO_SOCIAL', 'MINISTERIO'].includes(
            tx.category || ''
          )
        ) {
          return true;
        }
      }
      return false;
    },
    [financialEvents]
  );

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions
      .filter((t) => {
        const txDate = new Date(t.date);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();

        if (periodFilter === 'mes_atual') {
          if (txYear !== currentYear || txMonth !== currentMonth) return false;
        } else if (periodFilter === 'mes_anterior') {
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          if (txYear !== prevYear || txMonth !== prevMonth) return false;
        } else if (periodFilter === 'fev_2026') {
          if (txYear !== 2026 || txMonth !== 1) return false;
        } else if (periodFilter === 'ano_2026') {
          if (txYear !== 2026) return false;
        } else if (periodFilter === 'ano_2027') {
          if (txYear !== 2027) return false;
        }

        if (!matchesEventFilter(t, selectedEventFilter)) return false;

        if (selectedCategoryFilter !== 'TODAS' && t.category !== selectedCategoryFilter) {
          return false;
        }

        if (ledgerTypeFilter === 'ENTRADA' && t.type !== 'ENTRADA') return false;
        if (ledgerTypeFilter === 'SAIDA' && t.type !== 'SAIDA') return false;

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const descMatch = (t.description || '').toLowerCase().includes(q);
          const personMatch = (t.personName || '').toLowerCase().includes(q);
          const catMatch = (t.category || '').toLowerCase().includes(q);
          const evMatch = (t.eventName || '').toLowerCase().includes(q);
          if (!descMatch && !personMatch && !catMatch && !evMatch) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    transactions,
    periodFilter,
    selectedEventFilter,
    selectedCategoryFilter,
    ledgerTypeFilter,
    searchTerm,
    matchesEventFilter
  ]);

  const metrics = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;

    let totalDizimos = 0;
    let totalOfertas = 0;
    let totalCantina = 0;
    let totalInscricoes = 0;
    let totalOutrasEntradas = 0;

    let totalDespesasFixas = 0;
    let totalMinisterios = 0;
    let totalManutencao = 0;
    let totalAcaoSocial = 0;
    let totalAluguelChacara = 0;
    let totalOutrasSaidas = 0;

    filteredTransactions.forEach((t) => {
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
        else if (t.category === 'ALUGUEL_CHACARA') totalAluguelChacara += t.amount;
        else totalOutrasSaidas += t.amount;
      }
    });

    const saldoLiquido = totalEntradas - totalSaidas;
    const saldoGeralAcumulado = transactions.reduce(
      (acc, t) => (t.type === 'ENTRADA' ? acc + t.amount : acc - t.amount),
      0
    );

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
      totalAluguelChacara,
      totalOutrasSaidas,
      count: filteredTransactions.length
    };
  }, [filteredTransactions, transactions]);

  // ============================================================================
  // MÉTRICAS DE ESTOQUE E CANTINA
  // ============================================================================
  const stockMetrics = useMemo(() => {
    const activeProducts = products.filter((p) => p.isActive !== false);
    const totalUnits = activeProducts.reduce((acc, p) => acc + Math.max(0, p.stock), 0);
    const totalCostValue = activeProducts.reduce(
      (acc, p) => acc + Math.max(0, p.stock) * p.costPrice,
      0
    );
    const totalSellValue = activeProducts.reduce(
      (acc, p) => acc + Math.max(0, p.stock) * p.sellPrice,
      0
    );
    const projectedProfit = totalSellValue - totalCostValue;
    const lowStockItems = activeProducts.filter((p) => p.stock <= (p.minStock || 5));
    const pendingSales = sales.filter((s) => s.status === 'PENDING');
    const pendingReceivables = pendingSales.reduce((acc, s) => acc + s.total, 0);

    return {
      totalProducts: activeProducts.length,
      totalUnits,
      totalCostValue,
      totalSellValue,
      projectedProfit,
      lowStockItems,
      pendingSales,
      pendingReceivables
    };
  }, [products, sales]);

  // ============================================================================
  // MÉTRICAS ACAMPAMENTO 2026 (PASSADO) vs ACAMPAMENTO 2027 (FUTURO)
  // ============================================================================
  const camp2026Stats = useMemo(() => {
    const totalPeople = camp2026People.length;
    const contracted = camp2026People.reduce((acc, p) => acc + (p.totalPrice || 432), 0);
    const collectedInscriptions = camp2026People.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
    const pendingInscriptions = Math.max(0, contracted - collectedInscriptions);
    const paidCount = camp2026People.filter((p) => p.amountPaid >= p.totalPrice).length;

    const sales2026 = sales.filter((s) => new Date(s.date).getFullYear() === 2026);
    const canteenRevenue2026 = sales2026
      .filter((s) => s.status === 'PAID')
      .reduce((acc, s) => acc + s.total, 0);
    const canteenPending2026 = sales2026
      .filter((s) => s.status === 'PENDING')
      .reduce((acc, s) => acc + s.total, 0);
    const canteenProfit2026 = sales2026.reduce((acc, s) => acc + (s.total - s.totalCost), 0);

    const totalCosts2026 = camp2026Projections.reduce((acc, item) => acc + item.amount, 0);
    const totalRevenue2026 = collectedInscriptions + canteenRevenue2026;
    const netBalance2026 = totalRevenue2026 - totalCosts2026;

    return {
      totalPeople,
      contracted,
      collectedInscriptions,
      pendingInscriptions,
      paidCount,
      sales2026,
      canteenRevenue2026,
      canteenPending2026,
      canteenProfit2026,
      totalCosts2026,
      totalRevenue2026,
      netBalance2026
    };
  }, [camp2026People, sales, camp2026Projections]);

  const camp2027Stats = useMemo(() => {
    const totalPeople = people.length;
    const adultsCount = people.filter((p) => p.ageGroup !== 'Criança').length;
    const childrenCount = people.filter((p) => p.ageGroup === 'Criança').length;
    const contracted = people.reduce((acc, p) => acc + (p.totalPrice || CAMP_TOTAL_PRICE), 0);
    const collected = people.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
    const receivable = Math.max(0, contracted - collected);
    const paidCount = people.filter((p) => p.amountPaid >= p.totalPrice && p.totalPrice > 0).length;
    const partialCount = people.filter((p) => p.amountPaid > 0 && p.amountPaid < p.totalPrice).length;
    const zeroCount = people.filter((p) => (p.amountPaid || 0) === 0).length;

    const projectedBudget = expenseProjections.reduce((acc, item) => acc + item.amount, 0);
    const executedBudget = expenseProjections
      .filter((item) => item.isExecuted)
      .reduce((acc, item) => acc + item.amount, 0);
    const breakEvenAdults = Math.ceil(projectedBudget / CAMP_TOTAL_PRICE);
    const projectedBalance = contracted + stockMetrics.projectedProfit - projectedBudget;

    return {
      totalPeople,
      adultsCount,
      childrenCount,
      contracted,
      collected,
      receivable,
      paidCount,
      partialCount,
      zeroCount,
      projectedBudget,
      executedBudget,
      breakEvenAdults,
      projectedBalance
    };
  }, [people, expenseProjections, stockMetrics.projectedProfit]);

  // ============================================================================
  // SIMULADOR INTERATIVO DE PROJEÇÃO 2027
  // ============================================================================
  const [simAdults, setSimAdults] = useState<number>(45);
  const [simChildren, setSimChildren] = useState<number>(5);
  const [simCanteenProfit, setSimCanteenProfit] = useState<number>(2200);

  const simulationResult = useMemo(() => {
    const revAdults = simAdults * CAMP_TOTAL_PRICE;
    const revChildren = simChildren * CAMP_CHILD_PRICE;
    const totalSimulatedRevenue = revAdults + revChildren + simCanteenProfit;
    const totalBudget = camp2027Stats.projectedBudget;
    const netSimulated = totalSimulatedRevenue - totalBudget;
    const coveragePct = totalBudget > 0 ? Math.min(150, (totalSimulatedRevenue / totalBudget) * 100) : 100;
    return {
      revAdults,
      revChildren,
      totalSimulatedRevenue,
      totalBudget,
      netSimulated,
      coveragePct
    };
  }, [simAdults, simChildren, simCanteenProfit, camp2027Stats.projectedBudget]);

  // ============================================================================
  // HANDLERS DE PROJEÇÃO DE CUSTOS (2027 & 2026)
  // ============================================================================
  const [newCostLabel, setNewCostLabel] = useState('');
  const [newCostAmount, setNewCostAmount] = useState('');
  const [newCostCategory, setNewCostCategory] = useState<TransactionCategory>('OUTROS');
  const [editingProjectionId, setEditingProjectionId] = useState<string | null>(null);
  const [editingProjectionLabel, setEditingProjectionLabel] = useState('');
  const [editingProjectionAmount, setEditingProjectionAmount] = useState('');

  const handleAddCostProjection = (edition: '2027' | '2026') => {
    const val = parseFloat(newCostAmount);
    if (!newCostLabel.trim() || Number.isNaN(val) || val <= 0) {
      showToast('⚠️ Informe o nome do custo e um valor válido.');
      return;
    }
    if (edition === '2027') {
      addProjectionEntry({
        label: newCostLabel.trim(),
        amount: val,
        categoryMapping: newCostCategory,
        isExecuted: false,
        source: 'BASE'
      });
      showToast(`✅ Custo projetado "${newCostLabel.trim()}" adicionado ao orçamento 2027!`);
    } else {
      addCamp2026Projection({
        label: newCostLabel.trim(),
        amount: val,
        categoryMapping: newCostCategory,
        isExecuted: true,
        source: 'BASE'
      });
      showToast(`✅ Custo "${newCostLabel.trim()}" adicionado ao fechamento de 2026!`);
    }
    setNewCostLabel('');
    setNewCostAmount('');
  };

  const handleToggleExecuteProjection2027 = async (item: ProjectionItem) => {
    if (item.isExecuted) {
      // Undo execution
      if (item.executedTransactionId) {
        removeTransaction(item.executedTransactionId);
        await apiDeleteTransaction(item.executedTransactionId).catch(() => null);
      }
      updateProjectionItem(item.id, {
        isExecuted: false,
        executedTransactionId: undefined
      });
      showToast(`↩️ Execução de "${item.label}" desfeita do livro caixa.`);
    } else {
      // Execute into cash flow
      const payload: Omit<Transaction, 'id'> = {
        description: `[Orçamento Acamp 2027] ${item.label}`,
        amount: item.amount,
        type: 'SAIDA',
        category: item.categoryMapping || 'OUTROS',
        date: new Date().toISOString(),
        paymentMethod: 'Pix',
        isSettled: true,
        eventId: 'acampamento-2027',
        eventName: 'Acampamento Manancial 2027'
      };
      const created = await createTransaction(payload).catch(() => null);
      const txId = created?.id || `tx-proj-${Date.now()}`;
      if (created) {
        setTransactions([created, ...transactions]);
      } else {
        addTransaction(payload);
      }
      updateProjectionItem(item.id, {
        isExecuted: true,
        executedTransactionId: txId
      });
      showToast(`✅ "${item.label}" (R$ ${formatBRL(item.amount)}) lançado como Saída no Caixa!`);
    }
  };

  // ============================================================================
  // HANDLERS DE INSCRIÇÕES ACAMPAMENTO (2027 & 2026)
  // ============================================================================
  const [campSearch, setCampSearch] = useState('');
  const [campStatusFilter, setCampStatusFilter] = useState<'TODOS' | 'PAGO' | 'PARCIAL' | 'PENDENTE'>('TODOS');
  const [newCamperName, setNewCamperName] = useState('');
  const [newCamperAge, setNewCamperAge] = useState<'Adulto' | 'Jovem' | 'Criança'>('Adulto');
  const [newCamperTeam, setNewCamperTeam] = useState<TeamId>('none');
  const [paymentModalPerson, setPaymentModalPerson] = useState<{
    person: Person;
    edition: '2027' | '2026';
  } | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState(String(INSTALLMENT_VALUE));
  const [paymentMethodInput, setPaymentMethodInput] = useState<PaymentMethod>('Pix');
  const [recordInCashFlow, setRecordInCashFlow] = useState(true);

  const handleAddCamper = async (edition: '2027' | '2026') => {
    if (!newCamperName.trim()) {
      showToast('⚠️ Digite o nome do participante.');
      return;
    }
    const price =
      edition === '2026'
        ? 432
        : newCamperAge === 'Criança'
          ? CAMP_CHILD_PRICE
          : CAMP_TOTAL_PRICE;

    if (edition === '2027') {
      const newPerson: Person = {
        id: `camp-${Date.now()}`,
        name: newCamperName.trim(),
        amountPaid: 0,
        totalPrice: price,
        ageGroup: newCamperAge,
        personType: 'Membro',
        teamId: newCamperTeam,
        paymentStatus: 'PENDENTE',
        paymentHistory: []
      };
      useAppStore.setState((s) => ({ people: [newPerson, ...s.people] }));
      showToast(`✅ ${newPerson.name} inscrito no Acampamento 2027!`);
    } else {
      addCamp2026Person({
        name: newCamperName.trim(),
        amountPaid: 432,
        totalPrice: 432,
        ageGroup: newCamperAge,
        personType: 'Membro',
        teamId: newCamperTeam,
        paymentStatus: 'PAGO',
        paymentMethod: 'Pix',
        lastPaymentDate: '2026-02-10'
      });
      showToast(`✅ ${newCamperName.trim()} adicionado ao histórico de 2026!`);
    }
    setNewCamperName('');
  };

  const handleConfirmCamperPayment = async () => {
    if (!paymentModalPerson) return;
    const { person, edition } = paymentModalPerson;
    const delta = parseFloat(paymentAmountInput);
    if (Number.isNaN(delta) || delta <= 0) {
      showToast('⚠️ Informe um valor válido para a parcela/pagamento.');
      return;
    }

    const newAmountPaid = Math.min(person.totalPrice, (person.amountPaid || 0) + delta);
    const newStatus = newAmountPaid >= person.totalPrice ? 'PAGO' : 'PENDENTE';
    const nextHistory = [...(person.paymentHistory || []), delta];

    if (edition === '2027') {
      updatePerson(person.id, {
        amountPaid: newAmountPaid,
        paymentStatus: newStatus,
        paymentMethod: paymentMethodInput,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        paymentHistory: nextHistory
      });
    } else {
      updateCamp2026Person(person.id, {
        amountPaid: newAmountPaid,
        paymentStatus: newStatus,
        paymentMethod: paymentMethodInput,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        paymentHistory: nextHistory
      });
      await apiUpdatePerson(person.id, {
        amountPaid: newAmountPaid,
        paymentStatus: newStatus,
        paymentMethod: paymentMethodInput
      }).catch(() => null);
    }

    if (recordInCashFlow) {
      const txPayload: Omit<Transaction, 'id'> = {
        description: `Inscrição Acampamento ${edition}: ${person.name} (${nextHistory.length}ª parc.)`,
        amount: delta,
        type: 'ENTRADA',
        category: 'INSCRICAO',
        date: new Date().toISOString(),
        paymentMethod: paymentMethodInput,
        personId: person.id,
        personName: person.name,
        isSettled: true,
        eventId: edition === '2027' ? 'acampamento-2027' : 'acampamento-2026',
        eventName: `Acampamento Manancial ${edition}`
      };
      const created = await createTransaction(txPayload).catch(() => null);
      if (created) {
        setTransactions([created, ...transactions]);
      } else {
        addTransaction(txPayload);
      }
    }

    showToast(`✅ Pagamento de R$ ${formatBRL(delta)} registrado para ${person.name}!`);
    setPaymentModalPerson(null);
  };

  // ============================================================================
  // HANDLERS DE EVENTOS (CRIAR, EDITAR, EXCLUIR EVENTOS)
  // ============================================================================
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    name: '',
    badge: '',
    dateLabel: '',
    color: EVENT_COLORS[0].value,
    status: 'ATIVO' as 'ATIVO' | 'PLANEJADO' | 'ENCERRADO',
    targetBudget: '',
    targetRevenue: '',
    description: ''
  });

  const openEventModal = (ev?: FinancialEvent) => {
    if (ev) {
      setEditingEventId(ev.id);
      setEventForm({
        name: ev.name,
        badge: ev.badge,
        dateLabel: ev.dateLabel,
        color: ev.color || EVENT_COLORS[0].value,
        status: ev.status || 'ATIVO',
        targetBudget: ev.targetBudget ? String(ev.targetBudget) : '',
        targetRevenue: ev.targetRevenue ? String(ev.targetRevenue) : '',
        description: ev.description || ''
      });
    } else {
      setEditingEventId(null);
      setEventForm({
        name: '',
        badge: 'Evento Manancial',
        dateLabel: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        color: EVENT_COLORS[0].value,
        status: 'ATIVO',
        targetBudget: '2000',
        targetRevenue: '3500',
        description: ''
      });
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.name.trim()) {
      showToast('⚠️ Informe o nome do evento.');
      return;
    }
    const payload = {
      name: eventForm.name.trim(),
      badge: eventForm.badge.trim() || 'Evento Oficial',
      dateLabel: eventForm.dateLabel.trim() || 'Data a definir',
      color: eventForm.color,
      status: eventForm.status,
      targetBudget: parseFloat(eventForm.targetBudget) || 0,
      targetRevenue: parseFloat(eventForm.targetRevenue) || 0,
      description: eventForm.description.trim()
    };

    if (editingEventId) {
      updateFinancialEvent(editingEventId, payload);
      await upsertFinancialEvent({ id: editingEventId, ...payload }).catch(() => null);
      showToast(`✅ Evento "${payload.name}" atualizado e sincronizado na nuvem!`);
    } else {
      const slug = eventForm.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const created = addFinancialEvent({
        ...payload,
        id: `${slug || 'evento'}-${Date.now().toString().slice(-4)}`
      });
      await upsertFinancialEvent(created).catch(() => null);
      showToast(`🎉 Novo evento "${payload.name}" criado e sincronizado na nuvem!`);
    }
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = async (ev: FinancialEvent) => {
    if (
      !window.confirm(
        `Deseja excluir o evento "${ev.name}"? As transações já lançadas continuarão salvas no histórico.`
      )
    ) {
      return;
    }
    deleteFinancialEvent(ev.id);
    await deleteFinancialEventApi(ev.id).catch(() => null);
    if (selectedEventFilter === ev.id) {
      setSelectedEventFilter('TODOS');
    }
    showToast(`🗑️ Evento "${ev.name}" removido.`);
  };

  // ============================================================================
  // HANDLERS DE CONTAS FIXAS (CRIAR, DAR BAIXA, EXCLUIR)
  // ============================================================================
  const [newBillTitle, setNewBillTitle] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDay, setNewBillDueDay] = useState('10');
  const [newBillCategory, setNewBillCategory] = useState<TransactionCategory>('DESPESA_FIXA');

  const handleAddFixedBill = async () => {
    const amt = parseFloat(newBillAmount);
    if (!newBillTitle.trim() || Number.isNaN(amt) || amt <= 0) {
      showToast('⚠️ Preencha a descrição e o valor da conta fixa.');
      return;
    }
    const created = addFixedBill({
      title: newBillTitle.trim(),
      amount: amt,
      dueDay: Math.min(31, Math.max(1, parseInt(newBillDueDay, 10) || 10)),
      category: newBillCategory,
      status: 'PENDENTE',
      recurring: true,
      eventId: 'tesouraria-geral'
    });
    await upsertFixedBill(created).catch(() => null);
    setNewBillTitle('');
    setNewBillAmount('');
    showToast('✅ Conta fixa adicionada e sincronizada na nuvem!');
  };

  const handlePayFixedBill = async (bill: FixedBillItem) => {
    if (bill.status === 'PAGO') {
      updateFixedBill(bill.id, { status: 'PENDENTE' });
      await upsertFixedBill({ ...bill, status: 'PENDENTE' }).catch(() => null);
      showToast(`↩️ Conta "${bill.title}" reaberta como pendente.`);
      return;
    }
    const payload: Omit<Transaction, 'id'> = {
      description: `Pagamento Conta Fixa: ${bill.title}`,
      amount: bill.amount,
      type: 'SAIDA',
      category: bill.category,
      date: new Date().toISOString(),
      paymentMethod: 'Pix',
      isSettled: true,
      eventId: bill.eventId || 'tesouraria-geral',
      eventName: 'Tesouraria Geral da Igreja'
    };
    const created = await createTransaction(payload).catch(() => null);
    if (created) {
      setTransactions([created, ...transactions]);
    } else {
      addTransaction(payload);
    }
    updateFixedBill(bill.id, { status: 'PAGO', lastPaidTxId: created?.id });
    await upsertFixedBill({ ...bill, status: 'PAGO', lastPaidTxId: created?.id }).catch(() => null);
    showToast(`✅ Baixa efetuada! "${bill.title}" lançada nas Saídas.`);
  };

  // ============================================================================
  // HANDLERS DE RECIBO & COBRANÇA VIA WHATSAPP (1 CLIQUE)
  // ============================================================================
  const handleSendCamperWhatsApp = (person: Person, edition: '2027' | '2026') => {
    const paid = person.amountPaid || 0;
    const total = person.totalPrice || (edition === '2027' ? CAMP_TOTAL_PRICE : 432);
    const remaining = Math.max(0, total - paid);
    const isPaid = remaining === 0;
    const pixKey = CAMP_2027_CONFIG.pixKey || 'pix@igrejamanancial.com.br';

    const message = isPaid
      ? `✅ *COMPROVANTE DE QUITAÇÃO - ACAMPAMENTO MANANCIAL ${edition}*\n\n` +
        `Olá, *${person.name}*! Graça e Paz! 🙌\n` +
        `Confirmamos que a sua inscrição no *Acampamento Manancial ${edition}* está *100% QUITADA*!\n\n` +
        `• *Valor Total Pago:* R$ ${formatBRL(paid)}\n` +
        `• *Tribo/Equipe:* ${TEAM_UI[person.teamId]?.name || 'Em definição'}\n` +
        `• *Status:* PAGO ✅\n\n` +
        `_Tesouraria Igreja Manancial_`
      : `🏕️ *ACAMPAMENTO MANANCIAL ${edition} - RESUMO DE INSCRIÇÃO*\n\n` +
        `Olá, *${person.name}*! Graça e Paz! 🙌\n` +
        `Segue a atualização da sua inscrição para o *Acampamento Manancial ${edition}*:\n\n` +
        `• *Valor Total:* R$ ${formatBRL(total)}\n` +
        `• *Já Pago:* R$ ${formatBRL(paid)}\n` +
        `• *Saldo Restante:* R$ ${formatBRL(remaining)} (Parcela sugerida: R$ ${formatBRL(Math.min(remaining, INSTALLMENT_VALUE))})\n\n` +
        `🔑 *Chave PIX Oficial:* ${pixKey}\n` +
        `_Após o envio, encaminhe o comprovante para darmos baixa no sistema. Deus abençoe!_`;

    navigator.clipboard.writeText(message);
    showToast(
      isPaid
        ? `📲 Recibo de quitação de ${person.name} copiado para o WhatsApp!`
        : `📲 Lembrete + Chave PIX para ${person.name} copiado para o WhatsApp!`
    );
  };

  const handleSendDebtWhatsApp = (sale: {
    personName?: string;
    total: number;
    date: string;
    items: { quantity: number; productName: string }[];
  }) => {
    const pixKey = CAMP_2027_CONFIG.pixKey || 'pix@igrejamanancial.com.br';
    const itemsText = sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ');
    const message =
      `🍊 *CANTINA MANANCIAL - LEMBRETE DE COMANDA*\n\n` +
      `Olá, *${sale.personName || 'Irmão(ã)'}*! Graça e Paz!\n` +
      `Consta em aberto na cantina o lançamento de ${new Date(sale.date).toLocaleDateString('pt-BR')}:\n` +
      `• *Itens:* ${itemsText}\n` +
      `• *Total:* R$ ${formatBRL(sale.total)}\n\n` +
      `🔑 *Chave PIX:* ${pixKey}\n` +
      `_Obrigado por abençoar a Cantina Manancial!_`;

    navigator.clipboard.writeText(message);
    showToast(`📲 Cobrança da comanda de ${sale.personName || 'Cliente'} copiada para o WhatsApp!`);
  };

  // ============================================================================
  // HANDLERS DE ESTOQUE & PRODUTOS (CRIAR, EDITAR, REPOR, EXCLUIR)
  // ============================================================================
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('TODAS');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Comida',
    costPrice: '',
    sellPrice: '',
    stock: '20',
    minStock: '5',
    launchPurchaseExpense: false
  });

  const openProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name,
        category: prod.category || 'Comida',
        costPrice: String(prod.costPrice),
        sellPrice: String(prod.sellPrice),
        stock: String(prod.stock),
        minStock: String(prod.minStock || 5),
        launchPurchaseExpense: false
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category: 'Comida',
        costPrice: '',
        sellPrice: '',
        stock: '24',
        minStock: '5',
        launchPurchaseExpense: true
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    const cost = parseFloat(productForm.costPrice);
    const sell = parseFloat(productForm.sellPrice);
    const qty = parseInt(productForm.stock, 10) || 0;
    const min = parseInt(productForm.minStock, 10) || 5;

    if (!productForm.name.trim() || Number.isNaN(cost) || Number.isNaN(sell) || sell <= 0) {
      showToast('⚠️ Preencha nome, preço de custo e preço de venda válidos.');
      return;
    }

    const payload: Omit<Product, 'id'> = {
      name: productForm.name.trim(),
      category: productForm.category.trim() || 'Geral',
      costPrice: cost,
      sellPrice: sell,
      stock: qty,
      minStock: min,
      isActive: true
    };

    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, payload);
        await apiUpdateProduct(editingProduct.id, payload).catch(() => null);
        showToast(`✅ Produto "${payload.name}" atualizado no estoque!`);
      } else {
        const created = await apiCreateProduct(payload).catch(() => null);
        if (created) {
          setProducts([...products, created]);
        } else {
          addProduct(payload);
        }

        if (productForm.launchPurchaseExpense && qty > 0 && cost > 0) {
          const totalPurchaseCost = qty * cost;
          const txPayload: Omit<Transaction, 'id'> = {
            description: `Compra de Estoque Cantina: ${qty}x ${payload.name}`,
            amount: totalPurchaseCost,
            type: 'SAIDA',
            category: 'CANTINA',
            date: new Date().toISOString(),
            paymentMethod: 'Pix',
            isSettled: true,
            eventId: selectedEventFilter !== 'TODOS' ? selectedEventFilter : 'acampamento-2027',
            eventName: 'Estoque Cantina'
          };
          const createdTx = await createTransaction(txPayload).catch(() => null);
          if (createdTx) {
            setTransactions([createdTx, ...transactions]);
          } else {
            addTransaction(txPayload);
          }
        }
        showToast(`📦 Produto "${payload.name}" adicionado ao estoque!`);
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      showToast(`Erro ao salvar produto: ${err.message}`);
    }
  };

  const handleAdjustStock = async (prod: Product, delta: number, recordExpense = false) => {
    const nextStock = Math.max(0, prod.stock + delta);
    updateProduct(prod.id, { stock: nextStock });
    await apiUpdateProduct(prod.id, { stock: nextStock }).catch(() => null);

    if (recordExpense && delta > 0 && prod.costPrice > 0) {
      const expenseAmount = delta * prod.costPrice;
      const txPayload: Omit<Transaction, 'id'> = {
        description: `Reposição de Estoque: +${delta}un ${prod.name}`,
        amount: expenseAmount,
        type: 'SAIDA',
        category: 'CANTINA',
        date: new Date().toISOString(),
        paymentMethod: 'Pix',
        isSettled: true,
        eventId: selectedEventFilter !== 'TODOS' ? selectedEventFilter : 'acampamento-2027'
      };
      const createdTx = await createTransaction(txPayload).catch(() => null);
      if (createdTx) {
        setTransactions([createdTx, ...transactions]);
      } else {
        addTransaction(txPayload);
      }
      showToast(
        `📦 +${delta}un em "${prod.name}" e saída de R$ ${formatBRL(expenseAmount)} registrada no Caixa!`
      );
    } else {
      showToast(`📦 Estoque de "${prod.name}" ajustado para ${nextStock} un.`);
    }
  };

  const handleDeleteStockProduct = async (prod: Product) => {
    if (!window.confirm(`Deseja realmente excluir o produto "${prod.name}" do estoque?`)) return;
    deleteProduct(prod.id);
    await apiDeleteProduct(prod.id).catch(() => null);
    showToast(`🗑️ Produto "${prod.name}" excluído do estoque.`);
  };

  // Settle pending canteen sale from Financial hub
  const handleSettlePendingSale = async (saleId: string, method: PaymentMethod = 'Pix') => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'PAID') return;

    settleSale(saleId, method);
    await apiUpdateSale(saleId, { status: 'PAID', paymentMethod: method }).catch(() => null);

    const txPayload: Omit<Transaction, 'id'> = {
      description: `Recebimento Comanda Cantina: ${sale.personName || 'Cliente'} (#${sale.id.slice(-4)})`,
      amount: sale.total,
      type: 'ENTRADA',
      category: 'CANTINA',
      date: new Date().toISOString(),
      paymentMethod: method,
      referenceId: sale.id,
      personId: sale.personId,
      personName: sale.personName,
      isSettled: true,
      items: sale.items,
      eventId: sale.eventId || 'acampamento-2026',
      eventName: sale.eventName || 'Cantina Manancial'
    };
    await createTransaction(txPayload).catch(() => null);
    showToast(`✅ Comanda de ${sale.personName || 'Cliente'} (R$ ${formatBRL(sale.total)}) quitada!`);
  };

  // ============================================================================
  // EXPORTAÇÃO DE BALANCETE E CSV
  // ============================================================================
  const handleShareBalancete = () => {
    const text =
      `📑 *BALANCETE FINANCEIRO UNIFICADO - IGREJA MANANCIAL*\n` +
      `📅 *Emissão:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `🟢 *TOTAL DE ENTRADAS (FILTRO ATUAL):* R$ ${formatBRL(metrics.totalEntradas)}\n` +
      `• Dízimos: R$ ${formatBRL(metrics.totalDizimos)}\n` +
      `• Ofertas: R$ ${formatBRL(metrics.totalOfertas)}\n` +
      `• Cantina & Eventos: R$ ${formatBRL(metrics.totalCantina)}\n` +
      `• Inscrições Acampamento: R$ ${formatBRL(metrics.totalInscricoes)}\n` +
      `• Outras Entradas: R$ ${formatBRL(metrics.totalOutrasEntradas)}\n\n` +
      `🔴 *TOTAL DE SAÍDAS (FILTRO ATUAL):* R$ ${formatBRL(metrics.totalSaidas)}\n` +
      `• Despesas Fixas: R$ ${formatBRL(metrics.totalDespesasFixas)}\n` +
      `• Aluguel Chácara / Retiro: R$ ${formatBRL(metrics.totalAluguelChacara)}\n` +
      `• Ministérios: R$ ${formatBRL(metrics.totalMinisterios)}\n` +
      `• Manutenção & Som: R$ ${formatBRL(metrics.totalManutencao)}\n` +
      `• Ação Social: R$ ${formatBRL(metrics.totalAcaoSocial)}\n` +
      `• Outras Saídas: R$ ${formatBRL(metrics.totalOutrasSaidas)}\n\n` +
      `🏕️ *RESUMO ACAMPAMENTO 2027 (PROJEÇÃO):*\n` +
      `• Inscritos: ${camp2027Stats.totalPeople} pessoas (Contratado: R$ ${formatBRL(camp2027Stats.contracted)})\n` +
      `• Já Arrecadado: R$ ${formatBRL(camp2027Stats.collected)} | Falta Receber: R$ ${formatBRL(camp2027Stats.receivable)}\n` +
      `• Orçamento de Custos 2027: R$ ${formatBRL(camp2027Stats.projectedBudget)}\n\n` +
      `📦 *ESTOQUE CANTINA:*\n` +
      `• Produtos Ativos: ${stockMetrics.totalProducts} (${stockMetrics.totalUnits} un.)\n` +
      `• Valor de Venda em Estoque: R$ ${formatBRL(stockMetrics.totalSellValue)}\n\n` +
      `⚖️ *RESULTADO DO PERÍODO:* ${metrics.saldoLiquido >= 0 ? '+' : ''}R$ ${formatBRL(metrics.saldoLiquido)}\n` +
      `💰 *SALDO ACUMULADO EM CAIXA:* R$ ${formatBRL(metrics.saldoGeralAcumulado)}\n\n` +
      `_Tesouraria Oficial Igreja Manancial_`;

    navigator.clipboard.writeText(text);
    showToast('📋 Balancete completo copiado para a área de transferência (WhatsApp)!');
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descricao', 'Evento', 'Pessoa', 'Metodo', 'Valor'];
    const rows = filteredTransactions.map((t) => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.type,
      t.category,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.eventName || t.eventId || 'Geral'}"`,
      `"${t.personName || ''}"`,
      t.paymentMethod || 'Pix',
      t.amount.toFixed(2)
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financeiro-manancial-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Planilha CSV exportada com sucesso!');
  };

  return (
    <div
      className={`min-h-[100dvh] bg-[#070c14] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white transition-colors duration-300 ${
        !isDarkMode ? 'theme-light-adapt' : ''
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-purple-400/40 text-white text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 max-w-[92vw]">
          <Sparkles size={16} className="text-purple-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          HEADER UNIFICADO DA CENTRAL FINANCEIRA
         ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#070c14]/92 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Brand & Back */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                onClick={handleBack}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title={canAccessPastoral ? 'Voltar para Gestão Pastores' : 'Voltar para Início'}
              >
                <ArrowLeft size={18} />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20 shrink-0">
                <Wallet size={20} className="stroke-[2.3]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-black text-base sm:text-lg text-white tracking-tight truncate">
                    Central Financeira Manancial
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                    Hub Integrado 2026 • 2027
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  Tesouraria, Acampamento Passado & Futuro, Eventos, Entradas/Saídas e Estoque
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full lg:w-auto justify-end">
              <button
                onClick={() => openTransactionModal('ENTRADA')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all active:scale-95 shadow-md"
              >
                <Plus size={15} />
                <span>Nova Entrada</span>
              </button>

              <button
                onClick={() => openTransactionModal('SAIDA')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all active:scale-95 shadow-md"
              >
                <Minus size={15} />
                <span>Nova Saída</span>
              </button>

              <button
                onClick={() => openEventModal()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all active:scale-95 shadow-md"
                title="Criar Novo Evento Financeiro"
              >
                <Calendar size={14} />
                <span className="hidden sm:inline">+ Evento</span>
              </button>

              <button
                onClick={() => openProductModal()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all active:scale-95 shadow-md"
                title="Adicionar Produto ao Estoque"
              >
                <Package size={14} />
                <span className="hidden sm:inline">+ Produto</span>
              </button>

              <button
                onClick={() => navigate('/cantina')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black transition-all active:scale-95 shadow-md"
                title="Abrir PDV da Cantina"
              >
                <ShoppingBag size={14} />
                <span>PDV Cantina</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold"
                title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              >
                {isDarkMode ? (
                  <Sun size={16} className="text-amber-400" />
                ) : (
                  <Moon size={16} className="text-slate-700" />
                )}
                <span className="hidden xl:inline">{isDarkMode ? 'Claro' : 'Escuro'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs + Global Event & Period Selectors */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-2 border-t border-white/10">
            {/* 7 Unified Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {(
                [
                  { id: 'visao_geral', label: 'Visão Geral', icon: BarChart3 },
                  { id: 'fluxo', label: 'Entradas & Saídas', icon: Receipt },
                  { id: 'acamp_2027', label: 'Projeção Acamp 2027', icon: Tent },
                  { id: 'acamp_2026', label: 'Acamp Passado 2026', icon: Archive },
                  { id: 'eventos', label: `Eventos (${financialEvents.length})`, icon: Calendar },
                  { id: 'estoque', label: `Estoque (${products.length})`, icon: Package },
                  { id: 'balancete', label: 'Balancete & DRE', icon: FileText }
                ] as { id: FinancialTab; label: string; icon: React.ElementType }[]
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                        : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Context Filter: Event + Period */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <Tag size={13} className="text-purple-400 shrink-0" />
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  aria-label="Filtrar por Evento"
                  className="w-full sm:w-auto px-2.5 py-1.5 rounded-xl bg-[#0e172a] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                >
                  <option value="TODOS">Todos os Eventos / Geral</option>
                  {financialEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'tudo', label: 'Tudo' },
                    { id: 'mes_atual', label: 'Este Mês' },
                    { id: 'fev_2026', label: 'Fev/26' },
                    { id: 'ano_2026', label: '2026' },
                    { id: 'ano_2027', label: '2027' }
                  ] as { id: PeriodFilter; label: string }[]
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriodFilter(p.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap ${
                      periodFilter === p.id
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CONTEÚDO PRINCIPAL
         ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-28 space-y-6">
        {/* Global KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Saldo Geral em Caixa */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#0e172a] to-[#0c1424] border border-purple-500/30 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Saldo Acumulado em Caixa
              </span>
              <Wallet size={16} className="text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              R$ {formatBRL(metrics.saldoGeralAcumulado)}
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>Entradas - Saídas Reais</span>
              <button
                onClick={() => handleTabChange('fluxo')}
                className="text-purple-300 font-bold hover:underline"
              >
                Ver livro caixa →
              </button>
            </div>
          </div>

          {/* Card 2: Entradas vs Saídas (Filtro Atual) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0d1424] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Movimentação ({metrics.count} lanç.)
              </span>
              <ArrowUpRight size={16} className="text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Entradas</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">
                  +R$ {formatBRL(metrics.totalEntradas)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Saídas</span>
                <span className="text-lg sm:text-xl font-black text-rose-400">
                  -R$ {formatBRL(metrics.totalSaidas)}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Resultado Líquido:</span>
              <span
                className={`font-black ${
                  metrics.saldoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {metrics.saldoLiquido >= 0 ? '+' : ''}R$ {formatBRL(metrics.saldoLiquido)}
              </span>
            </div>
          </div>

          {/* Card 3: Projeção Acampamento 2027 */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0d1424] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Acampamento 2027 (Projeção)
              </span>
              <Tent size={16} className="text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              R$ {formatBRL(camp2027Stats.collected)}{' '}
              <span className="text-xs font-bold text-slate-400">
                / R$ {formatBRL(camp2027Stats.contracted)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {camp2027Stats.totalPeople} inscritos • Orç: R${' '}
                {formatBRL(camp2027Stats.projectedBudget)}
              </span>
              <button
                onClick={() => handleTabChange('acamp_2027')}
                className="text-cyan-400 font-bold hover:underline"
              >
                Simular →
              </button>
            </div>
          </div>

          {/* Card 4: Estoque & Comandas Cantina */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0d1424] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                Estoque & Cantina
              </span>
              <Package size={16} className="text-orange-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              R$ {formatBRL(stockMetrics.totalSellValue)}{' '}
              <span className="text-xs font-bold text-emerald-400">
                (+R$ {formatBRL(stockMetrics.projectedProfit)} lucro)
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {stockMetrics.totalProducts} prod. • Fiado: R${' '}
                {formatBRL(stockMetrics.pendingReceivables)}
              </span>
              <button
                onClick={() => handleTabChange('estoque')}
                className="text-orange-400 font-bold hover:underline"
              >
                Gerir →
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ABA 1: VISÃO GERAL & HUB INTEGRADO (visao_geral)
           ========================================================================= */}
        {activeTab === 'visao_geral' && (
          <div className="space-y-6">
            {/* Comparativo Direto: Acampamento Passado (2026) vs Acampamento Futuro (2027) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Bloco Acampamento 2026 (Realizado) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-amber-500/30 space-y-4 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Acampamento Passado • Fev/2026
                    </span>
                    <h2 className="text-lg font-black text-white mt-1.5">
                      Fechamento Acampamento 2026
                    </h2>
                    <p className="text-xs text-slate-400">
                      Histórico preservado: {camp2026Stats.totalPeople} participantes (R$ 432/pessoa) e vendas de Fev/2026
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('acamp_2026')}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition-all shrink-0 cursor-pointer"
                  >
                    Abrir Gestão 2026
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Inscrições 2026
                    </span>
                    <span className="text-base font-black text-emerald-400">
                      R$ {formatBRL(camp2026Stats.collectedInscriptions)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {camp2026Stats.paidCount}/{camp2026Stats.totalPeople} quitados
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Cantina Fev/26
                    </span>
                    <span className="text-base font-black text-orange-400">
                      R$ {formatBRL(camp2026Stats.canteenRevenue2026)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Pend.: R$ {formatBRL(camp2026Stats.canteenPending2026)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Custos 2026
                    </span>
                    <span className="text-base font-black text-rose-400">
                      R$ {formatBRL(camp2026Stats.totalCosts2026)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {camp2026Projections.length} itens fechados
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloco Acampamento 2027 (Projeção Futura) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-purple-500/30 space-y-4 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Acampamento Futuro • Fev/2027
                    </span>
                    <h2 className="text-lg font-black text-white mt-1.5">
                      Projeção & Orçamento Acampamento 2027
                    </h2>
                    <p className="text-xs text-slate-400">
                      {camp2027Stats.totalPeople} inscritos (Adulto R$ 582 / 6x R$ 97 • Criança R$ 300)
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('acamp_2027')}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shrink-0 cursor-pointer"
                  >
                    Abrir Projeção 2027
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Receita Contratada
                    </span>
                    <span className="text-base font-black text-emerald-400">
                      R$ {formatBRL(camp2027Stats.contracted)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Pago: R$ {formatBRL(camp2027Stats.collected)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Orçamento Previsto
                    </span>
                    <span className="text-base font-black text-rose-400">
                      R$ {formatBRL(camp2027Stats.projectedBudget)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Break-even: {camp2027Stats.breakEvenAdults} adultos
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Falta Receber
                    </span>
                    <span className="text-base font-black text-amber-400">
                      R$ {formatBRL(camp2027Stats.receivable)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {camp2027Stats.paidCount} quitados / {camp2027Stats.partialCount} parc.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Eventos Ativos + Alertas de Estoque e Contas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Resumo de Eventos e Caixas */}
              <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-base text-white">
                      Eventos & Caixas Integrados ({financialEvents.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Clique em um evento para filtrar todo o financeiro ou crie novos eventos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEventModal()}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all"
                    >
                      + Novo Evento
                    </button>
                    <button
                      onClick={() => handleTabChange('eventos')}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold"
                    >
                      Ver Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {financialEvents.slice(0, 6).map((ev) => {
                    const evTxs = transactions.filter((t) => matchesEventFilter(t, ev.id));
                    const evIn = evTxs
                      .filter((t) => t.type === 'ENTRADA')
                      .reduce((a, b) => a + b.amount, 0);
                    const evOut = evTxs
                      .filter((t) => t.type === 'SAIDA')
                      .reduce((a, b) => a + b.amount, 0);
                    const isSelected = selectedEventFilter === ev.id;
                    return (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-purple-500/15 border-purple-400'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 block truncate">
                              {ev.badge}
                            </span>
                            <h4 className="font-black text-sm text-white truncate">{ev.name}</h4>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEventModal(ev)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white"
                              title="Editar evento"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                              title="Excluir evento"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                          <span className="text-emerald-400 font-bold">+R$ {formatBRL(evIn)}</span>
                          <span className="text-rose-400 font-bold">-R$ {formatBRL(evOut)}</span>
                          <button
                            onClick={() =>
                              setSelectedEventFilter(isSelected ? 'TODOS' : ev.id)
                            }
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isSelected ? 'Filtro Ativo' : 'Filtrar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radar de Alertas: Contas a Pagar & Estoque Baixo */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-base text-white flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-400" />
                      <span>Alertas & Pendências</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      Ação Rápida
                    </span>
                  </div>

                  {/* Contas Fixas Pendentes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>Contas Fixas em Aberto</span>
                      <button
                        onClick={() => {
                          setLedgerTypeFilter('CONTAS');
                          handleTabChange('fluxo');
                        }}
                        className="text-purple-400 hover:underline text-[11px]"
                      >
                        Gerir contas →
                      </button>
                    </div>
                    {fixedBills.filter((b) => b.status !== 'PAGO').length === 0 ? (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                        ✅ Todas as contas fixas do mês estão quitadas.
                      </div>
                    ) : (
                      fixedBills
                        .filter((b) => b.status !== 'PAGO')
                        .slice(0, 3)
                        .map((bill) => (
                          <div
                            key={bill.id}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{bill.title}</div>
                              <span className="text-[10px] text-slate-400">
                                Vence dia {bill.dueDay} • R$ {formatBRL(bill.amount)}
                              </span>
                            </div>
                            <button
                              onClick={() => handlePayFixedBill(bill)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shrink-0"
                            >
                              Pagar
                            </button>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Produtos com Estoque Baixo */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>Alertas de Estoque ({stockMetrics.lowStockItems.length})</span>
                      <button
                        onClick={() => handleTabChange('estoque')}
                        className="text-orange-400 hover:underline text-[11px]"
                      >
                        Abrir estoque →
                      </button>
                    </div>
                    {stockMetrics.lowStockItems.length === 0 ? (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                        ✅ Todos os produtos estão com estoque saudável.
                      </div>
                    ) : (
                      stockMetrics.lowStockItems.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{prod.name}</div>
                            <span className="text-[10px] text-rose-400 font-bold">
                              Restam {prod.stock} un. (Mín: {prod.minStock})
                            </span>
                          </div>
                          <button
                            onClick={() => handleAdjustStock(prod, 10, true)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] shrink-0"
                            title="Repor +10 unidades e lançar custo no caixa"
                          >
                            +10 un
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Atalhos Rápidos para Sub-rotas do Sistema */}
                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate('/acampamento/pagamentos')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5"
                  >
                    <Users size={13} /> Painel Inscritos
                  </button>
                  <button
                    onClick={() => navigate('/org/analytics/costs')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5"
                  >
                    <Calculator size={13} /> Planilha Custos
                  </button>
                </div>
              </div>
            </div>

            {/* Painel Gráfico de Distribuição de Receitas/Despesas & Progresso Meta 2027 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <BarChart3 size={16} className="text-purple-400" />
                    <span>Raio-X de Distribuição Contábil & Meta de Captação 2027</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Acompanhamento visual das fontes de receita, centros de despesa e cobertura do orçamento 2027
                  </p>
                </div>
                <button
                  onClick={handleShareBalancete}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5"
                >
                  <MessageCircle size={13} /> Compartilhar no WhatsApp
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Coluna 1: Progresso Captação Acampamento 2027 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Meta de Captação 2027</span>
                    <span className="text-purple-400">
                      {camp2027Stats.projectedBudget > 0
                        ? Math.round((camp2027Stats.collected / camp2027Stats.projectedBudget) * 100)
                        : 0}
                      % do orçamento
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          camp2027Stats.projectedBudget > 0
                            ? Math.round((camp2027Stats.collected / camp2027Stats.projectedBudget) * 100)
                            : 0
                        )}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Arrecadado: R$ {formatBRL(camp2027Stats.collected)}</span>
                    <span>Meta Custos: R$ {formatBRL(camp2027Stats.projectedBudget)}</span>
                  </div>
                </div>

                {/* Coluna 2: Composição de Entradas */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="font-bold text-emerald-400">Composição de Entradas</div>
                  {[
                    { label: 'Dízimos & Ofertas', val: metrics.totalDizimos + metrics.totalOfertas },
                    { label: 'Cantina & Eventos', val: metrics.totalCantina },
                    { label: 'Inscrições Retiro', val: metrics.totalInscricoes }
                  ].map((row) => {
                    const pct =
                      metrics.totalEntradas > 0
                        ? Math.round((row.val / metrics.totalEntradas) * 100)
                        : 0;
                    return (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">{row.label}</span>
                          <span className="font-bold text-white">
                            R$ {formatBRL(row.val)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coluna 3: Composição de Saídas */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="font-bold text-rose-400">Composição de Saídas</div>
                  {[
                    { label: 'Chácara & Retiro', val: metrics.totalAluguelChacara + metrics.totalOutrasSaidas },
                    { label: 'Despesas Fixas & Manut.', val: metrics.totalDespesasFixas + metrics.totalManutencao },
                    { label: 'Ministérios & Social', val: metrics.totalMinisterios + metrics.totalAcaoSocial }
                  ].map((row) => {
                    const pct =
                      metrics.totalSaidas > 0
                        ? Math.round((row.val / metrics.totalSaidas) * 100)
                        : 0;
                    return (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">{row.label}</span>
                          <span className="font-bold text-white">
                            R$ {formatBRL(row.val)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-rose-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 2: ENTRADAS, SAÍDAS & CONTAS FIXAS (fluxo)
           ========================================================================= */}
        {activeTab === 'fluxo' && (
          <div className="space-y-6">
            {/* Sub-barra de Controle: Todos | Entradas | Saídas | Contas Fixas */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(
                    [
                      { id: 'TODOS', label: `Extrato Geral (${filteredTransactions.length})` },
                      { id: 'ENTRADA', label: 'Apenas Entradas' },
                      { id: 'SAIDA', label: 'Apenas Saídas' },
                      { id: 'CONTAS', label: `Contas Fixas (${fixedBills.length})` }
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLedgerTypeFilter(item.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        ledgerTypeFilter === item.id
                          ? 'bg-purple-600 text-white font-black shadow-md'
                          : 'bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => openTransactionModal('ENTRADA')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Lançar Entrada
                  </button>
                  <button
                    onClick={() => openTransactionModal('SAIDA')}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5"
                  >
                    <Minus size={14} /> Lançar Saída
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download size={14} /> Exportar CSV
                  </button>
                </div>
              </div>

              {ledgerTypeFilter === 'CONTAS' ? (
                /* GERENCIADOR DE CONTAS FIXAS E VENCIMENTOS */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <h4 className="font-black text-xs uppercase tracking-wider text-purple-300">
                      Adicionar Nova Conta Fixa ou Compromisso Agendado
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      <input
                        type="text"
                        placeholder="Descrição (ex: Energia CPFL, Internet...)"
                        value={newBillTitle}
                        onChange={(e) => setNewBillTitle(e.target.value)}
                        className="sm:col-span-2 p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Valor R$"
                        value={newBillAmount}
                        onChange={(e) => setNewBillAmount(e.target.value)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={31}
                          placeholder="Dia Venc."
                          value={newBillDueDay}
                          onChange={(e) => setNewBillDueDay(e.target.value)}
                          className="w-20 p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                          title="Dia do vencimento"
                        />
                        <select
                          value={newBillCategory}
                          onChange={(e) => setNewBillCategory(e.target.value as TransactionCategory)}
                          className="flex-1 p-2.5 rounded-xl bg-[#0e172a] border border-white/15 text-white text-xs"
                        >
                          <option value="DESPESA_FIXA">Despesa Fixa</option>
                          <option value="ALUGUEL_CHACARA">Aluguel Chácara</option>
                          <option value="MANUTENCAO">Manutenção</option>
                          <option value="MINISTERIO">Ministério</option>
                          <option value="ACAO_SOCIAL">Ação Social</option>
                        </select>
                      </div>
                      <button
                        onClick={handleAddFixedBill}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs"
                      >
                        + Adicionar Conta
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {fixedBills.map((bill) => {
                      const isPaid = bill.status === 'PAGO';
                      return (
                        <div
                          key={bill.id}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                isPaid
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              <Building size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{bill.title}</div>
                              <span className="text-slate-400">
                                Vencimento todo dia {bill.dueDay} •{' '}
                                {CATEGORY_LABELS[bill.category] || bill.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <div className="font-black text-white text-base">
                                R$ {formatBRL(bill.amount)}
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isPaid
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {isPaid ? 'Quitado' : 'Pendente'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handlePayFixedBill(bill)}
                                className={`px-3 py-2 rounded-xl font-bold text-xs transition-colors ${
                                  isPaid
                                    ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {isPaid ? 'Reabrir' : 'Dar Baixa'}
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Excluir conta fixa "${bill.title}"?`)) {
                                    deleteFixedBill(bill.id);
                                    await deleteFixedBillApi(bill.id).catch(() => null);
                                    showToast('🗑️ Conta fixa excluída.');
                                  }
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                                title="Excluir conta fixa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* LIVRO CAIXA (ENTRADAS E SAÍDAS) */
                <>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Pesquisar lançamento por descrição, pessoa, evento ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Filter size={14} className="text-slate-400 shrink-0" />
                      <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="p-2.5 rounded-xl bg-[#0e172a] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                      >
                        <option value="TODAS">Todas as Categorias</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400">
                          <th className="pb-3 font-semibold">Data</th>
                          <th className="pb-3 font-semibold">Descrição</th>
                          <th className="pb-3 font-semibold">Categoria / Evento</th>
                          <th className="pb-3 font-semibold">Vínculo</th>
                          <th className="pb-3 font-semibold">Método / Status</th>
                          <th className="pb-3 font-semibold text-right">Valor</th>
                          <th className="pb-3 font-semibold text-center w-24">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredTransactions.map((t) => {
                          const isIncome = t.type === 'ENTRADA';
                          const isSettled = t.isSettled !== false;
                          return (
                            <tr key={t.id} className="hover:bg-white/[0.02]">
                              <td className="py-3 text-slate-400 whitespace-nowrap pr-2">
                                {new Date(t.date).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-3 font-bold text-white max-w-xs pr-2">
                                <div className="truncate">{t.description}</div>
                              </td>
                              <td className="py-3 whitespace-nowrap pr-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                                  {CATEGORY_LABELS[t.category] || t.category}
                                </span>
                                {(t.eventName || t.eventId) && (
                                  <span className="ml-1.5 text-[10px] text-purple-300 font-semibold">
                                    • {t.eventName || t.eventId}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-slate-300 whitespace-nowrap pr-2">
                                {t.personName ? (
                                  <span className="font-semibold text-purple-300">
                                    {t.personName}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">—</span>
                                )}
                              </td>
                              <td className="py-3 whitespace-nowrap pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400">{t.paymentMethod || 'Pix'}</span>
                                  <button
                                    onClick={() => handleToggleTxSettled(t)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                      isSettled
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                    title="Clique para alternar entre Quitado e Pendente"
                                  >
                                    {isSettled ? 'Quitado' : 'Pendente'}
                                  </button>
                                </div>
                              </td>
                              <td
                                className={`py-3 font-black text-right whitespace-nowrap pr-2 ${
                                  isIncome ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {isIncome ? '+ ' : '- '}R$ {formatBRL(t.amount)}
                              </td>
                              <td className="py-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => openTransactionModal(t.type, undefined, t)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Editar lançamento"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransaction(t.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                    title="Excluir lançamento"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      <Receipt size={36} className="mx-auto text-slate-500 mb-2 opacity-60" />
                      Nenhum lançamento encontrado para o filtro selecionado.
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setPeriodFilter('tudo');
                            setSelectedEventFilter('TODOS');
                            setSelectedCategoryFilter('TODAS');
                            setSearchTerm('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold"
                        >
                          Limpar Filtros
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: PROJEÇÃO ACAMPAMENTO FUTURO 2027 (acamp_2027)
           ========================================================================= */}
        {activeTab === 'acamp_2027' && (
          <div className="space-y-6">
            {/* Banner de Status 2027 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#0e172a] to-[#0c1424] border border-purple-500/30 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Projeção Financeira Oficial • 05 a 09 de Fevereiro de 2027
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">
                    Planejamento, Simulador & Inscrições Acampamento 2027
                  </h2>
                  <p className="text-xs text-slate-400">
                    Adulto: R$ 582,00 (6x de R$ 97,00) • Criança: R$ 300,00 • Meta Ponto de Equilíbrio: {camp2027Stats.breakEvenAdults} adultos pagantes
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate('/acampamento/pagamentos')}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} /> Abrir Tela Pastoral de Pagamentos
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Restaurar lista base oficial de 44 inscritos do Acampamento 2027?'
                        )
                      ) {
                        resetToOfficialList();
                        showToast('✅ Lista oficial 2027 restaurada!');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Restaurar Lista Base
                  </button>
                </div>
              </div>

              {/* 4 KPIs 2027 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Total Contratado (Inscrições)
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    R$ {formatBRL(camp2027Stats.contracted)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {camp2027Stats.adultsCount} adultos/jovens + {camp2027Stats.childrenCount} crianças
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">
                    Já Recebido em Caixa
                  </span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    R$ {formatBRL(camp2027Stats.collected)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {camp2027Stats.paidCount} quitados • {camp2027Stats.partialCount} pagando parcelas
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-amber-400">
                    A Receber (Parcelas Futuras)
                  </span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    R$ {formatBRL(camp2027Stats.receivable)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {camp2027Stats.zeroCount} inscritos ainda sem 1ª parcela
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-rose-400">
                    Orçamento de Custos 2027
                  </span>
                  <div className="text-2xl font-black text-rose-400 mt-1">
                    R$ {formatBRL(camp2027Stats.projectedBudget)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Executado: R$ {formatBRL(camp2027Stats.executedBudget)}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulador Interativo + Planilha de Custos Projetados 2027 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Simulador de Cenários (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-white flex items-center gap-2">
                      <Calculator size={16} className="text-cyan-400" />
                      <span>Simulador de Cenário 2027</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Simule quantos participantes pagam os custos projetados
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">Adultos / Jovens Pagantes (R$ 582)</span>
                      <span className="text-cyan-400">
                        {simAdults} pax = R$ {formatBRL(simulationResult.revAdults)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={90}
                      value={simAdults}
                      onChange={(e) => setSimAdults(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">Crianças Pagantes (R$ 300)</span>
                      <span className="text-cyan-400">
                        {simChildren} pax = R$ {formatBRL(simulationResult.revChildren)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={simChildren}
                      onChange={(e) => setSimChildren(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">Lucro Estimado Cantina (R$)</span>
                      <span className="text-emerald-400">R$ {formatBRL(simCanteenProfit)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={8000}
                      step={100}
                      value={simCanteenProfit}
                      onChange={(e) => setSimCanteenProfit(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receita Simulada Total:</span>
                    <span className="font-black text-emerald-400">
                      R$ {formatBRL(simulationResult.totalSimulatedRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Orçamento de Custos 2027:</span>
                    <span className="font-black text-rose-400">
                      - R$ {formatBRL(simulationResult.totalBudget)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                    <span className="font-bold text-white">Resultado Projetado:</span>
                    <span
                      className={`text-lg font-black ${
                        simulationResult.netSimulated >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {simulationResult.netSimulated >= 0 ? '+' : ''}R${' '}
                      {formatBRL(simulationResult.netSimulated)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Planilha de Custos Projetados 2027 (7 cols) */}
              <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-base text-white">
                      Orçamento & Projeção de Despesas 2027 ({expenseProjections.length} itens)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Adicione, edite ou exclua custos previstos e lance no caixa quando forem pagos
                    </p>
                  </div>
                  <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Total: R$ {formatBRL(camp2027Stats.projectedBudget)}
                  </span>
                </div>

                {/* Form para Adicionar Novo Custo Projetado 2027 */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <input
                    type="text"
                    placeholder="Novo custo (ex: Transporte, Camisetas...)"
                    value={newCostLabel}
                    onChange={(e) => setNewCostLabel(e.target.value)}
                    className="sm:col-span-2 p-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Valor R$"
                    value={newCostAmount}
                    onChange={(e) => setNewCostAmount(e.target.value)}
                    className="p-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold"
                  />
                  <button
                    onClick={() => handleAddCostProjection('2027')}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs"
                  >
                    + Adicionar Custo
                  </button>
                </div>

                {/* Lista de Custos Projetados 2027 */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {expenseProjections.map((item) => {
                    const isEditing = editingProjectionId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={editingProjectionLabel}
                              onChange={(e) => setEditingProjectionLabel(e.target.value)}
                              className="flex-1 p-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs"
                            />
                            <input
                              type="number"
                              value={editingProjectionAmount}
                              onChange={(e) => setEditingProjectionAmount(e.target.value)}
                              className="w-28 p-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold"
                            />
                            <button
                              onClick={() => {
                                const amt = parseFloat(editingProjectionAmount);
                                if (editingProjectionLabel.trim() && !Number.isNaN(amt) && amt >= 0) {
                                  updateProjectionItem(item.id, {
                                    label: editingProjectionLabel.trim(),
                                    amount: amt
                                  });
                                  showToast('✅ Custo projetado atualizado!');
                                }
                                setEditingProjectionId(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingProjectionId(null)}
                              className="px-2 py-1.5 rounded-lg bg-white/10 text-slate-300"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  item.isExecuted ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate">{item.label}</div>
                                <span className="text-[10px] text-slate-400">
                                  {item.isExecuted
                                    ? 'Executado no Fluxo de Caixa'
                                    : 'Previsto no Orçamento 2027'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="font-black text-white text-sm">
                                R$ {formatBRL(item.amount)}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleExecuteProjection2027(item)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${
                                    item.isExecuted
                                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                  }`}
                                  title={
                                    item.isExecuted
                                      ? 'Desfazer lançamento no caixa'
                                      : 'Converter em Saída real no Livro Caixa'
                                  }
                                >
                                  {item.isExecuted ? (
                                    <>
                                      <Undo2 size={11} /> Desfazer
                                    </>
                                  ) : (
                                    <>
                                      <Play size={11} /> Lançar Caixa
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProjectionId(item.id);
                                    setEditingProjectionLabel(item.label);
                                    setEditingProjectionAmount(String(item.amount));
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                                  title="Editar valor"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Remover "${item.label}" da projeção 2027?`)) {
                                      deleteProjectionItem(item.id);
                                      showToast('🗑️ Item removido da projeção 2027.');
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                  title="Excluir item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Controle de Inscritos & Parcelas 2027 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-white">
                    Inscritos & Régua de 6 Parcelas Acampamento 2027 ({people.length} inscritos)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gerencie inscrições, lance parcelas de R$ 97,00 direto no caixa ou adicione novos acampantes
                  </p>
                </div>

                {/* Adicionar Inscrito 2027 */}
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Nome do novo inscrito 2027..."
                    value={newCamperName}
                    onChange={(e) => setNewCamperName(e.target.value)}
                    className="flex-1 md:w-48 p-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                  <select
                    value={newCamperAge}
                    onChange={(e) =>
                      setNewCamperAge(e.target.value as 'Adulto' | 'Jovem' | 'Criança')
                    }
                    className="p-2 rounded-xl bg-[#0e172a] border border-white/15 text-white text-xs font-bold"
                  >
                    <option value="Adulto">Adulto (R$ 582)</option>
                    <option value="Jovem">Jovem (R$ 582)</option>
                    <option value="Criança">Criança (R$ 300)</option>
                  </select>
                  <button
                    onClick={() => handleAddCamper('2027')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1"
                  >
                    <UserPlus size={14} /> Inscrever
                  </button>
                </div>
              </div>

              {/* Busca e Filtro de Inscritos 2027 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-white/10">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Buscar inscrito 2027 por nome..."
                    value={campSearch}
                    onChange={(e) => setCampSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(
                    [
                      { id: 'TODOS', label: `Todos (${people.length})` },
                      { id: 'PAGO', label: `Quitados (${camp2027Stats.paidCount})` },
                      { id: 'PARCIAL', label: `Em Curso (${camp2027Stats.partialCount})` },
                      { id: 'PENDENTE', label: `Sem Parcela (${camp2027Stats.zeroCount})` }
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setCampStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                        campStatusFilter === st.id
                          ? 'bg-purple-600 text-white font-black'
                          : 'bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de Inscritos 2027 */}
              <div className="overflow-x-auto max-h-96 custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="pb-2.5 font-semibold">Participante</th>
                      <th className="pb-2.5 font-semibold">Faixa / Equipe</th>
                      <th className="pb-2.5 font-semibold">Progresso (6x)</th>
                      <th className="pb-2.5 font-semibold text-right">Pago / Total</th>
                      <th className="pb-2.5 font-semibold text-right">Restante</th>
                      <th className="pb-2.5 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {people
                      .filter((p) => {
                        if (
                          campSearch.trim() &&
                          !p.name.toLowerCase().includes(campSearch.toLowerCase())
                        ) {
                          return false;
                        }
                        if (campStatusFilter === 'PAGO') return p.amountPaid >= p.totalPrice;
                        if (campStatusFilter === 'PARCIAL')
                          return p.amountPaid > 0 && p.amountPaid < p.totalPrice;
                        if (campStatusFilter === 'PENDENTE') return (p.amountPaid || 0) === 0;
                        return true;
                      })
                      .map((person) => {
                        const remaining = Math.max(0, person.totalPrice - (person.amountPaid || 0));
                        const pct =
                          person.totalPrice > 0
                            ? Math.min(100, Math.round(((person.amountPaid || 0) / person.totalPrice) * 100))
                            : 0;
                        const isPaid = remaining === 0;
                        return (
                          <tr key={person.id} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 font-bold text-white pr-2">{person.name}</td>
                            <td className="py-2.5 text-slate-400 pr-2 whitespace-nowrap">
                              {person.ageGroup} • {TEAM_UI[person.teamId]?.name || 'Sem Equipe'}
                            </td>
                            <td className="py-2.5 pr-3 min-w-[130px]">
                              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isPaid ? 'bg-emerald-500' : 'bg-purple-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400">{pct}% quitado</span>
                            </td>
                            <td className="py-2.5 text-right font-black text-emerald-400 whitespace-nowrap pr-2">
                              R$ {formatBRL(person.amountPaid || 0)}{' '}
                              <span className="text-slate-400 font-normal">
                                / {formatBRL(person.totalPrice)}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-bold text-amber-400 whitespace-nowrap pr-2">
                              {isPaid ? (
                                <span className="text-emerald-400 font-black">QUITADO</span>
                              ) : (
                                `R$ ${formatBRL(remaining)}`
                              )}
                            </td>
                            <td className="py-2.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                {!isPaid && (
                                  <button
                                    onClick={() => {
                                      setPaymentModalPerson({ person, edition: '2027' });
                                      setPaymentAmountInput(
                                        String(Math.min(remaining, INSTALLMENT_VALUE))
                                      );
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px]"
                                  >
                                    + Parcela
                                  </button>
                                )}
                                <button
                                  onClick={() => handleSendCamperWhatsApp(person, '2027')}
                                  className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                                  title={
                                    isPaid
                                      ? 'Copiar Recibo de Quitação para WhatsApp'
                                      : 'Copiar Resumo de Parcelas + Chave PIX para WhatsApp'
                                  }
                                >
                                  <MessageCircle size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Remover ${person.name} da lista do Acampamento 2027?`
                                      )
                                    ) {
                                      deletePerson(person.id);
                                      showToast(`🗑️ ${person.name} removido.`);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
                                  title="Remover inscrito"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: ACAMPAMENTO PASSADO 2026 (acamp_2026)
           ========================================================================= */}
        {activeTab === 'acamp_2026' && (
          <div className="space-y-6">
            {/* Resumo Histórico Fev/2026 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-[#0e172a] to-[#0c1424] border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Memória & Fechamento Contábil • Fevereiro de 2026
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">
                    Gestão Financeira do Acampamento Passado (2026)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Todos os {camp2026Stats.totalPeople} participantes (R$ 432,00), custos de 2026 e vendas/comandas da cantina de Fev/2026 preservados
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      openTransactionModal('ENTRADA', {
                        eventId: 'acampamento-2026',
                        category: 'INSCRICAO',
                        date: '2026-02-15'
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black"
                  >
                    + Entrada 2026
                  </button>
                  <button
                    onClick={() =>
                      openTransactionModal('SAIDA', {
                        eventId: 'acampamento-2026',
                        category: 'ALUGUEL_CHACARA',
                        date: '2026-02-15'
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black"
                  >
                    - Saída 2026
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">
                    Inscrições 2026 ({camp2026Stats.totalPeople} pax)
                  </span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    R$ {formatBRL(camp2026Stats.collectedInscriptions)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Contratado: R$ {formatBRL(camp2026Stats.contracted)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-orange-400">
                    Faturamento Cantina 2026
                  </span>
                  <div className="text-2xl font-black text-orange-400 mt-1">
                    R$ {formatBRL(camp2026Stats.canteenRevenue2026)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Fiado em aberto: R$ {formatBRL(camp2026Stats.canteenPending2026)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-rose-400">
                    Custos Executados 2026
                  </span>
                  <div className="text-2xl font-black text-rose-400 mt-1">
                    R$ {formatBRL(camp2026Stats.totalCosts2026)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {camp2026Projections.length} centros de custo
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0d1424] border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-cyan-400">
                    Balanço Final 2026
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      camp2026Stats.netBalance2026 >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {camp2026Stats.netBalance2026 >= 0 ? '+' : ''}R${' '}
                    {formatBRL(camp2026Stats.netBalance2026)}
                  </div>
                  <span className="text-[11px] text-slate-400">Receitas - Despesas 2026</span>
                </div>
              </div>
            </div>

            {/* Custos 2026 + Participantes 2026 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Custos Executados 2026 (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-white">Custos do Acampamento 2026</h3>
                  <span className="text-xs font-black text-rose-400">
                    R$ {formatBRL(camp2026Stats.totalCosts2026)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  <input
                    type="text"
                    placeholder="Custo 2026..."
                    value={newCostLabel}
                    onChange={(e) => setNewCostLabel(e.target.value)}
                    className="p-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Valor R$"
                    value={newCostAmount}
                    onChange={(e) => setNewCostAmount(e.target.value)}
                    className="p-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold"
                  />
                  <button
                    onClick={() => handleAddCostProjection('2026')}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs"
                  >
                    + Custo 2026
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                  {camp2026Projections.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{c.label}</div>
                        <span className="text-[10px] text-slate-400">Fechamento 2026</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-rose-400">R$ {formatBRL(c.amount)}</span>
                        <button
                          onClick={() => deleteCamp2026Projection(c.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Remover item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista dos Participantes 2026 (7 cols) */}
              <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-base text-white">
                      Participantes Acampamento 2026 ({camp2026People.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dados sincronizados do banco de dados de Fev/2026 (R$ 432,00 por inscrição)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar participante 2026..."
                      value={newCamperName}
                      onChange={(e) => setNewCamperName(e.target.value)}
                      className="p-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                    />
                    <button
                      onClick={() => handleAddCamper('2026')}
                      className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-80 custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="pb-2 font-semibold">Nome</th>
                        <th className="pb-2 font-semibold">Equipe</th>
                        <th className="pb-2 font-semibold text-right">Pago / Total</th>
                        <th className="pb-2 font-semibold text-center">Status</th>
                        <th className="pb-2 font-semibold text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {camp2026People.map((p) => {
                        const isPaid = p.amountPaid >= p.totalPrice;
                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 font-bold text-white">{p.name}</td>
                            <td className="py-2.5 text-slate-400">
                              {TEAM_UI[p.teamId]?.name || p.teamId}
                            </td>
                            <td className="py-2.5 text-right font-black text-emerald-400">
                              R$ {formatBRL(p.amountPaid)} / {formatBRL(p.totalPrice)}
                            </td>
                            <td className="py-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPaid
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {isPaid ? 'PAGO' : 'PENDENTE'}
                              </span>
                            </td>
                            <td className="py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {!isPaid && (
                                  <button
                                    onClick={() => {
                                      setPaymentModalPerson({ person: p, edition: '2026' });
                                      setPaymentAmountInput(
                                        String(Math.max(0, p.totalPrice - p.amountPaid))
                                      );
                                    }}
                                    className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold"
                                  >
                                    Quitar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleSendCamperWhatsApp(p, '2026')}
                                  className="p-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                                  title="Copiar Recibo / Cobrança 2026 para WhatsApp"
                                >
                                  <MessageCircle size={13} />
                                </button>
                                <button
                                  onClick={() => deleteCamp2026Person(p.id)}
                                  className="p-1 text-slate-400 hover:text-rose-400"
                                  title="Remover do histórico 2026"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 5: GESTÃO DE EVENTOS & CAIXAS (eventos)
           ========================================================================= */}
        {activeTab === 'eventos' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white">
                  Gerenciador de Eventos & Caixas ({financialEvents.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Crie novos eventos, acompanhe receitas e despesas isoladas por evento ou exclua eventos encerrados. Todos os eventos ficam disponíveis automaticamente na Cantina e nos Lançamentos.
                </p>
              </div>
              <button
                onClick={() => openEventModal()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 shrink-0 shadow-lg cursor-pointer"
              >
                <Plus size={15} /> Criar Novo Evento
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {financialEvents.map((ev) => {
                const evTxs = transactions.filter((t) => matchesEventFilter(t, ev.id));
                const evIn = evTxs
                  .filter((t) => t.type === 'ENTRADA')
                  .reduce((a, b) => a + b.amount, 0);
                const evOut = evTxs
                  .filter((t) => t.type === 'SAIDA')
                  .reduce((a, b) => a + b.amount, 0);
                const evNet = evIn - evOut;

                return (
                  <div
                    key={ev.id}
                    className="p-5 rounded-3xl bg-[#0d1424] border border-white/10 flex flex-col justify-between gap-4 shadow-xl"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {ev.status || 'ATIVO'} • {ev.dateLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEventModal(ev)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                            title="Editar Evento"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
                            title="Excluir Evento"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-black text-white">{ev.name}</h3>
                      <p className="text-xs text-slate-400">
                        {ev.description || ev.badge}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Entradas</span>
                        <span className="font-black text-emerald-400">R$ {formatBRL(evIn)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Saídas</span>
                        <span className="font-black text-rose-400">R$ {formatBRL(evOut)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Saldo</span>
                        <span
                          className={`font-black ${
                            evNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          R$ {formatBRL(evNet)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() =>
                          openTransactionModal('ENTRADA', { eventId: ev.id })
                        }
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px]"
                      >
                        + Entrada
                      </button>
                      <button
                        onClick={() =>
                          openTransactionModal('SAIDA', { eventId: ev.id })
                        }
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px]"
                      >
                        - Saída
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEventFilter(ev.id);
                          handleTabChange('fluxo');
                        }}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-[11px]"
                      >
                        Extrato
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 6: ESTOQUE & CANTINA (estoque)
           ========================================================================= */}
        {activeTab === 'estoque' && (
          <div className="space-y-6">
            {/* KPIs do Estoque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-3xl bg-[#0d1424] border border-white/10">
                <span className="text-[10px] font-bold uppercase text-cyan-400">
                  Produtos Cadastrados
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  {stockMetrics.totalProducts} itens ({stockMetrics.totalUnits} un.)
                </div>
                <span className="text-[11px] text-slate-400">
                  {stockMetrics.lowStockItems.length} itens com estoque baixo
                </span>
              </div>

              <div className="p-4 rounded-3xl bg-[#0d1424] border border-white/10">
                <span className="text-[10px] font-bold uppercase text-rose-400">
                  Custo Imobilizado em Estoque
                </span>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  R$ {formatBRL(stockMetrics.totalCostValue)}
                </div>
                <span className="text-[11px] text-slate-400">Valor pago pelos produtos atuais</span>
              </div>

              <div className="p-4 rounded-3xl bg-[#0d1424] border border-white/10">
                <span className="text-[10px] font-bold uppercase text-emerald-400">
                  Potencial de Venda & Lucro
                </span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  R$ {formatBRL(stockMetrics.totalSellValue)}
                </div>
                <span className="text-[11px] text-slate-400">
                  Lucro líquido estimado: +R$ {formatBRL(stockMetrics.projectedProfit)}
                </span>
              </div>

              <div className="p-4 rounded-3xl bg-[#0d1424] border border-white/10">
                <span className="text-[10px] font-bold uppercase text-amber-400">
                  Comandas / Fiados a Receber
                </span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  R$ {formatBRL(stockMetrics.pendingReceivables)}
                </div>
                <span className="text-[11px] text-slate-400">
                  {stockMetrics.pendingSales.length} vendas pendentes na cantina
                </span>
              </div>
            </div>

            {/* Gerenciador Completo de Produtos do Estoque */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-black text-base text-white">
                    Controle de Estoque & Produtos da Cantina
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adicione novos produtos, ajuste quantidades (+1, +5, +10), lance compras no caixa ou exclua itens
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => openProductModal()}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus size={15} /> Adicionar Produto
                  </button>
                  <button
                    onClick={() => navigate('/cantina')}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <ShoppingBag size={14} /> Abrir PDV Cantina
                  </button>
                </div>
              </div>

              {/* Busca e Filtro de Categoria de Estoque */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Buscar produto no estoque por nome ou categoria..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {Array.from(
                    new Set([
                      'TODAS',
                      'Comida',
                      'Bebida',
                      'Doce',
                      'Gelado',
                      'Salgado',
                      ...products.map((p) => p.category).filter(Boolean)
                    ])
                  ).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setStockCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                        stockCategoryFilter === cat
                          ? 'bg-cyan-600 text-white font-black'
                          : 'bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat === 'TODAS' ? 'Todas Categorias' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de Produtos do Estoque */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="pb-3 font-semibold">Produto</th>
                      <th className="pb-3 font-semibold">Categoria</th>
                      <th className="pb-3 font-semibold text-right">Custo Un.</th>
                      <th className="pb-3 font-semibold text-right">Venda Un.</th>
                      <th className="pb-3 font-semibold text-center">Estoque Atual</th>
                      <th className="pb-3 font-semibold text-center">Ajuste Rápido</th>
                      <th className="pb-3 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products
                      .filter((p) => {
                        if (stockCategoryFilter !== 'TODAS') {
                          const prodCat = (p.category || '').toLowerCase();
                          const filterCat = stockCategoryFilter.toLowerCase();
                          if (
                            prodCat !== filterCat &&
                            !prodCat.startsWith(filterCat) &&
                            !filterCat.startsWith(prodCat)
                          ) {
                            return false;
                          }
                        }
                        if (
                          stockSearch.trim() &&
                          !p.name.toLowerCase().includes(stockSearch.toLowerCase()) &&
                          !(p.category || '').toLowerCase().includes(stockSearch.toLowerCase())
                        ) {
                          return false;
                        }
                        return true;
                      })
                      .map((prod) => {
                        const isLow = prod.stock <= (prod.minStock || 5);
                        const margin =
                          prod.sellPrice > 0
                            ? Math.round(((prod.sellPrice - prod.costPrice) / prod.sellPrice) * 100)
                            : 0;
                        return (
                          <tr key={prod.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 font-bold text-white pr-2">
                              <div>{prod.name}</div>
                              <span className="text-[10px] text-emerald-400 font-semibold">
                                Margem: {margin}%
                              </span>
                            </td>
                            <td className="py-3 text-slate-300 pr-2">
                              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">
                                {prod.category || 'Geral'}
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-300 pr-2 whitespace-nowrap">
                              R$ {formatBRL(prod.costPrice)}
                            </td>
                            <td className="py-3 text-right font-black text-emerald-400 pr-2 whitespace-nowrap">
                              R$ {formatBRL(prod.sellPrice)}
                            </td>
                            <td className="py-3 text-center pr-2 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-xl font-black text-xs ${
                                  prod.stock <= 0
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : isLow
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {prod.stock} un.
                              </span>
                            </td>
                            <td className="py-3 text-center whitespace-nowrap pr-2">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleAdjustStock(prod, -1, false)}
                                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                                  title="Reduzir 1 unidade"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(prod, 1, false)}
                                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 font-bold"
                                  title="Adicionar 1 unidade"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(prod, 5, false)}
                                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 font-bold"
                                  title="Adicionar 5 unidades"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(prod, 10, true)}
                                  className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px]"
                                  title="Repor +10 unidades e lançar despesa de compra no caixa"
                                >
                                  +10 (Comprar)
                                </button>
                              </div>
                            </td>
                            <td className="py-3 text-center whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => openProductModal(prod)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                                  title="Editar produto"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteStockProduct(prod)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                  title="Excluir produto do estoque"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Comandas / Fiados Pendentes para Baixa Direta */}
              {stockMetrics.pendingSales.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="font-black text-sm text-amber-400">
                    Comandas / Fiados Pendentes na Cantina ({stockMetrics.pendingSales.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stockMetrics.pendingSales.slice(0, 9).map((sale) => (
                      <div
                        key={sale.id}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">
                            {sale.personName || 'Cliente Avulso'}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(sale.date).toLocaleDateString('pt-BR')} •{' '}
                            {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-black text-amber-400">
                            R$ {formatBRL(sale.total)}
                          </span>
                          <button
                            onClick={() => handleSendDebtWhatsApp(sale)}
                            className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                            title="Copiar cobrança da comanda + Chave PIX para WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </button>
                          <button
                            onClick={() => handleSettlePendingSale(sale.id, 'Pix')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px]"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 7: BALANCETE & DRE MENSAL/GERAL (balancete)
           ========================================================================= */}
        {activeTab === 'balancete' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1424] border border-white/10 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  Documento Contábil Oficial
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Balancete & Demonstrativo de Resultados (DRE)
                </h3>
                <p className="text-xs text-slate-400">
                  Prestação de contas consolidada para assembleia, conselho e liderança pastoral
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all"
                >
                  <Download size={14} />
                  <span>Baixar Planilha CSV</span>
                </button>
                <button
                  onClick={handleShareBalancete}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg active:scale-95"
                >
                  <Share2 size={14} />
                  <span>Copiar Balancete p/ WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Receitas Detalhadas */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-emerald-400 text-sm">1. Receitas & Entradas</span>
                  <span className="font-black text-emerald-400 text-sm">
                    R$ {formatBRL(metrics.totalEntradas)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.1 Dízimos Eclesiásticos</span>
                    <span className="font-bold text-white">R$ {formatBRL(metrics.totalDizimos)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.2 Ofertas de Cultos</span>
                    <span className="font-bold text-white">R$ {formatBRL(metrics.totalOfertas)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.3 Faturamento Cantina / PDV</span>
                    <span className="font-bold text-white">R$ {formatBRL(metrics.totalCantina)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.4 Inscrições de Acampamento</span>
                    <span className="font-bold text-white">
                      R$ {formatBRL(metrics.totalInscricoes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1.5 Outras Entradas</span>
                    <span className="font-bold text-white">
                      R$ {formatBRL(metrics.totalOutrasEntradas)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saídas Detalhadas */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-rose-400 text-sm">2. Despesas & Saídas</span>
                  <span className="font-black text-rose-400 text-sm">
                    R$ {formatBRL(metrics.totalSaidas)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.1 Despesas Fixas (Templo, Água, Luz)</span>
                    <span className="font-bold text-white">
                      R$ {formatBRL(metrics.totalDespesasFixas)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.2 Aluguel Chácara & Estrutura Retiro</span>
                    <span className="font-bold text-white">
                      R$ {formatBRL(metrics.totalAluguelChacara)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.3 Ministérios (Louvor, Infantil, Jovens)</span>
                    <span className="font-bold text-white">
                      R$ {formatBRL(metrics.totalMinisterios)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.4 Manutenção & Equipamentos</span>
                    <span className="font-bold text-white">
                      R$ {formatBRL(metrics.totalManutencao)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2.5 Ação Social & Outras Saídas</span>
                    <span className="font-bold text-white">
                      R$ {formatBRL(metrics.totalAcaoSocial + metrics.totalOutrasSaidas)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-purple-300">
                  Resultado Operacional do Período:
                </span>
                <div
                  className={`text-2xl font-black ${
                    metrics.saldoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {metrics.saldoLiquido >= 0 ? '+' : ''}R$ {formatBRL(metrics.saldoLiquido)}
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs font-bold text-slate-400">
                  Saldo Acumulado Geral em Caixa:
                </span>
                <div className="text-2xl font-black text-white">
                  R$ {formatBRL(metrics.saldoGeralAcumulado)}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: LANÇAMENTO / EDIÇÃO DE ENTRADA OU SAÍDA
         ========================================================================= */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                {modalType === 'ENTRADA' ? (
                  <>
                    <Plus size={18} className="text-emerald-400" />
                    <span>{editingTxId ? 'Editar Entrada' : 'Lançar Nova Entrada'}</span>
                  </>
                ) : (
                  <>
                    <Minus size={18} className="text-rose-400" />
                    <span>{editingTxId ? 'Editar Saída' : 'Lançar Nova Saída'}</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setModalType(null);
                  setEditingTxId(null);
                }}
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
                      ? 'Ex: Dízimo, Oferta Culto, Parcela Acampamento...'
                      : 'Ex: Compra Leite, Aluguel Chácara, Conta de Luz...'
                  }
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
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
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as TransactionCategory })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white text-xs"
                  >
                    {modalType === 'ENTRADA' ? (
                      <>
                        <option value="DIZIMO">Dízimo</option>
                        <option value="OFERTA">Oferta</option>
                        <option value="INSCRICAO">Inscrição Acampamento</option>
                        <option value="CANTINA">Cantina & Eventos</option>
                        <option value="OUTROS">Outras Entradas</option>
                      </>
                    ) : (
                      <>
                        <option value="DESPESA_FIXA">Despesa Fixa (Templo)</option>
                        <option value="ALUGUEL_CHACARA">Aluguel Chácara / Retiro</option>
                        <option value="CANTINA">Compra de Estoque Cantina</option>
                        <option value="MINISTERIO">Ministérios</option>
                        <option value="MANUTENCAO">Manutenção & Som</option>
                        <option value="ACAO_SOCIAL">Ação Social</option>
                        <option value="OUTROS">Outras Saídas</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Evento vinculado */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Evento / Caixa Vinculado
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white text-xs font-bold"
                >
                  {financialEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Se for SAIDA + CANTINA: permitir repor estoque automaticamente */}
              {modalType === 'SAIDA' && formData.category === 'CANTINA' && !editingTxId && (
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                  <span className="text-[11px] font-black text-cyan-300 block">
                    Repor Produto do Estoque Automaticamente (Opcional)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={formData.stockProductId}
                      onChange={(e) =>
                        setFormData({ ...formData, stockProductId: e.target.value })
                      }
                      className="col-span-2 p-2 rounded-xl bg-[#0e1626] border border-white/15 text-white text-xs"
                    >
                      <option value="">Não alterar estoque</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Atual: {p.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="+ Qtd"
                      value={formData.stockQty}
                      onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                      className="p-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Forma de Pagto</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white text-xs"
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
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              {/* Vínculo de Pessoa / Membro */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Vincular a Membro / Participante (Opcional)
                </label>
                {formData.personName ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs">
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
                    placeholder="Buscar membro ou acampante..."
                    value={personSearch}
                    onFocus={() => setIsPersonDropdownOpen(true)}
                    onChange={(e) => {
                      setPersonSearch(e.target.value);
                      setIsPersonDropdownOpen(true);
                    }}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                )}

                {isPersonDropdownOpen && !formData.personName && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-36 overflow-y-auto rounded-xl bg-[#0e172a] border border-white/15 shadow-2xl p-1 z-40">
                    {filteredPeopleAutocomplete.map((p) => (
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
                {isSaving
                  ? 'Salvando...'
                  : editingTxId
                    ? 'Salvar Alterações'
                    : 'Confirmar e Lançar no Livro Caixa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CRIAR / EDITAR EVENTO FINANCEIRO
         ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-base">
                {editingEventId ? 'Editar Evento Financeiro' : 'Criar Novo Evento / Caixa'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Nome do Evento</label>
                <input
                  type="text"
                  placeholder="Ex: Vigília de Jovens, Congresso Louvor, Acampamento 2028..."
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Subtítulo / Selo</label>
                  <input
                    type="text"
                    placeholder="Ex: Evento Especial"
                    value={eventForm.badge}
                    onChange={(e) => setEventForm({ ...eventForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Data / Período</label>
                  <input
                    type="text"
                    placeholder="Ex: Julho/2027"
                    value={eventForm.dateLabel}
                    onChange={(e) => setEventForm({ ...eventForm, dateLabel: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Orçamento Custos (R$)</label>
                  <input
                    type="number"
                    value={eventForm.targetBudget}
                    onChange={(e) => setEventForm({ ...eventForm, targetBudget: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        status: e.target.value as 'ATIVO' | 'PLANEJADO' | 'ENCERRADO'
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white font-bold"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="PLANEJADO">PLANEJADO</option>
                    <option value="ENCERRADO">ENCERRADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Objetivo ou observações do evento..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <button
                onClick={handleSaveEvent}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg"
              >
                {editingEventId ? 'Salvar Alterações do Evento' : 'Criar Evento e Integrar ao Caixa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADICIONAR / EDITAR PRODUTO DO ESTOQUE
         ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-base">
                {editingProduct ? `Editar Produto: ${editingProduct.name}` : 'Novo Produto no Estoque'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-400 mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    placeholder="Ex: Refrigerante Lata, Açaí, Pastel..."
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Categoria</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white font-bold"
                  >
                    <option value="Comida">Comida</option>
                    <option value="Bebida">Bebida</option>
                    <option value="Doce">Doce</option>
                    <option value="Gelado">Gelado</option>
                    <option value="Salgado">Salgado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2.50"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="6.00"
                    value={productForm.sellPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Quantidade em Estoque</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Alerta Estoque Mínimo</label>
                  <input
                    type="number"
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold"
                  />
                </div>
              </div>

              {!editingProduct && (
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.launchPurchaseExpense}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        launchPurchaseExpense: e.target.checked
                      })
                    }
                    className="accent-cyan-500"
                  />
                  <span className="text-slate-300 font-semibold">
                    Lançar custo desta compra inicial automaticamente nas Saídas do Caixa
                  </span>
                </label>
              )}

              <button
                onClick={handleSaveProduct}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-lg"
              >
                {editingProduct ? 'Salvar Alterações do Produto' : 'Cadastrar Produto no Estoque'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: LANÇAR PARCELA / PAGAMENTO DE ACAMPANTE (2027 OU 2026)
         ========================================================================= */}
      {paymentModalPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">
                  Acampamento {paymentModalPerson.edition}
                </span>
                <h3 className="font-black text-base">{paymentModalPerson.person.name}</h3>
              </div>
              <button
                onClick={() => setPaymentModalPerson(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between">
                <span className="text-slate-400">Já Pago / Total:</span>
                <span className="font-black text-white">
                  R$ {formatBRL(paymentModalPerson.person.amountPaid || 0)} / R${' '}
                  {formatBRL(paymentModalPerson.person.totalPrice)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmountInput(String(INSTALLMENT_VALUE))}
                  className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold"
                >
                  1ª Parc. (R$ 97)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentAmountInput(
                      String(
                        Math.max(
                          0,
                          paymentModalPerson.person.totalPrice -
                            (paymentModalPerson.person.amountPaid || 0)
                        )
                      )
                    )
                  }
                  className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold"
                >
                  Quitar Restante
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Método</label>
                  <select
                    value={paymentMethodInput}
                    onChange={(e) => setPaymentMethodInput(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white font-bold"
                  >
                    <option value="Pix">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Débito">Débito</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordInCashFlow}
                  onChange={(e) => setRecordInCashFlow(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className="text-slate-300 font-semibold">
                  Registrar também como Entrada no Livro Caixa
                </span>
              </label>

              <button
                onClick={handleConfirmCamperPayment}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg"
              >
                Confirmar Recebimento de Inscrição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
