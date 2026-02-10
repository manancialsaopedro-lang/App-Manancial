
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, ShoppingBag, Plus, CheckCircle, ArrowRight, X, Calendar, Wallet, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { PaymentMethod, TransactionCategory } from '../../types';

export const OrgRevenueDetail = () => {
  const navigate = useNavigate();
  const { people, transactions, addTransaction, removeTransaction, sales } = useAppStore();

  // --- WIZARD STATE ---
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'OUTROS' as TransactionCategory,
    description: '',
    amount: '',
    method: 'Pix' as PaymentMethod,
  });

  // --- DATA AGGREGATION ---
  
  // 1. Inscriptions Revenue
  const inscriptionRevenue = people.reduce((acc, p) => acc + p.amountPaid, 0);

  // 2. Canteen Revenue (Realized)
  const canteenRevenue = transactions
    .filter(t => t.category === 'CANTINA' && t.type === 'ENTRADA')
    .reduce((acc, t) => acc + t.amount, 0);

  // 3. Other Manual Revenue
  const otherRevenueTransactions = transactions.filter(t => t.category === 'OUTROS' && t.type === 'ENTRADA');
  const otherRevenue = otherRevenueTransactions.reduce((acc, t) => acc + t.amount, 0);

  const totalRevenue = inscriptionRevenue + canteenRevenue + otherRevenue;

  // --- WIZARD LOGIC ---
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleSubmit = () => {
    addTransaction({
      description: formData.description,
      amount: Number(formData.amount),
      type: 'ENTRADA',
      category: formData.category,
      paymentMethod: formData.method,
    });
    setShowWizard(false);
    setStep(1);
    setFormData({ category: 'OUTROS', description: '', amount: '', method: 'Pix' });
  };

  const categories = [
    { id: 'OUTROS', label: 'Receita Extra / Doação', icon: Wallet, desc: 'Ofertas, doações ou entradas diversas.' },
    { id: 'CANTINA', label: 'Ajuste de Cantina', icon: ShoppingBag, desc: 'Entrada manual de venda fora do PDV.' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-20">
       
       {/* Header */}
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/org/analytics')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={24} className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Detalhamento de Receita</h2>
            <p className="text-gray-400 font-medium">Fontes de entrada e fluxo positivo.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Entrada Manual
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-emerald-600 text-white relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
           <div className="relative z-10">
              <span className="font-bold text-emerald-100 uppercase text-xs tracking-widest block mb-2">Receita Total Acumulada</span>
              <span className="text-5xl font-black block">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </div>

        <Card className="p-6 flex flex-col justify-center border-emerald-100 bg-emerald-50/50">
           <span className="text-emerald-600 font-bold uppercase text-xs tracking-widest block mb-2">Inscrições</span>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-emerald-500"><Users size={20} /></div>
              <span className="text-2xl font-black text-gray-900">R$ {inscriptionRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </Card>

        <Card className="p-6 flex flex-col justify-center border-orange-100 bg-orange-50/50">
           <span className="text-orange-600 font-bold uppercase text-xs tracking-widest block mb-2">Cantina</span>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-orange-500"><ShoppingBag size={20} /></div>
              <span className="text-2xl font-black text-gray-900">R$ {canteenRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </Card>
      </div>

      {/* Detailed Table (Manual Entries) */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-gray-100">
            <h3 className="font-black text-xl text-gray-900">Entradas Manuais & Extras</h3>
            <p className="text-gray-400 text-xs mt-1">Lista apenas transações manuais do tipo "Outros" ou ajustes. Inscrições e Vendas são gerenciadas em seus módulos.</p>
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
               {otherRevenueTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                     <td className="px-8 py-4">
                        <div className="font-bold text-gray-900">{t.description}</div>
                        <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()} • {t.paymentMethod}</div>
                     </td>
                     <td className="px-8 py-4">
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600">
                           {t.category}
                        </span>
                     </td>
                     <td className="px-8 py-4 text-right font-black text-emerald-500">R$ {t.amount.toFixed(2)}</td>
                     <td className="px-8 py-4 text-center">
                        <button onClick={() => removeTransaction(t.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                           <Trash2 size={16} />
                        </button>
                     </td>
                  </tr>
               ))}
               {otherRevenueTransactions.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">Nenhuma entrada manual extra registrada.</td></tr>
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
               <div className="bg-emerald-600 p-8 text-white relative">
                  <button onClick={() => setShowWizard(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 text-white/80"><X size={20} /></button>
                  <h3 className="text-2xl font-black mb-2">Nova Receita Manual</h3>
                  <div className="flex items-center gap-2 text-emerald-100 text-sm font-bold">
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-emerald-300 ${step >= 1 ? 'bg-white text-emerald-600' : ''}`}>1</span>
                     <div className="w-8 h-0.5 bg-emerald-400/50" />
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-emerald-300 ${step >= 2 ? 'bg-white text-emerald-600' : ''}`}>2</span>
                     <div className="w-8 h-0.5 bg-emerald-400/50" />
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center border border-emerald-300 ${step >= 3 ? 'bg-white text-emerald-600' : ''}`}>3</span>
                  </div>
               </div>

               <div className="p-8">
                  {/* STEP 1: CATEGORY */}
                  {step === 1 && (
                     <div className="space-y-4 animate-in slide-in-from-right-8">
                        <h4 className="text-lg font-black text-gray-900 mb-4">Fonte da Receita</h4>
                        <div className="grid grid-cols-1 gap-3">
                           {categories.map(cat => (
                              <button
                                 key={cat.id}
                                 onClick={() => { setFormData({...formData, category: cat.id as TransactionCategory}); handleNext(); }}
                                 className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                              >
                                 <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors">
                                    <cat.icon size={24} />
                                 </div>
                                 <div>
                                    <span className="font-bold text-gray-900 block">{cat.label}</span>
                                    <span className="text-xs text-gray-400">{cat.desc}</span>
                                 </div>
                                 <ArrowRight className="ml-auto text-gray-300 group-hover:text-emerald-500" size={20} />
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* STEP 2: DETAILS */}
                  {step === 2 && (
                     <div className="space-y-6 animate-in slide-in-from-right-8">
                        <h4 className="text-lg font-black text-gray-900">Detalhes da Entrada</h4>
                        
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Descrição</label>
                           <input 
                              autoFocus
                              placeholder="Ex: Doação Anônima"
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-emerald-100"
                           />
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
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Valor Recebido</label>
                           <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 focus-within:border-emerald-500 transition-colors">
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
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Método de Entrada</label>
                           <div className="grid grid-cols-2 gap-3">
                              {['Pix', 'Dinheiro', 'Crédito', 'Débito'].map(m => (
                                 <button
                                    key={m}
                                    onClick={() => setFormData({...formData, method: m as PaymentMethod})}
                                    className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${formData.method === m ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300'}`}
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
                              className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-500/20 disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center gap-2"
                           >
                              <CheckCircle size={20} /> Confirmar Entrada
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
