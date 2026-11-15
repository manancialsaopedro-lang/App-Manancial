import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff, Wifi, RefreshCw, Home } from 'lucide-react';
import { useAppStore } from '../../store';

export const OfflinePage = () => {
  const navigate = useNavigate();
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : false
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.history.length > 1 ? navigate(-1) : navigate('/');
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={`min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] ${
        isDarkMode ? 'bg-[#070B0E] text-white' : 'bg-[#EFF8FC] text-slate-900'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl border shadow-xl p-6 sm:p-8 text-center space-y-5 ${
          isDarkMode
            ? 'bg-[#101826] border-white/10 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div
          className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${
            isOnline
              ? 'bg-emerald-500/15 text-emerald-500'
              : 'bg-amber-500/15 text-amber-500'
          }`}
        >
          {isOnline ? <Wifi size={28} /> : <WifiOff size={28} />}
        </div>

        <div>
          <h1 className="text-xl font-black">
            {isOnline ? 'Conexão restabelecida' : 'Você está offline'}
          </h1>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {isOnline
              ? 'Sua internet voltou! Toque abaixo para retomar a navegação e sincronizar seus dados.'
              : 'Conecte-se à internet para sincronizar os dados com o servidor. Enquanto isso, seus dados locais permanecem salvos.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleRetry}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors active:scale-95"
          >
            <RefreshCw size={16} />
            <span>{isOnline ? 'Continuar' : 'Tentar novamente'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border transition-colors active:scale-95 ${
              isDarkMode
                ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-200'
                : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Home size={16} />
            <span>Início</span>
          </button>
        </div>
      </div>
    </div>
  );
};
