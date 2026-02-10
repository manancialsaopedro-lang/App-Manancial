
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, PieChart, Users, Receipt, Trophy, Flag, Clock, ArrowLeft, MoveHorizontal, Search
} from 'lucide-react';
import { Sector } from './types';

export const AppLayout = ({ sector }: { sector: Sector }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menus = {
    org: [
      { path: 'dash', icon: PieChart, label: 'Dashboard' },
      { path: 'list', icon: Users, label: 'Inscritos' },
      { path: 'purchases', icon: Receipt, label: 'Compras' },
    ],
    gincana: [
      { path: 'dash', icon: Trophy, label: 'Dashboard Gincana' },
      { path: 'list', icon: Users, label: 'Lista Completa' },
      { path: 'proofs', icon: Flag, label: 'Banco de Provas' },
      { path: 'time', icon: Clock, label: 'Cronograma' },
    ]
  };

  const currentMenu = menus[sector as keyof typeof menus] || [];
  const themeColor = sector === 'gincana' ? 'bg-orange-600' : 'bg-blue-600';

  return (
    <div className="flex h-screen bg-[#fbfbfd] font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 flex flex-col hidden lg:flex transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'} shrink-0`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-12">
            <div className={`w-10 h-10 ${themeColor} rounded-lg flex items-center justify-center text-white shadow-lg`}><Shield size={20} /></div>
            {!collapsed && <h1 className="font-black text-lg tracking-tighter">MANANCIAL</h1>}
          </div>
          <nav className="space-y-2 flex-1">
            {currentMenu.map((item) => (
              <NavLink 
                key={item.path} 
                to={`/${sector}/${item.path}`} 
                className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${isActive ? `${themeColor} text-white shadow-lg shadow-blue-500/10` : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <item.icon size={20} />
                {!collapsed && <span className="font-bold text-sm truncate">{item.label}</span>}
              </NavLink>
            ))}
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all mt-8">
              <ArrowLeft size={20} />
              {!collapsed && <span className="font-bold text-sm">Sair do Módulo</span>}
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
            {location.pathname.split('/').pop()}
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><MoveHorizontal size={20} /></button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-pattern">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
