import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  ArrowLeft,
  Phone,
  Clock,
  Send,
  User,
  Edit2,
  Trash2,
  Save,
  X,
  Copy,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Heart,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { useChurchStore } from '../../../store/churchStore';
import { ChurchMember, ChurchRole, ChurchMinistry } from '../../../types/church';

const FAMILY_LABELS: Record<string, string> = {
  'fam-veiga': 'Família Veiga',
  'fam-smaniotto': 'Família Smaniotto',
  'fam-correa': 'Família Correa / Milene',
};

export const ChurchMembersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppStore();
  const { 
    members, 
    addMember, 
    updateMember, 
    deleteMember, 
    generateWhatsAppUrl, 
    getRegistrationInviteUrl, 
    generateInviteWhatsAppUrl,
    syncWithSupabase
  } = useChurchStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [regStatusFilter, setRegStatusFilter] = useState<'todos' | 'pendente' | 'concluido'>('todos');
  const [selectedMember, setSelectedMember] = useState<ChurchMember | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ChurchMember>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync com Supabase no carregamento da tela
  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = (member: ChurchMember, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getRegistrationInviteUrl(member);
    navigator.clipboard.writeText(url);
    setCopiedId(member.id);
    showToast(`Link de cadastro de ${member.fullName.split(' ')[0]} copiado!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithSupabase();
    setIsSyncing(false);
    showToast('Base sincronizada com a nuvem!');
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.phoneWhatsApp.includes(search) ||
      (m.ministry && m.ministry.toLowerCase().includes(search.toLowerCase())) ||
      (m.familyGroupId && FAMILY_LABELS[m.familyGroupId]?.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'todos' || m.role === roleFilter;

    const matchesRegStatus = 
      regStatusFilter === 'todos' ||
      (regStatusFilter === 'pendente' && m.registrationStatus !== 'CONCLUIDO') ||
      (regStatusFilter === 'concluido' && m.registrationStatus === 'CONCLUIDO');

    return matchesSearch && matchesRole && matchesRegStatus;
  });

  const handleOpenMember = (member: ChurchMember) => {
    setSelectedMember(member);
    setEditFormData(member);
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    updateMember(selectedMember.id, editFormData);
    setSelectedMember({ ...selectedMember, ...editFormData } as ChurchMember);
    setIsEditing(false);
    showToast('Ficha do membro atualizada com sucesso!');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente remover ${name} do cadastro?`)) {
      deleteMember(id);
      setSelectedMember(null);
      showToast('Membro removido do cadastro.');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.fullName || !editFormData.phoneWhatsApp) return;

    addMember({
      fullName: editFormData.fullName,
      phoneWhatsApp: editFormData.phoneWhatsApp,
      role: (editFormData.role as ChurchRole) || 'Membro',
      ministry: (editFormData.ministry as ChurchMinistry) || 'Nenhum',
      status: editFormData.status || 'Ativo',
      birthDate: editFormData.birthDate,
      baptismDate: editFormData.baptismDate,
      address: editFormData.address,
      pastoralNotes: editFormData.pastoralNotes,
      registrationStatus: 'PENDENTE'
    });

    setIsCreateOpen(false);
    setEditFormData({});
    showToast(`Membro "${editFormData.fullName}" cadastrado com sucesso!`);
  };

  const themeColors = {
    bg: isDarkMode ? 'bg-[#080d1a]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-[#11192e] border-slate-800' : 'bg-white border-slate-200',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  // Estatísticas rápidas
  const totalCount = members.length;
  const pendingCount = members.filter((m) => m.registrationStatus !== 'CONCLUIDO').length;
  const completedCount = members.filter((m) => m.registrationStatus === 'CONCLUIDO').length;

  return (
    <div className={`min-h-[100dvh] flex flex-col pb-28 ${themeColors.bg} transition-colors duration-500`}>
      
      {/* TOAST FLUTUANTE */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOPBAR */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        isDarkMode ? 'bg-[#0b1224]/85 border-slate-800' : 'bg-white/85 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
              isDarkMode ? 'text-cyan-400 hover:bg-slate-800' : 'text-cyan-700 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft size={16} /> Início
          </button>

          <div className="text-center">
            <h1 className={`text-sm sm:text-base font-black ${themeColors.textMain}`}>Membros & Pessoas</h1>
            <p className={`text-[10px] sm:text-xs ${themeColors.textSec}`}>Igreja Evangélica Manancial</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="Sincronizar com a nuvem"
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                isDarkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin text-cyan-400' : ''} />
            </button>

            <button
              onClick={() => {
                setEditFormData({ role: 'Membro', ministry: 'Nenhum', status: 'Ativo' });
                setIsCreateOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-cyan-600/20 hover:scale-105 transition-transform"
            >
              <Plus size={15} /> Novo
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto w-full px-4 pt-5 space-y-4">
        
        {/* BANNER DE STATUS DO CADASTRAMENTO */}
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDarkMode ? 'bg-[#11192e] border-slate-800' : 'bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className={`text-xs sm:text-sm font-black ${themeColors.textMain}`}>
                Atualização e Finalização de Cadastro
              </h3>
              <p className={`text-[11px] sm:text-xs ${themeColors.textSec}`}>
                Envie os links especiais por WhatsApp para os membros preencherem seus dados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="text-center px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] uppercase font-bold text-amber-500 block">Pré-Cadastros</span>
              <span className="text-sm font-black text-amber-500">{pendingCount}</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block">Concluídos</span>
              <span className="text-sm font-black text-emerald-500">{completedCount}</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-[10px] uppercase font-bold text-cyan-500 block">Total</span>
              <span className="text-sm font-black text-cyan-500">{totalCount}</span>
            </div>
          </div>
        </div>

        {/* BUSCA E FILTROS */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeColors.textSec}`} />
              <input
                type="text"
                placeholder="Buscar por nome, WhatsApp, família ou ministério..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
                  isDarkMode ? 'bg-[#11192e] border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* FILTRO DE STATUS DE CADASTRO */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setRegStatusFilter('todos')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  regStatusFilter === 'todos'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Todos ({totalCount})
              </button>

              <button
                onClick={() => setRegStatusFilter('pendente')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  regStatusFilter === 'pendente'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <Clock size={12} /> Pré-cadastros ({pendingCount})
              </button>

              <button
                onClick={() => setRegStatusFilter('concluido')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  regStatusFilter === 'concluido'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <CheckCircle2 size={12} /> Concluídos ({completedCount})
              </button>
            </div>
          </div>

          {/* FILTRO DE FUNÇÕES ECLESIÁSTICAS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['todos', 'Membro', 'Líder', 'Pastor', 'Presbítero', 'Diácono', 'Visitante'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  roleFilter === role
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-800/80 text-slate-400 hover:text-white'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {role === 'todos' ? 'Todas Funções' : role}
              </button>
            ))}
          </div>
        </div>

        {/* CONTADOR DE RESULTADOS */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{filteredMembers.length} {filteredMembers.length === 1 ? 'membro exibido' : 'membros exibidos'}</span>
          <span>Base oficial da Igreja Manancial</span>
        </div>

        {/* LISTA DE CARDS DE MEMBROS */}
        {filteredMembers.length === 0 ? (
          <div className={`p-10 text-center rounded-3xl border ${themeColors.card}`}>
            <Users size={36} className="mx-auto mb-3 text-slate-400 opacity-60" />
            <h4 className={`text-sm font-bold ${themeColors.textMain}`}>Nenhum membro encontrado</h4>
            <p className={`text-xs mt-1 ${themeColors.textSec}`}>Tente buscar com outro termo ou ajuste os filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMembers.map((member) => {
              const isCompleted = member.registrationStatus === 'CONCLUIDO';
              const inviteWaUrl = generateInviteWhatsAppUrl(member);
              const familyName = member.familyGroupId ? FAMILY_LABELS[member.familyGroupId] : null;

              return (
                <div
                  key={member.id}
                  onClick={() => handleOpenMember(member)}
                  className={`p-4 rounded-3xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] hover:border-cyan-500/50 flex flex-col justify-between ${themeColors.card}`}
                >
                  <div>
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                          {member.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-bold truncate ${themeColors.textMain}`}>{member.fullName}</h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                              {member.role}
                            </span>
                            {member.ministry && member.ministry !== 'Nenhum' && (
                              <span className="text-[10px] font-medium text-slate-400 truncate">
                                • {member.ministry}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Badge de Status de Cadastro */}
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 shrink-0 flex items-center gap-1 border border-emerald-500/20">
                          <CheckCircle2 size={10} /> Concluído
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 shrink-0 flex items-center gap-1 border border-amber-500/20">
                          <Clock size={10} /> Pré-cadastro
                        </span>
                      )}
                    </div>

                    {/* Família e telefone */}
                    <div className="space-y-1 mb-3">
                      {familyName && (
                        <div className="text-[11px] text-cyan-500 dark:text-cyan-400 font-bold flex items-center gap-1">
                          <span>👨‍👩‍👧‍👦 {familyName}</span>
                        </div>
                      )}
                      <div className={`flex items-center gap-1.5 text-xs ${themeColors.textSec}`}>
                        <Phone size={12} className="shrink-0" />
                        <span>{member.phoneWhatsApp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barra Inferior com Ações de Link e WhatsApp */}
                  <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(member, e)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
                        copiedId === member.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : isDarkMode
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Copiar link especial de cadastro"
                    >
                      {copiedId === member.id ? (
                        <>
                          <CheckCircle2 size={12} /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Link
                        </>
                      )}
                    </button>

                    <a
                      href={inviteWaUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-transform hover:scale-105"
                      title="Enviar convite de cadastro pelo WhatsApp"
                    >
                      <Send size={12} />
                      <span>{isCompleted ? 'WhatsApp' : 'Enviar Link'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL: FICHA DETALHADA DO MEMBRO */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`max-w-lg w-full max-h-[90dvh] overflow-y-auto p-6 rounded-3xl border shadow-2xl ${themeColors.card}`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-cyan-500">
                <User size={20} />
                <h3 className={`text-base font-black ${themeColors.textMain}`}>
                  {isEditing ? 'Editar Ficha do Membro' : 'Ficha Eclesiástica Individual'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className={`p-1.5 rounded-xl ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <X size={18} />
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={editFormData.phoneWhatsApp || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phoneWhatsApp: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Data de Nascimento</label>
                    <input
                      type="date"
                      value={editFormData.birthDate || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Função</label>
                    <select
                      value={editFormData.role || 'Membro'}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="Pastor">Pastor</option>
                      <option value="Presbítero">Presbítero</option>
                      <option value="Diácono">Diácono</option>
                      <option value="Líder">Líder</option>
                      <option value="Membro">Membro</option>
                      <option value="Congregado">Congregado</option>
                      <option value="Visitante">Visitante</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Status de Cadastro</label>
                    <select
                      value={editFormData.registrationStatus || 'PENDENTE'}
                      onChange={(e) => setEditFormData({ ...editFormData, registrationStatus: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="PENDENTE">Pré-cadastro (Pendente)</option>
                      <option value="CONCLUIDO">Cadastro Concluído</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Ministério</label>
                    <select
                      value={editFormData.ministry || 'Nenhum'}
                      onChange={(e) => setEditFormData({ ...editFormData, ministry: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="Nenhum">Nenhum</option>
                      <option value="Louvor">Louvor</option>
                      <option value="Recepção">Recepção</option>
                      <option value="Infantil">Infantil</option>
                      <option value="Mídia & Som">Mídia & Som</option>
                      <option value="Intercessão">Intercessão</option>
                      <option value="Diaconia">Diaconia</option>
                      <option value="Jovens">Jovens</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Endereço</label>
                    <input
                      type="text"
                      placeholder="Rua, número, bairro..."
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Anotações Pastorais Confidenciais</label>
                  <textarea
                    rows={3}
                    placeholder="Observações de acompanhamento, orações, histórico familiar..."
                    value={editFormData.pastoralNotes || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, pastoralNotes: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-600 text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save size={14} /> Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                    {selectedMember.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className={`text-base font-black ${themeColors.textMain}`}>{selectedMember.fullName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        {selectedMember.role}
                      </span>
                      <span className="text-xs text-slate-400">• {selectedMember.ministry}</span>
                    </div>
                  </div>
                </div>

                {/* BLOCO DE LINK EXCLUSIVO DE CADASTRO */}
                <div className={`p-4 rounded-2xl border ${
                  selectedMember.registrationStatus === 'CONCLUIDO'
                    ? isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-emerald-50/60 border-emerald-200'
                    : isDarkMode ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50/60 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-cyan-500">
                      <LinkIcon size={14} /> Link Exclusivo de Cadastro
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedMember.registrationStatus === 'CONCLUIDO'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedMember.registrationStatus === 'CONCLUIDO' ? 'Concluído' : 'Aguardando preenchimento'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getRegistrationInviteUrl(selectedMember)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs border font-mono truncate ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    />
                    <button
                      onClick={(e) => handleCopyLink(selectedMember, e)}
                      className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Copy size={13} /> Copiar
                    </button>
                  </div>
                </div>

                {/* Métricas do membro */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                    <div className="text-[11px] text-slate-400 font-bold uppercase">Família</div>
                    <div className={`text-xs font-bold mt-1 ${themeColors.textMain}`}>
                      {selectedMember.familyGroupId ? (FAMILY_LABELS[selectedMember.familyGroupId] || selectedMember.familyGroupId) : 'Não vinculada'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                    <div className="text-[11px] text-slate-400 font-bold uppercase">Aniversário</div>
                    <div className={`text-xs font-bold mt-1 ${themeColors.textMain}`}>
                      {selectedMember.birthDate || 'Não cadastrado'}
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                {selectedMember.address && (
                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                    <div className="text-[11px] text-slate-400 font-bold uppercase">Endereço Residencial</div>
                    <div className={`text-xs mt-1 ${themeColors.textMain}`}>
                      {selectedMember.address}
                    </div>
                  </div>
                )}

                {/* Notas pastorais */}
                {selectedMember.pastoralNotes && (
                  <div className={`p-3.5 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-cyan-50/50 border-cyan-100'
                  }`}>
                    <div className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                      Observação Pastoral
                    </div>
                    <p className={`text-xs ${themeColors.textSec} leading-relaxed`}>
                      "{selectedMember.pastoralNotes}"
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDelete(selectedMember.id, selectedMember.fullName)}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={15} /> Excluir
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                        isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Edit2 size={14} /> Editar
                    </button>

                    <a
                      href={generateInviteWhatsAppUrl(selectedMember)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Send size={14} /> Chamar no WhatsApp
                    </a>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: NOVO MEMBRO */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl ${themeColors.card}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className={`text-base font-black ${themeColors.textMain}`}>Cadastrar Membro da Igreja</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do irmão(ã)"
                  value={editFormData.fullName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>WhatsApp (com DDD) *</label>
                <input
                  type="tel"
                  required
                  placeholder="(19) 99999-9999"
                  value={editFormData.phoneWhatsApp || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneWhatsApp: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Função</label>
                  <select
                    value={editFormData.role || 'Membro'}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Membro">Membro</option>
                    <option value="Líder">Líder</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Presbítero">Presbítero</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Congregado">Congregado</option>
                    <option value="Visitante">Visitante</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${themeColors.textMain}`}>Ministério</label>
                  <select
                    value={editFormData.ministry || 'Nenhum'}
                    onChange={(e) => setEditFormData({ ...editFormData, ministry: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Nenhum">Nenhum</option>
                    <option value="Louvor">Louvor</option>
                    <option value="Recepção">Recepção</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Mídia & Som">Mídia & Som</option>
                    <option value="Intercessão">Intercessão</option>
                    <option value="Diaconia">Diaconia</option>
                    <option value="Jovens">Jovens</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-600 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs"
                >
                  Salvar Pré-cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
