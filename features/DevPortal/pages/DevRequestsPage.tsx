import React, { useState } from 'react';
import {
  Inbox,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Heart,
  Package,
  Calendar,
  X
} from 'lucide-react';

interface RequestItem {
  id: string;
  subject: string;
  type: string;
  requester: string;
  createdAt: string;
  status: 'Atendido' | 'Em Análise' | 'Pendente';
}

const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: '1',
    subject: 'Aconselhamento e Oração Familiar',
    type: 'Aconselhamento',
    requester: 'Érika Cristina Lacerda Laudino',
    createdAt: '04/07/2026',
    status: 'Em Análise',
  },
  {
    id: '2',
    subject: 'Pedido de Cesta Básica',
    type: 'Pedido de Cesta Básica',
    requester: 'Fernando Luiz Laudino Filho',
    createdAt: '08/07/2026',
    status: 'Atendido',
  },
  {
    id: '3',
    subject: 'Pedido de oração por saúde',
    type: 'Pedido de Oração',
    requester: 'Fernando Luiz Laudino Filho',
    createdAt: '08/07/2026',
    status: 'Atendido',
  },
  {
    id: '4',
    subject: 'Visita pastoral familiar',
    type: 'Visita Pastoral',
    requester: 'Marcos Vinícius de Souza',
    createdAt: '12/07/2026',
    status: 'Pendente',
  },
];

export const DevRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New request form state
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('Pedido de Oração');
  const [requester, setRequester] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !requester.trim()) return;

    const newItem: RequestItem = {
      id: Date.now().toString(),
      subject: subject.trim(),
      type,
      requester: requester.trim(),
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
    };

    setRequests([newItem, ...requests]);
    setSubject('');
    setRequester('');
    setModalOpen(false);
    showToast('Nova solicitação registrada com sucesso!');
  };

  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requester.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'todos' || item.type.toLowerCase().includes(filterType.toLowerCase());
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
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              Solicitações
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie os pedidos de oração, apoio social e atendimentos pastorais.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-950/20 active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>+ Nova Solicitação</span>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          {/* Input de Busca */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por assunto ou solicitante..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          {/* Select de Tipo */}
          <div className="sm:w-56">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-cyan-600 outline-none"
            >
              <option value="todos">Todos os tipos</option>
              <option value="oração">Oração</option>
              <option value="aconselhamento">Aconselhamento</option>
              <option value="cesta">Cesta Básica</option>
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
                <th className="py-3.5 px-4">Assunto</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Solicitante</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Inbox size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-slate-600">
                      Nenhuma solicitação encontrada
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ajuste os filtros ou crie uma nova solicitação acima.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-cyan-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {req.subject}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{req.type}</td>
                    <td className="py-3.5 px-4 font-semibold text-cyan-950">
                      {req.requester}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          req.status === 'Atendido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Em Análise'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{req.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Total: {filteredRequests.length} solicitações</span>
          <span>Exibindo 10 por página</span>
        </div>
      </div>

      {/* Modal Nova Solicitação */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-cyan-950/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">
                Nova Solicitação
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assunto da Solicitação *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Cesta básica emergencial, Oração por saúde..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Solicitação
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:border-cyan-600 outline-none"
                >
                  <option value="Pedido de Oração">Pedido de Oração</option>
                  <option value="Pedido de Cesta Básica">Pedido de Cesta Básica</option>
                  <option value="Aconselhamento">Aconselhamento</option>
                  <option value="Visita Pastoral">Visita Pastoral</option>
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

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider"
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
