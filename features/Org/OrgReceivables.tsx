
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Filter, Search, User, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { Person } from '../../types';

export const OrgReceivables = () => {
  const navigate = useNavigate();
  const { people } = useAppStore();
  const [search, setSearch] = useState('');

  // Filter only pending
  const debtors = useMemo(() => {
    return people
      .filter(p => p.amountPaid < p.totalPrice)
      .map(p => ({
        ...p,
        remaining: p.totalPrice - p.amountPaid,
        progress: (p.amountPaid / p.totalPrice) * 100
      }))
      .sort((a, b) => b.remaining - a.remaining);
  }, [people]);

  const filteredDebtors = debtors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalReceivable = debtors.reduce((acc, d) => acc + d.remaining, 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/org/dash')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
           <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
           <h2 className="text-3xl font-black tracking-tighter">Valores a Receber</h2>
           <p className="text-gray-400 font-medium">Detalhamento de pendências de inscrição.</p>
        </div>
      </div>

      <div className="bg-orange-500 rounded-[2.5rem] p-10 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
         <div className="relative z-10">
            <h3 className="font-bold uppercase tracking-widest text-orange-200 mb-2">Total Pendente</h3>
            <span className="text-6xl font-black">R$ {totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <p className="mt-4 font-medium opacity-90">{debtors.length} participantes possuem valores em aberto.</p>
         </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
         <div className="bg-gray-50 p-3 rounded-xl"><Search size={20} className="text-gray-400" /></div>
         <input 
           placeholder="Buscar participante..." 
           value={search}
           onChange={e => setSearch(e.target.value)}
           className="w-full font-bold outline-none text-gray-700"
         />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDebtors.map(debtor => (
          <div key={debtor.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
             <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold shrink-0">
                  {debtor.progress.toFixed(0)}%
                </div>
                <div>
                   <h4 className="font-black text-gray-900 text-lg">{debtor.name}</h4>
                   <p className="text-xs text-gray-400 font-bold uppercase">{debtor.ageGroup} • {debtor.personType}</p>
                </div>
             </div>

             <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                   <span className="block text-[10px] font-black uppercase text-gray-400">Pago</span>
                   <span className="font-bold text-gray-900">R$ {debtor.amountPaid.toFixed(2)}</span>
                </div>
                <div className="text-right">
                   <span className="block text-[10px] font-black uppercase text-orange-400">Falta</span>
                   <span className="font-black text-xl text-orange-500">R$ {debtor.remaining.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => navigate('/org/list')}
                  className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors" title="Ir para Lista"
                >
                   <ArrowRight size={18} />
                </button>
             </div>
          </div>
        ))}
        
        {filteredDebtors.length === 0 && (
           <div className="text-center py-10 text-gray-400 font-medium">Nenhum registro encontrado.</div>
        )}
      </div>
    </div>
  );
};