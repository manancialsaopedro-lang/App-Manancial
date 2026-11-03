import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  User,
  Users,
  Calendar,
  Layers,
  Inbox,
  GraduationCap,
  Sparkles,
  Tag,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Church,
  ArrowLeft,
  Home,
  MessageSquare,
  Tent,
  Trophy,
  Flag,
  Wallet,
  ShoppingBag,
  ExternalLink,
  Globe,
  Clock,
  CheckSquare,
  Music,
  Search
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { CommandPalette } from '../../../components/ui/CommandPalette';
import { TooltipProvider } from '../../../components/ui/Tooltip';

interface NavSubItem {
  label: string;
  path: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path?: string;
  subItems?: NavSubItem[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const DevLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    membros: false,
    acampamento: true,
    gincana: false,
    caixa: false,
  });
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [customToastMessage, setCustomToastMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppStore();

  const triggerCustomToast = (msg: string) => {
    setCustomToastMessage(msg);
    setTimeout(() => setCustomToastMessage(null), 3500);
  };

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const navSections: NavSection[] = [
    {
      title: 'Igreja & Secretaria',
      items: [
        {
          id: 'igreja',
          label: 'Dados da Igreja',
          icon: Church,
          path: '/igreja',
        },
        {
          id: 'solicitacoes',
          label: 'Solicitações',
          icon: Inbox,
          path: '/solicitacoes',
          badge: 'Novo',
        },
        {
          id: 'notificacoes',
          label: 'Notificações WhatsApp',
          icon: MessageSquare,
          path: '/notificacoes',
        },
        {
          id: 'membros',
          label: 'Membros & Presença',
          icon: Users,
          subItems: [
            { label: 'Lista de Membros', path: '/membros' },
            { label: 'Chamada & Presença', path: '/presenca' },
            { label: 'Mensagens em 1 Toque', path: '/mensagens' },
            { label: 'Relatórios de Culto', path: '/relatorios' },
            { label: 'Visitantes Cadastrados', path: '/visitantes' },
          ],
        },
        {
          id: 'celulas',
          label: 'Células & Grupos',
          icon: Layers,
          path: '/celulas',
        },
        {
          id: 'cursos',
          label: 'Cursos & Discipulado',
          icon: GraduationCap,
          path: '/cursos',
        },
        {
          id: 'eventos',
          label: 'Eventos & Calendário',
          icon: Calendar,
          path: '/eventos',
        },
        {
          id: 'louvor',
          label: 'Min. de Louvor',
          icon: Music,
          path: '/app/dashboard',
        },
      ],
    },
    {
      title: 'Acampamento & Gincana',
      items: [
        {
          id: 'acampamento',
          label: 'Retiro & Acampamento',
          icon: Tent,
          subItems: [
            { label: 'Visão Geral do Retiro', path: '/acampamento' },
            { label: 'Informações & Regras 2027', path: '/acampamento/informacoes' },
            { label: 'Gestão de Pagamentos', path: '/acampamento/pagamentos' },
          ],
        },
        {
          id: 'gincana',
          label: 'Gincana 25:14',
          icon: Trophy,
          subItems: [
            { label: 'Placar Geral ao Vivo', path: '/gincana/placar' },
            { label: 'Coordenação & Painel', path: '/gincana/dash' },
            { label: 'Provas & Jurados', path: '/gincana/proofs' },
            { label: 'Equipes & Tribos', path: '/gincana/equipes-geral' },
            { label: 'Cronograma do Retiro', path: '/gincana/time' },
          ],
        },
      ],
    },
    {
      title: 'Caixa & Cantina',
      items: [
        {
          id: 'caixa',
          label: 'Operação Financeira',
          icon: Wallet,
          subItems: [
            { label: 'Financeiro & Tesouraria', path: '/financeiro' },
            { label: 'Cantina & PDV Oficial', path: '/cantina' },
            { label: 'Central do Caixa', path: '/org/cashier-hub' },
            { label: 'Fechamento Diário', path: '/org/closing' },
          ],
        },
      ],
    },
    {
      title: 'Páginas Públicas',
      items: [
        {
          id: 'landing',
          label: 'Nova Landing Page',
          icon: Globe,
          path: '/landing',
          badge: 'Online',
        },
        {
          id: 'visitante',
          label: 'Recepção de Visitantes',
          icon: Sparkles,
          path: '/visitante',
        },
      ],
    },
  ];

  const handleNotificationClick = () => {
    setShowNotificationToast(true);
    setUnreadNotifications(0);
    setTimeout(() => setShowNotificationToast(false), 3000);
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-[#082f38] text-slate-100 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-200 flex items-center justify-center text-cyan-950 font-black shadow-lg shadow-cyan-950/40">
            <span className="text-xl">M</span>
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
              Manancial <span className="text-cyan-300 font-medium">Gestão</span>
            </h1>
            <p className="text-[10px] text-cyan-300/60 font-semibold uppercase tracking-wider">
              Painel Integrado
            </p>
          </div>
        </div>
      </div>

      {/* Quick Spotlight Search Trigger in Sidebar */}
      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            setSpotlightOpen(true);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-950 border border-cyan-800/50 text-cyan-200/80 hover:text-white text-xs font-semibold transition-all shadow-inner"
        >
          <span className="flex items-center gap-2">
            <Search size={14} className="text-cyan-400" />
            <span>Busca Rápida...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-black bg-cyan-900/80 text-cyan-300 rounded border border-cyan-700/60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav Menu Categories */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 pt-2 pb-1 text-[10px] font-black tracking-widest text-cyan-200/50 uppercase">
              {section.title}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = !!item.subItems && item.subItems.length > 0;
              const isExpanded = !!expandedMenus[item.id];
              const isCurrentActive = item.path
                ? location.pathname === item.path || (item.path === '/igreja' && location.pathname === '/')
                : false;

              if (hasSubmenu) {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        isExpanded
                          ? 'bg-cyan-950/50 text-cyan-200'
                          : 'text-slate-200 hover:bg-cyan-900/30 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={17} className="text-cyan-300/80" />
                        <span>{item.label}</span>
                      </div>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isExpanded && (
                      <div className="pl-8 pr-2 py-1 space-y-0.5 border-l-2 border-cyan-800/40 ml-4">
                        {item.subItems!.map((sub) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                isSubActive
                                  ? 'bg-cyan-500 text-cyan-950 font-bold'
                                  : 'text-slate-300 hover:text-white hover:bg-cyan-900/20'
                              }`}
                            >
                              {sub.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.id}
                  to={item.path || '#'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isCurrentActive
                      ? 'bg-cyan-500 text-cyan-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-200 hover:bg-cyan-900/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={17}
                      className={isCurrentActive ? 'text-cyan-950' : 'text-cyan-300/80'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        isCurrentActive
                          ? 'bg-cyan-950 text-cyan-200'
                          : 'bg-cyan-800 text-cyan-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Quick Link to Landing Page & Ecosystem Hub */}
      <div className="p-3 border-t border-cyan-900/40 bg-cyan-950/40 space-y-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-bold transition-all border border-cyan-500/30"
        >
          <Home size={14} />
          <span>Hub do Ecossistema</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/landing')}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-[11px] font-semibold transition-all border border-white/5"
        >
          <Globe size={13} />
          <span>Ver Landing Page</span>
        </button>
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-[#f4f8f9] flex flex-col lg:flex-row text-slate-800">
        {/* Global Spotlight Command Palette (Ctrl+K / Cmd+K) */}
        <CommandPalette
          open={spotlightOpen}
          onOpenChange={setSpotlightOpen}
          onToast={triggerCustomToast}
        />

        {/* Toast Feedback */}
        {(showNotificationToast || customToastMessage) && (
          <div className="fixed top-5 right-5 z-[100] bg-cyan-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-700 animate-in fade-in slide-in-from-top-3">
            <Bell size={18} className="text-cyan-300" />
            <span className="text-xs font-medium">
              {customToastMessage || 'Você não tem novas notificações no momento.'}
            </span>
          </div>
        )}

      {/* Desktop Sidebar (lg+) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 border-r border-cyan-950/20 shadow-xl z-30">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer (offcanvas) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-cyan-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide-out drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger on mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Abrir Menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                Congregação
              </span>
              <h2 className="text-sm lg:text-base font-black tracking-tight text-slate-900 mt-0.5">
                IGREJA MANANCIAL
              </h2>
            </div>
          </div>

          {/* Right Header Actions: Spotlight Search, Ecosystem Hub, Landing Link, Notifications & Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Spotlight Search Trigger (⌘K / Ctrl+K) */}
            <button
              type="button"
              onClick={() => setSpotlightOpen(true)}
              className="inline-flex items-center gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 bg-slate-100/90 hover:bg-slate-200/80 hover:text-slate-800 border border-slate-200/90 transition-all shadow-2xs group"
              title="Busca Rápida Spotlight (⌘K / Ctrl+K)"
            >
              <Search size={14} className="text-cyan-700 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-slate-500 group-hover:text-slate-800">
                Buscar membro ou ação...
              </span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-black text-cyan-900 bg-white rounded border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              title="Voltar ao Hub do Ecossistema"
            >
              <Home size={14} className="text-cyan-700" />
              <span className="hidden sm:inline">Hub Inicial</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/landing')}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-all"
            >
              <Globe size={14} />
              <span>Landing Page</span>
            </button>

            <button
              type="button"
              onClick={handleNotificationClick}
              className="relative p-2 rounded-full text-slate-600 hover:text-cyan-900 hover:bg-slate-100 transition-all active:scale-90"
              title="Notificações"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#082f38] to-[#0a434d] flex items-center justify-center text-cyan-200 font-bold text-xs shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={15} />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {user?.name || 'Administrador'}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Gestor</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          <Outlet />
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
};
