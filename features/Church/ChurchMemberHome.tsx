import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  HeartHandshake,
  Calendar,
  GraduationCap,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  Instagram,
  ExternalLink,
  Megaphone,
  BellRing,
  Share2,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import {
  CHURCH_NEWS_FEED,
  INSTAGRAM_URL,
  STORAGE_MEMBER_CHECKINS_KEY,
  UPCOMING_CHURCH_EVENTS,
  ChurchRequestItem,
  getChurchSchedules,
  getStoredPastoralRequests
} from './data/churchMemberData';

interface MemberLayoutContext {
  memberFullName: string;
  memberFirstName: string;
  openPastoralModal: () => void;
  showToast: (msg: string) => void;
}

export const ChurchMemberHome: React.FC = () => {
  const navigate = useNavigate();
  const { memberFirstName, openPastoralModal, showToast } =
    useOutletContext<MemberLayoutContext>();

  const [requests, setRequests] = useState<ChurchRequestItem[]>([]);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const schedules = getChurchSchedules();
  const todayKey = new Date().toISOString().split('T')[0];

  const loadData = () => {
    setRequests(getStoredPastoralRequests());
    try {
      const savedCheckins = JSON.parse(
        localStorage.getItem(STORAGE_MEMBER_CHECKINS_KEY) || '[]'
      );
      setCheckedInToday(savedCheckins.includes(todayKey));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('manancial-requests-updated', loadData);
    return () => window.removeEventListener('manancial-requests-updated', loadData);
  }, []);

  const handleToggleWorshipCheckin = () => {
    try {
      const savedCheckins: string[] = JSON.parse(
        localStorage.getItem(STORAGE_MEMBER_CHECKINS_KEY) || '[]'
      );
      let updated: string[];
      if (savedCheckins.includes(todayKey)) {
        updated = savedCheckins.filter((d) => d !== todayKey);
        setCheckedInToday(false);
        showToast('Check-in de presença no culto desfeito.');
      } else {
        updated = [todayKey, ...savedCheckins];
        setCheckedInToday(true);
        showToast('Presença registrada no culto de hoje! Que Deus fale ao seu coração.');
      }
      localStorage.setItem(STORAGE_MEMBER_CHECKINS_KEY, JSON.stringify(updated));
    } catch (e) {
      setCheckedInToday(true);
      showToast('Presença confirmada!');
    }
  };

  const handleShareDevotional = () => {
    const text = encodeURIComponent(
      '📖 *Meditação da Semana — Igreja Manancial São Pedro*\n\n“O segredo do Senhor é para os que o temem; e ele lhes fará saber a sua aliança.” (Salmos 25:14)\n\nSiga nossa igreja: https://www.instagram.com/manancialsaopedro/'
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const activeRequests = requests.filter((r) => r.status !== 'Atendido');
  const latestRequest = requests[0] || null;
  const featuredEvent = UPCOMING_CHURCH_EVENTS[0];

  return (
    <div className="space-y-6">
      {/* 1. HERO EXECUTIVO & LIMPO + CHECK-IN RÁPIDO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062127] via-[#082f38] to-[#0d4d59] text-white p-6 sm:p-8 shadow-lg">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/10 text-cyan-200 border border-white/15">
                <Sparkles size={12} className="text-cyan-300" />
                A Paz do Senhor
              </span>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-300/30 transition-colors"
              >
                <Instagram size={12} />
                <span>@manancialsaopedro</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bem-vindo, {memberFirstName}!
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/90 font-medium leading-relaxed">
              Tudo o que você precisa para caminhar em comunhão: solicite{' '}
              <strong>Atendimento Pastoral</strong> direto ao pastor, acompanhe os{' '}
              <strong>próximos eventos</strong>, horários de culto e o{' '}
              <strong>Curso de Teologia às terças-feiras com o Pr. Adenilson Freitas</strong>.
            </p>
          </div>

          {/* Card Compacto de Check-in / Ação Rápida */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={openPastoralModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-cyan-50 text-[#082f38] font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <HeartHandshake size={17} className="text-rose-600" />
              <span>Atendimento Pastoral</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={handleToggleWorshipCheckin}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs border transition-all active:scale-95 cursor-pointer ${
                checkedInToday
                  ? 'bg-emerald-500/25 border-emerald-300/50 text-emerald-100'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <UserCheck size={16} className={checkedInToday ? 'text-emerald-300' : 'text-cyan-300'} />
              <span>{checkedInToday ? 'Presença Confirmada Hoje' : 'Check-in no Culto de Hoje'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. DOCK DE ACESSO RÁPIDO (4 ATALHOS PRINCIPAIS DO DIA A DIA DO MEMBRO) */}
      <section aria-label="Atalhos Rápidos" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => navigate('/igreja/membro/atendimento')}
          className="group bg-white hover:bg-cyan-50/40 p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-[#082f38] shadow-xs hover:shadow-md text-left transition-all flex flex-col justify-between gap-3 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-[#082f38] flex items-center justify-center">
              <HeartHandshake size={20} />
            </div>
            {activeRequests.length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {activeRequests.length} ativo(s)
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#082f38]">
              Atendimento Pastoral
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
              Notifica o pastor na hora (atendimento direto ou direcionado)
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/igreja/membro/ensino')}
          className="group bg-white hover:bg-amber-50/40 p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-amber-500 shadow-xs hover:shadow-md text-left transition-all flex flex-col justify-between gap-3 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              Terças 19:30
            </span>
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-900">
              Teologia & Batismo
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
              Terças c/ Pr. Adenilson Freitas + Quero me Batizar
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/igreja/membro/eventos')}
          className="group bg-white hover:bg-cyan-50/40 p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-[#082f38] shadow-xs hover:shadow-md text-left transition-all flex flex-col justify-between gap-3 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
              {UPCOMING_CHURCH_EVENTS.length} eventos
            </span>
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#082f38]">
              Eventos & Cultos
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
              Próximos eventos da igreja e horários da semana
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/igreja/membro/perfil')}
          className="group bg-white hover:bg-cyan-50/40 p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-[#082f38] shadow-xs hover:shadow-md text-left transition-all flex flex-col justify-between gap-3 cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
              PIX & Acessos
            </span>
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#082f38]">
              Dízimos & Meu Espaço
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
              Chave PIX em 1 toque, acampamento e ministérios
            </p>
          </div>
        </button>
      </section>

      {/* 3. GRID PRINCIPAL LIMPO: NOVIDADES & DIAS DE CULTO (ESQUERDA) + RESUMO PASTORAL & EVENTO (DIREITA) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda (7 cols): Principais Novidades + Dias de Culto Resumidos */}
        <div className="lg:col-span-7 space-y-6">
          {/* Principais Novidades da Igreja */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Principais Novidades da Igreja
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Avisos importantes para sua semana
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/igreja/membro/eventos')}
                className="text-xs font-extrabold text-[#082f38] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Ver agenda</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {CHURCH_NEWS_FEED.map((news) => (
                <div
                  key={news.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${news.highlightColor}`}
                    >
                      {news.tag}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">{news.dateLabel}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">{news.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{news.summary}</p>
                  <div className="pt-1">
                    {news.actionType === 'instagram' ? (
                      <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-black text-pink-700 hover:underline"
                      >
                        <Instagram size={13} />
                        <span>{news.actionLabel}</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : news.actionType === 'teologia' || news.actionType === 'batismo' ? (
                      <button
                        type="button"
                        onClick={() => navigate('/igreja/membro/ensino')}
                        className="inline-flex items-center gap-1 text-xs font-black text-[#082f38] hover:underline cursor-pointer"
                      >
                        <span>{news.actionLabel}</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/igreja/membro/atendimento')}
                        className="inline-flex items-center gap-1 text-xs font-black text-[#082f38] hover:underline cursor-pointer"
                      >
                        <span>{news.actionLabel}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Programação Semanal Compacta (Dias de Culto & Curso de Teologia) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 text-[#082f38] flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Dias de Culto & Ensino
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Encontros fixos da semana na Manancial São Pedro
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/igreja/membro/eventos')}
                className="text-xs font-extrabold text-[#082f38] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Completa</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {schedules.map((item, idx) => {
                const isTheology =
                  item.highlight ||
                  item.title.toLowerCase().includes('teologia') ||
                  item.title.toLowerCase().includes('adenilson');

                return (
                  <div
                    key={idx}
                    onClick={() =>
                      isTheology
                        ? navigate('/igreja/membro/ensino')
                        : navigate('/igreja/membro/eventos')
                    }
                    className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            isTheology
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-cyan-50 text-[#082f38]'
                          }`}
                        >
                          {item.day}
                        </span>
                        {item.tag && (
                          <span className="text-[11px] font-semibold text-slate-500 truncate">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#082f38] mt-0.5 truncate">
                        {item.title}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#082f38] group-hover:text-white text-slate-800 font-black text-xs transition-colors shrink-0">
                      {item.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna Direita (5 cols): Atendimento Pastoral Ativo + Próximo Evento + Devocional + Instagram */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card Status de Atendimento Pastoral */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#082f38] bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                <BellRing size={12} />
                Meu Atendimento Pastoral
              </span>
              <button
                type="button"
                onClick={() => navigate('/igreja/membro/atendimento')}
                className="text-xs font-extrabold text-[#082f38] hover:underline cursor-pointer"
              >
                Ver todos ({requests.length})
              </button>
            </div>

            {latestRequest ? (
              <div
                onClick={() => navigate('/igreja/membro/atendimento')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50/40 border border-slate-200/90 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    Última solicitação • {latestRequest.createdAt}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      latestRequest.status === 'Atendido'
                        ? 'bg-emerald-100 text-emerald-900'
                        : latestRequest.status === 'Em Análise'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {latestRequest.status}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">{latestRequest.subject}</h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  Direcionamento:{' '}
                  <strong className="text-slate-800">
                    {latestRequest.assignedPastor || 'Pastor Titular (Notificado)'}
                  </strong>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Você ainda não possui solicitações abertas. O pastor recebe sua notificação na hora!
              </p>
            )}

            <button
              type="button"
              onClick={openPastoralModal}
              className="w-full py-3 px-4 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <HeartHandshake size={15} className="text-cyan-300" />
              <span>Nova Solicitação Pastoral</span>
            </button>
          </div>

          {/* Próximo Grande Evento em Destaque */}
          <div className="rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xs">
            <div className={`p-5 bg-gradient-to-r ${featuredEvent.bannerGrad} text-white space-y-1.5`}>
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/25 px-2.5 py-0.5 rounded-full">
                Próximo Evento em Destaque
              </span>
              <h3 className="text-base font-black leading-snug">{featuredEvent.title}</h3>
              <p className="text-xs text-white/90 font-semibold">
                {featuredEvent.date} • {featuredEvent.location}
              </p>
            </div>
            <div className="p-4 flex items-center justify-between gap-2 bg-white">
              <button
                type="button"
                onClick={() => navigate('/igreja/membro/eventos')}
                className="text-xs font-extrabold text-slate-700 hover:text-slate-950 cursor-pointer"
              >
                Ver todos os eventos
              </button>
              <button
                type="button"
                onClick={() => navigate(featuredEvent.directLink || '/igreja/membro/eventos')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>Acessar</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Meditação da Semana Compartilhável */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-900 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                <BookOpen size={12} />
                Palavra da Semana
              </span>
              <button
                type="button"
                onClick={handleShareDevotional}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                <Share2 size={13} />
                <span>Compartilhar</span>
              </button>
            </div>
            <blockquote className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed border-l-4 border-[#082f38] pl-3">
              “O segredo do Senhor é para os que o temem; e ele lhes fará saber a sua aliança.”
              <span className="block text-[11px] font-extrabold text-slate-500 mt-1">
                Salmos 25:14
              </span>
            </blockquote>
          </div>

          {/* Card Direto do Instagram Oficial */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Instagram size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-100 block">
                  Instagram Oficial
                </span>
                <span className="text-xs sm:text-sm font-black truncate block">
                  @manancialsaopedro
                </span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-white text-rose-700 font-black text-xs shrink-0 inline-flex items-center gap-1">
              <span>Abrir</span>
              <ExternalLink size={12} />
            </span>
          </a>
        </div>
      </section>
    </div>
  );
};
