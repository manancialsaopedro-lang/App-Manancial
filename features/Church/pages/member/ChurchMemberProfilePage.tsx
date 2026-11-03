import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  QrCode,
  Copy,
  Check,
  Heart,
  Tent,
  Music,
  Instagram,
  ExternalLink,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Droplets,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';
import {
  CHURCH_PIX_KEY,
  CHURCH_PIX_NAME,
  INSTAGRAM_URL,
  getStoredPastoralRequests,
  getConfirmedEventIds
} from '../../data/churchMemberData';

interface MemberLayoutContext {
  memberFullName: string;
  memberFirstName: string;
  openPastoralModal: () => void;
  showToast: (msg: string) => void;
}

export const ChurchMemberProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { memberFullName, openPastoralModal, showToast } =
    useOutletContext<MemberLayoutContext>();

  const [copiedPix, setCopiedPix] = useState(false);
  const [offeringType, setOfferingType] = useState<'Dízimo' | 'Oferta de Culto' | 'Missões & Social'>('Dízimo');
  const [offeringAmount, setOfferingAmount] = useState('');

  const activeRequestsCount = getStoredPastoralRequests().filter(
    (r) => r.status !== 'Atendido'
  ).length;
  const confirmedEventsCount = getConfirmedEventIds().length;

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(CHURCH_PIX_KEY);
      setCopiedPix(true);
      showToast('Chave PIX da Igreja Manancial copiada com sucesso!');
      setTimeout(() => setCopiedPix(false), 3000);
    } catch {
      setCopiedPix(true);
      showToast(`Chave PIX: ${CHURCH_PIX_KEY}`);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const handleSendOfferingReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const valText = offeringAmount.trim() ? ` no valor de R$ ${offeringAmount.trim()}` : '';
    const msg = encodeURIComponent(
      `Graça e Paz, Tesouraria da Igreja Manancial! 🙏\nSou ${memberFullName} e estou enviando o comprovante de *${offeringType}*${valText}.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    showToast('Abrindo WhatsApp para envio do comprovante à Tesouraria.');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. DÍZIMOS, OFERTAS & CONTRIBUIÇÃO VIA PIX (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <QrCode size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Fidelidade & Generosidade
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Dízimos, Ofertas & Ação Social (PIX)
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Contribua com a obra do Senhor e os projetos sociais da Igreja Manancial com praticidade pelo celular. Basta copiar a chave PIX CNPJ oficial abaixo:
          </p>

          {/* Box Chave PIX Copiar e Colar */}
          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Chave PIX Oficial (CNPJ)
                </span>
                <span className="text-lg sm:text-xl font-black text-[#082f38] tracking-tight block mt-0.5">
                  {CHURCH_PIX_KEY}
                </span>
                <span className="text-xs text-slate-600 font-semibold block mt-0.5">
                  Favorecido: {CHURCH_PIX_NAME}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyPix}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 ${
                  copiedPix
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#082f38] hover:bg-[#0a434d] text-white'
                }`}
              >
                {copiedPix ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
              </button>
            </div>
          </div>

          {/* Envio opcional de comprovante para Tesouraria */}
          <form onSubmit={handleSendOfferingReceipt} className="space-y-4 pt-2 border-t border-slate-100">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Heart size={15} className="text-rose-600" />
              <span>Deseja identificar ou enviar comprovante à Tesouraria?</span>
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {(['Dízimo', 'Oferta de Culto', 'Missões & Social'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOfferingType(t)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    offeringType === t
                      ? 'bg-[#082f38] text-white border-[#082f38]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={offeringAmount}
                onChange={(e) => setOfferingAmount(e.target.value)}
                placeholder="Valor opcional (ex: 150,00)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#082f38] outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                <MessageCircle size={15} />
                <span>Enviar Comprovante</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. MEU ESPAÇO & ATALHOS RÁPIDOS DO ECOSSISTEMA (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Resumo Rápido de Atividades do Membro */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 block">
                Minha Caminhada
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {memberFullName}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => navigate('/igreja/membro/atendimento')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-500 block">
                  Atendimentos Ativos
                </span>
                <span className="text-xl font-black text-[#082f38] mt-0.5 block">
                  {activeRequestsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/igreja/membro/eventos')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-500 block">
                  Eventos Confirmados
                </span>
                <span className="text-xl font-black text-emerald-700 mt-0.5 block">
                  {confirmedEventsCount}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={openPastoralModal}
              className="w-full py-3 px-4 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <HeartHandshake size={15} className="text-cyan-300" />
              <span>Solicitar Atendimento Pastoral</span>
            </button>
          </div>

          {/* Módulos Integrados & Atalhos */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles size={17} className="text-[#082f38]" />
              <span>Atalhos Rápidos da Igreja</span>
            </h2>

            <button
              type="button"
              onClick={() => navigate('/igreja/membro/ensino')}
              className="w-full p-4 rounded-2xl bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-200 flex items-center justify-between gap-3 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#082f38] text-cyan-300 flex items-center justify-center shrink-0">
                  <Droplets size={20} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    Quero me Batizar & Instruções
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Passo a passo do batismo nas águas e inscrição
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className="text-[#082f38] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/igreja/membro/ensino')}
              className="w-full p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 flex items-center justify-between gap-3 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    Curso de Teologia (Terças-feiras)
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Aulas com o Pr. Adenilson Freitas às 19:30
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className="text-amber-800 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/membro/home')}
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Tent size={20} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    App do Acampamento & Gincana 25:14
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Placar das tribos, cronograma e cantina
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-500 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/dashboard')}
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between gap-3 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#082f38] text-cyan-300 flex items-center justify-center shrink-0">
                  <Music size={19} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    Ministério de Louvor Manancial
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Escalas, repertório e cifras
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-500 shrink-0" />
            </button>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-pink-50 hover:bg-pink-100/70 border border-pink-200 flex items-center justify-between gap-3 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0">
                  <Instagram size={20} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    Instagram @manancialsaopedro
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Siga a página oficial da nossa igreja
                  </span>
                </div>
              </div>
              <ExternalLink size={16} className="text-pink-700 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
