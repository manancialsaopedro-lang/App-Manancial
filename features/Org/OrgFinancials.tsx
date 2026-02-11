
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, ArrowRight, User, ArrowLeft, X, CheckCircle, Package, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { TransactionCategory, TransactionType, PaymentMethod, Transaction, Product } from '../../types';
import { listTransactions, createTransaction, deleteTransaction } from '../../lib/api/transactions';
import { listProducts, updateProduct as updateProductApi } from '../../lib/api/products';
import { listPeople } from '../../lib/api/people';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export const OrgFinancials = () => {
  const { transactions, setTransactions, fixedCostRent, people, setPeople, products, setProducts } = useAppStore();
  const navigate = useNavigate();
  
  // --- WIZARD STATE ---
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    type: 'SAIDA' as TransactionType,
    category: 'OUTROS' as TransactionCategory,
    description: '',
    amount: '',
    method: 'Pix' as PaymentMethod,
    date: new Date().toISOString().split('T')[0]
  });

  // --- STOCK ENTRY STATE (Within Wizard) ---
  // Store items to replenish: { productId, qty, costPrice }
  const [stockItems, setStockItems] = useState<{product: Product, quantity: number, cost: number}[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemCost, setItemCost] = useState('');

  const fetchFinancialData = useCallback(async () => {
    try {
      const [transactionsData, productsData, peopleData] = await Promise.all([
        listTransactions(),
        listProducts(),
        listPeople()
      ]);
      setTransactions(transactionsData);
      setProducts(productsData);
      setPeople(peopleData);
    } catch (error) {
      console.error("Erro ao carregar dados do Supabase:", error);
    }
  }, [setPeople, setProducts, setTransactions]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase()
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          fetchFinancialData();
        }
      )
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, [fetchFinancialData]);

  // --- WIZARD LOGIC ---

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const resetWizard = () => {
    setShowWizard(false);
    setStep(1);
    setFormData({
      type: 'SAIDA',
      category: 'OUTROS',
      description: '',
      amount: '',
      method: 'Pix',
      date: new Date().toISOString().split('T')[0]
    });
    setStockItems([]);
    setSelectedProductId('');
  };

  const addItemToStockList = () => {
    if (selectedProductId && itemQty && itemCost) {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        setStockItems([...stockItems, {
          product: prod,
          quantity: Number(itemQty),
          cost: Number(itemCost)
        }]);
        // Reset item inputs
        setSelectedProductId('');
        setItemQty('');
        setItemCost('');
      }
    }
  };

  const removeStockItem = (index: number) => {
    setStockItems(stockItems.filter((_, i) => i !== index));
  };

  const calculateStockTotal = () => {
    return stockItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
  };

  const handleSubmit = async () => {
    // 1. Calculate amount (Manual or Stock Based)
    const finalAmount = (formData.type === 'SAIDA' && formData.category === 'CANTINA' && stockItems.length > 0)
      ? calculateStockTotal()
      : Number(formData.amount);

    if (finalAmount <= 0) return alert("Valor inválido.");

    // 2. Add Transaction
    const description = (formData.type === 'SAIDA' && formData.category === 'CANTINA' && stockItems.length > 0)
      ? `Reposição de Estoque (${stockItems.length} itens)`
      : formData.description;

    try {
      await createTransaction({
        description: description,
        amount: finalAmount,
        type: formData.type,
        category: formData.category,
        paymentMethod: formData.method,
        date: new Date(formData.date).toISOString() // Ensure correct ISO format
      });

      // 3. Update Stock if applicable
      if (formData.type === 'SAIDA' && formData.category === 'CANTINA') {
        await Promise.all(
          stockItems.map(item =>
            updateProductApi(item.product.id, {
              stock: item.product.stock + item.quantity,
              costPrice: item.cost // Update cost price to latest paid price
            })
          )
        );
      }

      await fetchFinancialData();
      resetWizard();
    } catch (error) {
      console.error("Erro ao salvar transaÃ§Ã£o:", error);
      alert("NÃ£o foi possÃ­vel salvar a transaÃ§Ã£o.");
    }
  };

  // --- FINANCIAL CONSOLIDATION LOGIC (Existing) ---
  const totalSubscriptionRevenue = people.reduce((acc, p) => acc + p.amountPaid, 0);
  const validTransactions = transactions.filter(t => t.isSettled !== false);
  const manualEntries = validTransactions.filter(t => t.type === 'ENTRADA').reduce((acc, t) => acc + t.amount, 0);
  const totalExits = validTransactions.filter(t => t.type === 'SAIDA').reduce((acc, t) => acc + t.amount, 0) + fixedCostRent;
  
  const subscriptionTransactions: Transaction[] = people
    .filter(p => p.amountPaid > 0)
    .map(p => ({
      id: `auto-sub-${p.id}`,
      description: `Inscrição: ${p.name}`,
      amount: p.amountPaid,
      type: 'ENTRADA',
      category: 'INSCRICAO',
      date: p.lastPaymentDate || new Date().toISOString(),
      paymentMethod: p.paymentMethod || 'Outro',
      referenceId: p.id,
      isSettled: true
    }));

  const allTransactions = [...transactions, ...subscriptionTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalEntries = manualEntries + totalSubscriptionRevenue;
  const balance = totalEntries - totalExits;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4">
      
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/org/cashier-hub')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft size={24} className="text-gray-500" />
           </button>
           <div>
              <h2 className="text-3xl font-black tracking-tighter">Caixa & Movimentações</h2>
              <p className="text-gray-400 font-medium">Fluxo de caixa consolidado.</p>
           </div>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-3 mb-2 text-emerald-600">
               <ArrowUpCircle size={24} />
               <span className="font-bold uppercase text-xs">Entradas (Inc. Inscrições)</span>
            </div>
            <span className="text-2xl font-black text-emerald-700">R$ {totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
         </Card>
         <Card className="p-6 bg-red-50 border-red-100">
            <div className="flex items-center gap-3 mb-2 text-red-600">
               <ArrowDownCircle size={24} />
               <span className="font-bold uppercase text-xs">Saídas + Aluguel</span>
            </div>
            <span className="text-2xl font-black text-red-700">R$ {totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
         </Card>
         <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center gap-3 mb-2 text-gray-400">
               <span className="font-bold uppercase text-xs">Saldo Atual (Caixa Real)</span>
            </div>
            <span className={`text-3xl font-black ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
         </Card>
      </div>

      {/* WIZARD MODAL */}
      {showWizard && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetWizard} />
            
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
               
               {/* Wizard Header */}
               <div className={`p-8 text-white relative transition-colors duration-500 ${formData.type === 'ENTRADA' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                  <button onClick={resetWizard} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 text-white/80"><X size={20} /></button>
                  <h3 className="text-2xl font-black mb-2">
                     {formData.type === 'ENTRADA' ? 'Registrar Entrada' : 'Registrar Saída'}
                  </h3>
                  <div className="flex items-center gap-2 text-white/60 text-sm font-bold">
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/40 ${step >= 1 ? 'bg-white text-gray-900' : ''}`}>1</span>
                     <div className="w-8 h-0.5 bg-white/20" />
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/40 ${step >= 2 ? 'bg-white text-gray-900' : ''}`}>2</span>
                     <div className="w-8 h-0.5 bg-white/20" />
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/40 ${step >= 3 ? 'bg-white text-gray-900' : ''}`}>3</span>
                  </div>
               </div>

               <div className="p-8">
                  {/* STEP 1: TYPE & CATEGORY */}
                  {step === 1 && (
                     <div className="space-y-6 animate-in slide-in-from-right-8">
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tipo de Movimentação</label>
                           <div className="flex gap-4">
                              <button 
                                 onClick={() => setFormData({...formData, type: 'ENTRADA'})}
                                 className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${formData.type === 'ENTRADA' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400'}`}
                              >
                                 <TrendingUp size={20} /> Entrada
                              </button>
                              <button 
                                 onClick={() => setFormData({...formData, type: 'SAIDA'})}
                                 className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${formData.type === 'SAIDA' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'}`}
                              >
                                 <TrendingDown size={20} /> Saída
                              </button>
                           </div>
                        </div>

                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Categoria</label>
                           <select 
                              value={formData.category} 
                              onChange={e => setFormData({...formData, category: e.target.value as TransactionCategory})}
                              className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100 appearance-none"
                           >
                              <option value="OUTROS">Outros / Operacional</option>
                              {formData.type === 'SAIDA' && <option value="CANTINA">Cantina (Estoque)</option>}
                              {formData.type === 'SAIDA' && <option value="ALUGUEL_CHACARA">Custo Chácara</option>}
                              {formData.type === 'ENTRADA' && <option value="CANTINA">Cantina (Venda Manual)</option>}
                           </select>
                        </div>

                        <button 
                           onClick={handleNext} 
                           className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                        >
                           Próximo <ArrowRight size={18} />
                        </button>
                     </div>
                  )}

                  {/* STEP 2: DETAILS (AND STOCK) */}
                  {step === 2 && (
                     <div className="space-y-6 animate-in slide-in-from-right-8">
                        {/* SPECIAL FLOW: STOCK REPLENISHMENT */}
                        {formData.type === 'SAIDA' && formData.category === 'CANTINA' ? (
                           <div className="space-y-4">
                              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                 <h4 className="font-black text-orange-700 flex items-center gap-2 mb-2"><Package size={18} /> Entrada em Estoque</h4>
                                 <p className="text-xs text-orange-600 mb-4">Adicione itens para atualizar automaticamente o inventário e calcular o custo.</p>
                                 
                                 <div className="flex flex-col gap-2">
                                    <select 
                                       value={selectedProductId}
                                       onChange={e => setSelectedProductId(e.target.value)}
                                       className="p-2 rounded-lg bg-white border border-orange-200 text-sm font-bold outline-none"
                                    >
                                       <option value="">Selecione um Produto...</option>
                                       {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                       <input 
                                          type="number" 
                                          placeholder="Qtd" 
                                          className="w-20 p-2 rounded-lg border border-orange-200 text-sm text-center font-bold" 
                                          value={itemQty} onChange={e => setItemQty(e.target.value)}
                                       />
                                       <input 
                                          type="number" 
                                          placeholder="Custo Un. (R$)" 
                                          className="flex-1 p-2 rounded-lg border border-orange-200 text-sm font-bold" 
                                          value={itemCost} onChange={e => setItemCost(e.target.value)}
                                       />
                                       <button onClick={addItemToStockList} className="bg-orange-500 text-white px-3 rounded-lg font-bold"><Plus size={18} /></button>
                                    </div>
                                 </div>
                              </div>

                              {stockItems.length > 0 && (
                                 <div className="max-h-32 overflow-y-auto space-y-2">
                                    {stockItems.map((item, idx) => (
                                       <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                          <span>{item.quantity}x {item.product.name}</span>
                                          <div className="flex items-center gap-3">
                                             <span className="font-bold">R$ {(item.quantity * item.cost).toFixed(2)}</span>
                                             <button onClick={() => removeStockItem(idx)} className="text-red-400"><Trash2 size={14} /></button>
                                          </div>
                                       </div>
                                    ))}
                                    <div className="text-right font-black text-lg pt-2 border-t border-gray-100">
                                       Total: R$ {calculateStockTotal().toFixed(2)}
                                    </div>
                                 </div>
                              )}
                           </div>
                        ) : (
                           /* STANDARD FLOW */
                           <>
                              <div>
                                 <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Descrição</label>
                                 <input 
                                    autoFocus
                                    placeholder={formData.type === 'ENTRADA' ? "Ex: Oferta Voluntária" : "Ex: Compra de Materiais"}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100"
                                 />
                              </div>
                           </>
                        )}

                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Data</label>
                           <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                              <Calendar size={20} className="text-gray-400" />
                              <input 
                                 type="date"
                                 value={formData.date}
                                 onChange={e => setFormData({...formData, date: e.target.value})}
                                 className="bg-transparent font-bold text-gray-900 outline-none w-full"
                              />
                           </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                           <button onClick={handleBack} className="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-colors">Voltar</button>
                           <button 
                              onClick={handleNext} 
                              disabled={formData.type === 'SAIDA' && formData.category === 'CANTINA' ? stockItems.length === 0 : !formData.description}
                              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-black transition-colors"
                           >
                              Próximo
                           </button>
                        </div>
                     </div>
                  )}

                  {/* STEP 3: AMOUNT & PAYMENT */}
                  {step === 3 && (
                     <div className="space-y-6 animate-in slide-in-from-right-8">
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Valor Total</label>
                           <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 focus-within:border-blue-500 transition-colors">
                              <span className="text-gray-400 font-bold">R$</span>
                              <input 
                                 type="number"
                                 autoFocus
                                 placeholder="0.00"
                                 value={formData.type === 'SAIDA' && formData.category === 'CANTINA' && stockItems.length > 0 ? calculateStockTotal() : formData.amount}
                                 readOnly={formData.type === 'SAIDA' && formData.category === 'CANTINA' && stockItems.length > 0}
                                 onChange={e => setFormData({...formData, amount: e.target.value})}
                                 className="bg-transparent font-black text-3xl text-gray-900 outline-none w-full"
                              />
                           </div>
                           {(formData.type === 'SAIDA' && formData.category === 'CANTINA' && stockItems.length > 0) && (
                              <p className="text-[10px] text-gray-400 mt-1 font-bold">*Calculado automaticamente pelos itens de estoque.</p>
                           )}
                        </div>

                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Método de Pagamento</label>
                           <div className="grid grid-cols-2 gap-3">
                              {['Pix', 'Dinheiro', 'Crédito', 'Débito'].map(m => (
                                 <button
                                    key={m}
                                    onClick={() => setFormData({...formData, method: m as PaymentMethod})}
                                    className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${formData.method === m ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300'}`}
                                 >
                                    {m}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                           <button onClick={handleBack} className="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-colors">Voltar</button>
                           <button 
                              onClick={handleSubmit} 
                              className={`flex-1 py-4 text-white rounded-xl font-black shadow-xl disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center gap-2 ${formData.type === 'ENTRADA' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-red-600 shadow-red-500/20'}`}
                           >
                              <CheckCircle size={20} /> Confirmar
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Data</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Descrição</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Categoria</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Método</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-right">Valor</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Ações</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {allTransactions.map(t => {
                  const isAuto = t.id.startsWith('auto-sub-');
                  const isPending = t.isSettled === false;
                  
                  return (
                    <tr 
                      key={t.id} 
                      onClick={() => !isAuto && navigate(`/org/financials/${t.id}`)}
                      className={`${isAuto ? 'bg-blue-50/20 hover:bg-blue-50/40' : isPending ? 'bg-purple-50/30' : 'hover:bg-gray-50'} cursor-pointer group transition-colors`}
                    >
                       <td className="px-8 py-4 text-xs font-bold text-gray-500">
                          {new Date(t.date).toLocaleDateString()}
                          {isAuto && <span className="block text-[9px] font-normal opacity-50">Automático</span>}
                          {isPending && <span className="block text-[9px] font-black text-purple-500 uppercase">Em Aberto</span>}
                       </td>
                       <td className="px-8 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                          {isAuto && <User size={14} className="text-blue-400" />}
                          {t.description}
                          {t.referenceId && !isAuto && <span className="inline-flex items-center text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Ver Detalhes</span>}
                       </td>
                       <td className="px-8 py-4"><span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">{t.category}</span></td>
                       <td className="px-8 py-4">
                          {t.paymentMethod && (
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                t.paymentMethod === 'Pix' ? 'bg-teal-50 text-teal-600' : 
                                t.paymentMethod === 'Dinheiro' ? 'bg-emerald-50 text-emerald-600' :
                                t.paymentMethod === 'Pendência' ? 'bg-purple-50 text-purple-600' :
                                (t.paymentMethod === 'Crédito' || t.paymentMethod === 'Débito') ? 'bg-blue-50 text-blue-600' : 
                                'bg-gray-50 text-gray-500'
                            }`}>
                               {t.paymentMethod}
                            </span>
                          )}
                       </td>
                       <td className={`px-8 py-4 text-right font-black ${isPending ? 'text-purple-400 opacity-60' : t.type === 'ENTRADA' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {t.type === 'SAIDA' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                       </td>
                       <td className="px-8 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {!isAuto ? (
                            <button onClick={async () => {
                              try {
                                await deleteTransaction(t.id);
                                await fetchFinancialData();
                              } catch (error) {
                                console.error("Erro ao remover transaÃ§Ã£o:", error);
                                alert("NÃ£o foi possÃ­vel remover a transaÃ§Ã£o.");
                              }
                            }} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                          ) : (
                            <span className="text-[9px] text-gray-300 font-bold uppercase">Gerenciado em Inscritos</span>
                          )}
                       </td>
                    </tr>
                  );
               })}
               <tr className="bg-red-50/30">
                  <td className="px-8 py-4 text-xs font-bold text-gray-500">-</td>
                  <td className="px-8 py-4 font-bold text-gray-900">Aluguel Chácara (Custo Fixo)</td>
                  <td className="px-8 py-4"><span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">ALUGUEL_CHACARA</span></td>
                  <td className="px-8 py-4">-</td>
                  <td className="px-8 py-4 text-right font-black text-red-500">- R$ {fixedCostRent.toFixed(2)}</td>
                  <td className="px-8 py-4 text-center text-gray-300 text-xs">Auto</td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
};
