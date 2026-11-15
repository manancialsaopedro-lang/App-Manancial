import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  UserPlus,
  Copy,
  Check,
  CreditCard,
  QrCode,
  Users,
  TrendingUp,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  X,
  PieChart,
  Calendar,
  Layers,
  Table,
  LayoutGrid,
  Receipt,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { useAppStore } from '../../store';
import {
  CAMP_2027_CONFIG,
  CAMP_TOTAL_PRICE,
  CAMP_CHILD_PRICE,
  CAMP_PAYMENT_DUE_DAY,
  INSTALLMENT_VALUE,
  INSTALLMENT_COUNT,
  TEAM_UI,
  OFFICIAL_CAMP_2027_PEOPLE
} from '../../constants';
import { Person, PaymentMethod, TeamId, AgeGroup } from '../../types';
import { updatePerson as apiUpdatePerson, createPerson as apiCreatePerson } from '../../lib/api/people';
import { createTransaction } from '../../lib/api/transactions';
import { CampPaymentsDataTable } from './components/CampPaymentsDataTable';
import { CampCostsBalanceSection } from './components/CampCostsBalanceSection';

export const CampPastorPaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    people,
    updatePerson,
    addPerson,
    setPeople,
    resetToOfficialList,
    expenseProjections,
    transactions,
    setTransactions,
    isDarkMode,
    toggleTheme
  } = useAppStore();

  // Abas Principais
  const [activeTab, setActiveTab] = useState<'TABELA' | 'CUSTOS' | 'REGUA'>('TABELA');

  // Modo de Exibição na aba de Inscrições: Cards no mobile, Tabela no desktop
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'CARDS' : 'TABLE'
  );
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);

  // Estados locais de filtro (para visualização em Cards)
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'QUITADO' | 'PARCIAL' | 'PENDENTE'>('TODOS');
  const [filterTeam, setFilterTeam] = useState<string>('TODAS');
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [sortBy, setSortBy] = useState<'MAIOR_PENDENCIA' | 'MAIOR_PAGO' | 'NOME' | 'RECENTE'>('MAIOR_PENDENCIA');

  // Modal de Lançamento de Pagamento
  const [selectedPersonForPayment, setSelectedPersonForPayment] = useState<Person | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [paymentMethodSelected, setPaymentMethodSelected] = useState<PaymentMethod>('Pix');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Modal de Novo Inscrito
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonAgeGroup, setNewPersonAgeGroup] = useState<AgeGroup>('Adulto');
  const [newPersonType, setNewPersonType] = useState<'Membro' | 'Visitante'>('Membro');
  const [newPersonTeam, setNewPersonTeam] = useState<TeamId>('none');
  const [newPersonInitialPay, setNewPersonInitialPay] = useState<string>('0');
  const [newPersonPayMethod, setNewPersonPayMethod] = useState<PaymentMethod>('Pix');

  // Feedback Toast
  const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastState({ message: msg, type });
    setTimeout(() => setToastState(null), 4000);
  };

  // Se por acaso a lista de pessoas estiver vazia no storage, carrega a lista oficial
  useEffect(() => {
    if (!people || people.length === 0) {
      setIsLoadingPeople(true);
      resetToOfficialList();
      setIsLoadingPeople(false);
    }
  }, [people, resetToOfficialList]);

  // --- CÁLCULOS EXECUTIVOS PARA O PASTOR ---
  const stats = useMemo(() => {
    const totalPeople = people.length;
    const totalExpected = people.reduce((acc, p) => acc + (p.totalPrice || (p.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE)), 0);
    const totalCollected = people.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
    const totalPending = Math.max(0, totalExpected - totalCollected);
    const collectionPercentage = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    let fullyPaidCount = 0;
    let partialPaidCount = 0;
    let zeroPaidCount = 0;

    const installmentCounts: number[] = [0, 0, 0, 0, 0, 0]; // 1x, 2x, 3x, 4x, 5x, 6x

    people.forEach((p) => {
      const price = p.totalPrice || (p.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE);
      const paid = p.amountPaid || 0;

      if (paid >= price) {
        fullyPaidCount++;
      } else if (paid > 0) {
        partialPaidCount++;
      } else {
        zeroPaidCount++;
      }

      // Quantas parcelas cheias de R$ 97 foram cobertas
      const parcelsPaid = Math.min(INSTALLMENT_COUNT, Math.floor(paid / INSTALLMENT_VALUE));
      for (let i = 0; i < parcelsPaid; i++) {
        installmentCounts[i]++;
      }
    });

    const totalCustosOrcados = expenseProjections.reduce((acc, item) => acc + (item.amount || 0), 0);
    const saldoRetiro = totalCollected - totalCustosOrcados;

    return {
      totalPeople,
      totalExpected,
      totalCollected,
      totalPending,
      collectionPercentage,
      fullyPaidCount,
      partialPaidCount,
      zeroPaidCount,
      installmentCounts,
      totalCustosOrcados,
      saldoRetiro
    };
  }, [people, expenseProjections]);

  // --- LISTA FILTRADA E ORDENADA (Para visualização em Cards) ---
  const filteredPeople = useMemo(() => {
    return people
      .filter((p) => {
        const targetPrice = p.totalPrice || (p.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE);
        const paid = p.amountPaid || 0;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());

        let matchesStatus = true;
        if (filterStatus === 'QUITADO') {
          matchesStatus = paid >= targetPrice;
        } else if (filterStatus === 'PARCIAL') {
          matchesStatus = paid > 0 && paid < targetPrice;
        } else if (filterStatus === 'PENDENTE') {
          matchesStatus = paid === 0;
        }

        let matchesTeam = true;
        if (filterTeam !== 'TODAS') {
          matchesTeam = p.teamId === filterTeam;
        }

        let matchesType = true;
        if (filterType !== 'TODOS') {
          matchesType = p.personType === filterType;
        }

        return matchesSearch && matchesStatus && matchesTeam && matchesType;
      })
      .sort((a, b) => {
        const priceA = a.totalPrice || (a.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE);
        const priceB = b.totalPrice || (b.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE);
        const pendingA = priceA - (a.amountPaid || 0);
        const pendingB = priceB - (b.amountPaid || 0);

        if (sortBy === 'MAIOR_PENDENCIA') return pendingB - pendingA;
        if (sortBy === 'MAIOR_PAGO') return (b.amountPaid || 0) - (a.amountPaid || 0);
        if (sortBy === 'NOME') return a.name.localeCompare(b.name);
        if (sortBy === 'RECENTE') {
          const dateA = a.lastPaymentDate ? new Date(a.lastPaymentDate).getTime() : 0;
          const dateB = b.lastPaymentDate ? new Date(b.lastPaymentDate).getTime() : 0;
          return dateB - dateA;
        }
        return 0;
      });
  }, [people, search, filterStatus, filterTeam, filterType, sortBy]);

  // --- AÇÃO: LANÇAR PAGAMENTO ---
  const handleOpenPaymentModal = (person: Person, suggestedInstallment?: number) => {
    setPaymentFormError(null);
    setSelectedPersonForPayment(person);
    const targetPrice = person.totalPrice || (person.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE);
    const currentPaid = person.amountPaid || 0;
    const remaining = Math.max(0, targetPrice - currentPaid);

    if (suggestedInstallment !== undefined) {
      const targetAmount = suggestedInstallment * INSTALLMENT_VALUE;
      const diff = Math.max(0, targetAmount - currentPaid);
      setPaymentAmountInput((diff > 0 ? diff : INSTALLMENT_VALUE).toString());
    } else {
      // Sugere o valor de 1 parcela (97) ou o restante
      const defaultSuggestion = Math.min(INSTALLMENT_VALUE, remaining > 0 ? remaining : INSTALLMENT_VALUE);
      setPaymentAmountInput(defaultSuggestion.toString());
    }

    setPaymentMethodSelected(person.paymentMethod || 'Pix');
  };

  const handleSavePayment = async () => {
    if (!selectedPersonForPayment) return;
    setPaymentFormError(null);
    const additionalAmount = parseFloat(paymentAmountInput);
    if (isNaN(additionalAmount) || additionalAmount <= 0) {
      setPaymentFormError('Por favor, informe um valor de pagamento válido.');
      return;
    }

    setIsSubmittingPayment(true);
    const targetPrice = selectedPersonForPayment.totalPrice || (selectedPersonForPayment.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE);
    const currentPaid = selectedPersonForPayment.amountPaid || 0;
    const newPaid = currentPaid + additionalAmount;
    const newStatus = newPaid >= targetPrice ? 'PAGO' : 'PENDENTE';
    const nowIso = new Date().toISOString();

    const currentHistory = selectedPersonForPayment.paymentHistory || [];
    const updatedHistory = [...currentHistory, additionalAmount];

    const updates: Partial<Person> = {
      amountPaid: newPaid,
      totalPrice: targetPrice,
      paymentStatus: newStatus,
      paymentMethod: paymentMethodSelected,
      lastPaymentDate: nowIso,
      paymentHistory: updatedHistory
    };

    try {
      // Persiste primeiro no Supabase antes de alterar o estado e o caixa
      await apiUpdatePerson(selectedPersonForPayment.id, updates);

      updatePerson(selectedPersonForPayment.id, updates);

      try {
        const createdTx = await createTransaction({
          description: `Inscrição Acampamento: ${selectedPersonForPayment.name} (+R$ ${additionalAmount.toFixed(2)})`,
          amount: additionalAmount,
          type: 'ENTRADA',
          category: 'INSCRICAO',
          date: nowIso,
          paymentMethod: paymentMethodSelected,
          personId: selectedPersonForPayment.id,
          personName: selectedPersonForPayment.name
        });
        setTransactions([createdTx, ...transactions.filter((t) => t.id !== createdTx.id)]);
        showToast(`Pagamento de R$ ${additionalAmount.toFixed(2)} registrado para ${selectedPersonForPayment.name}!`, 'success');
      } catch (txErr) {
        console.error('Pagamento salvo na ficha, mas erro ao registrar transação no Supabase:', txErr);
        showToast(
          `Pagamento de R$ ${additionalAmount.toFixed(2)} salvo na ficha de ${selectedPersonForPayment.name}, mas falhou ao registrar entrada no caixa.`,
          'error'
        );
      }

      setSelectedPersonForPayment(null);
    } catch (err) {
      console.error('Erro ao salvar pagamento no Supabase:', err);
      const message = err instanceof Error ? err.message : 'Falha de conexão ou permissão.';
      setPaymentFormError(`Não foi possível salvar no servidor: ${message}`);
      showToast('Erro ao salvar pagamento no Supabase. Nenhuma alteração foi confirmada.', 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // --- AÇÃO: TOGGLE RÁPIDO DE PARCELA ---
  const handleQuickToggleInstallment = (person: Person, installmentNumber: number) => {
    handleOpenPaymentModal(person, installmentNumber);
  };

  // --- AÇÃO: CRIAR NOVO PARTICIPANTE ---
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const initialPaid = parseFloat(newPersonInitialPay) || 0;
    const targetPrice = newPersonAgeGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE;
    const isFullyPaid = initialPaid >= targetPrice;

    const newPersonData: Omit<Person, 'id'> = {
      name: newPersonName.trim(),
      amountPaid: initialPaid,
      totalPrice: targetPrice,
      ageGroup: newPersonAgeGroup,
      personType: newPersonType,
      teamId: newPersonTeam,
      paymentStatus: isFullyPaid ? 'PAGO' : 'PENDENTE',
      paymentMethod: initialPaid > 0 ? newPersonPayMethod : undefined,
      lastPaymentDate: initialPaid > 0 ? new Date().toISOString() : undefined,
      paymentHistory: initialPaid > 0 ? [initialPaid] : []
    };

    setCreateFormError(null);
    try {
      const created = await apiCreatePerson(newPersonData);
      setPeople([created, ...people]);
      showToast(`Inscrito "${newPersonName}" adicionado com sucesso!`, 'success');
      setNewPersonName('');
      setNewPersonInitialPay('0');
      setIsAddPersonModalOpen(false);
    } catch (err) {
      console.error('Erro ao criar inscrito no Supabase:', err);
      const message = err instanceof Error ? err.message : 'Falha de conexão ou permissão.';
      setCreateFormError(`Não foi possível cadastrar no servidor: ${message}`);
      showToast('Erro ao cadastrar inscrito no Supabase.', 'error');
    }
  };

  // --- AÇÃO: MENSAGEM DO WHATSAPP PASTORAL ---
  const handleSendPastorMessage = (person: Person) => {
    const targetPrice = person.totalPrice || (person.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE);
    const paid = person.amountPaid || 0;
    const remaining = Math.max(0, targetPrice - paid);
    const parcelsPaid = Math.min(INSTALLMENT_COUNT, Math.floor(paid / INSTALLMENT_VALUE));

    let message = '';
    if (paid >= targetPrice) {
      message = `Graça e paz, ${person.name}! 🌿
Aqui é da liderança do *Acampamento Manancial 2027*.
Passando para te parabenizar e confirmar que a sua inscrição para o Retiro (05 a 09 de Fevereiro em São Pedro - SP) está *100% QUITADA*! 🕊️
Tema: Salmos 25:14 ("O segredo do Senhor é para aqueles que o temem...").
Estamos em oração para que sejam dias inesquecíveis! Deus te abençoe!`;
    } else {
      message = `Graça e paz, ${person.name}! 🌿
Aqui é da liderança do *Acampamento Manancial 2027* (05 a 09 de Fevereiro em São Pedro - SP).
Tema: Salmos 25:14 ("O segredo do Senhor é para aqueles que o temem...").

Acompanhamento da sua inscrição:
• Investimento total: R$ ${targetPrice.toFixed(2)} ${person.ageGroup === 'Criança' ? '(Valor Criança)' : ''}
• Valor já pago: R$ ${paid.toFixed(2)} (${parcelsPaid}/${INSTALLMENT_COUNT} parcelas de R$ ${INSTALLMENT_VALUE.toFixed(2)})
• Saldo restante: R$ ${remaining.toFixed(2)}
• Data de vencimento das parcelas: *Todo dia 20 de cada mês*

Chave PIX Oficial: ${CAMP_2027_CONFIG.pixKey}
Qualquer dúvida ou ajuste, estamos à disposição. Deus abençoe você e sua família!`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // --- AÇÃO: COPIAR RELATÓRIO EXECUTIVO ---
  const handleCopyPastorReport = () => {
    const text = `📊 *RELATÓRIO FINANCEIRO - ACAMPAMENTO MANANCIAL 2027*
📅 05 a 09 de Fevereiro de 2027 • São Pedro - SP
Tema: Salmos 25:14 ("O segredo do Senhor é para aqueles que o temem...")

📌 *REGRAS DE INVESTIMENTO*
• Valor Adulto: R$ 582,00 (em até 6x de R$ 97,00)
• Criança (5 a 10 anos): R$ 300,00
• Vencimento das parcelas: Todo dia 20 de cada mês

👥 *INSCRITOS & PARTICIPAÇÃO*
• Total de Inscritos: ${stats.totalPeople} pessoas
• 100% Quitados: ${stats.fullyPaidCount} participantes (${((stats.fullyPaidCount / (stats.totalPeople || 1)) * 100).toFixed(0)}%)
• Em Aberto / Parciais: ${stats.partialPaidCount} participantes
• Pendente (R$ 0): ${stats.zeroPaidCount} participantes

💰 *ARRECADAÇÃO vs CUSTOS DO RETIRO*
• Total Já Arrecadado: R$ ${stats.totalCollected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${stats.collectionPercentage.toFixed(1)}% da meta de inscrições)
• Saldo Restante a Receber: R$ ${stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Custos Orçados do Retiro: R$ ${stats.totalCustosOrcados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Saldo do Retiro (Arrecadado - Custos): R$ ${stats.saldoRetiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
_Igreja Manancial - Gestão Eclesiástica & Retiros_`;

    navigator.clipboard.writeText(text);
    showToast('Relatório executivo copiado para a área de transferência!');
  };

  const themeColors = {
    bg: isDarkMode ? 'bg-[#090d16]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200/80',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className={`min-h-[100dvh] transition-colors duration-500 pb-32 ${themeColors.bg}`}>
      
      {/* TOAST FEEDBACK */}
      {toastState && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs md:text-sm animate-in fade-in slide-in-from-top-4 max-w-[90vw] ${
          toastState.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toastState.type === 'error' ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
          <span>{toastState.message}</span>
        </div>
      )}

      {isLoadingPeople && (
        <div className="max-w-7xl mx-auto px-4 pt-3">
          <div className="px-4 py-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold">
            Carregando lista de inscritos...
          </div>
        </div>
      )}

      {/* HEADER FIXO SUPERIOR */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between ${
        isDarkMode ? 'bg-[#090d16]/85 border-slate-800' : 'bg-white/85 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/acampamento')}
            className={`p-2.5 rounded-2xl transition-all active:scale-95 border ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Voltar ao Portal do Acampamento"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`text-sm md:text-base font-black tracking-tight ${themeColors.textMain}`}>
                Gestão de Pagamentos & Custos
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Acamp 2027
              </span>
            </div>
            <p className={`text-[11px] font-medium hidden sm:block ${themeColors.textSec}`}>
              Tabela completa de inscrições e controle do balanço de custos do retiro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Sincronizar Lista Oficial */}
          <button
            onClick={() => {
              if (window.confirm('Deseja recarregar a lista oficial de 44 inscritos com os valores fornecidos pela liderança?')) {
                resetToOfficialList();
                showToast('Lista oficial 2027 recarregada com sucesso!');
              }
            }}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Recarregar Lista Oficial 2027"
          >
            <RefreshCw size={15} />
            <span className="hidden md:inline">Restaurar Oficial</span>
          </button>

          {/* Alternar Tema */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* BANNER OFICIAL DE REGRAS E VENCIMENTO */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white p-4 rounded-3xl border border-purple-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <CalendarDays size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs md:text-sm tracking-wide">
                  VALOR: R$ 582,00 (6x de R$ 97,00) • CRIANÇAS (5 a 10 anos): R$ 300,00
                </span>
              </div>
              <p className="text-[11px] text-purple-200 font-medium">
                📅 Vencimento oficial das parcelas: <strong>Todo dia 20 de cada mês</strong> • Chave PIX: {CAMP_2027_CONFIG.pixKey}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleCopyPastorReport}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black inline-flex items-center gap-1.5 transition-all"
            >
              <Share2 size={14} />
              <span>Copiar Relatório</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        
        {/* 4 CARDS DE INDICADORES RÁPIDOS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Arrecadado */}
          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Arrecadado
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
              R$ {stats.totalCollected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {stats.collectionPercentage.toFixed(1)}% da receita esperada
            </span>
          </div>

          {/* Card 2: Saldo Pendente */}
          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                A Receber
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-lg md:text-xl font-black text-amber-600 dark:text-amber-400">
              R$ {stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Parcelas em aberto</span>
          </div>

          {/* Card 3: 100% Quitados */}
          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                100% Quitados
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
              {stats.fullyPaidCount} <span className="text-xs font-normal text-slate-400">/ {stats.totalPeople} pessoas</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{stats.partialPaidCount} parciais pagando</span>
          </div>

          {/* Card 4: Custos vs Arrecadação */}
          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Custos do Retiro
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Receipt size={16} />
              </div>
            </div>
            <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
              R$ {stats.totalCustosOrcados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {stats.saldoRetiro >= 0 ? 'Custos 100% cobertos' : `Faltam R$ ${Math.abs(stats.saldoRetiro).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* ABAS PRINCIPAIS DE NAVEGAÇÃO DA SEÇÃO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          
          {/* Seletor de Abas */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('TABELA')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'TABELA'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table size={15} />
              <span>Inscrições & Pagamentos</span>
            </button>

            <button
              onClick={() => setActiveTab('CUSTOS')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'CUSTOS'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt size={15} />
              <span>Balanço de Custos & Retiro</span>
            </button>

            <button
              onClick={() => setActiveTab('REGUA')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'REGUA'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers size={15} />
              <span>Régua de Parcelas (6x)</span>
            </button>
          </div>

          {/* Alternador de Modo de Exibição (Apenas na Aba de Tabela) */}
          {activeTab === 'TABELA' && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-1 hidden sm:inline">Modo:</span>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`p-2 rounded-xl border transition-all ${
                  viewMode === 'TABLE'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                }`}
                title="Modo Tabela Completa"
              >
                <Table size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`p-2 rounded-xl border transition-all ${
                  viewMode === 'CARDS'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                }`}
                title="Modo Cards Responsivos"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}

        </div>

        {/* CONTEÚDO DA ABA 1: TABELA / CARDS DE INSCRIÇÕES */}
        {activeTab === 'TABELA' && (
          viewMode === 'TABLE' ? (
            <CampPaymentsDataTable
              people={people}
              isDarkMode={isDarkMode}
              onOpenPaymentModal={handleOpenPaymentModal}
              onSendPastorMessage={handleSendPastorMessage}
              onOpenAddPersonModal={() => setIsAddPersonModalOpen(true)}
              onCopyReport={handleCopyPastorReport}
              onQuickToggleInstallment={handleQuickToggleInstallment}
            />
          ) : (
            /* VISUALIZAÇÃO EM CARDS (Otimizada para Mobile) */
            <div className="space-y-4">
              
              {/* Barra de Filtros dos Cards */}
              <div className={`p-4 rounded-3xl border shadow-sm space-y-3 ${themeColors.card}`}>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar participante por nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="QUITADO">100% Quitado</option>
                    <option value="PARCIAL">Parcial (X/6)</option>
                    <option value="PENDENTE">Pendente (R$ 0)</option>
                  </select>

                  <select
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="TODAS">Todas as Tribos</option>
                    <option value="alianca">Aliança</option>
                    <option value="segredo">Segredo</option>
                    <option value="caminho">Caminho</option>
                    <option value="none">Sem Equipe</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="MAIOR_PENDENCIA">Maior Pendência</option>
                    <option value="MAIOR_PAGO">Maior Valor Pago</option>
                    <option value="NOME">Nome (A-Z)</option>
                    <option value="RECENTE">Pagamento Recente</option>
                  </select>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="space-y-3">
                {filteredPeople.length === 0 ? (
                  <div className={`p-8 rounded-3xl border text-center space-y-3 ${themeColors.card}`}>
                    <p className={`text-sm font-black ${themeColors.textMain}`}>
                      Nenhum acampante encontrado com estes filtros.
                    </p>
                    <p className={`text-xs ${themeColors.textSec}`}>
                      Ajuste a busca, tribo ou status de pagamento para visualizar os registros.
                    </p>
                    {(search || filterTeam !== 'TODAS' || filterStatus !== 'TODOS') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('');
                          setFilterTeam('TODAS');
                          setFilterStatus('TODOS');
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-wider hover:bg-purple-500 transition-colors"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                ) : filteredPeople.map((person) => {
                  const targetPrice = person.totalPrice || (person.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE);
                  const paid = person.amountPaid || 0;
                  const remaining = Math.max(0, targetPrice - paid);
                  const isFullyPaid = paid >= targetPrice;
                  const parcelsCompleted = Math.min(INSTALLMENT_COUNT, Math.floor(paid / INSTALLMENT_VALUE));
                  const teamInfo = person.teamId && person.teamId !== 'none' && person.teamId !== 'org' ? TEAM_UI[person.teamId] : null;

                  return (
                    <div
                      key={person.id}
                      className={`p-4 md:p-5 rounded-3xl border shadow-sm space-y-3 ${themeColors.card}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${
                            teamInfo ? `${teamInfo.color} ${teamInfo.text}` : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {person.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-sm md:text-base font-black truncate ${themeColors.textMain}`}>
                              {person.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span>{person.personType || 'Membro'}</span>
                              <span>•</span>
                              <span>{person.ageGroup || 'Adulto'}</span>
                              {teamInfo && (
                                <>
                                  <span>•</span>
                                  <span className="font-bold text-slate-600 dark:text-slate-300">{teamInfo.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isFullyPaid ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={11} /> Quitado
                          </span>
                        ) : paid > 0 ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shrink-0">
                            {parcelsCompleted}/6 Pago
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                            Pendente (R$ 0)
                          </span>
                        )}
                      </div>

                      {/* Barra de Parcelas Interativas (6 Bloquinhos) */}
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Pago: R$ {paid.toFixed(2)}
                          </span>
                          <span className={remaining > 0 ? 'text-amber-500' : 'text-slate-400'}>
                            {remaining > 0 ? `Resta: R$ ${remaining.toFixed(2)}` : 'Concluído'}
                          </span>
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                          {[1, 2, 3, 4, 5, 6].map((idx) => {
                            const isSlotPaid = paid >= idx * INSTALLMENT_VALUE;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleOpenPaymentModal(person, idx)}
                                title={`${idx}ª parcela: R$ ${INSTALLMENT_VALUE}`}
                                className={`h-6 rounded-lg text-[10px] font-black transition-all flex items-center justify-center ${
                                  isSlotPaid
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-purple-500/20'
                                }`}
                              >
                                {idx}x
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleSendPastorMessage(person)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPaymentModal(person)}
                          className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <DollarSign size={13} />
                          <span>Lançar Pagamento</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )
        )}

        {/* CONTEÚDO DA ABA 2: CUSTOS & BALANÇO DO RETIRO */}
        {activeTab === 'CUSTOS' && (
          <CampCostsBalanceSection
            people={people}
            isDarkMode={isDarkMode}
            showToast={showToast}
          />
        )}

        {/* CONTEÚDO DA ABA 3: RÉGUA DE PARCELAS */}
        {activeTab === 'REGUA' && (
          <div className="space-y-4">
            <div className={`p-5 rounded-3xl border shadow-sm ${themeColors.card}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className={`text-sm font-black ${themeColors.textMain}`}>
                    Régua de Parcelamento (Até 6x de R$ {INSTALLMENT_VALUE.toFixed(2)})
                  </h3>
                  <p className={`text-xs ${themeColors.textSec}`}>
                    Volume de participantes que já quitaram cada uma das 6 parcelas
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  Total R$ {CAMP_TOTAL_PRICE.toFixed(2)} por adulto • R$ {CAMP_CHILD_PRICE.toFixed(2)} por criança
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const count = stats.installmentCounts[num - 1] || 0;
                  const pct = stats.totalPeople > 0 ? (count / stats.totalPeople) * 100 : 0;
                  return (
                    <div
                      key={num}
                      className={`p-3.5 rounded-2xl border ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {num}ª Parcela
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          R$ {(num * INSTALLMENT_VALUE).toFixed(0)}
                        </span>
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {count} <span className="text-xs font-normal text-slate-400">pessoas</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-right text-slate-400 mt-1 font-semibold">
                        {pct.toFixed(0)}% do retiro
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: LANÇAR / REGISTRAR PAGAMENTO DE PARCELA */}
      {selectedPersonForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl ${themeColors.card}`}>
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <DollarSign size={20} />
                <h3 className={`text-base font-black ${themeColors.textMain}`}>Lançar Pagamento</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPersonForPayment(null)}
                className={`p-1.5 rounded-lg text-xs font-bold ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {paymentFormError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{paymentFormError}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Participante</span>
                <h4 className={`text-base font-black ${themeColors.textMain}`}>{selectedPersonForPayment.name}</h4>
                <div className="flex items-center justify-between text-xs mt-1 text-slate-400">
                  <span>Pago: R$ {(selectedPersonForPayment.amountPaid || 0).toFixed(2)}</span>
                  <span className="font-bold text-amber-500">
                    Restante: R$ {Math.max(0, (selectedPersonForPayment.totalPrice || (selectedPersonForPayment.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE)) - (selectedPersonForPayment.amountPaid || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botões de Atalho de Valor */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Atalhos Rápidos de Parcela
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmountInput(INSTALLMENT_VALUE.toString())}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentAmountInput === INSTALLMENT_VALUE.toString()
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    1x (R$ {INSTALLMENT_VALUE})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentAmountInput((INSTALLMENT_VALUE * 2).toString())}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentAmountInput === (INSTALLMENT_VALUE * 2).toString()
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    2x (R$ {INSTALLMENT_VALUE * 2})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const rem = Math.max(0, (selectedPersonForPayment.totalPrice || (selectedPersonForPayment.ageGroup === 'Criança' ? CAMP_CHILD_PRICE : CAMP_TOTAL_PRICE)) - (selectedPersonForPayment.amountPaid || 0));
                      setPaymentAmountInput(rem.toString());
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-amber-700'
                    }`}
                  >
                    Quitar Restante
                  </button>
                </div>
              </div>

              {/* Input de Valor */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Valor a ser Lançado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-black border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Pix', 'Crédito', 'Débito', 'Dinheiro'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethodSelected(method)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethodSelected === method
                          ? 'bg-purple-600 text-white border-purple-600'
                          : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {method === 'Pix' && <QrCode size={13} />}
                      {(method === 'Crédito' || method === 'Débito') && <CreditCard size={13} />}
                      {method === 'Dinheiro' && <DollarSign size={13} />}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPersonForPayment(null)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={handleSavePayment}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingPayment ? 'Gravando...' : 'Confirmar Pagamento'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL: NOVO INSCRITO */}
      {isAddPersonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl ${themeColors.card}`}>
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <UserPlus size={20} />
                <h3 className={`text-base font-black ${themeColors.textMain}`}>Cadastrar Inscrito 2027</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPersonModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-4">
              {createFormError && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-500">
                  {createFormError}
                </div>
              )}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Nome do participante..."
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>

              {/* Faixa Etária / Categoria */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Categoria de Investimento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPersonAgeGroup('Adulto')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newPersonAgeGroup === 'Adulto'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    Adulto / Jovem (R$ 582)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPersonAgeGroup('Criança')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newPersonAgeGroup === 'Criança'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    Criança 5 a 10 anos (R$ 300)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    Tipo
                  </label>
                  <select
                    value={newPersonType}
                    onChange={(e) => setNewPersonType(e.target.value as any)}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Membro">Membro</option>
                    <option value="Visitante">Visitante</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    Tribo / Equipe
                  </label>
                  <select
                    value={newPersonTeam}
                    onChange={(e) => setNewPersonTeam(e.target.value as any)}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="none">Sem Equipe</option>
                    <option value="alianca">Aliança</option>
                    <option value="segredo">Segredo</option>
                    <option value="caminho">Caminho</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Valor Pago Inicialmente (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPersonInitialPay}
                  onChange={(e) => setNewPersonInitialPay(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  placeholder="0,00"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddPersonModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md transition-transform active:scale-95"
                >
                  Salvar Inscrito
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
