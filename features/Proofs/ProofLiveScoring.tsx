
import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Minus, Trophy, Star } from 'lucide-react';
import { useAppStore } from '../../store';
import { TEAM_UI } from '../../constants';
import { TeamId } from '../../types';

export const ProofLiveScoring = () => {
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

  const handleFinish = () => {
    if (confirm("Deseja confirmar o lançamento dessas pontuações no placar geral?")) {
      Object.entries(sessionPoints).forEach(([tid, pts]) => {
        const points = pts as number;
        if (points > 0) updateScore(tid as TeamId, points);
      });
      updateProof(proof.id, { status: 'Concluída' });
      navigate('/gincana/dash');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900">
          <ArrowLeft size={18} /> Cancelar Lançamento
        </button>
        <div className="flex items-center gap-3">
           <Trophy className="text-orange-500" size={24} />
           <h2 className="text-2xl font-black uppercase tracking-tighter">Pontuação: {proof.title}</h2>
        </div>
      </div>

      {/* Grid alterado para 3 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(['alianca', 'segredo', 'caminho'] as TeamId[]).map(tid => (
          <div key={tid} className={`bg-white p-8 rounded-[3.5rem] border-2 shadow-xl flex flex-col items-center justify-between transition-all gap-6 ${TEAM_UI[tid].border} ${sessionPoints[tid] > 0 ? 'scale-[1.03] shadow-2xl' : 'opacity-80'}`}>
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
                 <button onClick={() => handleAdjust(tid, -10)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"><Minus size={18} /></button>
                 <span className="text-3xl font-black text-gray-900">{sessionPoints[tid]}</span>
                 <button onClick={() => handleAdjust(tid, 10)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-colors"><Plus size={18} /></button>
               </div>
               <button onClick={() => handleAdjust(tid, proof.points)} className="text-[10px] font-black uppercase text-blue-500 hover:underline">Ganhou a Prova (+{proof.points})</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-black p-10 rounded-[4rem] text-white flex flex-col md:flex-row justify-between items-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="mb-6 md:mb-0">
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs mb-2">Resumo da Rodada</p>
          <div className="flex gap-4">
            {Object.entries(sessionPoints).map(([tid, pts]) => {
              const points = pts as number;
              return points > 0 && (
                <span key={tid} className="flex items-center gap-2 font-bold bg-white/10 px-3 py-1 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${TEAM_UI[tid as TeamId].color}`} /> {points}
                </span>
              );
            })}
          </div>
        </div>
        <button 
          onClick={handleFinish}
          className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-3xl font-black text-lg shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
        >
          <Save size={24} /> Confirmar Pontuação Geral
        </button>
      </div>
    </div>
  );
};
