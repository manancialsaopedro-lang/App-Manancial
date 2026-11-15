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
  LogIn,
  Waves,
  Map,
} from 'lucide-react';
import { useAppStore } from '../store';
import { DEFAULT_ADMIN_USER } from '../store/slices/authSlice';
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

interface AllScreensGroup {
  category: string;
  routes: { label: string; path: string }[];
}

const ALL_APP_SCREENS: AllScreensGroup[] = [
  {
    category: 'Abertura, Auth & Públicas',
    routes: [
      { label: 'Pré-Page Fluida (Splash)', path: '/' },
      { label: 'Hub Geral do Ecossistema', path: '/hub' },
      { label: 'Tela de Login Principal', path: '/login' },
      { label: 'Mesh Gradient WebGL (21st.dev)', path: '/mesh-gradient' },
      { label: 'Confirmação / Recuperar Senha', path: '/auth/confirm' },
      { label: 'Landing Page Institucional', path: '/landing' },
      { label: 'Wizard de Visitantes', path: '/visitante' },
      { label: 'Completar Cadastro de Membro', path: '/completar-cadastro' },
    ],
  },
  {
    category: 'Gestão Pastoral & Secretaria',
    routes: [
      { label: 'Dados da Igreja & Painel', path: '/igreja' },
      { label: 'Lista Geral de Membros', path: '/membros' },
      { label: 'Radar de Visitantes & Visitas', path: '/visitantes' },
      { label: 'Chamada & Presença', path: '/presenca' },
      { label: 'Mensagens WhatsApp 1 Toque', path: '/mensagens' },
      { label: 'Relatórios de Culto', path: '/relatorios' },
      { label: 'Células & Pequenos Grupos', path: '/celulas' },
      { label: 'Cursos & Discipulado', path: '/cursos' },
      { label: 'Eventos & Calendário', path: '/eventos' },
      { label: 'Solicitações Pastorais', path: '/solicitacoes' },
      { label: 'Notificações WhatsApp', path: '/notificacoes' },
    ],
  },
  {
    category: 'Espaço do Membro (App Igreja)',
    routes: [
      { label: 'Início do Membro', path: '/igreja/membro' },
      { label: 'Atendimento Pastoral', path: '/igreja/membro/atendimento' },
      { label: 'Eventos & Cultos', path: '/igreja/membro/eventos' },
      { label: 'Ensino & Teologia', path: '/igreja/membro/ensino' },
      { label: 'Meu Perfil & Dízimos', path: '/igreja/membro/perfil' },
    ],
  },
  {
    category: 'Financeiro, Cantina & Organização',
    routes: [
      { label: 'Financeiro & Tesouraria Oficial', path: '/financeiro' },
      { label: 'Cantina & PDV Multi-evento', path: '/cantina' },
      { label: 'Organização — Início', path: '/org/home' },
      { label: 'Organização — Dashboard', path: '/org/dash' },
      { label: 'Central do Caixa', path: '/org/cashier-hub' },
      { label: 'Inscritos (Organização)', path: '/org/list' },
      { label: 'Análises Financeiras', path: '/org/analytics' },
      { label: 'Detalhe de Custos', path: '/org/analytics/costs' },
      { label: 'Detalhe de Receitas', path: '/org/analytics/revenue' },
      { label: 'Aderência de Pagamentos', path: '/org/adherence' },
      { label: 'Valores a Receber', path: '/org/receivables' },
      { label: 'Previsão de Caixa', path: '/org/forecast' },
      { label: 'Total Arrecadado', path: '/org/collected' },
      { label: 'Editor de Estoque Cantina', path: '/org/canteen/stock' },
      { label: 'Wizard Rápido de Estoque', path: '/org/canteen/stock/new' },
      { label: 'Histórico de Compras', path: '/org/history' },
      { label: 'Fechamento Diário de Caixa', path: '/org/closing' },
    ],
  },
  {
    category: 'Acampamento & Gincana 25:14',
    routes: [
      { label: 'Portal do Acampamento', path: '/acampamento' },
      { label: 'Informações & Regras 2027', path: '/acampamento/informacoes' },
      { label: 'Gestão de Pagamentos Retiro', path: '/acampamento/pagamentos' },
      { label: 'Gincana — Painel Coordenação', path: '/gincana/dash' },
      { label: 'Gincana — Placar ao Vivo', path: '/gincana/placar' },
      { label: 'Gincana — Visão Geral Equipes', path: '/gincana/equipes-geral' },
      { label: 'Gincana — Participantes', path: '/gincana/list' },
      { label: 'Gincana — Materiais', path: '/gincana/materiais' },
      { label: 'Gincana — Lista de Provas', path: '/gincana/proofs' },
      { label: 'Gincana — Cronograma', path: '/gincana/time' },
      { label: 'Sub-App Acampante (Membro)', path: '/membro/home' },
    ],
  },
  {
    category: 'Ministério de Louvor (Louvor App)',
    routes: [
      { label: 'Louvor — Dashboard', path: '/app/dashboard' },
      { label: 'Louvor — Escalas & Agenda', path: '/app/schedule' },
      { label: 'Louvor — Repertório & Cifras', path: '/app/repertoire' },
      { label: 'Louvor — Equipe & Integrantes', path: '/app/team' },
      { label: 'Louvor — Hub de Estudos', path: '/app/study' },
      { label: 'Louvor — Novas Músicas', path: '/app/new-songs' },
      { label: 'Louvor — Sugestões', path: '/app/suggestions' },
      { label: 'Louvor — Insights & Métricas', path: '/app/insights' },
      { label: 'Louvor — Avaliações da Equipe', path: '/app/avaliacoes' },
      { label: 'Louvor — Configurações', path: '/app/settings' },
      { label: 'Louvor — Tela de Login', path: '/louvor/login' },
    ],
  },
];

export const AssistiveTouchDev: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'screens' | 'roles' | 'person'>('modules');
  const [personSearch, setPersonSearch] = useState('');
  const [screenSearch, setScreenSearch] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const {
    isDarkMode,
    toggleTheme,
    people,
    setDevRole,
    simulatedPersonId,
    setSimulatedPersonId,
    signIn,
  } = useAppStore();
  const {
    activeRole,
    roleLabel,
    simulatedPerson,
  } = useCurrentRole();

  // Garante acesso livre a todos os 5 módulos principais em Modo Construção
  const ecosystemModules: EcosystemModuleItem[] = [
    {
      id: 'gestao',
      name: 'Gestão Pastores',
      icon: Church,
      path: '/igreja',
      color: 'from-cyan-500 to-teal-500',
      badge: 'Igreja, Membros & Células',
      hasAccess: true,
      subLink: {
        label: 'Abrir Hub Geral',
        shortLabel: 'Hub Geral',
        path: '/hub',
        icon: Layers,
      },
    },
    {
      id: 'membro',
      name: 'Espaço Membro',
      icon: Users,
      path: '/igreja/membro',
      color: 'from-emerald-500 to-teal-500',
      badge: 'App do Membro',
      hasAccess: true,
    },
    {
      id: 'acampamento',
      name: 'Acampamento & Gincana',
      icon: Tent,
      path: '/acampamento',
      color: 'from-amber-500 to-orange-500',
      badge: 'Retiro & Coord. Gincana',
      hasAccess: true,
      subLink: {
        label: 'Abrir Coordenação Gincana 25:14',
        shortLabel: 'Gincana',
        path: '/gincana/dash',
        icon: Trophy,
      },
    },
    {
      id: 'financeiro',
      name: 'Financeiro & Caixa',
      icon: Wallet,
      path: '/financeiro',
      color: 'from-purple-500 to-indigo-500',
      badge: 'Tesouraria & Cantina',
      hasAccess: true,
      subLink: {
        label: 'Abrir Cantina PDV',
        shortLabel: 'Cantina',
        path: '/cantina',
        icon: ShoppingBag,
      },
    },
    {
      id: 'louvor',
      name: 'Min. Louvor',
      icon: Music,
      path: '/app/dashboard',
      color: 'from-pink-500 to-rose-500',
      badge: 'Escalas, Cifras & Equipe',
      hasAccess: true,
    },
  ];

  // Papéis disponíveis para prévia local
  const rolesList: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    {
      role: 'admin',
      label: 'Admin / Construtor (Livre)',
      icon: Crown,
      color: 'from-amber-400 to-yellow-600',
      desc: 'Acesso total irrestrito a 100% das telas e módulos',
    },
    {
      role: 'primeiro_pastor',
      label: 'Primeiro Pastor',
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      desc: 'Presidente: gestão pastoral, financeira, gincana e louvor',
    },
    {
      role: 'segundo_pastor',
      label: 'Segundo Pastor',
      icon: Crown,
      color: 'from-teal-500 to-cyan-600',
      desc: 'Gestão pastoral, financeira, gincana e louvor',
    },
    {
      role: 'equipe_pastoral',
      label: 'Equipe Pastoral',
      icon: Users,
      color: 'from-cyan-500 to-sky-600',
      desc: 'Cuidado pastoral e acompanhamento de visitantes',
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
      role: 'lider_equipe',
      label: 'Líder de Equipe',
      icon: Trophy,
      color: 'from-lime-500 to-emerald-600',
      desc: 'Visualização da equipe, materiais e provas da gincana',
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
    {
      role: 'visitante',
      label: 'Visitante',
      icon: Eye,
      color: 'from-slate-400 to-slate-600',
      desc: 'Acesso público de visitante sem privilégios internos',
    },
  ];

  const ensureAdminSessionAndGo = (path: string) => {
    if (!useAppStore.getState().user) {
      signIn(DEFAULT_ADMIN_USER.email, DEFAULT_ADMIN_USER.name, 'admin', undefined, {
        id: DEFAULT_ADMIN_USER.id,
        churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
        isWorshipMember: true,
        isWorshipLeader: true,
      });
    }
    navigate(path);
    setIsOpen(false);
  };

  const handleNavigate = (item: EcosystemModuleItem) => {
    ensureAdminSessionAndGo(item.path);
  };

  const handleSubNavigate = (path: string) => {
    ensureAdminSessionAndGo(path);
  };

  const handleRoleSelect = (role: UserRole) => {
    setDevRole(role);
    signIn(DEFAULT_ADMIN_USER.email, DEFAULT_ADMIN_USER.name, role, undefined, {
      id: DEFAULT_ADMIN_USER.id,
      churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
      isWorshipMember: true,
      isWorshipLeader: true,
    });
    if (role === 'membro') {
      navigate('/igreja/membro');
    } else if (role === 'visitante') {
      navigate('/visitante');
    } else if (role === 'equipe_pastoral') {
      navigate('/visitantes');
    } else if (role === 'admin' || role === 'primeiro_pastor' || role === 'segundo_pastor' || role === 'pastoral') {
      navigate('/igreja');
    } else if (role === 'gincana' || role === 'lider_equipe') {
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

  const filteredScreenGroups = ALL_APP_SCREENS.map((group) => ({
    ...group,
    routes: group.routes.filter(
      (r) =>
        r.label.toLowerCase().includes(screenSearch.toLowerCase()) ||
        r.path.toLowerCase().includes(screenSearch.toLowerCase())
    ),
  })).filter((g) => g.routes.length > 0);

  return (
    <>
      {/* =========================================================================
          BOTÃO FLUTUANTE ESTILO ASSISTIVETOUCH (SEMPRE VISÍVEL EM TODAS AS TELAS)
         ========================================================================= */}
      <div
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-6 right-3 sm:right-5 z-[999] select-none group"
        title="Assistive Admin — Acesso Livre a Todas as Telas"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-2xl cursor-pointer ${
            isOpen
              ? 'ring-4 ring-cyan-400/50 scale-105'
              : 'opacity-90 hover:opacity-100 hover:scale-105 hover:ring-2 hover:ring-amber-400/60'
          }`}
          style={{
            background: 'rgba(11, 18, 32, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(251, 191, 36, 0.45)',
            boxShadow:
              '0 12px 36px 0 rgba(0, 0, 0, 0.65), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
          }}
          aria-label="Abrir AssistiveTouch Admin"
        >
          <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute inset-3 rounded-full border border-white/15 pointer-events-none" />

          <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/30 to-cyan-400/25 flex items-center justify-center text-amber-300">
            <CurrentRoleIcon size={17} className="stroke-[2.2]" />
          </div>

          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b1220] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </span>
        </button>

        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-slate-900/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-400/30 whitespace-nowrap shadow-xl">
              Admin Livre:{' '}
              <span className="text-amber-300">{currentRoleConfig.label.split('/')[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL EXPANDIDO (AMBIENTES + TODAS AS TELAS + PAPEL + SIMULAR)
         ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl border border-white/15 shadow-2xl p-5 overflow-hidden flex flex-col max-h-[86dvh] text-white"
            style={{
              background: 'rgba(13, 20, 36, 0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/35 text-amber-300 flex items-center justify-center">
                  <Crown size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-white">Acesso Livre Admin</h3>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Sem Bloqueio
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Navegue para qualquer tela do aplicativo em 1 clique
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
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
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Abas de Navegação */}
            <div className="grid grid-cols-4 rounded-xl bg-white/5 p-1 mb-3.5 border border-white/10 gap-1">
              <button
                onClick={() => setActiveTab('modules')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'modules'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers size={12} />
                <span>Módulos</span>
              </button>
              <button
                onClick={() => setActiveTab('screens')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'screens'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Map size={12} />
                <span>Telas (50+)</span>
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'roles'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Crown size={12} />
                <span>Papel</span>
              </button>
              <button
                onClick={() => setActiveTab('person')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'person'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye size={12} />
                <span>Simular</span>
              </button>
            </div>

            {/* Aba 1: Lista Enxuta dos 5 Ambientes */}
            {activeTab === 'modules' && (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 -mr-1">
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
                        isCurrent
                          ? 'bg-cyan-500/15 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105`}
                        >
                          <Icon size={19} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white truncate">
                              {item.name}
                            </span>
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 block truncate">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.subLink && SubIcon && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubNavigate(item.subLink!.path);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-400 hover:text-slate-950 text-[10px] font-black text-cyan-200 border border-white/10 transition-colors cursor-pointer"
                            title={item.subLink.label}
                          >
                            <SubIcon size={12} />
                            <span>{item.subLink.shortLabel}</span>
                          </button>
                        )}
                        <ArrowRight
                          size={14}
                          className="text-slate-500 group-hover:text-cyan-300 transition-colors"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Aba 2: Mapa Completo de Todas as Telas do App */}
            {activeTab === 'screens' && (
              <div className="overflow-y-auto flex-1 flex flex-col pr-1 -mr-1">
                <div className="relative mb-2.5">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Filtrar qualquer tela ou rota..."
                    value={screenSearch}
                    onChange={(e) => setScreenSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-64 pr-1">
                  {filteredScreenGroups.map((group) => (
                    <div key={group.category} className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 px-1">
                        {group.category}
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {group.routes.map((route) => {
                          const isCurrent = location.pathname === route.path;
                          return (
                            <button
                              key={route.path}
                              type="button"
                              onClick={() => ensureAdminSessionAndGo(route.path)}
                              className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs transition-all border cursor-pointer ${
                                isCurrent
                                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 font-bold'
                                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-200'
                              }`}
                            >
                              <span className="truncate pr-2">{route.label}</span>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {route.path}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aba 3: Role Switcher */}
            {activeTab === 'roles' && (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 -mr-1">
                {rolesList.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeRole === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border cursor-pointer ${
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
                      setDevRole('admin');
                      setSimulatedPersonId(null);
                      ensureAdminSessionAndGo('/igreja');
                    }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    Resetar para Admin Total
                  </button>
                </div>
              </div>
            )}

            {/* Aba 4: Simular Membro Específico */}
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
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-colors border cursor-pointer ${
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
                    ensureAdminSessionAndGo('/hub');
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/35 text-amber-200 hover:text-white font-bold text-[10px] transition-colors shrink-0 active:scale-95 cursor-pointer"
                  title="Abrir Hub de Todas as Telas"
                >
                  <Sparkles size={11} />
                  <span>Hub</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/');
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 hover:text-white font-bold text-[10px] transition-colors shrink-0 active:scale-95 cursor-pointer"
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
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white font-bold text-[10px] transition-colors shrink-0 active:scale-95 cursor-pointer"
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
