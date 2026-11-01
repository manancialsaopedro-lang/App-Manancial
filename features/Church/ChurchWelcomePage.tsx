import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  MessageSquare,
  BarChart3,
  Church,
  Calendar,
  Sparkles,
  AlertTriangle,
  Cake,
  ArrowRight,
  Plus,
  Send,
  Sun,
  Moon,
  Tent,
  Wallet,
  Clock,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  MapPin,
  DollarSign,
  Crown
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useChurchStore } from '../../store/churchStore';

export const ChurchWelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, user } = useAppStore();
  const { 
    members, 
    sessions, 
    attendances, 
    getBirthdaysThisWeek, 
    getAbsentMembersAlert, 
    generateWhatsAppUrl,
    addMember
  } = useChurchStore();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Membro' | 'Visitante' | 'Líder'>('Membro');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const birthdays = getBirthdaysThisWeek();
  const absentAlerts = getAbsentMembersAlert();
  const activeMembersCount = members.filter((m) => m.status === 'Ativo').length;
  const visitorsCount = members.filter((m) => m.role === 'Visitante').length;

  // Último culto e contagem
  const latestSession = sessions[0];
  const latestAttendanceCount = latestSession 
    ? attendances.filter((a) => a.sessionId === latestSession.id).length 
    : 0;

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleQuickAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) return;

    addMember({
      fullName: newMemberName.trim(),
      phoneWhatsApp: newMemberPhone.trim(),
      role: newMemberRole,
      ministry: 'Nenhum',
      status: 'Ativo'
    });

    setNewMemberName('');
    setNewMemberPhone('');
    setIsQuickAddOpen(false);
    showNotification(`Membro "${newMemberName}" cadastrado com sucesso!`);
  };

  const themeColors = {
    bg: isDarkMode ? 'bg-[#080d1a]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-[#11192e] border-slate-800' : 'bg-white border-slate-200/80',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    accentGrad: 'from-cyan-600 via-teal-600 to-emerald-600',
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col pb-28 transition-colors duration-500 ${themeColors.bg}`}>
      
      {/* TOAST FEEDBACK */}
      {successToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-bold text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* HEADER INSTITUCIONAL */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-40 transition-colors ${
        isDarkMode ? 'bg-[#0b1224]/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Church size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-500">Igreja Evangélica</span>
                <span className="text-[10px] font-bold text-slate-400">• Ministério São Pedro</span>
              </div>
              <h1 className={`text-base sm:text-lg font-black tracking-tight ${themeColors.textMain}`}>
                Portal de Gestão Manancial
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode 
                  ? 'bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Alternar Modo Escuro/Claro"
              aria-label="Alternar tema"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto w-full px-4 pt-6 space-y-6">
        
        {/* BANNER DE BOAS-VINDAS & PULSO */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#11192e] via-[#0d1629] to-[#0a1020] border-slate-800' 
            : 'bg-gradient-to-br from-white via-cyan-50/50 to-teal-50/40 border-cyan-100'
        }`}>
          {/* Luz de fundo */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs mb-3">
                <Sparkles size={13} />
                Gestão Pastoral & Eclesiástica Integrada
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${themeColors.textMain}`}>
                Graça e Paz{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
              </h2>
              <p className={`mt-1.5 text-sm sm:text-base max-w-xl ${themeColors.textSec}`}>
                Acompanhe em tempo real a presença dos membros, cuidado do rebanho, mensagens automáticas de WhatsApp e relatórios dos cultos.
              </p>
            </div>

            {/* BOTÕES RÁPIDOS NO TOPO */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all hover:scale-105"
              >
                <Plus size={16} /> Cadastrar Membro
              </button>
              
              <button
                onClick={() => navigate('/gestao/presenca')}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border font-bold text-xs transition-all hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <CheckCircle2 size={16} className="text-teal-500" /> Presença no Culto
              </button>
            </div>
          </div>

          {/* INDICADORES EM TEMPO REAL */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-800">
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/80 shadow-sm'}`}>
              <div className="flex items-center gap-2 text-cyan-500 mb-1">
                <Users size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Membros Ativos</span>
              </div>
              <div className={`text-2xl font-black ${themeColors.textMain}`}>{activeMembersCount}</div>
              <div className={`text-[11px] ${themeColors.textSec}`}>Cadastrados na igreja</div>
            </div>

            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/80 shadow-sm'}`}>
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <UserCheck size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Último Culto</span>
              </div>
              <div className={`text-2xl font-black ${themeColors.textMain}`}>{latestAttendanceCount}</div>
              <div className={`text-[11px] ${themeColors.textSec}`}>Presentes confirmados</div>
            </div>

            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/80 shadow-sm'}`}>
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <Cake size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Aniversariantes</span>
              </div>
              <div className={`text-2xl font-black ${themeColors.textMain}`}>{birthdays.length}</div>
              <div className={`text-[11px] ${themeColors.textSec}`}>Nesta semana</div>
            </div>

            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/40' : 'bg-white/80 shadow-sm'}`}>
              <div className="flex items-center gap-2 text-rose-500 mb-1">
                <AlertTriangle size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Radar Cuidado</span>
              </div>
              <div className={`text-2xl font-black ${themeColors.textMain}`}>{absentAlerts.length}</div>
              <div className={`text-[11px] ${themeColors.textSec}`}>Ausentes nos cultos</div>
            </div>
          </div>
        </div>

        {/* RADAR PASTORAL: ANIVERSARIANTES & AUSÊNCIAS (AÇÕES IMEDIATAS WHATSAPP) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card Aniversariantes */}
          <div className={`p-5 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Cake size={18} />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${themeColors.textMain}`}>Aniversariantes da Semana</h3>
                  <p className={`text-xs ${themeColors.textSec}`}>Parabenize em 1 toque pelo WhatsApp</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {birthdays.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {birthdays.length === 0 ? (
                <div className={`p-4 text-center rounded-2xl text-xs ${isDarkMode ? 'bg-slate-800/40' : 'bg-slate-50'} ${themeColors.textSec}`}>
                  Nenhum aniversariante nesta semana.
                </div>
              ) : (
                birthdays.slice(0, 3).map((member) => {
                  const [, m, d] = (member.birthDate || '').split('-');
                  const waUrl = generateWhatsAppUrl(member.phoneWhatsApp, 'aniversario', member.fullName);

                  return (
                    <div 
                      key={member.id} 
                      className={`p-3 rounded-2xl flex items-center justify-between gap-3 border ${
                        isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/80 border-slate-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className={`font-bold text-xs truncate ${themeColors.textMain}`}>{member.fullName}</div>
                        <div className="text-[11px] text-amber-500 font-semibold flex items-center gap-1">
                          <Calendar size={11} /> Aniversário: {d}/{m}
                        </div>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-sm transition-transform hover:scale-105"
                      >
                        <Send size={12} /> WhatsApp
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card Alerta de Ausência (Radar do Rebanho) */}
          <div className={`p-5 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${themeColors.textMain}`}>Radar de Cuidado Pastoral</h3>
                  <p className={`text-xs ${themeColors.textSec}`}>Membros ausentes nos últimos cultos</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {absentAlerts.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {absentAlerts.length === 0 ? (
                <div className={`p-4 text-center rounded-2xl text-xs ${isDarkMode ? 'bg-slate-800/40' : 'bg-slate-50'} ${themeColors.textSec}`}>
                  Nenhum membro com ausência prolongada registrada.
                </div>
              ) : (
                absentAlerts.slice(0, 3).map((member) => {
                  const waUrl = generateWhatsAppUrl(member.phoneWhatsApp, 'falta', member.fullName);

                  return (
                    <div 
                      key={member.id} 
                      className={`p-3 rounded-2xl flex items-center justify-between gap-3 border ${
                        isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/80 border-slate-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className={`font-bold text-xs truncate ${themeColors.textMain}`}>{member.fullName}</div>
                        <div className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                          <Clock size={11} /> {member.consecutiveAbsences} cultos consecutivos sem presença
                        </div>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 shadow-sm transition-transform hover:scale-105"
                      >
                        <MessageSquare size={12} /> Cuidado
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* DESTAQUE HERO: ACAMPAMENTO MANANCIAL 2027 (INFORMAÇÕES & GESTÃO PASTORAL) */}
        <div className={`p-5 md:p-6 rounded-3xl border shadow-xl relative overflow-hidden backdrop-blur-md ${
          isDarkMode 
            ? 'bg-gradient-to-br from-amber-950/40 via-[#131b2e] to-[#0c1221] border-amber-500/30' 
            : 'bg-gradient-to-br from-amber-50 via-white to-orange-50/60 border-amber-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/acampamento-2027.jpg" 
                alt="Acampamento Manancial 2027" 
                className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-2xl shadow-md border border-amber-500/30 shrink-0 cursor-pointer transition-transform hover:scale-105"
                onClick={() => navigate('/acampamento/informacoes')}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles size={11} /> Grande Evento 2027
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <MapPin size={12} /> São Pedro - SP
                  </span>
                </div>
                <h3 className={`text-xl md:text-2xl font-black ${themeColors.textMain}`}>
                  Acampamento Manancial 2027
                </h3>
                <p className={`text-xs mt-0.5 max-w-md ${themeColors.textSec}`}>
                  "O segredo do Senhor é para aqueles que o temem..." (Salmos 25:14). De <strong>05 a 09 de Fevereiro de 2027</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <DollarSign size={13} /> PIX R$ 582,00 ou até 06x de R$ 97,00 no Cartão
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={() => navigate('/acampamento/informacoes')}
                className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
              >
                <Sparkles size={14} /> Informações Oficiais
              </button>
              <button
                onClick={() => navigate('/acampamento/pagamentos')}
                className={`flex-1 md:flex-none px-4 py-3 rounded-2xl border font-black text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                  isDarkMode ? 'bg-purple-900/40 border-purple-700/60 text-purple-300 hover:bg-purple-900/60' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Crown size={14} /> Visão Pastoral de Pagamentos
              </button>
            </div>
          </div>
        </div>

        {/* GRID DOS MÓDULOS PRINCIPAIS DE GESTÃO DA IGREJA */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-black ${themeColors.textMain}`}>Módulos do Portal da Igreja</h3>
              <p className={`text-xs ${themeColors.textSec}`}>Acesse as áreas do sistema gerencial</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Gestão de Membros */}
            <div 
              onClick={() => navigate('/gestao/membros')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${themeColors.card} hover:border-cyan-500/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <Users size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  {members.length} Cadastrados
                </span>
              </div>
              <h4 className={`text-base font-black mb-1 group-hover:text-cyan-500 transition-colors ${themeColors.textMain}`}>
                Cadastro de Membros
              </h4>
              <p className={`text-xs ${themeColors.textSec} leading-relaxed`}>
                Ficha individual, aniversários, batismos, ministérios e histórico de presença.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-cyan-500">
                Acessar Membresia <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Presença no WhatsApp & Check-in */}
            <div 
              onClick={() => navigate('/gestao/presenca')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${themeColors.card} hover:border-teal-500/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  Tempo Real
                </span>
              </div>
              <h4 className={`text-base font-black mb-1 group-hover:text-teal-500 transition-colors ${themeColors.textMain}`}>
                Controle de Presença
              </h4>
              <p className={`text-xs ${themeColors.textSec} leading-relaxed`}>
                Check-in de cultos em 1 clique, QR Code na portaria e confirmação via WhatsApp.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-500">
                Fazer Chamada <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Mensagens Automáticas de Incentivo */}
            <div 
              onClick={() => navigate('/gestao/mensagens')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${themeColors.card} hover:border-emerald-500/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <MessageSquare size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  WhatsApp
                </span>
              </div>
              <h4 className={`text-base font-black mb-1 group-hover:text-emerald-500 transition-colors ${themeColors.textMain}`}>
                Mensagens & WhatsApp
              </h4>
              <p className={`text-xs ${themeColors.textSec} leading-relaxed`}>
                Disparos rápidos de incentivo: aniversários, ausências, boas-vindas e cultos.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-500">
                Abrir Central <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. Relatórios de Participação */}
            <div 
              onClick={() => navigate('/gestao/relatorios')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${themeColors.card} hover:border-indigo-500/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <BarChart3 size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Gráficos
                </span>
              </div>
              <h4 className={`text-base font-black mb-1 group-hover:text-indigo-500 transition-colors ${themeColors.textMain}`}>
                Relatórios em Tempo Real
              </h4>
              <p className={`text-xs ${themeColors.textSec} leading-relaxed`}>
                Frequência culto a culto, crescimento da congregação e retenção de novos visitantes.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-500">
                Ver Métricas <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 5. Caixa & Financeiro da Igreja */}
            <div 
              onClick={() => navigate('/org/home')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${themeColors.card} hover:border-amber-500/50`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <Wallet size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Tesouraria
                </span>
              </div>
              <h4 className={`text-base font-black mb-1 group-hover:text-amber-500 transition-colors ${themeColors.textMain}`}>
                Caixa & Financeiro
              </h4>
              <p className={`text-xs ${themeColors.textSec} leading-relaxed`}>
                Central de caixa, dízimos, ofertas, cantina da igreja e fechamento diário.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-500">
                Acessar Caixa <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 6. SUBMÓDULO: ACAMPAMENTO & RETIROS (EVENTO 2027) */}
            <div 
              onClick={() => navigate('/acampamento')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${
                isDarkMode ? 'bg-[#151c33] border-cyan-900/40 hover:border-cyan-500/60' : 'bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <Tent size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                  Edição 2027
                </span>
              </div>
              <h4 className={`text-base font-black mb-1 group-hover:text-cyan-500 transition-colors ${themeColors.textMain}`}>
                Acampamento Manancial 2027
              </h4>
              <p className={`text-xs ${themeColors.textSec} leading-relaxed`}>
                São Pedro - SP (05 a 09/Fev). Gestão pastoral de pagamentos, gincana 25:14, equipes e cantina.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  Acessar Portal <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-[11px] font-extrabold text-amber-500">
                  R$ 582 (6x R$ 97)
                </span>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* MODAL: CADASTRO RÁPIDO DE MEMBRO */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl ${themeColors.card}`}>
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-cyan-500">
                <Users size={20} />
                <h3 className={`text-base font-black ${themeColors.textMain}`}>Cadastrar Novo Membro</h3>
              </div>
              <button 
                onClick={() => setIsQuickAddOpen(false)}
                className={`p-1.5 rounded-lg text-xs font-bold ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddMember} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeColors.textMain}`}>Nome Completo *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: João da Silva Santos"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeColors.textMain}`}>WhatsApp com DDD *</label>
                <input 
                  type="tel"
                  required
                  placeholder="Ex: 11988887777"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeColors.textMain}`}>Função Eclesiástica</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Membro">Membro da Igreja</option>
                  <option value="Visitante">Visitante</option>
                  <option value="Líder">Líder de Ministério</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border ${
                    isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-cyan-600/25 hover:from-cyan-500 hover:to-teal-500"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
