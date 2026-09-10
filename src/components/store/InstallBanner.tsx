import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

interface InstallBannerProps {
  onOpenInstallModal: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onOpenInstallModal }) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('gplay_install_banner_dismissed');
      if (saved) setDismissed(true);
    } catch {}
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('gplay_install_banner_dismissed', 'true');
    } catch {}
  };

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-3.5 py-2 text-xs flex items-center justify-between gap-2 shadow-sm border-b border-emerald-500/30">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold truncate text-[11px] sm:text-xs">
            Download Gplay App Store for Android &amp; Chrome
          </p>
          <p className="text-[10px] text-emerald-100/90 truncate hidden xs:block">
            Install to your phone for instant 1-tap APK downloads
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenInstallModal}
          id="mobile-install-banner-btn"
          className="px-3 py-1 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-[11px] shadow-sm transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
        >
          Download App
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
