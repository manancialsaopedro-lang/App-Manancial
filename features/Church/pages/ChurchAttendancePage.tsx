import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ArrowLeft,
  Search,
  Users,
  Calendar,
  Clock,
  Plus,
  Share2,
  QrCode,
  UserCheck,
  UserX,
  Sparkles,
  Send,
  Church
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { useChurchStore } from '../../../store/churchStore';

export const ChurchAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppStore();
  const { 
    members, 
    services, 
    sessions, 
    attendances, 
    activeSessionId, 
    setActiveSessionId,
    toggleAttendance,
    createNewSession
  } = useChurchStore();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'todos' | 'presentes' | 'ausentes'>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeService = services.find((srv) => srv.id === activeSession?.serviceId) || services[0];

  const sessionAttendances = attendances.filter((a) => a.sessionId === activeSession?.id);
  const attendedMemberIds = new Set(sessionAttendances.map((a) => a.memberId));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle = (memberId: string, memberName: string) => {
    if (!activeSession) return;
    const isPresent = attendedMemberIds.has(memberId);
    toggleAttendance(activeSession.id, memberId, 'Portaria');
    showToast(isPresent ? `Presença removida: ${memberName}` : `Presença confirmada: ${memberName}`);
  };

  const handleShareCheckIn = () => {
    const text = `Graça e Paz! 🙏\nConfirmando a presença nos cultos da Igreja Evangélica Manancial de hoje (${activeService?.title || 'Culto'}).\nDeus abençoe sua vida e família!`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.phoneWhatsApp.includes(search);

    const isPresent = attendedMemberIds.has(m.id);
    if (filterMode === 'presentes') return matchesSearch && isPresent;
    if (filterMode === 'ausentes') return matchesSearch && !isPresent;
    return matchesSearch;
  });

  const attendanceRate = members.length > 0 
    ? Math.round((sessionAttendances.length / members.length) * 100) 
    : 0;

  const themeColors = {
    bg: isDarkMode ? 'bg-[#080d1a]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-[#11192e] border-slate-800' : 'bg-white border-slate-200',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col pb-28 ${themeColors.bg} transition-colors duration-500`}>
      
      {/* TOAST */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        isDarkMode ? 'bg-[#0b1224]/85 border-slate-800' : 'bg-white/85 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
              isDarkMode ? 'text-cyan-400 hover:bg-slate-800' : 'text-cyan-700 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft size={16} /> Início
          </button>

          <div className="text-center">
            <h1 className={`text-sm sm:text-base font-black ${themeColors.textMain}`}>Controle de Presença</h1>
            <p className={`text-[10px] sm:text-xs ${themeColors.textSec}`}>Check-in do Culto em Tempo Real</p>
          </div>

          <button
            onClick={handleShareCheckIn}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            title="Compartilhar lista/check-in no WhatsApp"
          >
            <Share2 size={14} /> WhatsApp
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto w-full px-4 pt-5 space-y-5">
        
        {/* CARD DO CULTO ATIVO & CONTADOR EM TEMPO REAL */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#11192e] to-[#0a1224] border-slate-800' 
            : 'bg-gradient-to-br from-white to-teal-50/60 border-teal-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  {activeService?.dayOfWeek} • {activeService?.defaultTime}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  Data: {activeSession?.sessionDate}
                </span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-black ${themeColors.textMain}`}>
                {activeService?.title || 'Culto da Família'}
              </h2>
              {activeSession?.theme && (
                <p className={`text-xs sm:text-sm mt-0.5 text-cyan-600 dark:text-cyan-400 font-semibold`}>
                  Tema: "{activeSession.theme}" • Preletor: {activeSession.preacher}
                </p>
              )}
            </div>

            {/* PLACAR DE PRESENÇAS AO VIVO */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`p-4 rounded-2xl text-center ${isDarkMode ? 'bg-slate-800/80' : 'bg-white shadow-sm'}`}>
                <div className="text-[10px] font-bold text-teal-500 uppercase tracking-wider">Presentes Agora</div>
                <div className={`text-3xl font-black text-teal-500`}>{sessionAttendances.length}</div>
                <div className={`text-[10px] ${themeColors.textSec}`}>{attendanceRate}% da membresia</div>
              </div>

              <div className={`p-4 rounded-2xl text-center ${isDarkMode ? 'bg-slate-800/80' : 'bg-white shadow-sm'}`}>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Membros</div>
                <div className={`text-3xl font-black ${themeColors.textMain}`}>{members.length}</div>
                <div className={`text-[10px] ${themeColors.textSec}`}>Cadastrados</div>
              </div>
            </div>
          </div>

          {/* SELETOR DE CULTO / SESSÃO */}
          <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${themeColors.textSec}`}>Sessão:</span>
              <select
                value={activeSessionId}
                onChange={(e) => setActiveSessionId(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {sessions.map((ses) => (
                  <option key={ses.id} value={ses.id}>
                    {ses.sessionDate} - {ses.theme || 'Culto'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const newId = createNewSession('s1', 'Culto de Celebração', 'Pastor Titular');
                showToast('Novo culto criado para hoje!');
              }}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Abrir Novo Culto de Hoje
            </button>
          </div>
        </div>

        {/* BUSCA E ABAS DE FILTRO */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeColors.textSec}`} />
            <input
              type="text"
              placeholder="Buscar pelo nome do membro para marcar presença..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDarkMode ? 'bg-[#11192e] border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('todos')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'todos' 
                  ? 'bg-teal-600 text-white' 
                  : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Todos ({members.length})
            </button>

            <button
              onClick={() => setFilterMode('presentes')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterMode === 'presentes' 
                  ? 'bg-emerald-600 text-white' 
                  : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <UserCheck size={14} /> Presentes ({sessionAttendances.length})
            </button>

            <button
              onClick={() => setFilterMode('ausentes')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                filterMode === 'ausentes' 
                  ? 'bg-rose-600 text-white' 
                  : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <UserX size={14} /> Ausentes ({members.length - sessionAttendances.length})
            </button>
          </div>
        </div>

        {/* LISTAGEM DE CHAMADA RÁPIDA (1 TOQUE) */}
        <div className="space-y-2">
          {filteredMembers.map((member) => {
            const isPresent = attendedMemberIds.has(member.id);

            return (
              <div
                key={member.id}
                onClick={() => handleToggle(member.id, member.fullName)}
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 select-none ${
                  isPresent
                    ? isDarkMode 
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:bg-emerald-950/30' 
                      : 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-50'
                    : isDarkMode 
                      ? 'bg-[#11192e] border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                    isPresent ? 'text-emerald-500 scale-110' : 'text-slate-400'
                  }`}>
                    {isPresent ? <CheckCircle2 size={24} className="fill-emerald-500 text-white" /> : <Circle size={22} />}
                  </div>

                  <div className="min-w-0">
                    <div className={`text-sm font-bold truncate ${
                      isPresent ? 'text-emerald-600 dark:text-emerald-400' : themeColors.textMain
                    }`}>
                      {member.fullName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{member.role}</span>
                      {member.ministry && member.ministry !== 'Nenhum' && <span>• {member.ministry}</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                    isPresent 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isPresent ? 'PRESENTE' : 'Check-in'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </main>

    </div>
  );
};
