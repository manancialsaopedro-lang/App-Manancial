import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

export const MANANCIAL_LOGO_SRC = '/icons/icon-512.png';

interface ManancialEmblemProps {
  size?: 'lg' | 'md' | 'sm';
  revealDelay?: number;
  tiltRef?: React.RefObject<HTMLDivElement | null>;
  sheenRef?: React.RefObject<HTMLDivElement | null>;
  onPulse?: () => void;
  layoutId?: string;
  isDarkMode?: boolean;
  skipReveal?: boolean;
}

export function ManancialEmblem({
  size = 'lg',
  revealDelay = 0.08,
  tiltRef,
  sheenRef,
  onPulse,
  layoutId = 'manancial-emblem-shell',
  isDarkMode = true,
  skipReveal = false,
}: ManancialEmblemProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const internalTiltRef = useRef<HTMLDivElement | null>(null);
  const internalSheenRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (size === 'sm') return;
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

      const tiltEl = tiltRef?.current || internalTiltRef.current;
      if (tiltEl) {
        const tx = (ry * 12).toFixed(2);
        const ty = (-rx * 10).toFixed(2);
        tiltEl.style.transform = `perspective(950px) translate3d(${tx}px, ${ty}px, 0) rotateX(${(rx * 11).toFixed(2)}deg) rotateY(${(ry * 11).toFixed(2)}deg)`;
      }

      const sheenEl = sheenRef?.current || internalSheenRef.current;
      if (sheenEl) {
        const px = Math.round(curX * 100);
        const py = Math.round(curY * 100);
        sheenEl.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(165, 243, 252, 0.36), transparent 58%)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.cancelAnimationFrame(rafId);
    };
  }, [size, tiltRef, sheenRef]);

  const dims =
    size === 'lg'
      ? 'h-32 w-32 sm:h-40 sm:w-40 rounded-[34px]'
      : size === 'md'
        ? 'h-20 w-20 sm:h-24 sm:w-24 rounded-[22px]'
        : 'h-10 w-10 rounded-[11px]';

  return (
    <motion.div
      layoutId={layoutId}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className={`relative inline-flex items-center justify-center ${
        size !== 'sm' ? 'animate-float-water' : ''
      }`}
    >
      {/* Subtle ambient aura */}
      {size !== 'sm' && (
        <div
          aria-hidden="true"
          className="animate-breath-slow pointer-events-none absolute -inset-10 rounded-full"
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle, rgba(50, 183, 217, 0.22) 0%, rgba(29, 110, 133, 0.10) 45%, transparent 72%)'
              : 'radial-gradient(circle, rgba(14, 165, 233, 0.28) 0%, rgba(6, 182, 212, 0.12) 45%, transparent 72%)',
          }}
        />
      )}

      {/* 3D Tilt Wrapper driven directly by pointer */}
      <div
        ref={(node) => {
          internalTiltRef.current = node;
          if (tiltRef && 'current' in tiltRef) {
            (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        onClick={onPulse}
        role={onPulse ? 'button' : undefined}
        tabIndex={onPulse ? 0 : undefined}
        aria-label={onPulse ? 'Emblema Manancial — clique para gerar ondas na água' : undefined}
        onKeyDown={
          onPulse
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPulse();
                }
              }
            : undefined
        }
        style={{ transformStyle: 'preserve-3d' }}
        className={`group relative overflow-hidden border bg-[#0A1116] ${
          isDarkMode
            ? 'border-white/15 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_-12px_rgba(50,183,217,0.3)]'
            : 'border-[#082f38]/15 shadow-[0_24px_60px_-15px_rgba(8,47,56,0.35),0_0_40px_-12px_rgba(6,182,212,0.28)]'
        } ${dims} ${
          onPulse
            ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4FD1E8]'
            : ''
        }`}
      >
        {/* Reference Icon Image */}
        {!imgFailed ? (
          <img
            src={MANANCIAL_LOGO_SRC}
            alt="Logotipo Manancial com letra M esculpida e ondas azul-turquesa"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full scale-[1.18] object-cover select-none"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#070B0E] via-[#133844] to-[#1D6E85]">
            <span className="text-4xl font-semibold text-white">M</span>
          </div>
        )}

        {/* SVG Path-Drawing Reveal & Shimmering Water Ribbons Overlay */}
        {size !== 'sm' && !skipReveal && (
          <svg
            viewBox="0 0 200 200"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            {/* Sculpted M path draw reveal */}
            <motion.path
              d="M 48 142 L 62 56 L 100 120 L 138 56 L 152 142"
              fill="none"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.9 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0.9, 0.85, 0] }}
              transition={{
                duration: 1.55,
                delay: revealDelay,
                times: [0, 0.72, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
            />

            {/* Sweeping lower water ribbons trace */}
            <motion.path
              d="M 24 134 Q 72 104, 114 126 T 174 106"
              fill="none"
              stroke="#5CE1F5"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.95 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0.95, 0.75, 0.18] }}
              transition={{
                duration: 1.8,
                delay: revealDelay + 0.18,
                times: [0, 0.65, 1],
                ease: 'easeOut',
              }}
            />
            <motion.path
              d="M 38 148 Q 88 122, 130 142 T 166 122"
              fill="none"
              stroke="#32B7D9"
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.85 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0.85, 0.65, 0.14] }}
              transition={{
                duration: 1.9,
                delay: revealDelay + 0.28,
                times: [0, 0.65, 1],
                ease: 'easeOut',
              }}
            />
          </svg>
        )}

        {/* Dynamic water specular sheen tracking pointer */}
        <div
          ref={(node) => {
            internalSheenRef.current = node;
            if (sheenRef && 'current' in sheenRef) {
              (sheenRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
          }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(165, 243, 252, 0.26), transparent 58%)',
          }}
        />
      </div>
    </motion.div>
  );
}
