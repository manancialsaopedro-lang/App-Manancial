import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Church,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Tent,
  ArrowRight,
  Send,
  CheckCircle2,
  X,
  Sparkles,
  MapPin,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useCurrentRole } from '../../hooks/useCurrentRole';

interface WorshipItem {
  day: string;
  time: string;
  title: string;
}

const DEFAULT_SCHEDULES: WorshipItem[] = [
  { day: 'Domingo', time: '09:30', title: 'Culto da Família & Ceia' },
  { day: 'Domingo', time: '18:00', title: 'Culto de Celebração & Jovens' },
  { day: 'Quarta-feira', time: '19:30', title: 'Culto da Palavra & Oração' },
  { day: 'Sábado', time: '19:00', title: 'Rede de Jovens / Células' },
];

export const ChurchMemberHome: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useAppStore();
  const { simulatedPerson } = useCurrentRole();

  const [modalOpen, setModalOpen] = useState(false);
  const [requestSubject, setRequestSubject] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [requestType, setRequestType] = useState('Pedido de Oração');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Read schedules from church configuration if saved
  const schedules: WorshipItem[] = (() => {
    try {
      const saved = localStorage.getItem('manancial_dev_church_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schedules && parsed.schedules.length > 0) {
          return parsed.schedules.map((s: any) => ({
            day: s.dayOfWeek,
            time: s.time,
            title: s.description || 'Culto da Igreja',
          }));
        }
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_SCHEDULES;
  })();

  const memberName = simulatedPerson?.name ? simulatedPerson.name.split(' ')[0] : 'Irmão(ã)';

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject.trim()) return;

    setModalOpen(false);
    setRequestSubject('');
    setRequestDetails('');
    setToastMessage('Seu pedido foi enviado com carinho para a equipe pastoral!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#081d24] text-slate-100' : 'bg-[#f4f8f9] text-slate-800'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#082f38] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-500 animate-in fade-in">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className={`sticky top-0 z-30 px-5 py-4 border-b backdrop-blur-md flex items-center justify-between ${isDarkMode ? 'bg-[#06181e]/90 border-cyan-900/30' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#082f38] to-[#0891b2] flex items-center justify-center text-cyan-200 shadow-md">
            <Church size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              IGREJA MANANCIAL
            </h1>
            <p className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-wider">
              Espaço do Membro
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300 transition-colors"
          title="Alternar Tema"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#082f38] via-[#09414e] to-[#0891b2] text-white shadow-xl">
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
              <Sparkles size={12} />
              A Paz do Senhor
            </span>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Olá, {memberName}!
            </h2>

            <p className="text-xs md:text-sm text-cyan-100/90 leading-relaxed max-w-xl">
              "O segredo do Senhor é para os que o temem; e ele lhes fará saber a sua aliança."
              <span className="block text-xs font-semibold text-cyan-300 mt-1">Salmos 25:14</span>
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-cyan-950 text-xs font-black uppercase tracking-wider shadow-md hover:bg-cyan-50 transition-all active:scale-95"
              >
                <Heart size={14} className="text-rose-500" />
                <span>Pedir Oração</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Destaque: Sub-App do Acampamento / Gincana ("App dentro do App") */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 border border-white/20">
                <Tent size={12} />
                Temporada Especial
              </span>
              <h3 className="text-xl md:text-2xl font-black tracking-tight">
                Acampamento Manancial 25:14
              </h3>
              <p className="text-xs md:text-sm text-white/90 max-w-lg leading-relaxed">
                Acesse o sub-aplicativo oficial da Gincana: pontuação das tribos ao vivo, saldo da cantina e cronograma do acampamento.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/membro/home')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-orange-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-orange-50 transition-all active:scale-95 shrink-0"
            >
              <span>Entrar na Gincana</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Seção 1: Dias e Horários de Culto */}
        <div className={`rounded-3xl p-6 border shadow-sm ${isDarkMode ? 'bg-[#0b242d] border-cyan-900/30' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-cyan-700 dark:text-cyan-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
                Cultos da Semana
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Presencial & Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {schedules.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isDarkMode
                    ? 'bg-[#081d24] border-cyan-900/40 hover:border-cyan-500/40'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                    {item.day}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {item.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-100/70 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 font-black text-xs">
                  <Clock size={13} />
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção 2: Cuidado Pastoral & Atendimentos */}
        <div className={`rounded-3xl p-6 border shadow-sm ${isDarkMode ? 'bg-[#0b242d] border-cyan-900/30' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={18} className="text-rose-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
              Cuidado Pastoral & Apoio
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            Nossa equipe pastoral está sempre pronta para orar com você e sua família. Envie um pedido de oração, agende uma visita ou solicite aconselhamento.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setRequestType('Pedido de Oração');
                setModalOpen(true);
              }}
              className="p-4 rounded-2xl border border-slate-200 dark:border-cyan-900/40 hover:border-rose-300 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 transition-colors">
                  🙏 Pedido de Oração
                </span>
                <span className="text-[10px] text-slate-400">
                  Saúde, causas familiares e gratidão
                </span>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => {
                setRequestType('Aconselhamento');
                setModalOpen(true);
              }}
              className="p-4 rounded-2xl border border-slate-200 dark:border-cyan-900/40 hover:border-cyan-400 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">
                  💬 Aconselhamento Pastoral
                </span>
                <span className="text-[10px] text-slate-400">
                  Conversa e orientação com a liderança
                </span>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </main>

      {/* Modal de Pedido de Oração / Aconselhamento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-cyan-950/70 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#0b242d] rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 border border-slate-100 dark:border-cyan-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-cyan-900/30">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-rose-500" />
                <h3 className="text-base font-black text-slate-800 dark:text-white">
                  {requestType}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assunto Principal *
                </label>
                <input
                  type="text"
                  required
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  placeholder="Ex: Oração por saúde na família..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-cyan-900/50 bg-white dark:bg-[#081d24] text-xs text-slate-800 dark:text-white focus:border-cyan-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detalhes ou Motivo
                </label>
                <textarea
                  rows={3}
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                  placeholder="Compartilhe com a equipe pastoral seu pedido (tratado com total sigilo)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-cyan-900/50 bg-white dark:bg-[#081d24] text-xs text-slate-800 dark:text-white focus:border-cyan-600 outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-[11px] text-cyan-900 dark:text-cyan-200">
                🔒 <strong>Sigilo Pastoral:</strong> Seu pedido será lido exclusivamente pelos pastores responsáveis.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-cyan-950"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md"
                >
                  <Send size={13} />
                  <span>Enviar Pedido</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
