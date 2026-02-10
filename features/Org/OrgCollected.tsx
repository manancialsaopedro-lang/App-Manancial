
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Search, CheckCircle, Clock, PieChart } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';

export const OrgCollected = () => {
  const navigate = useNavigate();
  const { people } = useAppStore();
  const [search, setSearch] = useState('');

  // Filter people who have paid something
  const contributors = useMemo(() => {
    return people
      .filter(p => p.amountPaid > 0)
      .map(p => ({
        ...p,
        progress: (p.amountPaid / p.totalPrice) * 100,
        isFullyPaid: p.amountPaid >= p.totalPrice
      }))
      .sort((a, b) => {
        // Sort by last payment date if possible, otherwise by amount descending
        if (b.lastPaymentDate && a.lastPaymentDate) {
            return new Date(b.lastPaymentDate).getTime() - new Date(a.lastPaymentDate).getTime();
        }
        return b.amountPaid - a.amountPaid;
      });
  }, [people]);

  const filtered = contributors.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = contributors.reduce((acc, c) => acc + c.amountPaid, 0);
  const fullyPaidCount = contributors.filter(c => c.isFullyPaid).length;
  const partialCount = contributors.length - fullyPaidCount;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/org/dash')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
           <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
           <h2 className="text-3xl font-black tracking-tighter">Valores Arrecadados</h2>
           <p className="text-gray-400 font-medium">Detalhamento das entradas de inscrição.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-emerald-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 text-emerald-200">
                    <Wallet size={24} />
                    <span className="font-bold uppercase text-xs tracking-widest">Total em Caixa</span>
                </div>
                <span className="text-6xl font-black">R$ {totalCollected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <p className="mt-4 font-medium opacity-90">{contributors.length} pessoas já realizaram pagamentos.</p>
             </div>
          </div>

          <Card className="p-8 flex flex-col justify-center">
             <h3 className="font-black text-gray-900 text-lg mb-6">Status dos Pagamentos</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-gray-600 font-bold">Quitado (100%)</span>
                   </div>
                   <span className="font-black text-xl">{fullyPaidCount}</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-gray-600 font-bold">Parcial</span>
                   </div>
                   <span className="font-black text-xl">{partialCount}</span>
                </div>
             </div>
          </Card>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
         <div className="bg-gray-50 p-3 rounded-xl"><Search size={20} className="text-gray-400" /></div>
         <input 
           placeholder="Buscar pagador..." 
           value={search}
           onChange={e => setSearch(e.target.value)}
           className="w-full font-bold outline-none text-gray-700"
         />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Nome</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Progresso</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-right">Valor Pago</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-center">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-8 py-4">
                        <div className="font-black text-gray-900 text-lg">{c.name}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">{c.personType} • {c.ageGroup}</div>
                     </td>
                     <td className="px-8 py-4 align-middle">
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden max-w-[100px] mx-auto">
                           <div className={`h-full rounded-full ${c.isFullyPaid ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${c.progress}%` }} />
                        </div>
                        <div className="text-center text-[10px] font-bold text-gray-400 mt-1">{c.progress.toFixed(0)}%</div>
                     </td>
                     <td className="px-8 py-4 text-right font-black text-gray-900 text-xl">
                        R$ {c.amountPaid.toFixed(2)}
                     </td>
                     <td className="px-8 py-4 text-center">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${c.isFullyPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                           {c.isFullyPaid ? 'Quitado' : 'Em Aberto'}
                        </span>
                     </td>
                  </tr>
               ))}
               {filtered.length === 0 && (
                  <tr>
                     <td colSpan={4} className="text-center py-10 text-gray-400 font-bold">Nenhum registro encontrado.</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};
