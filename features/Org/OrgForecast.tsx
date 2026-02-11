
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, DollarSign, Calculator, Plus, Trash2, Save, X, Edit2, AlertTriangle, Wallet, CheckSquare, Calendar, ArrowRight, CheckCircle, Info, TrendingDown, Users } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { ProjectionItem, PaymentMethod, TransactionCategory } from '../../types';

export const OrgForecast = () => {
  const navigate = useNavigate();
  const { people, transactions, expenseProjections, addProjectionItem, updateProjectionItem, deleteProjectionItem, updateFixedCostRent, addTransaction } = useAppStore();

  // --- CALCULATIONS ---

  // 1. Revenue Projection (From People List)
  const potentialRevenue = people.reduce((acc, p) => acc + p.totalPrice, 0); // Should be 45 * 432 = 19,440
  const realizedRevenue = people.reduce((acc, p) => acc + p.amountPaid, 0); // Should be ~35 * 432 = 15,120
  const currentPax = people.length;
  const paidPax = people.filter(p => p.amountPaid >= p.totalPrice).length; // Approx 35
  
  // Target Constants (Based on User Input)
  const TARGET_PAX = 60;
  const TARGET_TICKET = 430;
  const TARGET_REVENUE = TARGET_PAX * TARGET_TICKET; // 25.800
  
  const revenueGap = TARGET_REVENUE - potentialRevenue;
  const revenueProgress = Math.min((potentialRevenue / TARGET_REVENUE) * 100, 100);

  // 2. Expense Projection (From New Store Slice)
  const totalProjectedExpenses = expenseProjections.reduce((acc, p) => acc + p.amount, 0); // Should be 24,750
  
  // 3. Projected Result (Based on Current Potential vs Projected Expenses)
  const projectedProfit = potentialRevenue - totalProjectedExpenses;
  const projectedMargin = potentialRevenue > 0 ? (projectedProfit / potentialRevenue) * 100 : 0;

  // 4. Real World Comparison
  const realizedExpenses = transactions.filter(t => t.type === 'SAIDA').reduce((acc, t) => acc + t.amount, 0) + (useAppStore.getState().fixedCostRent || 0);

  // --- UI STATE ---
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', amount: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // --- REVIEW/EXECUTION WIZARD STATE ---
  const [reviewItem, setReviewItem] = useState<ProjectionItem | null>(null);
  const [reviewData, setReviewData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Pix' as PaymentMethod,
    category: 'OUTROS' as TransactionCategory
  });

  // Sync Fixed Rent if Chacara is updated
  useEffect(() => {
    const chacaraProj = expenseProjections.find(p => p.categoryMapping === 'ALUGUEL_CHACARA');
    if (chacaraProj) {
       if (useAppStore.getState().fixedCostRent !== chacaraProj.amount) {
          updateFixedCostRent(chacaraProj.amount);
       }
    }
  }, [expenseProjections, updateFixedCostRent]);

  const handleAddItem = () => {
    if (newItem.label && newItem.amount) {
      addProjectionItem(newItem.label, Number(newItem.amount));
      setNewItem({ label: '', amount: '' });
      setIsAdding(false);
    }
  };

  const startEdit = (item: ProjectionItem) => {
    setEditingId(item.id);
    setEditValue(item.amount.toString());
  };

  const saveEdit = (id: string) => {
    updateProjectionItem(id, { amount: Number(editValue) });
    setEditingId(null);
  };

  // --- EXECUTION LOGIC ---
  
  const initiateReview = (item: ProjectionItem) => {
    setReviewItem(item);
    setReviewData({
      amount: item.amount.toString(),
      description: item.label,
      date: new Date().toISOString().split('T')[0],
      method: 'Pix',
      category: item.categoryMapping || 'OUTROS'
    });
  };

  const confirmExecution = () => {
    if (!reviewItem || !reviewData.amount) return;

    if (reviewData.category === 'ALUGUEL_CHACARA') {
       updateFixedCostRent(Number(reviewData.amount));
       updateProjectionItem(reviewItem.id, { 
         isExecuted: true,
         amount: Number(reviewData.amount) 
       });
    } else {
       addTransaction({
         description: reviewData.description,
         amount: Number(reviewData.amount),
         type: 'SAIDA',
         category: reviewData.category,
         paymentMethod: reviewData.method
       });
   
       updateProjectionItem(reviewItem.id, { 
         isExecuted: true,
         amount: Number(reviewData.amount) 
       });
    }

    setReviewItem(null);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/org/cashier-hub')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
           <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
           <h2 className="text-3xl font-black tracking-tighter">Projeção Financeira</h2>
           <p className="text-gray-400 font-medium">Planejamento orçamentário detalhado.</p>
        </div>
      </div>

      {/* DASHBOARD DE RESULTADO */}
      <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
         
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            
            {/* Column 1: Revenue */}
            <div className="text-center lg:text-left">
               <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 text-emerald-400">
                  <Target size={20} />
                  <span className="font-bold uppercase text-xs tracking-widest">Receita Potencial ({currentPax})</span>
               </div>
               <span className="text-4xl lg:text-5xl font-black block mb-2">R$ {potentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
               <div className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-lg inline-block">
                  <span className="text-emerald-300 font-bold">R$ {realizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> pagos ({paidPax} pessoas)
               </div>
            </div>

            {/* Column 2: Expense */}
            <div className="text-center lg:text-left relative">
               <div className="hidden lg:block absolute left-[-20px] top-1/2 -translate-y-1/2 w-px h-16 bg-white/10" />
               <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 text-red-400">
                  <Calculator size={20} />
                  <span className="font-bold uppercase text-xs tracking-widest">Despesa Projetada</span>
               </div>
               <span className="text-4xl lg:text-5xl font-black block mb-2">R$ {totalProjectedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
               <p className="text-xs text-gray-400">Total previsto na lista abaixo.</p>
            </div>

            {/* Column 3: Result */}
            <div className="bg-white/10 rounded-3xl p-6 border border-white/10 text-center relative backdrop-blur-md">
               <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-gray-300">Resultado Previsto</h3>
               <span className={`text-4xl font-black block ${projectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {projectedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </span>
               <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-black/20 text-xs font-bold">
                  Margem: {projectedMargin.toFixed(1)}%
               </div>
            </div>
         </div>
      </div>

      {/* ANÁLISE DE RECEITA VS META */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="p-6 bg-white border border-gray-100 flex flex-col justify-between h-full">
            <div>
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-gray-900 flex items-center gap-2">
                     <Target size={18} className="text-blue-600" /> Detalhamento da Receita
                  </h4>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-black">Meta vs Real</span>
               </div>
               
               <div className="space-y-4">
                  {/* Progress Bar Info */}
                  <div className="relative pt-2">
                     <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                        <span className="text-emerald-600">Atual: {currentPax} pessoas</span>
                        <span className="text-gray-400">Meta: {TARGET_PAX} pessoas</span>
                     </div>
                     <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden relative">
                        <div 
                           className="h-full rounded-full bg-emerald-500 transition-all duration-1000" 
                           style={{ width: `${revenueProgress}%` }} 
                        />
                     </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                     <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">Projeção Inicial ({TARGET_PAX}x {TARGET_TICKET})</span>
                        <span className="text-sm font-black text-gray-400">R$ {TARGET_REVENUE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-bold uppercase">Projeção Atual ({currentPax}x 432)</span>
                        <span className="text-base font-black text-emerald-600">R$ {potentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs opacity-70">
                        <span className="text-gray-500 font-bold uppercase ml-4">↳ Recebido ({paidPax} pagos)</span>
                        <span className="font-bold text-gray-600">R$ {realizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-xs text-red-500 font-bold uppercase">Déficit sobre Meta</span>
                        <span className="text-base font-black text-red-500">- R$ {revenueGap.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-4 flex items-start gap-2 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
               <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
               <p className="text-xs text-yellow-800 leading-tight">
                  <span className="font-bold">Atenção:</span> O déficit gerado pela diferença de inscritos ({TARGET_PAX - currentPax} a menos) deve ser compensado com ajustes e economia nas despesas variáveis abaixo.
               </p>
            </div>
         </Card>

         <Card className="p-6 bg-blue-50 border-blue-100 flex flex-col justify-center">
            <h4 className="font-black text-blue-900 mb-2 text-lg flex items-center gap-2">
               <CheckSquare size={18} /> Transferência para o Caixa
            </h4>
            <p className="text-sm text-blue-700 leading-relaxed mb-4">
               Utilize o botão <strong className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-600">Revisar</strong> na tabela abaixo para confirmar um valor projetado e lançá-lo oficialmente no caixa como despesa realizada.
            </p>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-gray-400 uppercase block">Despesas Executadas</span>
                  <span className="text-xl font-black text-blue-600">{expenseProjections.filter(e => e.isExecuted).length} <span className="text-xs text-gray-400 font-medium">/ {expenseProjections.length}</span></span>
               </div>
               <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-gray-400 uppercase block">Custo Realizado</span>
                  <span className="text-xl font-black text-blue-600">R$ {realizedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
               </div>
            </div>
         </Card>
      </div>

      {/* TABELA DE PROJEÇÕES EDITÁVEL */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
         <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
               <h3 className="text-xl font-black text-gray-900">Despesas Detalhadas (2026)</h3>
               <p className="text-gray-400 text-xs font-bold mt-1">Edite os valores para simular cenários e equilibrar o orçamento.</p>
            </div>
            <button 
               onClick={() => setIsAdding(true)} 
               className="bg-black text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform"
            >
               <Plus size={16} /> Adicionar Item
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
                  <tr>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider">Descrição</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider text-right">Valor Projetado</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider text-center">Status / Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {expenseProjections.map((item) => (
                     <tr key={item.id} className={`transition-colors group ${item.isExecuted ? 'bg-emerald-50/50' : 'hover:bg-blue-50/30'}`}>
                        <td className="px-8 py-4">
                           <div className="font-bold text-gray-700 flex items-center gap-2">
                              {item.isExecuted && <CheckCircle size={16} className="text-emerald-500" />}
                              {item.label}
                              {item.categoryMapping && <span className="px-2 py-0.5 bg-gray-100 text-[9px] text-gray-400 rounded uppercase tracking-wide">Vinculado</span>}
                           </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                           {editingId === item.id ? (
                              <div className="flex items-center justify-end gap-2">
                                 <span className="text-gray-400 text-xs font-bold">R$</span>
                                 <input 
                                    type="number" 
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-32 p-2 rounded-lg border-2 border-blue-500 outline-none font-black text-right text-gray-900 bg-white"
                                    autoFocus
                                 />
                              </div>
                           ) : (
                              <span className={`font-black text-lg ${item.isExecuted ? 'text-emerald-600' : 'text-gray-900'}`}>R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                           )}
                        </td>
                        <td className="px-8 py-4 text-center">
                           {editingId === item.id ? (
                              <div className="flex justify-center gap-2">
                                 <button onClick={() => saveEdit(item.id)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"><Save size={16} /></button>
                                 <button onClick={() => setEditingId(null)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"><X size={16} /></button>
                              </div>
                           ) : (
                              <div className="flex justify-center items-center gap-2">
                                 {!item.isExecuted ? (
                                    <>
                                       <button 
                                          onClick={() => initiateReview(item)}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs hover:bg-blue-200 transition-colors"
                                          title="Revisar e Importar para o Caixa"
                                       >
                                          <CheckSquare size={14} /> <span className="hidden md:inline">Revisar</span>
                                       </button>
                                       <div className="w-px h-6 bg-gray-200 mx-1" />
                                       <button onClick={() => startEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                                       <button onClick={() => deleteProjectionItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                    </>
                                 ) : (
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
                                       <CheckCircle size={12} /> Lançado
                                    </span>
                                 )}
                              </div>
                           )}
                        </td>
                     </tr>
                  ))}

                  {/* Row for Adding New Item */}
                  {isAdding && (
                     <tr className="bg-blue-50 animate-in fade-in">
                        <td className="px-8 py-4">
                           <input 
                              placeholder="Nome da despesa"
                              value={newItem.label}
                              onChange={(e) => setNewItem({...newItem, label: e.target.value})}
                              className="w-full p-2 bg-white border border-blue-200 rounded-lg outline-none font-bold text-sm focus:ring-2 ring-blue-100"
                              autoFocus
                           />
                        </td>
                        <td className="px-8 py-4 text-right">
                           <input 
                              type="number"
                              placeholder="0.00"
                              value={newItem.amount}
                              onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                              className="w-32 p-2 bg-white border border-blue-200 rounded-lg outline-none font-bold text-sm text-right focus:ring-2 ring-blue-100"
                           />
                        </td>
                        <td className="px-8 py-4 text-center">
                           <div className="flex justify-center gap-2">
                              <button onClick={handleAddItem} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"><Save size={16} /></button>
                              <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"><X size={16} /></button>
                           </div>
                        </td>
                     </tr>
                  )}

                  {/* Totals Row */}
                  <tr className="bg-gray-900 text-white">
                     <td className="px-8 py-6 font-black uppercase tracking-widest text-xs">Total Projetado</td>
                     <td className="px-8 py-6 text-right font-black text-2xl">R$ {totalProjectedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                     <td></td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

      {/* MODAL WIZARD: REVIEW & EXECUTE */}
      {reviewItem && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewItem(null)} />
            
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
               <div className="bg-blue-600 p-8 text-white">
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2"><CheckSquare size={24} /> Revisar & Importar</h3>
                  <p className="text-blue-100 text-sm">Confirme os dados reais para lançar no caixa.</p>
               </div>

               <div className="p-8 space-y-6">
                  
                  {/* Alert if value changed */}
                  {Number(reviewData.amount) !== reviewItem.amount && (
                     <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Valor alterado em relação à projeção original.
                     </div>
                  )}

                  {reviewData.category === 'ALUGUEL_CHACARA' && (
                     <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <Info size={16} />
                        Este item atualiza o Custo Fixo Automático. Não será criada uma transação duplicada.
                     </div>
                  )}

                  <div>
                     <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Descrição (Histórico)</label>
                     <input 
                        value={reviewData.description}
                        onChange={e => setReviewData({...reviewData, description: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Valor Real</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                           <input 
                              type="number"
                              value={reviewData.amount}
                              onChange={e => setReviewData({...reviewData, amount: e.target.value})}
                              className="w-full p-4 pl-10 bg-gray-50 rounded-xl font-black text-gray-900 outline-none focus:ring-2 ring-blue-100"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Data</label>
                        <div className="relative">
                           <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                           <input 
                              type="date"
                              value={reviewData.date}
                              onChange={e => setReviewData({...reviewData, date: e.target.value})}
                              className="w-full p-4 pl-10 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100"
                           />
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Categoria</label>
                     <select 
                        value={reviewData.category}
                        onChange={e => setReviewData({...reviewData, category: e.target.value as TransactionCategory})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100 appearance-none"
                     >
                        <option value="OUTROS">Operacional / Outros</option>
                        <option value="ALUGUEL_CHACARA">Aluguel Chácara</option>
                        <option value="CANTINA">Cantina</option>
                     </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                     <button onClick={() => setReviewItem(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
                     <button onClick={confirmExecution} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <CheckCircle size={20} /> {reviewData.category === 'ALUGUEL_CHACARA' ? 'Atualizar Custo' : 'Lançar no Caixa'}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
