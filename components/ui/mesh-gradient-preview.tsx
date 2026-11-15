import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  RotateCcw,
  Palette,
  Eye,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  ExternalLink,
  Layers,
  Flame,
  Droplets,
  Moon,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  MeshGradient,
  MESH_GRADIENT_PRESETS,
  MeshGradientPresetName,
} from './mesh-gradient';
import { cn } from '../../lib/utils';

export function MeshGradientPreview() {
  const [activePreset, setActivePreset] = useState<MeshGradientPresetName>('adriel');
  const [colors, setColors] = useState<string[]>([
    MESH_GRADIENT_PRESETS.adriel.colors[0],
    MESH_GRADIENT_PRESETS.adriel.colors[1],
    MESH_GRADIENT_PRESETS.adriel.colors[2],
  ]);
  const [speed, setSpeed] = useState<number>(1);
  const [distortion, setDistortion] = useState<number>(1);
  const [swirl, setSwirl] = useState<number>(0.57);
  const [scale, setScale] = useState<number>(1.45);
  const [rotation, setRotation] = useState<number>(120);
  const [grainMixer, setGrainMixer] = useState<number>(0);

  const [deviceMode, setDeviceMode] = useState<'full' | 'tablet' | 'mobile'>('full');
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const applyPreset = (presetName: MeshGradientPresetName) => {
    setActivePreset(presetName);
    const p = MESH_GRADIENT_PRESETS[presetName];
    setColors([...p.colors]);
    setSpeed(p.speed);
    setDistortion(p.distortion);
    setSwirl(p.swirl);
    setScale(p.scale);
    setRotation(p.rotation);
    setGrainMixer(p.grainMixer || 0);
  };

  const handleColorChange = (index: number, value: string) => {
    const updated = [...colors];
    updated[index] = value;
    setColors(updated);
  };

  const addColor = () => {
    if (colors.length < 8) {
      setColors([...colors, '#6366f1']);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const resetToDefault = () => {
    applyPreset('adriel');
  };

  const copyCodeSnippet = () => {
    const code = `<MeshGradient
  colors={[${colors.map((c) => `'${c}'`).join(', ')}]}
  speed={${speed}}
  distortion={${distortion}}
  swirl={${swirl}}
  scale={${scale}}
  rotation={${rotation}}
  grainMixer={${grainMixer}}
  className="w-full h-screen"
/>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#050814] text-white flex flex-col overflow-x-hidden font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#050814]/85 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
                Mesh Gradient WebGL
              </h1>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                21st.dev replica
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Componente animado por shaders WebGL de @adrielzimbril
            </p>
          </div>
        </div>

        {/* Device Viewport Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] p-0.5">
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                deviceMode === 'mobile'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-white/40 hover:text-white/80'
              )}
              title="Visualização Mobile (390px)"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('tablet')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                deviceMode === 'tablet'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-white/40 hover:text-white/80'
              )}
              title="Visualização Tablet (768px)"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('full')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                deviceMode === 'full'
                  ? 'bg-white/15 text-white shadow-xs'
                  : 'text-white/40 hover:text-white/80'
              )}
              title="Tela Cheia"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowControls((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95',
              showControls
                ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            )}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ajustes</span>
          </button>

          <button
            type="button"
            onClick={copyCodeSnippet}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10 active:scale-95 transition-all"
            title="Copiar código do componente"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {copied ? 'Copiado!' : 'Copiar JSX'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="relative flex-1 flex items-center justify-center p-0 sm:p-4 bg-radial from-[#0e1630] via-[#050814] to-black">
        <div
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            deviceMode === 'mobile' &&
              'w-[390px] h-[780px] rounded-3xl border border-white/20 shadow-2xl shadow-blue-900/40 my-6',
            deviceMode === 'tablet' &&
              'w-[768px] h-[640px] rounded-2xl border border-white/20 shadow-2xl shadow-blue-900/40 my-6',
            deviceMode === 'full' && 'w-full h-[calc(100dvh-57px)]'
          )}
        >
          {/* THE MESH GRADIENT COMPONENT */}
          <MeshGradient
            colors={colors}
            speed={speed}
            distortion={distortion}
            swirl={swirl}
            scale={scale}
            rotation={rotation}
            grainMixer={grainMixer}
            className="w-full h-full"
          >
            {/* HERO CONTENT OVERLAY */}
            {showOverlay && (
              <div className="flex h-full w-full flex-col items-center justify-center px-4 sm:px-6 text-center select-text">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 backdrop-blur-md mb-6 shadow-lg shadow-black/20 animate-fade-in">
                  <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-medium tracking-wide text-cyan-200">
                    WebGL Shader Background • 21st.dev
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                </div>

                <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-sm leading-[1.1]">
                  Experiência Visual Fluida e Imersiva
                </h2>

                <p className="mt-4 max-w-xl text-sm sm:text-base text-white/80 drop-shadow leading-relaxed">
                  Reprodução fiel do Mesh Gradient com distorção orgânica, vortex de swirl e transições suaves de cor em tempo real no app.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="https://21st.dev/?qt=hero&preview=%2F%40adrielzimbril%2Fcomponents%2Fmesh-gradient"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-xl shadow-white/10 hover:bg-white/90 active:scale-95 transition-all"
                  >
                    <span>Ver no 21st.dev</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowOverlay(false)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/25 bg-black/40 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-black/60 active:scale-95 transition-all"
                  >
                    <Eye className="h-4 w-4 text-white/70" />
                    <span>Apenas o Fundo</span>
                  </button>
                </div>
              </div>
            )}
          </MeshGradient>

          {/* Floating Show Overlay Toggle if hidden */}
          {!showOverlay && (
            <button
              type="button"
              onClick={() => setShowOverlay(true)}
              className="absolute bottom-5 left-5 z-20 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md hover:bg-black/70 shadow-lg active:scale-95 transition-all"
            >
              <Eye className="h-4 w-4 text-cyan-300" />
              <span>Mostrar Conteúdo do Hero</span>
            </button>
          )}
        </div>

        {/* SIDE / FLOATING CONTROLS PANEL */}
        {showControls && (
          <aside className="fixed bottom-4 right-4 z-30 max-h-[calc(100dvh-5rem)] w-[min(340px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/15 bg-[#0a0f24]/90 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Controles do Shader
                </span>
              </div>
              <button
                type="button"
                onClick={resetToDefault}
                className="text-white/40 hover:text-white transition-colors"
                title="Restaurar padrão"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="mt-3.5">
              <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">
                Presets de Cores
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {(Object.keys(MESH_GRADIENT_PRESETS) as MeshGradientPresetName[]).map(
                  (name) => {
                    const preset = MESH_GRADIENT_PRESETS[name];
                    const isSelected = activePreset === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => applyPreset(name)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border p-1.5 text-left text-xs font-medium transition-all active:scale-95',
                          isSelected
                            ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]'
                        )}
                      >
                        <div
                          className="h-4 w-4 rounded-full border border-white/20 shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                          }}
                        />
                        <span className="capitalize truncate">{name}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">
                  Paleta Ativa ({colors.length})
                </label>
                {colors.length < 6 && (
                  <button
                    type="button"
                    onClick={addColor}
                    className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c, i) => (
                  <div key={i} className="group relative flex items-center gap-1.5">
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => handleColorChange(i, e.target.value)}
                      className="h-7 w-7 cursor-pointer appearance-none rounded-lg border border-white/20 bg-transparent p-0 overflow-hidden"
                    />
                    {colors.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeColor(i)}
                        className="text-[10px] text-white/30 hover:text-red-400"
                        title="Remover cor"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-white/70">
                  <span>Velocidade</span>
                  <span className="font-mono text-cyan-400">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="mt-1 w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-white/70">
                  <span>Distorção</span>
                  <span className="font-mono text-cyan-400">{distortion.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={distortion}
                  onChange={(e) => setDistortion(parseFloat(e.target.value))}
                  className="mt-1 w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-white/70">
                  <span>Swirl (Redemoinho)</span>
                  <span className="font-mono text-cyan-400">{swirl.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.02"
                  value={swirl}
                  onChange={(e) => setSwirl(parseFloat(e.target.value))}
                  className="mt-1 w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-white/70">
                  <span>Zoom / Escala</span>
                  <span className="font-mono text-cyan-400">{scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="mt-1 w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-white/70">
                  <span>Rotação</span>
                  <span className="font-mono text-cyan-400">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="mt-1 w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-white/70">
                  <span>Textura de Granulação</span>
                  <span className="font-mono text-cyan-400">{grainMixer.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={grainMixer}
                  onChange={(e) => setGrainMixer(parseFloat(e.target.value))}
                  className="mt-1 w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

export default MeshGradientPreview;
