import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  variant?: 'default' | 'white';
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Voltar',
  className = '',
  variant = 'default',
}) => {
  const isWhite = variant === 'white';
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all group ${
        isWhite
          ? 'text-blue-100/90 hover:text-white'
          : 'text-slate-500 hover:text-[#00153d]'
      } ${className}`}
    >
      <div
        className={`p-2.5 rounded-xl transition-all border ${
          isWhite
            ? 'bg-white/10 border-white/20 text-white group-hover:bg-white/20'
            : 'bg-white shadow-lg shadow-blue-900/5 group-hover:shadow-blue-900/10 border-black/5 group-hover:border-blue-500/20'
        }`}
      >
        <ChevronLeft
          size={18}
          strokeWidth={3}
          className={`transition-transform group-hover:-translate-x-0.5 ${
            isWhite ? 'text-white' : 'text-blue-600'
          }`}
        />
      </div>
      <span className="group-hover:translate-x-1 transition-transform">{label}</span>
    </motion.button>
  );
};
