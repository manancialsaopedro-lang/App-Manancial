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
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';

export const CampWelcomePage: React.FC = () => {
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

  const getCardsForRole = () => {
    switch (activeRole) {
      case 'membro':
        return [
          {
            id: 'info',
            path: '/acampamento/informacoes',
            icon: Sparkles,
            title: 'Informações do Retiro 2027',
            desc: 'São Pedro - SP (05 a 09/Fev), valor R$ 582 ou 6x R$ 97 e o que levar',
            color: 'from-amber-500 to-orange-500',
            tag: 'Oficial'
          },
          {
            id: 'membro',
            path: '/membro/home',
            icon: Tent,
            title: 'Meu Espaço',
            desc: simulatedPerson ? `Inscrição, equipe (${simulatedPerson.teamId}) e cantina` : 'Minha inscrição, equipe e consumo na cantina',
            color: 'from-emerald-500 to-teal-500',
            tag: 'Principal'
          },
          {
            id: 'placar',
            path: '/gincana/placar',
            icon: Trophy,
            title: 'Placar ao Vivo',
            desc: 'Acompanhe a pontuação das equipes da gincana',
            color: 'from-blue-500 to-cyan-500',
          },
          {
            id: 'cronograma',
            path: '/gincana/time',
            icon: Clock,
            title: 'Cronograma',
            desc: 'Horários dos cultos, refeições e programações',
            color: 'from-indigo-500 to-purple-500',
          }
        ];

      case 'organizacao':
        return [
          {
            id: 'pagamentos',
            path: '/acampamento/pagamentos',
            icon: Crown,
            title: 'Gestão dos Pagamentos',
            desc: 'Acompanhar quitações e parcelas de R$ 97 de cada inscrito',
            color: 'from-purple-600 to-pink-500',
            tag: 'Liderança'
          },
          {
            id: 'info',
            path: '/acampamento/informacoes',
            icon: Sparkles,
            title: 'Guia Oficial do Evento',
            desc: 'São Pedro - SP, banner oficial, dados do retiro e regras',
            color: 'from-amber-500 to-orange-500',
            tag: 'Guia'
          },
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
            id: 'info',
            path: '/acampamento/informacoes',
            icon: Sparkles,
            title: 'Informações do Retiro 2027',
            desc: 'São Pedro - SP (05 a 09/Fev), banner oficial e detalhes',
            color: 'from-amber-500 to-orange-500',
            tag: 'Oficial'
          },
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
            icon: Tent,
            title: 'Visão do Membro',
            desc: 'Visualizar como participante',
            color: 'from-emerald-500 to-teal-500',
          }
        ];

      case 'pastoral':
      default:
        return [
          { 
            id: 'info', 
            path: '/acampamento/informacoes', 
            icon: Sparkles, 
            title: 'Informações Oficiais 2027', 
            desc: 'São Pedro - SP (05 a 09/Fev), banner oficial, investimento R$ 582 e o que levar', 
            color: 'from-amber-500 to-orange-500',
            tag: 'Oficial'
          },
          { 
            id: 'pagamentos', 
            path: '/acampamento/pagamentos', 
            icon: Crown, 
            title: 'Visão Pastoral dos Pagamentos', 
            desc: 'Acompanhamento executivo de inscritos, régua de parcelas e arrecadação', 
            color: 'from-purple-600 to-pink-500',
            tag: 'Liderança'
          },
          { 
            id: 'membro', 
            path: '/membro/home', 
            icon: Tent, 
            title: 'Espaço do Membro', 
            desc: 'Experiência oficial do acampante (equipe, cantina e status)', 
            color: 'from-emerald-500 to-teal-500',
            tag: 'Acampante'
          },
          { 
            id: 'org', 
            path: '/org/home', 
            icon: LayoutGrid, 
            title: 'Organização & Caixa', 
            desc: 'Central do caixa, cantina, estoque e movimentações', 
            color: 'from-blue-600 to-cyan-500',
            tag: 'Operacional'
          },
          { 
            id: 'gincana', 
            path: '/gincana/dash', 
            icon: Flag, 
            title: 'Gincana 25:14', 
            desc: 'Provas, jurados, placar e materiais das equipes', 
            color: 'from-orange-500 to-amber-500',
            tag: 'Gincana'
          },
          { 
            id: 'pastoral-dash', 
            path: '/org/dash', 
            icon: PieChart, 
            title: 'Dashboard Financeiro Geral', 
            desc: 'Métricas gerais de receitas, custos e projeções', 
            color: 'from-indigo-600 to-purple-600',
          }
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

      {/* Top Bar with Back to Church button & Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <button 
          onClick={() => navigate('/')} 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg backdrop-blur-md transition-all hover:scale-105 font-bold text-xs ${
            isDarkMode ? 'bg-white/10 text-cyan-400 border border-white/10 hover:bg-white/20' : 'bg-white/90 text-cyan-800 border border-cyan-100 hover:bg-white'
          }`}
        >
          <ArrowLeft size={16} /> Voltar ao Portal da Igreja
        </button>

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

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center mt-12">
        
        {/* Sub-badge indicating event submodule */}
        <div className="mb-3 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs tracking-wider uppercase">
          Módulo de Grande Evento • Retiro Oficial
        </div>

        {/* LOGO */}
        <div className="mb-6 relative group" style={{ transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px)` }}>
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
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-3 text-center md:text-left">
          <h1 className={`text-4xl md:text-6xl font-black tracking-tighter ${themeColors.textMain}`}>Acampamento</h1>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400 pb-2">Manancial</h1>
        </div>

        {/* VERSE */}
        <p className={`text-base md:text-lg font-serif italic text-center max-w-xl mb-8 leading-relaxed ${themeColors.textSec}`}>
          "O segredo do Senhor é para os que o temem; e ele lhes fará saber a sua aliança."
          <span className="block text-xs font-sans font-bold mt-1.5 not-italic uppercase tracking-widest opacity-60">Salmos 25:14</span>
        </p>

        {/* BANNER DE DESTAQUE DO ACAMPAMENTO 2027 */}
        <div className={`w-full max-w-4xl mx-auto mb-8 p-5 md:p-6 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-md ${
          isDarkMode 
            ? 'bg-gradient-to-br from-amber-950/30 via-[#131b2f] to-[#0d1424] border-amber-500/30' 
            : 'bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border-amber-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/acampamento-2027.jpg" 
                alt="Acampamento Manancial 2027" 
                className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-2xl shadow-md border border-amber-500/30 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    Edição 2027
                  </span>
                  <span className="text-xs font-bold text-slate-400">São Pedro - SP</span>
                </div>
                <h2 className={`text-xl md:text-2xl font-black ${themeColors.textMain}`}>
                  Acampamento Manancial 2027
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <Calendar size={13} /> 05 a 09 de Fev/2027
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={13} className="text-emerald-500" /> PIX R$ 582 ou até 6x R$ 97
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => navigate('/acampamento/informacoes')}
                className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
              >
                <Sparkles size={14} /> Ver Guia do Retiro
              </button>
              <button
                onClick={() => navigate('/acampamento/pagamentos')}
                className={`flex-1 md:flex-none px-4 py-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-purple-300 hover:bg-slate-700' : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Crown size={14} /> Visão Pastoral
              </button>
            </div>
          </div>
        </div>

        {/* NAVIGATION CARDS */}
        <div className={`grid gap-5 w-full max-w-4xl mx-auto ${
          cards.length >= 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : cards.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button 
                key={card.id} 
                onClick={() => navigate(card.path)} 
                className={`group relative p-6 rounded-[2rem] text-left transition-all duration-500 border shadow-xl backdrop-blur-md overflow-hidden hover:-translate-y-1.5 flex flex-col justify-between ${themeColors.cardBg}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div>
                  <div className="flex items-center justify-between mb-5">
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
