import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Church, 
  Heart, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Sparkles, 
  Droplet, 
  AlertCircle, 
  Loader2, 
  Send, 
  ArrowLeft,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useChurchStore } from '../../store/churchStore';
import { ChurchMember, ChurchMinistry } from '../../types/church';
import { supabase } from '../../lib/supabase';

const MINISTRIES_LIST: { id: ChurchMinistry; label: string; desc: string }[] = [
  { id: 'Louvor', label: 'Louvor & Adoração', desc: 'Música, instrumentos e canto' },
  { id: 'Recepção', label: 'Recepção & Acolhimento', desc: 'Portaria e acolhimento nos cultos' },
  { id: 'Infantil', label: 'Ministério Infantil', desc: 'Cuidado e ensino das crianças' },
  { id: 'Mídia & Som', label: 'Mídia & Som', desc: 'Transmissão, projeção, som e mídias' },
  { id: 'Intercessão', label: 'Intercessão & Oração', desc: 'Equipe de oração e clamor' },
  { id: 'Diaconia', label: 'Diaconia', desc: 'Apoio na ceia, ordem e assistência' },
  { id: 'Jovens', label: 'Jovens & Adolescentes', desc: 'Reuniões e discipulado de jovens' },
  { id: 'Nenhum', label: 'Ainda não decidi', desc: 'Quero apenas congregar por enquanto' },
];

export const MemberCompleteRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { members, completeRegistration } = useChurchStore();

  const tokenParam = searchParams.get('token') || searchParams.get('id') || '';

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<ChurchMember | null>(null);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isBaptized, setIsBaptized] = useState<'SIM' | 'NAO'>('SIM');
  const [baptismDate, setBaptismDate] = useState('');
  const [ministry, setMinistry] = useState<ChurchMinistry>('Nenhum');
  const [address, setAddress] = useState('');
  const [pastoralNotes, setPastoralNotes] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Format phone helper
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Carrega os dados do membro pelo token ou id
  useEffect(() => {
    const findMember = async () => {
      setLoading(true);
      setErrorMessage(null);

      if (!tokenParam) {
        setLoading(false);
        return;
      }

      // 1. Procura primeiro na store local
      let found = members.find(
        (m) => m.inviteToken === tokenParam || m.id === tokenParam
      );

      // 2. Se não encontrou, busca no Supabase
      if (!found) {
        try {
          const { data, error } = await supabase()
            .from('church_members')
            .select('*')
            .or(`invite_token.eq.${tokenParam},id.eq.${tokenParam}`)
            .maybeSingle();

          if (data && !error) {
            found = {
              id: data.id,
              fullName: data.full_name,
              phoneWhatsApp: data.phone || data.whatsapp || '',
              email: data.email || undefined,
              birthDate: data.birth_date || undefined,
              baptismDate: data.baptism_date || undefined,
              role: data.role || 'Membro',
              ministry: data.ministry || 'Nenhum',
              status: data.status === 'ATIVO' ? 'Ativo' : 'Em Observação',
              registrationStatus: data.registration_status || 'PENDENTE',
              address: data.address || undefined,
              inviteToken: data.invite_token || undefined,
              consecutiveAbsences: 0,
              createdAt: data.created_at || new Date().toISOString()
            };
          }
        } catch (err) {
          console.warn('Erro ao consultar Supabase:', err);
        }
      }

      if (found) {
        setMember(found);
        setFullName(found.fullName);
        setPhone(formatPhone(found.phoneWhatsApp));
        setEmail(found.email || '');
        setBirthDate(found.birthDate || '');
        setBaptismDate(found.baptismDate || '');
        setIsBaptized(found.baptismDate ? 'SIM' : 'SIM');
        setMinistry(found.ministry || 'Nenhum');
        setAddress(found.address || '');
        setPastoralNotes(found.pastoralNotes || '');

        if (found.registrationStatus === 'CONCLUIDO') {
          setIsAlreadyCompleted(true);
        }
      }

      setLoading(false);
    };

    findMember();
  }, [tokenParam, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (!fullName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Por favor, informe um WhatsApp válido com DDD.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const updateData: Partial<ChurchMember> = {
      fullName: fullName.trim(),
      phoneWhatsApp: cleanPhone,
      email: email.trim() || undefined,
      birthDate: birthDate || undefined,
      baptismDate: isBaptized === 'SIM' ? (baptismDate || undefined) : undefined,
      ministry,
      address: address.trim() || undefined,
      pastoralNotes: pastoralNotes.trim() || undefined,
      registrationStatus: 'CONCLUIDO'
    };

    try {
      await completeRegistration(member.inviteToken || member.id, updateData);
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Falha ao concluir cadastro:', err);
      setErrorMessage('Ocorreu um erro ao salvar suas informações. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. ESTADO DE CARREGAMENTO
  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-sm font-bold text-slate-300">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  // 2. ESTADO DE TOKEN INVÁLIDO OU NÃO ENCONTRADO
  if (!member) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6">
        <div className="max-w-md mx-auto w-full pt-10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-xl">
            <AlertCircle size={38} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Link Não Localizado</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Não encontramos o cadastro vinculado a este link. O convite pode ter expirado ou o endereço acessado está incompleto.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 text-left space-y-3 shadow-lg">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">O que fazer?</h3>
            <p className="text-xs text-slate-300">
              Entre em contato com a secretaria da Igreja Manancial ou com seu líder para receber um novo link de cadastro exclusivo via WhatsApp.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <a
              href="https://wa.me/5519993843839?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20meu%20link%20de%20cadastro%20na%20Igreja%20Manancial."
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Send size={16} /> Falar no WhatsApp da Igreja
            </a>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Ir para a Página Inicial
            </button>
          </div>
        </div>

        <footer className="text-center text-[11px] text-slate-500 py-4">
          Igreja Evangélica Manancial • Ministério de São Pedro
        </footer>
      </div>
    );
  }

  // 3. ESTADO DE SUCESSO / JÁ CONCLUÍDO
  if (submitSuccess || (isAlreadyCompleted && !searchParams.get('editar'))) {
    const firstName = fullName.split(' ')[0] || fullName;

    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-[#082f38] via-slate-900 to-[#07161b] text-white flex flex-col justify-between p-4 sm:p-6">
        <div className="max-w-md mx-auto w-full pt-10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-75">
            <CheckCircle2 size={44} className="stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {submitSuccess ? 'Cadastro Concluído com Sucesso' : 'Membro Ativo e Registrado'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Graça e Paz, {firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed px-2">
              Seus dados foram registrados com sucesso no rol de membresia da <strong className="text-white">Igreja Evangélica Manancial</strong>. É uma honra tê-lo(a) conosco em aliança!
            </p>
          </div>

          {/* Card Resumo */}
          <div className="bg-slate-800/90 border border-teal-500/20 rounded-3xl p-5 text-left space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <span className="text-xs text-slate-400">Nome Oficial</span>
              <span className="text-xs font-bold text-white">{fullName}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <span className="text-xs text-slate-400">WhatsApp</span>
              <span className="text-xs font-bold text-white">{phone}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <span className="text-xs text-slate-400">Ministério</span>
              <span className="text-xs font-bold text-cyan-300">{ministry}</span>
            </div>
            {birthDate && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Data de Nascimento</span>
                <span className="text-xs font-bold text-white">
                  {birthDate.split('-').reverse().join('/')}
                </span>
              </div>
            )}
          </div>

          {/* Versículo de Bênção */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-center">
            <p className="text-xs text-cyan-200 italic font-medium">
              "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e te conceda a paz."
            </p>
            <span className="text-[10px] text-cyan-400 font-bold block mt-1">Números 6:24-26</span>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => setIsAlreadyCompleted(false)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
            >
              Atualizar ou Revisar Minhas Informações
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/30 transition-all"
            >
              Acessar Aplicativo Manancial
            </button>
          </div>
        </div>

        <footer className="text-center text-[11px] text-slate-500 py-4">
          Igreja Evangélica Manancial • Ministério de São Pedro
        </footer>
      </div>
    );
  }

  // 4. FORMULÁRIO DE PREENCHIMENTO DO CADASTRO
  const firstName = fullName.split(' ')[0] || member.fullName.split(' ')[0];

  return (
    <div className="min-h-[100dvh] bg-[#080d1a] text-slate-100 flex flex-col justify-between pb-12">
      {/* HEADER FIXO SUPERIOR COMPENSADO */}
      <header className="sticky top-0 z-40 bg-[#0b1224]/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Church size={18} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-tight text-white leading-tight">
                Igreja Evangélica Manancial
              </h2>
              <p className="text-[10px] text-cyan-400 font-bold">Ficha Oficial de Membresia</p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Pré-cadastro
          </span>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM SCROLL FLUIDO */}
      <main className="max-w-xl mx-auto w-full px-4 pt-6 space-y-6">
        
        {/* BOAS-VINDAS / INTRODUÇÃO */}
        <div className="bg-gradient-to-br from-[#11192e] to-[#0a1224] p-5 sm:p-6 rounded-3xl border border-cyan-900/40 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles size={18} />
            <span className="text-xs font-black uppercase tracking-wider">Confirmação de Dados</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Graça e Paz, {firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Seja muito bem-vindo(a) à Família Manancial! Por favor, confira e complete seus dados abaixo para que possamos cuidar ainda melhor de você e de sua família.
          </p>
        </div>

        {/* ALERTA DE ERRO */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BLOCO 1: DADOS PESSOAIS */}
          <div className="bg-[#11192e] p-5 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400">
              <User size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">1. Identificação Pessoal</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nome Completo <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone size={12} className="text-cyan-400" /> WhatsApp / Telefone <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(19) 99999-9999"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={12} className="text-cyan-400" /> Data de Nascimento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Para orarmos por você no seu dia!</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail size={12} className="text-cyan-400" /> E-mail (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* BLOCO 2: VIDA CRISTÃ & MINISTÉRIO */}
          <div className="bg-[#11192e] p-5 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400">
              <Droplet size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">2. Vida Cristã & Ministério</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Já é batizado(a) nas águas?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBaptized('SIM')}
                  className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isBaptized === 'SIM'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30 border border-cyan-400/50'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Check size={14} /> Sim, sou batizado(a)
                </button>

                <button
                  type="button"
                  onClick={() => setIsBaptized('NAO')}
                  className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isBaptized === 'NAO'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 border border-amber-400/50'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Ainda não me batizei
                </button>
              </div>
            </div>

            {isBaptized === 'SIM' && (
              <div className="animate-in fade-in">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Data ou Ano aproximado do Batismo (Opcional)
                </label>
                <input
                  type="date"
                  value={baptismDate}
                  onChange={(e) => setBaptismDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Em qual ministério você atua ou gostaria de servir na igreja?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MINISTRIES_LIST.map((m) => {
                  const isSelected = ministry === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMinistry(m.id)}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-sm'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{m.label}</span>
                        {isSelected && <CheckCircle2 size={14} className="text-cyan-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BLOCO 3: ENDEREÇO & CUIDADO PASTORAL */}
          <div className="bg-[#11192e] p-5 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400">
              <MapPin size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">3. Endereço & Visitas</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Endereço Residencial (Rua, Número, Bairro e Cidade)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Centro, São Pedro"
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Importante para apoio e visitas pastorais quando necessário.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Pedido de Oração ou Mensagem para o Pastor (Confidencial)
              </label>
              <textarea
                rows={3}
                value={pastoralNotes}
                onChange={(e) => setPastoralNotes(e.target.value)}
                placeholder="Escreva aqui seu pedido de oração, algo sobre sua família ou dúvida..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* TERMO DE PRIVACIDADE & SEGURANÇA */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Seus dados são protegidos e de uso exclusivo da liderança da Igreja Evangélica Manancial para fins eclesiásticos e pastorais.
            </span>
          </div>

          {/* BOTÃO DE CONFIRMAÇÃO */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-cyan-900/40 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Finalizando seu cadastro...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Finalizar e Confirmar Meu Cadastro</span>
              </>
            )}
          </button>
        </form>
      </main>

      <footer className="text-center text-[11px] text-slate-500 pt-8 px-4">
        Igreja Evangélica Manancial • Ministério de São Pedro
      </footer>
    </div>
  );
};
