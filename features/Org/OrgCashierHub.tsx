import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, ShoppingBag, ScrollText, CalendarCheck, Wallet, Target, TrendingDown } from 'lucide-react';
import { Card } from '../../components/Shared';

export const OrgCashierHub = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Movimentação',
      subtitle: 'Entradas e Saídas',
      icon: ArrowRightLeft,
      path: '/org/financials',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Cantina / PDV',
      subtitle: 'Vendas e Estoque',
      icon: ShoppingBag,
      path: '/org/canteen',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Projeção Financeira',
      subtitle: 'Orçamento e Planejamento',
      icon: Target,
      path: '/org/forecast',
      color: 'text-teal-600',
      bg: 'bg-teal-50'
    },
    {
      title: 'Detalhamento de Custos',
      subtitle: 'Despesas detalhadas',
      icon: TrendingDown,
      path: '/org/analytics/costs',
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
    {
      title: 'Histórico',
      subtitle: 'Compras por Pessoa',
      icon: ScrollText,
      path: '/org/history',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Fechamento',
      subtitle: 'Relatório Diário/Geral',
      icon: CalendarCheck,
      path: '/org/closing',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/org/home')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Central do Caixa</h2>
          <p className="text-gray-400 font-medium">Selecione a operação financeira.</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <Wallet size={32} />
          </div>
          <div>
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-1">Menu Financeiro</h3>
            <p className="text-lg font-medium">Gerencie o fluxo de caixa, vendas e relatórios em um só lugar.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt) => (
          <div
            key={opt.path}
            onClick={() => navigate(opt.path)}
            className="cursor-pointer group"
          >
            <Card className="p-6 flex items-center gap-6 hover:shadow-lg transition-all border border-gray-100 group-hover:border-gray-300">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${opt.bg} ${opt.color}`}>
                <opt.icon size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900 mb-1">{opt.title}</h3>
                <p className="text-gray-500 font-medium text-sm">{opt.subtitle}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-full text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                <ArrowLeft size={20} className="rotate-180" />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
