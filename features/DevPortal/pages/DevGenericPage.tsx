import React from 'react';
import { Layers, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DevGenericPageProps {
  title: string;
  description: string;
  tag?: string;
}

export const DevGenericPage: React.FC<DevGenericPageProps> = ({
  title,
  description,
  tag = 'Em Desenvolvimento'
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-200/80 max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-800 mx-auto flex items-center justify-center mb-4 border border-cyan-100 shadow-sm">
        <Layers size={30} />
      </div>

      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 mb-3">
        {tag}
      </span>

      <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">
        {title}
      </h2>

      <p className="text-xs text-slate-500 leading-relaxed mb-8 max-w-md mx-auto">
        {description}
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dev/igreja')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#082f38] hover:bg-[#0a434d] text-cyan-200 text-xs font-black uppercase tracking-wider transition-all"
        >
          <ArrowLeft size={14} />
          <span>Voltar para Dados da Igreja</span>
        </button>
      </div>
    </div>
  );
};
