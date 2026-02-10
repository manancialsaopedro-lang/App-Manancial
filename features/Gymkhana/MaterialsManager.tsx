
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckSquare, Square, Layers, List, Edit2, Check, X } from 'lucide-react';
import { useAppStore } from '../../store';
import { Material } from '../../types';

export const MaterialsManager = () => {
  const navigate = useNavigate();
  const { materials, proofs, addMaterial, updateMaterial, deleteMaterial } = useAppStore();
  const [viewMode, setViewMode] = useState<'category' | 'proof'>('proof');
  
  // --- STATES FOR EDITING ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{name: string, qty: number, cat: string}>({ name: '', qty: 0, cat: '' });

  // --- STATES FOR ADDING (Inline at bottom of group) ---
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null); // Stores the ProofID or CategoryName we are adding to
  const [newValues, setNewValues] = useState<{name: string, qty: string}>({ name: '', qty: '' });

  // --- ACTIONS ---

  const startEditing = (m: Material) => {
    setEditingId(m.id);
    setEditValues({ name: m.name, qty: m.quantity, cat: m.category });
  };

  const saveEdit = (id: string) => {
    updateMaterial(id, { name: editValues.name, quantity: editValues.qty, category: editValues.cat });
    setEditingId(null);
  };

  const startAdding = (groupId: string) => {
    setAddingToGroupId(groupId);
    setNewValues({ name: '', qty: '' });
  };

  const cancelAdding = () => {
    setAddingToGroupId(null);
    setNewValues({ name: '', qty: '' });
  };

  const saveNewItem = (groupId: string, isProofMode: boolean) => {
    if (newValues.name) {
       addMaterial({
         name: newValues.name,
         quantity: Number(newValues.qty) || 1,
         category: isProofMode ? 'Geral' : groupId, // If in category mode, groupId IS the category name
         proofId: isProofMode && groupId !== 'geral' ? groupId : undefined,
         isAcquired: false
       });
       // Keep adding mode open for rapid entry, just clear input
       setNewValues({ name: '', qty: '' });
    }
  };

  // --- GROUPING LOGIC ---

  const groupedByCategory = materials.reduce((acc, m) => {
     const cat = m.category || 'Geral';
     if (!acc[cat]) acc[cat] = [];
     acc[cat].push(m);
     return acc;
  }, {} as Record<string, Material[]>);

  const groupedByProof = materials.reduce((acc, m) => {
     const key = m.proofId || 'geral';
     if (!acc[key]) acc[key] = [];
     acc[key].push(m);
     return acc;
  }, {} as Record<string, Material[]>);

  const getProofTitle = (id: string) => {
     if (id === 'geral') return 'Uso Geral / Diversos';
     const p = proofs.find(proof => proof.id === id);
     return p ? p.title : 'Atividade Desconhecida';
  };

  // --- RENDER HELPERS ---
  
  const renderMaterialRow = (m: Material, showCategoryLabel: boolean) => {
    const isEditing = editingId === m.id;

    if (isEditing) {
      return (
        <div key={m.id} className="p-3 bg-blue-50 border-b border-blue-200 flex items-center gap-3 animate-in fade-in">
           <input 
             className="flex-1 bg-white p-2 rounded-lg border border-blue-200 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-blue-300"
             value={editValues.name}
             onChange={e => setEditValues({...editValues, name: e.target.value})}
             placeholder="Nome do Item"
             autoFocus
           />
           <input 
             type="number"
             className="w-20 bg-white p-2 rounded-lg border border-blue-200 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-blue-300 text-center"
             value={editValues.qty}
             onChange={e => setEditValues({...editValues, qty: Number(e.target.value)})}
             placeholder="Qtd"
           />
           {showCategoryLabel && (
             <input 
               className="w-24 bg-white p-2 rounded-lg border border-blue-200 text-xs font-bold text-gray-900 outline-none focus:ring-2 ring-blue-300"
               value={editValues.cat}
               onChange={e => setEditValues({...editValues, cat: e.target.value})}
               placeholder="Categoria"
             />
           )}
           <button onClick={() => saveEdit(m.id)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Check size={16} /></button>
           <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      );
    }

    return (
      <div key={m.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex justify-between items-center group transition-colors">
         <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => updateMaterial(m.id, { isAcquired: !m.isAcquired })}>
            <button className="shrink-0 transition-transform active:scale-90">
               {m.isAcquired ? <CheckSquare className="text-emerald-500" /> : <Square className="text-gray-300 group-hover:text-gray-400" />}
            </button>
            <div className="flex-1">
               <p className={`font-bold transition-all ${m.isAcquired ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{m.name}</p>
               {showCategoryLabel && <p className="text-[10px] text-gray-400 font-bold uppercase">{m.category}</p>}
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-black min-w-[30px] text-center">{m.quantity}</span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => startEditing(m)} className="p-2 text-gray-300 hover:text-blue-500 transition-colors" title="Editar"><Edit2 size={16} /></button>
               <button onClick={() => deleteMaterial(m.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors" title="Excluir"><Trash2 size={16} /></button>
            </div>
         </div>
      </div>
    );
  };

  const renderAddRow = (groupId: string, isProofMode: boolean) => {
     const isAdding = addingToGroupId === groupId;

     if (isAdding) {
        return (
           <div className="p-3 bg-blue-50/50 border-t border-blue-100 flex items-center gap-3 animate-in slide-in-from-top-1">
              <div className="w-6 shrink-0" /> {/* Spacer for checkbox */}
              <input 
                 className="flex-1 bg-white p-2 rounded-lg border border-blue-200 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-blue-300 placeholder:font-normal"
                 placeholder="Novo item..."
                 value={newValues.name}
                 onChange={e => setNewValues({...newValues, name: e.target.value})}
                 autoFocus
                 onKeyDown={(e) => {
                    if (e.key === 'Enter') saveNewItem(groupId, isProofMode);
                    if (e.key === 'Escape') cancelAdding();
                 }}
              />
              <input 
                 type="number"
                 className="w-20 bg-white p-2 rounded-lg border border-blue-200 text-sm font-bold text-gray-900 outline-none focus:ring-2 ring-blue-300 text-center placeholder:font-normal"
                 placeholder="Qtd"
                 value={newValues.qty}
                 onChange={e => setNewValues({...newValues, qty: e.target.value})}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter') saveNewItem(groupId, isProofMode);
                 }}
              />
              <button onClick={() => saveNewItem(groupId, isProofMode)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"><Check size={16} /></button>
              <button onClick={cancelAdding} className="p-2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
           </div>
        );
     }

     return (
        <button 
           onClick={() => startAdding(groupId)}
           className="w-full py-3 flex items-center justify-center gap-2 border-t border-transparent text-gray-300 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-all group font-bold text-sm"
        >
           <span className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
              <Plus size={16} /> Adicionar Item
           </span>
        </button>
     );
  };

  // --- MAIN RENDER ---

  const groups = viewMode === 'proof' ? groupedByProof : groupedByCategory;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
       {/* HEADER & CONTROLS */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/gincana/dash')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
               <ArrowLeft size={24} className="text-gray-500" />
            </button>
            <div>
              <h2 className="text-3xl font-black tracking-tighter">Materiais & Checklist</h2>
              <p className="text-gray-400 font-medium">Gerencie itens diretamente na lista.</p>
            </div>
         </div>
         
         <div className="bg-white p-1 rounded-xl border border-gray-100 flex shadow-sm">
            <button onClick={() => setViewMode('proof')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${viewMode === 'proof' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
               <Layers size={16} /> Por Atividade
            </button>
            <button onClick={() => setViewMode('category')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${viewMode === 'category' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
               <List size={16} /> Por Categoria
            </button>
         </div>
       </div>

       {/* GRID DE CARDS */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {Object.entries(groups).map(([groupId, items]) => {
             const matItems = items as Material[];
             const acquiredCount = matItems.filter(i => i.isAcquired).length;
             const totalCount = matItems.length;
             const progress = totalCount > 0 ? (acquiredCount / totalCount) * 100 : 0;
             const isComplete = totalCount > 0 && progress === 100;
             const title = viewMode === 'proof' ? getProofTitle(groupId) : groupId;

             return (
               <div key={groupId} className="space-y-4 flex flex-col">
                  {/* Card Header */}
                  <div className="flex justify-between items-end px-2">
                     <h3 className={`font-black text-lg max-w-[70%] leading-tight ${groupId === 'geral' ? 'text-gray-500' : 'text-gray-900'}`}>
                        {title}
                     </h3>
                     <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {acquiredCount}/{totalCount} OK
                     </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-orange-400'}`} style={{ width: `${progress}%` }} />
                  </div>

                  {/* List Container */}
                  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                     {matItems.map(m => renderMaterialRow(m, viewMode === 'proof'))}
                     {renderAddRow(groupId, viewMode === 'proof')}
                  </div>
               </div>
             );
          })}
          
       </div>
    </div>
  );
};
