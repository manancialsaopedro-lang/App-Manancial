
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PieChart, Users, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';

export const OrgAdherence = () => {
  const navigate = useNavigate();
  const { people } = useAppStore();

  const total = people.length;
  const paid = people.filter(p => p.paymentStatus === 'PAGO').length;
  const pending = total - paid;
  const rate = total > 0 ? (paid / total) * 100 : 0;

  // Breakdown by Age Group
  const groups = ['Adulto', 'Jovem', 'Criança'];
  const groupStats = groups.map(g => {
    const groupPeople = people.filter(p => p.ageGroup === g);
    const groupPaid = groupPeople.filter(p => p.paymentStatus === 'PAGO').length;
    return {
      group: g,
      total: groupPeople.length,
      paid: groupPaid,
      rate: groupPeople.length > 0 ? (groupPaid / groupPeople.length) * 100 : 0
    };
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/org/dash')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
           <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
           <h2 className="text-3xl font-black tracking-tighter">Aderência Financeira</h2>
           <p className="text-gray-400 font-medium">Análise de quitação de inscrições.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 md:col-span-2 flex flex-col justify-center relative overflow-hidden bg-gray-900 text-white border-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#374151" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="#10b981" strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 - ((rate / 100) * 251.2)} 
                    strokeLinecap="round"
                  />
               </svg>
               <span className="absolute text-2xl font-black">{rate.toFixed(0)}%</span>
            </div>
            <div>
               <h3 className="text-2xl font-black mb-2">Taxa Global de Pagamento</h3>
               <p className="text-gray-400 max-w-sm text-sm">
                 Atualmente, <strong className="text-white">{paid}</strong> de <strong className="text-white">{total}</strong> inscritos quitaram integralmente o valor do acampamento.
               </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-white">
           <div className="flex items-center gap-3 mb-4 text-orange-500">
             <AlertCircle size={24} />
             <h3 className="font-bold uppercase text-xs tracking-widest">Atenção</h3>
           </div>
           <span className="text-5xl font-black text-gray-900 block mb-2">{pending}</span>
           <p className="text-sm font-bold text-gray-500">Inscrições Pendentes</p>
           <button 
             onClick={() => navigate('/org/receivables')} 
             className="mt-6 w-full py-3 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs hover:bg-orange-100 transition-colors"
           >
             Ver quem deve
           </button>
        </Card>
      </div>

      <h3 className="text-xl font-black text-gray-900 mt-8">Aderência por Categoria</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groupStats.map(stat => (
          <Card key={stat.group} className="p-6">
             <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">{stat.group}</span>
                <span className={`px-2 py-1 rounded text-xs font-black ${stat.rate === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                  {stat.rate.toFixed(0)}%
                </span>
             </div>
             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${stat.rate}%` }} />
             </div>
             <p className="text-xs text-gray-400 font-bold">{stat.paid} / {stat.total} pagos</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
