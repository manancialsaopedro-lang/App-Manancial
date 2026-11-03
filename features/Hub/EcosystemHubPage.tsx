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
  Crown,
  User as UserIcon,
  Trophy,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';

interface AppCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  badge: string;
  badgeColor: string;
  accentGradient: string;
  isMain?: boolean;
  statusText?: string;
  stats?: string;
}

export const EcosystemHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, devRole, setDevRole } = useAppStore();
  const { activeRole } = useCurrentRole();

  const apps: AppCardProps[] = [
    {
      title: 'Painel de Gestão',
      subtitle: 'Pastores & Liderança Ministerial',
      description: 'Gestão completa da igreja: rol de membros, frequência via WhatsApp, relatórios de cultos, células, cursos e solicitações pastorais.',
      icon: Church,
      path: '/igreja',
      badge: 'Foco Principal • Ativo',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      accentGradient: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30 hover:border-cyan-400',
      isMain: true,
      statusText: '100% Funcional',
      stats: 'Membros • Frequência • Relatórios • Células'
    },
    {
      title: 'Área do Membro',
      subtitle: 'App Membro Manancial',
      description: 'Portal pessoal dos membros: programação dos cultos da semana, pedidos de oração, devocionais, mural de recados e ficha ministerial.',
      icon: Users,
      path: '/igreja/membro',
      badge: 'Experiência do Membro',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      accentGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
      statusText: 'Ativo',
      stats: 'Cultos • Oração • Notícias • Dados'
    },
    {
      title: 'Acamp Manancial',
      subtitle: 'Retiro 25:14 & Gincana',
      description: 'Módulo de acampamento: gestão de inscrições e pagamentos, equipes/tribos, placar da gincana ao vivo, provas, jurados e cronograma.',
      icon: Tent,
      path: '/acampamento',
      badge: 'Módulo de Eventos',
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      accentGradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400',
      statusText: 'Ativo',
      stats: 'Placar • Tribos • Provas • Regras'
    },
    {
      title: 'Cantina & Caixa da Igreja',
      subtitle: 'PDV & Fechamento Multi-evento',
      description: 'Módulo autônomo de caixa: PDV rápido com comanda e fechamento por pessoa, controle de estoque, múltiplas formas de pagamento e conciliação.',
      icon: ShoppingBag,
      path: '/cantina',
      badge: 'Caixa & PDV',
      badgeColor: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
      accentGradient: 'from-orange-500/20 to-red-500/10 border-orange-500/30 hover:border-orange-400',
      statusText: 'Multi-evento',
      stats: 'PDV • Fechamento p/ Pessoa • Estoque'
    },
    {
      title: 'Financeiro Manancial',
      subtitle: 'Tesouraria & Contabilidade',
      description: 'Visão executiva financeira: entradas, dízimos, ofertas, despesas, contas a pagar/receber e integração direta com o faturamento da cantina.',
      icon: Wallet,
      path: '/financeiro',
      badge: 'Gestão Financeira',
      badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
      accentGradient: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 hover:border-purple-400',
      statusText: 'Tesouraria',
      stats: 'Entradas • Despesas • Balancetes'
    },
    {
      title: 'Ministério de Louvor',
      subtitle: 'Min. Louvor Manancial App',
      description: 'App dedicado para os músicos: escalas de culto, repertório com cifras, ensaios, novidades e inteligência musical com Gemini.',
      icon: Music,
      path: '/app/dashboard',
      badge: 'Oficial Integrado ✨',
      badgeColor: 'bg-pink-500/10 text-pink-400 border border-pink-500/30',
      accentGradient: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 hover:border-pink-400',
      statusText: '100% Funcional',
      stats: 'Escalas • Repertório • Cifras • Ensaios'
    },
    {
      title: 'Landing Page Institucional',
      subtitle: 'Portal Aberto da Manancial',
      description: 'Página pública de boas-vindas: horários de cultos, localização, ministrações, formulário de novos visitantes e visão da igreja.',
      icon: Globe,
      path: '/landing',
      badge: 'Público / Visitantes',
      badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      accentGradient: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 hover:border-blue-400',
      statusText: 'Acesso Livre',
      stats: 'Cultos • Endereço • Visitantes'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#070b12]/80 backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#070b12] rounded-[14px] flex items-center justify-center text-cyan-400">
                <Church size={22} className="stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg sm:text-xl tracking-tight text-white">
                  Ecossistema Manancial
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Dev Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hub unificado de desenvolvimento e navegação entre ambientes
              </p>
            </div>
          </div>

          {/* Quick Info & Direct Action */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Papel Ativo:</span>
              <strong className="text-white capitalize">{activeRole}</strong>
            </div>

            <button
              onClick={() => navigate('/igreja')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
            >
              <span>Abrir Gestão</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Banner de Boas-Vindas */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1626] via-[#091f2c] to-[#082a2f] border border-cyan-500/20 p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles size={13} />
              Ambiente Integrado • 6 Módulos em 1 Só Aplicação
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Selecione o ambiente que deseja testar ou gerenciar
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Todos os módulos compartilham o mesmo banco de dados, membros, eventos e movimentações. 
              Use o botão flutuante <span className="text-cyan-300 font-semibold">AssistiveTouch</span> no canto da tela a qualquer momento para alternar entre ambientes e papéis.
            </p>
          </div>

          <div className="absolute right-4 bottom-[-20px] opacity-10 pointer-events-none hidden lg:block">
            <Church size={240} className="text-cyan-200" />
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Módulos do Ecossistema
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {apps.length} seções disponíveis
          </span>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.title}
                onClick={() => navigate(app.path)}
                className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-5 sm:p-6 cursor-pointer transition-all duration-200 border bg-[#0b121e]/90 backdrop-blur-xl ${app.accentGradient} hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 ${
                  app.isMain ? 'ring-1 ring-cyan-400/40' : ''
                }`}
              >
                <div>
                  {/* Top card metadata */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-200">
                      <Icon size={24} />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${app.badgeColor}`}>
                      {app.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h4 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                    {app.title}
                    <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-cyan-400" />
                  </h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {app.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-3">
                    {app.description}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate pr-2 font-medium">
                    {app.stats}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-cyan-400 shrink-0">
                    Acessar
                    <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informações da Arquitetura */}
        <div className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-semibold text-slate-200">Base de Dados Unificada (Single Source of Truth)</p>
              <p className="text-[11px] text-slate-500">Membros, cronograma e finanças conversam entre todos os módulos em tempo real.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Dica:</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 text-slate-300 font-mono text-[11px]">
              Clique na bolinha flutuante para trocar de ambiente sem voltar aqui
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-4 px-6 text-center text-xs text-slate-600">
        Igreja Manancial © 2026 • Ecossistema Digital Integrado
      </footer>
    </div>
  );
};
