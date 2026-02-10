
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Package, Home, Settings, CheckCircle, ArrowRight, X, DollarSign, Calendar, CreditCard, Trash2, Edit2, Save } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { TransactionCategory, PaymentMethod, Transaction } from '../../types';

export const OrgCostDetail = () => {
  const navigate = useNavigate();
  const { transactions, addTransaction, removeTransaction, updateTransaction, fixedCostRent, updateFixedCostRent } = useAppStore();
  
  // Wizard State (Creation)
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'OUTROS' as TransactionCategory,
    description: '',
    amount: '',
    method: 'Pix' as PaymentMethod,
    date: new Date().toISOString().split('T')[0]
  });

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{description: string, amount: string, date: string}>({ description: '', amount: '', date: '' });

  // Derived Data
  const costTransactions = transactions.filter(t => t.type === 'SAIDA').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalVariableCosts = costTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalCosts = totalVariableCosts + fixedCostRent;

  // Wizard Logic
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleSubmit = () => {
    addTransaction({
      description: formData.description,
      amount: Number(formData.amount),
      type: 'SAIDA',
      category: formData.category,
      paymentMethod: formData.method,
    });
    // Reset
    setShowWizard(false);
    setStep(1);
    setFormData({
      category: 'OUTROS',
      description: '',
      amount: '',
      method: 'Pix',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const categories = [
    { id: 'CANTINA', label: 'Mercadoria / Cantina', icon: Package, desc: 'Reposição de estoque, alimentos, bebidas.' },
    { id: 'ALUGUEL_CHACARA', label: 'Estrutura / Aluguel', icon: Home, desc: 'Manutenção, parcelas do local, taxas.' },
    { id: 'OUTROS', label: 'Operacional / Outros', icon: Settings, desc: 'Materiais, decoração, emergências.' },
  ];

  // --- EDIT LOGIC ---
  const startEditing = (t?: Transaction) => {
    if (t) {
      setEditingId(t.id);
      setEditValues({
        description: t.description,
        amount: t.amount.toString(),
        date: t.date.split('T')[0]
      });
    } else {
      // Editing Fixed Rent (Special Case)
      setEditingId('fixed_rent');
      setEditValues({
        description: 'Aluguel Chácara',
        amount: fixedCostRent.toString(),
        date: '' // Not applicable
      });
    }
  };

  const saveEdit = () => {
    if (editingId === 'fixed_rent') {
      updateFixedCostRent(Number(editValues.amount));
    } else if (editingId) {
      updateTransaction(editingId, {
        description: editValues.description,
        amount: Number(editValues.amount),
        date: new Date(editValues.date).toISOString()
      });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/org/analytics')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={24} className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Detalhamento de Custos</h2>
            <p className="text-gray-400 font-medium">Gestão de saídas e investimentos.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all flex items-center gap-2"
        >
          <TrendingDown size={20} /> Registrar Saída
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-red-500 text-white relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
           <div className="relative z-10">
              <span className="font-bold text-red-100 uppercase text-xs tracking-widest block mb-2">Custo Total Realizado</span>
              <span className="text-5xl font-black block">R$ {totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </div>
        
        <Card className="p-6 flex flex-col justify-center">
           <span className="text-gray-400 font-bold uppercase text-xs tracking-widest block mb-2">Aluguel (Custo Fixo)</span>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Home size={20} /></div>
              <span className="text-2xl font-black text-gray-900">R$ {fixedCostRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </Card>

        <Card className="p-6 flex flex-col justify-center">
           <span className="text-gray-400 font-bold uppercase text-xs tracking-widest block mb-2">Custos Variáveis</span>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-500"><TrendingDown size={20} /></div>
              <span className="text-2xl font-black text-gray-900">R$ {totalVariableCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </Card>
      </div>

      {/* Cost Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-gray-100">
            <h3 className="font-black text-xl text-gray-900">Histórico de Despesas</h3>
         </div>
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400">Descrição</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400">Categoria</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Valor</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Ações</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {/* Fixed Rent Row */}
               <tr className="bg-red-50/20 group">
                  <td className="px-8 py-4">
                     <div className="font-bold text-gray-900">Aluguel Chácara</div>
                     <div className="text-xs text-gray-400">Custo Fixo Automático</div>
                  </td>
                  <td className="px-8 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-500">ALUGUEL_CHACARA</span></td>
                  <td className="px-8 py-4 text-right font-black text-red-500">
                     {editingId === 'fixed_rent' ? (
                       <input 
                         type="number"
                         value={editValues.amount}
                         onChange={e => setEditValues({...editValues, amount: e.target.value})}
                         className="w-24 p-1 text-right border border-red-300 rounded outline-none"
                         autoFocus
                       />
                     ) : (
                       `R$ ${fixedCostRent.toFixed(2)}`
                     )}
                  </td>
                  <td className="px-8 py-4 text-center">
                     {editingId === 'fixed_rent' ? (
                       <div className="flex justify-center gap-2">
                          <button onClick={saveEdit} className="p-2 bg-red-600 text-white rounded hover:bg-red-700"><Save size={14} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                       </div>
                     ) : (
                       <button onClick={() => startEditing()} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Edit2 size={16} />
                       </button>
                     )}
                  </td>
               </tr>

               {costTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                     {editingId === t.id ? (
                        <>
                           <td className="px-8 py-4">
                              <input 
                                value={editValues.description}
                                onChange={e => setEditValues({...editValues, description: e.target.value})}
                                className="w-full p-2 border border-gray-200 rounded text-sm font-bold"
                              />
                              <input 
                                type="date"
                                value={editValues.date}
                                onChange={e => setEditValues({...editValues, date: e.target.value})}
                                className="mt-1 text-xs text-gray-500 border border-gray-200 rounded p-1"
                              />
                           </td>
                           <td className="px-8 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                 t.category === 'CANTINA' ? 'bg-orange-50 text-orange-600' :
                                 t.category === 'ALUGUEL_CHACARA' ? 'bg-blue-50 text-blue-600' :
                                 'bg-gray-100 text-gray-600'
                              }`}>
                                 {t.category}
                              </span>
                           </td>
                           <td className="px-8 py-4 text-right">
                              <input 
                                type="number"
                                value={editValues.amount}
                                onChange={e => setEditValues({...editValues, amount: e.target.value})}
                                className="w-24 p-1 text-right border border-red-300 rounded outline-none font-black text-red-500"
                              />
                           </td>
                           <td className="px-8 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={saveEdit} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Save size={14} /></button>
                                <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                              </div>
                           </td>
                        </>
                     ) : (
                        <>
                           <td className="px-8 py-4">
                              <div className="font-bold text-gray-900">{t.description}</div>
                              <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()} • {t.paymentMethod}</div>
                           </td>
                           <td className="px-8 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                 t.category === 'CANTINA' ? 'bg-orange-50 text-orange-600' :
                                 t.category === 'ALUGUEL_CHACARA' ? 'bg-blue-50 text-blue-600' :
                                 'bg-gray-100 text-gray-600'
                              }`}>
                                 {t.category === 'ALUGUEL_CHACARA' ? 'ESTRUTURA' : t.category}
                              </span>
                           </td>
                           <td className="px-8 py-4 text-right font-black text-red-500">R$ {t.amount.toFixed(2)}</td>
                           <td className="px-8 py-4 text-center">
                              <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => startEditing(t)} className="p-2 text-gray-300 hover:text-blue-500 transition-colors">
                                    <Edit2 size={16} />
                                 </button>
                                 <button onClick={() => removeTransaction(t.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </>
                     )}
                  </tr>
               ))}
               {costTransactions.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">Nenhuma despesa variável registrada.</td></tr>
               )}
            </tbody>
         </table>
      </div>

      {/* WIZARD MODAL */}
      {showWizard && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWizard(false)} />
            
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
               
               {/* Wizard Header */}
               <div className="bg-red-500 p-8 text-white relative">
                  <button onClick={() => setShowWizard(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 text-white/80"><X size={20} /></button>
                  <h3 className="text-2xl font-black mb-2">Registrar Despesa</h3>
                  <div className="flex items-center gap-2 text-red-100 text-sm font-bold">
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-red-300 ${step >= 1 ? 'bg-white text-red-600' : ''}`}>1</span>
                     <div className="w-8 h-0.5 bg-red-400/50" />
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-red-300 ${step >= 2 ? 'bg-white text-red-600' : ''}`}>2</span>
                     <div className="w-8 h-0.5 bg-red-400/50" />
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-red-300 ${step >= 3 ? 'bg-white text-red-600' : ''}`}>3</span>
                  </div>
               </div>

               <div className="p-8">
                  {/* STEP 1: CATEGORY */}
                  {step === 1 && (
                     <div className="space-y-4 animate-in slide-in-from-right-8">
                        <h4 className="text-lg font-black text-gray-900 mb-4">Qual o tipo de custo?</h4>
                        <div className="grid grid-cols-1 gap-3">
                           {categories.map(cat => (
                              <button
                                 key={cat.id}
                                 onClick={() => { setFormData({...formData, category: cat.id as TransactionCategory}); handleNext(); }}
                                 className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                              >
                                 <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 group-hover:bg-red-500 group-hover:text-white flex items-center justify-center transition-colors">
                                    <cat.icon size={24} />
                                 </div>
                                 <div>
                                    <span className="font-bold text-gray-900 block">{cat.label}</span>
                                    <span className="text-xs text-gray-400">{cat.desc}</span>
                                 </div>
                                 <ArrowRight className="ml-auto text-gray-300 group-hover:text-red-500" size={20} />
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* STEP 2: DETAILS */}
                  {step === 2 && (
                     <div className="space-y-6 animate-in slide-in-from-right-8">
                        <h4 className="text-lg font-black text-gray-900">Detalhes da Despesa</h4>
                        
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Descrição</label>
                           <input 
                              autoFocus
                              placeholder="Ex: Compra de Refrigerantes"
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-red-100"
                           />
                        </div>

                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Data do Pagamento</label>
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
                              disabled={!formData.description}
                              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-black transition-colors"
                           >
                              Próximo
                           </button>
                        </div>
                     </div>
                  )}

                  {/* STEP 3: VALUE & CONFIRM */}
                  {step === 3 && (
                     <div className="space-y-6 animate-in slide-in-from-right-8">
                        <h4 className="text-lg font-black text-gray-900">Valor e Pagamento</h4>
                        
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Valor Total</label>
                           <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 focus-within:border-red-500 transition-colors">
                              <span className="text-gray-400 font-bold">R$</span>
                              <input 
                                 type="number"
                                 autoFocus
                                 placeholder="0.00"
                                 value={formData.amount}
                                 onChange={e => setFormData({...formData, amount: e.target.value})}
                                 className="bg-transparent font-black text-2xl text-gray-900 outline-none w-full"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Método de Saída</label>
                           <div className="grid grid-cols-2 gap-3">
                              {['Pix', 'Dinheiro', 'Crédito', 'Débito'].map(m => (
                                 <button
                                    key={m}
                                    onClick={() => setFormData({...formData, method: m as PaymentMethod})}
                                    className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${formData.method === m ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300'}`}
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
                              disabled={!formData.amount || Number(formData.amount) <= 0}
                              className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black shadow-xl shadow-red-500/20 disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center gap-2"
                           >
                              <CheckCircle size={20} /> Confirmar Saída
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
