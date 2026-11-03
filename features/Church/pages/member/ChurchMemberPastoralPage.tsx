import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  HeartHandshake,
  BellRing,
  UserCheck,
  Share2,
  ChevronRight,
  ArrowRight,
  Search,
  Inbox,
  BookmarkCheck,
  Plus
} from 'lucide-react';
import {
  ChurchRequestItem,
  PASTORAL_TOPICS,
  getStoredPastoralRequests,
  saveStoredPastoralRequests
} from '../../data/churchMemberData';
import {
  PastoralRequestModal,
  PastoralRequestDetailModal
} from '../../components/PastoralRequestModal';

interface MemberLayoutContext {
  memberFullName: string;
  memberFirstName: string;
  openPastoralModal: () => void;
  showToast: (msg: string) => void;
}

export const ChurchMemberPastoralPage: React.FC = () => {
  const { memberFullName, showToast } = useOutletContext<MemberLayoutContext>();

  const [requests, setRequests] = useState<ChurchRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'atendidos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ChurchRequestItem | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedTopic, setPreselectedTopic] = useState<string | undefined>(undefined);

  const loadRequests = () => {
    setRequests(getStoredPastoralRequests());
  };

  useEffect(() => {
    loadRequests();
    window.addEventListener('manancial-requests-updated', loadRequests);
    return () => window.removeEventListener('manancial-requests-updated', loadRequests);
  }, []);

  const handleOpenWithTopic = (topicId?: string) => {
    setPreselectedTopic(topicId);
    setModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    saveStoredPastoralRequests(updated);
    setSelectedRequest(null);
    showToast('Solicitação de atendimento pastoral cancelada.');
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.assignedPastor || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'ativos') return matchesSearch && req.status !== 'Atendido';
    if (statusFilter === 'atendidos') return matchesSearch && req.status === 'Atendido';
    return matchesSearch;
  });

  const activeCount = requests.filter((r) => r.status !== 'Atendido').length;
  const completedCount = requests.filter((r) => r.status === 'Atendido').length;

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO UNIFICADO DE ATENDIMENTO PASTORAL */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-xs space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#082f38] text-cyan-300 flex items-center justify-center shadow-md shrink-0">
                <HeartHandshake size={24} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#082f38]">
                  <BellRing size={11} />
                  Canal Único de Cuidado
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Atendimento Pastoral
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Todas as opções de gabinete, aconselhamento, pedido de oração, visita hospitalar/domiciliar e apoio fraterno estão unificadas em <strong>Atendimento Pastoral</strong>. Ao enviar seu pedido, <strong>a notificação chega imediatamente ao Pastor</strong>, que pode atender você diretamente ou direcionar para outros pastores da equipe.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 flex items-start gap-3">
                <UserCheck size={18} className="text-[#082f38] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Atendimento Direto pelo Pastor
                  </span>
                  <span className="text-[11px] text-slate-600 leading-snug block mt-0.5">
                    O Pastor Titular recebe o alerta e pode realizar seu acompanhamento pessoalmente.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                <Share2 size={18} className="text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Direcionamento para Pastores
                  </span>
                  <span className="text-[11px] text-slate-600 leading-snug block mt-0.5">
                    Pode ser direcionado a outros pastores (como o Pr. Adenilson Freitas e equipe).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Motivos Rápidos dentro do Atendimento Pastoral */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2.5">
                Toque no foco do seu atendimento pastoral:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PASTORAL_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleOpenWithTopic(topic.id)}
                    className="p-3 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200/90 hover:border-[#082f38] text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-slate-900 group-hover:text-[#082f38]">
                        {topic.label}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-slate-400 group-hover:text-[#082f38] shrink-0"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{topic.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenWithTopic(undefined)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-[#082f38] hover:bg-[#0a434d] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <HeartHandshake size={17} className="text-cyan-300" />
              <span>Iniciar Atendimento Pastoral</span>
              <ArrowRight size={15} className="text-cyan-300" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. HISTÓRICO E ACOMPANHAMENTO DE SOLICITAÇÕES PASTORAIS */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-[#082f38] flex items-center justify-center">
              <BookmarkCheck size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Meus Protocolos de Atendimento Pastoral
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {activeCount} em acompanhamento • {completedCount} concluído(s)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenWithTopic(undefined)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} />
            <span>Nova Solicitação</span>
          </button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por assunto ou pastor responsável..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-[#082f38] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'ativos', label: 'Em Acompanhamento' },
                { id: 'atendidos', label: 'Concluídos' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#082f38] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Solicitações */}
        {filteredRequests.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
            <Inbox size={34} className="mx-auto text-slate-400 mb-2.5" />
            <p className="text-sm font-extrabold text-slate-800">
              Nenhuma solicitação encontrada
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Ao manifestar interesse em atendimento pastoral, o pastor é notificado imediatamente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="group p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-[#082f38] hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#082f38] bg-cyan-100 px-2 py-0.5 rounded-md">
                      Atendimento Pastoral
                    </span>
                    {req.subCategory && (
                      <span className="text-[11px] font-bold text-slate-600">
                        • {req.subCategory}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-slate-400">
                      {req.createdAt}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#082f38]">
                    {req.subject}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Direcionamento Pastoral:{' '}
                    <strong className="text-slate-800">
                      {req.assignedPastor || 'Pastor Titular (Notificado)'}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                      req.status === 'Atendido'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : req.status === 'Em Análise'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    {req.status}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-slate-400 group-hover:text-[#082f38] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modais */}
      <PastoralRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        memberFullName={memberFullName}
        initialTopicId={preselectedTopic}
        onSuccess={() => {
          loadRequests();
          showToast('Solicitação registrada! Notificação enviada ao Pastor.');
        }}
      />

      <PastoralRequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onDelete={handleDeleteRequest}
      />
    </div>
  );
};
