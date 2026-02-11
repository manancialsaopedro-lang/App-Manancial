import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, ShoppingBag, Receipt, PieChart } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';

type FilterType = 'geral' | 'cantina' | 'inscricao';

export const OrgAnalytics = () => {
  const navigate = useNavigate();
  const { people, transactions, fixedCostRent } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('geral');

  const revenueInscricoes = people.reduce((acc, p) => acc + p.amountPaid, 0);
  const otherExpenses = transactions
    .filter(t =>
      t.type === 'SAIDA' &&
      t.category !== 'ALUGUEL_CHACARA' &&
      t.category !== 'CANTINA' &&
      !/aluguel|chacara/i.test(t.description || '')
    )
    .reduce((acc, t) => acc + t.amount, 0);

  const profitInscricoes = revenueInscricoes - fixedCostRent - otherExpenses;

  const revenueCantina = transactions
    .filter(t => t.category === 'CANTINA' && t.type === 'ENTRADA')
    .reduce((acc, t) => acc + t.amount, 0);

  const cantinaCostFromMovements = transactions
    .filter(t => t.type === 'SAIDA' && t.category === 'CANTINA')
    .reduce((acc, t) => acc + t.amount, 0);

  const profitCantina = revenueCantina - cantinaCostFromMovements;

  const totalRevenue = revenueInscricoes + revenueCantina;
  const totalCosts = fixedCostRent + otherExpenses + cantinaCostFromMovements;
  const totalProfit = totalRevenue - totalCosts;

  const getDisplayData = () => {
    switch (filter) {
      case 'cantina':
        return {
          title: 'Resultado Cantina',
          revenue: revenueCantina,
          cost: cantinaCostFromMovements,
          profit: profitCantina,
          bg: 'bg-orange-500',
          details: [
            { label: 'Vendas Totais', value: revenueCantina, type: 'plus' as const },
            { label: 'Saidas Cantina (Movimentacoes)', value: cantinaCostFromMovements, type: 'minus' as const }
          ]
        };
      case 'inscricao':
        return {
          title: 'Resultado Inscricoes',
          revenue: revenueInscricoes,
          cost: fixedCostRent + otherExpenses,
          profit: profitInscricoes,
          bg: 'bg-blue-500',
          details: [
            { label: 'Arrecadacao Inscricoes', value: revenueInscricoes, type: 'plus' as const },
            { label: 'Aluguel Chacara', value: fixedCostRent, type: 'minus' as const },
            { label: 'Outras Despesas', value: otherExpenses, type: 'minus' as const }
          ]
        };
      default:
        return {
          title: 'Resultado Geral Consolidado',
          revenue: totalRevenue,
          cost: totalCosts,
          profit: totalProfit,
          bg: 'bg-gray-900',
          details: [
            { label: 'Lucro Inscricoes', value: profitInscricoes, type: 'neutral' as const },
            { label: 'Lucro Cantina', value: profitCantina, type: 'neutral' as const }
          ]
        };
    }
  };

  const data = getDisplayData();
  const maxCostItem = Math.max(fixedCostRent, cantinaCostFromMovements) || 1;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/org/dash')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Analise Financeira Detalhada</h2>
          <p className="text-gray-400 font-medium">Lucratividade, custos e margens.</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        <button onClick={() => setFilter('geral')} className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${filter === 'geral' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <PieChart size={18} /> Visao Geral
        </button>
        <button onClick={() => setFilter('cantina')} className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${filter === 'cantina' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <ShoppingBag size={18} /> Lucro Cantina
        </button>
        <button onClick={() => setFilter('inscricao')} className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${filter === 'inscricao' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
          <Receipt size={18} /> Lucro Inscricoes
        </button>
      </div>

      <div className={`p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${data.bg}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />

        <h3 className="text-xl font-bold uppercase tracking-widest opacity-80 mb-2">{data.title}</h3>
        <div className="flex items-baseline gap-4 mb-8 relative z-10">
          <span className="text-6xl font-black">R$ {data.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span className="text-lg font-bold bg-white/20 px-3 py-1 rounded-lg">Lucro Liquido</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div onClick={() => navigate('/org/analytics/revenue')} className="bg-white/10 p-6 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/20 transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-2 text-emerald-300">
              <TrendingUp size={24} />
              <span className="font-bold uppercase text-xs">Receita Total</span>
            </div>
            <span className="text-3xl font-black">R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <div onClick={() => navigate('/org/analytics/costs')} className="bg-white/10 p-6 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/20 transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-2 text-red-300">
              <TrendingDown size={24} />
              <span className="font-bold uppercase text-xs">Custo Total (Realizado)</span>
            </div>
            <span className="text-3xl font-black">R$ {data.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <h3 className="text-lg font-black text-gray-900 mb-6">Composicao do Resultado</h3>
          <div className="space-y-4">
            {data.details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="font-bold text-gray-600">{item.label}</span>
                <span className={`font-black text-lg ${item.type === 'plus' ? 'text-emerald-500' : item.type === 'minus' ? 'text-red-500' : 'text-gray-900'}`}>
                  {item.type === 'plus' ? '+' : item.type === 'minus' ? '-' : ''} R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-black text-gray-900 uppercase">Resultado Final</span>
              <span className={`font-black text-2xl ${data.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                R$ {data.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>

        <Card onClick={() => navigate('/org/analytics/costs')} className="p-8 flex flex-col justify-start cursor-pointer hover:border-red-200 transition-colors group">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center justify-between">
            Distribuicao de Custos
            <ArrowLeft size={16} className="rotate-180 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1 uppercase text-gray-500">
                <span>Aluguel Chacara</span>
                <span>R$ {fixedCostRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${(fixedCostRent / maxCostItem) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1 uppercase text-gray-500">
                <span>Cantina (Saidas em Movimentacoes)</span>
                <span>R$ {cantinaCostFromMovements.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${(cantinaCostFromMovements / maxCostItem) * 100}%` }} />
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Valor vinculado aos lancamentos reais da tabela de movimentacoes.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
