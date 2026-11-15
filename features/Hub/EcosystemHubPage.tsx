import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Church,
  Users,
  Tent,
  Music,
  Wallet,
  ShoppingBag,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  ExternalLink,
  Sun,
  Moon,
  LogOut,
  Home,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';
import { signOut as supabaseSignOut, isSupabaseConfigured } from '../../lib/supabase';

interface AppCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  badge: string;
  badgeColorDark: string;
  badgeColorLight: string;
  accentGradientDark: string;
  accentGradientLight: string;
  iconBgLight: string;
  isMain?: boolean;
  statusText?: string;
  stats?: string;
  allowed?: boolean;
}

export const EcosystemHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, signOut } = useAppStore();
  const {
    activeRole,
    defaultRoute,
    roleLabel,
    canAccessPastoral,
    canAccessMember,
    canAccessOrg,
    canAccessLouvor,
  } = useCurrentRole();

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabaseSignOut();
      }
    } catch {
      // ignora erro remoto e limpa sessão local
    } finally {
      localStorage.removeItem('louvor_logged_member');
      signOut();
      navigate('/login', { replace: true });
    }
  };

  const apps: AppCardProps[] = [
    {
      title: 'Painel de Gestão',
      subtitle: 'Pastores & Liderança Ministerial',
      description:
        'Gestão completa da igreja: rol de membros, frequência via WhatsApp, relatórios de cultos, células, cursos e solicitações pastorais.',
      icon: Church,
      path: '/igreja',
      badge: 'Foco Principal • Ativo',
      badgeColorDark: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      badgeColorLight: 'bg-cyan-50 text-cyan-800 border border-cyan-200',
      accentGradientDark:
        'from-cyan-500/20 to-teal-500/10 border-cyan-500/30 hover:border-cyan-400',
      accentGradientLight:
        'border-cyan-300/80 hover:border-cyan-500 bg-gradient-to-br from-white via-cyan-50/40 to-teal-50/30',
      iconBgLight: 'bg-cyan-50 text-[#082f38] border-cyan-200',
      isMain: true,
      statusText: '100% Funcional',
      stats: 'Membros • Frequência • Relatórios • Células',
    },
    {
      title: 'Área do Membro',
      subtitle: 'App Membro Manancial',
      description:
        'Portal pessoal dos membros: programação dos cultos da semana, pedidos de oração, devocionais, mural de recados e ficha ministerial.',
      icon: Users,
      path: '/igreja/membro',
      badge: 'Experiência do Membro',
      badgeColorDark:
        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      badgeColorLight:
        'bg-emerald-50 text-emerald-800 border border-emerald-200',
      accentGradientDark:
        'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
      accentGradientLight:
        'border-slate-200/90 hover:border-emerald-400 bg-white',
      iconBgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      statusText: 'Ativo',
      stats: 'Cultos • Oração • Notícias • Dados',
    },
    {
      title: 'Acamp Manancial',
      subtitle: 'Retiro 25:14 & Gincana',
      description:
        'Módulo de acampamento: gestão de inscrições e pagamentos, equipes/tribos, placar da gincana ao vivo, provas, jurados e cronograma.',
      icon: Tent,
      path: '/acampamento',
      badge: 'Módulo de Eventos',
      badgeColorDark:
        'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      badgeColorLight: 'bg-amber-50 text-amber-800 border border-amber-200',
      accentGradientDark:
        'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400',
      accentGradientLight:
        'border-slate-200/90 hover:border-amber-400 bg-white',
      iconBgLight: 'bg-amber-50 text-amber-700 border-amber-200',
      statusText: 'Ativo',
      stats: 'Placar • Tribos • Provas • Regras',
    },
    {
      title: 'Cantina & Caixa da Igreja',
      subtitle: 'PDV & Fechamento Multi-evento',
      description:
        'Módulo autônomo de caixa: PDV rápido com comanda e fechamento por pessoa, controle de estoque, múltiplas formas de pagamento e conciliação.',
      icon: ShoppingBag,
      path: '/cantina',
      badge: 'Caixa & PDV',
      badgeColorDark:
        'bg-orange-500/10 text-orange-400 border border-orange-500/30',
      badgeColorLight: 'bg-orange-50 text-orange-800 border border-orange-200',
      accentGradientDark:
        'from-orange-500/20 to-red-500/10 border-orange-500/30 hover:border-orange-400',
      accentGradientLight:
        'border-slate-200/90 hover:border-orange-400 bg-white',
      iconBgLight: 'bg-orange-50 text-orange-700 border-orange-200',
      statusText: 'Multi-evento',
      stats: 'PDV • Fechamento p/ Pessoa • Estoque',
    },
    {
      title: 'Financeiro Manancial',
      subtitle: 'Tesouraria & Contabilidade',
      description:
        'Visão executiva financeira: entradas, dízimos, ofertas, despesas, contas a pagar/receber e integração direta com o faturamento da cantina.',
      icon: Wallet,
      path: '/financeiro',
      badge: 'Gestão Financeira',
      badgeColorDark:
        'bg-purple-500/10 text-purple-400 border border-purple-500/30',
      badgeColorLight: 'bg-purple-50 text-purple-800 border border-purple-200',
      accentGradientDark:
        'from-purple-500/20 to-indigo-500/10 border-purple-500/30 hover:border-purple-400',
      accentGradientLight:
        'border-slate-200/90 hover:border-purple-400 bg-white',
      iconBgLight: 'bg-purple-50 text-purple-700 border-purple-200',
      statusText: 'Tesouraria',
      stats: 'Entradas • Despesas • Balancetes',
    },
    {
      title: 'Ministério de Louvor',
      subtitle: 'Min. Louvor Manancial App',
      description:
        'App dedicado para os músicos: escalas de culto, repertório com cifras, ensaios, novidades e player de estudo multipista.',
      icon: Music,
      path: '/app/dashboard',
      badge: 'Oficial Integrado ✨',
      badgeColorDark: 'bg-pink-500/10 text-pink-400 border border-pink-500/30',
      badgeColorLight: 'bg-pink-50 text-pink-800 border border-pink-200',
      accentGradientDark:
        'from-pink-500/20 to-rose-500/10 border-pink-500/30 hover:border-pink-400',
      accentGradientLight: 'border-slate-200/90 hover:border-pink-400 bg-white',
      iconBgLight: 'bg-pink-50 text-pink-700 border-pink-200',
      statusText: '100% Funcional',
      stats: 'Escalas • Repertório • Cifras • Ensaios',
    },
    {
      title: 'Landing Page Institucional',
      subtitle: 'Portal Aberto da Manancial',
      description:
        'Página pública de boas-vindas: horários de cultos, localização, ministrações, formulário de novos visitantes e visão da igreja.',
      icon: Globe,
      path: '/landing',
      badge: 'Público / Visitantes',
      badgeColorDark: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      badgeColorLight: 'bg-blue-50 text-blue-800 border border-blue-200',
      accentGradientDark:
        'from-blue-500/20 to-cyan-500/10 border-blue-500/30 hover:border-blue-400',
      accentGradientLight: 'border-slate-200/90 hover:border-blue-400 bg-white',
      iconBgLight: 'bg-blue-50 text-blue-700 border-blue-200',
      statusText: 'Acesso Livre',
      stats: 'Cultos • Endereço • Visitantes',
    },
  ];

  const visibleApps = apps.filter((card) => {
    if (card.path === '/igreja') return canAccessPastoral;
    if (card.path === '/igreja/membro') return canAccessMember;
    if (card.path === '/cantina' || card.path === '/financeiro') return canAccessOrg;
    if (card.path === '/app/dashboard') return canAccessLouvor;
    return true;
  });

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 selection:bg-cyan-500 selection:text-black ${
        isDarkMode
          ? 'bg-[#070b12] text-slate-100'
          : 'bg-[#f4f8f9] text-slate-800'
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[140px] ${
            isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-300/25'
          }`}
        />
        <div
          className={`absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[160px] ${
            isDarkMode ? 'bg-emerald-500/10' : 'bg-teal-300/20'
          }`}
        />
        <div
          className={`absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[140px] ${
            isDarkMode ? 'bg-purple-500/10' : 'bg-sky-200/25'
          }`}
        />
      </div>

      {/* Top Header */}
      <header
        className={`relative z-10 border-b backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-4 transition-colors ${
          isDarkMode
            ? 'border-white/10 bg-[#070b12]/80'
            : 'border-slate-200/80 bg-white/90 shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#082f38] to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-[#070b12] text-cyan-400'
                    : 'bg-[#082f38] text-cyan-200'
                }`}
              >
                <Church size={22} className="stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`font-black text-lg sm:text-xl tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Ecossistema Manancial
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isDarkMode
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                  }`}
                >
                  Dev Hub
                </span>
              </div>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Hub unificado de desenvolvimento e navegação entre ambientes
              </p>
            </div>
          </div>

          {/* Quick Info, Theme Toggle & Direct Action */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Papel Ativo:</span>
              <strong
                className={`capitalize ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {activeRole}
              </strong>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              }`}
              title={
                isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'
              }
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">
                {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/landing')}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              }`}
              title="Ir para a Landing Page"
            >
              <Home size={16} />
              <span className="hidden md:inline">Início</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(defaultRoute)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs active:scale-95 transition-all shadow-md ${
                isDarkMode
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-cyan-500/20'
                  : 'bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 shadow-cyan-950/15'
              }`}
              title={roleLabel}
            >
              <span>Meu Painel</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode
                  ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-300'
                  : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
              }`}
              title="Sair da conta"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Banner de Boas-Vindas */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 mb-8 shadow-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-[#0c1626] via-[#091f2c] to-[#082a2f] border-cyan-500/20 text-white'
              : 'bg-gradient-to-br from-[#082f38] via-[#0a3d48] to-[#0c4a56] border-cyan-800/30 text-white'
          }`}
        >
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-200 text-xs font-semibold mb-3">
              <Sparkles size={13} />
              Ambiente Integrado • 7 Módulos em 1 Só Aplicação
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Selecione o ambiente que deseja testar ou gerenciar
            </h2>
            <p className="mt-2 text-sm sm:text-base text-cyan-100/90 leading-relaxed">
              Todos os módulos compartilham o mesmo banco de dados, membros,
              eventos e movimentações. Use o botão flutuante{' '}
              <span className="text-cyan-300 font-bold">AssistiveTouch</span> no
              canto da tela a qualquer momento para alternar entre ambientes e
              papéis.
            </p>
          </div>

          <div className="absolute right-4 bottom-[-20px] opacity-10 pointer-events-none hidden lg:block">
            <Church size={240} className="text-cyan-200" />
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layers
              size={18}
              className={isDarkMode ? 'text-cyan-400' : 'text-[#082f38]'}
            />
            <h3
              className={`text-sm font-black uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-700'
              }`}
            >
              Módulos do Ecossistema
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {visibleApps.length} seções disponíveis
          </span>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.title}
                onClick={() => navigate(app.path)}
                className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-5 sm:p-6 cursor-pointer transition-all duration-200 border hover:-translate-y-1 ${
                  isDarkMode
                    ? `bg-[#0b121e]/90 backdrop-blur-xl ${app.accentGradientDark} hover:shadow-2xl hover:shadow-cyan-500/10 ${
                        app.isMain ? 'ring-1 ring-cyan-400/40' : ''
                      }`
                    : `${app.accentGradientLight} shadow-sm hover:shadow-xl hover:shadow-cyan-900/5 ${
                        app.isMain ? 'ring-2 ring-cyan-500/30' : ''
                      }`
                }`}
              >
                <div>
                  {/* Top card metadata */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-white group-hover:bg-cyan-500 group-hover:text-slate-950'
                          : `${app.iconBgLight} group-hover:bg-[#082f38] group-hover:text-cyan-200`
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isDarkMode ? app.badgeColorDark : app.badgeColorLight
                      }`}
                    >
                      {app.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h4
                    className={`text-lg font-black transition-colors flex items-center gap-2 ${
                      isDarkMode
                        ? 'text-white group-hover:text-cyan-300'
                        : 'text-slate-900 group-hover:text-[#082f38]'
                    }`}
                  >
                    {app.title}
                    <ArrowRight
                      size={16}
                      className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ${
                        isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
                      }`}
                    />
                  </h4>
                  <p
                    className={`text-xs font-semibold mt-0.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {app.subtitle}
                  </p>

                  {/* Description */}
                  <p
                    className={`text-xs mt-3 leading-relaxed line-clamp-3 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {app.description}
                  </p>
                </div>

                {/* Footer metadata */}
                <div
                  className={`mt-5 pt-4 border-t flex items-center justify-between text-[11px] ${
                    isDarkMode
                      ? 'border-white/5 text-slate-400'
                      : 'border-slate-100 text-slate-500'
                  }`}
                >
                  <span className="truncate pr-2 font-medium">{app.stats}</span>
                  <span
                    className={`flex items-center gap-1 font-bold shrink-0 ${
                      isDarkMode ? 'text-cyan-400' : 'text-[#082f38]'
                    }`}
                  >
                    Acessar
                    <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informações da Arquitetura */}
        <div
          className={`mt-10 p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
            isDarkMode
              ? 'bg-white/[0.02] border-white/5 text-slate-400'
              : 'bg-white border-slate-200/80 text-slate-600 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isDarkMode
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'bg-cyan-50 text-[#082f38]'
              }`}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <p
                className={`font-bold ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-900'
                }`}
              >
                Base de Dados Unificada (Single Source of Truth)
              </p>
              <p className="text-[11px] text-slate-500">
                Membros, cronograma e finanças conversam entre todos os módulos
                em tempo real.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Dica:</span>
            <span
              className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Clique na bolinha flutuante para trocar de ambiente sem voltar
              aqui
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 border-t py-4 px-6 text-center text-xs ${
          isDarkMode
            ? 'border-white/5 text-slate-600'
            : 'border-slate-200/80 text-slate-500 bg-white/50'
        }`}
      >
        Igreja Manancial © 2026 • Ecossistema Digital Integrado
      </footer>
    </div>
  );
};
