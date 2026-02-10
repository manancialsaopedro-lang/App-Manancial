import React from 'react';

export const AgeBadge = ({ group, onClick }: { group: string, onClick?: () => void }) => {
  const colors: any = {
    Adulto: 'bg-blue-50 text-blue-600 border-blue-100',
    Jovem: 'bg-purple-50 text-purple-600 border-purple-100',
    Criança: 'bg-orange-50 text-orange-600 border-orange-100',
    Indefinido: 'bg-gray-50 text-gray-400 border-gray-100'
  };
  return (
    <button 
      onClick={onClick} 
      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 ${colors[group] || colors.Indefinido}`}
    >
      {group}
    </button>
  );
};

export const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);
