import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Chrome,
  Info,
  User,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Tent,
  Crown,
  Wand2,
  KeyRound,
  LayoutGrid,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { DEFAULT_ADMIN_USER } from '../../store/slices/authSlice';
import {
  ADMIN_DEFAULT_EMAIL,
  ADMIN_DEFAULT_PASSWORD,
  isSupabaseConfigured,
  sendMagicLink,
  sendPasswordRecovery,
  signInWithEmailPassword,
  signInWithGoogle,
  signUpWithEmail,
  updateUserPassword,
} from '../../lib/supabase';
import { ManancialEmblem } from '../../components/splash/ManancialLogo';
import { ManancialWaterCanvas } from '../../components/splash/ManancialWaterCanvas';
import { GlassFold } from '../../components/ui/glass-fold';
import { MeshGradient } from '../../components/ui/mesh-gradient';
import {
  MANANCIAL_SHARED_IDS,
  MANANCIAL_SHARED_TRANSITION,
  PrepageBgMode,
  getSavedPrepageBg,
  setSavedPrepageBg,
} from '../../components/splash/ManancialSplashScreen';
import { WaterSimulation } from '../../components/splash/waterPhysics';

type NoticeType = 'success' | 'error' | 'info';
type AuthTabMode = 'login' | 'register' | 'magic' | 'recovery';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme, signIn, setDevRole } = useAppStore();

  const [bgMode, setBgMode] = useState<PrepageBgMode>(() => getSavedPrepageBg());
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<WaterSimulation | null>(null);

  useEffect(() => {
    const onBgChange = (e: Event) => {
      const detail = (e as CustomEvent<PrepageBgMode>).detail;
      if (detail === 'glass' || detail === 'water' || detail === 'mesh') setBgMode(detail);
    };
    window.addEventListener('manancial-bg-change', onBgChange);
    return () => window.removeEventListener('manancial-bg-change', onBgChange);
  }, []);

  // Auth form states
  const [authMode, setAuthMode] = useState<AuthTabMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPasswordDirect, setNewPasswordDirect] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  const [registerNotice, setRegisterNotice] = useState('');
  const [notice, setNotice] = useState<{ type: NoticeType; message: string } | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('confirmed') === '1') {
      setNotice({
        type: 'success',
        message: 'Confirmação concluída! Entre com seu e-mail/senha, Magic Link ou Google.',
      });
    }
  }, [location.search]);

  const handleStageTilt = useCallback(
    (rx: number, ry: number, normX: number, normY: number) => {
      if (tiltRef.current) {
        const tx = (ry * 12).toFixed(2);
        const ty = (-rx * 10).toFixed(2);
        tiltRef.current.style.transform = `perspective(950px) translate3d(${tx}px, ${ty}px, 0) rotateX(${(rx * 10).toFixed(2)}deg) rotateY(${(ry * 10).toFixed(2)}deg)`;
      }
      if (sheenRef.current) {
        const px = Math.round(normX * 100);
        const py = Math.round(normY * 100);
        sheenRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(165, 243, 252, 0.34), transparent 58%)`;
      }
    },
    [],
  );

  const handleCenterPulse = useCallback(() => {
    if (!simRef.current) return;
    simRef.current.injectPulse(
      simRef.current.width * 0.5,
      simRef.current.height * 0.48,
      1.3,
    );
  }, []);

  const clearNotice = () => setNotice(null);

  // Entrada instantânea de Administrador (Modo Construção — sem bloqueio)
  const handleInstantAdminAccess = async (targetPath = '/igreja') => {
    setIsLoading(true);
    clearNotice();
    setDevRole('admin');
    signIn(DEFAULT_ADMIN_USER.email, DEFAULT_ADMIN_USER.name, 'admin', undefined, {
      id: DEFAULT_ADMIN_USER.id,
      churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
      isWorshipMember: true,
      isWorshipLeader: true,
    });

    if (isSupabaseConfigured) {
      try {
        await signInWithEmailPassword(ADMIN_DEFAULT_EMAIL, ADMIN_DEFAULT_PASSWORD);
      } catch {
        // Continua com acesso Admin local mesmo se sem internet
      }
    }

    setIsLoading(false);
    navigate(targetPath, { replace: true });
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setNotice({ type: 'error', message: 'Digite seu e-mail para receber o Magic Link.' });
      return;
    }

    setIsLoading(true);
    clearNotice();
    try {
      if (!isSupabaseConfigured) {
        setNotice({ type: 'info', message: 'Modo local: entrando diretamente...' });
        setTimeout(() => handleInstantAdminAccess('/igreja'), 500);
        return;
      }

      const { error } = await sendMagicLink(trimmedEmail);
      if (error) throw error;

      setNotice({
        type: 'success',
        message: `Magic Link enviado para ${trimmedEmail}! Abra seu e-mail e clique no link para entrar sem senha.`,
      });
    } catch (err: any) {
      console.error('Erro ao enviar Magic Link:', err);
      const rawMsg = err?.message || 'erro desconhecido';
      const friendly = rawMsg.toLowerCase().includes('rate limit')
        ? 'Limite de envio de e-mails do Supabase atingido (máx. por hora no plano gratuito). Use o botão "Acesso Direto Admin" abaixo ou entre com a senha padrão Manancial2026!'
        : `Falha ao enviar Magic Link: ${rawMsg}`;
      setNotice({ type: 'error', message: friendly });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setNotice({ type: 'error', message: 'Digite seu e-mail para recuperar a senha.' });
      return;
    }

    setIsLoading(true);
    clearNotice();
    try {
      if (!isSupabaseConfigured) {
        setNotice({ type: 'success', message: 'Modo local ativo. Senha redefinida.' });
        return;
      }

      const { error } = await sendPasswordRecovery(trimmedEmail);
      if (error) throw error;

      setNotice({
        type: 'success',
        message: `Link de recuperação de senha enviado para ${trimmedEmail}! Verifique sua caixa de entrada e spam.`,
      });
    } catch (err: any) {
      console.error('Erro ao enviar recuperação de senha:', err);
      const rawMsg = err?.message || 'erro desconhecido';
      const friendly = rawMsg.toLowerCase().includes('rate limit')
        ? 'Limite de e-mails por hora do Supabase atingido. Você já pode entrar agora mesmo com sua senha Admin "Manancial2026!" ou redefinir diretamente abaixo!'
        : `Falha ao enviar link de recuperação: ${rawMsg}`;
      setNotice({ type: 'error', message: friendly });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectPasswordChange = async () => {
    if (newPasswordDirect.trim().length < 6) {
      setNotice({ type: 'error', message: 'Digite uma nova senha com pelo menos 6 caracteres.' });
      return;
    }
    setIsLoading(true);
    clearNotice();
    try {
      const targetEmail = email.trim().toLowerCase() || ADMIN_DEFAULT_EMAIL;
      // Garante sessão ativa antes de atualizar a senha
      await signInWithEmailPassword(targetEmail, ADMIN_DEFAULT_PASSWORD).catch(() => {});
      const { error } = await updateUserPassword(newPasswordDirect.trim());
      if (error) throw error;
      setPassword(newPasswordDirect.trim());
      setAuthMode('login');
      setNotice({
        type: 'success',
        message: `Senha alterada com sucesso para "${newPasswordDirect.trim()}"!`,
      });
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: `Não foi possível alterar diretamente (${err?.message || 'erro'}). Use a senha padrão Manancial2026! para entrar.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'magic') {
      await handleMagicLinkSubmit(e);
      return;
    }
    if (authMode === 'recovery') {
      await handlePasswordRecoverySubmit(e);
      return;
    }

    setIsLoading(true);
    setRegisterNotice('');
    clearNotice();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (authMode === 'register') {
      if (trimmedName.length < 2) {
        setNotice({ type: 'error', message: 'Informe seu nome completo para criar a conta.' });
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setNotice({ type: 'error', message: 'A senha precisa ter pelo menos 6 caracteres.' });
        setIsLoading(false);
        return;
      }

      try {
        if (!isSupabaseConfigured) {
          setShowRegisterSuccess(true);
          setRegisterNotice('Cadastro simulado. Configure o Supabase para envio real de e-mail.');
          return;
        }

        const { data, error } = await signUpWithEmail(trimmedEmail, password, trimmedName);
        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          setRegisterNotice('Este e-mail já está cadastrado. Faça login para continuar.');
          setNotice({ type: 'info', message: 'Conta já existente para este e-mail.' });
        } else {
          setRegisterNotice('Enviamos um e-mail de confirmação. Abra o link para ativar sua conta.');
          setNotice({ type: 'success', message: 'Cadastro realizado. Verifique seu e-mail para confirmar.' });
        }

        setShowRegisterSuccess(true);
      } catch (err: any) {
        console.error('Erro ao criar conta:', err);
        setNotice({ type: 'error', message: `Falha ao criar conta: ${err?.message || 'erro desconhecido'}.` });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (!isSupabaseConfigured) {
        setNotice({ type: 'info', message: 'Modo local sem Supabase: login simulado em andamento...' });

        window.setTimeout(() => {
          signIn(trimmedEmail, trimmedName || undefined, 'admin');
          setIsLoading(false);
          const from = (location.state as any)?.from?.pathname || '/igreja';
          navigate(from, { replace: true });
        }, 500);
        return;
      }

      const { error } = await signInWithEmailPassword(trimmedEmail, password);
      if (error) throw error;

      setNotice({ type: 'success', message: 'Login realizado com sucesso! Redirecionando...' });
      const from = (location.state as any)?.from?.pathname || '/igreja';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Erro no login:', err);
      const rawMessage = err?.message || 'erro desconhecido';
      const friendlyMessage =
        rawMessage === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos. Dica: todas as suas contas Admin foram configuradas com a senha padrão "Manancial2026!" (clique em "Preencher Admin" abaixo).'
          : `Falha no login: ${rawMessage}.`;
      setNotice({ type: 'error', message: friendlyMessage });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearNotice();

    if (!isSupabaseConfigured) {
      setNotice({
        type: 'error',
        message: 'Supabase ausente ou inválido. Use login por e-mail em modo local.',
      });
      return;
    }

    try {
      setIsLoading(true);
      setNotice({ type: 'info', message: 'Redirecionando para autenticação Google...' });

      const { data, error } = await signInWithGoogle();
      if (error) throw error;

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setIsLoading(false);
      setNotice({ type: 'error', message: 'Não foi possível iniciar o login Google. Tente novamente.' });
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      setNotice({ type: 'error', message: `Falha no login com Google: ${err?.message || 'erro desconhecido'}.` });
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = (targetEmail = ADMIN_DEFAULT_EMAIL) => {
    setEmail(targetEmail);
    setPassword(ADMIN_DEFAULT_PASSWORD);
    setAuthMode('login');
    setNotice({
      type: 'info',
      message: `Credenciais Admin preenchidas (${targetEmail} / ${ADMIN_DEFAULT_PASSWORD}). Clique em "Acessar painel" ou "Acesso Direto Admin".`,
    });
  };

  const inputWrapperClass = isDarkMode
    ? 'bg-white/[0.05] border-white/15 focus-within:border-[#4FD1E8]/70 focus-within:bg-white/[0.08]'
    : 'bg-white/90 border-[#082F38]/15 focus-within:border-[#0891B2] focus-within:bg-white shadow-2xs';

  const inputClass = isDarkMode
    ? 'bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500 font-medium text-sm min-w-0'
    : 'bg-transparent border-none outline-none text-[#082F38] w-full placeholder:text-slate-400 font-medium text-sm min-w-0';

  return (
    <LayoutGroup>
      <div
        className={`relative min-h-[100dvh] w-full overflow-x-hidden transition-colors duration-700 ${
          isDarkMode ? 'bg-[#06081e] text-[#F1F6F8]' : 'bg-[#EFF8FC] text-[#082F38]'
        }`}
      >
        {/* Continuous backdrop shared seamlessly between Pre-Page and Auth */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {bgMode === 'glass' ? (
            <GlassFold
              color1={isDarkMode ? '#1e3cc8' : '#3b82f6'}
              color2={isDarkMode ? '#06081e' : '#dbeafe'}
              color3={isDarkMode ? '#96d7ff' : '#ffffff'}
              speed={0.5}
              scale={1}
              noise={0.12}
              className="h-full w-full"
            />
          ) : bgMode === 'water' ? (
            <ManancialWaterCanvas
              intensity="full"
              isDarkMode={isDarkMode}
              onTiltChange={handleStageTilt}
              simulationRef={simRef}
            />
          ) : (
            <MeshGradient
              color1="#4c9bff"
              color2="#1f4fd8"
              color3="#0a1a4a"
              speed={0.8}
              distortion={1}
              swirl={0.57}
              scale={1.45}
              rotation={120}
              className="h-full w-full"
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="relative z-10 min-h-[100dvh] flex flex-col justify-between px-4 sm:px-10 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {/* Top Navigation Bar */}
            <div className="w-full max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-2 py-1">
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isDarkMode
                    ? 'text-[#A6C2CC] hover:bg-white/[0.06] hover:text-white'
                    : 'text-[#4A6B76] hover:bg-white/70 hover:text-[#082F38]'
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar para abertura</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInstantAdminAccess('/hub')}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-[11px] font-black text-slate-950 shadow-md transition-all hover:brightness-110 active:scale-95"
                  title="Abrir Hub com Todas as Telas sem bloqueio"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Todas as Telas (Hub)</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`inline-flex cursor-pointer items-center justify-center rounded-lg border p-2 text-[11px] font-medium transition-colors active:scale-95 ${
                    isDarkMode
                      ? 'border-white/10 bg-white/[0.04] text-[#B2C9D1] hover:border-white/20 hover:bg-white/[0.09] hover:text-white'
                      : 'border-[#082F38]/12 bg-white/80 text-[#082F38] shadow-2xs hover:bg-white'
                  }`}
                  aria-label="Alternar aparência"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-[#082F38]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/landing')}
                  className={`hidden sm:inline-flex cursor-pointer whitespace-nowrap text-xs font-medium transition-colors py-1.5 px-2 ${
                    isDarkMode
                      ? 'text-[#A6C2CC] hover:text-white'
                      : 'text-[#4A6B76] hover:text-[#082F38]'
                  }`}
                >
                  Conhecer o Manancial
                </button>
              </div>
            </div>

            {/* Center Auth Stage */}
            <div className="w-full max-w-md mx-auto my-auto py-4">
              {/* Shared Element Header */}
              <div className="flex flex-col items-center mb-5 text-center">
                <div className="mb-3.5">
                  <ManancialEmblem
                    size="md"
                    tiltRef={tiltRef}
                    sheenRef={sheenRef}
                    onPulse={handleCenterPulse}
                    layoutId={MANANCIAL_SHARED_IDS.logo}
                    isDarkMode={isDarkMode}
                    skipReveal
                  />
                </div>

                <motion.h1
                  layoutId={MANANCIAL_SHARED_IDS.title}
                  transition={MANANCIAL_SHARED_TRANSITION}
                  className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-[#082F38]'
                  }`}
                >
                  Manancial
                </motion.h1>

                <motion.p
                  layoutId={MANANCIAL_SHARED_IDS.subtitle}
                  transition={MANANCIAL_SHARED_TRANSITION}
                  className={`text-xs sm:text-sm font-normal mt-1 ${
                    isDarkMode ? 'text-[#B2C9D1]' : 'text-[#3B5B66]'
                  }`}
                >
                  Entre na sua conta para acessar o ecossistema
                </motion.p>
              </div>

              {/* Auth Card */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={`backdrop-blur-2xl border p-5 sm:p-7 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl ${
                  isDarkMode
                    ? 'bg-[#0C151B]/80 border-white/12 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)]'
                    : 'bg-white/85 border-white shadow-[0_24px_60px_-15px_rgba(8,47,56,0.14)]'
                }`}
              >
                {/* Botão Rápido Modo Construção / Admin Irrestrito */}
                <div
                  className={`mb-5 rounded-2xl border p-3 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-teal-500/15 border-amber-400/35'
                      : 'bg-gradient-to-r from-amber-50 via-cyan-50 to-teal-50 border-amber-300/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider ${
                        isDarkMode ? 'text-amber-300' : 'text-amber-900'
                      }`}
                    >
                      <Crown size={13} className="text-amber-400 shrink-0" />
                      Modo Construção Admin Ativo
                    </span>
                    <button
                      type="button"
                      onClick={() => fillAdminCredentials(ADMIN_DEFAULT_EMAIL)}
                      className={`text-[10px] font-bold underline cursor-pointer ${
                        isDarkMode ? 'text-cyan-300 hover:text-white' : 'text-cyan-800 hover:text-cyan-950'
                      }`}
                    >
                      Preencher Senha Admin
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleInstantAdminAccess('/igreja')}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Crown size={14} className="shrink-0" />
                      <span>Entrar Admin Agora</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInstantAdminAccess('/hub')}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                        isDarkMode
                          ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                          : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <Sparkles size={14} className="text-cyan-400 shrink-0" />
                      <span>Ver Todas as Telas</span>
                    </button>
                  </div>
                </div>

                {notice && (
                  <div
                    role="alert"
                    className={`mb-5 rounded-xl border px-4 py-3 text-xs sm:text-sm flex items-start gap-2.5 ${
                      notice.type === 'success'
                        ? isDarkMode
                          ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : notice.type === 'error'
                          ? isDarkMode
                            ? 'bg-red-500/15 border-red-400/35 text-red-200'
                            : 'bg-red-50 border-red-200 text-red-800'
                          : isDarkMode
                            ? 'bg-cyan-500/15 border-cyan-400/35 text-cyan-200'
                            : 'bg-cyan-50 border-cyan-200 text-cyan-900'
                    }`}
                  >
                    {notice.type === 'success' ? (
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{notice.message}</span>
                  </div>
                )}

                {showRegisterSuccess ? (
                  <div className="text-center py-2">
                    <div
                      className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center border ${
                        isDarkMode
                          ? 'bg-cyan-500/15 border-cyan-400/30 text-[#4FD1E8]'
                          : 'bg-cyan-50 border-cyan-200 text-[#0891B2]'
                      }`}
                    >
                      <ShieldCheck size={28} />
                    </div>
                    <h2
                      className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-[#082F38]'
                      }`}
                    >
                      Cadastro concluído
                    </h2>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${
                        isDarkMode ? 'text-[#B2C9D1]' : 'text-[#3B5B66]'
                      }`}
                    >
                      {registerNotice ||
                        'Sua conta foi criada. Verifique o e-mail para confirmar e depois faça login.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegisterSuccess(false);
                        setAuthMode('login');
                      }}
                      className={`mt-6 w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
                        isDarkMode
                          ? 'bg-[#32B7D9] text-[#051217] hover:bg-[#4FD1E8]'
                          : 'bg-[#0891B2] text-white hover:bg-[#0E7490]'
                      }`}
                    >
                      Ir para login
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Abas: Entrar | Magic Link | Recuperar | Criar Conta */}
                    <div
                      className={`grid grid-cols-4 gap-1 mb-5 border-b pb-2.5 ${
                        isDarkMode ? 'border-white/10' : 'border-[#082F38]/10'
                      }`}
                    >
                      {[
                        { id: 'login' as const, label: 'Entrar' },
                        { id: 'magic' as const, label: 'Magic Link' },
                        { id: 'recovery' as const, label: 'Senha' },
                        { id: 'register' as const, label: 'Criar' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setAuthMode(tab.id);
                            clearNotice();
                          }}
                          className={`pb-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            authMode === tab.id
                              ? isDarkMode
                                ? 'text-[#4FD1E8] border-b-2 border-[#4FD1E8]'
                                : 'text-[#0891B2] border-b-2 border-[#0891B2]'
                              : isDarkMode
                                ? 'text-slate-400 hover:text-slate-200'
                                : 'text-slate-400 hover:text-[#082F38]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {(authMode === 'login' || authMode === 'register') && (
                        <>
                          <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer ${
                              isDarkMode
                                ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg'
                                : 'bg-[#082F38] text-white hover:bg-[#0B3D48] shadow-md shadow-cyan-950/15'
                            }`}
                          >
                            <Chrome size={19} />
                            <span>Continuar com Google</span>
                          </button>

                          <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                              <div
                                className={`w-full border-t ${
                                  isDarkMode ? 'border-white/10' : 'border-[#082F38]/10'
                                }`}
                              />
                            </div>
                            <span
                              className={`relative px-3.5 py-0.5 rounded-full text-[11px] uppercase font-semibold tracking-wider ${
                                isDarkMode
                                  ? 'bg-[#0C151B] text-[#88A5B0]'
                                  : 'bg-[#F6FBFD] text-[#4A6B76]'
                              }`}
                            >
                              ou com e-mail
                            </span>
                          </div>
                        </>
                      )}

                      {authMode === 'magic' && (
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#B2C9D1]' : 'text-[#3B5B66]'}`}>
                          Receba um <strong>Magic Link</strong> no seu e-mail para entrar automaticamente sem precisar digitar senha.
                        </p>
                      )}

                      {authMode === 'recovery' && (
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#B2C9D1]' : 'text-[#3B5B66]'}`}>
                          Envie um link de <strong>Recuperação de Senha</strong> para seu e-mail ou defina uma nova senha Admin abaixo.
                        </p>
                      )}

                      <form onSubmit={handleAuth} className="space-y-3.5">
                        {authMode === 'register' && (
                          <div
                            className={`border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors animate-in slide-in-from-top-3 ${inputWrapperClass}`}
                          >
                            <User
                              size={18}
                              className={
                                isDarkMode ? 'text-[#4FD1E8]/80 shrink-0' : 'text-[#0891B2] shrink-0'
                              }
                            />
                            <input
                              type="text"
                              placeholder="Seu nome completo"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className={inputClass}
                              autoComplete="name"
                              required
                            />
                          </div>
                        )}

                        <div
                          className={`border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${inputWrapperClass}`}
                        >
                          <Mail
                            size={18}
                            className={
                              isDarkMode ? 'text-[#4FD1E8]/80 shrink-0' : 'text-[#0891B2] shrink-0'
                            }
                          />
                          <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            autoComplete="email"
                            required
                          />
                        </div>

                        {(authMode === 'login' || authMode === 'register') && (
                          <div className="space-y-1.5">
                            <div
                              className={`border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${inputWrapperClass}`}
                            >
                              <Lock
                                size={18}
                                className={
                                  isDarkMode ? 'text-[#4FD1E8]/80 shrink-0' : 'text-[#0891B2] shrink-0'
                                }
                              />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className={`p-1 rounded-lg transition-colors shrink-0 ${
                                  isDarkMode
                                    ? 'text-slate-400 hover:text-white'
                                    : 'text-slate-500 hover:text-[#082F38]'
                                }`}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>

                            {authMode === 'login' && (
                              <div className="flex items-center justify-between px-1 pt-0.5 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode('magic');
                                    clearNotice();
                                  }}
                                  className={`font-semibold hover:underline cursor-pointer ${
                                    isDarkMode ? 'text-[#4FD1E8]' : 'text-[#0891B2]'
                                  }`}
                                >
                                  Entrar com Magic Link
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode('recovery');
                                    clearNotice();
                                  }}
                                  className={`font-semibold hover:underline cursor-pointer ${
                                    isDarkMode ? 'text-[#B2C9D1] hover:text-white' : 'text-[#3B5B66] hover:text-[#082F38]'
                                  }`}
                                >
                                  Esqueci minha senha
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`w-full py-3.5 sm:py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 active:scale-[0.98] cursor-pointer ${
                            isDarkMode
                              ? 'bg-[#32B7D9] text-[#051217] shadow-[0_12px_30px_-8px_rgba(50,183,217,0.45)] hover:bg-[#4FD1E8]'
                              : 'bg-[#0891B2] text-white shadow-[0_12px_30px_-8px_rgba(8,145,178,0.4)] hover:bg-[#0E7490]'
                          }`}
                        >
                          {isLoading ? (
                            <div
                              className={`w-5 h-5 border-2 rounded-full animate-spin ${
                                isDarkMode
                                  ? 'border-[#051217]/30 border-t-[#051217]'
                                  : 'border-white/30 border-t-white'
                              }`}
                            />
                          ) : authMode === 'magic' ? (
                            <>
                              <Wand2 size={17} />
                              <span>Enviar Magic Link por E-mail</span>
                            </>
                          ) : authMode === 'recovery' ? (
                            <>
                              <KeyRound size={17} />
                              <span>Enviar Link de Recuperação de Senha</span>
                            </>
                          ) : (
                            <>
                              <span>{authMode === 'register' ? 'Criar minha conta' : 'Acessar painel'}</span>
                              <ArrowRight size={18} />
                            </>
                          )}
                        </button>

                        {authMode === 'recovery' && (
                          <div
                            className={`mt-4 pt-3.5 border-t border-dashed space-y-2.5 ${
                              isDarkMode ? 'border-white/15' : 'border-slate-300'
                            }`}
                          >
                            <p className={`text-[11px] font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-900'}`}>
                              Ou altere sua senha Admin diretamente (sem depender de e-mail):
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Digite a nova senha..."
                                value={newPasswordDirect}
                                onChange={(e) => setNewPasswordDirect(e.target.value)}
                                className={`flex-1 rounded-xl border px-3 py-2 text-xs outline-none ${
                                  isDarkMode
                                    ? 'bg-white/5 border-white/15 text-white'
                                    : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={handleDirectPasswordChange}
                                disabled={isLoading}
                                className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 active:scale-95 transition-all shrink-0 cursor-pointer"
                              >
                                Salvar Senha
                              </button>
                            </div>
                          </div>
                        )}

                        {authMode === 'login' && (
                          <div className="mt-4 pt-3.5 border-t border-dashed border-cyan-500/25 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => navigate('/acampamento')}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border active:scale-95 cursor-pointer ${
                                isDarkMode
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                                  : 'border-amber-500/30 bg-amber-50 text-amber-800 hover:bg-amber-100'
                              }`}
                            >
                              <Tent size={14} className="text-amber-400 shrink-0" />
                              <span>Portal Público do Acampamento</span>
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  </>
                )}
              </motion.div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'register' ? 'login' : 'register');
                    clearNotice();
                  }}
                  className={`text-xs transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'text-[#B2C9D1] hover:text-white'
                      : 'text-[#3B5B66] hover:text-[#082F38]'
                  }`}
                >
                  {authMode === 'register' ? 'Já tem uma conta? ' : 'Não tem conta? '}
                  <span
                    className={`font-bold underline ${
                      isDarkMode ? 'text-[#4FD1E8]' : 'text-[#0891B2]'
                    }`}
                  >
                    {authMode === 'register' ? 'Faça login' : 'Cadastre-se'}
                  </span>
                </button>

                <p
                  className={`text-[11px] mt-3 flex items-center justify-center gap-1 ${
                    isDarkMode ? 'text-[#88A5B0]/80' : 'text-[#4A6B76]/85'
                  }`}
                >
                  <Info size={11} /> Segurança garantida por Supabase Auth
                </p>
              </div>
            </div>

            <div className="h-2" aria-hidden="true" />
          </motion.div>
        </AnimatePresence>

        {/* Switcher de Fundo (Glass / Água / Mesh Gradient) */}
        <div
          role="group"
          aria-label="Fundo da tela inicial"
          className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-4 z-30 inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-black/40 p-0.5 backdrop-blur-md shadow-lg"
        >
          <button
            type="button"
            onClick={() => setSavedPrepageBg('glass')}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
              bgMode === 'glass'
                ? 'bg-white/20 text-white shadow-2xs'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="Fundo Glass Fold"
          >
            <span>Glass</span>
          </button>
          <button
            type="button"
            onClick={() => setSavedPrepageBg('water')}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
              bgMode === 'water'
                ? 'bg-white/20 text-white shadow-2xs'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="Fundo Fluido de Águas"
          >
            <span>Água</span>
          </button>
          <button
            type="button"
            onClick={() => setSavedPrepageBg('mesh')}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
              bgMode === 'mesh'
                ? 'bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 shadow-2xs'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="Fundo Mesh Gradient WebGL (21st.dev)"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Mesh</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/preview/mesh-gradient')}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium text-white/50 hover:text-cyan-300 transition-colors border-l border-white/10 ml-0.5 pl-1.5"
            title="Abrir Playground do Mesh Gradient"
          >
            <span>Demo</span>
          </button>
        </div>
      </div>
    </LayoutGroup>
  );
};
