
import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, History, Minus, Plus } from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';
import { TEAM_UI } from '../../constants';
import { TeamId } from '../../types';
import { Card } from '../../components/Shared';

export const ScorePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scoreEvents, updateScore } = useAppStore();
  const { activeRole, canAccessGincana } = useCurrentRole();
  const canManageGincana = ['admin', 'pastoral', 'primeiro_pastor', 'segundo_pastor', 'gincana'].includes(activeRole);

  const computedScores = useMemo(() => {
    const scores: Record<string, number> = { alianca: 0, segredo: 0, caminho: 0, org: 0, none: 0 };
    scoreEvents.forEach(e => {
      if (scores[e.teamId] !== undefined) {
        scores[e.teamId] += e.pointsDelta;
      }
    });
    return scores;
  }, [scoreEvents]);

  const sortedTeams = (['alianca', 'segredo', 'caminho'] as TeamId[]).sort((a, b) => computedScores[b] - computedScores[a]);

  // Função para ajuste rápido manual (somente coordenação da gincana/liderança)
  const handleQuickAdjust = (e: React.MouseEvent, teamId: TeamId, amount: number) => {
    e.stopPropagation();
    if (!canManageGincana) return;
    updateScore(teamId, amount, 'Ajuste Rápido (Placar)', undefined, 'MANUAL');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-12 min-w-0 w-full max-w-full overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              canAccessGincana
                ? '/gincana/dash'
                : location.pathname.startsWith('/membro')
                ? '/membro/home'
                : '/acampamento'
            )
          }
          className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Voltar"
        >
           <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
           <h2 className="text-3xl font-black tracking-tighter">Placar Geral</h2>
           <p className="text-gray-400 font-medium">Pontuação detalhada em tempo real.</p>
        </div>
      </div>

      {/* BIG CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Indicador de Líder (Coroa) */}
        <div className="absolute -top-6 right-6 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-xl z-20 flex items-center gap-2 animate-bounce">
           <Trophy size={18} /> Líder Atual
        </div>

        {sortedTeams.map((tid, index) => (
          <div 
            key={tid} 
            onClick={() => canAccessGincana && navigate(`/gincana/equipes/${tid}`)}
            className={`${canAccessGincana ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl' : ''} group relative overflow-hidden rounded-[3.5rem] p-8 sm:p-10 flex flex-col items-center text-center shadow-lg transition-all border-4 ${TEAM_UI[tid].border} ${TEAM_UI[tid].light}`}
          >
             {/* Background Glow */}
             <div className={`absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-[80px] -mr-20 -mt-20 transition-transform group-hover:scale-150 ${TEAM_UI[tid].color}`} />
             
             {/* Rank Badge */}
             <div className="absolute top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-gray-400 shadow-sm text-sm">
                #{index + 1}
             </div>

             <div className={`w-24 h-24 ${TEAM_UI[tid].color} rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg relative z-10 transform group-hover:rotate-6 transition-transform`}>
                <Trophy size={40} />
             </div>
             
             <span className={`text-sm font-black uppercase tracking-[0.2em] ${TEAM_UI[tid].text} mb-2 relative z-10`}>{TEAM_UI[tid].name}</span>
             <span className="text-6xl sm:text-8xl font-black relative z-10 text-gray-900 tracking-tighter">{computedScores[tid]}</span>
             <span className="text-gray-400 font-bold text-xs uppercase mt-2">Pontos Totais</span>

             {/* Controles de Ajuste Rápido (somente Coordenação Gincana / Pastores) */}
             {canManageGincana && (
               <div className="flex gap-2 mt-8 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity translate-y-0 duration-300 relative z-20">
                  <button 
                    type="button"
                    onClick={(e) => handleQuickAdjust(e, tid, -10)}
                    className="w-12 h-12 bg-white rounded-xl shadow-md border border-gray-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="-10 Pontos"
                  >
                     <Minus size={20} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleQuickAdjust(e, tid, 10)}
                    className="w-12 h-12 bg-white rounded-xl shadow-md border border-gray-100 text-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                    title="+10 Pontos"
                  >
                     <Plus size={20} />
                  </button>
               </div>
             )}
          </div>
        ))}
      </div>

      {/* HISTÓRICO RECENTE COMPLETO */}
      <div className="mt-12">
        <h3 className="font-black text-gray-900 text-2xl flex items-center gap-2 mb-6">
          <History className="text-gray-400" /> Histórico Completo de Pontos
        </h3>
        
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-w-0 w-full">
           <div className="overflow-x-auto w-full">
             <table className="w-full min-w-[540px] text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                   <tr>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black uppercase text-gray-400">Hora</th>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black uppercase text-gray-400">Equipe</th>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black uppercase text-gray-400">Motivo</th>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black uppercase text-gray-400">Origem</th>
                      <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] font-black uppercase text-gray-400 text-right">Pontos</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {scoreEvents.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-4 sm:px-8 py-4 text-xs font-bold text-gray-400 whitespace-nowrap">
                            {new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </td>
                         <td className="px-4 sm:px-8 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${TEAM_UI[e.teamId].color}`} />
                               <span className="font-bold text-gray-700 uppercase text-xs">{TEAM_UI[e.teamId].name}</span>
                            </div>
                         </td>
                         <td className="px-4 sm:px-8 py-4 font-bold text-gray-900">{e.reason}</td>
                         <td className="px-4 sm:px-8 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase text-gray-500">{e.source}</span>
                         </td>
                         <td className={`px-4 sm:px-8 py-4 text-right font-black text-lg whitespace-nowrap ${e.pointsDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {e.pointsDelta > 0 ? '+' : ''}{e.pointsDelta}
                         </td>
                      </tr>
                   ))}
                   {scoreEvents.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold">Nenhum registro encontrado.</td></tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};
