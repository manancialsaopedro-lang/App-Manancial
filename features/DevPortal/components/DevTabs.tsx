import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
}

interface DevTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const DevTabs: React.FC<DevTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 border-b border-cyan-900/10 pb-3 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-[#0a3f4a] text-white shadow-md shadow-cyan-950/20'
                : 'text-slate-600 hover:text-cyan-950 hover:bg-cyan-50/70'
            }`}
          >
            {Icon && <Icon size={15} className={isActive ? 'text-cyan-300' : 'text-slate-400'} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  isActive
                    ? 'bg-cyan-400 text-cyan-950'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
