import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ArrowLeft,
  Users,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Calendar,
  Sparkles,
  PieChart,
  Award,
  Clock,
  Printer
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { useChurchStore } from '../../../store/churchStore';

export const ChurchReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppStore();
  const { members, sessions, attendances, services } = useChurchStore();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Ativo').length;
  const visitors = members.filter((m) => m.role === 'Visitante').length;
  const leaders = members.filter((m) => ['Pastor', 'Presbítero', 'Diácono', 'Líder'].includes(m.role)).length;

  // Distribuição por ministério
  const ministryCounts: Record<string, number> = {};
  members.forEach((m) => {
    const min = m.ministry || 'Sem Ministério';
    ministryCounts[min] = (ministryCounts[min] || 0) + 1;
  });

  // Frequência por sessão
  const sessionStats = sessions.map((ses) => {
    const count = attendances.filter((a) => a.sessionId === ses.id).length;
    const rate = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
    return {
      id: ses.id,
      date: ses.sessionDate,
      theme: ses.theme || 'Culto Geral',
      count,
      rate
    };
  });

  const themeColors = {
    bg: isDarkMode ? 'bg-[#080d1a]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-[#11192e] border-slate-800' : 'bg-white border-slate-200',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col pb-28 ${themeColors.bg} transition-colors duration-500`}>
      
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
            <h1 className={`text-sm sm:text-base font-black ${themeColors.textMain}`}>Relatórios de Participação</h1>
            <p className={`text-[10px] sm:text-xs ${themeColors.textSec}`}>Métricas em Tempo Real da Congregação</p>
          </div>

          <button
            onClick={() => window.print()}
            className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1 ${
              isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700'
            }`}
            title="Imprimir relatório"
          >
            <Printer size={15} />
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto w-full px-4 pt-5 space-y-5">
        
        {/* CARDS DE RESUMO (KPIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center gap-2 text-cyan-500 mb-1">
              <Users size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Membros Ativos</span>
            </div>
            <div className={`text-2xl font-black ${themeColors.textMain}`}>{activeMembers}</div>
            <div className={`text-[11px] ${themeColors.textSec}`}>{totalMembers} cadastrados</div>
          </div>

          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <UserCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Liderança</span>
            </div>
            <div className={`text-2xl font-black ${themeColors.textMain}`}>{leaders}</div>
            <div className={`text-[11px] ${themeColors.textSec}`}>Pastores, Diáconos, Líderes</div>
          </div>

          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center gap-2 text-teal-500 mb-1">
              <Sparkles size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Visitantes</span>
            </div>
            <div className={`text-2xl font-black ${themeColors.textMain}`}>{visitors}</div>
            <div className={`text-[11px] ${themeColors.textSec}`}>Acolhimento contínuo</div>
          </div>

          <div className={`p-4 rounded-3xl border shadow-sm ${themeColors.card}`}>
            <div className="flex items-center gap-2 text-indigo-500 mb-1">
              <TrendingUp size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Média Presença</span>
            </div>
            <div className={`text-2xl font-black ${themeColors.textMain}`}>
              {sessionStats.length > 0
                ? Math.round(sessionStats.reduce((acc, s) => acc + s.rate, 0) / sessionStats.length)
                : 0}%
            </div>
            <div className={`text-[11px] ${themeColors.textSec}`}>Frequência dos cultos</div>
          </div>
        </div>

        {/* GRÁFICO / HISTÓRICO DE FREQUÊNCIA CULTO A CULTO */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm ${themeColors.card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-sm sm:text-base font-black ${themeColors.textMain}`}>
                Frequência Culto a Culto
              </h3>
              <p className={`text-xs ${themeColors.textSec}`}>
                Comparativo de presentes confirmados em cada culto
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-500">
              Tempo Real
            </span>
          </div>

          <div className="space-y-3.5">
            {sessionStats.map((stat) => (
              <div key={stat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className={themeColors.textMain}>{stat.theme}</span>
                    <span className="text-[11px] text-slate-400 font-normal">({stat.date})</span>
                  </div>
                  <span className="text-teal-500">{stat.count} presentes ({stat.rate}%)</span>
                </div>

                {/* Barra de progresso */}
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stat.rate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DISTRIBUIÇÃO POR MINISTÉRIO */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm ${themeColors.card}`}>
          <h3 className={`text-sm sm:text-base font-black mb-1 ${themeColors.textMain}`}>
            Distribuição por Ministério
          </h3>
          <p className={`text-xs mb-4 ${themeColors.textSec}`}>
            Como a membresia está envolvida nas áreas de serviço da igreja
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(ministryCounts).map(([ministry, count]) => (
              <div
                key={ministry}
                className={`p-3.5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{ministry}</div>
                <div className={`text-xl font-black mt-1 ${themeColors.textMain}`}>{count}</div>
                <div className="text-[10px] text-cyan-500 font-semibold">
                  {Math.round((count / totalMembers) * 100)}% da igreja
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
};
