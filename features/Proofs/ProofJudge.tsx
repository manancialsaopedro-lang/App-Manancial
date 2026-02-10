
import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel, CheckCircle, User } from 'lucide-react';
import { useAppStore } from '../../store';
import { TEAM_UI } from '../../constants';
import { TeamId } from '../../types';
import { Card } from '../../components/Shared';

export const ProofJudge = () => {
  const { proofId } = useParams();
  const navigate = useNavigate();
  const { proofs, registerJudgeEvaluation } = useAppStore();
  
  const proof = proofs.find(p => p.id === proofId);
  const [judgeName, setJudgeName] = useState('Jurado 1');
  const [activeTeam, setActiveTeam] = useState<TeamId>('alianca');
  
  // Critérios
  const criteriaList = ['Criatividade', 'Execução', 'Organização', 'Cooperação'];
  const [scores, setScores] = useState<Record<string, number>>({});

  if (!proof) return <Navigate to="/gincana/proofs" />;

  const handleScoreChange = (criterion: string, val: number) => {
    setScores(prev => ({ ...prev, [criterion]: val }));
  };

  const totalScore = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);

  const handleSubmit = () => {
    if (confirm(`Confirmar nota ${totalScore} para ${TEAM_UI[activeTeam].name}?`)) {
       registerJudgeEvaluation({
         proofId: proof.id,
         teamId: activeTeam,
         judgeName,
         criteria: scores,
         totalPoints: totalScore
       });
       alert("Avaliação registrada!");
       setScores({});
       // Opcional: navegar para próxima equipe
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 pb-20">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl">
           <Gavel size={18} />
           <span className="font-black text-sm uppercase">Modo Jurado</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
         <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><User size={24} /></div>
         <div className="flex-1">
            <span className="text-xs font-bold text-gray-400 uppercase">Identificação</span>
            <input 
              value={judgeName} 
              onChange={e => setJudgeName(e.target.value)} 
              className="w-full font-black text-gray-900 outline-none border-b border-transparent focus:border-gray-200" 
            />
         </div>
      </div>

      {/* Seletor de Equipe */}
      <div className="flex gap-4 overflow-x-auto pb-4">
         {(['alianca', 'segredo', 'caminho'] as TeamId[]).map(tid => (
            <button 
               key={tid}
               onClick={() => setActiveTeam(tid)}
               className={`flex-1 min-w-[120px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${activeTeam === tid ? `${TEAM_UI[tid].border} ${TEAM_UI[tid].light} ring-2 ring-offset-2 ring-gray-200` : 'border-gray-100 bg-white grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}
            >
               <div className={`w-8 h-8 rounded-full ${TEAM_UI[tid].color}`} />
               <span className="font-black text-xs uppercase text-gray-700">{TEAM_UI[tid].name}</span>
            </button>
         ))}
      </div>

      <Card className="p-8 border-t-4 border-t-purple-500">
         <h2 className="text-2xl font-black text-gray-900 mb-6">Avaliação: {proof.title}</h2>
         
         <div className="space-y-8">
            {criteriaList.map(c => (
               <div key={c}>
                  <div className="flex justify-between mb-2">
                     <span className="font-bold text-gray-700">{c}</span>
                     <span className="font-black text-purple-600">{scores[c] || 0} / 10</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="10" step="1"
                    value={scores[c] || 0}
                    onChange={(e) => handleScoreChange(c, Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
               </div>
            ))}
         </div>

         <div className="mt-10 pt-10 border-t border-gray-100 flex justify-between items-center">
            <div>
               <span className="text-xs font-bold uppercase text-gray-400 block">Nota Final</span>
               <span className="text-5xl font-black text-gray-900">{totalScore}</span>
            </div>
            <button 
              onClick={handleSubmit}
              className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-purple-500/30 hover:bg-purple-500 transition-all flex items-center gap-2"
            >
              <CheckCircle size={20} /> Confirmar Avaliação
            </button>
         </div>
      </Card>
    </div>
  );
};
