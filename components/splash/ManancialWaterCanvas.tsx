import React, { useEffect, useRef } from 'react';
import { WaterSimulation } from './waterPhysics';

interface ManancialWaterCanvasProps {
  className?: string;
  intensity?: 'full' | 'hero';
  isDarkMode?: boolean;
  onTiltChange?: (rx: number, ry: number, normX: number, normY: number) => void;
  simulationRef?: React.MutableRefObject<WaterSimulation | null>;
}

export function ManancialWaterCanvas({
  className = '',
  intensity = 'full',
  isDarkMode = true,
  onTiltChange,
  simulationRef,
}: ManancialWaterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const internalSimRef = useRef<WaterSimulation>(new WaterSimulation());
  const onTiltRef = useRef(onTiltChange);
  onTiltRef.current = onTiltChange;

  const isDarkRef = useRef(isDarkMode);
  isDarkRef.current = isDarkMode;

  useEffect(() => {
    const sim = internalSimRef.current;
    if (simulationRef) {
      simulationRef.current = sim;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width || window.innerWidth);
      height = Math.max(1, rect.height || window.innerHeight);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sim.resize(width, height);
    };

    const particleCount = prefersReducedMotion
      ? 90
      : intensity === 'full'
        ? 260
        : 170;

    resize();
    sim.initParticles(particleCount);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < -40 || y < -40 || x > width + 40 || y > height + 40) return;
      sim.injectPointerMove(x, y, 0.016);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let rafId = 0;
    let timerId = 0;
    let lastTime = performance.now();
    const startTime = lastTime;

    let lastRx = 99;
    let lastRy = 99;

    const scheduleNext = (isMoving: boolean) => {
      const delay = isMoving ? 24 : 42;
      timerId = window.setTimeout(() => {
        rafId = window.requestAnimationFrame(drawFrame);
      }, delay);
    };

    const drawFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const elapsed = Math.max(0, (now - startTime) / 1000);
      const timeSec = prefersReducedMotion ? elapsed * 0.15 : elapsed;
      const dark = isDarkRef.current;

      sim.step(dt, timeSec);

      const { rx, ry } = sim.getNormalizedTilt();
      if (
        onTiltRef.current &&
        (Math.abs(rx - lastRx) > 0.001 || Math.abs(ry - lastRy) > 0.001)
      ) {
        lastRx = rx;
        lastRy = ry;
        onTiltRef.current(
          rx,
          ry,
          sim.smoothX / Math.max(1, width),
          sim.smoothY / Math.max(1, height),
        );
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle diffused ambient light & shadow depth smoothly following the pointer
      const pulse = 1 + Math.sin(timeSec * 1.1) * 0.04;
      const glowRadius =
        Math.max(width, height) * (intensity === 'full' ? 0.46 : 0.38) * pulse;

      // Soft ambient shadow vignette around the edges for depth
      const shadowVignette = ctx.createRadialGradient(
        sim.smoothX,
        sim.smoothY,
        glowRadius * 0.25,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85,
      );
      if (dark) {
        shadowVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowVignette.addColorStop(1, 'rgba(2, 6, 12, 0.42)');
      } else {
        shadowVignette.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shadowVignette.addColorStop(1, 'rgba(8, 47, 56, 0.08)');
      }
      ctx.fillStyle = shadowVignette;
      ctx.fillRect(0, 0, width, height);

      // Soft light detail following the pointer (pure light & shadow, no circles/dots)
      const ptrGlow = ctx.createRadialGradient(
        sim.smoothX,
        sim.smoothY,
        0,
        sim.smoothX,
        sim.smoothY,
        glowRadius,
      );
      if (dark) {
        ptrGlow.addColorStop(0, 'rgba(92, 225, 245, 0.16)');
        ptrGlow.addColorStop(0.32, 'rgba(42, 168, 204, 0.08)');
        ptrGlow.addColorStop(0.65, 'rgba(12, 46, 62, 0.03)');
        ptrGlow.addColorStop(1, 'rgba(7, 11, 14, 0)');
      } else {
        ptrGlow.addColorStop(0, 'rgba(56, 189, 248, 0.20)');
        ptrGlow.addColorStop(0.32, 'rgba(14, 165, 233, 0.09)');
        ptrGlow.addColorStop(0.65, 'rgba(13, 148, 136, 0.035)');
        ptrGlow.addColorStop(1, 'rgba(240, 249, 255, 0)');
      }
      ctx.fillStyle = ptrGlow;
      ctx.fillRect(0, 0, width, height);

      const pointerSpeed = Math.hypot(sim.pointerVx, sim.pointerVy);
      scheduleNext(pointerSpeed > 15);
    };

    rafId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [intensity, simulationRef]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-700 ${className}`}
      aria-hidden="true"
    >
      {/* Base & Animated Mesh Gradient */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDarkMode ? 'bg-[#070B0E]' : 'bg-[#EFF8FC]'
        }`}
      />
      <div
        className="animate-mesh-drift absolute -top-[20%] -right-[15%] h-[110vw] w-[110vw] max-h-[820px] max-w-[820px] opacity-75"
        style={{
          background: isDarkMode
            ? 'radial-gradient(circle at 50% 50%, rgba(72, 110, 92, 0.34) 0%, rgba(28, 72, 82, 0.14) 42%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(153, 246, 228, 0.52) 0%, rgba(125, 211, 252, 0.24) 42%, transparent 70%)',
        }}
      />
      <div
        className="animate-mesh-drift absolute -bottom-[22%] -left-[15%] h-[115vw] w-[115vw] max-h-[860px] max-w-[860px] opacity-85"
        style={{
          animationDelay: '-6s',
          background: isDarkMode
            ? 'radial-gradient(circle at 50% 50%, rgba(18, 92, 118, 0.48) 0%, rgba(45, 96, 86, 0.22) 44%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(103, 232, 249, 0.48) 0%, rgba(94, 234, 212, 0.25) 44%, transparent 70%)',
        }}
      />
      <div
        className="animate-mesh-drift absolute right-[5%] -bottom-[18%] h-[95vw] w-[95vw] max-h-[720px] max-w-[720px] opacity-80"
        style={{
          animationDelay: '-11s',
          background: isDarkMode
            ? 'radial-gradient(circle at 50% 50%, rgba(36, 152, 184, 0.30) 0%, rgba(14, 62, 82, 0.14) 48%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(125, 211, 252, 0.42) 0%, rgba(186, 230, 253, 0.22) 48%, transparent 70%)',
        }}
      />

      {/* Fine Viscous Fluid Particles & Mouse-Tracking Light Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="manancial-water-canvas"
        className="relative block h-full w-full"
      />

      {/* Lightweight film grain overlay */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDarkMode ? 'noise-overlay opacity-[0.035]' : 'noise-overlay-light opacity-[0.045]'
        }`}
      />
    </div>
  );
}
