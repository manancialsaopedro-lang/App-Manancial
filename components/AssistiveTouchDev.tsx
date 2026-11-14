import React, { useState } from 'react';
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
  Check,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  RotateCcw,
  Sun,
  Moon,
  Lock,
  LogIn,
  Waves,
} from 'lucide-react';
import { useAppStore } from '../store';
import { useCurrentRole } from '../hooks/useCurrentRole';
import { UserRole } from '../types';

interface EcosystemModuleItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  color: string;
  badge: string;
  hasAccess: boolean;
  subLink?: {
    label: string;
    shortLabel: string;
    path: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  };
}

export const AssistiveTouchDev: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'roles' | 'person'>('modules');
  const [personSearch, setPersonSearch] = useState('');
  const [accessWarning, setAccessWarning] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const {
    isDarkMode,
    toggleTheme,
    people,
    setDevRole,
    simulatedPersonId,
    setSimulatedPersonId,
  } = useAppStore();
  const {
    activeRole,
    roleLabel,
    simulatedPerson,
    canAccessPastoral,
    canAccessOrg,
    canAccessGincana,
    canAccessLouvor,
    canAccessMember,
  } = useCurrentRole();

  // Esconder em páginas públicas de visitantes para não poluir
  const pathname = (location.pathname || '').toLowerCase();
  const hash =
    typeof window !== 'undefined' && window.location.hash
      ? window.location.hash.toLowerCase()
      : '';

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

  // 5 Módulos Essenciais Resumidos com status de permissão por papel (RBAC)
  const ecosystemModules: EcosystemModuleItem[] = [
    {
      id: 'gestao',
      name: 'Gestão Pastores',
      icon: Church,
      path: '/igreja',
      color: 'from-cyan-500 to-teal-500',
      badge: 'Igreja & Landing',
      hasAccess: canAccessPastoral,
    },
    {
      id: 'membro',
      name: 'Espaço Membro',
      icon: Users,
      path: '/igreja/membro',
      color: 'from-emerald-500 to-teal-500',
      badge: 'App do Membro',
      hasAccess: canAccessMember,
    },
    {
      id: 'acampamento',
      name: 'Acampamento',
      icon: Tent,
      path: '/acampamento',
      color: 'from-amber-500 to-orange-500',
      badge: canAccessGincana ? 'Retiro & Coord. Gincana' : 'Retiro & Placar',
      hasAccess: true,
      subLink: canAccessGincana
        ? {
            label: 'Abrir Coordenação Gincana 25:14',
            shortLabel: 'Gincana',
            path: '/gincana/dash',
            icon: Trophy,
          }
        : {
            label: 'Ver Placar ao Vivo',
            shortLabel: 'Placar',
            path: '/gincana/placar',
            icon: Trophy,
          },
    },
    {
      id: 'financeiro',
      name: 'Financeiro',
      icon: Wallet,
      path: '/financeiro',
      color: 'from-purple-500 to-indigo-500',
      badge: 'Tesouraria & Cantina',
      hasAccess: canAccessOrg,
      subLink: canAccessOrg
        ? {
            label: 'Abrir Cantina PDV',
            shortLabel: 'Cantina',
            path: '/cantina',
            icon: ShoppingBag,
          }
        : undefined,
    },
    {
      id: 'louvor',
      name: 'Min. Louvor',
      icon: Music,
      path: '/app/dashboard',
      color: 'from-pink-500 to-rose-500',
      badge: canAccessLouvor ? 'Visão Líder / Ministro' : 'Visão Músico Escalado',
      hasAccess: true,
    },
  ];

  // Definição dos 5 Papéis (Roles) alinhados aos módulos
  const rolesList: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    {
      role: 'pastoral',
      label: 'Pastor / Admin',
      icon: Crown,
      color: 'from-amber-400 to-yellow-600',
      desc: 'Acesso total aos 5 ambientes, relatórios e solicitações',
    },
    {
      role: 'organizacao',
      label: 'Tesouraria & Cantina',
      icon: Briefcase,
      color: 'from-blue-400 to-indigo-600',
      desc: 'Financeiro, Cantina PDV, pagamentos do retiro e membro',
    },
    {
      role: 'gincana',
      label: 'Coordenação Gincana',
      icon: Trophy,
      color: 'from-orange-400 to-red-600',
      desc: 'Acampamento, provas, jurados, equipes e placar 25:14',
    },
    {
      role: 'louvor',
      label: 'Líder Min. Louvor',
      icon: Music,
      color: 'from-pink-500 to-rose-600',
      desc: 'Gestão de escalas, repertório, cifras e equipe de louvor',
    },
    {
      role: 'membro',
      label: 'Membro da Igreja',
      icon: UserIcon,
      color: 'from-teal-400 to-emerald-600',
      desc: 'Espaço Membro, Acampante, placar ao vivo e escalas',
    },
  ];

  const handleNavigate = (item: EcosystemModuleItem) => {
    if (!item.hasAccess) {
      setAccessWarning(
        `"${item.name}" é restrito para o papel "${roleLabel}". Troque na aba Papel para acessar.`
      );
      return;
    }
    setAccessWarning(null);
    navigate(item.path);
    setIsOpen(false);
  };

  const handleSubNavigate = (path: string) => {
    setAccessWarning(null);
    navigate(path);
    setIsOpen(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    setAccessWarning(null);
    setDevRole(role);
    if (role === 'membro') {
      navigate('/igreja/membro');
    } else if (role === 'pastoral') {
      navigate('/igreja');
    } else if (role === 'gincana') {
      navigate('/acampamento');
    } else if (role === 'organizacao') {
      navigate('/financeiro');
    } else if (role === 'louvor') {
      navigate('/app/dashboard');
    }
    setIsOpen(false);
  };

  const currentRoleConfig = rolesList.find((r) => r.role === activeRole) || rolesList[0];
  const CurrentRoleIcon = currentRoleConfig.icon;

  const filteredPeople = people
    .filter((p) => p.name.toLowerCase().includes(personSearch.toLowerCase()))
    .slice(0, 15);

  return (
    <>
      {/* =========================================================================
          BOTÃO FLUTUANTE ESTILO ASSISTIVETOUCH (APPLE iOS)
         ========================================================================= */}
      <div
        className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-50 select-none group"
        title="Assistive Dev - Alternar Ambientes e Perfis"
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
            boxShadow:
              '0 12px 36px 0 rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
          }}
          aria-label="Abrir AssistiveTouch Dev"
        >
          <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute inset-3 rounded-full border border-white/15 pointer-events-none" />

          <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/30 to-teal-400/20 flex items-center justify-center text-cyan-300">
            <CurrentRoleIcon size={17} className="stroke-[2.2]" />
          </div>

          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b1220] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </span>
        </button>

        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10 whitespace-nowrap shadow-xl">
              Assistive Dev:{' '}
              <span className="text-cyan-300">{currentRoleConfig.label.split('/')[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL EXPANDIDO RESUMIDO (5 MÓDULOS ESSENCIAIS)
         ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl border border-white/15 shadow-2xl p-5 overflow-hidden flex flex-col max-h-[85dvh] text-white"
            style={{
              background: 'rgba(13, 20, 36, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-white">Assistive Dev</h3>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                      5 Ambientes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Troca rápida de módulo, papel e tema
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs font-bold text-slate-200 transition-colors"
                  title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
                >
                  {isDarkMode ? (
                    <Sun size={13} className="text-amber-400" />
                  ) : (
                    <Moon size={13} className="text-cyan-300" />
                  )}
                  <span>{isDarkMode ? 'Claro' : 'Escuro'}</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Abas de Navegação */}
            <div className="flex rounded-xl bg-white/5 p-1 mb-3.5 border border-white/10">
              <button
                onClick={() => setActiveTab('modules')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'modules'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers size={13} />
                Ambientes
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'roles'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Crown size={13} />
                Papel
              </button>
              <button
                onClick={() => setActiveTab('person')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'person'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye size={13} />
                Simular
              </button>
            </div>

            {/* Aba 1: Lista Enxuta dos 5 Ambientes */}
            {activeTab === 'modules' && (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 -mr-1">
                {accessWarning && (
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px] flex items-center justify-between gap-2">
                    <span>{accessWarning}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAccessWarning(null);
                        setActiveTab('roles');
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] shrink-0"
                    >
                      Trocar Papel
                    </button>
                  </div>
                )}

                {ecosystemModules.map((item) => {
                  const Icon = item.icon;
                  const SubIcon = item.subLink?.icon;
                  const isCurrent =
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path) ||
                    (item.subLink && location.pathname.startsWith(item.subLink.path));

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNavigate(item)}
                      className={`group relative p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                        !item.hasAccess
                          ? 'bg-white/[0.02] border-white/5 opacity-55 hover:opacity-80'
                          : isCurrent
                            ? 'bg-cyan-500/15 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md shrink-0 transition-transform ${
                            item.hasAccess ? 'group-hover:scale-105' : 'grayscale'
                          }`}
                        >
                          <Icon size={19} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white truncate">
                              {item.name}
                            </span>
                            {isCurrent && item.hasAccess && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                            )}
                            {!item.hasAccess && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                                <Lock size={9} /> Restrito
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 block truncate">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.subLink && SubIcon && item.hasAccess && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubNavigate(item.subLink!.path);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-400 hover:text-slate-950 text-[10px] font-black text-cyan-200 border border-white/10 transition-colors"
                            title={item.subLink.label}
                          >
                            <SubIcon size={12} />
                            <span>{item.subLink.shortLabel}</span>
                          </button>
                        )}
                        {item.hasAccess ? (
                          <ArrowRight
                            size={14}
                            className="text-slate-500 group-hover:text-cyan-300 transition-colors"
                          />
                        ) : (
                          <Lock size={14} className="text-slate-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Aba 2: Role Switcher */}
            {activeTab === 'roles' && (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 -mr-1">
                {rolesList.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeRole === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shrink-0`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">
                              {item.label}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] bg-cyan-400 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                                Ativo
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
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

                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      setDevRole('pastoral');
                      setSimulatedPersonId(null);
                      navigate('/igreja');
                      setIsOpen(false);
                    }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw size={13} />
                    Resetar para Pastoral Padrão
                  </button>
                </div>
              </div>
            )}

            {/* Aba 3: Simular Membro Específico */}
            {activeTab === 'person' && (
              <div className="overflow-y-auto flex-1 flex flex-col pr-1 -mr-1">
                <div className="relative mb-2.5">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
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
                            <span
                              className={
                                p.paymentStatus === 'PAGO'
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }
                            >
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

            {/* Footer Compacto */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">
                  Papel: <strong className="text-white">{roleLabel}</strong>
                </span>
                {activeRole === 'membro' && simulatedPerson && (
                  <span className="text-cyan-300 font-semibold truncate max-w-[100px]">
                    ({simulatedPerson.name.split(' ')[0]})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/');
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 hover:text-white font-bold text-[10px] transition-colors shrink-0 active:scale-95"
                  title="Abrir Pré-Page de Abertura"
                >
                  <Waves size={11} />
                  <span>Pré-Page</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white font-bold text-[10px] transition-colors shrink-0 active:scale-95"
                  title="Abrir Tela de Login"
                >
                  <LogIn size={11} />
                  <span>Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
