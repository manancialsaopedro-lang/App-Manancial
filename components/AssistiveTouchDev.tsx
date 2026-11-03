import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Crown,
  User as UserIcon,
  Trophy,
  Briefcase,
  Church,
  Users,
  Tent,
  ShoppingBag,
  Wallet,
  Music,
  Globe,
  Home,
  Check,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  RotateCcw
} from 'lucide-react';
import { useAppStore } from '../store';
import { useCurrentRole } from '../hooks/useCurrentRole';
import { UserRole } from '../types';

export const AssistiveTouchDev: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'roles' | 'person'>('modules');
  const [personSearch, setPersonSearch] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, people, devRole, setDevRole, simulatedPersonId, setSimulatedPersonId } = useAppStore();
  const { activeRole, simulatedPerson } = useCurrentRole();

  // Esconder em páginas públicas de visitantes para não poluir
  const pathname = (location.pathname || '').toLowerCase();
  const hash = (typeof window !== 'undefined' && window.location.hash ? window.location.hash.toLowerCase() : '');
  
  const isVisitorPublic = 
    pathname.includes('visitante') || 
    pathname.includes('boas-vindas') || 
    pathname.includes('completar-cadastro') || 
    pathname.includes('cadastro-membro') ||
    pathname === '/louvor/login' ||
    pathname === '/app/login' ||
    hash.includes('visitante') ||
    hash.includes('boas-vindas') ||
    hash.includes('louvor/login') ||
    hash.includes('app/login');

  // Se for um músico que entrou pelo link exclusivo do Louvor App, mantém isolado no Louvor App
  const isStandaloneLouvorMusician = (() => {
    try {
      if (!pathname.startsWith('/app') && !pathname.startsWith('/louvor')) return false;
      const rawMember = localStorage.getItem('louvor_logged_member');
      if (!rawMember) return false;
      const parsed = JSON.parse(rawMember);
      return parsed && parsed.name !== 'Caio';
    } catch {
      return false;
    }
  })();

  if (isVisitorPublic || isStandaloneLouvorMusician) {
    return null;
  }

  // Definição dos Módulos do Ecossistema
  const ecosystemModules = [
    {
      id: 'hub',
      name: 'Hub Central',
      icon: Home,
      path: '/',
      color: 'from-cyan-500 to-blue-500',
      badge: 'Início'
    },
    {
      id: 'gestao',
      name: 'Gestão Pastores',
      icon: Church,
      path: '/igreja',
      color: 'from-cyan-500 to-teal-500',
      badge: 'Principal'
    },
    {
      id: 'membro',
      name: 'Espaço Membro',
      icon: Users,
      path: '/igreja/membro',
      color: 'from-emerald-500 to-teal-500',
      badge: 'Membro'
    },
    {
      id: 'cantina',
      name: 'Cantina & PDV',
      icon: ShoppingBag,
      path: '/cantina',
      color: 'from-orange-500 to-amber-500',
      badge: 'Caixa'
    },
    {
      id: 'financeiro',
      name: 'Financeiro App',
      icon: Wallet,
      path: '/financeiro',
      color: 'from-purple-500 to-indigo-500',
      badge: 'Tesouraria'
    },
    {
      id: 'acampamento',
      name: 'Acampamento',
      icon: Tent,
      path: '/acampamento',
      color: 'from-amber-500 to-yellow-500',
      badge: 'Retiro'
    },
    {
      id: 'gincana',
      name: 'Gincana 25:14',
      icon: Trophy,
      path: '/gincana/dash',
      color: 'from-orange-600 to-red-500',
      badge: 'Placar'
    },
    {
      id: 'louvor',
      name: 'Min. Louvor',
      icon: Music,
      path: '/app/dashboard',
      color: 'from-pink-500 to-rose-500',
      badge: 'App Louvor'
    },
    {
      id: 'landing',
      name: 'Landing Page',
      icon: Globe,
      path: '/landing',
      color: 'from-blue-500 to-cyan-500',
      badge: 'Público'
    }
  ];

  // Definição dos Papéis (Roles)
  const rolesList: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    { 
      role: 'pastoral', 
      label: 'Pastor / Liderança', 
      icon: Crown, 
      color: 'from-amber-400 to-yellow-600',
      desc: 'Gestão integral da igreja, relatórios e solicitações'
    },
    { 
      role: 'membro', 
      label: 'Membro da Igreja', 
      icon: UserIcon, 
      color: 'from-teal-400 to-emerald-600',
      desc: 'Cultos, oração, mural de recados e perfil'
    },
    { 
      role: 'gincana', 
      label: 'Coordenação Gincana', 
      icon: Trophy, 
      color: 'from-orange-400 to-red-600',
      desc: 'Lançamento de pontos, provas e jurados'
    },
    { 
      role: 'organizacao', 
      label: 'Caixa & Cantina', 
      icon: Briefcase, 
      color: 'from-blue-400 to-indigo-600',
      desc: 'PDV cantina, vendas e fechamento financeiro'
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    setDevRole(role);
    if (role === 'membro') {
      navigate('/igreja/membro');
    } else if (role === 'pastoral') {
      navigate('/igreja');
    } else if (role === 'gincana') {
      navigate('/gincana/dash');
    } else if (role === 'organizacao') {
      navigate('/cantina');
    }
    setIsOpen(false);
  };

  const currentRoleConfig = rolesList.find(r => r.role === activeRole) || rolesList[0];
  const CurrentRoleIcon = currentRoleConfig.icon;

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(personSearch.toLowerCase())
  ).slice(0, 15);

  return (
    <>
      {/* =========================================================================
          BOTÃO FLUTUANTE ESTILO ASSISTIVETOUCH (APPLE iOS)
         ========================================================================= */}
      <div 
        className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-50 select-none group"
        title="AssistiveTouch Dev - Alternar Ambientes e Perfis"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-2xl ${
            isOpen 
              ? 'ring-4 ring-cyan-400/50 scale-105' 
              : 'hover:scale-105 hover:ring-2 hover:ring-white/40'
          }`}
          style={{
            background: 'rgba(11, 18, 32, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 12px 36px 0 rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)'
          }}
          aria-label="Abrir AssistiveTouch Dev"
        >
          {/* Anéis concêntricos suaves estilo AssistiveTouch */}
          <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute inset-3 rounded-full border border-white/15 pointer-events-none" />

          {/* Ícone central dinâmico baseado no papel atual */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/30 to-teal-400/20 flex items-center justify-center text-cyan-300">
            <CurrentRoleIcon size={17} className="stroke-[2.2]" />
          </div>

          {/* Mini badge / ponto de status conectado */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b1220] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </span>
        </button>

        {/* Tooltip sutil no hover */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10 whitespace-nowrap shadow-xl">
              Assistive Dev: <span className="text-cyan-300">{currentRoleConfig.label.split('/')[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL EXPANDIDO ESTILO ASSISTIVETOUCH (GRID DE NAVEGAÇÃO & ROLES)
         ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg rounded-3xl border border-white/15 shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col max-h-[85dvh] text-white"
            style={{
              background: 'rgba(13, 20, 36, 0.94)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Header com estilo iOS */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-white">Assistive Dev</h3>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Manancial
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Navegação instantânea entre ambientes & papéis
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Abas de Navegação no AssistiveTouch */}
            <div className="flex rounded-xl bg-white/5 p-1 mb-4 border border-white/10">
              <button
                onClick={() => setActiveTab('modules')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'modules'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers size={14} />
                Ambientes (Apps)
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'roles'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Crown size={14} />
                Papel Ativo
              </button>
              <button
                onClick={() => setActiveTab('person')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'person'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye size={14} />
                Simular Membro
              </button>
            </div>

            {/* Conteúdo da Aba 1: Grid de Ambientes (Apps do Ecossistema) */}
            {activeTab === 'modules' && (
              <div className="overflow-y-auto flex-1 pr-1 -mr-1">
                <div className="grid grid-cols-3 gap-2.5">
                  {ecosystemModules.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.path)}
                        className={`group relative p-3 rounded-2xl flex flex-col items-center text-center transition-all border ${
                          isCurrent 
                            ? 'bg-cyan-500/15 border-cyan-400/50 shadow-lg shadow-cyan-500/10' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-2 shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon size={19} />
                        </div>
                        <span className="text-xs font-bold text-white line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 mt-0.5">
                          {item.badge}
                        </span>

                        {isCurrent && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conteúdo da Aba 2: Role Switcher (Alternar Perfis) */}
            {activeTab === 'roles' && (
              <div className="overflow-y-auto flex-1 space-y-2.5 pr-1 -mr-1">
                {rolesList.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeRole === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all border ${
                        isSelected 
                          ? 'bg-cyan-500/15 border-cyan-400/50 shadow-md shadow-cyan-500/10' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shrink-0`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{item.label}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-cyan-400 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                                Ativo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      ) : (
                        <ArrowRight size={14} className="text-slate-500 shrink-0" />
                      )}
                    </button>
                  );
                })}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setDevRole('pastoral');
                      setSimulatedPersonId(null);
                      navigate('/igreja');
                      setIsOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw size={13} />
                    Resetar para Pastoral Padrão
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo da Aba 3: Simular Membro Específico */}
            {activeTab === 'person' && (
              <div className="overflow-y-auto flex-1 flex flex-col pr-1 -mr-1">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar participante por nome..."
                    value={personSearch}
                    onChange={(e) => setPersonSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-56">
                  {filteredPeople.map((p) => {
                    const isSelected = simulatedPersonId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSimulatedPersonId(p.id);
                          setDevRole('membro');
                          navigate('/igreja/membro');
                          setIsOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-colors border ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Equipe: {p.teamId || 'Nenhuma'}</span>
                            <span>•</span>
                            <span className={p.paymentStatus === 'PAGO' ? 'text-emerald-400' : 'text-amber-400'}>
                              {p.paymentStatus}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer do AssistiveTouch com resumo de status */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Modo: <strong className="text-white capitalize">{activeRole}</strong></span>
                {activeRole === 'membro' && simulatedPerson && (
                  <span className="text-cyan-300 font-semibold truncate max-w-[100px]">
                    ({simulatedPerson.name.split(' ')[0]})
                  </span>
                )}
              </div>

              <button
                onClick={() => handleNavigate('/')}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                Hub do Ecossistema
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
