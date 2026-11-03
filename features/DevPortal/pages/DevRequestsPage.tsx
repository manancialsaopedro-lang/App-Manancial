import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Plus,
  Search,
  CheckCircle2,
  HeartHandshake,
  X,
  MessageCircle,
  Eye,
  Trash2,
  Phone,
  BellRing,
  Share2,
  UserCheck
} from 'lucide-react';

export interface RequestItem {
  id: string;
  subject: string;
  type: string;
  subCategory?: string;
  requester: string;
  createdAt: string;
  status: 'Atendido' | 'Em Análise' | 'Pendente';
  details?: string;
  phone?: string;
  pastoralNotes?: string;
  assignedPastor?: string;
  routingMode?: 'Atendimento Direto' | 'Direcionado';
  pastorNotified?: boolean;
}

const STORAGE_KEY = 'manancial_church_requests';

const PASTOR_OPTIONS = [
  'Pastor Titular (Atendimento Direto)',
  'Direcionado: Pr. Adenilson Freitas',
  'Direcionado: Pr. Carlos',
  'Direcionado: Equipe Pastoral & Cuidado Familiar',
  'Direcionado: Ministério de Intercessão / Diaconia',
];

const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: '1',
    subject: 'Aconselhamento e Oração Familiar',
    type: 'Atendimento Pastoral',
    subCategory: 'Gabinete & Aconselhamento',
    requester: 'Érika Cristina Lacerda Laudino',
    createdAt: '04/07/2026',
    status: 'Em Análise',
    details: 'Orientação pastoral para alinhamento familiar e oração.',
    phone: '22999990001',
    assignedPastor: 'Pastor Titular (Atendimento Direto)',
    routingMode: 'Atendimento Direto',
    pastorNotified: true,
  },
  {
    id: '2',
    subject: 'Acompanhamento de Estudos & Discipulado',
    type: 'Atendimento Pastoral',
    subCategory: 'Orientação Espiritual & Teológica',
    requester: 'Fernando Luiz Laudino Filho',
    createdAt: '08/07/2026',
    status: 'Atendido',
    details: 'Direcionamento espiritual e acompanhamento de estudos bíblicos.',
    phone: '22999990002',
    assignedPastor: 'Direcionado: Pr. Adenilson Freitas',
    routingMode: 'Direcionado',
    pastorNotified: true,
  },
  {
    id: '3',
    subject: 'Pedido de oração e visita por saúde familiar',
    type: 'Atendimento Pastoral',
    subCategory: 'Oração & Visita Pastoral',
    requester: 'Marcos Vinícius de Souza',
    createdAt: '12/07/2026',
    status: 'Pendente',
    details: 'Visita domiciliar para orar com a família no novo lar.',
    phone: '22999990003',
    assignedPastor: 'Pastor Titular (Atendimento Direto)',
    routingMode: 'Atendimento Direto',
    pastorNotified: true,
  },
];

export const DevRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New request form state
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('Atendimento Pastoral');
  const [assignedPastor, setAssignedPastor] = useState(PASTOR_OPTIONS[0]);
  const [requester, setRequester] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');

  // Load from localStorage
  const loadRequests = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRequests(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
        setRequests(INITIAL_REQUESTS);
      }
    } catch (e) {
      setRequests(INITIAL_REQUESTS);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const saveRequests = (newList: RequestItem[]) => {
    setRequests(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.warn('Erro ao salvar local:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !requester.trim()) return;

    const newItem: RequestItem = {
      id: Date.now().toString(),
      subject: subject.trim(),
      type,
      requester: requester.trim(),
      phone: phone.trim() || undefined,
      details: details.trim() || undefined,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
      assignedPastor,
      routingMode: assignedPastor.startsWith('Direcionado')
        ? 'Direcionado'
        : 'Atendimento Direto',
      pastorNotified: true,
    };

    const updated = [newItem, ...requests];
    saveRequests(updated);

    setSubject('');
    setRequester('');
    setPhone('');
    setDetails('');
    setModalOpen(false);
    showToast('Solicitação de Atendimento Pastoral registrada e pastor notificado!');
  };

  const handleUpdateStatus = (id: string, newStatus: 'Atendido' | 'Em Análise' | 'Pendente') => {
    const updated = requests.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    saveRequests(updated);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
    showToast(`Status atualizado para: ${newStatus}`);
  };

  const handleUpdatePastorRouting = (id: string, newPastor: string) => {
    const routingMode: 'Atendimento Direto' | 'Direcionado' = newPastor.startsWith('Direcionado')
      ? 'Direcionado'
      : 'Atendimento Direto';
    const updated = requests.map((item) =>
      item.id === id
        ? {
            ...item,
            assignedPastor: newPastor,
            routingMode,
            status: item.status === 'Pendente' ? 'Em Análise' : item.status,
          }
        : item
    );
    saveRequests(updated);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({
        ...selectedRequest,
        assignedPastor: newPastor,
        routingMode,
        status: selectedRequest.status === 'Pendente' ? 'Em Análise' : selectedRequest.status,
      });
    }
    showToast(`Atendimento atualizado: ${newPastor}`);
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm('Deseja realmente remover esta solicitação?')) {
      const updated = requests.filter((r) => r.id !== id);
      saveRequests(updated);
      setDetailsModalOpen(false);
      showToast('Solicitação removida.');
    }
  };

  const openWhatsApp = (req: RequestItem) => {
    const rawNumber = req.phone || '';
    const clean = rawNumber.replace(/\D/g, '');
    const phoneParam = clean ? (clean.length <= 11 ? `55${clean}` : clean) : '';
    const firstName = req.requester.split(' ')[0] || 'Irmão(ã)';
    const pastorLabel = req.assignedPastor || 'Equipe Pastoral';
    const text = encodeURIComponent(
      `Graça e Paz, ${firstName}! 🙏\nAqui é da liderança da Igreja Manancial (${pastorLabel}) sobre sua solicitação de Atendimento Pastoral: "${req.subject}". Como podemos te abençoar hoje?`
    );
    const url = phoneParam
      ? `https://wa.me/${phoneParam}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedPastor || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'todos' ||
      item.type.toLowerCase().includes(filterType.toLowerCase()) ||
      (item.subCategory || '').toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header com Ações & Filtros */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 text-[#082f38] border border-cyan-200">
                <BellRing size={11} />
                Central Pastoral Integrada
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight mt-1">
              Solicitações de Atendimento Pastoral
            </h2>
            <p className="text-xs text-slate-500">
              Receba as notificações enviadas pelos membros, realize o atendimento direto ou direcione para outros pastores da equipe.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-950/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Novo Atendimento Pastoral</span>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por assunto, membro ou pastor designado..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div className="sm:w-64">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-cyan-600 outline-none"
            >
              <option value="todos">Todos os atendimentos</option>
              <option value="atendimento pastoral">Atendimento Pastoral (Unificado)</option>
              <option value="gabinete">Gabinete & Aconselhamento</option>
              <option value="oração">Oração & Intercessão</option>
              <option value="visita">Visita Pastoral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Solicitações */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Assunto & Motivo</th>
                <th className="py-3.5 px-4">Membro Solicitante</th>
                <th className="py-3.5 px-4">Atendimento Direto / Direcionar Pastor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Inbox size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-slate-600">
                      Nenhuma solicitação encontrada
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ajuste os filtros ou registre um novo atendimento acima.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-cyan-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{req.subject}</div>
                      <div className="text-[10px] font-bold text-cyan-800 mt-0.5">
                        {req.type} {req.subCategory ? `• ${req.subCategory}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-cyan-950">
                      {req.requester}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={req.assignedPastor || PASTOR_OPTIONS[0]}
                        onChange={(e) => handleUpdatePastorRouting(req.id, e.target.value)}
                        className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:border-cyan-600 outline-none cursor-pointer"
                      >
                        {PASTOR_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={req.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            req.id,
                            e.target.value as 'Atendido' | 'Em Análise' | 'Pendente'
                          )
                        }
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${
                          req.status === 'Atendido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Em Análise'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Análise">Em Análise</option>
                        <option value="Atendido">Atendido</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{req.createdAt}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openWhatsApp(req)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Atender via WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequest(req);
                            setDetailsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-cyan-900 transition-colors cursor-pointer"
                          title="Ver Ficha / Direcionar Pastor"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(req.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Total: {filteredRequests.length} solicitações pastorais</span>
          <span>Sincronizado em tempo real com a Visão do Membro</span>
        </div>
      </div>

      {/* Modal Detalhes & Direcionamento Pastoral */}
      {detailsModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-cyan-950/60 backdrop-blur-sm"
            onClick={() => setDetailsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                  {selectedRequest.type}
                </span>
                <h3 className="text-base font-black text-slate-800 mt-1">
                  {selectedRequest.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-500">Membro Solicitante:</p>
                <p className="font-bold text-slate-800 text-sm">{selectedRequest.requester}</p>
                {selectedRequest.phone && (
                  <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                    <Phone size={12} className="text-emerald-600" />
                    <span>WhatsApp: {selectedRequest.phone}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400">
                  Data de Entrada: {selectedRequest.createdAt}
                </p>
              </div>

              {/* Atender Direto ou Direcionar para Outros Pastores */}
              <div className="p-3.5 bg-cyan-50/60 rounded-xl border border-cyan-200/80 space-y-2">
                <label className="font-black text-[#082f38] flex items-center gap-1.5">
                  <Share2 size={14} />
                  <span>Atendimento Direto ou Direcionar para outro Pastor:</span>
                </label>
                <select
                  value={selectedRequest.assignedPastor || PASTOR_OPTIONS[0]}
                  onChange={(e) => handleUpdatePastorRouting(selectedRequest.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cyan-300 bg-white text-xs font-bold text-slate-800 outline-none"
                >
                  {PASTOR_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRequest.details && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Motivo / Observações:
                  </label>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 leading-relaxed border border-slate-100">
                    {selectedRequest.details}
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Status do Atendimento:
                </label>
                <div className="flex gap-2">
                  {(['Pendente', 'Em Análise', 'Atendido'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedRequest.id, st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedRequest.status === st
                          ? st === 'Atendido'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : st === 'Em Análise'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => openWhatsApp(selectedRequest)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <MessageCircle size={14} />
                <span>Atender no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Solicitação Manual */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-cyan-950/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">
                Registrar Atendimento Pastoral
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assunto do Atendimento Pastoral *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Gabinete familiar, Oração por saúde, Visita..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Atendimento Direto ou Direcionar para Pastor
                </label>
                <select
                  value={assignedPastor}
                  onChange={(e) => setAssignedPastor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:border-cyan-600 outline-none"
                >
                  {PASTOR_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Solicitante *
                </label>
                <input
                  type="text"
                  required
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  placeholder="Nome completo do membro ou família"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp / Celular (Opcional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(22) 99999-9999"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detalhes / Observações
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Informações complementares sobre o atendimento..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
