import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store';
import { Sale } from '../../types';

export const OrgPurchaseHistory = () => {
  const navigate = useNavigate();
  const { sales } = useAppStore();
  const [search, setSearch] = useState('');

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

    return Object.values(map).sort((a, b) =>
      new Date(b.lastPurchase).getTime() - new Date(a.lastPurchase).getTime()
    );
  }, [sales]);

  const filteredHistory = historyData.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/org/cashier-hub')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Historico de Compras</h2>
          <p className="text-gray-400 font-medium">Selecione uma pessoa para abrir o historico detalhado.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Buscar comprador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredHistory.map(person => (
            <button
              key={person.id}
              onClick={() => navigate(`/org/history/${person.id}`)}
              className="text-left p-5 rounded-3xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold leading-tight text-gray-900">{person.name}</h4>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      {person.salesCount} compras
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-700" />
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold uppercase block text-gray-400">Total Gasto</span>
                  <span className="font-black text-xl text-gray-900">R$ {person.totalSpent.toFixed(2)}</span>
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
            <div className="col-span-full text-center py-12 text-gray-400 font-medium">Nenhum historico encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
};
