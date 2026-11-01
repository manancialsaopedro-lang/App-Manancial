import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  Heart,
  Music,
  Users2,
  Cross,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Luggage,
  Sun,
  Moon,
  ExternalLink,
  MessageCircle,
  Share2,
  DollarSign,
  Maximize2,
  X
} from 'lucide-react';
import { useAppStore } from '../../store';
import { CAMP_2027_CONFIG } from '../../constants';

export const CampInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useAppStore();

  const [copiedPix, setCopiedPix] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'geral' | 'investimento' | 'levar'>('geral');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState(6);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(CAMP_2027_CONFIG.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: CAMP_2027_CONFIG.title,
        text: `Venha para o ${CAMP_2027_CONFIG.title}! De ${CAMP_2027_CONFIG.dates} em ${CAMP_2027_CONFIG.location}. "O segredo do Senhor é para aqueles que o temem" (Salmos 25:14).`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyPix();
    }
  };

  const openGoogleMaps = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=Sao+Pedro+SP', '_blank');
  };

  const openWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Olá! Gostaria de mais informações sobre as inscrições e vagas do ${CAMP_2027_CONFIG.title} em São Pedro - SP!`
    );
    window.open(`https://wa.me/5511976543210?text=${text}`, '_blank');
  };

  const themeColors = {
    bg: isDarkMode ? 'bg-[#090d16]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-[#121826] border-slate-800' : 'bg-white border-slate-200/80',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSec: isDarkMode ? 'text-slate-400' : 'text-slate-600',
  };

  const installmentSimulations = [
    { times: 1, val: 582 },
    { times: 2, val: 291 },
    { times: 3, val: 194 },
    { times: 6, val: 97 },
  ];

  return (
    <div className={`min-h-[100dvh] transition-colors duration-500 pb-28 ${themeColors.bg}`}>
      {/* TOP BAR FIXA COM COMPENSAÇÃO DE ALTURA */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-4 py-3 flex items-center justify-between ${
        isDarkMode ? 'bg-[#090d16]/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2.5 rounded-2xl transition-all active:scale-95 border ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={`text-sm font-black tracking-tight ${themeColors.textMain}`}>Acampamento 2027</h1>
            <p className={`text-[11px] font-semibold ${themeColors.textSec}`}>Informações Oficiais</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-cyan-400' : 'bg-cyan-50 border-cyan-100 text-cyan-700'
            }`}
            title="Compartilhar"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-6">
        
        {/* BANNER OFICIAL COM BOTÃO DE EXPANDIR */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl group bg-black/40">
          <img
            src={CAMP_2027_CONFIG.flyerImage}
            alt={CAMP_2027_CONFIG.title}
            className="w-full h-auto object-cover max-h-[460px] md:max-h-[520px] transition-transform duration-700 group-hover:scale-[1.02] cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Badge no topo do banner */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-400" /> Retiro Oficial da Igreja
          </div>

          <button
            onClick={() => setIsImageModalOpen(true)}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95"
            title="Ver Banner Completo"
          >
            <Maximize2 size={16} />
            <span className="hidden sm:inline">Ampliar</span>
          </button>

          {/* Informações sobrepostas na base do banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-amber-400 font-serif italic text-xs md:text-sm block mb-1">
              "O segredo do Senhor é para aqueles que o temem..." • {CAMP_2027_CONFIG.verseReference}
            </span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
              {CAMP_2027_CONFIG.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs md:text-sm font-semibold opacity-90">
              <span className="flex items-center gap-1 text-amber-300">
                <Calendar size={14} /> {CAMP_2027_CONFIG.dates}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-300">
                <MapPin size={14} /> {CAMP_2027_CONFIG.location}
              </span>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className={`p-1.5 rounded-2xl border flex items-center gap-1 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setSelectedTab('geral')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              selectedTab === 'geral'
                ? isDarkMode ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-cyan-800 shadow-sm'
                : themeColors.textSec
            }`}
          >
            <Sparkles size={14} /> Visão Geral
          </button>
          <button
            onClick={() => setSelectedTab('investimento')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              selectedTab === 'investimento'
                ? isDarkMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-800 shadow-sm'
                : themeColors.textSec
            }`}
          >
            <DollarSign size={14} /> Investimento & PIX
          </button>
          <button
            onClick={() => setSelectedTab('levar')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              selectedTab === 'levar'
                ? isDarkMode ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-800 shadow-sm'
                : themeColors.textSec
            }`}
          >
            <Luggage size={14} /> O Que Levar
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: VISÃO GERAL */}
        {selectedTab === 'geral' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* CARD VERSÍCULO E TEMA */}
            <div className={`p-6 rounded-3xl border relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-br from-amber-950/30 via-[#131722] to-slate-900 border-amber-500/20' 
                : 'bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border-amber-200/80'
            }`}>
              <div className="relative z-10">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-2">
                  Tema Profético do Retiro
                </span>
                <p className={`text-base md:text-xl font-serif italic leading-relaxed ${themeColors.textMain}`}>
                  "{CAMP_2027_CONFIG.verseText}"
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {CAMP_2027_CONFIG.verseReference}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {CAMP_2027_CONFIG.subtitle}
                  </span>
                </div>
              </div>
            </div>

            {/* CARDS DE DATA E LOCALIZAÇÃO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-5 rounded-3xl border ${themeColors.card}`}>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                  <Calendar size={20} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${themeColors.textSec}`}>Período do Evento</span>
                <h3 className={`text-lg font-black mt-0.5 ${themeColors.textMain}`}>{CAMP_2027_CONFIG.dates}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${themeColors.textSec}`}>
                  5 dias inteiros de imersão espiritual, comunhão, ministrações e atividades inesquecíveis.
                </p>
              </div>

              <div className={`p-5 rounded-3xl border ${themeColors.card}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <button
                    onClick={openGoogleMaps}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline"
                  >
                    Ver no Maps <ExternalLink size={12} />
                  </button>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${themeColors.textSec}`}>Localização</span>
                <h3 className={`text-lg font-black mt-0.5 ${themeColors.textMain}`}>{CAMP_2027_CONFIG.location}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${themeColors.textSec}`}>
                  Chácara com infraestrutura completa: alojamentos, refeitório, piscina, quadra e templo.
                </p>
              </div>
            </div>

            {/* 4 PILARES DO ACAMPAMENTO */}
            <div>
              <div className="mb-3">
                <h3 className={`text-base font-black ${themeColors.textMain}`}>Pilares do Acampamento</h3>
                <p className={`text-xs ${themeColors.textSec}`}>O que você vai vivenciar nestes dias na presença de Deus</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CAMP_2027_CONFIG.pillars.map((pilar) => {
                  const Icon = pilar.id === 'intimidade' ? Heart : pilar.id === 'louvor' ? Music : pilar.id === 'oracao' ? Users2 : Cross;
                  return (
                    <div
                      key={pilar.id}
                      className={`p-4 rounded-2xl border transition-all ${themeColors.card}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${pilar.color} text-white flex items-center justify-center shadow-md`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-black ${themeColors.textMain}`}>{pilar.title}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{pilar.subtitle}</span>
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed ${themeColors.textSec}`}>
                        {pilar.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ATALHOS RÁPIDOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigate('/acampamento/pagamentos')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-between shadow-lg transition-transform active:scale-98"
              >
                <div className="text-left">
                  <div className="font-black text-sm">Visão Gerencial dos Pagamentos</div>
                  <div className="text-[11px] opacity-80">Acompanhamento pastoral de inscritos e parcelas</div>
                </div>
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => navigate('/membro/home')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg transition-transform active:scale-98"
              >
                <div className="text-left">
                  <div className="font-black text-sm">Espaço do Acampante</div>
                  <div className="text-[11px] opacity-80">Minha inscrição, equipe, cantina e cronograma</div>
                </div>
                <ChevronRight size={18} />
              </button>
            </div>

          </div>
        )}

        {/* CONTEÚDO DA ABA 2: INVESTIMENTO & PIX */}
        {selectedTab === 'investimento' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* DESTAQUE PRINCIPAL DO INVESTIMENTO */}
            <div className={`p-6 md:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-br from-emerald-950/40 via-[#111927] to-[#0c121e] border-emerald-500/30' 
                : 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-200'
            }`}>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                    Investimento Oficial por Pessoa
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-emerald-600 dark:text-emerald-400">
                      R$ {CAMP_2027_CONFIG.pricing.total.toFixed(2)}
                    </span>
                    <span className={`text-xs font-bold uppercase ${themeColors.textSec}`}>À vista no PIX</span>
                  </div>
                  <p className={`text-xs mt-2 max-w-md ${themeColors.textSec}`}>
                    Inclui hospedagem completa de 5 dias, 4 refeições diárias (café, almoço, jantar e lanche noturno), camiseta do evento e participação na gincana.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-emerald-100 shadow-md'
                }`}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Facilidade de Parcelamento
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    Até 06x de R$ 97,00
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                    <CreditCard size={13} /> No Cartão de Débito ou Crédito
                  </span>
                </div>
              </div>
            </div>

            {/* SEÇÃO CHAVE PIX */}
            <div className={`p-6 rounded-3xl border shadow-sm ${themeColors.card}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${themeColors.textMain}`}>Pagamento via PIX</h3>
                    <p className={`text-xs ${themeColors.textSec}`}>Copie a chave e faça o pagamento pelo seu app do banco</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Sem Taxas
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Chave PIX (E-mail)</span>
                  <span className={`font-mono font-bold text-xs md:text-sm truncate block ${themeColors.textMain}`}>
                    {CAMP_2027_CONFIG.pixKey}
                  </span>
                </div>
                <button
                  onClick={handleCopyPix}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                    copiedPix
                      ? 'bg-emerald-600 text-white'
                      : isDarkMode
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  }`}
                >
                  {copiedPix ? <Check size={14} /> : <Copy size={14} />}
                  {copiedPix ? 'Copiado!' : 'Copiar Chave'}
                </button>
              </div>

              <p className={`text-[11px] mt-3 italic ${themeColors.textSec}`}>
                * Após a realização do PIX, envie o comprovante para a liderança ou no caixa para registrar sua baixa de parcela.
              </p>
            </div>

            {/* SIMULADOR DE PARCELAS */}
            <div className={`p-6 rounded-3xl border shadow-sm ${themeColors.card}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${themeColors.textMain}`}>Opções de Parcelamento</h3>
                    <p className={`text-xs ${themeColors.textSec}`}>Escolha o plano que melhor cabe no seu bolso</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {installmentSimulations.map((sim) => (
                  <button
                    key={sim.times}
                    onClick={() => setSelectedInstallments(sim.times)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedInstallments === sim.times
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                        : isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-900' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {sim.times === 1 ? 'À Vista' : `${sim.times}x Parcelas`}
                    </span>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      R$ {sim.val.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                      Total R$ 582,00
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <span className={themeColors.textSec}>
                  Formas aceitas na recepção e caixa: <strong>PIX, Cartão de Débito e Cartão de Crédito</strong>.
                </span>
                <button
                  onClick={openWhatsAppInquiry}
                  className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MessageCircle size={14} /> Falar com a Tesouraria
                </button>
              </div>
            </div>

          </div>
        )}

        {/* CONTEÚDO DA ABA 3: O QUE LEVAR */}
        {selectedTab === 'levar' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            <div className={`p-5 rounded-3xl border ${themeColors.card}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Luggage size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-black ${themeColors.textMain}`}>Checklist do Acampante</h3>
                  <p className={`text-xs ${themeColors.textSec}`}>Prepare sua mala com antecedência para não esquecer nada</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CAMP_2027_CONFIG.packingList.map((category, idx) => (
                <div key={idx} className={`p-5 rounded-3xl border shadow-sm ${themeColors.card}`}>
                  <h4 className={`text-sm font-black mb-3 pb-2 border-b border-slate-100 dark:border-slate-800 ${themeColors.textMain}`}>
                    {category.category}
                  </h4>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2.5 text-xs">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={10} strokeWidth={3} />
                        </div>
                        <span className={themeColors.textSec}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={`p-5 rounded-3xl border border-amber-500/30 ${
              isDarkMode ? 'bg-amber-950/20' : 'bg-amber-50/70'
            }`}>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                <ShieldCheck size={16} /> Recomendações e Cuidados
              </div>
              <p className={`text-xs leading-relaxed ${themeColors.textSec}`}>
                Identifique todas as suas malas e pertences. Não leve objetos de alto valor financeiro. Lembre-se de avisar a liderança sobre restrições alimentares ou uso de medicações especiais no ato da confirmação.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* MODAL DE VISUALIZAÇÃO DO BANNER COMPLETO */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full max-h-[92vh] flex flex-col items-center">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Fechar"
            >
              <X size={20} />
            </button>
            <img
              src={CAMP_2027_CONFIG.flyerImage}
              alt={CAMP_2027_CONFIG.title}
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* BARRA FIXA INFERIOR DE AÇÃO (MOBILE FRIENDLY) */}
      <div className={`fixed bottom-0 left-0 right-0 z-30 p-3.5 backdrop-blur-xl border-t transition-colors ${
        isDarkMode ? 'bg-[#090d16]/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/acampamento/pagamentos')}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-98 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <DollarSign size={15} /> Visão Pastoral de Pagamentos
          </button>

          <button
            onClick={openWhatsAppInquiry}
            className="flex-1 py-3 px-4 rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <MessageCircle size={15} /> Inscrever-se via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
