import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Flag, 
  ArrowRight, 
  Sun, 
  Moon, 
  Tent, 
  Cloud, 
  Mountain, 
  Shield, 
  Sparkles,
  PieChart,
  Trophy,
  Clock,
  Crown,
  Church
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';

export const WelcomePage = () => {
  const { isDarkMode, toggleTheme } = useAppStore();
  const { activeRole, simulatedPerson } = useCurrentRole();
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouse({ 
      x: (e.clientX / window.innerWidth - 0.5) * 20, 
      y: (e.clientY / window.innerHeight - 0.5) * 20 
    });
  };

  const themeColors = {
    bg: isDarkMode ? 'bg-[#0b0f19]' : 'bg-slate-50',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    cardBg: isDarkMode ? 'bg-[#151b2b]/60 border-white/5 hover:bg-[#1a2135]' : 'bg-white/80 border-white/40 hover:bg-white',
    blob1: isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-200/60',
    blob2: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-200/60',
    blob3: isDarkMode ? 'bg-teal-900/30' : 'bg-teal-200/60',
  };

  // Dynamic cards depending on the active role
  const getCardsForRole = () => {
    switch (activeRole) {
      case 'membro':
        return [
          {
            id: 'igreja_membro',
            path: '/igreja/membro',
            icon: Church,
            title: 'Meu Espaço na Igreja',
            desc: 'Cultos da semana, pedidos de oração e comunicados',
            color: 'from-cyan-700 to-teal-500',
            tag: 'Igreja'
          },
          {
            id: 'membro_camp',
            path: '/membro/home',
            icon: Sparkles,
            title: 'Sub-App: Gincana & Retiro',
            desc: simulatedPerson ? `Sua equipe (${simulatedPerson.teamId}), pontuação e cantina` : 'Sua tribo na gincana e consumo na cantina',
            color: 'from-orange-500 to-amber-500',
            tag: 'Acampamento'
          },
          {
            id: 'placar',
            path: '/gincana/placar',
            icon: Trophy,
            title: 'Placar ao Vivo',
            desc: 'Classificação em tempo real das equipes do acampamento',
            color: 'from-amber-500 to-yellow-500',
          }
        ];

      case 'organizacao':
        return [
          {
            id: 'org',
            path: '/org/home',
            icon: LayoutGrid,
            title: 'Central de Operações',
            desc: 'Caixa, PDV Cantina, Fechamento e Inscritos',
            color: 'from-blue-600 to-cyan-500',
            tag: 'Staff'
          },
          {
            id: 'membro',
            path: '/membro/home',
            icon: Sparkles,
            title: 'Visão do Membro',
            desc: 'Como o acampante visualiza o app',
            color: 'from-emerald-500 to-teal-500',
          },
          {
            id: 'dash',
            path: '/org/dash',
            icon: PieChart,
            title: 'Dashboard Financeiro',
            desc: 'Arrecadação, custos e projeções',
            color: 'from-indigo-600 to-purple-600',
          }
        ];

      case 'gincana':
        return [
          {
            id: 'gincana',
            path: '/gincana/dash',
            icon: Flag,
            title: 'Coordenação da Gincana',
            desc: 'Provas, Jurados, Placar e Equipes',
            color: 'from-orange-500 to-amber-500',
            tag: 'Gincana'
          },
          {
            id: 'placar',
            path: '/gincana/placar',
            icon: Trophy,
            title: 'Placar Geral',
            desc: 'Classificação e pontuação atualizada',
            color: 'from-amber-500 to-yellow-500',
          },
          {
            id: 'membro',
            path: '/membro/home',
            icon: Sparkles,
            title: 'Visão do Membro',
            desc: 'Visualizar como participante',
            color: 'from-emerald-500 to-teal-500',
          }
        ];

      case 'pastoral':
      default:
        return [
          { 
            id: 'gestao_igreja', 
            path: '/dev/igreja', 
            icon: Church, 
            title: 'Portal de Gestão da Igreja', 
            desc: 'Informações da igreja, cultos, solicitações e notificações', 
            color: 'from-cyan-800 to-teal-600',
            tag: 'Igreja'
          },
          { 
            id: 'gincana', 
            path: '/gincana/dash', 
            icon: Flag, 
            title: 'Sub-App: Gincana 25:14', 
            desc: 'Provas, jurados, placar ao vivo e cronograma do acampamento', 
            color: 'from-orange-500 to-amber-500',
            tag: 'Acampamento'
          },
          { 
            id: 'org', 
            path: '/org/home', 
            icon: LayoutGrid, 
            title: 'Caixa & Cantina do Retiro', 
            desc: 'Central do caixa, PDV cantina, estoque e fechamento', 
            color: 'from-blue-600 to-cyan-500',
            tag: 'Operacional'
          },
          { 
            id: 'membro_igreja', 
            path: '/igreja/membro', 
            icon: Sparkles, 
            title: 'Visão do Membro', 
            desc: 'Como o membro vivencia os cultos e pedidos no app', 
            color: 'from-emerald-500 to-teal-500',
            tag: 'Membro'
          },
          { 
            id: 'pastoral_dash', 
            path: '/org/dash', 
            icon: Crown, 
            title: 'Visão Pastoral / Executiva', 
            desc: 'Métricas gerais de inscritos, receita e custos', 
            color: 'from-purple-600 to-pink-500',
            tag: 'Liderança'
          },
          { 
            id: 'visitante', 
            path: '/visitante', 
            icon: Sparkles, 
            title: 'Landing Page Visitantes', 
            desc: 'Wizard aberto de boas-vindas com versículo e cadastro rápido', 
            color: 'from-teal-600 to-emerald-600',
            tag: 'Aberto'
          },
        ];
    }
  };

  const cards = getCardsForRole();

  return (
    <div onMouseMove={handleMouseMove} className={`min-h-screen transition-colors duration-700 relative flex items-center justify-center p-6 pb-24 overflow-hidden ${themeColors.bg}`}>
      
      {/* BACKGROUND LAYERS */}
      <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse transition-colors duration-1000 ${themeColors.blob1}`} style={{ animationDuration: '8s' }} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse transition-colors duration-1000 ${themeColors.blob2}`} style={{ animationDuration: '10s' }} />
      <div 
        className={`absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full blur-[100px] transition-transform duration-100 ease-out ${themeColors.blob3}`} 
        style={{ transform: `translate(${mouse.x * 2}px, ${mouse.y * 2}px)` }} 
      />

      {/* Camping Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] text-slate-900 dark:text-white">
         <Mountain size={400} className="absolute bottom-0 left-[-50px]" />
         <Tent size={300} className="absolute bottom-10 right-[-50px]" />
         <Cloud size={200} className="absolute top-20 left-20" />
         <Cloud size={150} className="absolute top-40 right-40" />
      </div>

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
        <button 
          onClick={toggleTheme} 
          className={`p-3 rounded-2xl shadow-xl backdrop-blur-md transition-all hover:scale-110 ${
            isDarkMode ? 'bg-white/10 text-yellow-400 border border-white/10' : 'bg-white/80 text-slate-700 border border-white/40'
          }`}
          title="Alternar Tema"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
        
        {/* LOGO */}
        <div className="mb-8 relative group" style={{ transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px)` }}>
           <div className={`absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all duration-500`} />
           
           {!imgError ? (
             <img 
               src="/logo-manancial.png" 
               alt="Logo Manancial" 
               onError={() => setImgError(true)}
               className="w-40 md:w-56 h-auto drop-shadow-2xl relative z-10 transform transition-transform duration-500 hover:scale-105"
             />
           ) : (
             <div className="w-40 md:w-56 aspect-square flex flex-col items-center justify-center relative z-10 text-cyan-600 dark:text-cyan-400 animate-in fade-in">
                <Shield size={70} strokeWidth={1.5} className="drop-shadow-lg" />
                <span className="font-black tracking-[0.3em] text-sm mt-3 text-center">MANANCIAL</span>
             </div>
           )}
        </div>
        
        {/* TITLES */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-4 text-center md:text-left">
          <h1 className={`text-4xl md:text-6xl font-black tracking-tighter ${themeColors.textMain}`}>Acampamento</h1>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400 pb-2">Manancial</h1>
        </div>

        {/* VERSE */}
        <p className={`text-base md:text-lg font-serif italic text-center max-w-xl mb-10 leading-relaxed ${themeColors.textSec}`}>
          "O segredo do Senhor é para os que o temem; e ele lhes fará saber a sua aliança."
          <span className="block text-xs font-sans font-bold mt-1.5 not-italic uppercase tracking-widest opacity-60">Salmos 25:14</span>
        </p>

        {/* NAVIGATION CARDS */}
        <div className={`grid gap-5 w-full max-w-4xl mx-auto ${
          cards.length === 4 ? 'grid-cols-1 sm:grid-cols-2' : cards.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button 
                key={card.id} 
                onClick={() => navigate(card.path)} 
                className={`group relative p-6 rounded-[2rem] text-left transition-all duration-500 border shadow-xl backdrop-blur-md overflow-hidden hover:-translate-y-1.5 flex flex-col justify-between ${themeColors.cardBg}`}
              >
                {/* Card Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <Icon size={24} />
                    </div>
                    {card.tag && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-cyan-400 border border-white/10">
                        {card.tag}
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-xl font-black mb-1.5 ${themeColors.textMain}`}>{card.title}</h3>
                  <p className={`${themeColors.textSec} font-medium text-xs leading-relaxed`}>{card.desc}</p>
                </div>
                
                <div className="mt-6 flex items-center gap-1.5 text-cyan-500 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
                  Acessar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
