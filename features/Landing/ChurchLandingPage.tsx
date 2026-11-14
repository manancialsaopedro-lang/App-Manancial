import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  CloudOff,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  Tent,
  Users,
  Wifi,
  X,
  MapPin,
  Calendar,
  Clock,
  Send,
  Church,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { ManancialWaterCanvas } from '../../components/splash/ManancialWaterCanvas';
import { ManancialEmblem } from '../../components/splash/ManancialLogo';

type UserContextRole = 'igreja' | 'acampamento';

interface GincanaTeam {
  id: string;
  name: string;
  colorHex: string;
  points: number;
  membersCount: number;
}

const INITIAL_TEAMS: GincanaTeam[] = [
  { id: 't-juda', name: 'Tribo de Judá', colorHex: '#38BDF8', points: 1420, membersCount: 38 },
  { id: 't-levi', name: 'Tribo de Levi', colorHex: '#2DD4BF', points: 1390, membersCount: 36 },
  { id: 't-benjamim', name: 'Tribo de Benjamim', colorHex: '#F59E0B', points: 1280, membersCount: 35 },
  { id: 't-efraim', name: 'Tribo de Efraim', colorHex: '#EC4899', points: 1210, membersCount: 34 },
];

interface LedgerRow {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  status: 'Conciliado' | 'Pendente';
}

const LEDGER_ROWS: LedgerRow[] = [
  {
    id: 'L-104',
    date: '12/11/2026',
    description: 'Inscrições Acampamento Manancial 2027 — 1º Lote',
    category: 'Acampamento',
    amount: 'R$ 8.450,00',
    status: 'Conciliado',
  },
  {
    id: 'L-105',
    date: '11/11/2026',
    description: 'Ofertas & Dízimos Culto de Domingo',
    category: 'Eclesiástico',
    amount: 'R$ 4.280,00',
    status: 'Conciliado',
  },
  {
    id: 'L-106',
    date: '10/11/2026',
    description: 'Locação Sítio das Águas (Retiro)',
    category: 'Estrutura',
    amount: '- R$ 3.800,00',
    status: 'Conciliado',
  },
  {
    id: 'L-107',
    date: '09/11/2026',
    description: 'Material & Troféus da Gincana 25:14',
    category: 'Gincana',
    amount: '- R$ 690,00',
    status: 'Pendente',
  },
];

const CHURCH_IMAGE = '/assets/images/manancial_church_community_1794615448217.jpg';
const CAMP_IMAGE = '/assets/images/manancial_camp_gathering_1794615447967.jpg';

export const ChurchLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useAppStore();

  const [activeContext, setActiveContext] = useState<UserContextRole>('igreja');
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<GincanaTeam[]>(INITIAL_TEAMS);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [churchImgError, setChurchImgError] = useState(false);
  const [campImgError, setCampImgError] = useState(false);

  // Form de contato / novo visitante
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadContext, setLeadContext] = useState<UserContextRole>('igreja');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const heroTiltRef = useRef<HTMLDivElement | null>(null);
  const heroSheenRef = useRef<HTMLDivElement | null>(null);

  const handleHeroTilt = (rx: number, ry: number, normX: number, normY: number) => {
    if (heroTiltRef.current) {
      const tx = (ry * 10).toFixed(2);
      const ty = (-rx * 8).toFixed(2);
      heroTiltRef.current.style.transform = `perspective(950px) translate3d(${tx}px, ${ty}px, 0) rotateX(${(rx * 9).toFixed(2)}deg) rotateY(${(ry * 9).toFixed(2)}deg)`;
    }
    if (heroSheenRef.current) {
      const px = Math.round(normX * 100);
      const py = Math.round(normY * 100);
      heroSheenRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(165, 243, 252, 0.32), transparent 58%)`;
    }
  };

  const filteredLedger = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return LEDGER_ROWS;
    return LEDGER_ROWS.filter(
      (row) =>
        row.description.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleAwardPoints = (teamId: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, points: Math.max(0, t.points + delta) } : t)),
    );
    if (isOffline) {
      setPendingSyncCount((c) => c + 1);
    }
  };

  const handleToggleOffline = () => {
    if (isOffline) {
      setIsOffline(false);
      setPendingSyncCount(0);
    } else {
      setIsOffline(true);
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;
    setLeadSubmitted(true);
  };

  return (
    <div
      data-testid="landing-page"
      className={`min-h-[100dvh] transition-colors duration-700 ${
        isDarkMode ? 'bg-[#070B0E] text-[#F1F6F8]' : 'bg-[#EFF8FC] text-[#082F38]'
      }`}
    >
      {/* Top Bar Minimalista */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
          isDarkMode
            ? 'border-white/10 bg-[#070B0E]/85 text-white'
            : 'border-[#082F38]/10 bg-white/85 text-[#082F38] shadow-2xs'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8">
          {/* Logo e Nome */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 text-left font-display font-bold tracking-tight text-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#082F38] to-[#06B6D4] p-0.5 shadow-sm flex items-center justify-center">
              <span className="text-white text-sm font-black">M</span>
            </div>
            <span>Manancial</span>
          </button>

          {/* Links de navegação */}
          <nav
            aria-label="Navegação principal"
            className={`hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? 'text-[#A6C2CC]' : 'text-[#3B5B66]'
            }`}
          >
            <a href="#contextos" className="hover:text-cyan-400 transition-colors">
              Contextos
            </a>
            <a href="#cultos" className="hover:text-cyan-400 transition-colors">
              Cultos &amp; Igreja
            </a>
            <a href="#acampamento" className="hover:text-cyan-400 transition-colors">
              Acampamento 2027
            </a>
            <a href="#recursos" className="hover:text-cyan-400 transition-colors">
              Tecnologia
            </a>
            <a href="#contato" className="hover:text-cyan-400 transition-colors">
              Contato
            </a>
          </nav>

          {/* Ações primárias */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Toggle Tema */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isDarkMode
                  ? 'border-white/10 bg-white/5 text-amber-300 hover:bg-white/10'
                  : 'border-[#082F38]/12 bg-white/80 text-[#082F38] hover:bg-white shadow-2xs'
              }`}
              title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`min-h-[38px] cursor-pointer whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-md ${
                isDarkMode
                  ? 'bg-[#32B7D9] text-[#051217] hover:bg-[#4FD1E8] shadow-cyan-500/20'
                  : 'bg-[#0891B2] text-white hover:bg-[#0E7490] shadow-cyan-900/15'
              }`}
            >
              Acessar Conta
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border md:hidden ${
                isDarkMode ? 'border-white/15 text-white' : 'border-[#082F38]/15 text-[#082F38]'
              }`}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <nav
            aria-label="Menu móvel"
            className={`border-t px-6 py-4 md:hidden flex flex-col gap-3 text-sm font-semibold ${
              isDarkMode ? 'border-white/10 bg-[#080E12] text-slate-200' : 'border-slate-200 bg-white text-slate-800'
            }`}
          >
            <a href="#contextos" onClick={() => setMobileMenuOpen(false)}>
              Contextos do App
            </a>
            <a href="#cultos" onClick={() => setMobileMenuOpen(false)}>
              Cultos &amp; Endereço
            </a>
            <a href="#acampamento" onClick={() => setMobileMenuOpen(false)}>
              Acampamento 2027
            </a>
            <a href="#recursos" onClick={() => setMobileMenuOpen(false)}>
              Recursos de Gestão
            </a>
            <a href="#contato" onClick={() => setMobileMenuOpen(false)}>
              Fale Conosco / Visitante
            </a>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/visitante');
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold border border-cyan-500/30 text-cyan-500 text-center"
              >
                Sou Visitante
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#32B7D9] text-[#051217] text-center"
              >
                Entrar
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section com Águas Fluidas e Emblema 3D */}
      <section id="topo" className="relative overflow-hidden border-b border-white/10">
        <ManancialWaterCanvas
          intensity="hero"
          isDarkMode={isDarkMode}
          onTiltChange={handleHeroTilt}
        />

        <div className="relative z-10 mx-auto max-w-[1200px] px-6 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Texto Hero */}
            <div className="flex flex-col justify-center lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase text-cyan-400">
                <Sparkles size={14} />
                <span>Igreja Evangélica • Ministério de São Pedro</span>
              </div>

              <h1 className="font-display text-[clamp(2.25rem,4vw,3.75rem)] font-bold leading-[1.08] tracking-tight [text-wrap:balance]">
                Gestão fluida da secretaria ao acampamento.
              </h1>

              <p
                className={`mt-5 max-w-[58ch] text-base leading-relaxed sm:text-[17px] ${
                  isDarkMode ? 'text-[#B8CED6]' : 'text-[#3B5B66]'
                }`}
              >
                O Manancial reúne controle de membros, presença por WhatsApp e relatórios no
                escritório, com operação offline, tesouraria, cantina e placar ao vivo da gincana no
                acampamento.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`inline-flex min-h-[46px] items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                    isDarkMode
                      ? 'bg-[#32B7D9] text-[#051217] hover:bg-[#4FD1E8] shadow-cyan-500/30'
                      : 'bg-[#0891B2] text-white hover:bg-[#0E7490] shadow-cyan-900/20'
                  }`}
                >
                  <span>Entrar no Sistema</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className={`inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold backdrop-blur-md transition-all active:scale-95 ${
                    isDarkMode
                      ? 'border-white/15 bg-white/[0.04] text-[#E4F0F4] hover:bg-white/[0.09]'
                      : 'border-[#082F38]/15 bg-white/80 text-[#082F38] hover:bg-white shadow-2xs'
                  }`}
                >
                  <span>Rever Abertura Fluida</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/visitante')}
                  className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  <span>Recepção de Visitantes →</span>
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                <span>Cultos em São Pedro - SP</span>
                <span aria-hidden="true">·</span>
                <span>Acampamento 25:14</span>
                <span aria-hidden="true">·</span>
                <span>Modo Claro &amp; Escuro</span>
              </div>
            </div>

            {/* Showcase Emblema 3D */}
            <div className="flex items-center justify-center lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`flex w-full flex-col items-center justify-between rounded-3xl border p-8 text-center backdrop-blur-xl ${
                  isDarkMode
                    ? 'border-white/12 bg-[#0A1116]/80'
                    : 'border-white bg-white/85 shadow-xl'
                }`}
              >
                <div className="mb-6">
                  <ManancialEmblem
                    size="lg"
                    tiltRef={heroTiltRef}
                    sheenRef={heroSheenRef}
                    isDarkMode={isDarkMode}
                    layoutId="hero-static-emblem"
                  />
                </div>

                <div
                  className={`w-full space-y-4 border-t pt-6 text-left text-xs ${
                    isDarkMode ? 'border-white/10' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-slate-400">Modo Igreja</span>
                    <span className="font-mono font-bold text-cyan-400">Membros • Presença • Louvor</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-slate-400">Modo Retiro</span>
                    <span className="font-mono font-bold text-emerald-400">Gincana • Caixa • Offline</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-slate-400">Interatividade</span>
                    <span className="text-slate-300">Movimente o cursor sobre o topo</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2: Contextos Reais (Igreja vs Acampamento) */}
      <section id="contextos" className="mx-auto max-w-[1200px] px-6 py-20 sm:py-24">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              Experiência adaptada ao contexto
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl [text-wrap:balance]">
              Um sistema, duas cadências de uso.
            </h2>
            <p
              className={`mt-3 text-[15px] leading-relaxed ${
                isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
              }`}
            >
              Alterne abaixo para testar a tabela financeira da secretaria da igreja ou o controle de
              gincana com sincronização offline do acampamento.
            </p>
          </div>

          {/* Seletor de Contextos */}
          <div
            role="tablist"
            aria-label="Alternar contexto de demonstração"
            className={`inline-flex shrink-0 items-center gap-1 rounded-2xl border p-1 ${
              isDarkMode ? 'border-white/12 bg-[#0C141A]' : 'border-slate-200 bg-white shadow-xs'
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeContext === 'igreja'}
              onClick={() => setActiveContext('igreja')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeContext === 'igreja'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Church size={15} />
              <span>Igreja Local</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeContext === 'acampamento'}
              onClick={() => setActiveContext('acampamento')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeContext === 'acampamento'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tent size={15} />
              <span>Acampamento &amp; Gincana</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Dinâmico por Contexto */}
        <div className="mt-10">
          {activeContext === 'igreja' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Secretaria &amp; Membresia
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Comunhão conectada culto a culto.
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Acompanhe entradas, relatórios de cultos e parabenize aniversariantes em 1 clique
                  pelo WhatsApp oficial.
                </p>

                <div className="pt-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Filtrar lançamentos da secretaria..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredLedger.map((row) => (
                    <div
                      key={row.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{row.description}</div>
                        <div className="text-[10px] text-slate-400">
                          {row.date} • {row.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-cyan-400">{row.amount}</div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div
                  className={`rounded-3xl border overflow-hidden shadow-2xl relative ${
                    isDarkMode ? 'border-white/10 bg-[#0C151B]' : 'border-slate-200 bg-white'
                  }`}
                >
                  {!churchImgError ? (
                    <img
                      src={CHURCH_IMAGE}
                      alt="Comunidade Igreja Manancial"
                      onError={() => setChurchImgError(true)}
                      className="w-full h-80 sm:h-96 object-cover"
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-cyan-950/30 text-cyan-400">
                      <Church size={60} />
                    </div>
                  )}
                  <div className="p-5 flex items-center justify-between border-t border-white/10">
                    <div>
                      <div className="font-bold text-sm">Comunidade e Ministério</div>
                      <div className="text-xs text-slate-400">São Pedro - SP</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                    >
                      Acessar Gestão
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Gincana 25:14 • Placar ao Vivo
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleOffline}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      isOffline
                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                        : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                    }`}
                  >
                    {isOffline ? <CloudOff size={11} /> : <Wifi size={11} />}
                    <span>{isOffline ? `Modo Campo (${pendingSyncCount} pendentes)` : 'Online'}</span>
                  </button>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Pontuação instantânea para jurados e tribos.
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Coordene provas e atribua pontos com facilidade em celulares com sincronização
                  automática assim que a conexão retornar.
                </p>

                <div className="space-y-2 pt-2">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: team.colorHex }}
                        />
                        <div className="truncate">
                          <div className="font-bold text-xs truncate">{team.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {team.membersCount} participantes
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-sm text-cyan-400">
                          {team.points} pts
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAwardPoints(team.id, 50)}
                            className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px]"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAwardPoints(team.id, 100)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px]"
                          >
                            +100
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div
                  className={`rounded-3xl border overflow-hidden shadow-2xl relative ${
                    isDarkMode ? 'border-white/10 bg-[#0C151B]' : 'border-slate-200 bg-white'
                  }`}
                >
                  {!campImgError ? (
                    <img
                      src={CAMP_IMAGE}
                      alt="Gincana Acampamento Manancial"
                      onError={() => setCampImgError(true)}
                      className="w-full h-80 sm:h-96 object-cover"
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-amber-950/30 text-amber-400">
                      <Tent size={60} />
                    </div>
                  )}
                  <div className="p-5 flex items-center justify-between border-t border-white/10">
                    <div>
                      <div className="font-bold text-sm">Gincana das Tribos</div>
                      <div className="text-xs text-slate-400">Salmos 25:14 • Acampamento Manancial</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/acampamento/informacoes')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      Ver Detalhes do Retiro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seção 3: Cultos & Informações da Igreja Local (São Pedro/SP) */}
      <section
        id="cultos"
        className={`border-y py-20 sm:py-24 ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white/60'
        }`}
      >
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Nossa Casa
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
              Cultos e Programação Semanal
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Venha estar conosco! Nossa igreja fica localizada no centro de São Pedro - SP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-6 rounded-3xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mb-4">
                  <Calendar size={22} />
                </div>
                <h3 className="text-lg font-bold">Culto de Domingo (Manhã)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Escola Bíblica Dominical e Comunhão Ministerial
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-mono font-bold text-cyan-400">
                  <Clock size={16} /> 10:00h
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
                Templo Principal • Aberto a todos
              </div>
            </div>

            <div
              className={`p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden ${
                isDarkMode ? 'bg-white/5 border-cyan-500/40 ring-1 ring-cyan-500/30' : 'bg-white border-cyan-300 ring-2 ring-cyan-200 shadow-md'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center mb-4 shadow-md">
                  <Church size={22} />
                </div>
                <h3 className="text-lg font-bold">Culto de Celebração (Noite)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Louvor congregacional, adoração e ministração da Palavra
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-mono font-bold text-cyan-400">
                  <Clock size={16} /> 19:00h
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
                Com transmissão ao vivo &amp; Espaço Kids
              </div>
            </div>

            <div
              className={`p-6 rounded-3xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-400/30 text-teal-400 flex items-center justify-center mb-4">
                  <Clock size={22} />
                </div>
                <h3 className="text-lg font-bold">Quinta-feira da Vitória</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Culto de Oração, clamor pelas famílias e ensino bíblico
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-mono font-bold text-teal-400">
                  <Clock size={16} /> 19:30h
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
                Momento de intercessão e busca
              </div>
            </div>
          </div>

          {/* Endereço & Card de Localização */}
          <div
            className={`mt-10 p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <div className="font-bold text-base">Endereço da Igreja</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Av. Ângelo Nogueira, 45 • Centro • São Pedro - SP
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/visitante')}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-transform active:scale-95 shadow-md"
              >
                Cadastrar como Visitante
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 4: Acampamento Manancial 2027 em Destaque */}
      <section id="acampamento" className="mx-auto max-w-[1200px] px-6 py-20 sm:py-24">
        <div
          className={`p-8 sm:p-12 rounded-[2.5rem] border relative overflow-hidden shadow-2xl ${
            isDarkMode
              ? 'border-amber-500/30 bg-gradient-to-br from-[#121c2c] via-[#0f1726] to-[#0a101b]'
              : 'border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50/50'
          }`}
        >
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-4">
              <Tent size={14} /> Grande Evento 2027
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Acampamento Manancial 2027
            </h2>
            <p className="mt-2 text-sm italic text-amber-200/90 font-serif">
              "O segredo do Senhor é para os que o temem; e ele lhes fará saber a sua aliança." (Salmos 25:14)
            </p>

            <p
              className={`mt-4 text-sm leading-relaxed ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              De <strong>05 a 09 de Fevereiro de 2027</strong> em São Pedro - SP. 5 dias de ministração,
              adoração, gincana das tribos, comunhão e experiências marcantes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/acampamento/informacoes')}
                className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
              >
                Informações Oficiais do Retiro
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className={`px-6 py-3.5 rounded-2xl border text-xs sm:text-sm font-bold transition-transform active:scale-95 ${
                  isDarkMode
                    ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                Acessar Portal do Acampante
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 5: Formulário de Contato / Inscrição de Interesse */}
      <section
        id="contato"
        className={`border-t py-20 ${
          isDarkMode ? 'border-white/10 bg-[#06090e]' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Fale Conosco
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
            Deseja saber mais sobre o Manancial?
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Preencha seus dados para receber novidades da igreja, oração ou informações sobre os retiros.
          </p>

          {leadSubmitted ? (
            <div className="mt-8 p-6 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-sm">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
              <div className="font-bold">Mensagem enviada com sucesso!</div>
              <p className="text-xs text-slate-300 mt-1">
                Nossa equipe pastoral entrará em contato em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-cyan-400 ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400">WhatsApp com DDD</label>
                <input
                  type="tel"
                  required
                  placeholder="(19) 99999-9999"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-cyan-400 ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1 text-slate-400">Interesse Principal</label>
                <select
                  value={leadContext}
                  onChange={(e) => setLeadContext(e.target.value as UserContextRole)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-cyan-400 ${
                    isDarkMode ? 'bg-[#0b121e] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="igreja">Visitar a Igreja / Pedido de Oração</option>
                  <option value="acampamento">Participar do Acampamento Manancial 2027</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  Enviar Mensagem
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer
        className={`border-t py-8 text-center text-xs ${
          isDarkMode ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400 bg-slate-50'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <span>Igreja Evangélica Manancial © 2026</span>
            <span>•</span>
            <span className="text-cyan-400">São Pedro - SP</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button type="button" onClick={() => navigate('/login')} className="hover:text-white">
              Login
            </button>
            <button type="button" onClick={() => navigate('/visitante')} className="hover:text-white">
              Visitantes
            </button>
            <button type="button" onClick={() => navigate('/')} className="hover:text-white">
              Pré-Page Abertura
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
