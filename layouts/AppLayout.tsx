import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Shield, PieChart, Users, ArrowLeft, Wallet, ShoppingBag, ChevronRight, X, ArrowRightLeft,
  Trophy, Flag, Clock, CalendarCheck, Home, ScrollText, Grid
} from 'lucide-react';
import { Sector } from '../types';
import { useAppStore } from '../store';

export const AppLayout = ({ sector }: { sector: Sector }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useAppStore();

  const sidebarMenus = {
    org: [
      { path: 'home', icon: Home, label: 'Inicio' },
      { path: 'dash', icon: PieChart, label: 'Dashboard' },
      { path: 'list', icon: Users, label: 'Inscritos' },
      { path: 'cashier-hub', icon: Wallet, label: 'Central do Caixa' },
      { path: 'financials', icon: ArrowRightLeft, label: 'Movimentacoes' },
      { path: 'canteen', icon: ShoppingBag, label: 'Cantina' },
    ],
    gincana: [
      { path: 'dash', icon: Trophy, label: 'Visao Geral' },
      { path: 'time', icon: Clock, label: 'Cronograma' },
      { path: 'list', icon: Users, label: 'Participantes' },
      { path: 'proofs', icon: Flag, label: 'Provas' },
    ]
  };

  const currentSidebarMenu = sidebarMenus[sector as keyof typeof sidebarMenus] || [];
  const themeColor = sector === 'gincana' ? 'bg-orange-600' : 'bg-blue-600';
  const activeColorClass = sector === 'gincana' ? 'text-orange-600' : 'text-blue-600';
  const appSurfaceClass = isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#fbfbfd] text-gray-900';
  const panelClass = isDarkMode ? 'bg-[#121a2a] border-white/10' : 'bg-white border-gray-100';
  const contentClass = isDarkMode ? 'bg-[#0f1627]' : 'bg-pattern';
  const mobileBarClass = isDarkMode ? 'bg-[#121a2a]/95 border-white/10' : 'bg-white/90 border-gray-200';

  const handleExit = () => {
    navigate('/');
  };

  const renderBottomBar = () => {
    if (sector === 'org') {
      return (
        <nav className={`xl:hidden fixed bottom-0 left-0 w-full backdrop-blur-xl border-t pb-safe z-50 px-4 ${mobileBarClass}`}>
          <div className="flex justify-between items-end h-16 pb-1">
            <NavLink
              to="/org/closing"
              className={({ isActive }) => `flex flex-col items-center justify-center w-16 mb-1 transition-all active:scale-90 ${isActive ? activeColorClass : 'text-gray-400'}`}
            >
              <CalendarCheck size={22} strokeWidth={2} />
              <span className="text-[9px] font-bold mt-1">Fechamento</span>
            </NavLink>

            <NavLink
              to="/org/list"
              className={({ isActive }) => `flex flex-col items-center justify-center w-16 mb-1 transition-all active:scale-90 ${isActive ? activeColorClass : 'text-gray-400'}`}
            >
              <Users size={22} strokeWidth={2} />
              <span className="text-[9px] font-bold mt-1">Inscritos</span>
            </NavLink>

            <div className="relative -top-3">
              <NavLink
                to="/org/home"
                className={({ isActive }) => `flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform active:scale-95 border-4 border-[#fbfbfd] ${isActive ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'}`}
              >
                <Home size={24} strokeWidth={2.5} />
              </NavLink>
              <span className="block text-center text-[9px] font-bold text-gray-500 mt-1">Inicio</span>
            </div>

            <NavLink
              to="/org/cashier-hub"
              className={({ isActive }) => `flex flex-col items-center justify-center w-16 mb-1 transition-all active:scale-90 ${isActive ? activeColorClass : 'text-gray-400'}`}
            >
              <Wallet size={22} strokeWidth={2} />
              <span className="text-[9px] font-bold mt-1">Central</span>
            </NavLink>

            <NavLink
              to="/org/canteen"
              className={({ isActive }) => `flex flex-col items-center justify-center w-16 mb-1 transition-all active:scale-90 ${isActive ? activeColorClass : 'text-gray-400'}`}
            >
              <ShoppingBag size={22} strokeWidth={2} />
              <span className="text-[9px] font-bold mt-1">Cantina</span>
            </NavLink>
          </div>
        </nav>
      );
    }

    return (
      <nav className={`xl:hidden fixed bottom-0 left-0 w-full backdrop-blur-xl border-t pb-safe z-50 ${mobileBarClass}`}>
        <div className="flex justify-around items-center h-16">
          <button onClick={handleExit} className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600 active:scale-90 transition-transform">
            <Grid size={20} />
            <span className="text-[10px] font-bold mt-1">Menu</span>
          </button>

          {currentSidebarMenu.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={`/${sector}/${item.path}`}
              className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 ${isActive ? activeColorClass : 'text-gray-400'}`}
            >
              <item.icon size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-bold mt-1">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    );
  };

  return (
    <div className={`flex flex-col xl:flex-row h-screen font-sans overflow-hidden relative transition-colors duration-300 ${appSurfaceClass}`}>
      <div
        className={`hidden xl:flex fixed top-0 left-0 h-full w-4 z-50 group items-center justify-start ${isOpen ? 'pointer-events-none' : 'pointer-events-auto hover:w-12 transition-all duration-300'}`}
        onClick={() => setIsOpen(true)}
      >
        <div className={`opacity-0 group-hover:opacity-100 shadow-xl rounded-r-xl p-2 cursor-pointer border transition-opacity duration-300 ${panelClass}`}>
          <ChevronRight size={24} className={activeColorClass} />
        </div>
      </div>

      <aside
        className={`hidden xl:flex border-r flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] shrink-0 h-full overflow-hidden absolute z-40 shadow-2xl ${panelClass} ${isOpen ? 'w-72 translate-x-0 opacity-100' : 'w-0 -translate-x-10 opacity-0 pointer-events-none'}`}
      >
        <div className="p-6 h-full flex flex-col w-72 min-w-[18rem]">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${themeColor} rounded-lg flex items-center justify-center text-white shadow-lg shrink-0`}>
                <Shield size={20} />
              </div>
              <h1 className={`font-black text-lg tracking-tighter whitespace-nowrap ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>MANANCIAL</h1>
            </div>
            <button onClick={() => setIsOpen(false)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            {currentSidebarMenu.map((item) => (
              <NavLink
                key={item.path}
                to={`/${sector}/${item.path}`}
                className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group whitespace-nowrap ${isActive ? `${themeColor} text-white shadow-lg shadow-blue-500/10` : (isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-gray-400 hover:bg-gray-50')}`}
              >
                <item.icon size={20} className="shrink-0" />
                <span className="font-bold text-sm">{item.label}</span>
              </NavLink>
            ))}
            <button onClick={handleExit} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all mt-8 whitespace-nowrap ${isDarkMode ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-300' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}`}>
              <ArrowLeft size={20} className="shrink-0" />
              <span className="font-bold text-sm">Sair do Modulo</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-500 ${isOpen ? 'xl:pl-72' : ''}`}>
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-safe transition-colors ${contentClass}`}>
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
            <div className="h-24 md:h-40 xl:hidden" />
          </div>
        </div>
      </main>

      {renderBottomBar()}
    </div>
  );
};
