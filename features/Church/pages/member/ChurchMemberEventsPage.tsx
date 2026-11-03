import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tent,
  CheckCircle2,
  ArrowRight,
  Radio,
  Instagram,
  ExternalLink,
  Megaphone,
  X
} from 'lucide-react';
import {
  UPCOMING_CHURCH_EVENTS,
  CHURCH_NEWS_FEED,
  INSTAGRAM_URL,
  MemberEventItem,
  getChurchSchedules,
  getConfirmedEventIds,
  saveConfirmedEventIds
} from '../../data/churchMemberData';

interface MemberLayoutContext {
  memberFullName: string;
  memberFirstName: string;
  openPastoralModal: () => void;
  showToast: (msg: string) => void;
}

export const ChurchMemberEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, openPastoralModal } = useOutletContext<MemberLayoutContext>();

  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [confirmedEvents, setConfirmedEvents] = useState<string[]>([]);
  const [selectedEventDetail, setSelectedEventDetail] = useState<MemberEventItem | null>(null);

  const schedules = getChurchSchedules();

  useEffect(() => {
    setConfirmedEvents(getConfirmedEventIds());
  }, []);

  const handleToggleEventPresence = (ev: MemberEventItem) => {
    const exists = confirmedEvents.includes(ev.id);
    const updated = exists
      ? confirmedEvents.filter((id) => id !== ev.id)
      : [...confirmedEvents, ev.id];
    setConfirmedEvents(updated);
    saveConfirmedEventIds(updated);

    if (!exists) {
      showToast(`Sua presença em "${ev.title}" foi confirmada!`);
    } else {
      showToast(`Confirmação removida de "${ev.title}".`);
    }
  };

  const filteredEvents = UPCOMING_CHURCH_EVENTS.filter((ev) =>
    categoryFilter === 'todos' ? true : ev.category === categoryFilter
  );

  return (
    <div className="space-y-7">
      {/* 1. SEÇÃO EXCLUSIVA: PRÓXIMOS EVENTOS DA IGREJA */}
      <section className="space-y-4">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              Agenda Oficial Manancial
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Calendar size={22} className="text-[#082f38]" />
              <span>Próximos Eventos da Igreja</span>
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Confirme sua participação nos retiros, vigílias, batismos e conferências.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['todos', 'Retiro', 'Vigília', 'Culto Especial', 'Conferência'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#082f38] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'todos' ? 'Todos' : cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((ev) => {
            const isConfirmed = confirmedEvents.includes(ev.id);
            const displayCount = ev.registeredCount + (isConfirmed ? 1 : 0);

            return (
              <div
                key={ev.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  <div
                    className={`p-5 sm:p-6 bg-gradient-to-r ${ev.bannerGrad} text-white flex items-start justify-between gap-3`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                          {ev.category}
                        </span>
                        {ev.badgeText && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full text-amber-200">
                            {ev.badgeText}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
                        {ev.title}
                      </h2>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
                      {ev.category === 'Retiro' ? <Tent size={22} /> : <Calendar size={20} />}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#082f38] shrink-0" />
                        <span className="truncate">{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#082f38] shrink-0" />
                        <span className="truncate">{ev.time}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin size={14} className="text-[#082f38] shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Confirmados
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      {displayCount} {ev.capacity ? `/ ${ev.capacity} vagas` : 'participantes'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEventDetail(ev)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      Detalhes
                    </button>

                    {ev.directLink ? (
                      <button
                        type="button"
                        onClick={() => navigate(ev.directLink!)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black uppercase tracking-wider shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>App do Retiro</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleEventPresence(ev)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-[#082f38] hover:bg-[#0a434d] text-white'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isConfirmed ? 'Confirmado' : 'Vou Participar'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. DIAS DE CULTO & PROGRAMAÇÃO SEMANAL + NOVIDADES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dias de Culto (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-[#082f38] flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Dias de Culto & Ensino Semanal
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Horários oficiais na Igreja Manancial São Pedro
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Radio size={11} />
              Presencial
            </span>
          </div>

          <div className="space-y-2.5">
            {schedules.map((item, idx) => {
              const isTheology =
                item.highlight ||
                item.title.toLowerCase().includes('teologia') ||
                item.title.toLowerCase().includes('adenilson');

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isTheology) {
                      navigate('/igreja/membro/ensino');
                    } else {
                      showToast(`${item.title} — ${item.day} às ${item.time}h.`);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isTheology
                      ? 'bg-amber-50/70 hover:bg-amber-50 border-amber-300'
                      : 'bg-slate-50 hover:bg-cyan-50/50 border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          isTheology
                            ? 'bg-amber-200 text-amber-950'
                            : 'bg-cyan-100 text-[#082f38]'
                        }`}
                      >
                        {item.day}
                      </span>
                      {item.tag && (
                        <span className="text-[11px] font-bold text-slate-500">• {item.tag}</span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {item.title}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-xl font-black text-xs shrink-0 ${
                      isTheology ? 'bg-amber-600 text-white' : 'bg-[#082f38] text-white'
                    }`}
                  >
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mural de Novidades & Instagram (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Mural de Novidades & Redes
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Fique por dentro dos comunicados e bastidores
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {CHURCH_NEWS_FEED.map((news) => (
              <div
                key={news.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${news.highlightColor}`}
                  >
                    {news.tag}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{news.dateLabel}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900">{news.title}</h3>
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
                      onClick={openPastoralModal}
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

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Instagram size={22} className="shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-100 block">
                  Instagram Oficial da Igreja
                </span>
                <span className="text-sm font-black truncate block">
                  instagram.com/manancialsaopedro
                </span>
              </div>
            </div>
            <span className="px-3.5 py-2 rounded-xl bg-white text-rose-700 font-black text-xs shrink-0 inline-flex items-center gap-1">
              <span>Seguir</span>
              <ExternalLink size={12} />
            </span>
          </a>
        </div>
      </section>

      {/* Modal de Detalhes do Evento */}
      {selectedEventDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setSelectedEventDetail(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl z-10 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className={`p-6 bg-gradient-to-r ${selectedEventDetail.bannerGrad} text-white`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    {selectedEventDetail.category}
                  </span>
                  <h3 className="text-lg font-black mt-2 leading-snug">
                    {selectedEventDetail.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEventDetail(null)}
                  className="w-8 h-8 rounded-xl bg-black/20 hover:bg-black/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {selectedEventDetail.description}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-[#082f38]" />
                  <span>Data: {selectedEventDetail.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#082f38]" />
                  <span>Horário: {selectedEventDetail.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#082f38]" />
                  <span>Local: {selectedEventDetail.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-[#082f38]" />
                  <span>Público-alvo: {selectedEventDetail.targetAudience}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEventDetail(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Fechar
                </button>

                {selectedEventDetail.directLink ? (
                  <button
                    type="button"
                    onClick={() => navigate(selectedEventDetail.directLink!)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    <span>Acessar Painel do Retiro</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleEventPresence(selectedEventDetail);
                      setSelectedEventDetail(null);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>
                      {confirmedEvents.includes(selectedEventDetail.id)
                        ? 'Cancelar Confirmação'
                        : 'Confirmar Minha Presença'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
