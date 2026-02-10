
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, ShoppingBag, ArrowRight, X, Clock, CreditCard, AlertCircle, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { Sale, PaymentMethod } from '../../types';

export const OrgPurchaseHistory = () => {
  const navigate = useNavigate();
  const { sales, people } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // --- DATA AGGREGATION ---
  const historyData = useMemo(() => {
    const map: Record<string, { 
      id: string;
      name: string; 
      totalSpent: number;
      totalPending: number;
      lastPurchase: string;
      salesCount: number;
      sales: Sale[] 
    }> = {};

    // Group sales by Person
    sales.forEach(sale => {
      const pid = sale.personId || 'avulso';
      const pName = sale.personName || 'Venda Avulsa';

      if (!map[pid]) {
        map[pid] = { 
          id: pid,
          name: pName, 
          totalSpent: 0, 
          totalPending: 0,
          lastPurchase: sale.date,
          salesCount: 0,
          sales: [] 
        };
      }

      map[pid].sales.push(sale);
      map[pid].totalSpent += sale.total;
      map[pid].salesCount += 1;
      
      if (sale.status === 'PENDING') {
        map[pid].totalPending += sale.total;
      }

      if (new Date(sale.date) > new Date(map[pid].lastPurchase)) {
        map[pid].lastPurchase = sale.date;
      }
    });

    // Sort people by latest purchase date desc
    return Object.values(map).sort((a, b) => 
      new Date(b.lastPurchase).getTime() - new Date(a.lastPurchase).getTime()
    );
  }, [sales]);

  const filteredHistory = historyData.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedData = selectedPersonId ? historyData.find(h => h.id === selectedPersonId) : null;

  // --- UI HELPERS ---
  const getMethodStyle = (method: PaymentMethod) => {
    switch (method) {
      case 'Pendência': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Pix': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Dinheiro': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/org/cashier-hub')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft size={24} className="text-gray-500" />
           </button>
           <div>
              <h2 className="text-3xl font-black tracking-tighter">Histórico de Compras</h2>
              <p className="text-gray-400 font-medium">Registro completo por pessoa.</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* LEFT COLUMN: LIST OF PEOPLE */}
        <div className={`lg:w-1/3 flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden h-full ${selectedPersonId ? 'hidden lg:flex' : 'flex'}`}>
           <div className="p-6 border-b border-gray-100 shrink-0">
              <div className="relative">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                   placeholder="Buscar comprador..." 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 ring-blue-100 transition-all"
                 />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {filteredHistory.map(person => (
                 <button 
                   key={person.id}
                   onClick={() => setSelectedPersonId(person.id)}
                   className={`w-full text-left p-4 rounded-3xl border transition-all group hover:scale-[1.02] ${selectedPersonId === person.id ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                 >
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${selectedPersonId === person.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                             <User size={18} />
                          </div>
                          <div>
                             <h4 className="font-bold leading-tight">{person.name}</h4>
                             <p className={`text-[10px] uppercase font-bold tracking-wider ${selectedPersonId === person.id ? 'text-gray-400' : 'text-gray-400'}`}>
                                {person.salesCount} compras
                             </p>
                          </div>
                       </div>
                       <ArrowRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedPersonId === person.id ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex justify-between items-end">
                       <div>
                          <span className={`text-[10px] font-bold uppercase block ${selectedPersonId === person.id ? 'text-gray-500' : 'text-gray-400'}`}>Total Gasto</span>
                          <span className="font-black text-lg">R$ {person.totalSpent.toFixed(2)}</span>
                       </div>
                       {person.totalPending > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg font-black flex items-center gap-1">
                             <AlertCircle size={10} /> Devendo R$ {person.totalPending.toFixed(2)}
                          </span>
                       )}
                    </div>
                 </button>
              ))}
              {filteredHistory.length === 0 && (
                 <div className="text-center py-10 text-gray-400 font-medium">Nenhum histórico encontrado.</div>
              )}
           </div>
        </div>

        {/* RIGHT COLUMN: DETAILS (TIMELINE) */}
        <div className={`lg:w-2/3 flex flex-col bg-gray-50/50 rounded-[2.5rem] border border-gray-100 overflow-hidden h-full relative ${!selectedPersonId ? 'hidden lg:flex justify-center items-center' : 'flex'}`}>
           
           {!selectedData ? (
              <div className="text-center p-10 opacity-50">
                 <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={40} className="text-gray-400" />
                 </div>
                 <h3 className="text-xl font-black text-gray-400">Selecione uma pessoa</h3>
                 <p className="text-gray-400">Visualize o histórico detalhado de compras.</p>
              </div>
           ) : (
              <div className="flex flex-col h-full animate-in slide-in-from-right-4">
                 {/* Mobile Back Button */}
                 <div className="lg:hidden p-4 flex items-center gap-2 bg-white border-b border-gray-100">
                    <button onClick={() => setSelectedPersonId(null)} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft size={20} /></button>
                    <span className="font-black text-lg">Voltar</span>
                 </div>

                 {/* Detail Header */}
                 <div className="p-8 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
                    <div>
                       <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedData.name}</h2>
                       <div className="flex gap-4">
                          <div className="bg-gray-100 px-4 py-2 rounded-xl">
                             <span className="text-xs font-bold text-gray-400 uppercase block">Gasto Total</span>
                             <span className="font-black text-xl text-gray-900">R$ {selectedData.totalSpent.toFixed(2)}</span>
                          </div>
                          {selectedData.totalPending > 0 && (
                             <div className="bg-red-50 px-4 py-2 rounded-xl text-red-600 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => navigate('/org/canteen')}>
                                <span className="text-xs font-bold uppercase block flex items-center gap-1">Em Aberto <ArrowUpRight size={10} /></span>
                                <span className="font-black text-xl">R$ {selectedData.totalPending.toFixed(2)}</span>
                             </div>
                          )}
                       </div>
                    </div>
                    {/* Placeholder for future specific user actions */}
                 </div>

                 {/* Timeline */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="space-y-8 relative">
                       {/* Timeline Line */}
                       <div className="absolute left-4 md:left-6 top-4 bottom-4 w-0.5 bg-gray-200" />

                       {selectedData.sales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale, idx) => (
                          <div key={sale.id} className="relative pl-12 md:pl-16 group">
                             {/* Timeline Dot */}
                             <div className={`absolute left-[10px] md:left-[18px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${sale.status === 'PENDING' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                             
                             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-gray-50 pb-4">
                                   <div className="flex items-center gap-3">
                                      <div className="bg-gray-50 p-2 rounded-xl text-gray-400">
                                         <Clock size={18} />
                                      </div>
                                      <div>
                                         <span className="block text-xs font-bold text-gray-400 uppercase">
                                            {new Date(sale.date).toLocaleDateString()}
                                         </span>
                                         <span className="font-black text-gray-900 text-sm">
                                            {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                         </span>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${getMethodStyle(sale.paymentMethod)}`}>
                                         {sale.paymentMethod}
                                      </span>
                                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${sale.status === 'PENDING' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                         {sale.status === 'PENDING' ? 'Pendente' : 'Pago'}
                                      </span>
                                   </div>
                                </div>

                                <div className="space-y-2">
                                   {sale.items.map((item, i) => (
                                      <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                         <div className="flex items-center gap-3">
                                            <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded text-xs">
                                               {item.quantity}x
                                            </span>
                                            <span className="font-bold text-gray-700">{item.productName}</span>
                                         </div>
                                         <span className="font-medium text-gray-900">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                                      </div>
                                   ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total da Compra</span>
                                   <span className="text-2xl font-black text-gray-900">R$ {sale.total.toFixed(2)}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
