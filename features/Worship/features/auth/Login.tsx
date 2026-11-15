import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ADMIN_DEFAULT_EMAIL,
  ADMIN_DEFAULT_PASSWORD,
  sendMagicLink,
  sendPasswordRecovery,
  signInWithGoogle,
} from '../../../../lib/supabase';
import { useAppStore } from '../../../../store';
import { DEFAULT_ADMIN_USER } from '../../../../store/slices/authSlice';
import { TeamMember } from '../../types';
import { GlassFold } from '../../../../components/ui/glass-fold';
import { MeshGradient } from '../../../../components/ui/mesh-gradient';
import { ManancialWaterCanvas } from '../../../../components/splash/ManancialWaterCanvas';
import {
  PrepageBgMode,
  getSavedPrepageBg,
  setSavedPrepageBg,
} from '../../../../components/splash/ManancialSplashScreen';
import {
  LoaderCircle,
  Mail,
  Lock,
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
  Layers,
  Waves,
  ShieldCheck,
  Crown,
  Wand2,
  KeyRound,
} from 'lucide-react';

interface LoginProps {
  onLogin: (selectedMember?: TeamMember) => void;
  team?: TeamMember[];
}

type NoticeType = 'success' | 'error' | 'info';

export default function Login({ onLogin, team = [] }: LoginProps) {
  const navigate = useNavigate();

  // Stage 1: Animated Splash / Loading Screen
  const [splashComplete, setSplashComplete] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bgMode, setBgMode] = useState<PrepageBgMode>(() => getSavedPrepageBg());
  const logoTiltRef = useRef<HTMLDivElement | null>(null);
  const logoSheenRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onBgChange = (e: Event) => {
      const detail = (e as CustomEvent<PrepageBgMode>).detail;
      if (detail === 'glass' || detail === 'water') setBgMode(detail);
    };
    window.addEventListener('manancial-bg-change', onBgChange);
    return () => window.removeEventListener('manancial-bg-change', onBgChange);
  }, []);

  useEffect(() => {
    let rafId = 0;
    let targetX = 0.5;
    let targetY = 0.5;
    let curX = 0.5;
    let curY = 0.5;

    const onPointerMove = (e: PointerEvent) => {
      targetX = Math.max(0, Math.min(1, e.clientX / Math.max(1, window.innerWidth)));
      targetY = Math.max(0, Math.min(1, e.clientY / Math.max(1, window.innerHeight)));
    };

    const tick = () => {
      curX += (targetX - curX) * 0.09;
      curY += (targetY - curY) * 0.09;
      const ry = (curX - 0.5) * 2;
      const rx = (0.5 - curY) * 2;

      if (logoTiltRef.current) {
        const tx = (ry * 12).toFixed(2);
        const ty = (-rx * 10).toFixed(2);
        logoTiltRef.current.style.transform = `perspective(950px) translate3d(${tx}px, ${ty}px, 0) rotateX(${(rx * 11).toFixed(2)}deg) rotateY(${(ry * 11).toFixed(2)}deg)`;
      }
      if (logoSheenRef.current) {
        const px = Math.round(curX * 100);
        const py = Math.round(curY * 100);
        logoSheenRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(165, 243, 252, 0.36), transparent 58%)`;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Auth & Notice states
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: NoticeType; message: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Install PWA shortcut state
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Splash loading animation (0% -> 100% then smooth transition to form)
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

      const userMetaName = (
        data.user?.user_metadata?.name ||
        data.user?.user_metadata?.full_name ||
        ''
      ).toLowerCase();
      const metaMemberId = data.user?.user_metadata?.worship_member_id;

      const matchedMember = team.find(
        (m) =>
          m.id === metaMemberId ||
          (userMetaName && userMetaName.includes(m.name.toLowerCase()))
      );

      if (matchedMember) {
        localStorage.setItem('louvor_logged_member', JSON.stringify(matchedMember));
      } else {
        localStorage.removeItem('louvor_logged_member');
      }

      setNotice({ type: 'success', message: 'Acesso confirmado! Entrando no Louvor App...' });
      onLogin(matchedMember);
    } catch (err: any) {
      setNotice({
        type: 'error',
        message:
          err?.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos. Caso ainda não tenha ativado sua conta, acesse com o link enviado pela liderança.'
            : err?.message || 'Não foi possível entrar. Verifique seus dados.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectAdminLouvor = async () => {
    setIsLoading(true);
    setNotice(null);
    const { signIn, setDevRole } = useAppStore.getState();
    setDevRole('admin');
    signIn(DEFAULT_ADMIN_USER.email, DEFAULT_ADMIN_USER.name, 'admin', undefined, {
      id: DEFAULT_ADMIN_USER.id,
      churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
      isWorshipMember: true,
      isWorshipLeader: true,
    });
    try {
      await supabase.auth.signInWithPassword({
        email: ADMIN_DEFAULT_EMAIL,
        password: ADMIN_DEFAULT_PASSWORD,
      });
    } catch {
      // continua localmente
    }
    setIsLoading(false);
    onLogin();
  };

  const handleLouvorMagicLink = async () => {
    const trimmed = loginEmail.trim().toLowerCase() || ADMIN_DEFAULT_EMAIL;
    setIsLoading(true);
    setNotice(null);
    try {
      const { error } = await sendMagicLink(trimmed);
      if (error) throw error;
      setNotice({
        type: 'success',
        message: `Magic Link enviado para ${trimmed}! Verifique seu e-mail.`,
      });
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: `Não foi possível enviar o Magic Link (${err?.message || 'erro'}). Use o botão "Entrar Admin Agora" acima.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLouvorRecovery = async () => {
    const trimmed = loginEmail.trim().toLowerCase() || ADMIN_DEFAULT_EMAIL;
    setIsLoading(true);
    setNotice(null);
    try {
      const { error } = await sendPasswordRecovery(trimmed);
      if (error) throw error;
      setNotice({
        type: 'success',
        message: `Link de redefinição de senha enviado para ${trimmed}!`,
      });
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: `Não foi possível enviar o link (${err?.message || 'erro'}). Sua senha Admin padrão é Manancial2026!`,
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

  return (
    <div className="min-h-[100dvh] bg-[#06081e] text-white flex flex-col items-center justify-center p-4 sm:p-6 pb-20 relative overflow-x-hidden select-none">
      {/* Dynamic Background (GlassFold, Water or MeshGradient) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {bgMode === 'glass' ? (
          <GlassFold
            color1="#1e3cc8"
            color2="#06081e"
            color3="#96d7ff"
            speed={0.5}
            scale={1}
            noise={0.12}
            className="h-full w-full"
          />
        ) : bgMode === 'water' ? (
          <ManancialWaterCanvas intensity="full" isDarkMode={true} />
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
      {/* Subtle contrast vignette for card readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06081e]/20 via-transparent to-[#06081e]/55 pointer-events-none z-0" />

      {/* Minimalist Background Switcher */}
      <div
        role="group"
        aria-label="Fundo da tela inicial"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-30 inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-0.5 backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => setSavedPrepageBg('glass')}
          className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
            bgMode === 'glass'
              ? 'bg-white/15 text-white shadow-2xs'
              : 'text-white/45 hover:text-white/80'
          }`}
          title="Fundo Glass Fold"
        >
          <Layers className="h-3 w-3" />
          <span>Glass</span>
        </button>
        <button
          type="button"
          onClick={() => setSavedPrepageBg('water')}
          className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
            bgMode === 'water'
              ? 'bg-white/15 text-white shadow-2xs'
              : 'text-white/45 hover:text-white/80'
          }`}
          title="Fundo Fluido de Águas"
        >
          <Waves className="h-3 w-3" />
          <span>Água</span>
        </button>
        <button
          type="button"
          onClick={() => setSavedPrepageBg('mesh')}
          className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
            bgMode === 'mesh'
              ? 'bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 shadow-2xs'
              : 'text-white/45 hover:text-white/80'
          }`}
          title="Fundo Mesh Gradient WebGL (21st.dev)"
        >
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Mesh</span>
        </button>
      </div>

      {!splashComplete ? (
        /* ETAPA 1: SPLASH SCREEN CENTRALIZADO COM LOADING */
        <div className="w-full max-w-sm flex flex-col items-center justify-center text-center relative z-10 px-4">
          <motion.div
            layoutId="louvor-brand-logo"
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-7 relative"
          >
            <div
              ref={logoTiltRef}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] overflow-hidden shadow-[0_0_70px_rgba(37,99,235,0.55)] border-2 border-blue-400/40 bg-[#00153d] relative"
            >
              <img
                src="/louvor-icon.png"
                alt="Louvor App"
                className="w-full h-full object-cover"
              />
              <div
                ref={logoSheenRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(165, 243, 252, 0.3), transparent 58%)',
                }}
              />
            </div>
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
            Ministério de Louvor &bull; Igreja Manancial
          </motion.p>

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
              <span>{loadingProgress < 100 ? 'Preparando ambiente de louvor...' : 'Tudo pronto!'}</span>
              <span className="text-cyan-300 tabular-nums">{loadingProgress}%</span>
            </div>
          </motion.div>
        </div>
      ) : (
        /* ETAPA 2: LOGIN SEGURO DO MINISTÉRIO DE LOUVOR */
        <div className="w-full max-w-md relative z-10 my-auto py-2">
          <div className="flex flex-col items-center mb-5 text-center">
            <motion.div
              layoutId="louvor-brand-logo"
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              className="mb-3 relative"
            >
              <div
                ref={logoTiltRef}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.75rem] overflow-hidden shadow-2xl shadow-blue-500/40 border-2 border-blue-400/35 bg-[#00153d] relative"
              >
                <img
                  src="/louvor-icon.png"
                  alt="Louvor App"
                  className="w-full h-full object-cover"
                />
                <div
                  ref={logoSheenRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 25%, rgba(165, 243, 252, 0.3), transparent 58%)',
                  }}
                />
              </div>
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
              Ministério de Louvor &bull; Igreja Manancial
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-[#070d24]/75 backdrop-blur-2xl border border-white/20 p-5 sm:p-7 rounded-[2.25rem] shadow-2xl relative overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white transition-colors py-1"
              >
                <ArrowLeft size={15} />
                <span>Voltar ao Início</span>
              </button>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-400/25 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={11} />
                Acesso Seguro
              </span>
            </div>

            {/* Acesso Direto Admin Modo Construção */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-cyan-500/15 border border-amber-400/35 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  <Crown size={12} /> Modo Construção Admin
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail(ADMIN_DEFAULT_EMAIL);
                    setLoginPassword(ADMIN_DEFAULT_PASSWORD);
                  }}
                  className="text-[10px] font-bold text-cyan-300 underline cursor-pointer"
                >
                  Preencher Senha Admin
                </button>
              </div>
              <button
                type="button"
                onClick={handleDirectAdminLouvor}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Crown size={14} />
                <span>Entrar Direto como Admin no Louvor App</span>
              </button>
            </div>

            {notice && (
              <div
                className={`rounded-2xl border px-4 py-3 text-xs sm:text-sm flex items-start gap-2.5 ${
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

            <form onSubmit={handleExistingLogin} className="space-y-3.5">
              <div className="bg-[#050a1c]/55 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-400/60 transition-colors">
                <Mail size={18} className="text-cyan-400 shrink-0" />
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-300/80 font-medium"
                  required
                />
              </div>

              <div className="bg-[#050a1c]/55 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-400/60 transition-colors">
                <Lock size={18} className="text-cyan-400 shrink-0" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-300/80 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-slate-300 hover:text-white transition-colors"
                  aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between px-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleLouvorMagicLink}
                  className="inline-flex items-center gap-1 font-bold text-cyan-300 hover:underline cursor-pointer"
                >
                  <Wand2 size={12} />
                  <span>Receber Magic Link</span>
                </button>
                <button
                  type="button"
                  onClick={handleLouvorRecovery}
                  className="inline-flex items-center gap-1 font-bold text-blue-200 hover:text-white hover:underline cursor-pointer"
                >
                  <KeyRound size={12} />
                  <span>Esqueci minha senha</span>
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

            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 text-center space-y-2">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ainda não ativou seu acesso? Use o link de convite enviado pela liderança ou entre com sua conta do portal.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-extrabold text-cyan-300 hover:text-cyan-200 underline underline-offset-4 transition-colors"
              >
                Ir para Login Geral da Igreja
              </button>
            </div>

            {/* Botão de Atalho na Tela Inicial */}
            <div className="pt-2 border-t border-white/10">
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

      {/* MODAL DE INSTRUÇÃO DE ATALHO (iPhone / Android) */}
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
