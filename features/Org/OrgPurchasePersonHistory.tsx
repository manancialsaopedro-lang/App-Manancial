import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../../store';
import { PaymentMethod, Sale } from '../../types';

export const OrgPurchasePersonHistory = () => {
  const navigate = useNavigate();
  const { personId } = useParams();
  const { sales } = useAppStore();

  const historyData = useMemo(() => {
    const map: Record<string, {
      id: string;
      name: string;
      totalSpent: number;
      totalPending: number;
      lastPurchase: string;
      salesCount: number;
      sales: Sale[];
    }> = {};

    sales.forEach((sale) => {
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

    return map;
  }, [sales]);

  const selectedData = personId ? historyData[personId] : null;

  const getMethodStyle = (method: PaymentMethod) => {
    switch (method) {
      case 'Pendencia': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Pix': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Dinheiro': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!selectedData) {
    return (
      <div className="space-y-6 animate-in fade-in pb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/org/history')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={24} className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Historico da Pessoa</h2>
            <p className="text-gray-400 font-medium">Pessoa nao encontrada.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/org/history')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-3xl font-black tracking-tighter">{selectedData.name}</h2>
          <p className="text-gray-400 font-medium">Historico completo de compras.</p>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex gap-4">
          <div className="bg-gray-100 px-4 py-2 rounded-xl">
            <span className="text-xs font-bold text-gray-400 uppercase block">Gasto Total</span>
            <span className="font-black text-xl text-gray-900">R$ {selectedData.totalSpent.toFixed(2)}</span>
          </div>
          {selectedData.totalPending > 0 && (
            <div
              className="bg-red-50 px-4 py-2 rounded-xl text-red-600 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => navigate('/org/canteen?tab=debts')}
            >
              <span className="text-xs font-bold uppercase block flex items-center gap-1">Em Aberto <ArrowUpRight size={10} /></span>
              <span className="font-black text-xl">R$ {selectedData.totalPending.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="space-y-8 relative">
            <div className="absolute left-4 md:left-6 top-4 bottom-4 w-0.5 bg-gray-200" />

            {selectedData.sales
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((sale) => (
                <div key={sale.id} className="relative pl-12 md:pl-16 group">
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
                            {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {selectedData.totalPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 flex items-center gap-2">
          <AlertCircle size={16} />
          Esta pessoa possui compras em aberto. Toque no card "Em Aberto" para ir ao Fiado.
        </div>
      )}
    </div>
  );
};

