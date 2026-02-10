
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Package, Plus, Minus, Trash2, Tag, Save, CreditCard, Search, User, ClipboardList, CheckCircle, Wallet, ArrowRight, X, AlertTriangle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { Product, PaymentMethod, Person, Sale } from '../../types';

export const OrgCanteen = () => {
  const navigate = useNavigate();
  const { products, people, sales, addProduct, updateProduct, registerSale, settleSale, settleAllCustomerDebt } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pos' | 'stock' | 'debts'>('pos');
  
  // Estado Carrinho (POS)
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [personSearch, setPersonSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Estado Modal de Confirmação (Review Venda Direta)
  const [reviewModal, setReviewModal] = useState<{ show: boolean, method: PaymentMethod | null }>({ show: false, method: null });

  // Estado Gerenciamento Pendências
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  
  // Estado Modal de Pagamento de Pendência (Configurado em Passos)
  const [paymentModal, setPaymentModal] = useState<{ 
    show: boolean, 
    step: 'SELECT_METHOD' | 'CONFIRM',
    type: 'SINGLE' | 'ALL', 
    saleId?: string, 
    amount: number,
    method?: PaymentMethod 
  }>({ show: false, step: 'SELECT_METHOD', type: 'ALL', amount: 0 });

  // Estado Edição Produto
  const [newProd, setNewProd] = useState<Partial<Product>>({});
  const [showAddProd, setShowAddProd] = useState(false);

  // --- LÓGICA PDV ---
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
    if (method === 'Pendência' && !selectedPerson) {
      alert("Para marcar como pendência, é obrigatório selecionar uma pessoa.");
      return;
    }
    setReviewModal({ show: true, method });
  };

  const confirmCheckout = () => {
    if (!reviewModal.method) return;
    registerSale(cart, reviewModal.method, selectedPerson || undefined);
    
    // Reset
    setCart([]);
    setSelectedPerson(null);
    setPersonSearch("");
    setReviewModal({ show: false, method: null });
  };

  // Filtro de Pessoas para Autocomplete
  const filteredPeople = useMemo(() => {
    if (!personSearch) return [];
    return people
      .filter(p => p.name.toLowerCase().includes(personSearch.toLowerCase()))
      .slice(0, 5); 
  }, [personSearch, people]);

  // --- LÓGICA PENDÊNCIAS ---
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

  const finalizePayment = () => {
    if (!selectedDebtorId || !paymentModal.method) return;

    if (paymentModal.type === 'SINGLE' && paymentModal.saleId) {
      settleSale(paymentModal.saleId, paymentModal.method);
    } else if (paymentModal.type === 'ALL') {
      settleAllCustomerDebt(selectedDebtorId, paymentModal.method);
      setSelectedDebtorId(null); 
    }
    setPaymentModal({ show: false, step: 'SELECT_METHOD', type: 'ALL', amount: 0 });
  };

  // Cálculo de itens para o resumo da confirmação
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

  // --- LÓGICA ESTOQUE ---
  const handleSaveProduct = () => {
    if (newProd.name && newProd.sellPrice) {
      addProduct({
        name: newProd.name,
        sellPrice: Number(newProd.sellPrice),
        costPrice: Number(newProd.costPrice || 0),
        stock: Number(newProd.stock || 0),
        minStock: Number(newProd.minStock || 5),
        category: newProd.category || 'Geral'
      });
      setShowAddProd(false);
      setNewProd({});
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in relative">
      {/* Mobile-Friendly Tabs */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button onClick={() => setActiveTab('pos')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'pos' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <ShoppingCart size={18} /> <span className="hidden md:inline">Vender (PDV)</span><span className="md:hidden">Vender</span>
        </button>
        <button onClick={() => setActiveTab('debts')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'debts' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <ClipboardList size={18} /> <span className="hidden md:inline">Pendências</span><span className="md:hidden">Fiado</span>
          {debtors.length > 0 && <span className="bg-white text-purple-600 px-2 py-0.5 rounded-full text-xs font-bold">{debtors.length}</span>}
        </button>
        <button onClick={() => setActiveTab('stock')} className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'stock' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <Package size={18} /> Estoque
        </button>
      </div>

      {/* --- ABA POS (Venda) --- */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Catálogo */}
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
                   <span className="font-black text-lg text-gray-900">R$ {p.sellPrice.toFixed(2)}</span>
                </div>
                <h4 className="font-bold text-gray-700 leading-tight group-hover:text-orange-600">{p.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{p.category}</p>
              </button>
            ))}
          </div>

          {/* Carrinho */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col h-auto lg:h-[600px] shadow-xl">
             <h3 className="font-black text-xl mb-6 flex items-center gap-2"><ShoppingCart className="text-orange-500" /> Carrinho Atual</h3>
             
             {/* Seleção de Pessoa */}
             <div className="mb-6 relative">
               <div className="flex items-center gap-2 mb-2">
                 <User size={16} className="text-gray-400" />
                 <span className="text-xs font-bold uppercase text-gray-400">Cliente (Opcional para à vista)</span>
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
                      <div className="text-xs text-gray-500">{item.quantity}x R$ {item.product.sellPrice.toFixed(2)}</div>
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
                   <button onClick={() => initiateCheckout('Crédito')} className="py-3 rounded-xl bg-blue-100 text-blue-700 font-black hover:bg-blue-200 transition-colors text-xs">CRÉDITO</button>
                   <button onClick={() => initiateCheckout('Débito')} className="py-3 rounded-xl bg-orange-100 text-orange-700 font-black hover:bg-orange-200 transition-colors text-xs">DÉBITO</button>
                   <button 
                      onClick={() => initiateCheckout('Pendência')} 
                      disabled={!selectedPerson}
                      className="col-span-2 py-3 rounded-xl bg-purple-100 text-purple-700 font-black hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                   >
                      <ClipboardList size={16} /> PENDÊNCIA (FIADO)
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- ABA GERENCIAR PENDÊNCIAS --- */}
      {activeTab === 'debts' && (
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debtors.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400 font-medium">
                 Nenhuma pendência em aberto no momento.
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
                     <span className="text-gray-400 font-bold uppercase text-xs mb-2">Dívida Total Acumulada</span>
                     <span className="text-5xl font-black mb-6">R$ {selectedDebtor.totalDebt.toFixed(2)}</span>
                     <button 
                       onClick={() => openPaymentModal('ALL', undefined, selectedDebtor.totalDebt)}
                       className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2"
                     >
                       <CheckCircle size={18} /> QUITAR TUDO
                     </button>
                  </div>

                  <h3 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2"><ClipboardList size={20} /> Histórico de Compras</h3>
                  <div className="space-y-4">
                     {selectedDebtor.sales.map(sale => (
                       <div key={sale.id} className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                             <div className="text-xs text-gray-400 font-bold">
                                {new Date(sale.date).toLocaleDateString()} às {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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

                          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                             <span className="font-black text-gray-900">Total: R$ {sale.total.toFixed(2)}</span>
                             <button 
                               onClick={() => openPaymentModal('SINGLE', sale)}
                               className="px-4 py-2 bg-white border-2 border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-500 rounded-xl text-xs font-bold transition-all"
                             >
                               Pagar esta compra
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* --- ABA ESTOQUE (AGORA COM EDITOR AVANÇADO) --- */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-end gap-3">
            <button 
               onClick={() => navigate('/org/canteen/stock')} 
               className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
               <Settings size={18} /> Editor de Estoque Completo
            </button>
            <button onClick={() => setShowAddProd(!showAddProd)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Plus size={18} /> Cadastrar Rápido</button>
          </div>

          {showAddProd && (
             <Card className="p-6 bg-blue-50 border-blue-100 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   <input placeholder="Nome do Produto" className="p-3 rounded-lg" onChange={e => setNewProd({...newProd, name: e.target.value})} />
                   <input type="number" placeholder="Preço Custo" className="p-3 rounded-lg" onChange={e => setNewProd({...newProd, costPrice: Number(e.target.value)})} />
                   <input type="number" placeholder="Preço Venda" className="p-3 rounded-lg" onChange={e => setNewProd({...newProd, sellPrice: Number(e.target.value)})} />
                   <input type="number" placeholder="Estoque Inicial" className="p-3 rounded-lg" onChange={e => setNewProd({...newProd, stock: Number(e.target.value)})} />
                   <input placeholder="Categoria" className="p-3 rounded-lg" onChange={e => setNewProd({...newProd, category: e.target.value})} />
                   <button onClick={handleSaveProduct} className="bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"><Save size={18} /> Salvar</button>
                </div>
             </Card>
          )}

          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50">
                   <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Produto</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Estoque</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-right">Venda</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Ajuste Rápido</th>
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
                         <td className="px-8 py-4 text-right text-sm font-black text-gray-900">R$ {p.sellPrice.toFixed(2)}</td>
                         <td className="px-8 py-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                               <button onClick={() => updateProduct(p.id, { stock: p.stock - 1 })} className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center"><Minus size={14} /></button>
                               <button onClick={() => updateProduct(p.id, { stock: p.stock + 1 })} className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center"><Plus size={14} /></button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* MODAL DE REVISÃO DE PEDIDO DIRETO */}
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
                    <span className="text-gray-500 font-bold text-xs uppercase">Método</span>
                    <span className={`font-black uppercase text-xs px-2 py-1 rounded ${reviewModal.method === 'Pendência' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {reviewModal.method}
                    </span>
                 </div>
                 <div>
                    <span className="text-gray-500 font-bold text-xs uppercase block mb-2">Itens</span>
                    {cart.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm mb-1">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span className="font-bold">R$ {(item.quantity * item.product.sellPrice).toFixed(2)}</span>
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

      {/* MODAL DE PAGAMENTO DE DÍVIDA (MULTI-STEP) */}
      {paymentModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPaymentModal({ ...paymentModal, show: false })} />
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm relative z-10 p-8 animate-in zoom-in-95">
              
              {/* PASSO 1: SELECIONAR MÉTODO */}
              {paymentModal.step === 'SELECT_METHOD' && (
                <>
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                     <Wallet className="text-emerald-500" /> Receber Pagamento
                  </h2>
                  
                  <div className="text-center mb-8">
                     <span className="text-gray-400 font-bold uppercase text-xs">Valor a Receber</span>
                     <div className="text-4xl font-black text-emerald-600 my-2">R$ {paymentModal.amount.toFixed(2)}</div>
                     <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        {paymentModal.type === 'ALL' ? 'Quitação Total' : 'Pagamento de Compra Única'}
                     </span>
                  </div>

                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Selecione o Método:</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     {['Pix', 'Dinheiro', 'Crédito', 'Débito'].map(m => (
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

              {/* PASSO 2: CONFIRMAÇÃO DO RECEBIMENTO */}
              {paymentModal.step === 'CONFIRM' && (
                <>
                  <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                     <CheckCircle className="text-emerald-500" /> Confirmar?
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">Verifique os dados antes de lançar no caixa.</p>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
                     <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-500 font-bold text-xs uppercase">Cliente</span>
                        <span className="font-black text-gray-900">{selectedDebtor?.personName}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-500 font-bold text-xs uppercase">Método</span>
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
