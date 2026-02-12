
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Package, Plus, Minus, Trash2, Search, User, ClipboardList, CheckCircle, Wallet, ArrowRight, X, AlertTriangle, Settings, Pencil } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { Product, PaymentMethod, Person, Sale, SaleItem } from '../../types';
import { listProducts, updateProduct as updateProductApi } from '../../lib/api/products';
import { listPeople } from '../../lib/api/people';
import { listSales, createSale, updateSale, deleteSale } from '../../lib/api/sales';
import { createTransaction } from '../../lib/api/transactions';

export const OrgCanteen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, setProducts, updateProduct, people, setPeople, sales, setSales } = useAppStore();
  const parseTab = (value: string | null): 'pos' | 'stock' | 'debts' => {
    if (value === 'stock' || value === 'debts' || value === 'pos') return value;
    return 'pos';
  };
  const initialTab = (() => {
    const tab = searchParams.get('tab');
    return parseTab(tab);
  })();
  const [activeTab, setActiveTab] = useState<'pos' | 'stock' | 'debts'>(initialTab);
  
  // Estado Carrinho (POS)
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [personSearch, setPersonSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Estado Modal de Confirmacao (Review Venda Direta)
  const [reviewModal, setReviewModal] = useState<{ show: boolean, method: PaymentMethod | null }>({ show: false, method: null });

  // Estado Gerenciamento Pendencias
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  
  // Estado Modal de Pagamento de Pendencia (Configurado em Passos)
  const [paymentModal, setPaymentModal] = useState<{ 
    show: boolean, 
    step: 'SELECT_METHOD' | 'CONFIRM',
    type: 'SINGLE' | 'ALL', 
    saleId?: string, 
    amount: number,
    method?: PaymentMethod 
  }>({ show: false, step: 'SELECT_METHOD', type: 'ALL', amount: 0 });
  const [isDebtActionLoading, setIsDebtActionLoading] = useState(false);
  const [debtFeedback, setDebtFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCanteenData = useCallback(async () => {
    try {
      const [productsData, peopleData, salesData] = await Promise.all([
        listProducts(),
        listPeople(),
        listSales()
      ]);
      setProducts(productsData);
      setPeople(peopleData);
      setSales(salesData);
    } catch (error) {
      console.error("Erro ao carregar dados da cantina:", error);
    }
  }, [setPeople, setProducts, setSales]);

  useEffect(() => {
    fetchCanteenData();
  }, [fetchCanteenData]);

  useEffect(() => {
    const nextTab = parseTab(searchParams.get('tab'));
    setActiveTab(prev => (prev === nextTab ? prev : nextTab));
  }, [searchParams]);

  const changeTab = (tab: 'pos' | 'stock' | 'debts') => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === 'pos') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    setSearchParams(next, { replace: true });
  };

  // --- LOGICA PDV ---
  const addToCart = (p: Product) => {
    if (p.stock <= 0) return alert("Sem estoque!");
    setCart(prev => {
      const exists = prev.find(item => item.product.id === p.id);
      if (exists) {
        if (exists.quantity >= p.stock) return prev;
        return prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const removeFromCart = (pid: string) => {
    setCart(prev => prev.filter(item => item.product.id !== pid));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0);

  const initiateCheckout = (method: PaymentMethod) => {
    if (cart.length === 0) return;
    if (method === 'Pendencia' && !selectedPerson) {
      alert("Para marcar como pendencia, e obrigatorio selecionar uma pessoa.");
      return;
    }
    setReviewModal({ show: true, method });
  };

  const confirmCheckout = async () => {
    if (!reviewModal.method) return;
    const normalizedMethod = reviewModal.method
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const isPending = normalizedMethod === 'pendencia';

    try {
      const items: SaleItem[] = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.sellPrice,
        unitCost: item.product.costPrice
      }));

      const totalCost = items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);

      const newSale = await createSale({
        items,
        total: cartTotal,
        totalCost,
        date: new Date().toISOString(),
        paymentMethod: reviewModal.method,
        personId: selectedPerson?.id,
        personName: selectedPerson?.name,
        status: isPending ? 'PENDING' : 'PAID'
      });

      await Promise.all(
        cart.map(item =>
          updateProductApi(item.product.id, {
            stock: item.product.stock - item.quantity
          })
        )
      );

      if (!isPending) {
        await createTransaction({
          description: selectedPerson ? `Venda Cantina: ${selectedPerson.name}` : `Venda Cantina #${newSale.id.slice(-4)}`,
          amount: cartTotal,
          type: 'ENTRADA',
          category: 'CANTINA',
          date: new Date().toISOString(),
          paymentMethod: reviewModal.method,
          referenceId: newSale.id,
          personId: selectedPerson?.id,
          personName: selectedPerson?.name,
          isSettled: true,
          items
        });
      }

      await fetchCanteenData();

      // Reset
      setCart([]);
      setSelectedPerson(null);
      setPersonSearch("");
      setReviewModal({ show: false, method: null });
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Nao foi possivel registrar a venda. Motivo: ${message}`);
    }
  };

  // Filtro de Pessoas para Autocomplete
  const filteredPeople = useMemo(() => {
    if (!personSearch) return [];
    return people
      .filter(p => p.name.toLowerCase().includes(personSearch.toLowerCase()))
      .slice(0, 5); 
  }, [personSearch, people]);


  // --- LOGICA PENDENCIAS ---
  const debtors = useMemo(() => {
    const map: Record<string, { personName: string, totalDebt: number, sales: Sale[] }> = {};
    
    sales.filter(s => s.status === 'PENDING' && s.personId).forEach(sale => {
      const pid = sale.personId!;
      if (!map[pid]) {
        map[pid] = { personName: sale.personName || 'Desconhecido', totalDebt: 0, sales: [] };
      }
      map[pid].totalDebt += sale.total;
      map[pid].sales.push(sale);
    });

    return Object.entries(map).map(([id, data]) => ({ id, ...data }));
  }, [sales]);

  const selectedDebtor = selectedDebtorId ? debtors.find(d => d.id === selectedDebtorId) : null;

  const restoreStockFromItems = async (items: SaleItem[]) => {
    const quantityByProduct: Record<string, number> = {};
    items.forEach(item => {
      quantityByProduct[item.productId] = (quantityByProduct[item.productId] || 0) + item.quantity;
    });

    await Promise.all(
      Object.entries(quantityByProduct).map(async ([productId, qty]) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        await updateProductApi(productId, { stock: product.stock + qty });
      })
    );
  };

  const openEditDebtModal = async (sale: Sale) => {
    const typedName = window.prompt(
      'Digite o nome da pessoa que deve receber esta pendencia:',
      sale.personName || ''
    );
    if (!typedName) return;

    const normalized = typedName.trim().toLowerCase();
    if (!normalized) return;

    const exact = people.find(p => p.name.trim().toLowerCase() === normalized);
    const partial = people.find(p => p.name.toLowerCase().includes(normalized));
    const target = exact || partial;

    if (!target) {
      setDebtFeedback({ type: 'error', message: 'Pessoa nao encontrada. Tente novamente com um nome valido.' });
      return;
    }

    if (sale.personId === target.id) {
      setDebtFeedback({ type: 'error', message: 'A compra ja esta vinculada a esta pessoa.' });
      return;
    }

    try {
      setIsDebtActionLoading(true);
      setDebtFeedback(null);
      await updateSale(sale.id, {
        personId: target.id,
        personName: target.name
      });
      await fetchCanteenData();
      setDebtFeedback({ type: 'success', message: `Pendencia transferida para ${target.name}.` });
    } catch (error) {
      console.error('Erro ao editar pendencia:', error);
      setDebtFeedback({ type: 'error', message: 'Nao foi possivel editar esta pendencia.' });
    } finally {
      setIsDebtActionLoading(false);
    }
  };

  const deleteSingleDebt = async (sale: Sale) => {
    const confirmed = window.confirm(
      `Excluir a compra pendente de ${sale.personName || 'Cliente'} no valor de R$ ${sale.total.toFixed(2)}? Esta acao vai devolver os itens ao estoque.`
    );
    if (!confirmed) return;

    try {
      setIsDebtActionLoading(true);
      setDebtFeedback(null);
      await restoreStockFromItems(sale.items);
      await deleteSale(sale.id);
      await fetchCanteenData();
      setDebtFeedback({ type: 'success', message: 'Compra pendente excluida com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir compra pendente:', error);
      setDebtFeedback({ type: 'error', message: 'Nao foi possivel excluir esta compra pendente.' });
    } finally {
      setIsDebtActionLoading(false);
    }
  };

  const deleteAllDebtsFromSelectedDebtor = async () => {
    if (!selectedDebtorId || !selectedDebtor) return;

    const confirmed = window.confirm(
      `Excluir TODAS as ${selectedDebtor.sales.length} compras pendentes de ${selectedDebtor.personName}? Esta acao vai devolver os itens ao estoque.`
    );
    if (!confirmed) return;

    try {
      setIsDebtActionLoading(true);
      setDebtFeedback(null);

      const allItems = selectedDebtor.sales.flatMap(sale => sale.items);
      await restoreStockFromItems(allItems);
      await Promise.all(selectedDebtor.sales.map(sale => deleteSale(sale.id)));

      await fetchCanteenData();
      setSelectedDebtorId(null);
      setDebtFeedback({ type: 'success', message: 'Todas as pendencias da pessoa foram excluidas.' });
    } catch (error) {
      console.error('Erro ao excluir pendencias da pessoa:', error);
      setDebtFeedback({ type: 'error', message: 'Nao foi possivel excluir todas as pendencias.' });
    } finally {
      setIsDebtActionLoading(false);
    }
  };

  const openPaymentModal = (type: 'SINGLE' | 'ALL', sale?: Sale, totalAmount?: number) => {
    setPaymentModal({
      show: true,
      step: 'SELECT_METHOD',
      type,
      saleId: sale?.id,
      amount: sale ? sale.total : (totalAmount || 0)
    });
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    setPaymentModal(prev => ({ ...prev, method, step: 'CONFIRM' }));
  };

  const finalizePayment = async () => {
    if (!selectedDebtorId || !paymentModal.method) return;

    try {
      if (paymentModal.type === 'SINGLE' && paymentModal.saleId) {
        const sale = sales.find(s => s.id === paymentModal.saleId);
        if (sale) {
          await updateSale(paymentModal.saleId, { status: 'PAID', paymentMethod: paymentModal.method });
          await createTransaction({
            description: `Recebimento Pendencia: ${sale.personName || 'Cliente'} (Venda #${sale.id.slice(-4)})`,
            amount: sale.total,
            type: 'ENTRADA',
            category: 'CANTINA',
            date: new Date().toISOString(),
            paymentMethod: paymentModal.method,
            referenceId: sale.id,
            personId: sale.personId,
            personName: sale.personName,
            isSettled: true,
            items: sale.items
          });
        }
      } else if (paymentModal.type === 'ALL') {
        const pendingSales = sales.filter(s => s.personId === selectedDebtorId && s.status === 'PENDING');
        if (pendingSales.length > 0) {
          await Promise.all(
            pendingSales.map(sale => updateSale(sale.id, { status: 'PAID', paymentMethod: paymentModal.method }))
          );
          const totalAmount = pendingSales.reduce((acc, s) => acc + s.total, 0);
          const allItems = pendingSales.flatMap(s => s.items);
          const personName = pendingSales[0].personName || 'Cliente';
          await createTransaction({
            description: `Recebimento Pendencia Total: ${personName}`,
            amount: totalAmount,
            type: 'ENTRADA',
            category: 'CANTINA',
            date: new Date().toISOString(),
            paymentMethod: paymentModal.method,
            personId: selectedDebtorId,
            personName,
            isSettled: true,
            items: allItems
          });
        }
        setSelectedDebtorId(null); 
      }

      await fetchCanteenData();
      setPaymentModal({ show: false, step: 'SELECT_METHOD', type: 'ALL', amount: 0 });
      setDebtFeedback({ type: 'success', message: 'Pagamento registrado com sucesso.' });
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      alert("Nao foi possivel registrar o pagamento.");
    }
  };

  // Calculo de itens para o resumo da confirmacao
  const paymentSummaryItems = useMemo(() => {
    if (!selectedDebtor) return [];
    
    let items = [];
    if (paymentModal.type === 'SINGLE' && paymentModal.saleId) {
      const sale = selectedDebtor.sales.find(s => s.id === paymentModal.saleId);
      items = sale ? sale.items : [];
    } else {
      // Aggregate all items
      items = selectedDebtor.sales.flatMap(s => s.items);
    }
    return items;
  }, [paymentModal, selectedDebtor]);

  return (
    <div
      className="space-y-6 animate-in fade-in relative md:pt-0"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
    >
      {/* Mobile-Friendly Tabs */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button onClick={() => changeTab('pos')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'pos' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <ShoppingCart size={18} /> <span className="hidden md:inline">Vender (PDV)</span><span className="md:hidden">Vender</span>
        </button>
        <button onClick={() => changeTab('debts')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'debts' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <ClipboardList size={18} /> <span className="hidden md:inline">Pendencias</span><span className="md:hidden">Fiado</span>
          {debtors.length > 0 && <span className="bg-white text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">{debtors.length}</span>}
        </button>
        <button onClick={() => changeTab('stock')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'stock' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <Package size={18} /> Estoque
        </button>
      </div>

      {/* --- ABA POS (Venda) --- */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Catalogo */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(p => (
              <button 
                key={p.id} 
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all text-left group disabled:opacity-50"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">{p.stock}</div>
                   <span className="font-black text-lg text-gray-900">R$ {Number(p.sellPrice ?? 0).toFixed(2)}</span>
                </div>
                <h4 className="font-bold text-gray-700 leading-tight group-hover:text-orange-600">{p.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{p.category}</p>
              </button>
            ))}
          </div>

          {/* Carrinho */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col h-auto lg:h-[600px] shadow-xl">
             <h3 className="font-black text-xl mb-6 flex items-center gap-2"><ShoppingCart className="text-orange-500" /> Carrinho Atual</h3>
             
             {/* Selecao de Pessoa */}
             <div className="mb-6 relative">
               <div className="flex items-center gap-2 mb-2">
                 <User size={16} className="text-gray-400" />
                 <span className="text-xs font-bold uppercase text-gray-400">Cliente (Opcional para a vista)</span>
               </div>
               
               {!selectedPerson ? (
                 <div className="relative">
                   <input 
                      placeholder="Buscar nome..." 
                      value={personSearch}
                      onChange={e => setPersonSearch(e.target.value)}
                      className="w-full bg-gray-50 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-orange-100"
                   />
                   <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   
                   {personSearch && filteredPeople.length > 0 && (
                     <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-xl mt-2 p-2 border border-gray-100 z-50">
                       {filteredPeople.map(p => (
                         <button 
                           key={p.id} 
                           onClick={() => { setSelectedPerson(p); setPersonSearch(""); }}
                           className="w-full text-left p-3 hover:bg-orange-50 rounded-lg text-sm font-bold text-gray-700 transition-colors"
                         >
                           {p.name}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl border border-orange-100">
                    <span className="font-black text-orange-700">{selectedPerson.name}</span>
                    <button onClick={() => setSelectedPerson(null)} className="text-orange-400 hover:text-orange-600"><Trash2 size={16} /></button>
                 </div>
               )}
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 min-h-[150px]">
                {cart.length === 0 && <p className="text-center text-gray-400 py-10">Carrinho vazio.</p>}
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                    <div>
                      <div className="font-bold text-sm text-gray-800">{item.product.name}</div>
                      <div className="text-xs text-gray-500">{item.quantity}x R$ {Number(item.product.sellPrice ?? 0).toFixed(2)}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                ))}
             </div>
             
             <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-end mb-6">
                   <span className="text-gray-400 font-bold uppercase text-xs">Total a Pagar</span>
                   <span className="text-4xl font-black text-gray-900">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => initiateCheckout('Dinheiro')} className="py-3 rounded-xl bg-emerald-100 text-emerald-700 font-black hover:bg-emerald-200 transition-colors text-xs">DINHEIRO</button>
                   <button onClick={() => initiateCheckout('Pix')} className="py-3 rounded-xl bg-gray-900 text-white font-black hover:bg-black transition-colors text-xs">PIX</button>
                   <button onClick={() => initiateCheckout('Credito')} className="py-3 rounded-xl bg-blue-100 text-blue-700 font-black hover:bg-blue-200 transition-colors text-xs">CREDITO</button>
                   <button onClick={() => initiateCheckout('Debito')} className="py-3 rounded-xl bg-orange-100 text-orange-700 font-black hover:bg-orange-200 transition-colors text-xs">DEBITO</button>
                   <button 
                      onClick={() => initiateCheckout('Pendencia')} 
                      disabled={!selectedPerson}
                      className="col-span-2 py-3 rounded-xl bg-purple-100 text-purple-700 font-black hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                   >
                      <ClipboardList size={16} /> PENDENCIA (FIADO)
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- ABA GERENCIAR PENDENCIAS --- */}
      {activeTab === 'debts' && (
        <div className="relative">
          {debtFeedback && (
            <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${debtFeedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {debtFeedback.message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debtors.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400 font-medium">
                 Nenhuma pendencia em aberto no momento.
              </div>
            )}
            {debtors.map(debtor => (
              <Card 
                key={debtor.id} 
                onClick={() => setSelectedDebtorId(debtor.id)}
                className="p-6 border-purple-100 bg-white relative overflow-hidden group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                 <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />
                 
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                         <User size={24} />
                      </div>
                      <div>
                         <h3 className="font-black text-lg text-gray-900">{debtor.personName}</h3>
                         <p className="text-xs text-gray-400 font-bold uppercase">{debtor.sales.length} compras pendentes</p>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-gray-400">Total Devido</span>
                      <div className="text-2xl font-black text-purple-600">R$ {debtor.totalDebt.toFixed(2)}</div>
                   </div>
                   <div className="mt-4 text-xs text-purple-400 font-bold flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                      Ver detalhes e pagar <ArrowRight size={12} />
                   </div>
                 </div>
              </Card>
            ))}
          </div>

          {/* PAINEL DETALHES DEVEDOR (Overlay) */}
          {selectedDebtor && (
            <div className="fixed inset-0 z-40 flex justify-end">
               <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedDebtorId(null)} />
               <div className="relative bg-white w-full max-w-md h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right">
                  <button onClick={() => setSelectedDebtorId(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400"><X size={20} /></button>
                  
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center"><User size={32} /></div>
                     <div>
                        <h2 className="text-2xl font-black text-gray-900">{selectedDebtor.personName}</h2>
                        <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-lg text-xs">Devedor</span>
                     </div>
                  </div>

                  <div className="mb-8 p-6 bg-gray-900 text-white rounded-[2rem] flex flex-col items-center text-center">
                     <span className="text-gray-400 font-bold uppercase text-xs mb-2">Divida Total Acumulada</span>
                     <span className="text-5xl font-black mb-6">R$ {selectedDebtor.totalDebt.toFixed(2)}</span>
                     <button 
                       onClick={() => openPaymentModal('ALL', undefined, selectedDebtor.totalDebt)}
                       className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2"
                     >
                       <CheckCircle size={18} /> QUITAR TUDO
                     </button>
                     <button 
                       onClick={deleteAllDebtsFromSelectedDebtor}
                       className="w-full mt-3 py-4 bg-red-500 hover:bg-red-400 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                       disabled={isDebtActionLoading}
                     >
                       <Trash2 size={18} /> EXCLUIR TUDO
                     </button>
                  </div>

                  <h3 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2"><ClipboardList size={20} /> Historico de Compras</h3>
                  <div className="space-y-4">
                     {selectedDebtor.sales.map(sale => (
                       <div key={sale.id} className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                             <div className="text-xs text-gray-400 font-bold">
                                {new Date(sale.date).toLocaleDateString()} as {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </div>
                             <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Pendente</span>
                          </div>
                          
                          <div className="space-y-1 mb-4">
                             {sale.items.map((item, idx) => (
                               <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                                  <span className="font-bold text-gray-900">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                               </div>
                             ))}
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
                             <span className="font-black text-gray-900">Total: R$ {sale.total.toFixed(2)}</span>
                             <div className="grid grid-cols-3 gap-2">
                               <button
                                 onClick={() => openEditDebtModal(sale)}
                                 className="px-2 py-2 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-60"
                                 disabled={isDebtActionLoading}
                               >
                                 <Pencil size={13} /> Editar
                               </button>
                               <button
                                 onClick={() => deleteSingleDebt(sale)}
                                 className="px-2 py-2 bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 rounded-xl text-[11px] font-bold transition-all disabled:opacity-60"
                                 disabled={isDebtActionLoading}
                               >
                                 Excluir
                               </button>
                               <button 
                                 onClick={() => openPaymentModal('SINGLE', sale)}
                                 className="px-2 py-2 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-600 rounded-xl text-[11px] font-bold transition-all disabled:opacity-60"
                                 disabled={isDebtActionLoading}
                               >
                                 Pagar
                               </button>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* --- ABA ESTOQUE (AGORA COM EDITOR AVANCADO) --- */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-end gap-3">
            <button 
               onClick={() => navigate('/org/canteen/stock')} 
               className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
               <Settings size={18} /> Editor de Estoque Completo
            </button>
            <button onClick={() => navigate('/org/canteen/stock/new')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Plus size={18} /> Cadastrar Rapido</button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50">
                   <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Produto</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Estoque</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-right">Venda</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Ajuste Rapido</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                         <td className="px-8 py-4 font-bold text-gray-900">
                            {p.name}
                            <div className="text-[10px] text-gray-400 font-normal uppercase">{p.category}</div>
                         </td>
                         <td className="px-8 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock < p.minStock ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                               {p.stock} un
                            </span>
                         </td>
                         <td className="px-8 py-4 text-right text-sm font-black text-gray-900">R$ {Number(p.sellPrice ?? 0).toFixed(2)}</td>
                         <td className="px-8 py-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                               <button onClick={async () => {
                                 updateProduct(p.id, { stock: p.stock - 1 });
                                 await updateProductApi(p.id, { stock: p.stock - 1 });
                                 await fetchCanteenData();
                               }} className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center"><Minus size={14} /></button>
                               <button onClick={async () => {
                                 updateProduct(p.id, { stock: p.stock + 1 });
                                 await updateProductApi(p.id, { stock: p.stock + 1 });
                                 await fetchCanteenData();
                               }} className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center"><Plus size={14} /></button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* MODAL DE REVISAO DE PEDIDO DIRETO */}
      {reviewModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReviewModal({ show: false, method: null })} />
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 p-8 animate-in zoom-in-95">
              <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="text-orange-500" /> Confirmar Venda?
              </h2>
              <p className="text-gray-500 mb-6">Revise os detalhes antes de registrar.</p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-4">
                 <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold text-xs uppercase">Cliente</span>
                    <span className="font-black text-gray-900">{selectedPerson ? selectedPerson.name : 'Venda Avulsa'}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold text-xs uppercase">Metodo</span>
                    <span className={`font-black uppercase text-xs px-2 py-1 rounded ${reviewModal.method === 'Pendencia' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {reviewModal.method}
                    </span>
                 </div>
                 <div>
                    <span className="text-gray-500 font-bold text-xs uppercase block mb-2">Itens</span>
                    {cart.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm mb-1">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span className="font-bold">R$ {(item.quantity * Number(item.product.sellPrice ?? 0)).toFixed(2)}</span>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-black uppercase">Total Final</span>
                    <span className="text-2xl font-black text-gray-900">R$ {cartTotal.toFixed(2)}</span>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setReviewModal({ show: false, method: null })} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors">Cancelar</button>
                 <button onClick={confirmCheckout} className="flex-1 py-4 bg-black text-white rounded-xl font-black hover:scale-105 transition-transform">CONFIRMAR</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DE PAGAMENTO DE DIVIDA (MULTI-STEP) */}
      {paymentModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPaymentModal({ ...paymentModal, show: false })} />
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm relative z-10 p-8 animate-in zoom-in-95">
              
              {/* PASSO 1: SELECIONAR METODO */}
              {paymentModal.step === 'SELECT_METHOD' && (
                <>
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                     <Wallet className="text-emerald-500" /> Receber Pagamento
                  </h2>
                  
                  <div className="text-center mb-8">
                     <span className="text-gray-400 font-bold uppercase text-xs">Valor a Receber</span>
                     <div className="text-4xl font-black text-emerald-600 my-2">R$ {paymentModal.amount.toFixed(2)}</div>
                     <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        {paymentModal.type === 'ALL' ? 'Quitacao Total' : 'Pagamento de Compra Unica'}
                     </span>
                  </div>

                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Selecione o Metodo:</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     {['Pix', 'Dinheiro', 'Credito', 'Debito'].map(m => (
                       <button 
                         key={m}
                         onClick={() => selectPaymentMethod(m as PaymentMethod)}
                         className="py-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-transparent rounded-xl font-bold text-sm transition-all"
                       >
                         {m}
                       </button>
                     ))}
                  </div>
                  
                  <button onClick={() => setPaymentModal({ ...paymentModal, show: false })} className="w-full py-3 text-gray-400 font-bold hover:text-gray-600">Cancelar</button>
                </>
              )}

              {/* PASSO 2: CONFIRMACAO DO RECEBIMENTO */}
              {paymentModal.step === 'CONFIRM' && (
                <>
                  <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                     <CheckCircle className="text-emerald-500" /> Confirmar?
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">Verifique os dados antes de lancar no caixa.</p>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
                     <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-500 font-bold text-xs uppercase">Cliente</span>
                        <span className="font-black text-gray-900">{selectedDebtor?.personName}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-500 font-bold text-xs uppercase">Metodo</span>
                        <span className="font-black text-gray-900 uppercase">{paymentModal.method}</span>
                     </div>
                     
                     {/* Resumo de Itens */}
                     <div className="max-h-32 overflow-y-auto custom-scrollbar">
                       <span className="text-gray-500 font-bold text-xs uppercase block mb-1">Itens a Quitar</span>
                       <div className="space-y-1">
                         {paymentSummaryItems.map((item, idx) => (
                           <div key={idx} className="flex justify-between text-xs">
                             <span className="text-gray-600 truncate pr-2">{item.quantity}x {item.productName}</span>
                             <span className="font-bold">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                           </div>
                         ))}
                       </div>
                     </div>

                     <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-gray-900 font-black uppercase">Valor Total</span>
                        <span className="text-2xl font-black text-emerald-600">R$ {paymentModal.amount.toFixed(2)}</span>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <button 
                       onClick={() => setPaymentModal({ ...paymentModal, step: 'SELECT_METHOD', method: undefined })} 
                       className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors text-xs"
                     >
                       Voltar
                     </button>
                     <button 
                       onClick={finalizePayment} 
                       className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all text-xs"
                     >
                       CONFIRMAR
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
