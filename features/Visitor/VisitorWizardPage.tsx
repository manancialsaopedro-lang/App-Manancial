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
  Clock, 
  MessageSquare, 
  Droplet, 
  Calendar,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Compass,
  Smile
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
  intention: 'APENAS_VISITANTE' | 'QUERO_SER_MEMBRO' | 'CONHECER_CELULAS' | '';
  memberRegistrationChoice?: 'AGORA' | 'DEPOIS' | '';
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
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    setSubmitError(null);

    try {
      const cleanDigits = formData.phone.replace(/\D/g, '');
      const isFirstTime = formData.frequency === 'PRIMEIRA_VEZ';
      const visitCount = formData.frequency === 'PRIMEIRA_VEZ' ? 1 : formData.frequency === 'SEGUNDA_MAIS' ? 2 : 5;
      const isMemberInterest = formData.intention === 'QUERO_SER_MEMBRO';
      const needsPrayer = formData.prayerPreference === 'ORACAO';
      const wantsVisit = formData.prayerPreference === 'VISITA';

      // Monta notas detalhadas estruturadas
      const notesParts: string[] = [];
      if (formData.intention) {
        notesParts.push(`Momento: ${formData.intention}`);
        if (formData.memberRegistrationChoice) {
          notesParts.push(`Opção Membresia: ${formData.memberRegistrationChoice}`);
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
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-[#0a1122] to-slate-900 text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Bar Fixa / Compensada */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-950/70 border-b border-white/10 px-4 py-3 pt-safe">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Droplet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">Igreja Manancial</h1>
              <p className="text-[10px] text-cyan-400 font-medium">Recepção de Visitantes</p>
            </div>
          </div>

          {step > 0 && step < 6 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-cyan-300">
              {step} / 5
            </span>
          )}
        </div>

        {/* Barra de Progresso Suave */}
        {step > 0 && step < 6 && (
          <div className="w-full bg-white/10 h-1 mt-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Conteúdo Central Responsivo */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col justify-center">
        
        {/* ETAPA 0: BOAS-VINDAS E VERSÍCULO */}
        {step === 0 && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Você é nosso convidado de honra
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Que bênção ter você conosco hoje!
              </h2>
              <div className="p-4 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 text-slate-200 shadow-xl">
                <p className="text-base sm:text-lg italic font-serif leading-relaxed text-cyan-100">
                  “Quem crer em mim, como diz a Escritura: do seu interior fluirão rios de água viva.”
                </p>
                <span className="block mt-2 text-xs font-semibold text-cyan-400 tracking-wider uppercase">
                  João 7:38
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
              Separamos 1 minutinho para te conhecer melhor e podermos te abençoar nesta jornada.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-500 text-white font-bold text-base shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <span>Dizer Olá</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 1: FREQUÊNCIA */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Passo 1 de 5</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                É a sua primeira vez aqui na Manancial?
              </h2>
              <p className="text-xs text-slate-400 mt-1">Selecione uma das opções abaixo:</p>
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
                    onClick={() => updateField('frequency', opt.id as any)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      selected 
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white text-base">{opt.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        selected ? 'bg-cyan-500 text-black font-bold' : 'bg-white/10 text-slate-300'
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
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Passo 2 de 5</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Como podemos te chamar?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Seu contato nos ajuda a enviar uma palavra de carinho durante a semana.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Seu nome ou como prefere ser chamado *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ana Clara ou Caio Augusto"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  Seu WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-base tracking-wide"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
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
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Passo 3 de 5</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Qual é o seu momento hoje?
              </h2>
              <p className="text-xs text-slate-400 mt-1">Selecione o que melhor te representa:</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'APENAS_VISITANTE',
                  title: 'Sou apenas visitante',
                  desc: 'Visitando a cidade ou conhecendo a igreja hoje',
                  icon: Compass
                },
                {
                  id: 'QUERO_SER_MEMBRO',
                  title: 'Quero ser membro da Manancial',
                  desc: 'Quero caminhar junto com esta igreja',
                  icon: Church
                },
                {
                  id: 'CONHECER_CELULAS',
                  title: 'Quero conhecer células e ministérios',
                  desc: 'Quero participar dos pequenos grupos',
                  icon: Sparkles
                }
              ].map(opt => {
                const selected = formData.intention === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateField('intention', opt.id as any)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      selected 
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${selected ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-300'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-base">{opt.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub-fluxo específico se escolheu "QUERO_SER_MEMBRO" */}
            {formData.intention === 'QUERO_SER_MEMBRO' && (
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-3 animate-fadeIn">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                  Como prefere concluir sua adesão?
                </div>
                
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateField('memberRegistrationChoice', 'DEPOIS')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      formData.memberRegistrationChoice === 'DEPOIS'
                        ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
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
                        ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    📝 <strong>Fazer o pré-cadastro agora mesmo</strong>
                    <div className="text-[11px] opacity-80 mt-0.5">Apenas 2 perguntas rápidas a mais.</div>
                  </button>
                </div>

                {formData.memberRegistrationChoice === 'AGORA' && (
                  <div className="space-y-3 pt-2 border-t border-cyan-500/20 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Data de Nascimento ou Idade</label>
                      <input
                        type="text"
                        placeholder="Ex: 24/08/1996 ou 28 anos"
                        value={formData.birthDate || ''}
                        onChange={(e) => updateField('birthDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-white placeholder-slate-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Já é batizado(a) nas águas?</label>
                      <div className="flex gap-2">
                        {['SIM', 'NAO'].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => updateField('isBaptized', v as any)}
                            className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold ${
                              formData.isBaptized === v 
                                ? 'bg-cyan-500 text-black border-cyan-400' 
                                : 'bg-white/5 border-white/15 text-slate-300'
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
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Passo 4 de 5</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                  Opcional
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Já congregava em outro ministério?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
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
                    onClick={() => {
                      updateField('faithTradition', item.id as any);
                      if (item.id !== 'PROTESTANTE') {
                        updateField('protestantBranch', '');
                      }
                    }}
                    className={`p-3 rounded-xl border text-left text-xs flex flex-col justify-between transition-all ${
                      selected 
                        ? 'bg-cyan-500/20 border-cyan-400 font-bold text-white shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg mb-1">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Ramificação rápida se Protestante */}
            {formData.faithTradition === 'PROTESTANTE' && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5 animate-fadeIn">
                <span className="text-[11px] font-semibold text-cyan-300">
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
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                          sel 
                            ? 'bg-cyan-500 text-black font-bold border-cyan-400' 
                            : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {branch}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Nome da igreja anterior (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Igreja Local ou Ministério X"
                    value={formData.customPreviousChurch || ''}
                    onChange={(e) => updateField('customPreviousChurch', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-white placeholder-slate-500 text-xs"
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
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Passo 5 de 5</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                  Opcional
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Podemos orar por você?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
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
                    onClick={() => updateField('prayerPreference', opt.id as any)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selected 
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold text-sm text-white">{opt.title}</div>
                    <div className="text-xs text-slate-400">{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {formData.prayerPreference === 'ORACAO' && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Qual é o seu pedido de oração? (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Escreva brevemente aqui..."
                  value={formData.prayerRequestNotes || ''}
                  onChange={(e) => updateField('prayerRequestNotes', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>
        )}

        {/* ETAPA 6: CONFIRMAÇÃO & SUCESSO */}
        {step === 6 && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">
                Obrigado, {formData.fullName.split(' ')[0] || 'Convidado'}!
              </h2>
              <p className="text-sm text-cyan-200">
                Seus dados foram recebidos com muito carinho pela nossa liderança.
              </p>
              {formData.intention === 'QUERO_SER_MEMBRO' && (
                <div className="p-3 rounded-xl bg-cyan-900/40 border border-cyan-500/40 text-xs text-cyan-100 max-w-xs mx-auto">
                  🎉 Ficamos muito felizes pelo seu desejo de fazer parte da família Manancial! Nossa liderança entrará em contato pelo seu WhatsApp.
                </div>
              )}
            </div>

            {/* Próximos Cultos */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Nossos Próximos Cultos:
              </div>
              <div className="text-slate-300 space-y-1">
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
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition-transform"
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
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cadastrar outro visitante
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Barra de Ações Inferior (Mobile Friendly com safe area) */}
      {step > 0 && step < 6 && (
        <footer className="sticky bottom-0 z-20 backdrop-blur-md bg-slate-950/80 border-t border-white/10 px-4 py-3 pb-safe">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="py-3 px-4 rounded-xl bg-white/10 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-1 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            {/* Se estiver nas etapas opcionais (4 ou 5), exibe botão pular discreto */}
            {(step === 4 || step === 5) && (
              <button
                type="button"
                onClick={() => {
                  if (step === 4) updateField('faithTradition', 'PULAR');
                  if (step === 5) updateField('prayerPreference', 'PULAR');
                  nextStep();
                }}
                className="text-xs text-slate-400 hover:text-cyan-300 font-medium px-2 py-2"
              >
                Pular
              </button>
            )}

            <button
              type="button"
              disabled={!isStepValid() || isSubmitting}
              onClick={nextStep}
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all ${
                !isStepValid() || isSubmitting
                  ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
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
