import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  X, 
  Crown, 
  Briefcase, 
  Trophy, 
  User as UserIcon, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  Search,
  Sparkles,
  Eye
} from 'lucide-react';
import { useAppStore } from '../store';
import { useCurrentRole } from '../hooks/useCurrentRole';
import { UserRole } from '../types';

export const DevToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  const [isSelectingPerson, setIsSelectingPerson] = useState(false);
  
  const navigate = useNavigate();
  const { isDarkMode, people, devRole, setDevRole, simulatedPersonId, setSimulatedPersonId } = useAppStore();
  const { activeRole, simulatedPerson } = useCurrentRole();

  const rolesList: { role: UserRole; label: string; icon: any; color: string; desc: string; category: string }[] = [
    { 
      role: 'pastoral', 
      label: 'Pastor / Liderança', 
      icon: Crown, 
      color: 'bg-[#082f38] text-cyan-200 border border-cyan-500/40',
      desc: 'Gestão da igreja, solicitações e visão geral',
      category: 'Igreja (Principal)'
    },
    { 
      role: 'membro', 
      label: 'Membro da Igreja', 
      icon: UserIcon, 
      color: 'bg-teal-600 text-white',
      desc: 'Cultos da semana, pedidos de oração e comunicados',
      category: 'Igreja (Principal)'
    },
    { 
      role: 'gincana', 
      label: 'Coordenação Gincana', 
      icon: Trophy, 
      color: 'bg-orange-500 text-white',
      desc: 'Provas, jurados e homologação de notas',
      category: 'Sub-App Acampamento'
    },
    { 
      role: 'organizacao', 
      label: 'Caixa & Cantina', 
      icon: Briefcase, 
      color: 'bg-blue-600 text-white',
      desc: 'PDV cantina, entradas/saídas e estoque',
      category: 'Sub-App Acampamento'
    },
  ];

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(personSearch.toLowerCase())
  ).slice(0, 15);

  const handleRoleSelect = (role: UserRole) => {
    setDevRole(role);
    if (role === 'membro') {
      navigate('/igreja/membro');
    } else if (role === 'pastoral') {
      navigate('/');
    } else if (role === 'gincana') {
      navigate('/gincana/dash');
    } else if (role === 'organizacao') {
      navigate('/org/home');
    }
  };

  const currentRoleConfig = rolesList.find(r => r.role === activeRole) || rolesList[0];

  return (
    <>
      {/* Floating Pill Trigger */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-2xl backdrop-blur-xl border transition-all active:scale-95 ${
            isDarkMode 
              ? 'bg-[#151b2b]/90 border-white/20 text-white hover:bg-[#1a233a]' 
              : 'bg-gray-900/90 border-gray-700 text-white hover:bg-black'
          }`}
          title="Abrir Modo Desenvolvedor"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs">
            <Wrench size={13} />
          </div>
          <span className="text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5">
            Dev: <span className="text-cyan-300 font-bold">{currentRoleConfig.label}</span>
          </span>
          {activeRole === 'membro' && simulatedPerson && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full truncate max-w-[90px]">
              {simulatedPerson.name.split(' ')[0]}
            </span>
          )}
        </button>
      </div>

      {/* Dev Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-md rounded-3xl border shadow-2xl p-5 md:p-6 overflow-hidden transition-all max-h-[90dvh] flex flex-col ${
              isDarkMode ? 'bg-[#121826] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">
                    Modo Desenvolvedor
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Role Switcher
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Alterne entre perfis para testar fluxos</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Container (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {/* Role Cards */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                  1. Selecione o Papel (Role Ativo)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {rolesList.map((r) => {
                    const isSelected = activeRole === r.role;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSelect(r.role)}
                        className={`flex flex-col text-left p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? isDarkMode
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 ring-2 ring-cyan-500/20'
                              : 'bg-cyan-50 border-cyan-400 text-cyan-900 ring-2 ring-cyan-200'
                            : isDarkMode
                              ? 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                              : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className={`w-7 h-7 rounded-lg ${r.color} flex items-center justify-center text-xs shadow-sm`}>
                            <Icon size={14} />
                          </div>
                          {isSelected && <Check size={14} className="text-cyan-400" />}
                        </div>
                        <span className="font-black text-xs">{r.label}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Impersonate Member (Only visible if role === 'membro') */}
              {activeRole === 'membro' && (
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Eye size={13} />
                      Simular Membro Específico
                    </label>
                    <button
                      onClick={() => setIsSelectingPerson(!isSelectingPerson)}
                      className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {isSelectingPerson ? 'Fechar Lista' : 'Trocar Participante'}
                      <ChevronDown size={12} className={`transition-transform ${isSelectingPerson ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {simulatedPerson ? (
                    <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl">
                      <div>
                        <div className="font-black text-xs text-white">{simulatedPerson.name}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span className="uppercase font-bold text-emerald-400">
                            Equipe: {simulatedPerson.teamId || 'Sem equipe'}
                          </span>
                          <span>•</span>
                          <span className={simulatedPerson.paymentStatus === 'PAGO' ? 'text-emerald-300' : 'text-amber-400 font-bold'}>
                            {simulatedPerson.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Nenhum membro selecionado.</p>
                  )}

                  {/* Dropdown / Search for Person */}
                  {isSelectingPerson && (
                    <div className="mt-3 space-y-2 border-t border-emerald-500/20 pt-2 animate-in fade-in">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={personSearch}
                          onChange={(e) => setPersonSearch(e.target.value)}
                          placeholder="Buscar entre os inscritos..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                        {filteredPeople.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSimulatedPersonId(p.id);
                              setIsSelectingPerson(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              simulatedPerson?.id === p.id 
                                ? 'bg-emerald-500 text-white font-bold' 
                                : 'hover:bg-white/10 text-gray-300'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            <span className="text-[10px] opacity-75 shrink-0 ml-2">
                              {p.teamId !== 'none' ? p.teamId : 'Sem equipe'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Navigation Shortcuts */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                  2. Atalhos Rápidos de Tela
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      navigate('/dev/igreja');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-left text-xs font-bold flex items-center justify-between text-cyan-300 transition-colors border border-cyan-500/30"
                  >
                    <span>🏛️ Portal de Gestão (Pastor)</span>
                    <ExternalLink size={12} className="opacity-80" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/igreja/membro');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-left text-xs font-bold flex items-center justify-between text-teal-300 transition-colors border border-teal-500/30"
                  >
                    <span>👤 Espaço do Membro</span>
                    <ExternalLink size={12} className="opacity-80" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/gestao/membros');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-left text-xs font-bold flex items-center justify-between text-cyan-400 transition-colors"
                  >
                    <span>👥 Membros & Pessoas</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/gestao/presenca');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-left text-xs font-bold flex items-center justify-between text-teal-400 transition-colors"
                  >
                    <span>📲 Presença & Check-in WhatsApp</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/gestao/mensagens');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-left text-xs font-bold flex items-center justify-between text-emerald-400 transition-colors"
                  >
                    <span>💬 Mensagens WhatsApp em 1 Toque</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/gestao/relatorios');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-left text-xs font-bold flex items-center justify-between text-indigo-400 transition-colors"
                  >
                    <span>📊 Relatórios de Frequência</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/acampamento');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-left text-xs font-bold flex items-center justify-between text-teal-300 transition-colors border border-teal-500/30"
                  >
                    <span>⛺ Acampamento Manancial (/acampamento)</span>
                    <ExternalLink size={12} className="opacity-80" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/org/home');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-left text-xs font-bold flex items-center justify-between text-blue-400 transition-colors"
                  >
                    <span>💼 Organização / Caixa</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/gincana/dash');
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-left text-xs font-bold flex items-center justify-between text-orange-400 transition-colors"
                  >
                    <span>🏆 Placar / Gincana</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer with Reset */}
            <div className="pt-4 border-t border-gray-200/10 mt-2 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">
                Active: {activeRole.toUpperCase()}
              </span>
              <button
                onClick={() => {
                  setDevRole('pastoral');
                  setSimulatedPersonId(null);
                  navigate('/');
                  setIsOpen(false);
                }}
                className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors"
              >
                Resetar para Pastoral
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
