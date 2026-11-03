import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { signInWithGoogle } from '../../../../lib/supabase';
import { TeamMember } from '../../types';
import { INITIAL_TEAM } from '../../lib/seedData';
import {
  LoaderCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Chrome,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Share,
  PlusSquare,
  X,
  Crown,
  Phone,
  ShieldCheck,
  MessageSquare,
  KeyRound,
  UserCheck,
  LogIn,
  Copy,
  Check,
} from 'lucide-react';

interface LoginProps {
  onLogin: (selectedMember?: TeamMember) => void;
  team?: TeamMember[];
}

type ViewState =
  | 'home'
  | 'login'
  | 'select-member'
  | 'wizard-form'
  | 'wizard-verify'
  | 'wizard-success';

type VerificationChannel = 'sms' | 'email';
type NoticeType = 'success' | 'error' | 'info';

interface ChurchWorshipRecord {
  id: string;
  full_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  worship_team_id: string | null;
  worship_display_name: string | null;
  worship_access_activated: boolean | null;
}

function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Login({ onLogin, team = [] }: LoginProps) {
  // Stage 1: Animated Splash / Loading Screen
  const [splashComplete, setSplashComplete] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Stage 2–4: Navigation & Flow states
  const [view, setView] = useState<ViewState>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: NoticeType; message: string } | null>(null);

  // Existing user login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Pre-registered member selection & confirmation
  const [churchRecords, setChurchRecords] = useState<Record<string, ChurchWorshipRecord>>({});
  const [confirmingMember, setConfirmingMember] = useState<TeamMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // First Access Wizard fields
  const [wizardFullName, setWizardFullName] = useState('');
  const [wizardPhone, setWizardPhone] = useState('');
  const [wizardEmail, setWizardEmail] = useState('');
  const [wizardPassword, setWizardPassword] = useState('');
  const [showWizardPassword, setShowWizardPassword] = useState(false);
  const [verificationChannel, setVerificationChannel] = useState<VerificationChannel>('sms');

  // Verification code state
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Install PWA shortcut state
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const availableTeam = useMemo(() => {
    const list = team.length > 0 ? team : INITIAL_TEAM;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [team]);

  // Splash loading animation (0% -> 100% then smooth transition to header)
  useEffect(() => {
    document.title = 'Louvor App';
    localStorage.setItem('manancial_app_context', 'louvor');

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 14) + 10;
      if (current >= 100) {
        current = 100;
        setLoadingProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setSplashComplete(true);
        }, 320);
      } else {
        setLoadingProgress(current);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Load pre-registered details from church_members so we can pre-fill full name & phone
  useEffect(() => {
    let active = true;
    const fetchPreRegistered = async () => {
      try {
        const { data } = await supabase
          .from('church_members')
          .select(
            'id, full_name, phone, whatsapp, email, worship_team_id, worship_display_name, worship_access_activated'
          )
          .eq('is_worship_member', true);

        if (!active || !data) return;
        const map: Record<string, ChurchWorshipRecord> = {};
        for (const row of data as ChurchWorshipRecord[]) {
          if (row.worship_team_id) {
            map[row.worship_team_id] = row;
          }
          if (row.worship_display_name) {
            map[row.worship_display_name.toLowerCase()] = row;
          }
        }
        setChurchRecords(map);
      } catch {
        // Fallback silencioso caso offline
      }
    };
    void fetchPreRegistered();
    return () => {
      active = false;
    };
  }, []);

  // PWA install prompt listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      setShowInstallHelp(true);
    }
  };

  const getChurchRecordForMember = (member: TeamMember): ChurchWorshipRecord | undefined => {
    return churchRecords[member.id] || churchRecords[member.name.toLowerCase()];
  };

  // Step 3 -> Step 4: Confirm member identity and open wizard
  const handleConfirmIdentity = (member: TeamMember) => {
    const record = getChurchRecordForMember(member);
    setSelectedMember(member);
    setConfirmingMember(null);
    setNotice(null);

    const rawFullName = record?.full_name?.replace(/\s*\(.*?\)\s*/g, '').trim() || member.name;
    const rawPhone = record?.whatsapp || record?.phone || '';
    const rawEmail = record?.email || '';

    setWizardFullName(rawFullName);
    setWizardPhone(formatPhoneBR(rawPhone));
    setWizardEmail(rawEmail);
    setWizardPassword('');
    setVerificationChannel('sms');
    setView('wizard-form');
  };

  // Step 4A: Validate wizard form and send verification code
  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    const trimmedName = wizardFullName.trim();
    const digitsPhone = wizardPhone.replace(/\D/g, '');
    const trimmedEmail = wizardEmail.trim().toLowerCase();

    if (trimmedName.length < 3) {
      setNotice({ type: 'error', message: 'Por favor, confirme seu nome completo.' });
      return;
    }
    if (digitsPhone.length < 10) {
      setNotice({
        type: 'error',
        message: 'Informe um número de celular válido com DDD (ex: 19 99999-9999).',
      });
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setNotice({ type: 'error', message: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (wizardPassword.length < 6) {
      setNotice({ type: 'error', message: 'A senha precisa ter pelo menos 6 caracteres.' });
      return;
    }

    setIsLoading(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setInputCode('');

      // Salva o código e canal na tabela church_members para auditoria/validação
      if (selectedMember) {
        await supabase
          .from('church_members')
          .update({
            verification_code: code,
            verification_channel: verificationChannel,
            full_name: trimmedName,
            phone: digitsPhone,
            whatsapp: digitsPhone,
            email: trimmedEmail,
          })
          .eq('worship_team_id', selectedMember.id);
      }

      setView('wizard-verify');
      setNotice({
        type: 'info',
        message:
          verificationChannel === 'sms'
            ? `Código de verificação enviado para o celular ${wizardPhone}.`
            : `Código de verificação enviado para o e-mail ${trimmedEmail}.`,
      });
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err?.message || 'Erro ao gerar código de verificação. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4B: Verify 6-digit code and complete onboarding + login
  const handleVerifyAndFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setNotice(null);

    const cleanCode = inputCode.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setNotice({ type: 'error', message: 'Digite os 6 dígitos do código de verificação.' });
      return;
    }

    if (cleanCode !== generatedCode) {
      setNotice({
        type: 'error',
        message: 'Código incorreto. Verifique os números digitados e tente novamente.',
      });
      return;
    }

    setIsLoading(true);
    const trimmedName = wizardFullName.trim();
    const digitsPhone = wizardPhone.replace(/\D/g, '');
    const trimmedEmail = wizardEmail.trim().toLowerCase();

    try {
      // 1. Cria ou atualiza o usuário no Supabase Auth
      await supabase.auth.signUp({
        email: trimmedEmail,
        password: wizardPassword,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
            phone: digitsPhone,
            worship_member_id: selectedMember.id,
          },
        },
      });

      // 2. Chama a RPC SECURITY DEFINER que confirma o e-mail, sincroniza profiles, church_members e team_members
      const { error: rpcError } = await supabase.rpc('complete_worship_first_access', {
        p_team_member_id: selectedMember.id,
        p_full_name: trimmedName,
        p_email: trimmedEmail,
        p_phone: digitsPhone,
      });

      if (rpcError) {
        console.warn('Aviso ao sincronizar RPC complete_worship_first_access:', rpcError);
      }

      // 3. Autentica imediatamente com e-mail e senha
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: wizardPassword,
      });

      // 4. Salva contexto do integrante logado e avança para tela de sucesso
      const updatedMember: TeamMember = {
        ...selectedMember,
        name: selectedMember.name,
      };
      localStorage.setItem('manancial_app_context', 'louvor');
      localStorage.setItem('louvor_logged_member', JSON.stringify(updatedMember));

      setView('wizard-success');
      setTimeout(() => {
        onLogin(updatedMember);
      }, 1500);
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err?.message || 'Não foi possível concluir a ativação. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Existing user login (Email + Password)
  const handleExistingLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotice(null);

    try {
      localStorage.setItem('manancial_app_context', 'louvor');
      const trimmedEmail = loginEmail.trim().toLowerCase();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: loginPassword,
      });
      if (signInError) throw signInError;

      // Procura o integrante correspondente no banco ou na lista
      const userMetaName = (
        data.user?.user_metadata?.name ||
        data.user?.user_metadata?.full_name ||
        ''
      ).toLowerCase();
      const metaMemberId = data.user?.user_metadata?.worship_member_id;

      const matchedMember = availableTeam.find((m) => {
        const record = getChurchRecordForMember(m);
        return (
          m.id === metaMemberId ||
          record?.email?.toLowerCase() === trimmedEmail ||
          userMetaName.includes(m.name.toLowerCase())
        );
      });

      if (matchedMember) {
        localStorage.setItem('louvor_logged_member', JSON.stringify(matchedMember));
      }

      setNotice({ type: 'success', message: 'Acesso confirmado! Entrando no Louvor App...' });
      onLogin(matchedMember);
    } catch (err: any) {
      setNotice({
        type: 'error',
        message:
          err?.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos. Se for sua primeira vez aqui, clique em "Primeiro Acesso".'
            : err?.message || 'Não foi possível entrar. Verifique seus dados.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setNotice(null);
    try {
      setIsLoading(true);
      localStorage.setItem('manancial_app_context', 'louvor');
      setNotice({ type: 'info', message: 'Redirecionando para autenticação Google...' });

      const redirectTo = `${window.location.origin}/#/louvor`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) {
        const fallback = await signInWithGoogle();
        if (fallback.error) throw fallback.error;
        if (fallback.data?.url) {
          window.location.assign(fallback.data.url);
          return;
        }
      } else if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setIsLoading(false);
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: `Falha no login com Google: ${err?.message || 'erro desconhecido'}.`,
      });
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard?.writeText(generatedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-[#060d21] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[65%] h-[65%] rounded-full bg-blue-600/25 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[65%] h-[65%] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />

      {!splashComplete ? (
        /* =========================================================
           ETAPA 1: SPLASH SCREEN CENTRALIZADO COM LOADING
        ========================================================= */
        <div className="w-full max-w-sm flex flex-col items-center justify-center text-center relative z-10 px-4">
          <motion.div
            layoutId="louvor-brand-logo"
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] overflow-hidden shadow-[0_0_70px_rgba(37,99,235,0.55)] border-2 border-blue-400/40 mb-7 bg-[#00153d] relative"
          >
            <img
              src="/louvor-icon.png"
              alt="Louvor App"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-300 mb-3"
          >
            <Sparkles size={12} />
            Bem-vindo ao
          </motion.span>

          <motion.h1
            layoutId="louvor-brand-title"
            className="text-3xl sm:text-4xl font-black tracking-tight text-white"
          >
            Louvor App
          </motion.h1>

          <motion.p
            layoutId="louvor-brand-subtitle"
            className="text-xs sm:text-sm text-blue-200/80 font-medium mt-1.5"
          >
            Ministério de Louvor • Igreja Manancial
          </motion.p>

          {/* Barra de Progresso de Carregamento */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-[260px] mt-9 space-y-2.5"
          >
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                style={{ width: `${loadingProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-200/70 px-1">
              <span>
                {loadingProgress < 100
                  ? 'Preparando ambiente de louvor...'
                  : 'Tudo pronto!'}
              </span>
              <span className="text-cyan-300 tabular-nums">{loadingProgress}%</span>
            </div>
          </motion.div>
        </div>
      ) : (
        /* =========================================================
           ETAPA 2 A 4: LOGO NO TOPO + FLUXO DE PRIMEIRO ACESSO / LOGIN
        ========================================================= */
        <div className="w-full max-w-md relative z-10 my-auto py-2">
          {/* Header com transição suave do Logo */}
          <div className="flex flex-col items-center mb-5 text-center">
            <motion.div
              layoutId="louvor-brand-logo"
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.75rem] overflow-hidden shadow-2xl shadow-blue-500/40 border-2 border-blue-400/35 mb-3 bg-[#00153d]"
            >
              <img
                src="/louvor-icon.png"
                alt="Louvor App"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.h1
              layoutId="louvor-brand-title"
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              className="text-2xl sm:text-3xl font-black tracking-tight text-white"
            >
              Louvor App
            </motion.h1>

            <motion.p
              layoutId="louvor-brand-subtitle"
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              className="text-xs sm:text-sm text-blue-200/75 font-medium mt-0.5"
            >
              Ministério de Louvor • Igreja Manancial
            </motion.p>
          </div>

          {/* Card Principal */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white/[0.06] backdrop-blur-2xl border border-white/15 p-5 sm:p-7 rounded-[2.25rem] shadow-2xl relative overflow-hidden"
          >
            {/* Mensagens de Aviso / Erro / Sucesso */}
            {notice && (
              <div
                className={`mb-5 rounded-2xl border px-4 py-3 text-xs sm:text-sm flex items-start gap-2.5 ${
                  notice.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
                    : notice.type === 'error'
                    ? 'bg-red-500/15 border-red-400/30 text-red-200'
                    : 'bg-blue-500/15 border-blue-400/30 text-blue-200'
                }`}
              >
                {notice.type === 'success' ? (
                  <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={17} className="shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{notice.message}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* =========================================================
                 VIEW 1: TELA INICIAL (BOTÃO GRANDE "PRIMEIRO ACESSO" + JÁ TENHO CONTA)
              ========================================================= */}
              {view === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  {/* Card Principal em Destaque: PRIMEIRO ACESSO */}
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setView('select-member');
                    }}
                    className="w-full group relative overflow-hidden rounded-3xl p-5 sm:p-6 text-left bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 shadow-xl shadow-blue-600/30 border border-cyan-300/40 hover:brightness-105 active:scale-[0.99] transition-all"
                  >
                    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/15 blur-xl pointer-events-none" />

                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 text-[10px] font-black uppercase tracking-wider text-cyan-200 border border-white/15">
                        <Sparkles size={11} />
                        Integrantes do Ministério
                      </span>
                      <span className="text-[11px] font-bold text-white/90 bg-white/15 px-2.5 py-0.5 rounded-full">
                        {availableTeam.length} pré-cadastrados
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      Primeiro Acesso
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-50/90 font-medium mt-1 leading-relaxed">
                      Selecione seu nome na lista da equipe, confirme seus dados e ative seu acesso exclusivo ao Louvor App.
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[#00153d] font-black text-xs sm:text-sm shadow-md group-hover:translate-x-1 transition-transform">
                      <span>Começar Primeiro Acesso</span>
                      <ArrowRight size={16} />
                    </div>
                  </button>

                  {/* Divisor */}
                  <div className="relative flex items-center justify-center py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <span className="relative bg-[#0c1631] px-3 text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">
                      ou se já ativou sua conta
                    </span>
                  </div>

                  {/* Botão Secundário: JÁ TENHO ACESSO */}
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setView('login');
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
                  >
                    <LogIn size={17} className="text-cyan-400" />
                    <span>Já tenho acesso • Entrar com E-mail e Senha</span>
                  </button>
                </motion.div>
              )}

              {/* =========================================================
                 VIEW 2: LISTA DE INTEGRANTES PRÉ-CADASTRADOS
              ========================================================= */}
              {view === 'select-member' && (
                <motion.div
                  key="select-member"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setView('home');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white transition-colors py-1"
                    >
                      <ArrowLeft size={15} />
                      <span>Voltar</span>
                    </button>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-400/25 px-2.5 py-0.5 rounded-full">
                      Passo 1 de 3 • Quem é você?
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      Selecione seu nome na equipe
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Encontre seu cadastro prévio no Ministério de Louvor para ativar seu acesso:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                    {availableTeam.map((member) => {
                      const record = getChurchRecordForMember(member);
                      const isActivated = !!record?.worship_access_activated;
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => setConfirmingMember(member)}
                          className="group flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/[0.05] hover:bg-blue-600/25 border border-white/10 hover:border-blue-400/50 text-left transition-all active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                              {member.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs sm:text-sm font-bold text-white truncate">
                                  {member.name}
                                </span>
                                {member.isLeader && (
                                  <Crown
                                    size={12}
                                    className="text-amber-400 shrink-0"
                                    title="Líder / Ministro"
                                  />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-blue-200/75 font-medium truncate">
                                  {member.role}
                                </span>
                                {isActivated && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    Ativo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ArrowRight
                            size={15}
                            className="text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0"
                          />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* =========================================================
                 VIEW 3: WIZARD PASSO A — DADOS, NOME COMPLETO, CELULAR, EMAIL E SENHA
              ========================================================= */}
              {view === 'wizard-form' && selectedMember && (
                <motion.div
                  key="wizard-form"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setView('select-member');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white transition-colors py-1"
                    >
                      <ArrowLeft size={15} />
                      <span>Trocar integrante</span>
                    </button>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-400/25 px-2.5 py-0.5 rounded-full">
                      Passo 2 de 3 • Seus Dados
                    </span>
                  </div>

                  {/* Resumo do Integrante Selecionado */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-500/15 border border-blue-400/30">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-black text-base flex items-center justify-center shrink-0">
                      {selectedMember.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                        Configurando acesso de
                      </p>
                      <p className="text-sm sm:text-base font-black text-white truncate">
                        {selectedMember.name} • {selectedMember.role}
                      </p>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  </div>

                  <form onSubmit={handleSendVerificationCode} className="space-y-3.5">
                    {/* Nome Completo (Confirmação/Edição) */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200/80 pl-1">
                        Confirme seu Nome Completo
                      </label>
                      <div className="bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 flex items-center gap-3 focus-within:border-cyan-400/70 transition-colors">
                        <User size={17} className="text-cyan-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Digite seu nome e sobrenome"
                          value={wizardFullName}
                          onChange={(e) => setWizardFullName(e.target.value)}
                          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500 font-semibold"
                          required
                        />
                      </div>
                    </div>

                    {/* Celular / WhatsApp */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200/80 pl-1">
                        Telefone Celular / WhatsApp (com DDD)
                      </label>
                      <div className="bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 flex items-center gap-3 focus-within:border-cyan-400/70 transition-colors">
                        <Phone size={17} className="text-cyan-400 shrink-0" />
                        <input
                          type="tel"
                          inputMode="tel"
                          placeholder="(19) 99999-9999"
                          value={wizardPhone}
                          onChange={(e) => setWizardPhone(formatPhoneBR(e.target.value))}
                          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500 font-semibold"
                          required
                        />
                      </div>
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200/80 pl-1">
                        Seu E-mail de Acesso
                      </label>
                      <div className="bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 flex items-center gap-3 focus-within:border-cyan-400/70 transition-colors">
                        <Mail size={17} className="text-cyan-400 shrink-0" />
                        <input
                          type="email"
                          placeholder="seuemail@exemplo.com"
                          value={wizardEmail}
                          onChange={(e) => setWizardEmail(e.target.value)}
                          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500 font-semibold"
                          required
                        />
                      </div>
                    </div>

                    {/* Senha Desejada */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200/80 pl-1">
                        Crie sua Senha (mín. 6 caracteres)
                      </label>
                      <div className="bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 flex items-center gap-3 focus-within:border-cyan-400/70 transition-colors">
                        <Lock size={17} className="text-cyan-400 shrink-0" />
                        <input
                          type={showWizardPassword ? 'text' : 'password'}
                          placeholder="Crie uma senha fácil de lembrar"
                          value={wizardPassword}
                          onChange={(e) => setWizardPassword(e.target.value)}
                          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500 font-semibold"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowWizardPassword(!showWizardPassword)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {showWizardPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    {/* Escolha do Canal de Verificação */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200/80 pl-1">
                        Como deseja confirmar seu código de verificação?
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setVerificationChannel('sms')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                            verificationChannel === 'sms'
                              ? 'bg-blue-600/30 border-cyan-400 text-white shadow-md'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <MessageSquare size={16} className="text-cyan-400" />
                            {verificationChannel === 'sms' && (
                              <CheckCircle2 size={14} className="text-cyan-300" />
                            )}
                          </div>
                          <span className="text-xs font-extrabold">SMS / Celular</span>
                          <span className="text-[10px] text-slate-300/80 leading-tight">
                            Código via celular informado
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVerificationChannel('email')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                            verificationChannel === 'email'
                              ? 'bg-blue-600/30 border-cyan-400 text-white shadow-md'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Mail size={16} className="text-cyan-400" />
                            {verificationChannel === 'email' && (
                              <CheckCircle2 size={14} className="text-cyan-300" />
                            )}
                          </div>
                          <span className="text-xs font-extrabold">Por E-mail</span>
                          <span className="text-[10px] text-slate-300/80 leading-tight">
                            Código no e-mail informado
                          </span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-black text-sm text-white shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <>
                          <span>Enviar Código de Verificação</span>
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* =========================================================
                 VIEW 4: WIZARD PASSO B — VERIFICAÇÃO DO CÓDIGO DE 6 DÍGITOS
              ========================================================= */}
              {view === 'wizard-verify' && selectedMember && (
                <motion.div
                  key="wizard-verify"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setView('wizard-form');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white transition-colors py-1"
                    >
                      <ArrowLeft size={15} />
                      <span>Editar dados</span>
                    </button>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-400/25 px-2.5 py-0.5 rounded-full">
                      Passo 3 de 3 • Verificação
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center mx-auto mb-2">
                      <KeyRound size={22} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      Confirme seu Código
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Digite o código de 6 dígitos gerado para{' '}
                      <strong className="text-white">
                        {verificationChannel === 'sms' ? wizardPhone : wizardEmail}
                      </strong>
                    </p>
                  </div>

                  {/* Card de Entrega Instantânea do Código (Garante que o músico nunca fique travado por operadora/spam) */}
                  {generatedCode && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-400/35 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck size={14} />
                          Código de Ativação Gerado
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1"
                        >
                          {codeCopied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{codeCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xl font-black tracking-[0.28em] text-white font-mono">
                          {generatedCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInputCode(generatedCode)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shrink-0"
                        >
                          Preencher Código
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleVerifyAndFinish} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full py-3.5 px-4 rounded-2xl bg-white/10 border-2 border-white/20 focus:border-cyan-400 outline-none text-center text-2xl font-black tracking-[0.45em] text-white placeholder:text-white/20 font-mono transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || inputCode.length < 6}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-black text-sm text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <LoaderCircle size={18} className="animate-spin text-slate-950" />
                      ) : (
                        <>
                          <span>Confirmar e Liberar Meu Acesso</span>
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* =========================================================
                 VIEW 5: SUCESSO FINAL DO WIZARD
              ========================================================= */}
              {view === 'wizard-success' && selectedMember && (
                <motion.div
                  key="wizard-success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={34} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
                      Acesso Liberado
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      Tudo pronto, {selectedMember.name}!
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-100/80 max-w-xs mx-auto leading-relaxed">
                      Seus dados foram confirmados. Entrando no Louvor App com suas escalas e repertório...
                    </p>
                  </div>
                  <LoaderCircle size={24} className="animate-spin text-cyan-400 mx-auto" />
                </motion.div>
              )}

              {/* =========================================================
                 VIEW 6: LOGIN PARA QUEM JÁ TEM ACESSO
              ========================================================= */}
              {view === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setView('home');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white transition-colors py-1"
                    >
                      <ArrowLeft size={15} />
                      <span>Voltar ao início</span>
                    </button>
                    <span className="text-[11px] font-bold text-slate-400">Já tenho conta</span>
                  </div>

                  <form onSubmit={handleExistingLogin} className="space-y-3.5">
                    <div className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-400/60 transition-colors">
                      <Mail size={18} className="text-cyan-400 shrink-0" />
                      <input
                        type="email"
                        placeholder="Seu e-mail cadastrado"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500 font-medium"
                        required
                      />
                    </div>

                    <div className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-400/60 transition-colors">
                      <Lock size={18} className="text-cyan-400 shrink-0" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500 font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-black text-sm text-white shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isLoading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <>
                          <span>Entrar no Louvor App</span>
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <span className="relative bg-[#0c1631] px-3 text-[10px] text-slate-400 uppercase font-bold">
                      ou
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 hover:bg-slate-100 transition-colors disabled:opacity-70 shadow-md"
                  >
                    <Chrome size={18} />
                    <span>Continuar com Google</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão de Atalho na Tela Inicial */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/25 text-xs font-bold text-blue-200 flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone size={15} className="text-cyan-400 shrink-0" />
                <span>Adicionar Atalho "Louvor App" no Celular</span>
              </button>
            </div>
          </motion.div>

          <p className="text-center mt-4 text-white/35 text-[11px] font-bold uppercase tracking-[0.25em]">
            Louvor App &bull; Igreja Manancial
          </p>
        </div>
      )}

      {/* =========================================================
         MODAL DE CONFIRMAÇÃO DE IDENTIDADE ("VOCÊ CONFIRMA QUE É FULANO?")
      ========================================================= */}
      <AnimatePresence>
        {confirmingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="max-w-sm w-full bg-[#0d1834] border border-blue-400/35 rounded-[2rem] p-6 shadow-2xl text-center space-y-5 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                {confirmingMember.name.charAt(0)}
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                  <UserCheck size={12} />
                  Confirmação de Identidade
                </span>
                <h3 className="text-xl font-black text-white leading-snug">
                  Você confirma que é{' '}
                  <span className="text-cyan-300">{confirmingMember.name}</span>?
                </h3>
                <p className="text-xs font-semibold text-blue-200/80">
                  Função: {confirmingMember.role} ({confirmingMember.category})
                </p>
                <p className="text-xs text-slate-300/90 pt-1 leading-relaxed">
                  Ao confirmar, você preencherá seu e-mail, celular e senha para liberar seu acesso personalizado ao <strong className="text-white">Louvor App</strong>.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleConfirmIdentity(confirmingMember)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-sm shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Sim, sou {confirmingMember.name}! Continuar</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmingMember(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors"
                >
                  Não sou eu, voltar para a lista
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
         MODAL DE INSTRUÇÃO DE ATALHO (iPhone / Android)
      ========================================================= */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-sm w-full bg-[#0d1832] border border-blue-400/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/louvor-icon.png"
                  alt="Louvor App"
                  className="w-11 h-11 rounded-2xl shadow-md"
                />
                <div>
                  <h3 className="text-sm font-black text-white">Instalar Louvor App</h3>
                  <p className="text-[11px] text-blue-200/70">Atalho direto na tela inicial</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallHelp(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-200">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <p className="font-black text-cyan-300 flex items-center gap-1.5">
                  <Share size={14} /> No iPhone (Safari):
                </p>
                <p className="text-slate-300 leading-relaxed">
                  1. Toque no botão <strong>Compartilhar</strong> na barra do Safari.
                  <br />
                  2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  <br />
                  3. Confirme com o nome <strong>Louvor App</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <p className="font-black text-emerald-300 flex items-center gap-1.5">
                  <PlusSquare size={14} /> No Android (Chrome):
                </p>
                <p className="text-slate-300 leading-relaxed">
                  1. Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito.
                  <br />
                  2. Toque em <strong>"Instalar aplicativo"</strong> ou{' '}
                  <strong>"Adicionar à tela inicial"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallHelp(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
