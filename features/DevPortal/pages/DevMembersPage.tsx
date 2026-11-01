import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  User,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Heart,
  Shield,
  FileText
} from 'lucide-react';
import { useChurchStore } from '../../../store/churchStore';
import { ChurchMember, ChurchRole, ChurchMinistry } from '../../../types/church';

export const DevMembersPage: React.FC = () => {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    generateWhatsAppUrl
  } = useChurchStore();

  const [activeView, setActiveView] = useState<'lista' | 'formulario'>('lista');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Form State (Idêntico à Imagem 3 da Basiléia)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneWhatsApp: '',
    naturalidade: '',
    rg: '',
    isForeigner: 'Não',
    maritalStatus: 'CASADO(A)',
    gender: 'MASCULINO',
    spouse: '',
    profession: '',
    hasChildren: 'Não',
    isDonor: 'Não',
    bloodType: 'O+',
    isBaptized: 'Sim',
    baptismDate: '',
    isFirstTimeAcceptingJesus: false,
    isReconcilingWithJesus: false,
    interestsAndHobbies: '',
    role: 'Membro' as ChurchRole,
    ministry: 'Nenhum' as ChurchMinistry,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenNewForm = () => {
    setEditingMemberId(null);
    setFormData({
      fullName: '',
      phoneWhatsApp: '',
      naturalidade: '',
      rg: '',
      isForeigner: 'Não',
      maritalStatus: 'CASADO(A)',
      gender: 'MASCULINO',
      spouse: '',
      profession: '',
      hasChildren: 'Não',
      isDonor: 'Não',
      bloodType: 'O+',
      isBaptized: 'Sim',
      baptismDate: '',
      isFirstTimeAcceptingJesus: false,
      isReconcilingWithJesus: false,
      interestsAndHobbies: '',
      role: 'Membro',
      ministry: 'Nenhum',
    });
    setActiveView('formulario');
  };

  const handleEditMember = (m: ChurchMember) => {
    setEditingMemberId(m.id);
    setFormData({
      fullName: m.fullName || '',
      phoneWhatsApp: m.phoneWhatsApp || '',
      naturalidade: (m as any).naturalidade || '',
      rg: (m as any).rg || '',
      isForeigner: (m as any).isForeigner || 'Não',
      maritalStatus: (m as any).maritalStatus || 'CASADO(A)',
      gender: (m as any).gender || 'MASCULINO',
      spouse: (m as any).spouse || '',
      profession: (m as any).profession || '',
      hasChildren: (m as any).hasChildren || 'Não',
      isDonor: (m as any).isDonor || 'Não',
      bloodType: (m as any).bloodType || 'O+',
      isBaptized: m.baptismDate ? 'Sim' : 'Não',
      baptismDate: m.baptismDate || '',
      isFirstTimeAcceptingJesus: !!(m as any).isFirstTimeAcceptingJesus,
      isReconcilingWithJesus: !!(m as any).isReconcilingWithJesus,
      interestsAndHobbies: (m as any).interestsAndHobbies || '',
      role: m.role || 'Membro',
      ministry: m.ministry || 'Nenhum',
    });
    setActiveView('formulario');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phoneWhatsApp.trim()) {
      showToast('Por favor, preencha o Nome e o Celular WhatsApp.');
      return;
    }

    if (editingMemberId) {
      updateMember(editingMemberId, {
        fullName: formData.fullName.trim(),
        phoneWhatsApp: formData.phoneWhatsApp.trim(),
        baptismDate: formData.baptismDate || undefined,
        role: formData.role,
        ministry: formData.ministry,
        ...formData
      } as any);
      showToast(`Membro "${formData.fullName}" atualizado com sucesso!`);
    } else {
      addMember({
        fullName: formData.fullName.trim(),
        phoneWhatsApp: formData.phoneWhatsApp.trim(),
        baptismDate: formData.baptismDate || undefined,
        role: formData.role,
        ministry: formData.ministry,
        status: 'Ativo',
        ...formData
      } as any);
      showToast(`Membro "${formData.fullName}" cadastrado com sucesso!`);
    }

    setActiveView('lista');
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o cadastro de "${name}"?`)) {
      deleteMember(id);
      showToast(`Membro "${name}" excluído.`);
    }
  };

  // Filtragem da Lista
  const filteredMembers = members.filter((m) => {
    const term = search.toLowerCase();
    const matchSearch =
      m.fullName.toLowerCase().includes(term) ||
      m.phoneWhatsApp.includes(term) ||
      (m.ministry && m.ministry.toLowerCase().includes(term));
    const matchRole = roleFilter === 'todos' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Navegação entre Visualizações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('lista')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === 'lista'
                ? 'bg-[#082f38] text-cyan-200 shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users size={15} />
            <span>Lista de Membros ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewForm}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === 'formulario' && !editingMemberId
                ? 'bg-[#082f38] text-cyan-200 shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus size={15} />
            <span>Novo Cadastro</span>
          </button>
        </div>

        {activeView === 'formulario' && (
          <button
            type="button"
            onClick={() => setActiveView('lista')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Voltar para a Lista</span>
          </button>
        )}
      </div>

      {activeView === 'formulario' ? (
        /* --- FORMULÁRIO ESTILO BASILÉIA (IMAGEM 3) --- */
        <form onSubmit={handleSaveForm} className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            {/* Header da Seção */}
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <User size={20} className="text-[#082f38]" />
              <h3 className="text-base font-black tracking-tight text-slate-900">
                Informações Pessoais
              </h3>
            </div>

            {/* Grid Cadastral Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Nome Completo */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Nome completo do membro"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>

              {/* Celular / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Celular *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phoneWhatsApp}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneWhatsApp: e.target.value }))
                  }
                  placeholder="(11) 96427-5949"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
                <span className="block text-[10px] text-slate-400 mt-1">
                  * O número acima deve estar disponível para WhatsApp
                </span>
              </div>

              {/* Naturalidade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Naturalidade
                </label>
                <input
                  type="text"
                  value={formData.naturalidade}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, naturalidade: e.target.value }))
                  }
                  placeholder="Ex: São Paulo - SP"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* RG */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  RG
                </label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rg: e.target.value }))
                  }
                  placeholder="00.000.000-0"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* É Estrangeiro? */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  É estrangeiro?
                </label>
                <select
                  value={formData.isForeigner}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isForeigner: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              {/* Estado Civil */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado Civil
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, maritalStatus: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="CASADO(A)">CASADO(A)</option>
                  <option value="SOLTEIRO(A)">SOLTEIRO(A)</option>
                  <option value="DIVORCIADO(A)">DIVORCIADO(A)</option>
                  <option value="VIÚVO(A)">VIÚVO(A)</option>
                  <option value="UNIÃO ESTÁVEL">UNIÃO ESTÁVEL</option>
                </select>
              </div>

              {/* Sexo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sexo
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gender: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="MASCULINO">MASCULINO</option>
                  <option value="FEMININO">FEMININO</option>
                </select>
              </div>

              {/* Cônjuge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cônjuge
                </label>
                <input
                  type="text"
                  value={formData.spouse}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, spouse: e.target.value }))
                  }
                  placeholder="Nome do cônjuge se houver"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* Profissão */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profissão
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, profession: e.target.value }))
                  }
                  placeholder="Ex: Engenheiro, Professor, Autônomo..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* Tem filhos? */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tem filhos?
                </label>
                <select
                  value={formData.hasChildren}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hasChildren: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Não">Não</option>
                  <option value="Sim (1)">Sim (1)</option>
                  <option value="Sim (2)">Sim (2)</option>
                  <option value="Sim (3 ou mais)">Sim (3 ou mais)</option>
                </select>
              </div>

              {/* Doador de Sangue / Órgãos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doador
                </label>
                <select
                  value={formData.isDonor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isDonor: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              {/* Tipo Sanguíneo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo Sanguíneo
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bloodType: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Não sei">Não sei</option>
                </select>
              </div>

              {/* Batizado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batizado
                </label>
                <select
                  value={formData.isBaptized}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isBaptized: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              {/* Data de Batismo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data de Batismo
                </label>
                <input
                  type="date"
                  value={formData.baptismDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, baptismDate: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none"
                />
              </div>

              {/* Papel Eclesiástico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Função / Cargo na Igreja
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value as ChurchRole }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-cyan-600 outline-none"
                >
                  <option value="Membro">Membro</option>
                  <option value="Líder">Líder</option>
                  <option value="Pastor">Pastor</option>
                  <option value="Visitante">Visitante</option>
                  <option value="Criança">Criança / Infantil</option>
                </select>
              </div>
            </div>

            {/* Checkboxes de Vida Cristã (Idêntico ao Print 3) */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isFirstTimeAcceptingJesus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFirstTimeAcceptingJesus: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-[#082f38] focus:ring-cyan-500"
                />
                <span>Aceitando Jesus pela primeira vez</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isReconcilingWithJesus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isReconcilingWithJesus: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-[#082f38] focus:ring-cyan-500"
                />
                <span>Reconciliando com Jesus</span>
              </label>
            </div>

            {/* Áreas de Interesse / Hobbies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Áreas de Interesse / Hobbies
              </label>
              <textarea
                rows={3}
                value={formData.interestsAndHobbies}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    interestsAndHobbies: e.target.value,
                  }))
                }
                placeholder="Ex: Louvor, Mídia, Recepção, Ação Social, Esportes, Música..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-cyan-600 outline-none resize-y"
              />
            </div>

            {/* Ações do Formulário */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveView('lista')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-950/20 active:scale-95 transition-all"
              >
                <Save size={15} />
                <span>{editingMemberId ? 'Salvar Alterações' : 'Cadastrar Membro'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* --- VISUALIZAÇÃO EM TABELA CORPORATIVA LIMPA --- */
        <div className="space-y-4">
          {/* Barra de Filtros e Busca */}
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
                placeholder="Buscar por nome, telefone ou ministério..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div className="sm:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-cyan-600 outline-none"
              >
                <option value="todos">Todos os Cargos</option>
                <option value="Membro">Membro</option>
                <option value="Líder">Líder</option>
                <option value="Pastor">Pastor</option>
                <option value="Visitante">Visitante</option>
              </select>
            </div>
          </div>

          {/* Tabela de Membros */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Nome Completo</th>
                    <th className="py-3.5 px-4">WhatsApp / Celular</th>
                    <th className="py-3.5 px-4">Cargo / Função</th>
                    <th className="py-3.5 px-4">Estado Civil</th>
                    <th className="py-3.5 px-4">Batizado</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="font-bold text-sm text-slate-600">
                          Nenhum membro encontrado
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Clique em "+ Novo Cadastro" para adicionar pessoas à congregação.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const waUrl = generateWhatsAppUrl(m.id, 'ola');
                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-cyan-50/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-900 font-bold flex items-center justify-center shrink-0">
                                {m.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span>{m.fullName}</span>
                                {m.ministry && m.ministry !== 'Nenhum' && (
                                  <span className="block text-[10px] text-slate-400 font-medium">
                                    {m.ministry}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {m.phoneWhatsApp || 'Não informado'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                m.role === 'Pastor'
                                  ? 'bg-purple-100 text-purple-800'
                                  : m.role === 'Líder'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : m.role === 'Visitante'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {m.role || 'Membro'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {(m as any).maritalStatus || 'Casado(a)'}
                          </td>

                          <td className="py-3.5 px-4">
                            {m.baptismDate ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                <span>Sim</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">Não informado</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botão WhatsApp */}
                              {m.phoneWhatsApp && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  title="Conversar no WhatsApp"
                                >
                                  <MessageCircle size={15} />
                                </a>
                              )}

                              {/* Botão Editar / Ficha */}
                              <button
                                type="button"
                                onClick={() => handleEditMember(m)}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-cyan-900 transition-colors"
                                title="Ver Ficha / Editar"
                              >
                                <Edit2 size={15} />
                              </button>

                              {/* Botão Excluir */}
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(m.id, m.fullName)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Excluir"
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

            {/* Rodapé da Tabela */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span>Total: {filteredMembers.length} pessoas cadastradas</span>
              <span>Visualização Corporativa Manancial Gestão</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
