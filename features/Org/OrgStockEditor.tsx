import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Trash2, AlertTriangle, CheckCircle, X, Plus } from 'lucide-react';
import { useAppStore } from '../../store';
import { Product } from '../../types';
import { archiveProduct, createProduct, listProducts, upsertProduct } from '../../lib/api/products';
import { createTransaction, listTransactions } from '../../lib/api/transactions';

const LOW_STOCK_THRESHOLD = 5;

export const OrgStockEditor = () => {
  const navigate = useNavigate();
  const { products, setProducts, updateProduct, setTransactions, addProjectionEntry, deleteProduct } = useAppStore();
  const [search, setSearch] = useState('');
  const [showStockCostReview, setShowStockCostReview] = useState(false);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const deletingProductIdRef = useRef<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  }, [setProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Local state to handle bulk edits before saving? 
  // No, user requested "Control Total", let's make it live or line-by-line. 
  // Live update with Zustand is fast enough.

  const filteredProducts = products.filter(p => 
     p.name.toLowerCase().includes(search.toLowerCase()) || 
     p.category.toLowerCase().includes(search.toLowerCase())
  );

  const calculateMargin = (sell: number, cost: number) => {
     if (sell === 0) return 0;
     return ((sell - cost) / sell) * 100;
  };

  const commitProductUpdate = async (productId: string) => {
    if (deletingProductIdRef.current === productId) return;

    const product = products.find((item) => item.id === productId);
    if (!product) return;

    try {
      await upsertProduct(product);
      if (deletingProductIdRef.current === productId) return;
      await fetchProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Nao foi possivel salvar o produto.");
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteError(null);
    setPendingDeleteProduct(product);
  };

  const confirmDeleteProduct = async () => {
    if (!pendingDeleteProduct) return;

    deletingProductIdRef.current = pendingDeleteProduct.id;
    setIsDeletingProduct(true);

    try {
      await archiveProduct(pendingDeleteProduct.id);
      deleteProduct(pendingDeleteProduct.id);
      await fetchProducts();
      setPendingDeleteProduct(null);
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setDeleteError(`Nao foi possivel remover o produto. Motivo: ${message}`);
    } finally {
      setIsDeletingProduct(false);
      deletingProductIdRef.current = null;
    }
  };

  const handleAddProduct = async () => {
    if (isAddingProduct) return;

    setIsAddingProduct(true);
    try {
      const now = new Date();
      const code = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      await createProduct({
        name: `Novo Produto ${code}`,
        category: 'Geral',
        stock: 0,
        minStock: LOW_STOCK_THRESHOLD,
        costPrice: 0,
        sellPrice: 0,
      });
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Nao foi possivel adicionar produto.');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const stockCostItems = useMemo(
    () =>
      products
        .filter((p) => p.stock > 0)
        .map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          costPrice: p.costPrice,
          total: p.stock * p.costPrice
        })),
    [products]
  );

  const stockCostTotal = useMemo(
    () => stockCostItems.reduce((acc, item) => acc + item.total, 0),
    [stockCostItems]
  );

  const openStockCostReview = () => {
    if (stockCostTotal <= 0) {
      alert('Nao ha custo de estoque para registrar.');
      return;
    }
    setShowStockCostReview(true);
  };

  const registerCurrentStockCost = async () => {
    const totalCost = stockCostTotal;
    if (totalCost <= 0) {
      alert('Nao ha custo de estoque para registrar.');
      return;
    }

    try {
      const now = new Date();
      const description = `Registro do Estoque Atual (${stockCostItems.length} produtos)`;
      const tx = await createTransaction({
        description,
        amount: totalCost,
        type: 'SAIDA',
        category: 'CANTINA',
        paymentMethod: 'Outro',
        date: now.toISOString()
      });

      addProjectionEntry({
        label: description,
        amount: totalCost,
        categoryMapping: 'CANTINA',
        isExecuted: true,
        executedTransactionId: tx.id,
        source: 'STOCK'
      });

      const refreshedTransactions = await listTransactions();
      setTransactions(refreshedTransactions);
      setShowStockCostReview(false);
    } catch (error) {
      console.error('Erro ao registrar gasto do estoque atual:', error);
      alert('Nao foi possivel registrar o gasto do estoque atual.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4 w-full md:w-auto">
           <button onClick={() => navigate('/org/canteen?tab=stock')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft size={24} className="text-gray-500" />
           </button>
           <div>
              <h2 className="text-2xl font-black tracking-tighter">Editor de Estoque</h2>
              <p className="text-gray-400 text-xs font-bold uppercase">Controle Total de Produtos</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl w-full md:w-auto">
           <Search size={18} className="text-gray-400" />
           <input 
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Filtrar produtos..."
             className="bg-transparent outline-none font-bold text-sm w-full"
           />
        </div>
        <button
          onClick={openStockCostReview}
          className="w-full md:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
        >
          Registrar Gasto do Estoque Atual
        </button>
        <button
          onClick={handleAddProduct}
          disabled={isAddingProduct}
          className="w-full md:w-auto px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Plus size={16} />
          {isAddingProduct ? 'Adicionando...' : 'Adicionar Linha'}
        </button>
      </div>

      <div className="md:hidden space-y-3">
         {filteredProducts.map(p => {
            const margin = calculateMargin(p.sellPrice, p.costPrice);
            const isLowMargin = margin < 30;

            return (
               <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <input
                    value={p.name}
                    onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                    onBlur={() => commitProductUpdate(p.id)}
                    className="w-full bg-transparent font-black text-base outline-none border-b border-transparent focus:border-blue-500"
                  />
                  <input
                    value={p.category}
                    onChange={(e) => updateProduct(p.id, { category: e.target.value })}
                    onBlur={() => commitProductUpdate(p.id)}
                    className="w-full bg-transparent font-medium text-gray-500 text-sm outline-none border-b border-transparent focus:border-blue-500"
                  />

                  <div className="grid grid-cols-3 gap-2">
                     <input
                       type="number"
                       value={p.stock}
                       onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) })}
                       onBlur={() => commitProductUpdate(p.id)}
                       className={`w-full rounded-lg py-2 px-2 text-center font-bold text-sm outline-none focus:ring-2 focus:ring-blue-200 ${p.stock < LOW_STOCK_THRESHOLD ? 'text-red-500 bg-red-50' : 'text-gray-900 bg-gray-50'}`}
                     />
                     <input
                       type="number"
                       step="0.01"
                       value={p.costPrice}
                       onChange={(e) => updateProduct(p.id, { costPrice: Number(e.target.value) })}
                       onBlur={() => commitProductUpdate(p.id)}
                       className="w-full border border-gray-200 rounded-lg py-2 px-2 text-center font-medium text-sm outline-none focus:border-blue-500"
                     />
                     <input
                       type="number"
                       step="0.01"
                       value={p.sellPrice}
                       onChange={(e) => updateProduct(p.id, { sellPrice: Number(e.target.value) })}
                       onBlur={() => commitProductUpdate(p.id)}
                       className="w-full border border-gray-200 rounded-lg py-2 px-2 text-center font-black text-sm outline-none focus:border-blue-500"
                     />
                  </div>

                  <div className="flex items-center justify-between">
                     <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${isLowMargin ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        Margem {margin.toFixed(1)}%
                     </span>
                     <button
                       onClick={() => handleDeleteProduct(p)}
                       className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                       title="Excluir produto"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
               </div>
            );
         })}
         {filteredProducts.length === 0 && <div className="p-10 text-center text-gray-400">Nenhum produto encontrado.</div>}
      </div>

      <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                 <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Produto</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider w-32">Estoque</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider w-32">R$ Custo</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider w-32">R$ Venda</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Margem</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Ações</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {filteredProducts.map(p => {
                    const margin = calculateMargin(p.sellPrice, p.costPrice);
                    const isLowMargin = margin < 30;

                    return (
                       <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-3">
                             <input 
                               value={p.name}
                               onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                               onBlur={() => commitProductUpdate(p.id)}
                               className="w-full bg-transparent font-bold text-gray-900 outline-none border-b border-transparent focus:border-blue-500 transition-all"
                             />
                          </td>
                          <td className="px-6 py-3">
                             <input 
                               value={p.category}
                               onChange={(e) => updateProduct(p.id, { category: e.target.value })}
                               onBlur={() => commitProductUpdate(p.id)}
                               className="w-full bg-transparent font-medium text-gray-500 text-sm outline-none border-b border-transparent focus:border-blue-500 transition-all"
                             />
                          </td>
                          <td className="px-6 py-3">
                             <input 
                               type="number"
                               value={p.stock}
                               onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) })}
                               onBlur={() => commitProductUpdate(p.id)}
                               className={`w-full bg-gray-50 rounded-lg py-1 px-2 text-center font-bold text-sm outline-none focus:ring-2 focus:ring-blue-200 ${p.stock < LOW_STOCK_THRESHOLD ? 'text-red-500 bg-red-50' : 'text-gray-900'}`}
                             />
                          </td>
                          <td className="px-6 py-3">
                             <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={p.costPrice}
                                  onChange={(e) => updateProduct(p.id, { costPrice: Number(e.target.value) })}
                                  onBlur={() => commitProductUpdate(p.id)}
                                  className="w-full bg-white border border-gray-200 rounded-lg py-1 pl-6 pr-2 text-right font-medium text-sm outline-none focus:border-blue-500"
                                />
                             </div>
                          </td>
                          <td className="px-6 py-3">
                             <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={p.sellPrice}
                                  onChange={(e) => updateProduct(p.id, { sellPrice: Number(e.target.value) })}
                                  onBlur={() => commitProductUpdate(p.id)}
                                  className="w-full bg-white border border-gray-200 rounded-lg py-1 pl-6 pr-2 text-right font-black text-gray-900 text-sm outline-none focus:border-blue-500"
                                />
                             </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                             <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${isLowMargin ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {margin.toFixed(1)}%
                             </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                             <button
                               onClick={() => handleDeleteProduct(p)}
                               className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                               title="Excluir produto"
                             >
                               <Trash2 size={16} />
                             </button>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
           {filteredProducts.length === 0 && <div className="p-10 text-center text-gray-400">Nenhum produto encontrado.</div>}
         </div>
      </div>

      {showStockCostReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowStockCostReview(false)} />
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 p-8 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <button onClick={() => setShowStockCostReview(false)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>

            <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="text-emerald-600" /> Confirmar Registro do Estoque Atual
            </h2>
            <p className="text-gray-500 mb-6">Revise os detalhes antes de lancar no Caixa e no Detalhamento de Custos.</p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-bold text-xs uppercase">Produtos com estoque</span>
                <span className="font-black text-gray-900">{stockCostItems.length}</span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {stockCostItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm bg-white border border-gray-100 rounded-xl p-3">
                    <div>
                      <div className="font-bold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.stock} x R$ {item.costPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="font-black text-gray-900">R$ {item.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-black uppercase">Total a Lancar</span>
                <span className="text-3xl font-black text-emerald-600">R$ {stockCostTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStockCostReview(false)}
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={registerCurrentStockCost}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} /> Confirmar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPendingDeleteProduct(null)} />
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 p-8 animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Excluir Produto?
            </h2>
            <p className="text-gray-500 mb-6">Confirme a exclusao do item abaixo.</p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold text-xs uppercase">Produto</span>
                <span className="font-black text-gray-900">{pendingDeleteProduct.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold text-xs uppercase">Categoria</span>
                <span className="font-bold text-gray-700">{pendingDeleteProduct.category}</span>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setPendingDeleteProduct(null)}
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors"
                disabled={isDeletingProduct}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                disabled={isDeletingProduct}
              >
                {isDeletingProduct ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



