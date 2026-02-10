
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import { Product } from '../../types';

export const OrgStockEditor = () => {
  const navigate = useNavigate();
  const { products, updateProduct } = useAppStore();
  const [search, setSearch] = useState('');
  
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

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4 w-full md:w-auto">
           <button onClick={() => navigate('/org/canteen')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
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
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
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
                               className="w-full bg-transparent font-bold text-gray-900 outline-none border-b border-transparent focus:border-blue-500 transition-all"
                             />
                          </td>
                          <td className="px-6 py-3">
                             <input 
                               value={p.category}
                               onChange={(e) => updateProduct(p.id, { category: e.target.value })}
                               className="w-full bg-transparent font-medium text-gray-500 text-sm outline-none border-b border-transparent focus:border-blue-500 transition-all"
                             />
                          </td>
                          <td className="px-6 py-3">
                             <input 
                               type="number"
                               value={p.stock}
                               onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) })}
                               className={`w-full bg-gray-50 rounded-lg py-1 px-2 text-center font-bold text-sm outline-none focus:ring-2 focus:ring-blue-200 ${p.stock < p.minStock ? 'text-red-500 bg-red-50' : 'text-gray-900'}`}
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
                                  className="w-full bg-white border border-gray-200 rounded-lg py-1 pl-6 pr-2 text-right font-black text-gray-900 text-sm outline-none focus:border-blue-500"
                                />
                             </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                             <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${isLowMargin ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {margin.toFixed(1)}%
                             </span>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
           {filteredProducts.length === 0 && <div className="p-10 text-center text-gray-400">Nenhum produto encontrado.</div>}
         </div>
      </div>
    </div>
  );
};
