import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ArrowLeft,
  Send,
  Cake,
  AlertTriangle,
  UserPlus,
  Clock,
  Copy,
  CheckCircle2,
  Edit3,
  Search,
  Sparkles,
  Phone
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { useChurchStore } from '../../../store/churchStore';
import { ChurchMember, WhatsAppTemplate } from '../../../types/church';

export const ChurchWhatsAppPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppStore();
  const { 
    members, 
    templates, 
    getBirthdaysThisWeek, 
    getAbsentMembersAlert, 
    generateWhatsAppUrl 
  } = useChurchStore();

  const [selectedCategory, setSelectedCategory] = useState<'Aniversário' | 'Ausência' | 'Boas-Vindas' | 'Lembrete'>('Aniversário');
  const [selectedMember, setSelectedMember] = useState<ChurchMember | null>(null);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState(false);

  const birthdays = getBirthdaysThisWeek();
  const absentMembers = getAbsentMembersAlert();
  const visitors = members.filter((m) => m.role === 'Visitante');

  // Seleciona a lista de membros de acordo com a categoria ativa
  const getCategoryMembers = () => {
    switch (selectedCategory) {
      case 'Aniversário':
        return birthdays.length > 0 ? birthdays : members.slice(0, 5);
      case 'Ausência':
        return absentMembers.length > 0 ? absentMembers : members.filter(m => (m.consecutiveAbsences || 0) > 0);
      case 'Boas-Vindas':
        return visitors.length > 0 ? visitors : members.slice(0, 4);
      case 'Lembrete':
      default:
        return members;
    }
  };

  const categoryMembers = getCategoryMembers();

  // Template ativo para a categoria
  const activeTemplate = templates.find((t) => t.category === selectedCategory) || templates[0];

  // Gera o preview da mensagem formatada com o nome do membro
  const formatMessageForMember = (member: ChurchMember | null, template: WhatsAppTemplate) => {
    const firstName = member ? member.fullName.split(' ')[0] : 'Irmão(ã)';
    return template.messageBody
      .replace(/\{\{nome\}\}/g, firstName)
      .replace(/\{\{culto\}\}/g, 'Culto da Família')
      .replace(/\{\{horario\}\}/g, '19:00');
  };

  const handleSelectMember = (member: ChurchMember) => {
    setSelectedMember(member);
    setCustomMessage(formatMessageForMember(member, activeTemplate));
  };

  // Se nenhum membro estiver selecionado, seleciona o primeiro
  React.useEffect(() => {
    if (categoryMembers.length > 0 && (!selectedMember || !categoryMembers.find(m => m.id === selectedMember.id))) {
      setSelectedMember(categoryMembers[0]);
      setCustomMessage(formatMessageForMember(categoryMembers[0], activeTemplate));
    }
  }, [selectedCategory, categoryMembers]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleSendWhatsApp = () => {
    if (!selectedMember) return;
    let cleanPhone = selectedMember.phoneWhatsApp.replace(/\D/g, '');
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = '55' + cleanPhone;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank');
  };

  const themeColors = {
    bg: isDarkMode ? 'bg-[#080d1a]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-[#11192e] border-slate-800' : 'bg-white border-slate-200',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col pb-28 ${themeColors.bg} transition-colors duration-500`}>
      
      {/* TOAST COPIADO */}
      {copiedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Mensagem copiada para a área de transferência!</span>
        </div>
      )}

      {/* HEADER */}
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
            <h1 className={`text-sm sm:text-base font-black ${themeColors.textMain}`}>Mensagens de Incentivo</h1>
            <p className={`text-[10px] sm:text-xs ${themeColors.textSec}`}>Disparos de WhatsApp em 1 Toque</p>
          </div>

          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto w-full px-4 pt-5 space-y-5">
        
        {/* SELETOR DE CATEGORIAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setSelectedCategory('Aniversário')}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              selectedCategory === 'Aniversário'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                : isDarkMode ? 'bg-[#11192e] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedCategory === 'Aniversário' ? 'bg-white/20' : 'bg-amber-500/10 text-amber-500'}`}>
              <Cake size={18} />
            </div>
            <div>
              <div className="text-xs font-black">Aniversariantes</div>
              <div className={`text-[10px] ${selectedCategory === 'Aniversário' ? 'text-amber-100' : 'text-slate-400'}`}>
                {birthdays.length} nesta semana
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedCategory('Ausência')}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              selectedCategory === 'Ausência'
                ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                : isDarkMode ? 'bg-[#11192e] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedCategory === 'Ausência' ? 'bg-white/20' : 'bg-rose-500/10 text-rose-500'}`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-xs font-black">Cuidado / Falta</div>
              <div className={`text-[10px] ${selectedCategory === 'Ausência' ? 'text-rose-100' : 'text-slate-400'}`}>
                {absentMembers.length} ausentes
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedCategory('Boas-Vindas')}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              selectedCategory === 'Boas-Vindas'
                ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                : isDarkMode ? 'bg-[#11192e] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedCategory === 'Boas-Vindas' ? 'bg-white/20' : 'bg-teal-500/10 text-teal-500'}`}>
              <UserPlus size={18} />
            </div>
            <div>
              <div className="text-xs font-black">Boas-Vindas</div>
              <div className={`text-[10px] ${selectedCategory === 'Boas-Vindas' ? 'text-teal-100' : 'text-slate-400'}`}>
                {visitors.length} visitantes
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedCategory('Lembrete')}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              selectedCategory === 'Lembrete'
                ? 'bg-cyan-600 text-white border-cyan-700 shadow-md'
                : isDarkMode ? 'bg-[#11192e] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedCategory === 'Lembrete' ? 'bg-white/20' : 'bg-cyan-500/10 text-cyan-500'}`}>
              <Clock size={18} />
            </div>
            <div>
              <div className="text-xs font-black">Lembrete de Culto</div>
              <div className={`text-[10px] ${selectedCategory === 'Lembrete' ? 'text-cyan-100' : 'text-slate-400'}`}>
                Toda a igreja
              </div>
            </div>
          </button>
        </div>

        {/* CONTAINER DUAS COLUNAS: LISTA DE DESTINATÁRIOS & PREVIEW DE DISPARO */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* COLUNA ESQUERDA: LISTA DE MEMBROS (4 COLS) */}
          <div className="md:col-span-5 space-y-2">
            <h3 className={`text-xs font-black uppercase tracking-wider px-1 ${themeColors.textSec}`}>
              Destinatários Sugeridos ({categoryMembers.length})
            </h3>

            <div className="space-y-2 max-h-[60dvh] overflow-y-auto pr-1">
              {categoryMembers.length === 0 ? (
                <div className={`p-6 text-center rounded-2xl border text-xs ${themeColors.card} ${themeColors.textSec}`}>
                  Nenhum irmão nesta lista no momento.
                </div>
              ) : (
                categoryMembers.map((member) => {
                  const isSelected = selectedMember?.id === member.id;

                  return (
                    <div
                      key={member.id}
                      onClick={() => handleSelectMember(member)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                          : isDarkMode 
                            ? 'bg-[#11192e] border-slate-800 hover:border-slate-700' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${
                            isSelected ? 'text-emerald-500' : themeColors.textMain
                          }`}>
                            {member.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={10} /> {member.phoneWhatsApp}
                          </div>
                        </div>

                        {selectedCategory === 'Ausência' && member.consecutiveAbsences && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500">
                            {member.consecutiveAbsences} faltas
                          </span>
                        )}

                        {selectedCategory === 'Aniversário' && member.birthDate && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                            {member.birthDate.split('-')[2]}/{member.birthDate.split('-')[1]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: PREVIEW DA MENSAGEM & BOTÃO DE ENVIO (7 COLS) */}
          <div className="md:col-span-7">
            <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${themeColors.card}`}>
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black ${themeColors.textMain}`}>
                      Mensagem para: {selectedMember ? selectedMember.fullName : 'Selecione um membro'}
                    </h4>
                    <p className={`text-[10px] ${themeColors.textSec}`}>
                      Personalizada automaticamente para envio via WhatsApp
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all ${
                    isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Copiar texto"
                >
                  <Copy size={13} /> Copiar
                </button>
              </div>

              {/* EDITOR / PREVIEW DO TEXTO */}
              <div className="mb-4">
                <label className={`block text-xs font-bold mb-1.5 ${themeColors.textSec}`}>
                  Texto que será enviado (pode editar à vontade):
                </label>
                <textarea
                  rows={8}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className={`w-full p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-emerald-50/30 border-emerald-200 text-slate-900'
                  }`}
                />
              </div>

              {/* BOTÃO GRANDE DE ENVIO DIRETO NO WHATSAPP */}
              <button
                disabled={!selectedMember}
                onClick={handleSendWhatsApp}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <Send size={18} /> Enviar Diretamente no WhatsApp de {selectedMember ? selectedMember.fullName.split(' ')[0] : ''}
              </button>

              <p className={`text-[11px] text-center mt-3 ${themeColors.textSec}`}>
                Ao clicar, o WhatsApp Web ou aplicativo abre imediatamente com a mensagem pronta. Não requer API paga!
              </p>

            </div>
          </div>

        </div>

      </main>

    </div>
  );
};
