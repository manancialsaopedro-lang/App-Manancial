import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Clock, CreditCard, Tag, Package } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { getTransactionById } from '../../lib/api/transactions';
import { getSaleById } from '../../lib/api/sales';
import { SaleItem, Transaction } from '../../types';

export const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, sales, setTransactions, setSales } = useAppStore();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storeTx = transactions.find(t => t.id === id);
    if (storeTx) {
      setTransaction(storeTx);
      return;
    }

    if (!id) return;

    setLoading(true);
    getTransactionById(id)
      .then((data) => {
        if (data) {
          setTransaction(data);
          setTransactions([data, ...transactions]);
        }
      })
      .catch((error) => console.error("Erro ao buscar transaÃ§Ã£o:", error))
      .finally(() => setLoading(false));
  }, [id, setTransactions, transactions]);

  useEffect(() => {
    if (!transaction || transaction.items?.length) {
      setSaleItems(null);
      return;
    }

    if (transaction.category !== 'CANTINA' || !transaction.referenceId) {
      setSaleItems(null);
      return;
    }

    const storeSale = sales.find(s => s.id === transaction.referenceId);
    if (storeSale) {
      setSaleItems(storeSale.items);
      return;
    }

    getSaleById(transaction.referenceId)
      .then((sale) => {
        if (sale) {
          setSaleItems(sale.items);
          setSales([sale, ...sales]);
        }
      })
      .catch((error) => console.error("Erro ao buscar itens da venda:", error));
  }, [sales, setSales, transaction]);

  const itemsToDisplay = useMemo(() => {
    if (transaction?.items?.length) return transaction.items;
    if (saleItems?.length) return saleItems;
    return [];
  }, [saleItems, transaction?.items]);

  if (!transaction) {
    if (loading) {
      return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} /> Voltar para o Caixa
          </button>
          <Card className="p-8 text-center text-gray-400 font-bold">Carregando transaÃ§Ã£o...</Card>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
          <ArrowLeft size={18} /> Voltar para o Caixa
        </button>
        <Card className="p-8 text-center text-gray-400 font-bold">TransaÃ§Ã£o nÃ£o encontrada.</Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} /> Voltar para o Caixa
      </button>

      <div className="flex flex-col items-center mb-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${transaction.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          <Receipt size={32} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 text-center">{transaction.description}</h2>
        <span className={`text-4xl font-black mt-2 ${transaction.type === 'ENTRADA' ? 'text-emerald-500' : 'text-red-500'}`}>
          {transaction.type === 'SAIDA' ? '-' : '+'} R$ {transaction.amount.toFixed(2)}
        </span>
      </div>

      <Card className="p-8">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-6">InformaÃ§Ãµes Gerais</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Clock size={18} /></div>
             <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Data e Hora</p>
                <p className="font-bold text-gray-900">{new Date(transaction.date).toLocaleString('pt-BR')}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><CreditCard size={18} /></div>
             <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">MÃ©todo de Pagamento</p>
                <p className="font-bold text-gray-900">{transaction.paymentMethod || 'NÃ£o informado'}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Tag size={18} /></div>
             <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Categoria</p>
                <p className="font-bold text-gray-900">{transaction.category}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Receipt size={18} /></div>
             <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">ID ReferÃªncia</p>
                <p className="font-bold text-gray-900 text-xs truncate w-32">{transaction.referenceId || transaction.id}</p>
             </div>
          </div>
        </div>
      </Card>

      {/* Detalhes da Venda (Cupom Fiscal Digital) */}
      {itemsToDisplay.length > 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden">
           {/* Visual de "papel rasgado" no topo (opcional/css simples) */}
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
           
           <div className="flex items-center gap-3 mb-6 text-orange-600">
              <Package size={24} />
              <h3 className="font-black uppercase tracking-widest text-sm">Itens da Compra (Detalhado)</h3>
           </div>

           <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {itemsToDisplay.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-dashed border-gray-100 last:border-0">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-xs shrink-0">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-400">Unit: R$ {item.unitPrice.toFixed(2)}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-gray-900">R$ {(item.quantity * item.unitPrice).toFixed(2)}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-6 pt-6 border-t-2 border-gray-100 flex justify-between items-end">
              <span className="font-bold text-gray-400 uppercase text-xs">Total Venda</span>
              <span className="text-2xl font-black text-gray-900">R$ {transaction.amount.toFixed(2)}</span>
           </div>
           
           <div className="mt-8 bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">Estoque atualizado na data da compra original</p>
           </div>
        </div>
      )}
    </div>
  );
};
