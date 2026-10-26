import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  // Android / Chrome / Desktop PWA flow
  if (isInstallable) {
    return (
      <div className="bg-gradient-to-r from-[#0C1A34] via-[#0E2448] to-[#0C1A34] border-b border-cyan-500/20 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-[#00D2FF] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,210,255,0.25)]">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-headline font-bold text-white block truncate">
              Instalar ImobPro no Celular
            </span>
            <span className="text-cyan-200/70 text-[10px] block truncate">
              Funciona offline com experiência nativa
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={install}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00D2FF] to-[#0284c7] text-[#001f28] font-headline font-extrabold text-xs shadow-[0_0_12px_rgba(0,210,255,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            Instalar App
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
            aria-label="Dispensar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <div className="bg-[#0C1322] border-b border-cyan-500/20 text-slate-200 px-4 py-2 shadow-sm flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Smartphone className="w-4 h-4 text-[#00D2FF] shrink-0" />
            <span className="truncate">Instale o ImobPro na sua Tela de Início</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowIOSGuide(true)}
              className="text-[#00D2FF] font-bold text-xs underline cursor-pointer"
            >
              Como Instalar
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0B132B] border border-cyan-500/40 p-5 shadow-2xl flex flex-col gap-3 text-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-white text-base">Instalar no iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-[#00D2FF] font-bold flex items-center justify-center shrink-0 text-xs border border-cyan-400/40">
                    1
                  </div>
                  <p>
                    No Safari, toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta para cima{' '}
                    <Share className="w-3.5 h-3.5 inline text-cyan-400" />) na barra inferior.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-[#00D2FF] font-bold flex items-center justify-center shrink-0 text-xs border border-cyan-400/40">
                    2
                  </div>
                  <p>
                    Role a lista e selecione{' '}
                    <strong>Adicionar à Tela de Início</strong> (
                    <PlusSquare className="w-3.5 h-3.5 inline text-slate-200" />).
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-[#00D2FF] font-bold flex items-center justify-center shrink-0 text-xs border border-cyan-400/40">
                    3
                  </div>
                  <p>
                    Confirme tocando em <strong>Adicionar</strong> no canto superior direito.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-1 w-full h-10 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0284c7] text-[#001f28] font-headline font-bold text-xs shadow-[0_0_15px_rgba(0,210,255,0.4)]"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
