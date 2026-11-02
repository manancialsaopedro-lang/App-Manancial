import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Phone, 
  User, 
  Church, 
  MessageSquare, 
  Calendar,
  Loader2,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Interfaces dos dados do Wizard
interface VisitorFormData {
  // Etapa 1: Frequência
  frequency: 'PRIMEIRA_VEZ' | 'SEGUNDA_MAIS' | 'FREQUENTO_SEMPRE' | '';
  // Etapa 2: Identificação
  fullName: string;
  phone: string;
  // Etapa 3: Momento / Interesse
  intention: 'QUERO_VISITA' | 'QUERO_SER_MEMBRO' | 'PEDIDO_ORACAO' | 'APENAS_VISITANTE' | 'PULAR' | '';
  memberRegistrationChoice?: 'AGORA' | 'DEPOIS' | '';
  visitNotes?: string;
  // Dados adicionais caso escolha 'AGORA'
  birthDate?: string;
  isBaptized?: 'SIM' | 'NAO' | '';
  // Etapa 4: Histórico de Fé (Opcional)
  faithTradition?: 'PROTESTANTE' | 'CATOLICA' | 'NAO_CONGREGAVA' | 'OUTRO' | 'PULAR' | '';
  protestantBranch?: string;
  customPreviousChurch?: string;
  // Etapa 5: Cuidado Pastoral (Opcional)
  prayerPreference?: 'ORACAO' | 'VISITA' | 'NENHUM' | 'PULAR' | '';
  prayerRequestNotes?: string;
}

const INITIAL_FORM: VisitorFormData = {
  frequency: '',
  fullName: '',
  phone: '',
  intention: '',
  memberRegistrationChoice: '',
  visitNotes: '',
  birthDate: '',
  isBaptized: '',
  faithTradition: '',
  protestantBranch: '',
  customPreviousChurch: '',
  prayerPreference: '',
  prayerRequestNotes: '',
};

// Formatação e máscara de telefone celular (Brasil)
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const VisitorWizardPage: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<VisitorFormData>(INITIAL_FORM);
  const [inviteId, setInviteId] = useState<string>('invite-1771383949600-e013eec11d51a8');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Busca token de convite ativo se houver no Supabase ou na URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramInvite = searchParams.get('convite') || searchParams.get('invite');
    if (paramInvite) {
      setInviteId(paramInvite);
      return;
    }

    const fetchActiveInvite = async () => {
      try {
        const { data, error } = await supabase()
          .from('church_member_invites')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (data?.id && !error) {
          setInviteId(data.id);
        }
      } catch {
        // Fallback mantém o id padrão funcional
      }
    };

    fetchActiveInvite();
  }, []);

  // Handlers de formulário
  const updateField = <K extends keyof VisitorFormData>(field: K, value: VisitorFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validação por etapa
  const isStepValid = (): boolean => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return !!formData.frequency;
      case 2: {
        const cleanDigits = formData.phone.replace(/\D/g, '');
        return formData.fullName.trim().length >= 2 && cleanDigits.length >= 10;
      }
      case 3:
        if (!formData.intention) return false;
        if (formData.intention === 'QUERO_SER_MEMBRO' && !formData.memberRegistrationChoice) {
          return false;
        }
        return true;
      case 4:
        return true; // Opcional
      case 5:
        return true; // Opcional
      default:
        return true;
    }
  };

  // Salvar no Supabase
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const cleanDigits = formData.phone.replace(/\D/g, '');
      const isFirstTime = formData.frequency === 'PRIMEIRA_VEZ';
      const visitCount = formData.frequency === 'PRIMEIRA_VEZ' ? 1 : formData.frequency === 'SEGUNDA_MAIS' ? 2 : 5;
      const isMemberInterest = formData.intention === 'QUERO_SER_MEMBRO';
      const wantsVisit = formData.intention === 'QUERO_VISITA' || formData.prayerPreference === 'VISITA';
      const needsPrayer = formData.intention === 'PEDIDO_ORACAO' || formData.prayerPreference === 'ORACAO' || !!formData.prayerRequestNotes;

      // Monta notas detalhadas estruturadas
      const notesParts: string[] = [];
      if (formData.intention) {
        if (formData.intention === 'QUERO_VISITA') {
          notesParts.push('Momento: QUERO_UMA_VISITA');
          if (formData.visitNotes) {
            notesParts.push(`Obs da Visita: ${formData.visitNotes}`);
          }
        } else if (formData.intention === 'QUERO_SER_MEMBRO') {
          notesParts.push('Momento: QUERO_SER_MEMBRO');
          if (formData.memberRegistrationChoice) {
            notesParts.push(`Opção Membresia: ${formData.memberRegistrationChoice}`);
          }
        } else if (formData.intention === 'PEDIDO_ORACAO') {
          notesParts.push('Momento: REGISTRAR_PEDIDO_ORACAO');
        } else if (formData.intention === 'PULAR') {
          notesParts.push('Momento: RESPONDER_DEPOIS');
        } else {
          notesParts.push(`Momento: ${formData.intention}`);
        }
      }
      if (formData.birthDate) {
        notesParts.push(`Nascimento: ${formData.birthDate}`);
      }
      if (formData.isBaptized) {
        notesParts.push(`Batizado nas águas: ${formData.isBaptized}`);
      }
      if (formData.faithTradition && formData.faithTradition !== 'PULAR') {
        notesParts.push(`Histórico de Fé: ${formData.faithTradition}`);
        if (formData.protestantBranch) notesParts.push(`Denominação: ${formData.protestantBranch}`);
        if (formData.customPreviousChurch) notesParts.push(`Igreja Anterior: ${formData.customPreviousChurch}`);
      }
      if (formData.prayerRequestNotes) {
        notesParts.push(`Pedido de Oração: ${formData.prayerRequestNotes}`);
      }

      const payload = {
        full_name: formData.fullName.trim(),
        phone: cleanDigits,
        whatsapp: cleanDigits,
        member_type: isMemberInterest ? 'Membro' : 'Visitante',
        status: 'ATIVO',
        source: 'QR_WIZARD',
        invite_id: inviteId,
        is_first_time: isFirstTime,
        visit_count: visitCount,
        needs_prayer: needsPrayer,
        wants_visit: wantsVisit,
        notes: notesParts.join(' | '),
        first_visit_date: new Date().toISOString().split('T')[0],
      };

      const { error } = await supabase().from('church_members').insert([payload]);

      if (error) {
        console.warn('Erro ao salvar no Supabase, tentando fallback local:', error.message);
        // Salva cópia em localStorage para garantir que nada se perca mesmo com falha de conexão
        const localSaved = JSON.parse(localStorage.getItem('manancial_pending_visitors') || '[]');
        localSaved.push({ ...payload, clientTimestamp: new Date().toISOString() });
        localStorage.setItem('manancial_pending_visitors', JSON.stringify(localSaved));
      }

      setSubmitSuccess(true);
      setStep(6);
    } catch (err: any) {
      console.error('Erro na submissão:', err);
      // Salva localmente para segurança
      const localSaved = JSON.parse(localStorage.getItem('manancial_pending_visitors') || '[]');
      localSaved.push({ ...formData, clientTimestamp: new Date().toISOString() });
      localStorage.setItem('manancial_pending_visitors', JSON.stringify(localSaved));
      setSubmitSuccess(true);
      setStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 5) {
      handleFinalSubmit();
    } else {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-gradient-to-b from-[#f8fafc] via-slate-50 to-[#f0fdfa]/40 text-slate-900 selection:bg-cyan-600 selection:text-white relative overflow-x-hidden">
      
      {/* Elementos Decorativos de Fundo: Ondas e Luzes Suaves da Manancial */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Luzes difusas de ambiente */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-36 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl" />

        {/* Linhas e Ondas Fluidas Vetoriais (Estilo Águas Vivas / Manancial) */}
        <svg
          className="absolute inset-0 w-full h-full object-cover"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveFillTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="waveFillBottom" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="waveStrokeCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="waveStrokeTeal" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.07" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Camada de onda superior */}
          <path
            d="M0,0 C320,110 460,30 720,80 C980,130 1200,60 1440,95 L1440,0 Z"
            fill="url(#waveFillTop)"
          />
          <path
            d="M0,45 C340,130 500,50 740,100 C980,150 1220,80 1440,115"
            stroke="url(#waveStrokeCyan)"
            strokeWidth="1.5"
          />

          {/* Ondas centrais orgânicas fluidas */}
          <path
            d="M-100,420 C240,360 460,500 820,430 C1180,360 1360,460 1560,410"
            stroke="url(#waveStrokeTeal)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
          />
          <path
            d="M-60,490 C280,440 500,560 860,490 C1220,420 1400,520 1600,470"
            stroke="url(#waveStrokeCyan)"
            strokeWidth="1"
          />

          {/* Camada de onda inferior */}
          <path
            d="M0,760 C320,700 580,820 880,750 C1180,680 1340,790 1440,760 L1440,900 L0,900 Z"
            fill="url(#waveFillBottom)"
          />
          <path
            d="M0,800 C340,740 600,850 900,790 C1200,730 1360,820 1440,800"
            stroke="url(#waveStrokeTeal)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Conteúdo Central Responsivo */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-center">
        
        {/* Cabeçalho Inline nas Etapas do Formulário (1 a 5) */}
        {step >= 1 && step <= 5 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="focus:outline-none hover:opacity-85 transition-opacity"
                title="Voltar ao início"
              >
                <img 
                  src="/logo-manancial.png" 
                  alt="Igreja Manancial" 
                  className="h-10 w-auto object-contain"
                />
              </button>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-100/90 px-3 py-1 rounded-full border border-cyan-200 shadow-sm">
                Passo {step} de 5
              </span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full h-1.5 bg-slate-200/90 rounded-full overflow-hidden mt-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-cyan-600 to-teal-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ETAPA 0: BOAS-VINDAS E VERSÍCULO */}
        {step === 0 && (
          <div className="text-center space-y-6 animate-fadeIn py-4">
            {/* Logo Oficial da Manancial */}
            <div className="flex justify-center">
              <img 
                src="/logo-manancial.png" 
                alt="Igreja Manancial" 
                className="w-48 sm:w-56 h-auto drop-shadow-md"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-100/90 border border-cyan-300 text-cyan-900 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
              <span>Você é nosso convidado de honra</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Que bênção ter você conosco hoje!
              </h2>
              <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-50/80 to-white border border-cyan-200 text-slate-800 shadow-sm">
                <p className="text-base sm:text-lg italic leading-relaxed text-cyan-950 font-serif">
                  “Quem crer em mim, como diz a Escritura: do seu interior fluirão rios de água viva.”
                </p>
                <span className="block mt-2 text-xs tracking-wider uppercase text-cyan-700 font-bold">
                  João 7:38
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed max-w-xs mx-auto text-slate-600 font-medium">
              Separamos 1 minutinho para podermos te conhecer melhor
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-[#082f38] text-white font-bold text-base shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:opacity-95"
              >
                <span>Quero me Conectar</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 1: FREQUÊNCIA */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                Passo 1 de 5
              </span>
              <h2 className="text-xl sm:text-2xl mt-1 font-extrabold text-slate-900">
                É a sua primeira vez aqui na Manancial?
              </h2>
              <p className="text-xs mt-1 text-slate-500">Selecione uma das opções abaixo:</p>
            </div>

            <div className="space-y-3">
              {[
                { 
                  id: 'PRIMEIRA_VEZ', 
                  title: 'É minha primeira vez!', 
                  desc: 'Vim hoje conhecer a igreja', 
                  badge: 'Bem-vindo!'
                },
                { 
                  id: 'SEGUNDA_MAIS', 
                  title: 'Já vim 2 vezes ou mais', 
                  desc: 'Estou voltando e gostando',
                  badge: 'Que alegria!' 
                },
                { 
                  id: 'FREQUENTO_SEMPRE', 
                  title: 'Já frequento com regularidade', 
                  desc: 'Participo com frequência dos cultos',
                  badge: 'De casa' 
                },
              ].map(opt => {
                const selected = formData.frequency === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('frequency', opt.id as any)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between ${
                      selected 
                        ? 'bg-cyan-50/90 border-2 border-cyan-600 shadow-md shadow-cyan-950/5 text-cyan-950' 
                        : 'bg-white border border-slate-200/90 text-slate-800 hover:border-cyan-300 hover:bg-cyan-50/20 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className={`text-base font-bold ${selected ? 'text-cyan-950' : 'text-slate-900'}`}>
                        {opt.title}
                      </div>
                      <div className="text-xs mt-0.5 text-slate-500">{opt.desc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${
                        selected 
                          ? 'bg-cyan-600 text-white font-bold' 
                          : 'bg-slate-100 text-slate-700 font-semibold'
                      }`}>
                        {opt.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ETAPA 2: NOME E WHATSAPP */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                Passo 2 de 5
              </span>
              <h2 className="text-xl sm:text-2xl mt-1 font-extrabold text-slate-900">
                Como podemos te chamar?
              </h2>
              <p className="text-xs mt-1 text-slate-500">
                Seu contato nos ajuda a enviar uma palavra de carinho durante a semana.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5 flex items-center gap-1.5 text-slate-700 font-bold">
                  <User className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Seu nome ou como prefere ser chamado *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ana Clara ou Caio Augusto"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl text-base bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5 flex items-center gap-1.5 text-slate-700 font-bold">
                  <Phone className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Seu WhatsApp com DDD *</span>
                </label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-xl text-base tracking-wide bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs bg-cyan-50/80 border border-cyan-200 text-slate-700">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-700" />
                <span>
                  Respeitamos sua privacidade. Nada de ligações incômodas ou spam; apenas uma mensagem de boas-vindas.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: INTENÇÃO / MOMENTO */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                Passo 3 de 5
              </span>
              <h2 className="text-xl sm:text-2xl mt-1 font-extrabold text-slate-900">
                Qual é o seu momento hoje?
              </h2>
              <p className="text-xs mt-1 text-slate-500">Selecione o que melhor te representa:</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'QUERO_VISITA',
                  title: 'Quero uma visita',
                  desc: 'Receber uma visita pastoral em casa ou um café com nossos líderes',
                  icon: HeartHandshake
                },
                {
                  id: 'QUERO_SER_MEMBRO',
                  title: 'Quero ser membro da Manancial',
                  desc: 'Quero caminhar junto com esta igreja',
                  icon: Church
                },
                {
                  id: 'PEDIDO_ORACAO',
                  title: 'Quero registrar pedido de oração',
                  desc: 'Apresentar um clamor por saúde, família, trabalho ou gratidão',
                  icon: Heart
                }
              ].map(opt => {
                const selected = formData.intention === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('intention', opt.id as any)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-start gap-3.5 ${
                      selected 
                        ? 'bg-cyan-50/90 border-2 border-cyan-600 shadow-md shadow-cyan-950/5 text-cyan-950' 
                        : 'bg-white border border-slate-200/90 text-slate-800 hover:border-cyan-300 hover:bg-cyan-50/20 shadow-sm'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl mt-0.5 transition-colors ${
                      selected 
                        ? 'bg-cyan-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-base font-bold ${selected ? 'text-cyan-950' : 'text-slate-900'}`}>
                        {opt.title}
                      </div>
                      <div className="text-xs mt-0.5 text-slate-500">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Opção Pular essa etapa ou responder depois */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  updateField('intention', 'PULAR');
                  nextStep();
                }}
                className={`w-full p-3.5 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold active:scale-[0.99] ${
                  formData.intention === 'PULAR'
                    ? 'bg-cyan-50/90 border-2 border-cyan-600 text-cyan-950'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
                }`}
              >
                <span>Pular essa etapa ou responder depois</span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </div>

            {/* Sub-fluxo se escolheu "QUERO_VISITA" */}
            {formData.intention === 'QUERO_VISITA' && (
              <div className="p-4 rounded-2xl space-y-2.5 animate-fadeIn bg-cyan-50/90 border border-cyan-200 text-slate-900 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-cyan-900">
                  <HeartHandshake className="w-4 h-4 text-cyan-600" />
                  <span>Visita Pastoral & Acolhimento</span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed text-slate-700">
                  Nossa liderança entrará em contato pelo seu WhatsApp com carinho para combinar. Se desejar, deixe alguma observação (opcional):
                </p>
                <input
                  type="text"
                  placeholder="Ex: Melhor período da tarde, ou fins de semana..."
                  value={formData.visitNotes || ''}
                  onChange={(e) => updateField('visitNotes', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
                />
              </div>
            )}

            {/* Sub-fluxo se escolheu "PEDIDO_ORACAO" */}
            {formData.intention === 'PEDIDO_ORACAO' && (
              <div className="p-4 rounded-2xl space-y-2.5 animate-fadeIn bg-cyan-50/90 border border-cyan-200 text-slate-900 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-cyan-900">
                  <Heart className="w-4 h-4 text-cyan-600" />
                  <span>Registrar Pedido de Oração</span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed text-slate-700">
                  Nossos pastores e intercessores orarão pela sua causa. Escreva seu pedido abaixo:
                </p>
                <textarea
                  rows={3}
                  placeholder="Ex: Por saúde, família, trabalho ou gratidão..."
                  value={formData.prayerRequestNotes || ''}
                  onChange={(e) => updateField('prayerRequestNotes', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-xs bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
                />
              </div>
            )}

            {/* Sub-fluxo específico se escolheu "QUERO_SER_MEMBRO" */}
            {formData.intention === 'QUERO_SER_MEMBRO' && (
              <div className="p-4 rounded-2xl space-y-3 animate-fadeIn bg-cyan-50/90 border border-cyan-200 text-slate-900 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wide text-cyan-900">
                  Como prefere concluir sua adesão?
                </div>
                
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateField('memberRegistrationChoice', 'DEPOIS')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      formData.memberRegistrationChoice === 'DEPOIS'
                        ? 'bg-cyan-600 text-white font-bold border-cyan-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    📲 <strong>Notificar agora e finalizar depois via WhatsApp</strong>
                    <div className="text-[11px] opacity-80 mt-0.5">Enviaremos um link exclusivo no seu celular para terminar com calma.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('memberRegistrationChoice', 'AGORA')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      formData.memberRegistrationChoice === 'AGORA'
                        ? 'bg-cyan-600 text-white font-bold border-cyan-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    📝 <strong>Fazer o pré-cadastro agora mesmo</strong>
                    <div className="text-[11px] opacity-80 mt-0.5">Apenas 2 perguntas rápidas a mais.</div>
                  </button>
                </div>

                {formData.memberRegistrationChoice === 'AGORA' && (
                  <div className="space-y-3 pt-2 border-t border-cyan-200 text-xs">
                    <div>
                      <label className="block mb-1 font-bold text-slate-800">
                        Data de Nascimento ou Idade
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 24/08/1996 ou 28 anos"
                        value={formData.birthDate || ''}
                        onChange={(e) => updateField('birthDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-800">
                        Já é batizado(a) nas águas?
                      </label>
                      <div className="flex gap-2">
                        {['SIM', 'NAO'].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => updateField('isBaptized', v as any)}
                            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                              formData.isBaptized === v 
                                ? 'bg-cyan-600 text-white font-bold border-cyan-700 shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {v === 'SIM' ? 'Sim, já sou batizado' : 'Ainda não'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ETAPA 4: HISTÓRICO DE FÉ (Sensível & Opcional) */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  Passo 4 de 5
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Opcional
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl mt-1 font-extrabold text-slate-900">
                Já congregava em outro ministério?
              </h2>
              <p className="text-xs mt-1 text-slate-500">
                Não é necessário expor sua igreja anterior. Compartilhe apenas se sentir à vontade:
              </p>
            </div>

            {/* Tradição de Fé */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'PROTESTANTE', label: 'Protestante / Evangélica', icon: '⛪' },
                { id: 'CATOLICA', label: 'Católica', icon: '🕊️' },
                { id: 'NAO_CONGREGAVA', label: 'Não congregava', icon: '🌿' },
                { id: 'OUTRO', label: 'Outro histórico', icon: '🌐' },
              ].map(item => {
                const selected = formData.faithTradition === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      updateField('faithTradition', item.id as any);
                      if (item.id !== 'PROTESTANTE') {
                        updateField('protestantBranch', '');
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left text-xs flex flex-col justify-between transition-all ${
                      selected 
                        ? 'bg-cyan-50/90 border-2 border-cyan-600 shadow-md shadow-cyan-950/5 text-cyan-950' 
                        : 'bg-white border border-slate-200 text-slate-800 hover:bg-cyan-50/30 hover:border-cyan-300 shadow-sm'
                    }`}
                  >
                    <span className="text-xl mb-1.5">{item.icon}</span>
                    <span className="font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Ramificação rápida se Protestante */}
            {formData.faithTradition === 'PROTESTANTE' && (
              <div className="p-4 rounded-xl border space-y-3 animate-fadeIn bg-cyan-50/90 border-cyan-200 text-slate-900 shadow-sm">
                <span className="text-xs font-bold text-cyan-900">
                  Denominação aproximada (sugestões rápidas):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Assembleia de Deus',
                    'Congregação Cristã (CCB)',
                    'Batista',
                    'Ministério Independente',
                    'Presbiteriana / Metodista',
                    'Outra'
                  ].map(branch => {
                    const sel = formData.protestantBranch === branch;
                    return (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => updateField('protestantBranch', branch)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
                          sel 
                            ? 'bg-cyan-600 text-white font-bold border-cyan-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {branch}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] font-bold mb-1 text-slate-700">
                    Nome da igreja anterior (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Igreja Local ou Ministério X"
                    value={formData.customPreviousChurch || ''}
                    onChange={(e) => updateField('customPreviousChurch', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ETAPA 5: CUIDADO PASTORAL & ORAÇÃO (Opcional) */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  Passo 5 de 5
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Opcional
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl mt-1 font-extrabold text-slate-900">
                Podemos orar por você?
              </h2>
              <p className="text-xs mt-1 text-slate-500">
                Nossos pastores e intercessores dedicam tempo orando por cada visitante.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'ORACAO', title: 'Gostaria de uma oração', desc: 'Por saúde, família, trabalho ou gratidão' },
                { id: 'VISITA', title: 'Gostaria de receber uma visita pastoral', desc: 'Em casa ou um café com nossos líderes' },
                { id: 'NENHUM', title: 'Apenas visitando, tudo em paz!', desc: 'Obrigado pelo carinho' },
              ].map(opt => {
                const selected = formData.prayerPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('prayerPreference', opt.id as any)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selected 
                        ? 'bg-cyan-50/90 border-2 border-cyan-600 shadow-md shadow-cyan-950/5 text-cyan-950' 
                        : 'bg-white border border-slate-200 text-slate-800 hover:bg-cyan-50/30 hover:border-cyan-300 shadow-sm'
                    }`}
                  >
                    <div className={`text-sm font-bold ${selected ? 'text-cyan-950' : 'text-slate-900'}`}>
                      {opt.title}
                    </div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {formData.prayerPreference === 'ORACAO' && (
              <div className="animate-fadeIn pt-1">
                <label className="block text-xs font-bold mb-1.5 text-slate-700">
                  Qual é o seu pedido de oração? (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Escreva brevemente aqui..."
                  value={formData.prayerRequestNotes || ''}
                  onChange={(e) => updateField('prayerRequestNotes', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* ETAPA 6: CONFIRMAÇÃO & SUCESSO */}
        {step === 6 && (
          <div className="text-center space-y-6 animate-fadeIn py-6">
            {/* Logo da Manancial */}
            <div className="flex justify-center">
              <img 
                src="/logo-manancial.png" 
                alt="Igreja Manancial" 
                className="w-40 h-auto drop-shadow-sm"
              />
            </div>

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Obrigado, {formData.fullName.split(' ')[0] || 'Convidado'}!
              </h2>
              <p className="text-sm font-semibold text-cyan-800">
                Seus dados foram recebidos com muito carinho pela nossa liderança.
              </p>
              {formData.intention === 'QUERO_SER_MEMBRO' && (
                <div className="p-3 rounded-xl border text-xs max-w-xs mx-auto bg-cyan-50 border-cyan-300 text-cyan-900 font-medium">
                  🎉 Ficamos muito felizes pelo seu desejo de fazer parte da família Manancial! Nossa liderança entrará em contato pelo seu WhatsApp.
                </div>
              )}
            </div>

            {/* Próximos Cultos */}
            <div className="p-4 rounded-2xl border text-left space-y-2 text-xs bg-cyan-50/80 border-cyan-200 text-slate-800 shadow-sm">
              <div className="font-bold flex items-center gap-1.5 text-slate-900">
                <Calendar className="w-4 h-4 text-cyan-600" />
                Nossos Próximos Cultos:
              </div>
              <div className="space-y-1 text-slate-700">
                <div>• <strong>Domingo 09h30:</strong> Culto da Família & Ceia</div>
                <div>• <strong>Domingo 18h00:</strong> Culto de Celebração</div>
                <div>• <strong>Quarta-feira 19h30:</strong> Culto da Palavra & Oração</div>
              </div>
            </div>

            {/* Ações Finais */}
            <div className="space-y-2.5 pt-2">
              <a
                href="https://wa.me/5511999999999?text=Olá!%20Acabei%20de%20visitar%20a%20Igreja%20Manancial%20e%20gostaria%20de%20falar%20com%20a%20recepção."
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-transform"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Salvar WhatsApp da Igreja</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setStep(0);
                  setFormData(INITIAL_FORM);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs transition-colors bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
              >
                Cadastrar outro visitante
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Barra de Ações Inferior (Mobile Friendly com safe area) */}
      {step > 0 && step < 6 && (
        <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="py-3 px-4 rounded-xl flex items-center gap-1 active:scale-95 transition-transform text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            {/* Se estiver nas etapas opcionais (3, 4 ou 5), exibe botão pular discreto */}
            {(step === 3 || step === 4 || step === 5) && (
              <button
                type="button"
                onClick={() => {
                  if (step === 3) updateField('intention', 'PULAR');
                  if (step === 4) updateField('faithTradition', 'PULAR');
                  if (step === 5) updateField('prayerPreference', 'PULAR');
                  nextStep();
                }}
                className="text-xs px-2 py-2 transition-colors text-slate-500 hover:text-cyan-700 font-bold"
              >
                Pular
              </button>
            )}

            <button
              type="button"
              disabled={!isStepValid() || isSubmitting}
              onClick={nextStep}
              className={`flex-1 py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
                !isStepValid() || isSubmitting 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-[#082f38] text-white font-bold shadow-lg shadow-cyan-900/20 active:scale-98 hover:opacity-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : step === 5 ? (
                <span>Concluir</span>
              ) : (
                <>
                  <span>Avançar</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};
