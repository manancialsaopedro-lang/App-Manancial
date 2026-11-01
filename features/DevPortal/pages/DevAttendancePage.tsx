import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Search,
  Users,
  Calendar,
  Clock,
  Plus,
  Share2,
  Sparkles,
  MessageCircle,
  Church,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import { useChurchStore } from '../../../store/churchStore';

export const DevAttendancePage: React.FC = () => {
  const {
    members,
    services,
    sessions,
    attendances,
    activeSessionId,
    setActiveSessionId,
    toggleAttendance,
    createNewSession,
    generateWhatsAppUrl
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
    const text = `Graça e Paz! 🙏\nConfirmando a presença no culto de hoje na Igreja Manancial (${activeService?.title || 'Culto'}).\nDeus abençoe sua vida e família!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch = m.fullName.toLowerCase().includes(search.toLowerCase());
    const isPresent = attendedMemberIds.has(m.id);

    if (filterMode === 'presentes') return matchSearch && isPresent;
    if (filterMode === 'ausentes') return matchSearch && !isPresent;
    return matchSearch;
  });

  const attendanceRate = members.length > 0
    ? Math.round((sessionAttendances.length / members.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Card Executivo do Culto Ativo (Padrão Basiléia / Manancial Gestão) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900">
              Culto Ativo
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {activeService?.dayOfWeek} • {activeService?.defaultTime || '19:30'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeService?.title || 'Culto de Celebração'}
          </h2>

          <p className="text-xs text-slate-500 font-medium">
            Data da Sessão: <strong>{activeSession?.sessionDate || new Date().toLocaleDateString('pt-BR')}</strong>
            {activeSession?.preacher && ` • Preletor: ${activeSession.preacher}`}
          </p>
        </div>

        {/* Métricas de Presença em Tempo Real */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="px-5 py-3 rounded-xl bg-cyan-50 border border-cyan-100 text-center">
            <span className="block text-[10px] font-black uppercase tracking-wider text-cyan-800">
              Presentes
            </span>
            <span className="text-2xl font-black text-cyan-950">
              {sessionAttendances.length}
            </span>
          </div>

          <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
              Taxa
            </span>
            <span className="text-2xl font-black text-slate-800">
              {attendanceRate}%
            </span>
          </div>

          <button
            type="button"
            onClick={handleShareCheckIn}
            className="px-4 py-3 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-950/20 active:scale-95 transition-all flex items-center gap-1.5"
            title="Compartilhar no WhatsApp"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do membro para marcar presença..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode('todos')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'todos'
                ? 'bg-[#082f38] text-cyan-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({members.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('presentes')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'presentes'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck size={14} />
            <span>Presentes ({sessionAttendances.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('ausentes')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'ausentes'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserX size={14} />
            <span>Ausentes ({members.length - sessionAttendances.length})</span>
          </button>
        </div>
      </div>

      {/* Tabela de Chamada e Presença */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Nome do Membro</th>
                <th className="py-3.5 px-4">Função / Cargo</th>
                <th className="py-3.5 px-4">WhatsApp</th>
                <th className="py-3.5 px-4 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-slate-600">
                      Nenhum membro encontrado
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isPresent = attendedMemberIds.has(m.id);
                  const absentWaUrl = generateWhatsAppUrl(m.id, 'ausencia');

                  return (
                    <tr
                      key={m.id}
                      onClick={() => handleToggle(m.id, m.fullName)}
                      className={`cursor-pointer transition-colors ${
                        isPresent ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Checkbox / Botão de Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          className={`p-1 rounded-full transition-transform active:scale-90 ${
                            isPresent ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle2 size={20} className="fill-emerald-100" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                      </td>

                      {/* Nome do Membro */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0 text-xs ${
                              isPresent
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {m.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={`font-bold ${isPresent ? 'text-emerald-950' : 'text-slate-800'}`}>
                              {m.fullName}
                            </span>
                            {m.ministry && m.ministry !== 'Nenhum' && (
                              <span className="block text-[10px] text-slate-400 font-medium">
                                {m.ministry}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cargo */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.role === 'Pastor'
                              ? 'bg-purple-100 text-purple-800'
                              : m.role === 'Líder'
                              ? 'bg-cyan-100 text-cyan-800'
                              : m.role === 'Visitante'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {m.role || 'Membro'}
                        </span>
                      </td>

                      {/* Celular / WhatsApp */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {m.phoneWhatsApp || 'Não informado'}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {!isPresent && m.phoneWhatsApp && (
                            <a
                              href={absentWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                              title="Enviar mensagem carinhosa de ausência"
                            >
                              <MessageCircle size={13} />
                              <span>Sentimos sua falta</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggle(m.id, m.fullName)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              isPresent
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isPresent ? 'Confirmado' : 'Marcar Presença'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>{sessionAttendances.length} de {members.length} membros presentes</span>
          <span>Toque na linha para confirmar ou remover a presença</span>
        </div>
      </div>
    </div>
  );
};
