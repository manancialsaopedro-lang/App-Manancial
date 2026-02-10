
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, User, ShieldCheck, Ticket } from 'lucide-react';
import { useAppStore } from '../../store';
import { TEAM_UI } from '../../constants';
import { TeamId, AgeGroup } from '../../types';
import { Card } from '../../components/Shared';

export const TeamsOverview = () => {
  const navigate = useNavigate();
  const { people } = useAppStore();

  const getTeamMembers = (tid: TeamId) => people.filter(p => p.teamId === tid);

  // Stats Helpers
  const getCounts = (list: typeof people) => ({
    total: list.length,
    jovem: list.filter(p => p.ageGroup === 'Jovem').length,
    adulto: list.filter(p => p.ageGroup === 'Adulto').length,
    crianca: list.filter(p => p.ageGroup === 'Criança').length,
    membro: list.filter(p => p.personType === 'Membro').length,
    visitante: list.filter(p => p.personType === 'Visitante').length
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-12">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/gincana/dash')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
           <ArrowLeft size={24} className="text-gray-500" />
        </button>
        <div>
           <h2 className="text-3xl font-black tracking-tighter">Visão Geral de Equipes</h2>
           <p className="text-gray-400 font-medium">Distribuição e balanceamento de participantes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['alianca', 'segredo', 'caminho'] as TeamId[]).map(tid => {
           const members = getTeamMembers(tid);
           const stats = getCounts(members);

           return (
             <div key={tid} className="flex flex-col h-full">
                {/* Header do Time */}
                <div className={`p-6 rounded-t-[2.5rem] ${TEAM_UI[tid].color} text-white relative overflow-hidden`}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10" />
                   
                   <div className="relative z-10 flex justify-between items-center mb-4">
                      <h3 className="text-xl font-black uppercase tracking-widest">{TEAM_UI[tid].name}</h3>
                      <div className="px-3 py-1 bg-white/20 rounded-lg text-sm font-bold backdrop-blur-md">
                         {stats.total} Pessoas
                      </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-black/10 rounded-xl p-2">
                         <div className="text-xs font-bold opacity-70 uppercase">Crianças</div>
                         <div className="text-lg font-black">{stats.crianca}</div>
                      </div>
                      <div className="bg-black/10 rounded-xl p-2">
                         <div className="text-xs font-bold opacity-70 uppercase">Jovens</div>
                         <div className="text-lg font-black">{stats.jovem}</div>
                      </div>
                      <div className="bg-black/10 rounded-xl p-2">
                         <div className="text-xs font-bold opacity-70 uppercase">Adultos</div>
                         <div className="text-lg font-black">{stats.adulto}</div>
                      </div>
                   </div>
                </div>

                {/* Lista de Membros */}
                <div className="bg-white border-x border-b border-gray-100 rounded-b-[2.5rem] p-4 flex-1 shadow-sm">
                   <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                      {members.map(p => (
                         <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                  <User size={14} />
                               </div>
                               <div>
                                  <p className="font-bold text-sm text-gray-900 leading-tight">{p.name}</p>
                                  <div className="flex gap-1 mt-1">
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                       p.personType === 'Membro' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                    }`}>
                                       {p.personType === 'Membro' ? 'Membro' : 'Visitante'}
                                    </span>
                                  </div>
                               </div>
                            </div>
                            
                            {/* Age Badge */}
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${
                               p.ageGroup === 'Criança' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                               p.ageGroup === 'Jovem' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                               'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                               {p.ageGroup}
                            </span>
                         </div>
                      ))}
                      {members.length === 0 && (
                         <div className="text-center py-10 text-gray-300 font-bold text-sm">Nenhum membro</div>
                      )}
                   </div>
                </div>
             </div>
           );
        })}

        {/* Coluna Sem Equipe */}
        <div className="flex flex-col h-full opacity-60 hover:opacity-100 transition-opacity">
           <div className="p-6 rounded-t-[2.5rem] bg-gray-200 text-gray-500 relative overflow-hidden">
               <div className="relative z-10 flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase tracking-widest">Sem Equipe</h3>
                  <div className="px-3 py-1 bg-white/50 rounded-lg text-sm font-bold">
                     {getTeamMembers('none').length}
                  </div>
               </div>
           </div>
           <div className="bg-white border-x border-b border-gray-200 rounded-b-[2.5rem] p-4 flex-1">
               <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {getTeamMembers('none').map(p => (
                     <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <span className="font-bold text-sm text-gray-500">{p.name}</span>
                        <span className="text-[10px] bg-gray-200 px-2 py-1 rounded text-gray-500 font-bold uppercase">{p.ageGroup}</span>
                     </div>
                  ))}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};
