import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Save,
  MessageCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface CellGroup {
  id: string;
  name: string;
  leaderName: string;
  leaderPhone: string;
  hostName: string;
  neighborhood: string;
  address: string;
  meetingDay: string;
  meetingTime: string;
  category: 'Famílias' | 'Jovens' | 'Casais' | 'Mulheres' | 'Homens' | 'Mista';
  membersCount: number;
}

const STORAGE_KEY = 'manancial_church_cells';

const INITIAL_CELLS: CellGroup[] = [
  {
    id: '1',
    name: 'Célula Emanuel',
    leaderName: 'Carlos Eduardo da Silva',
    leaderPhone: '(11) 98765-4321',
    hostName: 'Família Veiga',
    neighborhood: 'Jardim das Flores',
    address: 'Rua das Acácias, 142',
    meetingDay: 'Quinta-feira',
    meetingTime: '20:00',
    category: 'Famílias',
    membersCount: 14,
  },
  {
    id: '2',
    name: 'Célula Betel (Jovens)',
    leaderName: 'Lucas Gabriel Moreira',
    leaderPhone: '(11) 97654-3210',
    hostName: 'Guilherme Smaniotto',
    neighborhood: 'Centro',
    address: 'Av. Brasil, 850 - Apto 42',
    meetingDay: 'Sexta-feira',
    meetingTime: '19:30',
    category: 'Jovens',
    membersCount: 18,
  },
  {
    id: '3',
    name: 'Célula Graça & Paz',
    leaderName: 'Pastora Ana Paula Correa',
    leaderPhone: '(11) 96543-2109',
    hostName: 'Milene Correa',
    neighborhood: 'Bela Vista',
    address: 'Rua Bela Cintra, 310',
    meetingDay: 'Terça-feira',
    meetingTime: '20:00',
    category: 'Mulheres',
    membersCount: 12,
  },
  {
    id: '4',
    name: 'Célula Aliança de Casais',
    leaderName: 'Marcos Vinícius & Juliana',
    leaderPhone: '(11) 95432-1098',
    hostName: 'Marcos Vinícius',
    neighborhood: 'Parque São Pedro',
    address: 'Rua dos Pinheiros, 77',
    meetingDay: 'Quarta-feira',
    meetingTime: '20:00',
    category: 'Casais',
    membersCount: 16,
  },
];

export const DevCellsPage: React.FC = () => {
  const [cells, setCells] = useState<CellGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler células:', e);
    }
    return INITIAL_CELLS;
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [hostName, setHostName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [meetingDay, setMeetingDay] = useState('Quinta-feira');
  const [meetingTime, setMeetingTime] = useState('20:00');
  const [category, setCategory] = useState<CellGroup['category']>('Famílias');
  const [membersCount, setMembersCount] = useState<number>(10);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cells));
    } catch (e) {
      console.error('Erro ao salvar células:', e);
    }
  }, [cells]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenNewModal = () => {
    setEditingId(null);
    setName('');
    setLeaderName('');
    setLeaderPhone('');
    setHostName('');
    setNeighborhood('');
    setAddress('');
    setMeetingDay('Quinta-feira');
    setMeetingTime('20:00');
    setCategory('Famílias');
    setMembersCount(10);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cell: CellGroup) => {
    setEditingId(cell.id);
    setName(cell.name);
    setLeaderName(cell.leaderName);
    setLeaderPhone(cell.leaderPhone);
    setHostName(cell.hostName);
    setNeighborhood(cell.neighborhood);
    setAddress(cell.address);
    setMeetingDay(cell.meetingDay);
    setMeetingTime(cell.meetingTime);
    setCategory(cell.category);
    setMembersCount(cell.membersCount);
    setModalOpen(true);
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !leaderName.trim()) {
      showToast('Por favor, preencha o Nome da Célula e o Líder.');
      return;
    }

    if (editingId) {
      setCells((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: name.trim(),
                leaderName: leaderName.trim(),
                leaderPhone: leaderPhone.trim(),
                hostName: hostName.trim(),
                neighborhood: neighborhood.trim(),
                address: address.trim(),
                meetingDay,
                meetingTime,
                category,
                membersCount: Number(membersCount) || 0,
              }
            : c
        )
      );
      showToast(`Célula "${name}" atualizada com sucesso!`);
    } else {
      const newCell: CellGroup = {
        id: Date.now().toString(),
        name: name.trim(),
        leaderName: leaderName.trim(),
        leaderPhone: leaderPhone.trim(),
        hostName: hostName.trim(),
        neighborhood: neighborhood.trim(),
        address: address.trim(),
        meetingDay,
        meetingTime,
        category,
        membersCount: Number(membersCount) || 0,
      };
      setCells([newCell, ...cells]);
      showToast(`Célula "${name}" cadastrada com sucesso!`);
    }

    setModalOpen(false);
  };

  const handleDeleteCell = (id: string, cellName: string) => {
    if (window.confirm(`Deseja realmente remover a "${cellName}"?`)) {
      setCells((prev) => prev.filter((c) => c.id !== id));
      showToast(`Célula "${cellName}" removida.`);
    }
  };

  const filteredCells = cells.filter((c) => {
    const term = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(term) ||
      c.leaderName.toLowerCase().includes(term) ||
      c.neighborhood.toLowerCase().includes(term);
    const matchCategory = categoryFilter === 'todas' || c.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalPeopleInCells = cells.reduce((acc, c) => acc + c.membersCount, 0);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header com Ações e KPIs */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers size={22} className="text-[#082f38]" />
              <span>Células & Grupos Familiares</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Gerencie os pequenos grupos da igreja, líderes, anfitriões e reuniões semanais.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNewModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-950/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>+ Nova Célula</span>
          </button>
        </div>

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Células Ativas
            </span>
            <span className="text-xl font-black text-slate-900">{cells.length}</span>
          </div>

          <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-100">
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">
              Pessoas em Célula
            </span>
            <span className="text-xl font-black text-cyan-950">{totalPeopleInCells}</span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Média por Grupo
            </span>
            <span className="text-xl font-black text-emerald-950">
              {cells.length > 0 ? Math.round(totalPeopleInCells / cells.length) : 0}
            </span>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
              Líderes Ativos
            </span>
            <span className="text-xl font-black text-purple-950">{cells.length}</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome da célula, líder ou bairro..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div className="sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-cyan-600 outline-none"
          >
            <option value="todas">Todas as Categorias</option>
            <option value="Famílias">Famílias</option>
            <option value="Jovens">Jovens</option>
            <option value="Casais">Casais</option>
            <option value="Mulheres">Mulheres</option>
            <option value="Homens">Homens</option>
            <option value="Mista">Mista</option>
          </select>
        </div>
      </div>

      {/* Tabela de Células */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Nome da Célula</th>
                <th className="py-3.5 px-4">Líder</th>
                <th className="py-3.5 px-4">Encontro Semanal</th>
                <th className="py-3.5 px-4">Localização / Bairro</th>
                <th className="py-3.5 px-4">Membros</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCells.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Layers size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-slate-600">Nenhuma célula encontrada</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Clique em "+ Nova Célula" para cadastrar os pequenos grupos.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCells.map((c) => {
                  const cleanPhone = c.leaderPhone.replace(/\D/g, '');
                  const waUrl = cleanPhone
                    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                        `Olá líder ${c.leaderName}! Graça e paz! Como estão as reuniões da ${c.name}?`
                      )}`
                    : null;

                  return (
                    <tr key={c.id} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0" />
                          <span>{c.name}</span>
                          <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 ml-1">
                            {c.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {c.leaderName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{c.meetingDay}</span>
                          <span className="text-slate-400 font-mono">às {c.meetingTime}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-cyan-700" />
                          <span className="font-medium text-slate-800">{c.neighborhood}</span>
                          <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
                            ({c.hostName})
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-cyan-950 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                          <Users size={12} className="text-cyan-700" />
                          <span>{c.membersCount}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Falar com o Líder no WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-cyan-900 transition-colors"
                            title="Editar Célula"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCell(c.id, c.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Excluir Célula"
                          >
                            <Trash2 size={15} />
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

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredCells.length} células cadastradas</span>
          <span>Manancial Gestão Eclesiástica</span>
        </div>
      </div>

      {/* Modal Nova / Editar Célula */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-cyan-950/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Layers size={18} className="text-[#082f38]" />
                <span>{editingId ? 'Editar Célula' : 'Cadastrar Nova Célula'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome da Célula *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Célula Betel, Célula Avivamento..."
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Líder *
                  </label>
                  <input
                    type="text"
                    required
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Líder responsável"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp do Líder
                  </label>
                  <input
                    type="tel"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Anfitrião da Casa
                  </label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Ex: Família Silva"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bairro / Região
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Centro, Bela Vista..."
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número e complemento"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dia da Reunião
                  </label>
                  <select
                    value={meetingDay}
                    onChange={(e) => setMeetingDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:border-cyan-600 outline-none"
                  >
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria da Célula
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CellGroup['category'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:border-cyan-600 outline-none"
                  >
                    <option value="Famílias">Famílias</option>
                    <option value="Jovens">Jovens</option>
                    <option value="Casais">Casais</option>
                    <option value="Mulheres">Mulheres</option>
                    <option value="Homens">Homens</option>
                    <option value="Mista">Mista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Participantes Médios
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={membersCount}
                    onChange={(e) => setMembersCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 outline-none"
                  />
                </div>
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider"
                >
                  <Save size={14} />
                  <span>Salvar Célula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
