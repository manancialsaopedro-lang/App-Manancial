
import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Minus, Trophy, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import { TEAM_UI } from '../../constants';
import { TeamId } from '../../types';

export const ProofRun = () => {
  const { proofId } = useParams();
  const navigate = useNavigate();
  const { proofs, updateScore, updateProof } = useAppStore();
  
  const proof = proofs.find(p => p.id === proofId);
  const [sessionPoints, setSessionPoints] = useState<Record<TeamId, number>>({
    alianca: 0, segredo: 0, caminho: 0, org: 0, none: 0
  });

  if (!proof) return <Navigate to="/gincana/proofs" />;

  const handleAdjust = (tid: TeamId, amount: number) => {
    setSessionPoints(prev => ({ ...prev, [tid]: Math.max(0, prev[tid] + amount) }));
  };

  const handleCommit = () => {
    const hasPoints = (Object.values(sessionPoints) as number[]).some(p => p > 0);
    if (!hasPoints) return alert("Nenhuma pontuação para lançar.");

    if (confirm("Lançar pontuações no placar geral?")) {
      Object.entries(sessionPoints).forEach(([tid, pts]) => {
        const points = pts as number;
        if (points > 0) {
          updateScore(tid as TeamId, points, `Execução: ${proof.title}`, proof.id, 'MANUAL');
        }
      });
      // Reset session
      setSessionPoints({ alianca: 0, segredo: 0, caminho: 0, org: 0, none: 0 });
      alert("Pontos lançados com sucesso!");
    }
  };

  const handleFinishProof = () => {
     if (confirm("Deseja marcar esta prova como CONCLUÍDA?")) {
        updateProof(proof.id, { status: 'Concluída' });
        navigate('/gincana/dash');
     }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-4 z-40">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900">
          <ArrowLeft size={18} /> Sair
        </button>
        <div className="flex items-center gap-3">
           <div className={`w-3 h-3 rounded-full ${proof.status === 'Concluída' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
           <h2 className="text-xl font-black uppercase tracking-tighter">Execução: {proof.title}</h2>
        </div>
        <button onClick={handleFinishProof} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors">
           Encerrar Prova
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(['alianca', 'segredo', 'caminho'] as TeamId[]).map(tid => (
          <div key={tid} className={`bg-white p-8 rounded-[3.5rem] border-2 shadow-xl flex flex-col items-center justify-between transition-all gap-6 ${TEAM_UI[tid].border} ${sessionPoints[tid] > 0 ? 'scale-[1.03] shadow-2xl ring-4 ring-offset-4 ring-gray-100' : ''}`}>
            <div className="flex items-center gap-4 w-full">
              <div className={`w-14 h-14 shrink-0 ${TEAM_UI[tid].color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <Star size={24} />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Equipe</span>
                <h4 className="text-xl font-black text-gray-900 truncate">{TEAM_UI[tid].name}</h4>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
               <div className="flex items-center justify-between w-full bg-gray-50 p-2 rounded-2xl border border-gray-100">
                 <button onClick={() => handleAdjust(tid, -10)} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"><Minus size={20} /></button>
                 <span className="text-4xl font-black text-gray-900 tabular-nums">{sessionPoints[tid]}</span>
                 <button onClick={() => handleAdjust(tid, 10)} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-colors"><Plus size={20} /></button>
               </div>
               <div className="grid grid-cols-2 gap-2 w-full">
                  <button onClick={() => handleAdjust(tid, 50)} className="py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-100">+50</button>
                  <button onClick={() => handleAdjust(tid, proof.points)} className="py-2 bg-orange-50 text-orange-600 rounded-xl font-black text-xs hover:bg-orange-100">WIN (+{proof.points})</button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md p-4 rounded-[2rem] text-white flex items-center gap-6 shadow-2xl z-50 border border-white/10">
        <div className="pl-4">
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">Total a Lançar</p>
          <div className="flex gap-3">
            {Object.entries(sessionPoints).map(([tid, pts]) => {
              const points = pts as number;
              return points > 0 && (
                <span key={tid} className="flex items-center gap-2 font-bold bg-white/10 px-3 py-1 rounded-lg text-sm">
                  <div className={`w-2 h-2 rounded-full ${TEAM_UI[tid as TeamId].color}`} /> {points}
                </span>
              );
            })}
            {!(Object.values(sessionPoints) as number[]).some(p => p > 0) && <span className="text-gray-600 text-sm italic">Nenhum ponto...</span>}
          </div>
        </div>
        <button 
          onClick={handleCommit}
          disabled={!(Object.values(sessionPoints) as number[]).some(p => p > 0)}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg transition-all flex items-center gap-2"
        >
          <Save size={20} /> LANÇAR
        </button>
      </div>
    </div>
  );
};
