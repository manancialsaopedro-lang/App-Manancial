import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Cake,
  AlertTriangle,
  UserPlus,
  Clock,
  Copy,
  CheckCircle2,
  Search,
  Sparkles,
  Phone,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useChurchStore } from '../../../store/churchStore';
import { ChurchMember, WhatsAppTemplate } from '../../../types/church';

export const DevWhatsAppMessagesPage: React.FC = () => {
  const {
    members,
    templates,
    getBirthdaysThisWeek,
    getAbsentMembersAlert,
    generateWhatsAppUrl
  } = useChurchStore();

  const [selectedCategory, setSelectedCategory] = useState<'Aniversário' | 'Ausência' | 'Boas-Vindas' | 'Lembrete'>('Aniversário');
  const [selectedMember, setSelectedMember] = useState<ChurchMember | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const birthdays = getBirthdaysThisWeek();
  const absentMembers = getAbsentMembersAlert();
  const visitors = members.filter((m) => m.role === 'Visitante');

  const getCategoryMembers = () => {
    switch (selectedCategory) {
      case 'Aniversário':
        return birthdays.length > 0 ? birthdays : members.slice(0, 5);
      case 'Ausência':
        return absentMembers.length > 0 ? absentMembers : members.filter((m) => (m.consecutiveAbsences || 0) > 0);
      case 'Boas-Vindas':
        return visitors.length > 0 ? visitors : members.slice(0, 4);
      case 'Lembrete':
      default:
        return members;
    }
  };

  const categoryMembers = getCategoryMembers();
  const activeTemplate = templates.find((t) => t.category === selectedCategory) || templates[0];

  const formatMessageForMember = (member: ChurchMember | null, template: WhatsAppTemplate) => {
    const firstName = member ? member.fullName.split(' ')[0] : 'Irmão(ã)';
    return template.messageBody
      .replace(/\{\{nome\}\}/g, firstName)
      .replace(/\{\{culto\}\}/g, 'Culto de Celebração')
      .replace(/\{\{horario\}\}/g, '19:30');
  };

  const currentMember = selectedMember || categoryMembers[0] || null;
  const currentFormattedText = activeTemplate
    ? formatMessageForMember(currentMember, activeTemplate)
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFormattedText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleSendToMember = (member: ChurchMember) => {
    const waUrl = generateWhatsAppUrl(
      member.id,
      selectedCategory === 'Aniversário'
        ? 'aniversario'
        : selectedCategory === 'Ausência'
        ? 'ausencia'
        : selectedCategory === 'Boas-Vindas'
        ? 'visitante'
        : 'lembrete'
    );
    window.open(waUrl, '_blank');
  };

  const categories: { id: 'Aniversário' | 'Ausência' | 'Boas-Vindas' | 'Lembrete'; label: string; icon: any; count: number }[] = [
    { id: 'Aniversário', label: 'Aniversariantes', icon: Cake, count: birthdays.length },
    { id: 'Ausência', label: 'Membros Ausentes', icon: AlertTriangle, count: absentMembers.length },
    { id: 'Boas-Vindas', label: 'Novos Visitantes', icon: UserPlus, count: visitors.length },
    { id: 'Lembrete', label: 'Lembrete Geral', icon: Clock, count: members.length },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {copiedToast && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">Mensagem copiada para a área de transferência!</span>
        </div>
      )}

      {/* Header com Categorias de Disparo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare size={22} className="text-emerald-600" />
            <span>Mensagens WhatsApp em 1 Toque</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Envie mensagens personalizadas e acolhedoras diretamente para os membros pelo WhatsApp.
          </p>
        </div>

        {/* Abas de Categorias */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedMember(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#082f38] border-cyan-900 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className={isSelected ? 'text-cyan-300' : 'text-slate-500'} />
                  <span className="text-xs font-bold">{cat.label}</span>
                </div>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-cyan-500 text-cyan-950' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Principal: Lista de Membros à Esquerda + Preview à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna 1: Membros Sugeridos */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Destinatários Sugeridos ({categoryMembers.length})
            </span>
            <span className="text-[10px] text-slate-400">Toque para selecionar</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto custom-scrollbar">
            {categoryMembers.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 size={30} className="mx-auto mb-2 text-emerald-500" />
                <p className="font-bold text-xs text-slate-600">Nenhum membro nesta categoria no momento.</p>
              </div>
            ) : (
              categoryMembers.map((m) => {
                const isCurrent = currentMember?.id === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isCurrent ? 'bg-cyan-50/70 border-l-4 border-cyan-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block">
                        {m.fullName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {m.phoneWhatsApp || 'Sem telefone'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendToMember(m);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Send size={12} />
                      <span>Enviar</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 2: Preview da Mensagem */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Preview da Mensagem
              </span>
              <span className="text-xs font-bold text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded">
                Para: {currentMember?.fullName || 'Irmão(ã)'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {currentFormattedText}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Copy size={14} />
              <span>Copiar Texto</span>
            </button>

            {currentMember && currentMember.phoneWhatsApp && (
              <button
                type="button"
                onClick={() => handleSendToMember(currentMember)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Abrir no WhatsApp</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
