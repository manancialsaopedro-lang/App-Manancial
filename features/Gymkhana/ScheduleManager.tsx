
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Clock, MapPin, Package, MoreVertical, Flag, Utensils, Music, BedDouble, Sun } from 'lucide-react';
import { useAppStore } from '../../store';
import { Card } from '../../components/Shared';

export const ScheduleManager = () => {
  const navigate = useNavigate();
  const { schedule, addScheduleItem, deleteScheduleItem } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('Sexta-feira');
  const [time, setTime] = useState('09:00');
  const [loc, setLoc] = useState('');

  const handleAdd = () => {
    if (title && time) {
       addScheduleItem({ title, day, startTime: time, location: loc });
       setTitle(''); setLoc(''); setShowForm(false);
    }
  };

  const dayOrder: Record<string, number> = {
    'Sexta-feira': 1,
    'Sábado': 2,
    'Domingo': 3,
    'Segunda-feira': 4,
    'Terça-feira': 5
  };

  // Ordenação Robusta
  const sortedSchedule = [...schedule].sort((a, b) => {
    const dayA = dayOrder[a.day] || 99;
    const dayB = dayOrder[b.day] || 99;
    if (dayA !== dayB) return dayA - dayB;
    return a.startTime.localeCompare(b.startTime);
  });

  // Ícone Dinâmico baseado no título
  const getIcon = (title: string) => {
     const t = title.toLowerCase();
     if (t.includes('café') || t.includes('almoço') || t.includes('jantar') || t.includes('lanche')) return <Utensils size={18} />;
     if (t.includes('culto') || t.includes('louvor')) return <Music size={18} />;
     if (t.includes('dormir') || t.includes('recolher')) return <BedDouble size={18} />;
     if (t.includes('gincana') || t.includes('prova')) return <Flag size={18} />;
     if (t.includes('livre') || t.includes('piscina')) return <Sun size={18} />;
     return <Clock size={18} />;
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in">
       
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/gincana/dash')} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
               <ArrowLeft size={24} className="text-gray-500" />
            </button>
            <div>
               <h2 className="text-3xl font-black tracking-tighter text-gray-900">Cronograma</h2>
               <p className="text-gray-400 font-bold text-sm">Trajetória do Acampamento</p>
            </div>
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <button 
               onClick={() => navigate('/gincana/materiais')} 
               className="flex-1 md:flex-none bg-orange-100 text-orange-700 px-5 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-200 transition-colors"
            >
               <Package size={20} /> Materiais
            </button>
            <button 
               onClick={() => setShowForm(!showForm)} 
               className="flex-1 md:flex-none bg-black text-white px-5 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg"
            >
               <Plus size={20} /> Evento
            </button>
         </div>
       </div>

       {showForm && (
          <Card className="p-6 bg-blue-50 border-blue-100 mb-10 animate-in slide-in-from-top-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="p-3 rounded-xl outline-none" />
                <select value={day} onChange={e => setDay(e.target.value)} className="p-3 rounded-xl outline-none bg-white">
                   <option>Sexta-feira</option>
                   <option>Sábado</option>
                   <option>Domingo</option>
                   <option>Segunda-feira</option>
                   <option>Terça-feira</option>
                </select>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="p-3 rounded-xl outline-none" />
                <button onClick={handleAdd} className="bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Salvar Evento</button>
             </div>
          </Card>
       )}

       {/* TIMELINE VERTICAL LIMPA */}
       <div className="relative pl-8 md:pl-0">
          {/* Linha Central (apenas desktop) ou Esquerda (mobile) */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gray-100 -translate-x-1/2 rounded-full" />

          {sortedSchedule.map((item, index) => {
             const prevItem = sortedSchedule[index - 1];
             const isNewDay = !prevItem || prevItem.day !== item.day;
             const isLeft = index % 2 === 0; // Alternar lados no desktop

             return (
                <div key={item.id} className="relative mb-8 group">
                   
                   {/* Separador de Dia */}
                   {isNewDay && (
                      <div className="flex justify-center mb-8 pt-4 relative z-10">
                         <span className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-sm shadow-lg shadow-blue-500/20 uppercase tracking-widest border-4 border-white">
                            {item.day}
                         </span>
                      </div>
                   )}

                   <div className={`md:flex items-center justify-between gap-8 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                      
                      {/* Espaço Vazio (lado oposto) */}
                      <div className="hidden md:block flex-1" />

                      {/* Nó da Timeline (Bolinha Central) */}
                      <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center z-10 shadow-sm group-hover:scale-110 group-hover:border-blue-400 transition-all">
                         <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                            {getIcon(item.title)}
                         </div>
                      </div>

                      {/* Conteúdo do Card */}
                      <div className="flex-1 ml-10 md:ml-0">
                         <div className={`bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all relative ${isLeft ? 'md:mr-6' : 'md:ml-6'}`}>
                            {/* Ponta do Balão (opcional, css complexo, simplificando com margem) */}
                            
                            <div className="flex justify-between items-start">
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-black">{item.startTime}</span>
                                     {item.proofId && <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-50 px-2 py-1 rounded-lg flex items-center gap-1"><Flag size={10} /> Prova</span>}
                                  </div>
                                  <h3 className="font-black text-gray-900 text-lg leading-tight">{item.title}</h3>
                                  {item.description && <p className="text-gray-400 text-xs font-medium mt-1">{item.description}</p>}
                                  {item.location && (
                                     <div className="flex items-center gap-1 text-xs font-bold text-gray-300 mt-2">
                                        <MapPin size={12} /> {item.location}
                                     </div>
                                  )}
                               </div>
                               <button 
                                  onClick={() => deleteScheduleItem(item.id)} 
                                  className="text-gray-200 hover:text-red-400 transition-colors p-1"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                      </div>

                   </div>
                </div>
             );
          })}
       </div>

       {/* Fim da Trilha */}
       <div className="flex justify-center mt-12">
          <div className="bg-emerald-100 text-emerald-600 px-8 py-4 rounded-[2rem] font-black text-center">
             <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Fim do Evento</p>
             <p className="text-lg">Até a próxima! 👋</p>
          </div>
       </div>

    </div>
  );
};
