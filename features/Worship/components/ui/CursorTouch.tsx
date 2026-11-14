import React from 'react';
import { motion } from 'motion/react';

interface CursorTouchProps {
  /** Texto exibido na etiqueta ao lado do toque (opcional) */
  label?: string;
  /** Variante do cursor: 'finger' (mão/dedo realista) ou 'dot' (círculo de toque minimalista) */
  variant?: 'finger' | 'dot';
  /** Cor do efeito de onda / anel */
  color?: 'blue' | 'teal' | 'pink' | 'emerald';
  /** Classes extras para posicionamento absoluto/relativo */
  className?: string;
  /** Atraso inicial em segundos */
  delay?: number;
}

const colorMap = {
  blue: {
    ring: 'border-blue-400 bg-blue-500/20',
    dot: 'bg-blue-500 shadow-blue-500/50',
    badge: 'bg-blue-600 text-white shadow-blue-500/30',
    finger: '#3b82f6',
  },
  teal: {
    ring: 'border-teal-400 bg-teal-500/20',
    dot: 'bg-teal-500 shadow-teal-500/50',
    badge: 'bg-teal-600 text-white shadow-teal-500/30',
    finger: '#14b8a6',
  },
  pink: {
    ring: 'border-pink-400 bg-pink-500/20',
    dot: 'bg-pink-500 shadow-pink-500/50',
    badge: 'bg-pink-600 text-white shadow-pink-500/30',
    finger: '#ec4899',
  },
  emerald: {
    ring: 'border-emerald-400 bg-emerald-500/20',
    dot: 'bg-emerald-500 shadow-emerald-500/50',
    badge: 'bg-emerald-600 text-white shadow-emerald-500/30',
    finger: '#10b981',
  },
};

/**
 * Componente CursorTouch:
 * Simula um ponteiro de toque tátil com efeito de ripple (onda de toque) e animação de tap.
 * Perfeito para onboarding guiado, tutoriais e micro-interações mobile sem bloquear eventos do usuário.
 */
export const CursorTouch: React.FC<CursorTouchProps> = ({
  label,
  variant = 'finger',
  color = 'blue',
  className = '',
  delay = 0.2,
}) => {
  const theme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`pointer-events-none select-none z-30 flex items-center gap-2 ${className}`}
      aria-hidden="true"
    >
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* Ripple Wave 1 (Onda externa de toque) */}
        <motion.span
          className={`absolute rounded-full border ${theme.ring}`}
          initial={{ width: 14, height: 14, opacity: 0.8, scale: 0.7 }}
          animate={{
            width: [14, 44, 52],
            height: [14, 44, 52],
            opacity: [0.8, 0.4, 0],
            scale: [0.7, 1.4, 1.8],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* Ripple Wave 2 (Onda secundária sutil) */}
        <motion.span
          className={`absolute rounded-full border ${theme.ring}`}
          initial={{ width: 10, height: 10, opacity: 0.6, scale: 0.5 }}
          animate={{
            width: [10, 32, 40],
            height: [10, 32, 40],
            opacity: [0.6, 0.2, 0],
            scale: [0.5, 1.2, 1.5],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: delay + 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* Ponto central de impacto */}
        <motion.span
          className={`absolute w-3.5 h-3.5 rounded-full shadow-lg ${theme.dot}`}
          animate={{
            scale: [1, 0.75, 1.1, 1],
            opacity: [0.9, 1, 0.9, 0.9],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay,
            ease: 'easeInOut',
          }}
        />

        {/* Cursor de Mão/Dedo (Tap Hand) */}
        {variant === 'finger' && (
          <motion.div
            className="absolute -right-3 -bottom-4 drop-shadow-md"
            animate={{
              x: [3, 0, 1, 3],
              y: [3, 0, 1, 3],
              scale: [1, 0.88, 0.94, 1],
              rotate: [-4, 0, -2, -4],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transform rotate-[-15deg]"
            >
              {/* Dedo indicador estilizado (Touch Pointer) */}
              <path
                d="M10 2C9.44772 2 9 2.44772 9 3V11.2C8.6 11.07 8.1 11 7.6 11C6.16 11 5 12.16 5 13.6C5 15.2 6.5 17.5 8.7 19.9C10.2 21.5 12.3 22 14.5 22C18.1 22 21 19.1 21 15.5V11C21 9.9 20.1 9 19 9C18.6 9 18.2 9.1 17.9 9.3C17.6 8.5 16.9 8 16 8C15.6 8 15.3 8.1 15 8.3V7C15 5.9 14.1 5 13 5C12.7 5 12.4 5.1 12.1 5.2C11.8 4.5 11 4 10 4V3C10 2.44772 9.55228 2 9 2"
                fill="#ffffff"
                stroke="#1e293b"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 3V12M12 5.5V12M15 8.5V12M18 9.5V13"
                stroke="#cbd5e1"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Etiqueta opcional com dica */}
      {label && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{
            opacity: [0.85, 1, 0.85],
            x: [0, 3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight shadow-md flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md ${theme.badge}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>{label}</span>
        </motion.div>
      )}
    </div>
  );
};
