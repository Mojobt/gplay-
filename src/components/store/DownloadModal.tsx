import React from 'react';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Smartphone, 
  ShieldCheck, 
  FileCheck2, 
  HelpCircle 
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';

export const DownloadModal: React.FC = () => {
  const { 
    isDownloading, 
    downloadProgress, 
    downloadError, 
    downloadSuccessApp, 
    setDownloadSuccessApp 
  } = useAppStore();

  if (!isDownloading && !downloadSuccessApp && !downloadError) {
    return null;
  }

  const activeApp = downloadSuccessApp;
  const fileName = activeApp 
    ? `${activeApp.slug || 'app'}-v${activeApp.version_name}.apk` 
    : 'package.apk';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {isDownloading ? 'Downloading Android APK' : downloadError ? 'Download Error' : 'APK Download Started'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeApp?.name || 'Package Installer'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDownloadSuccessApp(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Downloading Progress State */}
          {isDownloading && (
            <div className="space-y-3 text-center py-2">
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-zinc-200 dark:text-zinc-800"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * downloadProgress) / 100}
                    className="text-emerald-500 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-zinc-900 dark:text-white">
                  {downloadProgress}%
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Fetching verified package from Supabase Storage...
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Verifying SHA256 integrity and package signatures
                </p>
              </div>
            </div>
          )}

          {/* Download Error State */}
          {downloadError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                  Unable to complete download
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {downloadError}
                </p>
              </div>
            </div>
          )}

          {/* Success State & Install Instructions */}
          {downloadSuccessApp && !isDownloading && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    File dispatched to browser
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono break-all">
                    {fileName} ({downloadSuccessApp.apk_size})
                  </p>
                </div>
              </div>

              {/* Android Sideload Guide */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  How to Install on Android
                </div>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed pl-1 text-[11px]">
                  <li>Open your phone's <strong>Downloads</strong> folder or tap the completed notification.</li>
                  <li>Tap the <strong>{fileName}</strong> package.</li>
                  <li>If prompted with <em>"Install unknown apps"</em>, tap <strong>Settings</strong> and switch <strong>Allow from this source</strong> ON.</li>
                  <li>Tap <strong>Install</strong> to complete setup.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="pt-2">
            <button
              onClick={() => setDownloadSuccessApp(null)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition-colors"
            >
              Got it
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
