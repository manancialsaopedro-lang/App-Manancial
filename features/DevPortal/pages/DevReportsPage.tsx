import React from 'react';
import {
  BarChart3,
  Users,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sparkles,
  PieChart,
  Award,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useChurchStore } from '../../../store/churchStore';

export const DevReportsPage: React.FC = () => {
  const { members, sessions, attendances } = useChurchStore();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Ativo').length;
  const visitors = members.filter((m) => m.role === 'Visitante').length;
  const leaders = members.filter((m) => ['Pastor', 'Presbítero', 'Diácono', 'Líder'].includes(m.role)).length;

  // Distribuição por ministério
  const ministryCounts: Record<string, number> = {};
  members.forEach((m) => {
    const min = m.ministry || 'Nenhum';
    ministryCounts[min] = (ministryCounts[min] || 0) + 1;
  });

  // Frequência por sessão
  const sessionStats = sessions.map((ses) => {
    const count = attendances.filter((a) => a.sessionId === ses.id).length;
    const rate = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
    return {
      id: ses.id,
      date: ses.sessionDate,
      theme: ses.theme || 'Culto de Celebração',
      preacher: ses.preacher || 'Pastoral',
      count,
      rate,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header da Página de Relatórios */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={22} className="text-[#082f38]" />
            <span>Relatórios & Indicadores da Igreja</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Métricas de frequência de culto, crescimento do rebanho e engajamento ministerial.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 self-start sm:self-auto"
        >
          <Printer size={15} />
          <span>Imprimir Relatório</span>
        </button>
      </div>

      {/* Grid de KPIs Executivos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-cyan-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Total de Membros</span>
            <Users size={18} />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalMembers}</div>
          <span className="text-[11px] text-slate-400 font-medium">Cadastrados no sistema</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-black uppercase tracking-wider">Membros Ativos</span>
            <UserCheck size={18} />
          </div>
          <div className="text-3xl font-black text-emerald-950">{activeMembers}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}% de assiduidade
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-black uppercase tracking-wider">Visitantes</span>
            <Sparkles size={18} />
          </div>
          <div className="text-3xl font-black text-amber-950">{visitors}</div>
          <span className="text-[11px] text-amber-700 font-medium">Em integração pastoral</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[10px] font-black uppercase tracking-wider">Liderança</span>
            <Award size={18} />
          </div>
          <div className="text-3xl font-black text-purple-950">{leaders}</div>
          <span className="text-[11px] text-purple-700 font-medium">Pastores, diáconos e líderes</span>
        </div>
      </div>

      {/* Grid: Histórico de Cultos + Distribuição Ministerial */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Histórico de Frequência por Culto */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Clock size={15} className="text-cyan-700" />
              <span>Histórico de Frequência nos Cultos</span>
            </span>
            <span className="text-[10px] text-slate-400">Últimas sessões</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {sessionStats.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Calendar size={28} className="mx-auto mb-2 opacity-50" />
                <p className="font-bold text-xs text-slate-600">Nenhum culto registrado ainda</p>
              </div>
            ) : (
              sessionStats.map((ses) => (
                <div key={ses.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 max-w-[65%]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                        {ses.date}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {ses.theme}
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-400">
                      Preletor: {ses.preacher}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 block">
                      {ses.count} presentes
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {ses.rate}% do rebanho
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Distribuição por Ministérios */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <PieChart size={15} className="text-purple-600" />
                <span>Membros por Ministério</span>
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(ministryCounts).map(([min, count]) => {
                const pct = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
                return (
                  <div key={min} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{min}</span>
                      <span className="text-slate-400 font-medium">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#082f38] to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-cyan-50/70 rounded-xl border border-cyan-100 text-[11px] text-cyan-900 font-medium flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-700 shrink-0" />
            <span>Dados sincronizados em tempo real com a gestão eclesiástica.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
