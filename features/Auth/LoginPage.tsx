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
} from 'lucide-react';
import { useAppStore } from '../../store';
import {
  isSupabaseConfigured,
  signInWithEmailPassword,
  signInWithGoogle,
  signUpWithEmail,
} from '../../lib/supabase';
import { ManancialEmblem } from '../../components/splash/ManancialLogo';
import { ManancialWaterCanvas } from '../../components/splash/ManancialWaterCanvas';
import { GlassFold } from '../../components/ui/glass-fold';
import {
  MANANCIAL_SHARED_IDS,
  MANANCIAL_SHARED_TRANSITION,
  ManancialSplashScreen,
  PrepageBgMode,
  getSavedPrepageBg,
  setSavedPrepageBg,
} from '../../components/splash/ManancialSplashScreen';
import { WaterSimulation } from '../../components/splash/waterPhysics';
import { Layers, Waves } from 'lucide-react';

type NoticeType = 'success' | 'error' | 'info';
type StageView = 'splash' | 'auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, isDarkMode, toggleTheme } = useAppStore();

  const isConfirmedRedirect = new URLSearchParams(location.search).get('confirmed') === '1';

  const [view, setView] = useState<StageView>('auth');
  const [bgMode, setBgMode] = useState<PrepageBgMode>(() => getSavedPrepageBg());
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<WaterSimulation | null>(null);

  useEffect(() => {
    const onBgChange = (e: Event) => {
      const detail = (e as CustomEvent<PrepageBgMode>).detail;
      if (detail === 'glass' || detail === 'water') setBgMode(detail);
    };
    window.addEventListener('manancial-bg-change', onBgChange);
    return () => window.removeEventListener('manancial-bg-change', onBgChange);
  }, []);

  // Se já estiver logado, redireciona para a rota apropriada
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, location.state, navigate]);

  // Auth form states
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        message: 'Confirmacao concluida. Agora entre com seu email/senha ou Google.',
      });
      setView('auth');
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterNotice('');
    clearNotice();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (isRegister) {
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
          setRegisterNotice('Este e-mail ja esta cadastrado. Faca login para continuar.');
          setNotice({ type: 'info', message: 'Conta ja existente para este e-mail.' });
        } else {
          setRegisterNotice('Enviamos um e-mail de confirmacao. Abra o link para ativar sua conta.');
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
          signIn(trimmedEmail, trimmedName || undefined);
          setIsLoading(false);
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from, { replace: true });
        }, 700);
        return;
      }

      const { error } = await signInWithEmailPassword(trimmedEmail, password);
      if (error) throw error;

      setNotice({ type: 'success', message: 'Login realizado com sucesso.' });
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Erro no login:', err);
      setNotice({ type: 'error', message: `Falha no login: ${err?.message || 'erro desconhecido'}.` });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearNotice();

    if (!isSupabaseConfigured) {
      setNotice({
        type: 'error',
        message: 'Supabase ausente ou invalido. Use login por e-mail em modo local.',
      });
      return;
    }

    try {
      setIsLoading(true);
      setNotice({ type: 'info', message: 'Redirecionando para autenticacao Google...' });

      const { data, error } = await signInWithGoogle();
      if (error) throw error;

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setIsLoading(false);
      setNotice({ type: 'error', message: 'Nao foi possivel iniciar o login Google. Tente novamente.' });
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      setNotice({ type: 'error', message: `Falha no login com Google: ${err?.message || 'erro desconhecido'}.` });
      setIsLoading(false);
    }
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
          ) : (
            <ManancialWaterCanvas
              intensity="full"
              isDarkMode={isDarkMode}
              onTiltChange={handleStageTilt}
              simulationRef={simRef}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === 'splash' ? (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35 } }}
              className="relative z-10"
            >
              <ManancialSplashScreen
                tiltRef={tiltRef}
                sheenRef={sheenRef}
                onPulse={handleCenterPulse}
                onEnterLanding={() => navigate('/landing')}
                onEnterAuth={() => setView('auth')}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="relative z-10 min-h-[100dvh] flex flex-col justify-between px-4 sm:px-10 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              {/* Top Navigation Bar */}
              <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between gap-3 py-1">
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

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors active:scale-95 ${
                      isDarkMode
                        ? 'border-white/10 bg-white/[0.04] text-[#B2C9D1] hover:border-white/20 hover:bg-white/[0.09] hover:text-white'
                        : 'border-[#082F38]/12 bg-white/80 text-[#082F38] shadow-2xs hover:bg-white'
                    }`}
                    title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
                  >
                    {isDarkMode ? (
                      <Sun className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Moon className="h-3.5 w-3.5 text-[#082F38]" />
                    )}
                    <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
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
              <div className="w-full max-w-md mx-auto my-auto py-6">
                {/* Shared Element Header */}
                <div className="flex flex-col items-center mb-6 text-center">
                  <div className="mb-4">
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
                  className={`backdrop-blur-2xl border p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl ${
                    isDarkMode
                      ? 'bg-[#0C151B]/80 border-white/12 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)]'
                      : 'bg-white/85 border-white shadow-[0_24px_60px_-15px_rgba(8,47,56,0.14)]'
                  }`}
                >
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
                          setIsRegister(false);
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
                      <div
                        className={`flex gap-3 mb-6 border-b pb-3 ${
                          isDarkMode ? 'border-white/10' : 'border-[#082F38]/10'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegister(false);
                            clearNotice();
                          }}
                          className={`flex-1 pb-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors ${
                            !isRegister
                              ? isDarkMode
                                ? 'text-[#4FD1E8] border-b-2 border-[#4FD1E8]'
                                : 'text-[#0891B2] border-b-2 border-[#0891B2]'
                              : isDarkMode
                                ? 'text-slate-400 hover:text-slate-200'
                                : 'text-slate-400 hover:text-[#082F38]'
                          }`}
                        >
                          Entrar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegister(true);
                            clearNotice();
                          }}
                          className={`flex-1 pb-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors ${
                            isRegister
                              ? isDarkMode
                                ? 'text-[#4FD1E8] border-b-2 border-[#4FD1E8]'
                                : 'text-[#0891B2] border-b-2 border-[#0891B2]'
                              : isDarkMode
                                ? 'text-slate-400 hover:text-slate-200'
                                : 'text-slate-400 hover:text-[#082F38]'
                          }`}
                        >
                          Criar conta
                        </button>
                      </div>

                      <div className="space-y-5">
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          disabled={isLoading}
                          className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-60 ${
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

                        <form onSubmit={handleAuth} className="space-y-3.5">
                          {isRegister && (
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
                              autoComplete={isRegister ? 'new-password' : 'current-password'}
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

                          <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 sm:py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-5 disabled:opacity-60 active:scale-[0.98] ${
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
                            ) : (
                              <>
                                <span>{isRegister ? 'Criar minha conta' : 'Acessar painel'}</span>
                                <ArrowRight size={18} />
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </motion.div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      clearNotice();
                    }}
                    className={`text-xs transition-colors ${
                      isDarkMode
                        ? 'text-[#B2C9D1] hover:text-white'
                        : 'text-[#3B5B66] hover:text-[#082F38]'
                    }`}
                  >
                    {isRegister ? 'Já tem uma conta? ' : 'Não tem conta? '}
                    <span
                      className={`font-bold underline ${
                        isDarkMode ? 'text-[#4FD1E8]' : 'text-[#0891B2]'
                      }`}
                    >
                      {isRegister ? 'Faça login' : 'Cadastre-se'}
                    </span>
                  </button>

                  <p
                    className={`text-[11px] mt-3.5 flex items-center justify-center gap-1 ${
                      isDarkMode ? 'text-[#88A5B0]/80' : 'text-[#4A6B76]/85'
                    }`}
                  >
                    <Info size={11} /> Segurança garantida por Supabase Auth
                  </p>
                </div>
              </div>

              <div className="h-2" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};
