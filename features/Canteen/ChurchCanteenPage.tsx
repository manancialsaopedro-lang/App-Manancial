import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Users,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Wallet,
  CreditCard,
  QrCode,
  Banknote,
  Clock,
  ChevronDown,
  RotateCcw,
  Sparkles,
  FileText,
  Percent,
  TrendingUp,
  X,
  Share2,
  AlertTriangle,
  Receipt,
  UserCheck,
  Edit2
} from 'lucide-react';
import { useAppStore } from '../../store';
import { Product, PaymentMethod, Person, Sale, SaleItem } from '../../types';
import { listProducts, updateProduct as updateProductApi, createProduct as createProductApi } from '../../lib/api/products';
import { listPeople } from '../../lib/api/people';
import { listSales, createSale, deleteSale } from '../../lib/api/sales';
import { createTransaction } from '../../lib/api/transactions';

interface CanteenEvent {
  id: string;
  name: string;
  category: string;
  isDefault?: boolean;
}

const DEFAULT_EVENTS: CanteenEvent[] = [
  { id: 'acamp-2027', name: 'Acampamento & Retiro Manancial 2027', category: 'Retiro', isDefault: true },
  { id: 'culto-domingo', name: 'Cantina Geral (Cultos Dominicais)', category: 'Igreja' },
  { id: 'jovens', name: 'Encontro de Jovens & Conectados', category: 'Jovens' },
  { id: 'mulheres', name: 'Conferência de Mulheres', category: 'Mulheres' },
];

export const ChurchCanteenPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    setProducts,
    people,
    setPeople,
    sales,
    setSales,
    settleSale,
    settleAllCustomerDebt
  } = useAppStore();

  // Abas do Módulo: 'pdv' | 'comandas' | 'estoque' | 'fechamento'
  const [activeTab, setActiveTab] = useState<'pdv' | 'comandas' | 'estoque' | 'fechamento'>('pdv');

  // Evento Ativo
  const [eventsList, setEventsList] = useState<CanteenEvent[]>(DEFAULT_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>('acamp-2027');
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);
  const [newEventModal, setNewEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');

  // Estados do PDV (Frente de Caixa)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [productSearch, setProductSearch] = useState<string>('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personSearch, setPersonSearch] = useState<string>('');
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);

  // Modais de Pagamento
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    method: PaymentMethod;
  }>({ isOpen: false, method: 'Pix' });
  const [cashGiven, setCashGiven] = useState<string>('');
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  // Estados da Aba de Comandas
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  const [debtSettleModal, setDebtSettleModal] = useState<{
    isOpen: boolean;
    person: Person | null;
    totalDebt: number;
    saleId?: string;
    method: PaymentMethod;
  }>({ isOpen: false, person: null, totalDebt: 0, method: 'Pix' });

  // Estados da Aba de Estoque
  const [newProductModal, setNewProductModal] = useState(false);
  const [newProdData, setNewProdData] = useState({
    name: '',
    category: 'Bebidas',
    costPrice: '',
    sellPrice: '',
    stock: '',
    minStock: '5'
  });

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Carregar dados de produtos, pessoas e vendas
  const loadData = useCallback(async () => {
    try {
      const [prodData, peopleData, salesData] = await Promise.all([
        listProducts(),
        listPeople(),
        listSales()
      ]);
      if (prodData && prodData.length) setProducts(prodData);
      if (peopleData && peopleData.length) setPeople(peopleData);
      if (salesData && salesData.length) setSales(salesData);
    } catch (e) {
      console.warn("Carregamento via API falhou, usando estado local do store:", e);
    }
  }, [setPeople, setProducts, setSales]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeEvent = useMemo(() => {
    return eventsList.find(e => e.id === selectedEventId) || eventsList[0];
  }, [eventsList, selectedEventId]);

  // Vendas filtradas por evento
  const eventSales = useMemo(() => {
    return sales.filter(s => {
      if (selectedEventId === 'acamp-2027') {
        // Compatibilidade com vendas antigas que não tinham eventId
        return !s.eventId || s.eventId === 'acamp-2027';
      }
      return s.eventId === selectedEventId;
    });
  }, [sales, selectedEventId]);

  // Categorias de produtos disponíveis
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['Todos', ...Array.from(set)];
  }, [products]);

  // Produtos filtrados na grade
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchSearch && p.isActive !== false;
    });
  }, [products, selectedCategory, productSearch]);

  // Autocomplete de clientes / membros
  const filteredPeople = useMemo(() => {
    if (!personSearch.trim()) return people.slice(0, 8);
    return people
      .filter(p => p.name.toLowerCase().includes(personSearch.toLowerCase()))
      .slice(0, 8);
  }, [people, personSearch]);

  // Cálculos do Carrinho
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.sellPrice * item.quantity, 0);
  }, [cart]);

  const cartTotalCost = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.costPrice * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Ações do Carrinho
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast(`⚠️ "${product.name}" está sem estoque no momento!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Estoque máximo atingido para ${product.name} (${product.stock} un)`);
          return prev;
        }
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.product.id === productId) {
            const nextQty = i.quantity + delta;
            if (nextQty > i.product.stock) {
              showToast(`Estoque máximo atingido (${i.product.stock} un)`);
              return i;
            }
            return { ...i, quantity: nextQty };
          }
          return i;
        })
        .filter(i => i.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedPerson(null);
    setPersonSearch('');
  };

  // Finalização de Venda
  const handleInitiateCheckout = (method: PaymentMethod) => {
    if (cart.length === 0) {
      showToast('Adicione produtos ao carrinho antes de finalizar.');
      return;
    }
    if ((method === 'Pendencia' || method === 'Pendência') && !selectedPerson) {
      showToast('⚠️ Para marcar como Comanda / Pendência, é obrigatório selecionar uma pessoa.');
      return;
    }
    setCashGiven(cartTotal.toFixed(2));
    setCheckoutModal({ isOpen: true, method });
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutModal.method || cart.length === 0) return;
    setIsProcessingSale(true);

    const isPending =
      checkoutModal.method === 'Pendencia' || checkoutModal.method === 'Pendência';

    try {
      const items: SaleItem[] = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.sellPrice,
        unitCost: item.product.costPrice
      }));

      // Criação da Venda
      const newSale = await createSale({
        items,
        total: cartTotal,
        totalCost: cartTotalCost,
        date: new Date().toISOString(),
        paymentMethod: checkoutModal.method,
        personId: selectedPerson?.id,
        personName: selectedPerson?.name,
        status: isPending ? 'PENDING' : 'PAID',
        eventId: activeEvent.id,
        eventName: activeEvent.name
      });

      // Atualiza estoque no banco e no estado
      await Promise.all(
        cart.map(item =>
          updateProductApi(item.product.id, {
            stock: item.product.stock - item.quantity
          })
        )
      );

      // Se pago na hora, registra entrada no livro caixa da igreja
      if (!isPending) {
        await createTransaction({
          description: selectedPerson
            ? `Venda Cantina [${activeEvent.name}]: ${selectedPerson.name}`
            : `Venda Cantina [${activeEvent.name}] #${newSale.id.slice(-4)}`,
          amount: cartTotal,
          type: 'ENTRADA',
          category: 'CANTINA',
          date: new Date().toISOString(),
          paymentMethod: checkoutModal.method,
          referenceId: newSale.id,
          personId: selectedPerson?.id,
          personName: selectedPerson?.name,
          isSettled: true,
          items,
          eventId: activeEvent.id,
          eventName: activeEvent.name
        });
      }

      await loadData();
      clearCart();
      setCheckoutModal({ isOpen: false, method: 'Pix' });
      showToast(
        isPending
          ? `✅ Comanda de R$ ${cartTotal.toFixed(2)} registrada para ${selectedPerson?.name}!`
          : `✅ Venda de R$ ${cartTotal.toFixed(2)} finalizada com sucesso via ${checkoutModal.method}!`
      );
    } catch (err: any) {
      console.error("Erro ao registrar venda:", err);
      showToast(`Erro ao registrar venda: ${err.message || 'Tente novamente.'}`);
    } finally {
      setIsProcessingSale(false);
    }
  };

  // Lógica de Comandas / Devedores
  const debtorsList = useMemo(() => {
    const map: Record<
      string,
      { personId: string; personName: string; totalDebt: number; sales: Sale[] }
    > = {};

    eventSales
      .filter(s => s.status === 'PENDING' && s.personId)
      .forEach(sale => {
        const pid = sale.personId!;
        if (!map[pid]) {
          map[pid] = {
            personId: pid,
            personName: sale.personName || 'Membro não identificado',
            totalDebt: 0,
            sales: []
          };
        }
        map[pid].totalDebt += sale.total;
        map[pid].sales.push(sale);
      });

    return Object.values(map).sort((a, b) => b.totalDebt - a.totalDebt);
  }, [eventSales]);

  const totalDebtsAmount = useMemo(() => {
    return debtorsList.reduce((acc, d) => acc + d.totalDebt, 0);
  }, [debtorsList]);

  // Quitar comanda total de uma pessoa
  const handleSettleAllDebts = async () => {
    if (!debtSettleModal.person) return;
    try {
      settleAllCustomerDebt(debtSettleModal.person.id, debtSettleModal.method);
      showToast(`✅ Comanda total de ${debtSettleModal.person.name} quitada com sucesso!`);
      setDebtSettleModal({ isOpen: false, person: null, totalDebt: 0, method: 'Pix' });
      await loadData();
    } catch (err: any) {
      showToast(`Erro ao quitar comanda: ${err.message}`);
    }
  };

  // Quitar venda avulsa específica
  const handleSettleSingleSale = async (saleId: string, method: PaymentMethod) => {
    try {
      settleSale(saleId, method);
      showToast('✅ Venda quitada com sucesso!');
      await loadData();
    } catch (err: any) {
      showToast(`Erro ao quitar venda: ${err.message}`);
    }
  };

  // Cadastro de Novo Produto
  const handleCreateProduct = async () => {
    if (!newProdData.name.trim() || !newProdData.sellPrice) {
      showToast('Preencha ao menos o nome e o preço de venda do produto.');
      return;
    }

    try {
      await createProductApi({
        name: newProdData.name.trim(),
        category: newProdData.category,
        costPrice: parseFloat(newProdData.costPrice) || 0,
        sellPrice: parseFloat(newProdData.sellPrice) || 0,
        stock: parseInt(newProdData.stock, 10) || 0,
        minStock: parseInt(newProdData.minStock, 10) || 5,
        isActive: true
      });
      showToast(`✅ Produto "${newProdData.name}" cadastrado no cardápio!`);
      setNewProductModal(false);
      setNewProdData({
        name: '',
        category: 'Bebidas',
        costPrice: '',
        sellPrice: '',
        stock: '',
        minStock: '5'
      });
      await loadData();
    } catch (err: any) {
      showToast(`Erro ao cadastrar produto: ${err.message}`);
    }
  };

  // Métricas do Fechamento de Caixa
  const closingMetrics = useMemo(() => {
    const paidSales = eventSales.filter(s => s.status === 'PAID');
    const totalGross = paidSales.reduce((acc, s) => acc + s.total, 0);
    const totalCost = paidSales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
    const netProfit = totalGross - totalCost;

    const byMethod: Record<string, number> = {
      Pix: 0,
      Dinheiro: 0,
      Crédito: 0,
      Débito: 0,
      Outro: 0
    };

    paidSales.forEach(s => {
      const m = s.paymentMethod || 'Outro';
      if (m.includes('Pix')) byMethod.Pix += s.total;
      else if (m.includes('Dinheiro')) byMethod.Dinheiro += s.total;
      else if (m.includes('Crédito') || m.includes('Credito')) byMethod.Crédito += s.total;
      else if (m.includes('Débito') || m.includes('Debito')) byMethod.Débito += s.total;
      else byMethod.Outro += s.total;
    });

    return {
      totalGross,
      totalCost,
      netProfit,
      marginPercent: totalGross > 0 ? ((netProfit / totalGross) * 100).toFixed(1) : '0',
      byMethod,
      totalSalesCount: paidSales.length,
      pendingCount: debtorsList.length,
      pendingTotal: totalDebtsAmount
    };
  }, [eventSales, debtorsList, totalDebtsAmount]);

  // Exportar Fechamento para WhatsApp
  const handleShareClosing = () => {
    const message = `📊 *FECHAMENTO DE CAIXA & CANTINA*\n` +
      `⛪ *Igreja Manancial*\n` +
      `🏷️ *Evento:* ${activeEvent.name}\n` +
      `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `💰 *Faturamento Bruto:* R$ ${closingMetrics.totalGross.toFixed(2)}\n` +
      `📦 *Custo Mercadorias (CMV):* R$ ${closingMetrics.totalCost.toFixed(2)}\n` +
      `✨ *Lucro Líquido Apurado:* R$ ${closingMetrics.netProfit.toFixed(2)} (${closingMetrics.marginPercent}%)\n\n` +
      `💳 *Divisão por Forma de Pagamento:*\n` +
      `• Pix: R$ ${closingMetrics.byMethod.Pix.toFixed(2)}\n` +
      `• Dinheiro: R$ ${closingMetrics.byMethod.Dinheiro.toFixed(2)}\n` +
      `• Cartão Crédito: R$ ${closingMetrics.byMethod.Crédito.toFixed(2)}\n` +
      `• Cartão Débito: R$ ${closingMetrics.byMethod.Débito.toFixed(2)}\n\n` +
      `⏳ *Comandas / Pendências em Aberto:* R$ ${closingMetrics.pendingTotal.toFixed(2)} (${closingMetrics.pendingCount} pessoas)\n` +
      `🧾 *Total de Pedidos Pagos:* ${closingMetrics.totalSalesCount}\n\n` +
      `_Gerado pelo Módulo Caixa & Cantina do Ecossistema Manancial_`;

    navigator.clipboard.writeText(message);
    showToast('📋 Resumo do fechamento copiado para a área de transferência! Pronto para colar no WhatsApp.');
  };

  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Toast Notificação */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-400/40 text-white text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Sparkles size={16} className="text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Principal da Cantina */}
      <header className="sticky top-0 z-30 bg-[#070c14]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Logo & Seletor de Evento */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Voltar ao Hub"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20">
              <ShoppingBag size={20} className="stroke-[2.4]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg text-white tracking-tight">
                  Cantina & Caixa
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  PDV Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Frente de caixa, comandas por pessoa e fechamento financeiro
              </p>
            </div>
          </div>

          {/* Seletor de Evento Ativo (Multi-evento) */}
          <div className="relative w-full md:w-auto flex items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <button
                type="button"
                onClick={() => setIsEventMenuOpen(!isEventMenuOpen)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-left text-xs transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar size={14} className="text-orange-400 shrink-0" />
                  <span className="truncate font-bold text-white">
                    {activeEvent.name}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </button>

              {/* Menu Dropdown de Eventos */}
              {isEventMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-full md:w-80 rounded-2xl bg-[#0c1424] border border-white/15 shadow-2xl p-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                    Selecione o Evento Ativo da Cantina
                  </div>
                  {eventsList.map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        setSelectedEventId(ev.id);
                        setIsEventMenuOpen(false);
                        showToast(`Evento ativo alterado para: ${ev.name}`);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                        ev.id === activeEvent.id
                          ? 'bg-orange-500/20 text-orange-200 border border-orange-400/40'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold truncate">{ev.name}</div>
                        <span className="text-[10px] text-slate-400">{ev.category}</span>
                      </div>
                      {ev.id === activeEvent.id && (
                        <Check size={14} className="text-orange-400 shrink-0" />
                      )}
                    </button>
                  ))}

                  <div className="pt-1 mt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        setIsEventMenuOpen(false);
                        setNewEventModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 font-bold transition-colors"
                    >
                      <Plus size={14} />
                      Adicionar Novo Evento
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/igreja')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
              title="Abrir Gestão da Igreja"
            >
              <span>Gestão</span>
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Navegação entre Abas */}
      <div className="border-b border-white/10 bg-[#070c14]/70 backdrop-blur-md px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('pdv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'pdv'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShoppingCart size={15} />
            <span>Frente de Caixa (PDV)</span>
            {cartItemCount > 0 && (
              <span className="bg-slate-950 text-orange-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('comandas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'comandas'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users size={15} />
            <span>Comandas & Fechamento por Pessoa</span>
            {debtorsList.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                {debtorsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('estoque')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'estoque'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Package size={15} />
            <span>Estoque & Cardápio</span>
            <span className="text-[10px] text-slate-400 font-normal">({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fechamento')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'fechamento'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Receipt size={15} />
            <span>Fechamento do Caixa</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24">
        {/* =========================================================================
            ABA 1: FRENTE DE CAIXA (PDV RÁPIDO COM CARRINHO)
           ========================================================================= */}
        {activeTab === 'pdv' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lado Esquerdo (2 colunas): Grade de Produtos & Filtros */}
            <div className="lg:col-span-2 space-y-4">
              {/* Barra de Pesquisa & Filtro de Categorias */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar produto no cardápio..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-400"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filtro de Categorias */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-orange-500 text-slate-950 font-black'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade de Produtos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map(p => {
                  const inCart = cart.find(i => i.product.id === p.id);
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && addToCart(p)}
                      className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border transition-all select-none ${
                        isOutOfStock
                          ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                          : 'bg-[#0d1424] border-white/10 hover:border-orange-500/50 hover:bg-orange-950/10 cursor-pointer active:scale-95 shadow-lg'
                      }`}
                    >
                      {/* Badge de quantidade no carrinho */}
                      {inCart && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange-500 text-slate-950 text-xs font-black flex items-center justify-center shadow-md">
                          {inCart.quantity}
                        </span>
                      )}

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {p.category}
                        </span>
                        <h4 className="font-bold text-white text-sm line-clamp-2 mt-0.5">
                          {p.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-base font-black text-orange-400">
                            R$ {p.sellPrice.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {isOutOfStock ? (
                              <span className="text-rose-400 font-bold">Esgotado</span>
                            ) : (
                              `${p.stock} un disponíveis`
                            )}
                          </div>
                        </div>

                        {!isOutOfStock && (
                          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center hover:bg-orange-500 hover:text-slate-950 transition-colors">
                            <Plus size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 rounded-3xl bg-white/[0.02] border border-white/5">
                  <Package size={40} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-400">Nenhum produto encontrado</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tente buscar por outro termo ou cadastre novos produtos na aba Estoque.
                  </p>
                </div>
              )}
            </div>

            {/* Lado Direito (1 coluna): Carrinho & Checkout */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-[#0c1322] border border-white/10 shadow-2xl flex flex-col h-full">
                {/* Topo do Carrinho */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} className="text-orange-400" />
                    <h3 className="font-black text-sm text-white">Comanda Atual</h3>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Seleção do Cliente / Membro */}
                <div className="mb-4 relative">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Cliente / Membro da Comanda
                  </label>

                  {selectedPerson ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-500/10 border border-orange-400/30">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-7 h-7 rounded-lg bg-orange-500 text-slate-950 font-black text-xs flex items-center justify-center">
                          {selectedPerson.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs text-white truncate">
                            {selectedPerson.name}
                          </div>
                          <span className="text-[10px] text-orange-300">
                            Equipe: {selectedPerson.teamId || 'Geral'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPerson(null)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar membro ou venda avulsa..."
                        value={personSearch}
                        onFocus={() => setIsPersonDropdownOpen(true)}
                        onChange={e => {
                          setPersonSearch(e.target.value);
                          setIsPersonDropdownOpen(true);
                        }}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-400"
                      />

                      {/* Dropdown de sugestão de membros */}
                      {isPersonDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#0e172a] border border-white/15 shadow-2xl p-1 z-40">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPerson(null);
                              setPersonSearch('');
                              setIsPersonDropdownOpen(false);
                            }}
                            className="w-full p-2 rounded-lg text-left text-xs font-semibold hover:bg-white/5 text-slate-300"
                          >
                            👤 Venda Avulsa / Balcão (Sem cadastro)
                          </button>
                          {filteredPeople.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPerson(p);
                                setPersonSearch('');
                                setIsPersonDropdownOpen(false);
                              }}
                              className="w-full p-2 rounded-lg text-left text-xs hover:bg-orange-500/20 text-white flex items-center justify-between"
                            >
                              <span className="font-bold truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {p.teamId ? `Tribo ${p.teamId}` : 'Membro'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Lista de Itens no Carrinho */}
                <div className="flex-1 overflow-y-auto max-h-64 space-y-2 pr-1 -mr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      <ShoppingCart size={32} className="mx-auto text-slate-600 mb-2 opacity-50" />
                      Nenhum item adicionado ainda.<br />
                      Toque nos produtos para montar o pedido.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                      >
                        <div className="truncate flex-1 pr-2">
                          <div className="font-bold text-white truncate">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-orange-400 font-semibold">
                            R$ {(item.product.sellPrice * item.quantity).toFixed(2)}{' '}
                            <span className="text-slate-500 font-normal">
                              ({item.quantity}x R$ {item.product.sellPrice.toFixed(2)})
                            </span>
                          </div>
                        </div>

                        {/* Controles de Quantidade */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center font-black text-white text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-400 flex items-center justify-center ml-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal e Total */}
                <div className="pt-4 mt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Itens no pedido:</span>
                    <span className="font-bold text-white">{cartItemCount} un</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white">Total a Pagar:</span>
                    <span className="text-2xl font-black text-orange-400">
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação de Pagamento */}
                <div className="pt-4 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Forma de Pagamento:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={cart.length === 0}
                      onClick={() => handleInitiateCheckout('Pix')}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-black text-xs transition-all shadow-md active:scale-95"
                    >
                      <QrCode size={15} />
                      PIX
                    </button>

                    <button
                      disabled={cart.length === 0}
                      onClick={() => handleInitiateCheckout('Dinheiro')}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-black text-xs transition-all shadow-md active:scale-95"
                    >
                      <Banknote size={15} />
                      Dinheiro
                    </button>

                    <button
                      disabled={cart.length === 0}
                      onClick={() => handleInitiateCheckout('Crédito')}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-black text-xs transition-all shadow-md active:scale-95"
                    >
                      <CreditCard size={15} />
                      Cartão
                    </button>

                    <button
                      disabled={cart.length === 0}
                      onClick={() => handleInitiateCheckout('Pendência')}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white font-black text-xs transition-all shadow-md active:scale-95"
                    >
                      <Receipt size={15} />
                      Comanda (Fiado)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 2: COMANDAS & FECHAMENTO POR PESSOA
           ========================================================================= */}
        {activeTab === 'comandas' && (
          <div className="space-y-6">
            {/* Header com Totais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-[#0c1424] border border-purple-500/30">
                <span className="text-[11px] font-bold text-purple-300 uppercase">
                  Total de Comandas em Aberto
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  R$ {totalDebtsAmount.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Saldo a receber no evento</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0c1424] border border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Pessoas com Pendência
                </span>
                <div className="text-2xl sm:text-3xl font-black text-orange-400 mt-1">
                  {debtorsList.length}
                </div>
                <p className="text-xs text-slate-400 mt-1">Participantes com consumo pendente</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0c1424] border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Evento Atual
                  </span>
                  <div className="text-sm font-black text-white mt-1 truncate">
                    {activeEvent.name}
                  </div>
                </div>
                <button
                  onClick={handleShareClosing}
                  className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors"
                >
                  <Share2 size={13} />
                  Copiar Balancete p/ WhatsApp
                </button>
              </div>
            </div>

            {/* Lista de Pessoas com Comanda Aberta */}
            {debtorsList.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-white/[0.02] border border-white/5">
                <Check size={48} className="mx-auto text-emerald-400 mb-3" />
                <h3 className="text-lg font-black text-white">Nenhuma comanda pendente!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Todas as vendas deste evento foram quitadas integralmente.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {debtorsList.map(debtor => {
                  const personObj = people.find(p => p.id === debtor.personId);
                  return (
                    <div
                      key={debtor.personId}
                      className="p-5 rounded-2xl bg-[#0d1424] border border-white/10 flex flex-col justify-between space-y-4 shadow-xl"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center">
                              {debtor.personName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">
                                {debtor.personName}
                              </h4>
                              <span className="text-[11px] text-slate-400">
                                {debtor.sales.length} compra(s) pendente(s)
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-black text-rose-400">
                              R$ {debtor.totalDebt.toFixed(2)}
                            </div>
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full">
                              Em Aberto
                            </span>
                          </div>
                        </div>

                        {/* Extrato resumido dos itens consumidos */}
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {debtor.sales.map((sale, sIdx) => (
                            <div
                              key={sale.id || sIdx}
                              className="flex items-center justify-between text-xs text-slate-300 bg-white/5 p-2 rounded-lg"
                            >
                              <div className="truncate pr-2">
                                <span className="text-[10px] text-slate-500 mr-1.5">
                                  {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="font-medium">
                                  {sale.items?.map(i => `${i.quantity}x ${i.productName}`).join(', ') || 'Produtos'}
                                </span>
                              </div>
                              <span className="font-bold text-white shrink-0">
                                R$ {sale.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botão de Quitar Tudo */}
                      <button
                        onClick={() =>
                          setDebtSettleModal({
                            isOpen: true,
                            person: personObj || {
                              id: debtor.personId,
                              name: debtor.personName,
                              amountPaid: 0,
                              totalPrice: 0,
                              ageGroup: 'Adulto',
                              personType: 'Membro',
                              teamId: 'none',
                              paymentStatus: 'PENDENTE'
                            },
                            totalDebt: debtor.totalDebt,
                            method: 'Pix'
                          })
                        }
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Check size={14} />
                        Quitar Comanda Total (R$ {debtor.totalDebt.toFixed(2)})
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ABA 3: GESTÃO DE ESTOQUE & CARDÁPIO
           ========================================================================= */}
        {activeTab === 'estoque' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white">Cardápio & Estoque da Cantina</h3>
                <p className="text-xs text-slate-400">
                  Gerencie preços de custo, venda, reposição e margem de lucro
                </p>
              </div>

              <button
                onClick={() => setNewProductModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                <Plus size={15} />
                Cadastrar Novo Produto
              </button>
            </div>

            {/* Grid dos Produtos no Cardápio */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => {
                const profit = p.sellPrice - p.costPrice;
                const margin = p.sellPrice > 0 ? ((profit / p.sellPrice) * 100).toFixed(0) : '0';
                const isLowStock = p.stock <= (p.minStock || 5);

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-[#0d1424] border border-white/10 flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-orange-400 uppercase">
                            {p.category}
                          </span>
                          <h4 className="font-bold text-white text-base mt-0.5">{p.name}</h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.stock <= 0
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isLowStock
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {p.stock <= 0 ? 'Sem Estoque' : `${p.stock} un em estoque`}
                        </span>
                      </div>

                      {/* Dados Financeiros do Produto */}
                      <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400">Custo</span>
                          <div className="text-xs font-bold text-slate-300">
                            R$ {p.costPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">Venda</span>
                          <div className="text-xs font-black text-white">
                            R$ {p.sellPrice.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400">Margem</span>
                          <div className="text-xs font-bold text-emerald-400">
                            +{margin}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ações Rápidas de Reposição */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-semibold">Repor:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={async () => {
                            await updateProductApi(p.id, { stock: p.stock + 5 });
                            await loadData();
                            showToast(`+5 unidades adicionadas a ${p.name}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-colors"
                        >
                          +5
                        </button>
                        <button
                          onClick={async () => {
                            await updateProductApi(p.id, { stock: p.stock + 10 });
                            await loadData();
                            showToast(`+10 unidades adicionadas a ${p.name}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-colors"
                        >
                          +10
                        </button>
                        <button
                          onClick={async () => {
                            await updateProductApi(p.id, { stock: p.stock + 25 });
                            await loadData();
                            showToast(`+25 unidades adicionadas a ${p.name}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-xs font-bold transition-colors"
                        >
                          +25
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: FECHAMENTO DO CAIXA & HISTÓRICO
           ========================================================================= */}
        {activeTab === 'fechamento' && (
          <div className="space-y-6">
            {/* Top Cards com Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#0c1424] border border-emerald-500/30">
                <span className="text-[11px] font-bold text-emerald-300 uppercase">
                  Faturamento Bruto
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  R$ {closingMetrics.totalGross.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {closingMetrics.totalSalesCount} pedidos pagos no evento
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0c1424] border border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Custo das Mercadorias (CMV)
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-300 mt-1">
                  R$ {closingMetrics.totalCost.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Custo unitário reposto</p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-[#0c1424] border border-cyan-500/30">
                <span className="text-[11px] font-bold text-cyan-300 uppercase">
                  Lucro Líquido Realizado
                </span>
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
                  R$ {closingMetrics.netProfit.toFixed(2)}
                </div>
                <p className="text-xs text-cyan-300/80 mt-1">
                  Margem de {closingMetrics.marginPercent}% de lucro
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-[#0c1424] border border-purple-500/30">
                <span className="text-[11px] font-bold text-purple-300 uppercase">
                  Comandas a Receber
                </span>
                <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">
                  R$ {closingMetrics.pendingTotal.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {closingMetrics.pendingCount} pessoas com fiado
                </p>
              </div>
            </div>

            {/* Divisão por Métodos de Pagamento & Ações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Formas de Pagamento */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="font-black text-sm text-white flex items-center gap-2">
                    <Wallet size={16} className="text-orange-400" />
                    Entradas por Forma de Pagamento
                  </h4>
                  <button
                    onClick={handleShareClosing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-xs font-bold transition-colors"
                  >
                    <Share2 size={13} />
                    Exportar WhatsApp
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2.5">
                      <QrCode size={18} className="text-emerald-400" />
                      <span className="text-xs font-bold text-white">PIX</span>
                    </div>
                    <span className="text-sm font-black text-white">
                      R$ {closingMetrics.byMethod.Pix.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2.5">
                      <Banknote size={18} className="text-amber-400" />
                      <span className="text-xs font-bold text-white">Dinheiro em Espécie</span>
                    </div>
                    <span className="text-sm font-black text-white">
                      R$ {closingMetrics.byMethod.Dinheiro.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} className="text-blue-400" />
                      <span className="text-xs font-bold text-white">Cartão de Crédito</span>
                    </div>
                    <span className="text-sm font-black text-white">
                      R$ {closingMetrics.byMethod.Crédito.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} className="text-cyan-400" />
                      <span className="text-xs font-bold text-white">Cartão de Débito</span>
                    </div>
                    <span className="text-sm font-black text-white">
                      R$ {closingMetrics.byMethod.Débito.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações do Evento */}
              <div className="p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-sm text-white mb-2">Evento Selecionado</h4>
                  <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-200">
                    <div className="font-black text-sm">{activeEvent.name}</div>
                    <div className="text-xs text-orange-300/80 mt-0.5">{activeEvent.category}</div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    Os fechamentos de caixa são consolidados automaticamente e refletem na tesouraria geral da igreja (Painel de Gestão e Financeiro).
                  </p>
                </div>

                <button
                  onClick={() => navigate('/financeiro')}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors"
                >
                  Ver no Livro Caixa Geral
                </button>
              </div>
            </div>

            {/* Extrato das Últimas Vendas */}
            <div className="p-6 rounded-3xl bg-[#0d1424] border border-white/10 space-y-4">
              <h4 className="font-black text-sm text-white">Últimas Vendas Realizadas</h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="pb-3 font-semibold">Horário</th>
                      <th className="pb-3 font-semibold">Cliente</th>
                      <th className="pb-3 font-semibold">Itens</th>
                      <th className="pb-3 font-semibold">Método</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {eventSales.slice(0, 15).map(sale => (
                      <tr key={sale.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 text-slate-400 whitespace-nowrap">
                          {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 font-bold text-white whitespace-nowrap">
                          {sale.personName || 'Avulso / Balcão'}
                        </td>
                        <td className="py-3 text-slate-300 max-w-xs truncate">
                          {sale.items?.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="py-3 text-slate-300 whitespace-nowrap">
                          {sale.paymentMethod}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sale.status === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {sale.status === 'PAID' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 font-black text-white text-right whitespace-nowrap">
                          R$ {sale.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAIS AUXILIARES (PAGAMENTO, NOVO PRODUTO, QUITAR COMANDA, NOVO EVENTO)
         ========================================================================= */}

      {/* Modal 1: Pagamento / Finalização de Venda */}
      {checkoutModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                <Receipt size={18} className="text-orange-400" />
                Confirmar Venda: {checkoutModal.method}
              </h3>
              <button
                onClick={() => setCheckoutModal({ isOpen: false, method: 'Pix' })}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total do Pedido:</span>
                  <div className="text-2xl font-black text-orange-400">
                    R$ {cartTotal.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Cliente:</span>
                  <div className="text-xs font-bold text-white">
                    {selectedPerson?.name || 'Venda Avulsa'}
                  </div>
                </div>
              </div>

              {/* Detalhe se for Dinheiro (Cálculo de Troco) */}
              {checkoutModal.method === 'Dinheiro' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Valor Recebido em Dinheiro (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashGiven}
                    onChange={e => setCashGiven(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/15 text-white font-black text-lg focus:outline-none focus:border-amber-400"
                  />
                  {parseFloat(cashGiven) >= cartTotal && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-between">
                      <span>Troco a devolver:</span>
                      <span className="text-base font-black">
                        R$ {(parseFloat(cashGiven) - cartTotal).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Detalhe se for Pix */}
              {checkoutModal.method === 'Pix' && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                  <QrCode size={48} className="mx-auto text-emerald-400" />
                  <p className="text-xs font-bold text-white">Chave Pix da Igreja:</p>
                  <code className="text-xs font-mono text-cyan-300 bg-black/40 px-3 py-1 rounded-lg">
                    pix@igrejamanancial.com.br
                  </code>
                </div>
              )}

              {/* Detalhe se for Pendência */}
              {(checkoutModal.method === 'Pendência' || checkoutModal.method === 'Pendencia') && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle size={15} />
                    Comanda Nominal
                  </div>
                  <p className="leading-relaxed">
                    O valor de R$ {cartTotal.toFixed(2)} será registrado como saldo devedor na ficha de{' '}
                    <strong>{selectedPerson?.name}</strong> para quitação futura.
                  </p>
                </div>
              )}

              <button
                disabled={isProcessingSale}
                onClick={handleConfirmCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessingSale ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <Check size={18} />
                    Confirmar e Finalizar Venda
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Quitar Comanda Total */}
      {debtSettleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                <Check size={18} className="text-emerald-400" />
                Quitar Comanda
              </h3>
              <button
                onClick={() => setDebtSettleModal({ isOpen: false, person: null, totalDebt: 0, method: 'Pix' })}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-slate-400">Participante:</span>
                <div className="text-base font-black text-white">
                  {debtSettleModal.person?.name}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total a Quitar:</span>
                  <span className="text-xl font-black text-emerald-400">
                    R$ {debtSettleModal.totalDebt.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Forma de Pagamento Recebida:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pix', 'Dinheiro', 'Crédito'] as PaymentMethod[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDebtSettleModal(prev => ({ ...prev, method: m }))}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        debtSettleModal.method === m
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSettleAllDebts}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Confirmar Recebimento e Dar Baixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Novo Produto */}
      {newProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                <Plus size={18} className="text-orange-400" />
                Cadastrar Novo Produto
              </h3>
              <button
                onClick={() => setNewProductModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Refrigerante Lata, Pastel de Carne, Bolo..."
                  value={newProdData.name}
                  onChange={e => setNewProdData({ ...newProdData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Categoria</label>
                <select
                  value={newProdData.category}
                  onChange={e => setNewProdData({ ...newProdData, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-white text-xs focus:outline-none focus:border-orange-400"
                >
                  <option value="Bebidas">Bebidas</option>
                  <option value="Salgados">Salgados</option>
                  <option value="Doces">Doces</option>
                  <option value="Lanches">Lanches / Combos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newProdData.costPrice}
                    onChange={e => setNewProdData({ ...newProdData, costPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newProdData.sellPrice}
                    onChange={e => setNewProdData({ ...newProdData, sellPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProdData.stock}
                    onChange={e => setNewProdData({ ...newProdData, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Alerta Estoque Mínimo</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={newProdData.minStock}
                    onChange={e => setNewProdData({ ...newProdData, minStock: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateProduct}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Salvar Produto no Cardápio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Adicionar Novo Evento de Cantina */}
      {newEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e1626] border border-white/15 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-black text-base flex items-center gap-2">
                <Calendar size={18} className="text-orange-400" />
                Novo Evento com Cantina
              </h3>
              <button
                onClick={() => setNewEventModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Evento</label>
                <input
                  type="text"
                  placeholder="Ex: Vigília dos Jovens, Festa das Crianças..."
                  value={newEventName}
                  onChange={e => setNewEventName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-orange-400"
                />
              </div>

              <button
                onClick={() => {
                  if (!newEventName.trim()) return;
                  const newEv: CanteenEvent = {
                    id: `event-${Date.now()}`,
                    name: newEventName.trim(),
                    category: 'Evento Especial'
                  };
                  setEventsList(prev => [...prev, newEv]);
                  setSelectedEventId(newEv.id);
                  setNewEventModal(false);
                  setNewEventName('');
                  showToast(`Evento "${newEv.name}" criado e ativado na Cantina!`);
                }}
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Ativar Cantina para este Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
