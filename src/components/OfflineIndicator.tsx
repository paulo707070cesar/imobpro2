import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (justReconnected) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-2">
        <Wifi className="w-3.5 h-3.5" />
        <span>Conexão restabelecida! Sincronizando dados...</span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 flex items-center justify-between gap-3 rounded-xl bg-gray-900 border border-gray-800 px-4 py-2.5 text-xs font-medium text-white shadow-2xl">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Modo Offline — O ImobPro continua funcionando normalmente com salvamento local.</span>
      </div>
    </div>
  );
};
