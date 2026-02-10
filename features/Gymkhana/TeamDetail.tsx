
import React, { useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, History, Users, Star } from 'lucide-react';
import { useAppStore } from '../../store';
import { TEAM_UI } from '../../constants';
import { TeamId } from '../../types';
import { Card } from '../../components/Shared';

export const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { scoreEvents, people, proofs } = useAppStore();

  if (!teamId || !TEAM_UI[teamId as TeamId]) return <Navigate to="/gincana/dash" />;

  const id = teamId as TeamId;
  const team = TEAM_UI[id];

  // Cálculos Específicos do Time
  const teamEvents = useMemo(() => 
    scoreEvents.filter(e => e.teamId === id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
  [scoreEvents, id]);

  const totalScore = teamEvents.reduce((acc, e) => acc + e.pointsDelta, 0);
  const memberCount = people.filter(p => p.teamId === id).length;

  // Pontuação por Prova (Agrupado)
  const proofPerformance = useMemo(() => {
    const map: Record<string, number> = {};
    teamEvents.forEach(e => {
       if (e.proofId) {
         map[e.proofId] = (map[e.proofId] || 0) + e.pointsDelta;
       }
    });
    return Object.entries(map)
      .map(([pid, score]) => ({ proof: proofs.find(p => p.id === pid), score }))
      .sort((a, b) => b.score - a.score); // Melhores provas primeiro
  }, [teamEvents, proofs]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-12">
      <button onClick={() => navigate('/gincana/dash')} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} /> Voltar ao Placar
      </button>

      {/* Header do Time */}
      <div className={`relative p-10 rounded-[3rem] overflow-hidden text-white shadow-2xl ${team.color}`}>
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 text-center md:text-left">
            <div>
               <div className="flex items-center justify-center md:justify-start gap-4 mb-4 opacity-90">
                  <Trophy size={32} />
                  <span className="font-black uppercase tracking-widest text-lg">{team.name}</span>
               </div>
               <h1 className="text-8xl font-black tracking-tighter">{totalScore}</h1>
               <p className="font-bold opacity-80 mt-2">Pontos Totais Acumulados</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/20 min-w-[200px]">
               <div className="flex items-center gap-3 mb-2">
                  <Users size={24} />
                  <span className="font-bold uppercase text-xs">Integrantes</span>
               </div>
               <span className="text-4xl font-black">{memberCount}</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Histórico Recente */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
              <History className="text-gray-400" /> Histórico de Pontuação
            </h3>
            
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
               {teamEvents.length === 0 ? (
                 <div className="p-10 text-center text-gray-400">Nenhum evento registrado.</div>
               ) : (
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                       <tr>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Motivo / Prova</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Origem</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-right">Pontos</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {teamEvents.map(e => {
                          const proof = proofs.find(p => p.id === e.proofId);
                          return (
                            <tr key={e.id} className="hover:bg-gray-50">
                               <td className="px-8 py-4">
                                  <span className="font-bold text-gray-900 block">{proof ? proof.title : e.reason}</span>
                                  {proof && <span className="text-xs text-gray-400">{e.reason}</span>}
                                  <span className="text-[10px] text-gray-300 block mt-1">{new Date(e.timestamp).toLocaleString()}</span>
                               </td>
                               <td className="px-8 py-4">
                                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-500">{e.source}</span>
                               </td>
                               <td className={`px-8 py-4 text-right font-black ${e.pointsDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {e.pointsDelta > 0 ? '+' : ''}{e.pointsDelta}
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
               )}
            </div>
         </div>

         {/* Melhores Provas */}
         <div className="space-y-6">
            <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
              <Star className="text-yellow-500" /> Destaques
            </h3>
            <div className="space-y-4">
               {proofPerformance.length === 0 && <p className="text-gray-400 text-sm">Nenhuma prova concluída.</p>}
               {proofPerformance.slice(0, 5).map((item, idx) => (
                 <Card key={idx} className="p-5 flex items-center justify-between border-l-4 border-l-yellow-400">
                    <div>
                       <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                          {idx + 1}º Melhor Desempenho
                       </span>
                       <h4 className="font-black text-gray-900">{item.proof?.title || 'Prova Desconhecida'}</h4>
                    </div>
                    <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg font-black text-sm">
                       {item.score} pts
                    </span>
                 </Card>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
