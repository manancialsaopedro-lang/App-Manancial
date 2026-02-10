
import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertCircle, Trophy, Play, CheckSquare, Package, Gavel } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';

export const ProofDetail = () => {
  const { proofId } = useParams();
  const navigate = useNavigate();
  const { proofs, updateProof, materials } = useAppStore();
  const [activeTab, setActiveTab] = useState<'info' | 'materials'>('info');
  
  const proof = proofs.find(p => p.id === proofId);
  if (!proof) return <Navigate to="/gincana/proofs" />;

  const proofMaterials = materials.filter(m => m.proofId === proof.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-12">
      <button onClick={() => navigate('/gincana/proofs')} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} /> Voltar para a lista
      </button>

      {/* Header Principal */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
            <div>
              <h2 className="text-5xl font-black tracking-tight text-gray-900 mb-4">{proof.title}</h2>
              <div className="flex gap-3">
                 <span className="bg-orange-100 text-orange-600 px-5 py-2 rounded-2xl font-black flex items-center gap-2">
                   <Trophy size={16} /> +{proof.points} Pontos
                 </span>
                 <span className={`px-5 py-2 rounded-2xl font-black border ${proof.status === 'Concluída' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                   {proof.status}
                 </span>
              </div>
            </div>
            
            <div className="flex gap-3">
               <button 
                 onClick={() => navigate(`/gincana/proofs/${proof.id}/julgar`)}
                 className="px-6 py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl font-black flex items-center gap-2 transition-colors shadow-sm"
               >
                 <Gavel size={18} /> Julgar
               </button>
               <button 
                 onClick={() => navigate(`/gincana/proofs/${proof.id}/executar`)}
                 className="px-8 py-4 bg-black text-white rounded-2xl font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
               >
                 <Play size={18} /> Executar Prova
               </button>
            </div>
          </div>

          {/* Navegação de Abas */}
          <div className="flex gap-6 border-b border-gray-100 mb-8">
             <button 
               onClick={() => setActiveTab('info')}
               className={`pb-4 font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === 'info' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Informações
             </button>
             <button 
               onClick={() => setActiveTab('materials')}
               className={`pb-4 font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === 'materials' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Materiais ({proofMaterials.length})
             </button>
          </div>

          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in">
              <section>
                <div className="flex items-center gap-3 mb-4 text-orange-500">
                  <BookOpen size={24} />
                  <h3 className="text-xl font-black uppercase tracking-widest text-gray-900">Descrição</h3>
                </div>
                <textarea 
                  value={proof.description}
                  onChange={(e) => updateProof(proof.id, { description: e.target.value })}
                  className="w-full h-32 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 ring-orange-100 outline-none text-gray-600 font-medium resize-none"
                />
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4 text-blue-500">
                  <AlertCircle size={24} />
                  <h3 className="text-xl font-black uppercase tracking-widest text-gray-900">Regras</h3>
                </div>
                <textarea 
                  value={proof.rules || ''}
                  onChange={(e) => updateProof(proof.id, { rules: e.target.value })}
                  placeholder="Defina as regras aqui..."
                  className="w-full h-32 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 focus:ring-2 ring-blue-100 outline-none text-gray-600 font-medium resize-none"
                />
              </section>
            </div>
          )}

          {activeTab === 'materials' && (
             <div className="animate-in fade-in space-y-4">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-black text-gray-900 text-lg flex items-center gap-2"><Package size={20} /> Checklist de Materiais</h3>
                   <button onClick={() => navigate('/gincana/materiais')} className="text-xs font-bold text-orange-500 hover:underline">Gerenciar Todos</button>
                </div>
                
                {proofMaterials.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">Nenhum material vinculado a esta prova.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {proofMaterials.map(m => (
                       <Card key={m.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${m.isAcquired ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-200'}`}>
                                {m.isAcquired && <CheckSquare size={14} />}
                             </div>
                             <span className={`font-bold ${m.isAcquired ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{m.name}</span>
                          </div>
                          <span className="bg-gray-100 text-gray-600 text-xs font-black px-2 py-1 rounded">{m.quantity} un</span>
                       </Card>
                     ))}
                  </div>
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
