import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { MeshGradient as ShaderMeshGradient } from '@paper-design/shaders-react';
import { cn } from '../../lib/utils';

export interface MeshGradientProps {
  /** Array of hex colors for the gradient spots (overrides color1..color4). */
  colors?: string[];
  /** Color 1 (default cyan-blue: #4c9bff) */
  color1?: string;
  /** Color 2 (default royal blue: #1f4fd8) */
  color2?: string;
  /** Color 3 (default deep navy: #0a1a4a) */
  color3?: string;
  /** Optional 4th color */
  color4?: string;
  /** Speed of animation (0 to freeze, default 1) */
  speed?: number;
  /** Distortion strength (0 to 2, default 1) */
  distortion?: number;
  /** Swirl effect intensity (0 to 2, default 0.57) */
  swirl?: number;
  /** Swirl iterations (default 7.4) */
  swirlIterations?: number;
  /** Softness factor (default 1) */
  softness?: number;
  /** Proportion bias (default 0) */
  proportion?: number;
  /** Shape type */
  shape?: string;
  /** Shape scale */
  shapeScale?: number;
  /** Overall scale (default 1.45) */
  scale?: number;
  /** Overall rotation angle in degrees (default 120) */
  rotation?: number;
  /** Grain mixer intensity (0 to 1, default 0) */
  grainMixer?: number;
  /** Grain overlay intensity (0 to 1, default 0) */
  grainOverlay?: number;
  /** How the shader fits inside its parent box ('cover' | 'contain' | 'none') */
  fit?: 'cover' | 'contain' | 'none';
  /** Additional container classes */
  className?: string;
  /** Container inline styles */
  style?: React.CSSProperties;
  /** Optional child elements rendered on top of the background */
  children?: React.ReactNode;
}

export const MESH_GRADIENT_PRESETS = {
  /** O preset padrão exato de @adrielzimbril na 21st.dev */
  adriel: {
    colors: ['#4c9bff', '#1f4fd8', '#0a1a4a'],
    speed: 1,
    distortion: 1,
    swirl: 0.57,
    scale: 1.45,
    rotation: 120,
    grainMixer: 0,
    grainOverlay: 0,
  },
  /** Identidade Manancial: tons de águas vivas, azul ciano e mar profundo */
  manancial: {
    colors: ['#38bdf8', '#0284c7', '#0369a1', '#082f49'],
    speed: 0.8,
    distortion: 0.9,
    swirl: 0.45,
    scale: 1.4,
    rotation: 105,
    grainMixer: 0.05,
    grainOverlay: 0.02,
  },
  /** Pôr do sol / Sunset caloroso */
  sunset: {
    colors: ['#fb7185', '#f97316', '#db2777', '#4c0519'],
    speed: 0.9,
    distortion: 1.1,
    swirl: 0.6,
    scale: 1.5,
    rotation: 135,
    grainMixer: 0,
    grainOverlay: 0,
  },
  /** Aurora Boreal: esmeralda, menta e azul cósmico */
  aurora: {
    colors: ['#34d399', '#06b6d4', '#4338ca', '#090d16'],
    speed: 0.7,
    distortion: 1,
    swirl: 0.7,
    scale: 1.4,
    rotation: 80,
    grainMixer: 0,
    grainOverlay: 0,
  },
  /** Dark Obsidian: sutil, cinematográfico e elegante */
  dark: {
    colors: ['#1e293b', '#0f172a', '#020617', '#000000'],
    speed: 0.5,
    distortion: 0.7,
    swirl: 0.3,
    scale: 1.3,
    rotation: 90,
    grainMixer: 0.08,
    grainOverlay: 0.04,
  },
} as const;

export type MeshGradientPresetName = keyof typeof MESH_GRADIENT_PRESETS;

export const MeshGradient = memo(function MeshGradient({
  colors,
  color1 = '#4c9bff',
  color2 = '#1f4fd8',
  color3 = '#0a1a4a',
  color4,
  speed = 1,
  distortion = 1,
  swirl = 0.57,
  scale = 1.45,
  rotation = 120,
  grainMixer = 0,
  grainOverlay = 0,
  fit = 'cover',
  className,
  style,
  children,
}: MeshGradientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasWebGl, setHasWebGl] = useState(true);

  // Computa a paleta de cores final
  const resolvedColors = useMemo(() => {
    if (colors && colors.length > 0) return colors;
    const list = [color1, color2, color3];
    if (color4) list.push(color4);
    return list;
  }, [colors, color1, color2, color3, color4]);

  // Checagem de suporte a WebGL no cliente
  useEffect(() => {
    setIsMounted(true);
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setHasWebGl(false);
      }
    } catch {
      setHasWebGl(false);
    }
  }, []);

  // Fallback CSS suave caso WebGL falhe ou esteja hidratando
  const fallbackGradient = `radial-gradient(ellipse at 80% 20%, ${resolvedColors[0]} 0%, transparent 50%),
    radial-gradient(ellipse at 20% 80%, ${resolvedColors[1]} 0%, transparent 60%),
    linear-gradient(135deg, ${resolvedColors[2]} 0%, ${resolvedColors[3] || resolvedColors[2]} 100%)`;

  return (
    <div
      ref={containerRef}
      className={cn('relative size-full overflow-hidden', className)}
      style={style}
    >
      {!isMounted || !hasWebGl ? (
        <div
          className="absolute inset-0 size-full pointer-events-none transition-opacity duration-700"
          style={{ background: fallbackGradient }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 size-full pointer-events-none select-none overflow-hidden">
          <ShaderMeshGradient
            colors={resolvedColors}
            speed={speed}
            distortion={distortion}
            swirl={swirl}
            scale={scale}
            rotation={rotation}
            grainMixer={grainMixer}
            grainOverlay={grainOverlay}
            fit={fit}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {children && <div className="relative z-10 size-full">{children}</div>}
    </div>
  );
});

MeshGradient.displayName = 'MeshGradient';

export default MeshGradient;
