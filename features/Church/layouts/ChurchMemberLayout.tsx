import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Church,
  Home,
  HeartHandshake,
  Calendar,
  GraduationCap,
  User,
  Instagram,
  Tent,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useCurrentRole } from '../../../hooks/useCurrentRole';
import {
  INSTAGRAM_URL,
  getStoredPastoralRequests
} from '../data/churchMemberData';
import { PastoralRequestModal } from '../components/PastoralRequestModal';

export const ChurchMemberLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { simulatedPerson } = useCurrentRole();

  const [pendingCount, setPendingCount] = useState(0);
  const [globalPastoralModalOpen, setGlobalPastoralModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const memberFullName = simulatedPerson?.name || 'Sidney';
  const memberFirstName = memberFullName.split(' ')[0] || 'Membro';

  const refreshCounts = () => {
    const list = getStoredPastoralRequests();
    setPendingCount(list.filter((r) => r.status !== 'Atendido').length);
  };

  useEffect(() => {
    refreshCounts();
    window.addEventListener('manancial-requests-updated', refreshCounts);
    return () => {
      window.removeEventListener('manancial-requests-updated', refreshCounts);
    };
  }, [location.pathname]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const navItems = [
    {
      path: '/igreja/membro',
      end: true,
      label: 'Início',
      desktopLabel: 'Visão Geral',
      icon: Home,
    },
    {
      path: '/igreja/membro/atendimento',
      end: false,
      label: 'Atendimento',
      desktopLabel: 'Atendimento Pastoral',
      icon: HeartHandshake,
      badge: pendingCount > 0 ? String(pendingCount) : undefined,
    },
    {
      path: '/igreja/membro/eventos',
      end: false,
      label: 'Eventos',
      desktopLabel: 'Eventos & Cultos',
      icon: Calendar,
    },
    {
      path: '/igreja/membro/ensino',
      end: false,
      label: 'Teologia',
      desktopLabel: 'Teologia & Batismo',
      icon: GraduationCap,
      highlight: 'Terças',
    },
    {
      path: '/igreja/membro/perfil',
      end: false,
      label: 'Meu Espaço',
      desktopLabel: 'Dízimos & Meu Espaço',
      icon: User,
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#f4f7f9] text-slate-900 flex flex-col lg:flex-row">
      {/* Toast Global do Layout */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[120] bg-[#082f38] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-cyan-400/40 animate-in fade-in max-w-sm">
          <CheckCircle2 size={18} className="text-cyan-300 shrink-0" />
          <span className="text-xs font-bold tracking-wide leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          SIDEBAR FIXA DESKTOP (lg:flex)
      ===================================================================== */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-40 bg-[#06232a] text-white border-r border-white/10 shadow-xl select-none">
        {/* Topo da Sidebar: Marca da Igreja */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-400/15 border border-cyan-300/30 flex items-center justify-center text-cyan-300 shadow-inner shrink-0">
            <Church size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white truncate">
                IGREJA MANANCIAL
              </span>
            </div>
            <span className="text-[11px] font-bold text-cyan-300/90 block">
              Portal do Membro • São Pedro
            </span>
          </div>
        </div>

        {/* Cartão do Membro Logado + Botão Rápido Pastoral */}
        <div className="p-5 border-b border-white/10 space-y-3.5">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-cyan-400 text-[#06232a] flex items-center justify-center font-black text-sm shrink-0">
              {memberFirstName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-extrabold text-white truncate block">
                {memberFullName}
              </span>
              <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Membro Ativo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setGlobalPastoralModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-[#06232a] font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <HeartHandshake size={16} />
            <span>Solicitar Atendimento</span>
          </button>
        </div>

        {/* Menu de Navegação Principal */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <span className="px-3 text-[10px] font-black uppercase tracking-widest text-cyan-200/60 block mb-2">
            Navegação do Membro
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-white text-[#06232a] shadow-md'
                      : 'text-cyan-100/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.desktopLabel}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                    {item.highlight}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar: Links Rápidos (Instagram, Acampamento, Painel Pastoral) */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-black/15">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600/90 to-rose-600/90 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Instagram size={15} className="shrink-0" />
              <span className="truncate">@manancialsaopedro</span>
            </div>
            <ExternalLink size={13} className="shrink-0 opacity-80" />
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate('/membro/home')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-[11px] font-extrabold transition-colors cursor-pointer"
            >
              <Tent size={13} />
              <span>Retiro 25:14</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dev/solicitacoes')}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-cyan-200 text-[11px] font-extrabold transition-colors cursor-pointer"
            >
              <span>Painel Pastor</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          ÁREA PRINCIPAL (COM HEADER COMPACTO E CONTEÚDO)
      ===================================================================== */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Topbar Compacta (Mobile & Desktop) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            {/* Identidade Mobile / Breadcrumb Desktop */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="lg:hidden w-9 h-9 rounded-xl bg-[#082f38] flex items-center justify-center text-cyan-300 shadow-xs shrink-0">
                <Church size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 truncate">
                    IGREJA MANANCIAL SÃO PEDRO
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-[#082f38] bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                    App do Membro
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold truncate">
                  Olá, {memberFirstName} • Comunhão, Cuidado Pastoral & Palavra
                </p>
              </div>
            </div>

            {/* Ações Rápidas no Topo */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-extrabold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-all active:scale-95"
                title="Instagram Oficial @manancialsaopedro"
              >
                <Instagram size={15} className="text-pink-600 shrink-0" />
                <span className="hidden md:inline">@manancialsaopedro</span>
              </a>

              <button
                type="button"
                onClick={() => setGlobalPastoralModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-white bg-[#082f38] hover:bg-[#0a434d] shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={14} className="text-cyan-300" />
                <span>Atendimento Pastoral</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dev/solicitacoes')}
                className="lg:hidden inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-extrabold text-[#082f38] bg-slate-100 hover:bg-cyan-50 border border-slate-200 transition-all cursor-pointer"
                title="Abrir Painel Pastoral"
              >
                <span>Pastor</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo da Subpágina Atual com compensação garantida para a barra mobile */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-28 lg:pb-12">
          <Outlet
            context={{
              memberFullName,
              memberFirstName,
              openPastoralModal: () => setGlobalPastoralModalOpen(true),
              showToast,
            }}
          />
        </main>
      </div>

      {/* =====================================================================
          FAIXA INFERIOR DE NAVEGAÇÃO MOBILE (BOTTOM NAVIGATION BAR)
      ===================================================================== */}
      <nav
        aria-label="Navegação Principal do Membro"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                    isActive
                      ? 'text-[#082f38] font-black'
                      : 'text-slate-400 hover:text-slate-600 font-bold'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-0 inset-x-4 h-0.5 rounded-b-full bg-[#082f38]" />
                    )}
                    <div
                      className={`relative p-1.5 rounded-xl transition-colors ${
                        isActive ? 'bg-cyan-100/80 text-[#082f38]' : ''
                      }`}
                    >
                      <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] tracking-tight truncate max-w-[64px]">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Modal Global de Atendimento Pastoral */}
      <PastoralRequestModal
        isOpen={globalPastoralModalOpen}
        onClose={() => setGlobalPastoralModalOpen(false)}
        memberFullName={memberFullName}
        onSuccess={() => {
          refreshCounts();
          showToast('Solicitação enviada! O Pastor foi notificado.');
        }}
      />
    </div>
  );
};
