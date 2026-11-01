import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  CheckCircle2,
  ExternalLink,
  Tent,
  Flame,
  Heart,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChurchEvent {
  id: string;
  title: string;
  category: 'Retiro' | 'Conferência' | 'Culto Especial' | 'Vigília' | 'Social';
  date: string;
  time: string;
  location: string;
  description: string;
  targetAudience: string;
  registeredCount: number;
  capacity?: number;
  directLink?: string;
  bannerColor: string;
}

const INITIAL_EVENTS: ChurchEvent[] = [
  {
    id: '1',
    title: 'Acampamento & Retiro Manancial 2027',
    category: 'Retiro',
    date: '05 a 09 de Fevereiro de 2027',
    time: 'Saída às 06:00',
    location: 'Estância São Pedro - SP',
    description: 'Grande retiro espiritual com gincana bíblica 25:14, cultos na fogueira, comunhão e lazer completo.',
    targetAudience: 'Toda a Igreja & Jovens',
    registeredCount: 148,
    capacity: 200,
    directLink: '/acampamento',
    bannerColor: 'from-[#082f38] to-[#0e4b57]',
  },
  {
    id: '2',
    title: 'Vigília Rompendo em Fé',
    category: 'Vigília',
    date: '28 de Fevereiro de 2026',
    time: '23:00 às 05:00',
    location: 'Templo Sede Manancial',
    description: 'Noite inteira de clamor, louvor espontâneo, intercessão pelas famílias e busca pelo Espírito Santo.',
    targetAudience: 'Membros e Intercessores',
    registeredCount: 85,
    bannerColor: 'from-indigo-950 to-slate-900',
  },
  {
    id: '3',
    title: 'Culto de Celebração & Batismo nas Águas',
    category: 'Culto Especial',
    date: '15 de Março de 2026',
    time: '18:00',
    location: 'Templo Sede Manancial (Tanque Batismal)',
    description: 'Celebração pública da fé dos novos convertidos que concluíram o curso de formação batismal.',
    targetAudience: 'Igreja e Familiares dos Batizandos',
    registeredCount: 32,
    bannerColor: 'from-cyan-950 to-teal-900',
  },
  {
    id: '4',
    title: 'Conferência de Jovens: Geração de Impacto',
    category: 'Conferência',
    date: '18 e 19 de Abril de 2026',
    time: '19:30',
    location: 'Auditório Principal Manancial',
    description: 'Dois dias de ministrações poderosas, bandas convidadas e workshops sobre propósito de vida.',
    targetAudience: 'Juventude e Adolescentes',
    registeredCount: 120,
    capacity: 250,
    bannerColor: 'from-emerald-950 to-teal-950',
  },
];

export const DevEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ChurchEvent[]>(INITIAL_EVENTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === 'todos' || e.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
            Agenda da Igreja
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Calendar size={24} className="text-[#082f38]" />
            <span>Eventos & Programações Especiais</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Calendário de retiros, vigílias, conferências e celebrações da Igreja Manancial.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/acampamento')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#082f38] hover:bg-[#0c434f] text-cyan-200 hover:text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/20 active:scale-95 transition-all"
        >
          <Tent size={16} />
          <span>Acessar App do Retiro</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento por nome ou local..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="todos">Todas as Categorias</option>
            <option value="Retiro">Retiros & Acampamentos</option>
            <option value="Conferência">Conferências</option>
            <option value="Culto Especial">Cultos Especiais & Batismos</option>
            <option value="Vigília">Vigílias</option>
          </select>
        </div>
      </div>

      {/* Events Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-cyan-400/60 transition-all hover:shadow-md"
          >
            {/* Top Event Banner */}
            <div className={`p-5 bg-gradient-to-r ${ev.bannerColor} text-white flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-cyan-200">
                  {ev.category}
                </span>
                <h3 className="text-base font-black tracking-tight text-white mt-1.5 leading-snug">
                  {ev.title}
                </h3>
              </div>

              {ev.category === 'Retiro' && (
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300 shrink-0">
                  <Tent size={22} />
                </div>
              )}
            </div>

            {/* Event Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {ev.description}
              </p>

              <div className="space-y-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-cyan-800 shrink-0" />
                  <span>{ev.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-cyan-800 shrink-0" />
                  <span>{ev.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-cyan-800 shrink-0" />
                  <span>{ev.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-cyan-800 shrink-0" />
                  <span>Público: {ev.targetAudience}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="text-[11px] font-bold text-slate-500">Inscritos confirmados</div>
                  <div className="text-sm font-black text-slate-900">
                    {ev.registeredCount} {ev.capacity ? `/ ${ev.capacity}` : 'pessoas'}
                  </div>
                </div>

                {ev.directLink ? (
                  <button
                    type="button"
                    onClick={() => navigate(ev.directLink!)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-900 hover:bg-cyan-950 text-cyan-200 text-xs font-bold transition-all"
                  >
                    <span>Abrir Módulo</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    <CheckCircle2 size={13} />
                    <span>Confirmado na Agenda</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
