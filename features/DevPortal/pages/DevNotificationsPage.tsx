import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  CheckCircle2,
  Smartphone,
  Send,
  X
} from 'lucide-react';

interface NotificationLog {
  id: string;
  subject: string;
  method: string;
  status: 'Sucesso' | 'Pendente' | 'Falha';
  sentAt: string;
  createdAt: string;
}

const INITIAL_LOGS: NotificationLog[] = [
  {
    id: '1',
    subject: 'Acesso Liberado!',
    method: 'WhatsApp',
    status: 'Sucesso',
    sentAt: '12/06/2026',
    createdAt: '13/06/2026, 11:20',
  },
  {
    id: '2',
    subject: 'Vem aí o Acampamento 2026!',
    method: 'WhatsApp',
    status: 'Sucesso',
    sentAt: '04/07/2026, 18:30',
    createdAt: '04/07/2026, 10:15',
  },
  {
    id: '3',
    subject: 'Lembrete: Culto da Família amanhã',
    method: 'WhatsApp',
    status: 'Sucesso',
    sentAt: '03/07/2026',
    createdAt: '04/07/2026, 17:00',
  },
  {
    id: '4',
    subject: 'Pedido de Cesta Básica recebido',
    method: 'WhatsApp',
    status: 'Sucesso',
    sentAt: '07/07/2026',
    createdAt: '08/07/2026, 12:40',
  },
];

export const DevNotificationsPage: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLog[]>(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newLog: NotificationLog = {
      id: Date.now().toString(),
      subject: newSubject.trim(),
      method: 'WhatsApp',
      status: 'Sucesso',
      sentAt: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setLogs([newLog, ...logs]);
    setNewSubject('');
    setModalOpen(false);
    showToast('Notificação WhatsApp enviada com sucesso!');
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || log.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header com Instrução WhatsApp */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              Notificações
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Envio automatizado de mensagens e lembretes para a igreja via WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-950/20 active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>+ Nova Notificação</span>
          </button>
        </div>

        {/* Banner de dispositivo conectado */}
        <div className="p-3 bg-cyan-50/70 border border-cyan-200/80 rounded-xl flex items-center gap-2.5 text-xs text-cyan-950 font-medium">
          <Smartphone size={16} className="text-cyan-700 shrink-0" />
          <span>
            Dispositivo WhatsApp conectado:{' '}
            <strong className="text-cyan-900 font-bold">+55 (11) 98765-4321 (Instância Ativa)</strong>
          </span>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por assunto..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-cyan-600 outline-none"
            >
              <option value="todos">Filtrar por status</option>
              <option value="sucesso">Sucesso</option>
              <option value="pendente">Pendente</option>
              <option value="falha">Falha</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Notificações */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Assunto</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Data do Envio</th>
                <th className="py-3.5 px-4">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-slate-600">
                      Nenhuma notificação encontrada
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-cyan-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {log.subject}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {log.method}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{log.sentAt}</td>
                    <td className="py-3.5 px-4 text-slate-400">{log.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Disparo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-cyan-950/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">
                Disparar Notificação por WhatsApp
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título / Assunto da Mensagem *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex: Lembrete Culto dos Jovens"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Canal de Envio
                </label>
                <input
                  type="text"
                  disabled
                  value="WhatsApp API Oficial (Ativo)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500"
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider"
                >
                  <Send size={13} />
                  <span>Disparar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
