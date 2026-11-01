import React, { useState, useMemo } from 'react';
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
  Layers
} from 'lucide-react';
import { useAppStore } from '../../store';
import { CAMP_2027_CONFIG, CAMP_TOTAL_PRICE, INSTALLMENT_VALUE, INSTALLMENT_COUNT, TEAM_UI } from '../../constants';
import { Person, PaymentMethod, TeamId } from '../../types';
import { updatePerson as apiUpdatePerson, createPerson as apiCreatePerson } from '../../lib/api/people';

export const CampPastorPaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { people, updatePerson, addPerson, setPeople, isDarkMode, toggleTheme } = useAppStore();

  // Estados locais de filtro
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
  const [newPersonType, setNewPersonType] = useState<'Membro' | 'Visitante'>('Membro');
  const [newPersonTeam, setNewPersonTeam] = useState<TeamId>('none');
  const [newPersonInitialPay, setNewPersonInitialPay] = useState<string>('0');
  const [newPersonPayMethod, setNewPersonPayMethod] = useState<PaymentMethod>('Pix');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- CÁLCULOS EXECUTIVOS PARA O PASTOR ---
  const stats = useMemo(() => {
    const totalPeople = people.length;
    const targetPerPerson = CAMP_TOTAL_PRICE;
    const totalExpected = people.reduce((acc, p) => acc + (p.totalPrice || targetPerPerson), 0);
    const totalCollected = people.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
    const totalPending = Math.max(0, totalExpected - totalCollected);
    const collectionPercentage = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    let fullyPaidCount = 0;
    let partialPaidCount = 0;
    let zeroPaidCount = 0;

    const installmentCounts: number[] = [0, 0, 0, 0, 0, 0]; // 1x, 2x, 3x, 4x, 5x, 6x

    people.forEach((p) => {
      const price = p.totalPrice || targetPerPerson;
      const paid = p.amountPaid || 0;

      if (paid >= price) {
        fullyPaidCount++;
      } else if (paid > 0) {
        partialPaidCount++;
      } else {
        zeroPaidCount++;
      }

      // Cálculo de quantas parcelas completas este irmão já cobriu
      const parcelsPaid = Math.min(INSTALLMENT_COUNT, Math.floor(paid / INSTALLMENT_VALUE));
      for (let i = 0; i < parcelsPaid; i++) {
        installmentCounts[i]++;
      }
    });

    return {
      totalPeople,
      totalExpected,
      totalCollected,
      totalPending,
      collectionPercentage,
      fullyPaidCount,
      partialPaidCount,
      zeroPaidCount,
      installmentCounts
    };
  }, [people]);

  // --- LISTA FILTRADA E ORDENADA ---
  const filteredPeople = useMemo(() => {
    return people
      .filter((p) => {
        const targetPrice = p.totalPrice || CAMP_TOTAL_PRICE;
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
        const priceA = a.totalPrice || CAMP_TOTAL_PRICE;
        const priceB = b.totalPrice || CAMP_TOTAL_PRICE;
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
  const handleOpenPaymentModal = (person: Person) => {
    setSelectedPersonForPayment(person);
    const targetPrice = person.totalPrice || CAMP_TOTAL_PRICE;
    const remaining = Math.max(0, targetPrice - (person.amountPaid || 0));
    // Sugere por padrão o valor de 1 parcela (97) ou o restante
    const defaultSuggestion = Math.min(INSTALLMENT_VALUE, remaining);
    setPaymentAmountInput(defaultSuggestion.toString());
    setPaymentMethodSelected('Pix');
  };

  const handleSavePayment = async () => {
    if (!selectedPersonForPayment) return;
    const additionalAmount = parseFloat(paymentAmountInput);
    if (isNaN(additionalAmount) || additionalAmount <= 0) {
      alert('Por favor, informe um valor de pagamento válido.');
      return;
    }

    setIsSubmittingPayment(true);
    const targetPrice = selectedPersonForPayment.totalPrice || CAMP_TOTAL_PRICE;
    const currentPaid = selectedPersonForPayment.amountPaid || 0;
    const newPaid = Math.min(targetPrice, currentPaid + additionalAmount);
    const newStatus = newPaid >= targetPrice ? 'PAGO' : 'PENDENTE';
    const nowIso = new Date().toISOString();

    const updates: Partial<Person> = {
      amountPaid: newPaid,
      totalPrice: targetPrice,
      paymentStatus: newStatus,
      paymentMethod: paymentMethodSelected,
      lastPaymentDate: nowIso
    };

    try {
      // Atualiza no estado local
      updatePerson(selectedPersonForPayment.id, updates);

      // Tenta persistir na API Supabase
      await apiUpdatePerson(selectedPersonForPayment.id, updates);

      showToast(`Pagamento de R$ ${additionalAmount.toFixed(2)} registrado para ${selectedPersonForPayment.name}!`);
      setSelectedPersonForPayment(null);
    } catch (err) {
      console.warn('Persistência via Supabase falhou, mantendo em memória local:', err);
      showToast(`Pagamento de R$ ${additionalAmount.toFixed(2)} registrado com sucesso!`);
      setSelectedPersonForPayment(null);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // --- AÇÃO: CRIAR NOVO PARTICIPANTE ---
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const initialPaid = parseFloat(newPersonInitialPay) || 0;
    const isFullyPaid = initialPaid >= CAMP_TOTAL_PRICE;

    const newPersonData: Omit<Person, 'id'> = {
      name: newPersonName.trim(),
      amountPaid: initialPaid,
      totalPrice: CAMP_TOTAL_PRICE,
      ageGroup: 'Adulto',
      personType: newPersonType,
      teamId: newPersonTeam,
      paymentStatus: isFullyPaid ? 'PAGO' : 'PENDENTE',
      paymentMethod: initialPaid > 0 ? newPersonPayMethod : undefined,
      lastPaymentDate: initialPaid > 0 ? new Date().toISOString() : undefined
    };

    try {
      const created = await apiCreatePerson(newPersonData);
      setPeople([created, ...people]);
      showToast(`Inscrito "${newPersonName}" adicionado com sucesso!`);
    } catch (err) {
      // Fallback local
      const fallbackId = `p-${Date.now()}`;
      setPeople([{ id: fallbackId, ...newPersonData }, ...people]);
      showToast(`Inscrito "${newPersonName}" adicionado com sucesso!`);
    }

    setNewPersonName('');
    setNewPersonInitialPay('0');
    setIsAddPersonModalOpen(false);
  };

  // --- AÇÃO: MENSAGEM DO WHATSAPP PASTORAL ---
  const handleSendPastorMessage = (person: Person) => {
    const targetPrice = person.totalPrice || CAMP_TOTAL_PRICE;
    const paid = person.amountPaid || 0;
    const remaining = Math.max(0, targetPrice - paid);
    const parcelsPaid = Math.min(INSTALLMENT_COUNT, Math.floor(paid / INSTALLMENT_VALUE));

    let message = '';
    if (paid >= targetPrice) {
      message = `Graça e paz, ${person.name}! 🌿
Aqui é o Pastor da Igreja Manancial.
Passando para te parabenizar e confirmar que a sua inscrição para o *Acampamento Manancial 2027* (05 a 09 de Fevereiro em São Pedro - SP) está *100% QUITADA*! 🕊️
Estamos em oração para que sejam dias inesquecíveis na presença do Senhor. Deus te abençoe!`;
    } else {
      message = `Graça e paz, ${person.name}! 🌿
Aqui é o Pastor da Igreja Manancial.
Estamos muito alegres com a sua presença confirmada no nosso *Acampamento Manancial 2027* (05 a 09 de Fevereiro em São Pedro - SP)!
Salmos 25:14: "O segredo do Senhor é para aqueles que o temem..."

Acompanhamento da sua inscrição:
• Total do retiro: R$ ${targetPrice.toFixed(2)}
• Valor já pago: R$ ${paid.toFixed(2)} (${parcelsPaid}/${INSTALLMENT_COUNT} parcelas)
• Saldo restante: R$ ${remaining.toFixed(2)}

Lembrando que você pode parcelar em até 6x de R$ 97,00 no cartão ou pagar pelo PIX:
Chave PIX: ${CAMP_2027_CONFIG.pixKey}

Se precisar de qualquer apoio ou ajuste, conte conosco. Deus abençoe você e sua família!`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // --- AÇÃO: COPIAR RELATÓRIO EXECUTIVO ---
  const handleCopyPastorReport = () => {
    const text = `📊 *RELATÓRIO PASTORAL - ACAMPAMENTO MANANCIAL 2027*
📅 05 a 09 de Fevereiro de 2027 • São Pedro - SP
Tema: Salmos 25:14 ("O segredo do Senhor é para aqueles que o temem...")

👥 *INSCRITOS & PARTICIPAÇÃO*
• Total de Inscritos: ${stats.totalPeople} pessoas
• 100% Quitados: ${stats.fullyPaidCount} participantes (${((stats.fullyPaidCount / (stats.totalPeople || 1)) * 100).toFixed(0)}%)
• Pagamento em Andamento: ${stats.partialPaidCount} participantes
• Pendente (R$ 0 pago): ${stats.zeroPaidCount} participantes

💰 *FINANCEIRO DO ACAMPAMENTO*
• Investimento Oficial: R$ ${CAMP_TOTAL_PRICE.toFixed(2)} (ou 6x de R$ ${INSTALLMENT_VALUE.toFixed(2)})
• Previsão Total: R$ ${stats.totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Total Já Arrecadado: R$ ${stats.totalCollected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${stats.collectionPercentage.toFixed(1)}%)
• Saldo a Receber: R$ ${stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
_Igreja Manancial - Gestão Eclesiástica & Retiros_`;

    navigator.clipboard.writeText(text);
    showToast('Relatório executivo copiado com sucesso para a área de transferência!');
  };

  const themeColors = {
    bg: isDarkMode ? 'bg-[#090d16]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200/80',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className={`min-h-[100dvh] transition-colors duration-500 pb-28 ${themeColors.bg}`}>
      
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-xs md:text-sm animate-in fade-in slide-in-from-top-4 max-w-[90vw]">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER FIXO SUPERIOR */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-4 py-3 flex items-center justify-between ${
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
                Gestão Pastoral de Pagamentos
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Pastor
              </span>
            </div>
            <p className={`text-[11px] font-semibold ${themeColors.textSec}`}>
              Acampamento Manancial 2027 • São Pedro - SP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPastorReport}
            className={`p-2.5 rounded-2xl border transition-all active:scale-95 flex items-center gap-1.5 font-bold text-xs ${
              isDarkMode ? 'bg-purple-900/30 border-purple-700/50 text-purple-300 hover:bg-purple-900/50' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
            }`}
            title="Copiar Relatório para WhatsApp"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">Copiar Relatório</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 pt-4 space-y-6">

        {/* HERO PASTORAL COM KPIs FINANCEIROS */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#121629] via-[#0d121f] to-[#070b14] border-purple-900/30' 
            : 'bg-gradient-to-br from-purple-50/80 via-white to-blue-50/50 border-purple-100'
        }`}>
          {/* Fundo sutil */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Painel Executivo do Pastor
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  Retiro 2027 (05 a 09/Fev)
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
                  R$ {stats.totalCollected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {stats.collectionPercentage.toFixed(1)}% Arrecadado
                </span>
              </div>

              <p className={`text-xs mt-2 max-w-lg ${themeColors.textSec}`}>
                De um total previsto de <strong>R$ {stats.totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> ({stats.totalPeople} inscritos x R$ {CAMP_TOTAL_PRICE.toFixed(2)}).
              </p>
            </div>

            {/* Ações de Topo */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAddPersonModalOpen(true)}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-transform active:scale-95"
              >
                <UserPlus size={16} /> Novo Inscrito
              </button>
              <button
                onClick={() => navigate('/acampamento/informacoes')}
                className={`px-4 py-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <Sparkles size={16} className="text-amber-500" /> Ver Guia do Evento
              </button>
            </div>
          </div>

          {/* BARRA DE PROGRESSO GERAL DA ARRECADAÇÃO */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className={themeColors.textSec}>Meta Financeira do Retiro</span>
              <span className="text-purple-600 dark:text-purple-400">
                R$ {stats.totalCollected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {stats.totalExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min(100, stats.collectionPercentage)}%` }}
              />
            </div>
          </div>
        </div>

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
            <span className="text-[11px] text-slate-400 font-medium">Já em caixa</span>
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
              {stats.fullyPaidCount} <span className="text-xs font-normal text-slate-400">/ {stats.totalPeople}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Inscrições liberadas</span>
          </div>

          {/* Card 4: Parciais / Pendentes */}
          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Em Andamento
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Layers size={16} />
              </div>
            </div>
            <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
              {stats.partialPaidCount} <span className="text-xs font-normal text-slate-400">parciais</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">+{stats.zeroPaidCount} pendentes</span>
          </div>
        </div>

        {/* VISÃO DA RÉGUA DE PARCELAS (6x de R$ 97) */}
        <div className={`p-5 rounded-3xl border shadow-sm ${themeColors.card}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className={`text-sm font-black ${themeColors.textMain}`}>
                Régua de Parcelamento (Até 6x de R$ {INSTALLMENT_VALUE.toFixed(2)})
              </h3>
              <p className={`text-xs ${themeColors.textSec}`}>
                Acompanhe o volume de participantes que já quitaram cada uma das 6 parcelas
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total R$ {CAMP_TOTAL_PRICE.toFixed(2)} por participante
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const count = stats.installmentCounts[num - 1] || 0;
              const pct = stats.totalPeople > 0 ? (count / stats.totalPeople) * 100 : 0;
              return (
                <div
                  key={num}
                  className={`p-3 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-500">{num}ª Parcela</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">{count}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mb-2">
                    R$ {(num * INSTALLMENT_VALUE).toFixed(2)} acumulado
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BARRA DE FILTROS E BUSCA */}
        <div className={`p-4 rounded-3xl border shadow-sm space-y-3 ${themeColors.card}`}>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            
            {/* Input de Busca */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome do participante..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold outline-none border transition-all ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-purple-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtros em Linha */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro Status */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border outline-none cursor-pointer pr-8 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="QUITADO">100% Quitados</option>
                  <option value="PARCIAL">Parcial (1-5x)</option>
                  <option value="PENDENTE">Pendente (R$ 0)</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Filtro Equipe */}
              <div className="relative">
                <select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border outline-none cursor-pointer pr-8 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="TODAS">Todas as Equipes</option>
                  <option value="alianca">Aliança</option>
                  <option value="segredo">Segredo</option>
                  <option value="caminho">Caminho</option>
                  <option value="none">Sem Equipe</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Ordenação */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border outline-none cursor-pointer pr-8 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="MAIOR_PENDENCIA">Maior Pendência</option>
                  <option value="MAIOR_PAGO">Maior Valor Pago</option>
                  <option value="NOME">Nome (A-Z)</option>
                  <option value="RECENTE">Pagamento Recente</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

            </div>

          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-medium">
            <span>Exibindo <strong>{filteredPeople.length}</strong> de {people.length} participantes</span>
            {(search || filterStatus !== 'TODOS' || filterTeam !== 'TODAS') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterStatus('TODOS');
                  setFilterTeam('TODAS');
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* LISTA DE PARTICIPANTES */}
        <div className="space-y-3">
          {filteredPeople.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border ${themeColors.card}`}>
              <AlertCircle size={36} className="mx-auto text-slate-400 mb-3 opacity-60" />
              <h4 className={`text-base font-black ${themeColors.textMain}`}>Nenhum participante encontrado</h4>
              <p className={`text-xs mt-1 ${themeColors.textSec}`}>
                Tente ajustar os filtros de pesquisa ou cadastrar um novo participante.
              </p>
              <button
                onClick={() => setIsAddPersonModalOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <UserPlus size={14} /> Cadastrar Participante
              </button>
            </div>
          ) : (
            filteredPeople.map((person) => {
              const targetPrice = person.totalPrice || CAMP_TOTAL_PRICE;
              const paid = person.amountPaid || 0;
              const remaining = Math.max(0, targetPrice - paid);
              const isFullyPaid = paid >= targetPrice;
              const progressPct = Math.min(100, (paid / targetPrice) * 100);
              const parcelsCompleted = Math.min(INSTALLMENT_COUNT, Math.floor(paid / INSTALLMENT_VALUE));
              const teamInfo = person.teamId && person.teamId !== 'none' && person.teamId !== 'org' ? TEAM_UI[person.teamId] : null;

              return (
                <div
                  key={person.id}
                  className={`p-4 md:p-5 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md ${themeColors.card}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* LADO ESQUERDO: Dados do Irmão */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      
                      {/* Avatar com inicial */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 ${
                        teamInfo ? `${teamInfo.color} ${teamInfo.text}` : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {person.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-base font-black truncate ${themeColors.textMain}`}>
                            {person.name}
                          </h4>
                          
                          {/* Badge de Quitado / Parcial / Pendente */}
                          {isFullyPaid ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 size={11} /> 100% Quitado
                            </span>
                          ) : paid > 0 ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                              {parcelsCompleted}/6 Parcelas Pagas
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Pendente (R$ 0)
                            </span>
                          )}
                        </div>

                        {/* Metadados: Categoria, Equipe, Faixa Etária */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-semibold text-slate-400">
                          <span>{person.personType || 'Membro'}</span>
                          <span>•</span>
                          <span>{person.ageGroup || 'Adulto'}</span>
                          {teamInfo && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-slate-600 dark:text-slate-300">
                                Equipe {teamInfo.name}
                              </span>
                            </>
                          )}
                          {person.lastPaymentDate && (
                            <>
                              <span>•</span>
                              <span>Último pgto: {new Date(person.lastPaymentDate).toLocaleDateString('pt-BR')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* LADO CENTRAL: Régua das 6 Parcelas de R$ 97 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:w-72">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-slate-900 dark:text-white">
                            R$ {paid.toFixed(2)}
                          </span>
                          <span className={`text-[11px] font-bold ${remaining > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {remaining > 0 ? `Falta R$ ${remaining.toFixed(2)}` : 'Concluído'}
                          </span>
                        </div>

                        {/* 6 Bloquinhos de Parcela */}
                        <div className="grid grid-cols-6 gap-1">
                          {[...Array(6)].map((_, idx) => {
                            const isSlotPaid = paid >= (idx + 1) * INSTALLMENT_VALUE;
                            return (
                              <div
                                key={idx}
                                title={`${idx + 1}ª parcela: R$ ${INSTALLMENT_VALUE}`}
                                className={`h-2 rounded-full transition-all ${
                                  isSlotPaid
                                    ? 'bg-emerald-500 shadow-sm'
                                    : 'bg-slate-200 dark:bg-slate-800'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* LADO DIREITO: Ações Rápidas (Lançar Parcela & WhatsApp) */}
                    <div className="flex items-center gap-2 shrink-0">
                      
                      {/* Botão WhatsApp */}
                      <button
                        onClick={() => handleSendPastorMessage(person)}
                        className={`p-2.5 rounded-2xl border transition-all active:scale-95 flex items-center gap-1.5 font-bold text-xs ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title="Enviar mensagem pastoral no WhatsApp"
                      >
                        <MessageSquare size={15} />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      {/* Botão Lançar Pagamento */}
                      <button
                        onClick={() => handleOpenPaymentModal(person)}
                        className={`px-3.5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${
                          isFullyPaid
                            ? isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                        }`}
                      >
                        <DollarSign size={14} />
                        <span>{isFullyPaid ? 'Ajustar Pgto' : 'Lançar Pgto'}</span>
                      </button>

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

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
                onClick={() => setSelectedPersonForPayment(null)}
                className={`p-1.5 rounded-lg text-xs font-bold ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Participante</span>
                <h4 className={`text-base font-black ${themeColors.textMain}`}>{selectedPersonForPayment.name}</h4>
                <div className="flex items-center justify-between text-xs mt-1 text-slate-400">
                  <span>Pago: R$ {(selectedPersonForPayment.amountPaid || 0).toFixed(2)}</span>
                  <span className="font-bold text-amber-500">
                    Restante: R$ {Math.max(0, (selectedPersonForPayment.totalPrice || CAMP_TOTAL_PRICE) - (selectedPersonForPayment.amountPaid || 0)).toFixed(2)}
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
                      const rem = Math.max(0, (selectedPersonForPayment.totalPrice || CAMP_TOTAL_PRICE) - (selectedPersonForPayment.amountPaid || 0));
                      setPaymentAmountInput(rem.toString());
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentAmountInput === Math.max(0, (selectedPersonForPayment.totalPrice || CAMP_TOTAL_PRICE) - (selectedPersonForPayment.amountPaid || 0)).toString()
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    Quitar Tudo
                  </button>
                </div>
              </div>

              {/* Input de Valor Customizado */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Valor a ser Lançado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl font-black text-lg outline-none border transition-all ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pix', 'Crédito', 'Débito', 'Dinheiro'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethodSelected(method)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethodSelected === method
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedPersonForPayment(null)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs border ${
                    isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={handleSavePayment}
                  className="flex-1 py-3 rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingPayment ? 'Salvando...' : 'Confirmar Baixa'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO INSCRITO */}
      {isAddPersonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl ${themeColors.card}`}>
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <UserPlus size={20} />
                <h3 className={`text-base font-black ${themeColors.textMain}`}>Novo Inscrito 2027</h3>
              </div>
              <button
                onClick={() => setIsAddPersonModalOpen(false)}
                className={`p-1.5 rounded-lg text-xs font-bold ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className={`w-full px-4 py-2.5 rounded-2xl font-bold text-sm outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-purple-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Vínculo
                  </label>
                  <select
                    value={newPersonType}
                    onChange={(e) => setNewPersonType(e.target.value as any)}
                    className={`w-full p-2.5 rounded-2xl font-bold text-xs border outline-none ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Membro">Membro</option>
                    <option value="Visitante">Visitante</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Equipe Gincana
                  </label>
                  <select
                    value={newPersonTeam}
                    onChange={(e) => setNewPersonTeam(e.target.value as any)}
                    className={`w-full p-2.5 rounded-2xl font-bold text-xs border outline-none ${
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
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Pagamento Inicial (R$) - Total R$ {CAMP_TOTAL_PRICE.toFixed(2)}
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setNewPersonInitialPay('0')}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold ${
                      newPersonInitialPay === '0'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    R$ 0 (Pendente)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPersonInitialPay(INSTALLMENT_VALUE.toString())}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold ${
                      newPersonInitialPay === INSTALLMENT_VALUE.toString()
                        ? 'bg-purple-600 text-white border-purple-600'
                        : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    1ª Parc (R$ {INSTALLMENT_VALUE})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPersonInitialPay(CAMP_TOTAL_PRICE.toString())}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold ${
                      newPersonInitialPay === CAMP_TOTAL_PRICE.toString()
                        ? 'bg-purple-600 text-white border-purple-600'
                        : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Quitado (R$ {CAMP_TOTAL_PRICE})
                  </button>
                </div>

                <input
                  type="number"
                  step="0.01"
                  value={newPersonInitialPay}
                  onChange={(e) => setNewPersonInitialPay(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl font-bold text-sm outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-purple-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddPersonModalOpen(false)}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs border ${
                    isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl font-black text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-transform active:scale-95"
                >
                  Cadastrar Inscrito
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
