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
  ExternalLink,
  ZoomIn,
  X,
  Copy,
  Check,
  CreditCard,
  QrCode,
  MessageCircle,
  Share2,
  BookOpen
} from 'lucide-react';
import { CAMP_2027_CONFIG } from '../../constants';

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

  // Camp Poster & Share State
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(CAMP_2027_CONFIG.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleShareCamp = () => {
    if (navigator.share) {
      navigator.share({
        title: CAMP_2027_CONFIG.title,
        text: `Acampamento Manancial 2027 em São Pedro - SP (05 a 09 de Fevereiro). "O segredo do Senhor é para aqueles que o temem..." (Salmos 25:14). Participe conosco!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyPix();
    }
  };

  const openGoogleMaps = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=Sao+Pedro+SP', '_blank');
  };

  const openWhatsAppCamp = () => {
    const text = encodeURIComponent(
      `Olá! Gostaria de mais informações e garantir minha vaga no Acampamento Manancial 2027 em São Pedro - SP!`
    );
    window.open(`https://wa.me/5511976543210?text=${text}`, '_blank');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
            <button
              type="button"
              onClick={() => scrollToSection('cultos')}
              className="hover:text-cyan-300 transition-colors"
            >
              Cultos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('retiro')}
              className="hover:text-amber-200 transition-colors text-amber-300 font-black flex items-center gap-1.5"
            >
              <Tent size={14} className="text-amber-400" />
              <span>Acampamento 2027</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('oracao')}
              className="hover:text-cyan-300 transition-colors"
            >
              Oração
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sobre')}
              className="hover:text-cyan-300 transition-colors"
            >
              Sobre Nós
            </button>
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

        {/* Mobile Navigation Pills (Navegação rápida sem recarregar a rota) */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto pt-2.5 pb-1 border-t border-cyan-900/40 text-[11px] font-bold text-cyan-100/90 no-scrollbar">
          <button
            type="button"
            onClick={() => scrollToSection('retiro')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-500/40 font-black shrink-0 active:scale-95 transition-all"
          >
            <Tent size={12} className="text-amber-400" />
            <span>Acampamento 2027</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('cultos')}
            className="px-3 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-900/70 shrink-0 active:scale-95 transition-all"
          >
            Cultos
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('oracao')}
            className="px-3 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-900/70 shrink-0 active:scale-95 transition-all"
          >
            Oração
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sobre')}
            className="px-3 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-900/70 shrink-0 active:scale-95 transition-all"
          >
            Sobre
          </button>
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
            <button
              type="button"
              onClick={() => scrollToSection('retiro')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-stone-950 text-xs font-black uppercase tracking-wider shadow-xl shadow-amber-950/40 transition-all active:scale-95"
            >
              <Tent size={16} />
              <span>Acampamento 2027</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('cultos')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-cyan-950 text-xs font-black uppercase tracking-wider shadow-xl shadow-cyan-950/40 transition-all active:scale-95"
            >
              <Calendar size={16} />
              <span>Conhecer Nossos Cultos</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('oracao')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0a3f4a] hover:bg-[#0c4e5c] text-cyan-200 text-xs font-black uppercase tracking-wider border border-cyan-700/50 transition-all active:scale-95"
            >
              <Heart size={16} className="text-rose-400" />
              <span>Enviar Pedido de Oração</span>
            </button>
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

      {/* 4. DESTAQUE ESPECIAL: ACAMPAMENTO MANANCIAL 2027 (INFORMAÇÕES COMPLETAS & CARTAZ) */}
      <section id="retiro" className="py-16 sm:py-20 px-4 bg-gradient-to-br from-[#120e09] via-[#211609] to-[#0d181e] text-white relative overflow-hidden border-y border-amber-900/40">
        {/* Glow atmosférico de fundo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-12">
          {/* Header da Seção */}
          <div className="text-center max-w-3xl mx-auto space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-widest shadow-inner">
              <Tent size={14} className="text-amber-400" />
              <span>Temporada Oficial 2027 • Inscrições Abertas</span>
            </div>

            <div className="pt-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400/90 block mb-1">
                Salmos 25:14
              </span>
              <p className="text-base sm:text-xl italic font-serif text-amber-100/90 max-w-2xl mx-auto leading-relaxed">
                "O segredo do Senhor é para aqueles que o temem, e ele lhes mostrará a sua aliança."
              </p>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Acampamento <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200">Manancial 2027</span>
            </h2>

            <p className="text-sm sm:text-base text-amber-100/80 font-medium">
              Venha viver dias de graça, paz e renovação! <span className="text-amber-300 font-bold">Deus te espera!</span>
            </p>
          </div>

          {/* Grid Principal: Foto Oficial + Painel de Informações */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Coluna Esquerda: Cartaz Oficial do Acampamento (5 colunas no desktop) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group w-full max-w-md mx-auto rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-950/70 bg-black/40">
                {/* Imagem do Cartaz */}
                <img
                  src="/acampamento-2027.jpg"
                  alt="Cartaz Oficial Acampamento Manancial 2027"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
                  onClick={() => setIsPosterModalOpen(true)}
                  loading="lazy"
                />

                {/* Selo Flutuante de Cartaz Oficial */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 shadow-lg">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>Cartaz Oficial 2027</span>
                </div>

                {/* Botão Hover Overlay para Ampliar */}
                <button
                  type="button"
                  onClick={() => setIsPosterModalOpen(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-[2px]"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                    <ZoomIn size={22} />
                  </div>
                  <span>Clique para ver cartaz completo</span>
                </button>
              </div>

              {/* Botões rápidos abaixo da foto */}
              <div className="flex items-center justify-center gap-3 w-full max-w-md mt-4">
                <button
                  type="button"
                  onClick={() => setIsPosterModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all active:scale-95"
                >
                  <ZoomIn size={14} />
                  <span>Ampliar Foto</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareCamp}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
                >
                  <Share2 size={14} />
                  <span>Compartilhar</span>
                </button>
              </div>
            </div>

            {/* Coluna Direita: Detalhes, Pilares & Investimento (7 colunas no desktop) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges de Data e Localização */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Data */}
                <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/20 backdrop-blur-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-amber-950 shrink-0 shadow-md">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                      Quando Acontece
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                      05 a 09 de Fevereiro de 2027
                    </h4>
                    <p className="text-[11px] text-amber-200/70 mt-0.5">
                      5 dias inesquecíveis (Feriado de Carnaval)
                    </p>
                  </div>
                </div>

                {/* Localização */}
                <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/20 backdrop-blur-sm flex items-start justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-400 flex items-center justify-center text-orange-950 shrink-0 shadow-md">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-orange-400 tracking-wider">
                        Local do Retiro
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                        São Pedro - SP
                      </h4>
                      <p className="text-[11px] text-orange-200/70 mt-0.5">
                        Estrutura completa na natureza
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openGoogleMaps}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-orange-200 transition-all text-xs shrink-0 self-center"
                    title="Ver mapa no Google"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Os 4 Pilares da Experiência (Plaquinhas de Madeira do Cartaz) */}
              <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/25 backdrop-blur-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Pilares do Acampamento</span>
                  </h4>
                  <span className="text-[10px] font-bold text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Propósito Espiritual
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-black/30 border border-amber-500/20 flex items-center gap-3">
                    <span className="text-xl">❤️</span>
                    <div>
                      <h5 className="text-xs font-black text-white">Intimidade com o Senhor</h5>
                      <p className="text-[10px] text-amber-100/70">Oração no secreto e busca genuína</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-amber-500/20 flex items-center gap-3">
                    <span className="text-xl">🎵</span>
                    <div>
                      <h5 className="text-xs font-black text-white">Louvor e Adoração</h5>
                      <p className="text-[10px] text-amber-100/70">Celebrações e adoração profética</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-amber-500/20 flex items-center gap-3">
                    <span className="text-xl">🙏</span>
                    <div>
                      <h5 className="text-xs font-black text-white">Oração e Fraternidade</h5>
                      <p className="text-[10px] text-amber-100/70">Comunhão, união e cuidado mútuo</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-amber-500/20 flex items-center gap-3">
                    <span className="text-xl">✝️</span>
                    <div>
                      <h5 className="text-xs font-black text-white">Encontro com Deus</h5>
                      <p className="text-[10px] text-amber-100/70">Divisor de águas para sua história</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco de Investimento e Condições de Pagamento */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-900/40 via-amber-950/60 to-black/60 border-2 border-amber-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚜️</span>
                    <h4 className="text-sm font-black uppercase tracking-widest text-amber-300">
                      Investimento Oficial
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-amber-200/80">
                    Tudo Incluso (Hospedagem + Alimentação + Programação)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Opção PIX */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <QrCode size={13} /> Chave PIX
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          À Vista
                        </span>
                      </div>
                      <div className="text-2xl font-black text-white tracking-tight">
                        R$ 582<span className="text-sm font-normal text-slate-300">,00</span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 font-mono mt-1 break-all">
                        {CAMP_2027_CONFIG.pixKey}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className={`mt-3.5 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                        copiedPix
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {copiedPix ? (
                        <>
                          <Check size={14} />
                          <span>Chave PIX Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copiar Chave PIX</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Opção Cartão Parcelado */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <CreditCard size={13} /> Cartão de Débito ou Crédito
                        </span>
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                          Sem Juros
                        </span>
                      </div>
                      <div className="text-2xl font-black text-white tracking-tight">
                        <span className="text-sm font-bold text-amber-400 uppercase mr-1">Em até</span>
                        06x <span className="text-base font-normal text-slate-300">de</span> R$ 97<span className="text-sm font-normal text-slate-300">,00</span>
                      </div>
                      <p className="text-[11px] text-amber-200/70 mt-1">
                        Facilidade para toda a família poder participar junta.
                      </p>
                    </div>

                    <div className="mt-3.5 flex items-center justify-center py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] font-bold">
                      💳 Aceitamos as principais bandeiras
                    </div>
                  </div>
                </div>

                {/* Slogan do Rodapé */}
                <div className="text-center pt-2 text-xs font-black uppercase tracking-widest text-amber-300/90 flex items-center justify-center gap-2">
                  <span>✨</span>
                  <span>Dias inesquecíveis na presença de Deus!</span>
                  <span>✨</span>
                </div>
              </div>

              {/* Botões de Ação Principais */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={openWhatsAppCamp}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-black uppercase tracking-wider shadow-xl shadow-emerald-950/40 transition-all active:scale-95"
                >
                  <MessageCircle size={16} />
                  <span>Garantir Vaga no WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/acampamento/informacoes')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-amber-50 text-stone-900 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95"
                >
                  <BookOpen size={15} />
                  <span>Guia & Bagagem</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/gincana/placar')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-orange-900/50 hover:bg-orange-900/80 text-orange-200 text-xs font-black uppercase tracking-wider border border-orange-500/30 transition-all active:scale-95"
                >
                  <Flame size={15} className="text-amber-400" />
                  <span>Placar Gincana</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL / LIGHTBOX PARA VISUALIZAR O CARTAZ OFICIAL EM TELA CHEIA */}
        {isPosterModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
            onClick={() => setIsPosterModalOpen(false)}
          >
            <div
              className="relative max-w-2xl w-full bg-stone-950 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900/80">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    Cartaz Oficial • Acampamento Manancial 2027
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPosterModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Imagem do Cartaz em Alta Resolução */}
              <div className="p-3 sm:p-4 overflow-y-auto flex items-center justify-center bg-black/60">
                <img
                  src="/acampamento-2027.jpg"
                  alt="Cartaz Oficial Acampamento Manancial 2027"
                  className="w-auto max-h-[70vh] rounded-2xl shadow-2xl object-contain border border-amber-500/20"
                />
              </div>

              {/* Rodapé do Modal */}
              <div className="p-3.5 border-t border-stone-800 bg-stone-900/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-amber-200/80 text-[11px] font-medium">
                  De 05 a 09 de Fevereiro de 2027 • São Pedro - SP
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShareCamp}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition-all text-xs border border-amber-500/30"
                  >
                    <Share2 size={13} />
                    <span>Compartilhar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPosterModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-all text-xs"
                  >
                    <span>Fechar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
      <footer id="sobre" className="bg-[#051c22] text-slate-400 py-10 px-4 border-t border-cyan-950">
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
