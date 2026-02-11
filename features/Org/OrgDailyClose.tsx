
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, AlertCircle, ShoppingBag, Package, TrendingUp, CreditCard, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';

export const OrgDailyClose = () => {
  const navigate = useNavigate();
  // Pega a data de hoje no formato YYYY-MM-DD para o input
  const today = new Date().toISOString().split('T')[0];
  
  // Estado agora controla um intervalo (De -> Até)
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  const { sales, transactions } = useAppStore();

  // --- FILTROS & CÁLCULOS DO PERÍODO ---
  
  // Função auxiliar para verificar se uma data ISO está dentro do intervalo (inclusivo)
  const isInPeriod = (isoDate: string) => {
    const datePart = isoDate.split('T')[0];
    return datePart >= startDate && datePart <= endDate;
  };
  
  // 1. Filtrar Vendas (Itens que saíram do estoque no período)
  const periodSales = useMemo(() => {
    return sales.filter(s => isInPeriod(s.date));
  }, [sales, startDate, endDate]);

  // 2. Filtrar Transações (Dinheiro que entrou/saiu do caixa no período)
  const periodTransactions = useMemo(() => {
    return transactions.filter(t => isInPeriod(t.date));
  }, [transactions, startDate, endDate]);


  // --- MÉTRICAS DE VENDAS (Baseado em Sales) ---
  const totalSalesRevenue = periodSales.reduce((acc, s) => acc + s.total, 0); // Valor total vendido (incluindo fiado)
  const totalSalesCost = periodSales.reduce((acc, s) => acc + s.totalCost, 0); // Custo dos produtos vendidos
  const netProfitPeriod = totalSalesRevenue - totalSalesCost; // Lucro líquido do período (Venda - Custo)
  
  const pendingSalesTotal = periodSales
    .filter(s => s.status === 'PENDING')
    .reduce((acc, s) => acc + s.total, 0); // Quanto foi vendido "fiado" no período

  // --- MÉTRICAS DE CAIXA (Baseado em Transactions) ---
  const cashIn = periodTransactions.filter(t => t.type === 'ENTRADA').reduce((acc, t) => acc + t.amount, 0);
  const cashOut = periodTransactions.filter(t => t.type === 'SAIDA').reduce((acc, t) => acc + t.amount, 0);
  // const cashFlowBalance = cashIn - cashOut; // (Opcional, se quiser mostrar saldo líquido de caixa)

  // --- DETALHAMENTO DE PRODUTOS (Agregação) ---
  const productsSold = useMemo(() => {
    const agg: Record<string, { qty: number, revenue: number }> = {};
    
    periodSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!agg[item.productName]) {
          agg[item.productName] = { qty: 0, revenue: 0 };
        }
        agg[item.productName].qty += item.quantity;
        agg[item.productName].revenue += (item.quantity * item.unitPrice);
      });
    });

    return Object.entries(agg).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.qty - a.qty);
  }, [periodSales]);

  // --- DETALHAMENTO POR MÉTODO ---
  const methodBreakdown = useMemo(() => {
     const agg: Record<string, number> = {};
     periodSales.forEach(s => {
        const method = s.paymentMethod || 'Outro';
        agg[method] = (agg[method] || 0) + s.total;
     });
     return Object.entries(agg);
  }, [periodSales]);

  // Formatação da data para exibição no título se forem diferentes
  const isSameDay = startDate === endDate;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
         <div>
            <h2 className="text-3xl font-black tracking-tighter text-gray-900">Fechamento Geral</h2>
            <p className="text-gray-500 font-medium">
               Análise financeira de {new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')} {isSameDay ? '' : ` Até ${new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}.
            </p>
         </div>
         
         {/* SELETORES DE DATA (INTERVALO) */}
         <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="bg-white p-2 px-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 w-full md:w-auto">
               <span className="text-[10px] font-black uppercase text-gray-400">De</span>
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="bg-transparent font-bold text-gray-900 outline-none uppercase text-sm w-full md:w-auto"
               />
            </div>
            
            <div className="hidden md:flex items-center text-gray-300"><ArrowRight size={16} /></div>
            
            <div className="bg-white p-2 px-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 w-full md:w-auto">
               <span className="text-[10px] font-black uppercase text-gray-400">Até</span>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="bg-transparent font-bold text-gray-900 outline-none uppercase text-sm w-full md:w-auto"
               />
            </div>
         </div>
      </div>

      {periodSales.length === 0 && periodTransactions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
           <p className="text-gray-400 font-bold text-lg">Nenhuma movimentação registrada neste período.</p>
        </div>
      ) : (
        <>
          {/* CARDS DE RESUMO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <Card className="p-6 bg-gray-900 text-white border-none shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-emerald-400">
                   <ShoppingBag size={24} />
                   <span className="font-bold uppercase text-xs tracking-widest">Total Vendido</span>
                </div>
                <div className="text-4xl font-black">R$ {totalSalesRevenue.toFixed(2)}</div>
                <div className="mt-2 text-xs text-gray-400 font-bold">{periodSales.length} vendas no período</div>
             </Card>

             <Card className="p-6">
                <div className="flex items-center gap-3 mb-4 text-emerald-600">
                   <TrendingUp size={24} />
                   <span className="font-bold uppercase text-xs tracking-widest text-gray-400">Lucro líquido</span>
                </div>
                <div className="text-4xl font-black text-emerald-600">R$ {netProfitPeriod.toFixed(2)}</div>
                <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg inline-block font-bold">
                   Margem: {totalSalesRevenue > 0 ? ((netProfitPeriod/totalSalesRevenue)*100).toFixed(0) : 0}%
                </div>
             </Card>

             <Card onClick={() => navigate('/org/canteen?tab=debts')} className="p-6 border-purple-100 bg-purple-50/50 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4 text-purple-600">
                   <AlertCircle size={24} />
                   <span className="font-bold uppercase text-xs tracking-widest text-purple-400">Pendências (Fiado)</span>
                </div>
                <div className="text-4xl font-black text-purple-600">R$ {pendingSalesTotal.toFixed(2)}</div>
                <div className="mt-2 text-xs text-purple-400 font-bold">Criadas neste periodo - Toque para abrir</div>
             </Card>

             <Card className="p-6">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                   <DollarSign size={24} />
                   <span className="font-bold uppercase text-xs tracking-widest text-gray-400">Caixa (Entradas Reais)</span>
                </div>
                <div className="text-4xl font-black text-gray-900">R$ {cashIn.toFixed(2)}</div>
                <div className="mt-2 text-xs text-gray-400 font-bold">Recebido efetivamente</div>
             </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* RELATÓRIO DE PRODUTOS (Estoque) */}
             <div className="lg:col-span-2">
                <Card className="p-8 h-full">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Package size={20} /></div>
                      <h3 className="text-xl font-black text-gray-900">Produtos Vendidos (Baixa de Estoque)</h3>
                   </div>
                   
                   <div className="overflow-hidden rounded-2xl border border-gray-100">
                      <table className="w-full text-left">
                         <thead className="bg-gray-50">
                            <tr>
                               <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Produto</th>
                               <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Qtd. Vendida</th>
                               <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Total (R$)</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {productsSold.map((prod, idx) => (
                               <tr key={idx} className="hover:bg-gray-50/50">
                                  <td className="px-6 py-3 font-bold text-sm text-gray-700">{prod.name}</td>
                                  <td className="px-6 py-3 text-center font-black text-gray-900">{prod.qty}</td>
                                  <td className="px-6 py-3 text-right font-bold text-gray-900">R$ {prod.revenue.toFixed(2)}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      {productsSold.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">Nenhum produto vendido.</p>}
                   </div>
                </Card>
             </div>

             {/* DETALHAMENTO FINANCEIRO / MÉTODOS */}
             <div className="space-y-6">
                <Card className="p-8">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><CreditCard size={20} /></div>
                      <h3 className="text-lg font-black text-gray-900">Vendas por Método</h3>
                   </div>
                   <div className="space-y-4">
                      {methodBreakdown.map(([method, total]) => (
                         <div key={method} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="font-bold text-gray-600 text-sm">{method}</span>
                            <span className="font-black text-gray-900">R$ {total.toFixed(2)}</span>
                         </div>
                      ))}
                      {methodBreakdown.length === 0 && <p className="text-gray-400 text-sm">Sem dados.</p>}
                   </div>
                </Card>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                   <h4 className="font-black text-gray-900 mb-2 text-sm uppercase flex items-center gap-2">
                     <AlertCircle size={16} /> Nota de Conciliação
                   </h4>
                   <p className="text-xs text-gray-500 leading-relaxed">
                      O "Total Vendido" inclui vendas fiado (Pendências) que podem não ter entrado no caixa ainda. 
                      Para conferência física do dinheiro, utilize o valor do card <strong>"Caixa (Entradas Reais)"</strong>.
                   </p>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
};





