import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronDown, Layers, Moon, Sun, Waves } from 'lucide-react';
import { ManancialEmblem } from './ManancialLogo';
import { ManancialWaterCanvas } from './ManancialWaterCanvas';
import { GlassFold } from '../ui/glass-fold';
import { MeshGradient } from '../ui/mesh-gradient';

export type PrepageBgMode = 'glass' | 'water' | 'mesh';

export function getSavedPrepageBg(): PrepageBgMode {
  try {
    const saved = localStorage.getItem('manancial_prepage_bg');
    if (saved === 'water' || saved === 'mesh') return saved;
    return 'glass';
  } catch {
    return 'glass';
  }
}

export function setSavedPrepageBg(mode: PrepageBgMode) {
  try {
    localStorage.setItem('manancial_prepage_bg', mode);
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent<PrepageBgMode>('manancial-bg-change', { detail: mode }));
}

export const MANANCIAL_SHARED_IDS = {
  logo: 'manancial-emblem-shell',
  title: 'manancial-brand-title',
  subtitle: 'manancial-brand-subtitle',
} as const;

export const MANANCIAL_SHARED_TRANSITION = {
  duration: 0.72,
  ease: [0.16, 1, 0.3, 1] as const,
};

export interface ManancialSplashScreenProps {
  tiltRef?: React.RefObject<HTMLDivElement | null>;
  sheenRef?: React.RefObject<HTMLDivElement | null>;
  onPulse?: () => void;
  onEnterLanding?: () => void;
  onEnterAuth?: () => void;
  onEnterAdmin?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  standalone?: boolean;
}

export function ManancialSplashScreen({
  tiltRef,
  sheenRef,
  onPulse,
  onEnterLanding,
  onEnterAuth,
  onEnterAdmin,
  isDarkMode = true,
  onToggleTheme,
  standalone = false,
}: ManancialSplashScreenProps) {
  const [bootProgress, setBootProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [bgMode, setBgMode] = useState<PrepageBgMode>(() => getSavedPrepageBg());
  const wheelLockRef = useRef(false);

  useEffect(() => {
    const onBgChange = (e: Event) => {
      const detail = (e as CustomEvent<PrepageBgMode>).detail;
      if (detail === 'glass' || detail === 'water' || detail === 'mesh') setBgMode(detail);
    };
    window.addEventListener('manancial-bg-change', onBgChange);
    return () => window.removeEventListener('manancial-bg-change', onBgChange);
  }, []);

  useEffect(() => {
    const start = performance.now();
    const duration = 1350;
    const intervalId = window.setInterval(() => {
      const t = Math.max(0, Math.min(1, (performance.now() - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setBootProgress(Math.round(eased * 100));
      if (t >= 1) {
        window.clearInterval(intervalId);
        setIsReady(true);
      }
    }, 45);

    return () => window.clearInterval(intervalId);
  }, []);

  const touchStartYRef = useRef<number | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
    if (!onEnterLanding || wheelLockRef.current) return;
    if (e.deltaY > 42) {
      wheelLockRef.current = true;
      onEnterLanding();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (!onEnterLanding || wheelLockRef.current || touchStartYRef.current === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const deltaY = touchStartYRef.current - endY;
    touchStartYRef.current = null;
    if (deltaY > 48) {
      wheelLockRef.current = true;
      onEnterLanding();
    }
  };

  const content = (
    <main
      data-testid="splash-screen"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-between px-5 sm:px-10 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      {/* Top quiet header row */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`flex w-full max-w-[1200px] items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'text-[#9BB4BD]' : 'text-[#4A6B76]'
        }`}
      >
        <span
          className={`text-sm font-medium tracking-tight ${
            isDarkMode ? 'text-[#E4F0F4]' : 'text-[#082F38]'
          }`}
        >
          Manancial
        </span>

        <div className="flex items-center gap-3 sm:gap-4">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Alternar aparência"
              className={`inline-flex cursor-pointer items-center justify-center rounded-lg border p-2 transition-colors active:scale-95 ${
                isDarkMode
                  ? 'border-white/10 bg-white/[0.04] text-[#B2C9D1] hover:border-white/20 hover:bg-white/[0.09] hover:text-white'
                  : 'border-[#082F38]/12 bg-white/75 text-[#082F38] shadow-2xs hover:bg-white'
              }`}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-[#082F38]" />
              )}
            </button>
          )}

          {onEnterLanding ? (
            <button
              type="button"
              onClick={onEnterLanding}
              className={`cursor-pointer whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4FD1E8] ${
                isDarkMode
                  ? 'text-[#A6C2CC] hover:text-white'
                  : 'text-[#4A6B76] hover:text-[#082F38]'
              }`}
            >
              Acessar o site da igreja
            </button>
          ) : (
            <span className="text-xs font-medium opacity-75">Carregando...</span>
          )}
        </div>
      </motion.div>

      {/* Center Brand Stage */}
      <div className="relative z-10 my-auto flex max-w-xl flex-col items-center text-center py-6">
        <div className="mb-8">
          <ManancialEmblem
            size="lg"
            tiltRef={tiltRef}
            sheenRef={sheenRef}
            onPulse={onPulse}
            layoutId={MANANCIAL_SHARED_IDS.logo}
            isDarkMode={isDarkMode}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          <motion.h1
            layoutId={MANANCIAL_SHARED_IDS.title}
            transition={MANANCIAL_SHARED_TRANSITION}
            className={`text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold tracking-tight [text-wrap:balance] ${
              isDarkMode ? 'text-white' : 'text-[#082F38]'
            }`}
          >
            Igreja Família Manancial
          </motion.h1>
          <motion.p
            layoutId={MANANCIAL_SHARED_IDS.subtitle}
            transition={MANANCIAL_SHARED_TRANSITION}
            className={`mx-auto max-w-md text-[15px] leading-relaxed sm:text-base ${
              isDarkMode ? 'text-[#B2C9D1]' : 'text-[#3B5B66]'
            }`}
          >
            Uma igreja acolhedora em São Pedro - SP, vivendo o Evangelho de Cristo em comunhão, ensino da Palavra e cuidado com cada família.
          </motion.p>
        </motion.div>

        {/* Subtle Boot Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-7 w-full max-w-[260px]"
        >
          <div
            className={`mb-2 flex items-center justify-between text-xs ${
              isDarkMode ? 'text-[#88A5B0]' : 'text-[#4A6B76]'
            }`}
          >
            <span>{isReady ? 'Seja muito bem-vindo(a)' : 'Bem-vindo(a) à nossa casa'}</span>
            <span
              className={`font-mono tabular-nums ${
                isDarkMode ? 'text-[#B4D8E4]' : 'text-[#082F38] font-semibold'
              }`}
            >
              {bootProgress}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={bootProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso de abertura Manancial"
            className={`h-[2px] w-full overflow-hidden rounded-full ${
              isDarkMode ? 'bg-white/10' : 'bg-[#082F38]/12'
            }`}
          >
            <div
              className={`h-full transition-[width] duration-150 ease-out ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#2AA8CC] via-[#4FD1E8] to-[#7BE3F2]'
                  : 'bg-gradient-to-r from-[#0E7490] via-[#0891B2] to-[#06B6D4]'
              }`}
              style={{ width: `${bootProgress}%` }}
            />
          </div>
        </motion.div>

        {/* Primary & Secondary Actions */}
        {(onEnterLanding || onEnterAuth) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4"
          >
            {onEnterLanding && (
              <motion.button
                type="button"
                onClick={onEnterLanding}
                whileHover={{ scale: 1.045, y: -2 }}
                whileTap={{ scale: 0.975 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className={`inline-flex min-h-[46px] cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-semibold transition-[background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7BE3F2] ${
                  isDarkMode
                    ? 'bg-[#32B7D9] text-[#051217] shadow-[0_12px_30px_-8px_rgba(50,183,217,0.45)] hover:bg-[#4FD1E8] hover:shadow-[0_18px_40px_-8px_rgba(79,209,232,0.58)]'
                    : 'bg-[#0891B2] text-white shadow-[0_12px_30px_-8px_rgba(8,145,178,0.42)] hover:bg-[#0E7490] hover:shadow-[0_18px_40px_-8px_rgba(14,116,144,0.5)]'
                }`}
              >
                <span>Conhecer o Manancial</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            )}

            {onEnterAuth && (
              <motion.button
                type="button"
                onClick={onEnterAuth}
                whileHover={{ scale: 1.045, y: -2 }}
                whileTap={{ scale: 0.975 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className={`inline-flex min-h-[46px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border px-6 py-3 text-sm font-medium transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4FD1E8] ${
                  isDarkMode
                    ? 'border-white/15 bg-[#0C151B]/90 text-[#E4F0F4] shadow-[0_10px_28px_-10px_rgba(0,0,0,0.65)] hover:border-[#4FD1E8]/45 hover:bg-[#122029] hover:shadow-[0_16px_36px_-10px_rgba(50,183,217,0.22)]'
                    : 'border-[#082F38]/15 bg-white/85 text-[#082F38] shadow-[0_10px_28px_-10px_rgba(8,47,56,0.14)] hover:border-[#0891B2]/45 hover:bg-white hover:shadow-[0_16px_36px_-10px_rgba(8,145,178,0.18)]'
                }`}
              >
                <span>Entrar na conta</span>
              </motion.button>
            )}

            {onEnterAdmin && (
              <motion.button
                type="button"
                onClick={onEnterAdmin}
                whileHover={{ scale: 1.045, y: -2 }}
                whileTap={{ scale: 0.975 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110"
              >
                <span>Painel Admin (Acesso Livre)</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Quiet Footer & Scroll Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.65 }}
        className="relative z-10 flex w-full max-w-[1200px] flex-col items-center gap-3 sm:flex-row sm:justify-between"
      >
        <span
          className={`text-xs font-medium ${
            isDarkMode ? 'text-[#88A5B0]' : 'text-[#4A6B76]'
          }`}
        >
          São Pedro • SP — Comunidade Evangélica Manancial
        </span>

        {onEnterLanding && (
          <button
            type="button"
            onClick={onEnterLanding}
            className={`inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4FD1E8] ${
              isDarkMode
                ? 'text-[#A6C2CC] hover:text-white'
                : 'text-[#4A6B76] hover:text-[#082F38]'
            }`}
          >
            <span>Explorar nossa igreja</span>
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </motion.div>
    </main>
  );

  if (standalone) {
    return (
      <div
        className={`relative min-h-[100dvh] w-full overflow-hidden transition-colors duration-700 ${
          isDarkMode ? 'bg-[#06081e] text-[#F1F6F8]' : 'bg-[#EFF8FC] text-[#082F38]'
        }`}
      >
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
            <ManancialWaterCanvas intensity="full" isDarkMode={isDarkMode} />
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
        <div className="relative z-10">{content}</div>
      </div>
    );
  }

  return content;
}
