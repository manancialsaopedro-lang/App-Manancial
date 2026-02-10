import React from 'react';

export const OfflinePage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md bg-white/90 border border-gray-200 rounded-2xl shadow-xl p-6 text-center">
        <h1 className="text-xl font-black text-gray-900">Você está offline</h1>
        <p className="mt-3 text-sm text-gray-600">
          Conecte-se à internet para sincronizar os dados. Assim que a conexão
          voltar, o app será atualizado automaticamente.
        </p>
      </div>
    </div>
  );
};
