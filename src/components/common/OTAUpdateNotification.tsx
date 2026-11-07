import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, RefreshCw, X, CheckCircle2, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { otaUpdateService, VersionManifest, CURRENT_CLIENT_BUILD } from '../../services/otaUpdateService';

export const OTAUpdateNotification: React.FC = () => {
  const [updateManifest, setUpdateManifest] = useState<VersionManifest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isAndroid = otaUpdateService.isNativeAndroid();

  useEffect(() => {
    const unsub = otaUpdateService.subscribe((manifest) => {
      setUpdateManifest(manifest);
    });
    return () => unsub();
  }, []);

  if (!updateManifest || dismissed) return null;

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    await otaUpdateService.triggerOTAApply(updateManifest.otaLiveUrl);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-900 border border-red-500/40 rounded-2xl p-4 shadow-2xl text-white animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
          {isAndroid ? <Smartphone className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
              OTA Update Available
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">
              v{updateManifest.appVersion}
            </span>
          </div>
          <h4 className="font-bold text-sm text-slate-100 mt-1">
            New AI Studio Build Ready
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {updateManifest.releaseNotes[0] || 'Over-The-Air code update synchronized from AI Studio.'}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleApplyUpdate}
              disabled={isUpdating}
              className="flex-1 py-2 px-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-red-700/30 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing OTA...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Update App Now</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setDismissed(true);
                otaUpdateService.dismissUpdate(updateManifest.appVersion);
              }}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
