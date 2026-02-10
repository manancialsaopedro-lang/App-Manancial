
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store';

export const ProofsList = () => {
  const { proofs } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in">
      {proofs.map(proof => (
        <div key={proof.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-6">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${proof.status === 'Concluída' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{proof.status}</span>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 font-black">+{proof.points}</div>
          </div>
          <h3 className="text-2xl font-black mb-3 text-gray-900">{proof.title}</h3>
          <p className="text-gray-500 font-medium mb-10 text-sm line-clamp-2">{proof.description}</p>
          
          <div className="mt-auto space-y-3">
            <button 
              onClick={() => navigate(`/gincana/proofs/${proof.id}`)} 
              className="w-full py-4 bg-gray-50 rounded-2xl font-black text-xs hover:bg-gray-100 flex items-center justify-center gap-2 group transition-all"
            >
              Ver Regras <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate(`/gincana/proofs/${proof.id}/pontuacao`)}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Pontuação ao Vivo
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
