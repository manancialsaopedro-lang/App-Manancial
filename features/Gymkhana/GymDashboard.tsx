
import React, { useState, useMemo } from 'react';
import { Trophy, Check, Edit2, GripVertical, TrendingUp, Calendar, AlertCircle, Package, ClipboardList, Users, ArrowRight, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { TEAM_UI } from '../../constants';
import { AgeGroup, TeamId } from '../../types';
import { Card } from '../../components/Shared';

export const GymDashboard = () => {
  const { people, scoreEvents, updatePerson, proofs, materials } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Computed Scores
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
  const leadingTeam = sortedTeams[0];

  // Drag & Drop Handlers
  const onDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData('pid', id);
  const onDrop = (e: React.DragEvent, group: AgeGroup) => {
    const id = e.dataTransfer.getData('pid');
    updatePerson(id, { ageGroup: group });
  };

  const recentEvents = scoreEvents.slice(0, 5);
  
  // Status Materiais
  const acquiredMaterials = materials.filter(m => m.isAcquired).length;
  const totalMaterials = materials.length;
  const materialsProgress = totalMaterials > 0 ? (acquiredMaterials / totalMaterials) * 100 : 0;

  // Status Pessoas
  const assignedCount = people.filter(p => p.teamId !== 'none' && p.teamId !== 'org').length;
  const totalParticipants = people.length;

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Visão Geral</h2>
          <p className="text-gray-500 font-medium">Resumo estratégico da gincana.</p>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-md ${isEditing ? 'bg-black text-white' : 'bg-white border border-gray-100'}`}>
          {isEditing ? <Check size={18} /> : <Edit2 size={18} />} {isEditing ? 'Salvar Organização' : 'Organizar Listas'}
        </button>
      </div>

      {/* SEÇÃO 1: CARTÕES DE RESUMO (NOVO LAYOUT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* CARD 1: PLACAR GERAL (Resumo) */}
         <div onClick={() => navigate('/gincana/placar')} className="cursor-pointer group">
            <Card className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl h-full relative overflow-hidden transition-transform group-hover:scale-[1.02]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
               
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-3 bg-white/10 rounded-xl"><Trophy size={24} /></div>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg flex items-center gap-1">
                     Ver Detalhes <ArrowRight size={10} />
                  </span>
               </div>
               
               <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest mb-1">Placar Geral</h3>
               <div className="text-3xl font-black mb-4">
                  Líder: {TEAM_UI[leadingTeam].name}
               </div>

               <div className="flex items-center gap-2 text-xs font-bold bg-black/20 p-2 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${TEAM_UI[leadingTeam].color}`} />
                  <span>{computedScores[leadingTeam]} pontos</span>
               </div>
            </Card>
         </div>

         {/* CARD 2: VISÃO DE EQUIPES (Resumo) */}
         <div onClick={() => navigate('/gincana/equipes-geral')} className="cursor-pointer group">
            <Card className="p-6 bg-white border border-gray-200 h-full relative overflow-hidden transition-all group-hover:border-blue-300 group-hover:shadow-md">
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg flex items-center gap-1 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                     Ver Distribuição <ArrowRight size={10} />
                  </span>
               </div>
               
               <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-1">Equipes & Membros</h3>
               <div className="text-3xl font-black text-gray-900 mb-2">
                  {assignedCount} / {totalParticipants}
               </div>
               <p className="text-xs text-gray-400 font-bold">Participantes alocados em equipes.</p>

               <div className="flex mt-4 -space-x-2 overflow-hidden">
                  {(['alianca', 'segredo', 'caminho'] as TeamId[]).map(tid => (
                     <div key={tid} className={`w-6 h-6 rounded-full border-2 border-white ${TEAM_UI[tid].color}`} title={TEAM_UI[tid].name} />
                  ))}
               </div>
            </Card>
         </div>

         {/* CARD 3: MATERIAIS (Existente) */}
         <div onClick={() => navigate('/gincana/materiais')} className="cursor-pointer group">
           <Card className="p-6 bg-gray-900 text-white border-none shadow-xl h-full transition-transform group-hover:scale-[1.02]">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-white/10 rounded-xl"><ClipboardList size={24} /></div>
                 <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">{materialsProgress.toFixed(0)}% OK</span>
              </div>
              <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest mb-1">Materiais</h3>
              <p className="text-sm text-gray-400 mb-4 font-medium">Checklist de itens para provas.</p>
              
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                 <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${materialsProgress}%` }} />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 text-right">{acquiredMaterials} de {totalMaterials} itens adquiridos</p>
           </Card>
         </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Destaques / Feed */}
        <div className="lg:col-span-1 space-y-6">
           <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
             <TrendingUp className="text-blue-500" /> Últimas Pontuações
           </h3>
           <div className="space-y-4">
              {recentEvents.length === 0 && <p className="text-gray-400 text-sm">Nenhuma pontuação registrada.</p>}
              {recentEvents.map(event => {
                 const proof = proofs.find(p => p.id === event.proofId);
                 return (
                   <div key={event.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-10 rounded-full ${TEAM_UI[event.teamId].color}`} />
                         <div>
                            <span className="text-xs font-black uppercase text-gray-400 block">{proof ? 'Prova' : 'Avulso'}</span>
                            <span className="font-bold text-gray-900 text-sm line-clamp-1">{proof?.title || event.reason}</span>
                         </div>
                      </div>
                      <span className={`font-black ${event.pointsDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                         {event.pointsDelta > 0 ? '+' : ''}{event.pointsDelta}
                      </span>
                   </div>
                 );
              })}
           </div>

           <Card className="p-6 bg-blue-50 border-blue-100">
              <div className="flex items-center gap-3 mb-2 text-blue-600">
                 <Calendar size={20} />
                 <h4 className="font-black text-sm uppercase">Próximas Provas</h4>
              </div>
              <p className="text-xs text-blue-400 font-bold mb-4">Confira o cronograma completo.</p>
              <button onClick={() => navigate('/gincana/time')} className="w-full py-2 bg-white text-blue-600 rounded-lg font-bold text-xs shadow-sm hover:bg-blue-100 transition-colors">
                 Ver Cronograma
              </button>
           </Card>
        </div>

        {/* Listas de Pessoas (Draggable) - Mantido conforme pedido */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
             <AlertCircle className="text-orange-500" /> Organização de Categorias
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['Adulto', 'Jovem', 'Criança'] as AgeGroup[]).map(group => (
                <div key={group} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, group)} className={`bg-white rounded-[2rem] border shadow-sm overflow-hidden flex flex-col h-[300px] transition-all ${isEditing ? 'border-dashed border-2 border-blue-400 scale-[1.01]' : 'border-gray-100'}`}>
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center font-black">
                    <h4 className="text-gray-900">{group}s</h4>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">{people.filter(p => p.ageGroup === group).length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {people.filter(p => p.ageGroup === group).map(p => (
                      <div key={p.id} draggable={isEditing} onDragStart={e => onDragStart(e, p.id)} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${isEditing ? 'cursor-grab bg-gray-50 border-gray-200 hover:border-blue-300' : 'border-transparent hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-3 truncate">
                          {isEditing && <GripVertical size={14} className="text-gray-400 shrink-0" />}
                          <span className="font-bold text-sm truncate">{p.name}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${TEAM_UI[p.teamId].color}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
