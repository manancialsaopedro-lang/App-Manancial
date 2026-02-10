
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Users, Wallet, ArrowRight } from 'lucide-react';
import { Card } from '../../components/Shared';

export const OrgHome = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Dashboard Geral',
      description: 'Visão estratégica e métricas.',
      icon: PieChart,
      path: '/org/dash',
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Lista de Inscritos',
      description: 'Gerenciar participantes.',
      icon: Users,
      path: '/org/list',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Central do Caixa',
      description: 'Cantina, Movimentações e Fechamento.',
      icon: Wallet,
      path: '/org/cashier-hub',
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in pb-24">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tighter text-gray-900">Início</h2>
        <p className="text-gray-500 font-medium">Selecione uma área para acessar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div 
            key={card.path}
            onClick={() => navigate(card.path)}
            className="cursor-pointer group hover:scale-[1.02] transition-transform"
          >
            <Card className="p-8 h-full border hover:border-gray-300 transition-colors flex flex-col justify-between relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgColor} rounded-full blur-3xl -mr-10 -mt-10 opacity-50`} />
               
               <div>
                 <div className={`w-14 h-14 ${card.bgColor} ${card.textColor} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                    <card.icon size={28} />
                 </div>
                 
                 <h3 className="text-2xl font-black text-gray-900 mb-2">{card.title}</h3>
                 <p className="text-gray-500 font-medium leading-relaxed">{card.description}</p>
               </div>

               <div className={`mt-8 flex items-center gap-2 font-bold text-sm uppercase tracking-wider ${card.textColor} group-hover:translate-x-2 transition-transform`}>
                 Acessar <ArrowRight size={16} />
               </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
