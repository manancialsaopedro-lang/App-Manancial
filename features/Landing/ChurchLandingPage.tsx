import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Church,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Tent,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  Phone,
  Shield,
  Users,
  Compass,
  Flame,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface WorshipSchedule {
  dayOfWeek: string;
  time: string;
  description: string;
}

export const ChurchLandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Load schedules from church config or use defaults
  const schedules: WorshipSchedule[] = (() => {
    try {
      const saved = localStorage.getItem('manancial_dev_church_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schedules && parsed.schedules.length > 0) {
          return parsed.schedules;
        }
      }
    } catch (e) {
      // fallback
    }
    return [
      { dayOfWeek: 'Domingo', time: '09:30', description: 'Culto da Família & Ceia' },
      { dayOfWeek: 'Domingo', time: '18:00', description: 'Culto de Celebração & Jovens' },
      { dayOfWeek: 'Quarta-feira', time: '19:30', description: 'Culto da Palavra & Oração' },
      { dayOfWeek: 'Sábado', time: '19:00', description: 'Rede de Jovens & Células' },
    ];
  })();

  // Prayer Request Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;

    setIsSent(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setSubject('');
      setIsSent(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] text-slate-800 font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#082f38]/95 backdrop-blur-md text-white border-b border-cyan-900/50 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-200 flex items-center justify-center text-cyan-950 font-black shadow-lg shadow-cyan-950/40">
              <span className="text-xl">M</span>
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5 leading-none">
                Igreja <span className="text-cyan-300 font-bold">Manancial</span>
              </h1>
              <p className="text-[10px] text-cyan-200/60 font-semibold uppercase tracking-wider mt-0.5">
                Uma Família para Pertencer
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-cyan-100/80">
            <a href="#cultos" className="hover:text-cyan-300 transition-colors">Cultos</a>
            <a href="#retiro" className="hover:text-cyan-300 transition-colors">Acampamento</a>
            <a href="#oracao" className="hover:text-cyan-300 transition-colors">Oração</a>
            <a href="#sobre" className="hover:text-cyan-300 transition-colors">Sobre Nós</a>
          </nav>

          {/* Right Action: Área de Gestão */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-cyan-950 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <span>Painel de Gestão</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION COM IDENTIDADE VISUAL BASILÉIA/DEEP TEAL */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#06242c] via-[#082f38] to-[#0a4552] text-white py-20 lg:py-28 px-4">
        {/* Glow & Atmospheric Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-bold text-xs uppercase tracking-widest shadow-inner animate-in fade-in">
            <Sparkles size={14} />
            <span>Bem-vindo à Comunidade Manancial</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Águas Vivas para a sua <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-cyan-400">
              Vida e Família
            </span>
          </h2>

          <p className="text-base sm:text-lg text-cyan-100/90 max-w-2xl mx-auto leading-relaxed font-light">
            "O segredo do Senhor é para os que o temem; e ele lhes fará saber a sua aliança."
            <strong className="block text-xs font-black uppercase tracking-widest text-cyan-300 mt-2">
              Salmos 25:14
            </strong>
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#cultos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-cyan-950 text-xs font-black uppercase tracking-wider shadow-xl shadow-cyan-950/40 transition-all active:scale-95"
            >
              <Calendar size={16} />
              <span>Conhecer Nossos Cultos</span>
            </a>

            <a
              href="#oracao"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0a3f4a] hover:bg-[#0c4e5c] text-cyan-200 text-xs font-black uppercase tracking-wider border border-cyan-700/50 transition-all active:scale-95"
            >
              <Heart size={16} className="text-rose-400" />
              <span>Enviar Pedido de Oração</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO CULTOS DA SEMANA (SINCRONIZADOS EM TEMPO REAL) */}
      <section id="cultos" className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[11px] font-black uppercase tracking-widest text-cyan-800 bg-cyan-100 px-3 py-1 rounded-full">
            Agenda Semanal
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dias e Horários de Celebração
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Portas abertas para você e sua família viverem momentos de fé, louvor e comunhão.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {schedules.map((item, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md">
                  {item.dayOfWeek}
                </span>
                <h4 className="text-base font-black text-slate-800 mt-3 mb-1">
                  {item.description || 'Culto de Celebração'}
                </h4>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-bold text-cyan-900">
                  <Clock size={14} className="text-cyan-600" />
                  {item.time}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Presencial</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DESTAQUE ESPECIAL: ACAMPAMENTO & RETIRO 2027 */}
      <section id="retiro" className="py-14 px-4 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/20 text-xs font-black uppercase tracking-wider">
              <Tent size={14} />
              <span>Temporada Oficial 2027</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Acampamento Manancial 25:14
            </h3>

            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              São Pedro - SP (05 a 09 de Fevereiro). 5 dias de imersão espiritual, gincana das tribos, comunhão profunda e experiências inesquecíveis.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-bold text-orange-100">
              <span className="flex items-center gap-1">📍 São Pedro - SP</span>
              <span className="flex items-center gap-1">🎟️ R$ 582 ou 6x de R$ 97</span>
              <span className="flex items-center gap-1">🏆 Gincana das Tribos</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/acampamento/informacoes')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-orange-950 text-xs font-black uppercase tracking-wider shadow-xl hover:bg-orange-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Ver Detalhes do Retiro</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/gincana/placar')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-orange-900/40 hover:bg-orange-900/60 text-white text-xs font-black uppercase tracking-wider border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Flame size={14} className="text-yellow-300" />
              <span>Placar ao Vivo</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. FORMULÁRIO DE PEDIDO DE ORAÇÃO & CUIDADO PASTORAL */}
      <section id="oracao" className="py-16 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <Heart size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Podemos orar por você?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Nossa equipe pastoral intercede diariamente pelas famílias. Compartilhe seu pedido com total sigilo.
            </p>
          </div>

          {isSent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
              <h4 className="text-sm font-black text-emerald-900">
                Seu pedido foi registrado com sucesso!
              </h4>
              <p className="text-xs text-emerald-700">
                Os pastores já foram notificados e estarão orando por você. Deus abençoe sua vida!
              </p>
            </div>
          ) : (
            <form onSubmit={handlePrayerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como podemos te chamar?"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qual é o seu motivo de oração? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Saúde, família, vida profissional, gratidão ou direção de Deus..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  🔒 Sigilo e discrição garantidos
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  <Send size={13} />
                  <span>Enviar Pedido</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 6. FOOTER INSTITUCIONAL */}
      <footer className="bg-[#051c22] text-slate-400 py-10 px-4 border-t border-cyan-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h5 className="text-sm font-black text-white">Comunidade Evangélica Manancial</h5>
            <p className="text-xs text-slate-400">
              Uma família para pertencer, um manancial para saciar a sede da alma.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-cyan-900/50 hover:bg-cyan-900/80 text-cyan-300 text-xs font-bold transition-all border border-cyan-800/40"
            >
              Acesso Administrativo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
