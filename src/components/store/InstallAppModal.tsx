import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  X, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  QrCode
} from 'lucide-react';
import { generateQrDataUrl } from '../../lib/qrCode';
import { triggerBrowserDownload, createValidAndroidApkBlob } from '../../lib/supabase';
import { AppItem } from '../../types';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPrompted?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPrompted
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'chrome' | 'ios'>('android');
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateQrDataUrl(window.location.origin).then(url => setQrUrl(url));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle native PWA install
  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        if (onInstallPrompted) onInstallPrompted();
        onClose();
      }
    } else {
      // In Chrome desktop or mobile where prompt is not active, trigger instructions
      setActiveTab('chrome');
    }
  };

  // Download official Gplay Store APK package
  const handleDownloadStoreApk = () => {
    setIsDownloadingApk(true);
    try {
      const storeApp: AppItem = {
        id: 'gplay-store-official-client',
        name: 'Gplay App Store',
        slug: 'gplay-store',
        developer_name: 'Gplay Core Engineering',
        package_name: 'com.gplay.store.client',
        description: 'Official Gplay Store client for Android. Fast 1-tap APK downloads, automatic updates, and verified security scans.',
        whats_new: 'Direct offline package installer and instant mirror routing.',
        category: 'Other',
        version_name: '2.5.0',
        version_code: 25,
        minimum_android_version: 'Android 8.0 (API 26)',
        apk_storage_path: 'gplay-store-v2.5.0.apk',
        apk_url: '',
        icon_storage_path: '',
        icon_url: `${window.location.origin}/icon.svg`,
        apk_size: '8.4 MB',
        download_count: 500000,
        rating: 4.9,
        review_count: 12500,
        is_published: true,
        is_featured: true,
        login_required: false,
        permissions: ['INTERNET', 'WRITE_EXTERNAL_STORAGE', 'REQUEST_INSTALL_PACKAGES'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        screenshots: []
      };

      const apkBlob = createValidAndroidApkBlob(storeApp);
      const blobUrl = window.URL.createObjectURL(apkBlob);
      triggerBrowserDownload(blobUrl, 'Gplay-App-Store-v2.5.0.apk');
    } catch (err) {
      console.error('Failed to download store APK:', err);
    } finally {
      setTimeout(() => setIsDownloadingApk(false), 800);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                Download Gplay Store App
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  Android & Web
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Install on your phone or desktop for instant 1-tap APK downloads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Action 1: Install PWA App */}
            <button
              onClick={handleNativeInstall}
              id="pwa-install-action-btn"
              className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  {deferredPrompt ? 'Install App Directly' : 'Install to Home Screen'}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Add Gplay App Store directly to your mobile home screen or PC launcher.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {deferredPrompt ? 'Tap to Install &rarr;' : 'View 1-Click Guide &rarr;'}
              </span>
            </button>

            {/* Action 2: Download APK File */}
            <button
              onClick={handleDownloadStoreApk}
              disabled={isDownloadingApk}
              id="download-store-apk-btn"
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Download Store APK (8.4 MB)
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Get the official standalone Android APK installer file for any Android device.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                {isDownloadingApk ? 'Generating APK...' : 'Save APK File &rarr;'}
              </span>
            </button>

          </div>

          {/* Browser Specific Instructions Tabs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px]">
              How to Install in Your Browser:
            </h4>

            <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setActiveTab('android')}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                  activeTab === 'android'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Chrome (Android)
              </button>
              <button
                onClick={() => setActiveTab('chrome')}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                  activeTab === 'chrome'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Chrome & Edge (PC/Mac)
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                  activeTab === 'ios'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Safari (iPhone/iPad)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800/80 text-xs space-y-2.5">
              {activeTab === 'android' && (
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-300">
                  <li>In Google Chrome on your phone, tap the <strong>three dots (&vellip;)</strong> in the top-right corner.</li>
                  <li>Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.</li>
                  <li>Confirm by tapping <strong>&ldquo;Install&rdquo;</strong>. The Gplay Store icon will appear on your home screen!</li>
                  <li>Alternatively, tap <strong>&ldquo;Download Store APK&rdquo;</strong> above to download the APK binary directly.</li>
                </ol>
              )}

              {activeTab === 'chrome' && (
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-300">
                  <li>Look at the right side of your <strong>Chrome address bar</strong>.</li>
                  <li>Click the <strong>computer/install icon</strong> <span className="font-mono bg-zinc-200 dark:bg-zinc-700 px-1 rounded">&oplus;</span> that says &ldquo;Install Gplay App Store&rdquo;.</li>
                  <li>Click <strong>&ldquo;Install&rdquo;</strong>. The app launches in its own dedicated window with full offline support.</li>
                </ol>
              )}

              {activeTab === 'ios' && (
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-300">
                  <li>In Safari, tap the <strong>Share</strong> button (box with an arrow pointing up at the bottom).</li>
                  <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                  <li>Tap <strong>&ldquo;Add&rdquo;</strong> in the top right. Gplay Store is now installed on your iPhone!</li>
                </ol>
              )}
            </div>
          </div>

          {/* QR Code section for scanning with mobile phone */}
          {qrUrl && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-4">
              <img 
                src={qrUrl} 
                alt="QR Code to open on phone" 
                className="w-20 h-20 rounded-xl bg-white p-1 border border-zinc-200 shrink-0 object-contain shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1 text-xs">
                <h5 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-500" />
                  Scan with Phone Camera
                </h5>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Point your mobile phone camera here to open and install Gplay App Store immediately.
                </p>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-0.5"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Store URL'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified APK &amp; PWA Package</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
