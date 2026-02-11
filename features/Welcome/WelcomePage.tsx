
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Flag, ArrowRight, Sun, Moon, Tent, Cloud, Flame, Mountain, Shield } from 'lucide-react';
import { useAppStore } from '../../store';

export const WelcomePage = () => {
  const { isDarkMode, toggleTheme } = useAppStore();
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Smoother parallax
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

  return (
    <div onMouseMove={handleMouseMove} className={`min-h-screen transition-colors duration-700 relative flex items-center justify-center p-6 overflow-hidden ${themeColors.bg}`}>
      
      {/* --- BACKGROUND LAYERS (Ondinhas & Camping Vibe) --- */}
      
      {/* 1. Static/Pulse Blob (Cyan) */}
      <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse transition-colors duration-1000 ${themeColors.blob1}`} style={{ animationDuration: '8s' }} />
      
      {/* 2. Static/Pulse Blob (Blue) - Bottom Right */}
      <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse transition-colors duration-1000 ${themeColors.blob2}`} style={{ animationDuration: '10s' }} />

      {/* 3. Mouse Interactive Blob (Teal) */}
      <div 
        className={`absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full blur-[100px] transition-transform duration-100 ease-out ${themeColors.blob3}`} 
        style={{ transform: `translate(${mouse.x * 2}px, ${mouse.y * 2}px)` }} 
      />

      {/* 4. Subtle Camping Elements (Watermarks) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] text-slate-900 dark:text-white">
         <Mountain size={400} className="absolute bottom-0 left-[-50px]" />
         <Tent size={300} className="absolute bottom-10 right-[-50px]" />
         <Cloud size={200} className="absolute top-20 left-20" />
         <Cloud size={150} className="absolute top-40 right-40" />
      </div>

      {/* --- CONTENT --- */}

      <button onClick={toggleTheme} className={`absolute top-10 right-10 p-4 rounded-full shadow-xl z-50 backdrop-blur-md transition-all hover:scale-110 ${isDarkMode ? 'bg-white/10 text-yellow-400 border border-white/10' : 'bg-white/50 text-slate-700 border border-white/40'}`}>
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="max-w-7xl w-full relative z-10 flex flex-col items-center">
        
        {/* LOGO AREA */}
        <div className="mb-12 relative group" style={{ transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px)` }}>
           <div className={`absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all duration-500`} />
           
           {!imgError ? (
             <img 
               src="/logo-manancial.png" 
               alt="Logo Manancial" 
               onError={() => {
                 console.error("Erro ao carregar imagem da logo: /logo-manancial.png");
                 setImgError(true);
               }}
               className="w-48 md:w-64 h-auto drop-shadow-2xl relative z-10 transform transition-transform duration-500 hover:scale-105"
             />
           ) : (
             <div className="w-48 md:w-64 aspect-square flex flex-col items-center justify-center relative z-10 text-cyan-600 dark:text-cyan-400 animate-in fade-in">
                <Shield size={80} strokeWidth={1.5} className="drop-shadow-lg" />
                <span className="font-black tracking-[0.3em] text-sm mt-4 text-center">MANANCIAL</span>
             </div>
           )}
        </div>
        
        {/* TITLES */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-6 text-center md:text-left">
          <h1 className={`text-5xl md:text-7xl font-black tracking-tighter ${themeColors.textMain}`}>Acampamento</h1>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400 pb-2">Manancial</h1>
        </div>

        {/* VERSE */}
        <p className={`text-lg md:text-xl font-serif italic text-center max-w-2xl mb-16 leading-relaxed ${themeColors.textSec}`}>
          "O segredo do Senhor e para os que o temem; e ele lhes fara saber a sua alianca."
          <span className="block text-sm font-sans font-bold mt-2 not-italic uppercase tracking-widest opacity-60">Salmos 25:14</span>
        </p>

        {/* NAVIGATION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
          {[
            { id: 'org', icon: LayoutGrid, title: 'Organizacao', desc: 'Financeiro e Cantina', color: 'from-blue-600 to-cyan-500' },
            { id: 'gincana', icon: Flag, title: 'Gincana', desc: 'Provas e Equipes', color: 'from-orange-500 to-amber-500' },
          ].map((sector) => (
            <button 
              key={sector.id} 
              onClick={() => navigate(`/${sector.id}/dash`)} 
              className={`group relative p-8 rounded-[2.5rem] text-left transition-all duration-500 border shadow-xl backdrop-blur-md overflow-hidden hover:-translate-y-2 ${themeColors.cardBg}`}
            >
              {/* Card Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${sector.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className={`w-14 h-14 bg-gradient-to-br ${sector.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <sector.icon size={28} />
              </div>
              
              <h3 className={`text-2xl font-black mb-2 ${themeColors.textMain}`}>{sector.title}</h3>
              <p className={`${themeColors.textSec} font-medium text-sm`}>{sector.desc}</p>
              
              <div className="mt-8 flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm uppercase tracking-wider opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Acessar <ArrowRight size={16} />
              </div>

              {/* Decorative Element inside card */}
              {sector.id === 'gincana' && <Flame className="absolute bottom-[-20px] right-[-20px] text-orange-500/10 rotate-12" size={120} />}
              {sector.id === 'org' && <Tent className="absolute bottom-[-20px] right-[-20px] text-blue-500/10" size={120} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

