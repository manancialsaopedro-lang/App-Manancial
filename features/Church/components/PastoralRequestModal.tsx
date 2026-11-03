import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  X,
  Check,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  Lock,
  Users,
  Send,
  CheckCircle2,
  BellRing,
  Trash2
} from 'lucide-react';
import {
  ChurchRequestItem,
  PASTORAL_TOPICS,
  PASTOR_ROUTING_OPTIONS,
  getStoredPastoralRequests,
  saveStoredPastoralRequests
} from '../data/churchMemberData';

interface PastoralRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberFullName: string;
  initialTopicId?: string;
  initialSubject?: string;
  onSuccess?: (newRequest: ChurchRequestItem) => void;
}

export const PastoralRequestModal: React.FC<PastoralRequestModalProps> = ({
  isOpen,
  onClose,
  memberFullName,
  initialTopicId,
  initialSubject,
  onSuccess,
}) => {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('Gabinete & Aconselhamento');
  const [urgency, setUrgency] = useState<'Normal' | 'Urgente'>('Normal');
  const [requestSubject, setRequestSubject] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [preferredShift, setPreferredShift] = useState('Qualquer horário');
  const [preferredPastorRouting, setPreferredPastorRouting] = useState<string>(
    PASTOR_ROUTING_OPTIONS[0]
  );
  const [requesterName, setRequesterName] = useState(memberFullName);
  const [requesterPhone, setRequesterPhone] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<'Pastores' | 'Intercessão'>('Pastores');

  const memberFirstName = memberFullName.split(' ')[0] || 'Membro';

  useEffect(() => {
    if (isOpen) {
      if (initialTopicId) {
        setSelectedTopicId(initialTopicId);
        setWizardStep(initialSubject ? 2 : 1);
      } else {
        setSelectedTopicId('Gabinete & Aconselhamento');
        setWizardStep(1);
      }
      setUrgency('Normal');
      setRequestSubject(initialSubject || '');
      setRequestDetails('');
      setPreferredShift('Qualquer horário');
      setPreferredPastorRouting(PASTOR_ROUTING_OPTIONS[0]);
      setRequesterName(memberFullName);
      setPrivacyLevel('Pastores');
    }
  }, [isOpen, initialTopicId, initialSubject, memberFullName]);

  if (!isOpen) return null;

  const activeTopic =
    PASTORAL_TOPICS.find((t) => t.id === selectedTopicId) || PASTORAL_TOPICS[0];

  const handleConfirmWizard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject.trim() || !requesterName.trim()) return;

    const isDirectedToAdenilson = preferredPastorRouting.includes('Adenilson');
    const isDirectedToTeam = preferredPastorRouting.includes('Auxiliares');

    const assignedPastorLabel = isDirectedToAdenilson
      ? 'Pr. Adenilson Freitas (Direcionado)'
      : isDirectedToTeam
      ? 'Equipe Pastoral (Direcionado pelo Pastor)'
      : 'Pastor Titular (Atende direto ou direciona)';

    const routingMode: 'Atendimento Direto' | 'Direcionado' =
      isDirectedToAdenilson || isDirectedToTeam ? 'Direcionado' : 'Atendimento Direto';

    const newRequest: ChurchRequestItem = {
      id: Date.now().toString(),
      subject: requestSubject.trim(),
      type: 'Atendimento Pastoral',
      subCategory: activeTopic.label,
      requester: requesterName.trim(),
      phone: requesterPhone.trim() || undefined,
      details: requestDetails.trim()
        ? `${requestDetails.trim()} | Área: ${activeTopic.label} | Turno: ${preferredShift} | Prioridade: ${urgency} | Direcionamento: ${assignedPastorLabel}`
        : `Área: ${activeTopic.label} | Turno preferencial: ${preferredShift} | Prioridade: ${urgency} | Direcionamento: ${assignedPastorLabel}`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
      urgency,
      preferredShift,
      privacyLevel,
      assignedPastor: assignedPastorLabel,
      routingMode,
      pastorNotified: true,
    };

    const currentList = getStoredPastoralRequests();
    const updated = [newRequest, ...currentList];
    saveStoredPastoralRequests(updated);

    if (onSuccess) {
      onSuccess(newRequest);
    }
    setWizardStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl z-10 border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Topo do Wizard */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-5 sm:px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#082f38] text-cyan-200 flex items-center justify-center shrink-0">
                <HeartHandshake size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800 block">
                  {wizardStep < 4
                    ? `Atendimento Pastoral • Passo ${wizardStep} de 3`
                    : 'Notificação Enviada ao Pastor'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {wizardStep === 1 && 'Qual o motivo do Atendimento Pastoral?'}
                  {wizardStep === 2 && activeTopic.label}
                  {wizardStep === 3 && 'Direcionamento Pastoral & Contato'}
                  {wizardStep === 4 && 'Solicitação Enviada ao Pastor!'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {wizardStep < 4 && (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${
                    wizardStep >= step ? 'bg-[#082f38]' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          {/* PASSO 1: FOCO DO ATENDIMENTO PASTORAL + URGÊNCIA */}
          {wizardStep === 1 && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-950 font-medium leading-relaxed">
                <strong>Como funciona:</strong> Sua solicitação é registrada como{' '}
                <strong>Atendimento Pastoral</strong> e notifica imediatamente o Pastor, que pode atender você diretamente ou direcionar para outros pastores da igreja.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PASTORAL_TOPICS.map((topic) => {
                  const isSelected = selectedTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-[#082f38] bg-cyan-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-slate-900">{topic.label}</h4>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#082f38] text-white flex items-center justify-center shrink-0">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-snug">{topic.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Nível de Urgência
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUrgency('Normal')}
                    className={`py-3 px-4 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      urgency === 'Normal'
                        ? 'border-[#082f38] bg-[#082f38] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Clock size={15} />
                    <span>Atendimento Normal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('Urgente')}
                    className={`py-3 px-4 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      urgency === 'Urgente'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    <AlertCircle size={15} />
                    <span>Urgente / Hospitalar</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <span>Continuar</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* PASSO 2: ASSUNTO, SUGESTÕES RÁPIDAS E DETALHES */}
          {wizardStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Sugestões Rápidas (Toque para preencher)
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeTopic.suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setRequestSubject(sug)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        requestSubject === sug
                          ? 'bg-[#082f38] text-white border-[#082f38]'
                          : 'bg-slate-100 hover:bg-cyan-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Assunto Principal do Atendimento Pastoral *
                </label>
                <input
                  type="text"
                  required
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  placeholder="Ex: Conversa pastoral, oração pela família, visita..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#082f38] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Detalhes ou Observações para o Pastor (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                  placeholder="Escreva brevemente como nossa equipe pastoral pode caminhar com você..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#082f38] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Melhor Turno para Atendimento / Retorno
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Qualquer horário', 'Manhã', 'Tarde', 'Noite'].map((shift) => (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => setPreferredShift(shift)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        preferredShift === shift
                          ? 'bg-cyan-100 border-[#082f38] text-[#082f38] font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {shift}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={15} />
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  disabled={!requestSubject.trim()}
                  onClick={() => setWizardStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] disabled:opacity-40 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <span>Próximo Passo</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3: DIRECIONAMENTO PASTORAL, WHATSAPP E SIGILO */}
          {wizardStep === 3 && (
            <form onSubmit={handleConfirmWizard} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Seu Nome ou da Família *
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      required
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-[#082f38] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    WhatsApp para Retorno Pastoral
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                      placeholder="(22) 99999-9999"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#082f38] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Notificação & Direcionamento Pastoral
                </label>
                <div className="space-y-2">
                  {PASTOR_ROUTING_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPreferredPastorRouting(option)}
                      className={`w-full p-3 rounded-xl border-2 text-left text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        preferredPastorRouting === option
                          ? 'border-[#082f38] bg-cyan-50/60 text-[#082f38]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{option}</span>
                      {preferredPastorRouting === option && (
                        <Check size={15} className="text-[#082f38] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  Preferência de Privacidade & Sigilo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrivacyLevel('Pastores')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      privacyLevel === 'Pastores'
                        ? 'border-[#082f38] bg-cyan-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                      <Lock size={14} className="text-[#082f38]" />
                      <span>Sigilo Pastoral Restrito</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Visível somente ao Pastor Titular e pastores designados.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrivacyLevel('Intercessão')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      privacyLevel === 'Intercessão'
                        ? 'border-[#082f38] bg-cyan-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                      <Users size={14} className="text-[#082f38]" />
                      <span>Pastores + Equipe de Oração</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Autoriza compartilhar o motivo de clamor com os intercessores.
                    </p>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={15} />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Send size={15} />
                  <span>Notificar Pastor & Enviar</span>
                </button>
              </div>
            </form>
          )}

          {/* PASSO 4: TELA DE SUCESSO */}
          {wizardStep === 4 && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
                  Notificação Pastoral Disparada
                </span>
                <h4 className="text-xl font-black text-slate-900">
                  Pedido de Atendimento Pastoral enviado, {memberFirstName}!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  O Pastor já recebeu a notificação da sua solicitação e poderá realizar o{' '}
                  <strong>atendimento direto</strong> ou <strong>direcionar para outros pastores</strong> da equipe conforme a necessidade.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-1.5 text-slate-700">
                <p>
                  <strong>Categoria:</strong> Atendimento Pastoral ({activeTopic.label})
                </p>
                <p>
                  <strong>Assunto:</strong> {requestSubject}
                </p>
                <p>
                  <strong>Fluxo Pastoral:</strong> {preferredPastorRouting}
                </p>
                <p>
                  <strong>Sigilo:</strong>{' '}
                  {privacyLevel === 'Pastores'
                    ? 'Exclusivo aos Pastores'
                    : 'Pastores & Intercessão'}
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PastoralRequestDetailModalProps {
  request: ChurchRequestItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const PastoralRequestDetailModal: React.FC<PastoralRequestDetailModalProps> = ({
  request,
  onClose,
  onDelete,
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#082f38] bg-cyan-100 px-2.5 py-0.5 rounded-md">
                Atendimento Pastoral
              </span>
              {request.subCategory && (
                <span className="text-[11px] font-bold text-slate-600">
                  • {request.subCategory}
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1.5">
              {request.subject}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Enviado em {request.createdAt} por {request.requester}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-black text-[#082f38]">
            <BellRing size={14} />
            <span>Notificação enviada ao Pastor</span>
          </div>
          <p className="text-slate-700 font-medium">
            Pastor Responsável / Direcionamento:{' '}
            <strong className="text-slate-900">
              {request.assignedPastor ||
                'Pastor Titular (Atendimento Direto ou Direcionamento)'}
            </strong>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-3">
            Andamento do Atendimento Pastoral
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900">
              <span className="text-[10px] font-black uppercase block">1. Pastor Notificado</span>
              <span className="text-[11px] font-bold">Na fila</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                request.status === 'Em Análise' || request.status === 'Atendido'
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-black uppercase block">
                2. Triagem / Pastor
              </span>
              <span className="text-[11px] font-bold">Em cuidado</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                request.status === 'Atendido'
                  ? 'bg-emerald-600 border-emerald-700 text-white'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-black uppercase block">3. Atendido</span>
              <span className="text-[11px] font-bold">Concluído</span>
            </div>
          </div>
        </div>

        {request.details && (
          <div>
            <span className="text-xs font-extrabold text-slate-800 block mb-1">
              Observações Registradas:
            </span>
            <p className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {request.details}
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onDelete(request.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Cancelar Solicitação</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#082f38] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
