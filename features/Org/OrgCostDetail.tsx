import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, CheckCircle, Plus, Save, X, Edit2, Trash2, AlertTriangle, Calendar, Info, Package } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';
import { ProjectionItem, PaymentMethod, TransactionCategory } from '../../types';
import { createTransaction, deleteTransaction, listTransactions } from '../../lib/api/transactions';

export const OrgCostDetail = () => {
  const navigate = useNavigate();
  const {
    expenseProjections,
    addProjectionItem,
    updateProjectionItem,
    deleteProjectionItem,
    fixedCostRent,
    updateFixedCostRent,
    setTransactions
  } = useAppStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', amount: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const [reviewItem, setReviewItem] = useState<ProjectionItem | null>(null);
  const [reviewData, setReviewData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Pix' as PaymentMethod,
    category: 'OUTROS' as TransactionCategory
  });

  const totalProjectedExpenses = expenseProjections.reduce((acc, p) => acc + p.amount, 0);
  const executedItemsCount = expenseProjections.filter(item => item.isExecuted).length;

  const handleAddItem = () => {
    if (!newItem.label || !newItem.amount) return;
    addProjectionItem(newItem.label, Number(newItem.amount));
    setNewItem({ label: '', amount: '' });
    setIsAdding(false);
  };

  const startEdit = (item: ProjectionItem) => {
    setEditingId(item.id);
    setEditValue(item.amount.toString());
  };

  const saveEdit = (id: string) => {
    updateProjectionItem(id, { amount: Number(editValue) });
    setEditingId(null);
  };

  const initiateReview = (item: ProjectionItem) => {
    setReviewItem(item);
    setReviewData({
      amount: item.amount.toString(),
      description: item.label,
      date: new Date().toISOString().split('T')[0],
      method: 'Pix',
      category: item.categoryMapping || 'OUTROS'
    });
  };

  const confirmExecution = async () => {
    if (!reviewItem || !reviewData.amount) return;

    const amount = Number(reviewData.amount);
    if (amount <= 0) return;

    try {
      if (reviewData.category === 'ALUGUEL_CHACARA') {
        updateProjectionItem(reviewItem.id, {
          isExecuted: true,
          amount,
          previousRentValue: fixedCostRent,
          executedTransactionId: undefined
        });
        updateFixedCostRent(amount);
      } else {
        const created = await createTransaction({
          description: reviewData.description,
          amount,
          type: 'SAIDA',
          category: reviewData.category,
          paymentMethod: reviewData.method,
          date: new Date(reviewData.date).toISOString()
        });

        const refreshed = await listTransactions();
        setTransactions(refreshed);

        updateProjectionItem(reviewItem.id, {
          isExecuted: true,
          amount,
          executedTransactionId: created.id,
          previousRentValue: undefined
        });
      }

      setReviewItem(null);
    } catch (error) {
      console.error('Erro ao lancar no caixa (custos):', error);
      alert('Nao foi possivel lancar no caixa.');
    }
  };

  const undoExecution = async (item: ProjectionItem) => {
    try {
      if (item.categoryMapping === 'ALUGUEL_CHACARA') {
        if (typeof item.previousRentValue === 'number') {
          updateFixedCostRent(item.previousRentValue);
        }

        updateProjectionItem(item.id, {
          isExecuted: false,
          executedTransactionId: undefined,
          previousRentValue: undefined
        });

        return;
      }

      if (item.executedTransactionId) {
        await deleteTransaction(item.executedTransactionId);
        const refreshed = await listTransactions();
        setTransactions(refreshed);
      }

      if (item.source === 'STOCK' || item.source === 'MOVEMENT') {
        deleteProjectionItem(item.id);
      } else {
        updateProjectionItem(item.id, {
          isExecuted: false,
          executedTransactionId: undefined,
          previousRentValue: undefined
        });
      }
    } catch (error) {
      console.error('Erro ao desfazer lancamento (custos):', error);
      alert('Nao foi possivel desfazer o lancamento.');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/org/cashier-hub')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={24} className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Detalhamento de Custos</h2>
            <p className="text-gray-400 font-medium">Despesas detalhadas com revisao e lancamento no caixa.</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all flex items-center gap-2">
          <Plus size={20} /> Novo Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-red-500 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10">
            <span className="font-bold text-red-100 uppercase text-xs tracking-widest block mb-2">Custo Projetado Total</span>
            <span className="text-5xl font-black block">R$ {totalProjectedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <Card className="p-6 flex flex-col justify-center">
          <span className="text-gray-400 font-bold uppercase text-xs tracking-widest block mb-2">Itens Revisados</span>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><CheckCircle size={20} /></div>
            <span className="text-2xl font-black text-gray-900">{executedItemsCount} / {expenseProjections.length}</span>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-center">
          <span className="text-gray-400 font-bold uppercase text-xs tracking-widest block mb-2">Linhas Totais</span>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-500"><Package size={20} /></div>
            <span className="text-2xl font-black text-gray-900">{expenseProjections.length}</span>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-900">Despesas Detalhadas</h3>
            <p className="text-gray-400 text-xs font-bold mt-1">Linhas de projecao + lancamentos reais do caixa.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider">Descricao</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider text-right">Valor Projetado</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider text-center">Status / Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenseProjections.map((item) => {
                const displayedAmount = item.amount;

                return (
                  <tr key={item.id} className={`transition-colors group ${item.isExecuted ? 'bg-emerald-50/50' : 'hover:bg-blue-50/30'}`}>
                    <td className="px-8 py-4">
                      <div className="font-bold text-gray-700 flex items-center gap-2">
                        {item.isExecuted && <CheckCircle size={16} className="text-emerald-500" />}
                        {item.label}
                        {item.categoryMapping && <span className="px-2 py-0.5 bg-gray-100 text-[9px] text-gray-400 rounded uppercase tracking-wide">Vinculado</span>}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-400 text-xs font-bold">R$</span>
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-32 p-2 rounded-lg border-2 border-blue-500 outline-none font-black text-right text-gray-900 bg-white"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className={`font-black text-lg ${item.isExecuted ? 'text-emerald-600' : 'text-gray-900'}`}>R$ {displayedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-center">
                      {editingId === item.id ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => saveEdit(item.id)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"><Save size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-2">
                          {!item.isExecuted ? (
                            <>
                              <button
                                onClick={() => initiateReview(item)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs hover:bg-blue-200 transition-colors"
                                title="Revisar e Importar para o Caixa"
                              >
                                <CheckSquare size={14} /> <span className="hidden md:inline">Revisar</span>
                              </button>
                              <div className="w-px h-6 bg-gray-200 mx-1" />
                              <button onClick={() => startEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => deleteProjectionItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full">
                                <CheckCircle size={12} /> Lancado
                              </span>
                              <button
                                onClick={() => undoExecution(item)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-bold text-xs hover:bg-red-200 transition-colors"
                              >
                                Desfazer
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {isAdding && (
                <tr className="bg-blue-50 animate-in fade-in">
                  <td className="px-8 py-4">
                    <input
                      placeholder="Nome da despesa"
                      value={newItem.label}
                      onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                      className="w-full p-2 bg-white border border-blue-200 rounded-lg outline-none font-bold text-sm focus:ring-2 ring-blue-100"
                      autoFocus
                    />
                  </td>
                  <td className="px-8 py-4 text-right">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                      className="w-32 p-2 bg-white border border-blue-200 rounded-lg outline-none font-bold text-sm text-right focus:ring-2 ring-blue-100"
                    />
                  </td>
                  <td className="px-8 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={handleAddItem} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"><Save size={16} /></button>
                      <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"><X size={16} /></button>
                    </div>
                  </td>
                </tr>
              )}

              <tr className="bg-gray-900 text-white">
                <td className="px-8 py-6 font-black uppercase tracking-widest text-xs">Total Projetado</td>
                <td className="px-8 py-6 text-right font-black text-2xl">R$ {totalProjectedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewItem(null)} />

          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-600 p-8 text-white">
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2"><CheckSquare size={24} /> Revisar e Importar</h3>
              <p className="text-blue-100 text-sm">Confirme os dados reais para lancar no caixa.</p>
            </div>

            <div className="p-8 space-y-6">
              {Number(reviewData.amount) !== reviewItem.amount && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Valor alterado em relacao a projecao original.
                </div>
              )}

              {reviewData.category === 'ALUGUEL_CHACARA' && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <Info size={16} />
                  Este item atualiza o custo fixo de aluguel, sem criar transacao duplicada.
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Descricao</label>
                <input
                  value={reviewData.description}
                  onChange={e => setReviewData({ ...reviewData, description: e.target.value })}
                  className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Valor Real</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input
                      type="number"
                      value={reviewData.amount}
                      onChange={e => setReviewData({ ...reviewData, amount: e.target.value })}
                      className="w-full p-4 pl-10 bg-gray-50 rounded-xl font-black text-gray-900 outline-none focus:ring-2 ring-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Data</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={reviewData.date}
                      onChange={e => setReviewData({ ...reviewData, date: e.target.value })}
                      className="w-full p-4 pl-10 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Categoria</label>
                <select
                  value={reviewData.category}
                  onChange={e => setReviewData({ ...reviewData, category: e.target.value as TransactionCategory })}
                  className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 ring-blue-100 appearance-none"
                >
                  <option value="OUTROS">Operacional / Outros</option>
                  <option value="ALUGUEL_CHACARA">Aluguel Chacara</option>
                  <option value="CANTINA">Cantina</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setReviewItem(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={confirmExecution} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <CheckCircle size={20} /> {reviewData.category === 'ALUGUEL_CHACARA' ? 'Atualizar Custo' : 'Lancar no Caixa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
