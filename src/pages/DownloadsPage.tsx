import React, { useState, useEffect } from 'react';
import { 
  FolderDown, 
  Download, 
  ExternalLink, 
  QrCode, 
  Trash2, 
  HelpCircle, 
  Monitor, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  FileBox,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { LocalDownloadedApp } from '../types';
import { generateQrDataUrl } from '../lib/qrCode';
import { triggerBrowserDownload } from '../lib/supabase';

export const DownloadsPage: React.FC = () => {
  const { 
    downloadedApps, 
    clearDownloadedApps, 
    apps, 
    navigateToApp, 
    setCurrentView,
    triggerAppDownload
  } = useAppStore();

  const [activeQrApp, setActiveQrApp] = useState<LocalDownloadedApp | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState<boolean>(true);
  const [detectedOs, setDetectedOs] = useState<'windows' | 'android' | 'mac' | 'ios' | 'other'>('windows');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('android')) setDetectedOs('android');
      else if (ua.includes('win')) setDetectedOs('windows');
      else if (ua.includes('mac') && !ua.includes('iphone')) setDetectedOs('mac');
      else if (ua.includes('iphone') || ua.includes('ipad')) setDetectedOs('ios');
      else setDetectedOs('other');
    }
  }, []);

  useEffect(() => {
    if (activeQrApp) {
      const targetUrl = activeQrApp.direct_url || window.location.origin;
      generateQrDataUrl(targetUrl).then(url => setQrDataUrl(url));
    } else {
      setQrDataUrl('');
    }
  }, [activeQrApp]);

  const handleCopy = async (app: LocalDownloadedApp) => {
    const targetUrl = app.direct_url || `${window.location.origin}/#/app/${app.slug}`;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedId(app.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleRedownload = (item: LocalDownloadedApp) => {
    const matchedApp = apps.find(a => a.id === item.app_id || a.slug === item.slug);
    if (matchedApp) {
      triggerAppDownload(matchedApp);
    } else if (item.direct_url) {
      triggerBrowserDownload(item.direct_url, item.filename);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
            <FolderDown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Downloads & APK Library
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage and re-download verified Android packages across Windows PC and Mobile devices
            </p>
          </div>
        </div>

        {downloadedApps.length > 0 && (
          <button
            type="button"
            onClick={clearDownloadedApps}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Device & Browser Guide Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            {detectedOs === 'android' || detectedOs === 'ios' ? (
              <Smartphone className="w-5 h-5" />
            ) : (
              <Monitor className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Active Environment: {detectedOs === 'windows' ? 'Windows PC' : detectedOs === 'android' ? 'Android Mobile' : detectedOs === 'mac' ? 'Mac' : 'Browser'}
              </span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300">
              {detectedOs === 'windows' ? (
                <>Downloaded APK files appear in your <strong>Downloads</strong> folder (<kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-mono">Ctrl + J</kbd> in Chrome / Edge). Transfer to Android or scan QR code to install.</>
              ) : detectedOs === 'android' ? (
                <>Downloaded APKs appear in your phone's notification bar and <strong>Files &rarr; Downloads</strong> app.</>
              ) : (
                <>Direct download links are provided with high-speed CDN and fallback package generators.</>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 shrink-0"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showTroubleshooting ? 'Hide Browser Tips' : 'Download Not Showing?'}</span>
          {showTroubleshooting ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Troubleshooting Guide: Download Not Showing in Browser */}
      {showTroubleshooting && (
        <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Why did my download not appear in my browser?</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
            {/* Windows PC */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                <Monitor className="w-4 h-4 text-sky-500" />
                <span>Windows PC (Chrome / Edge)</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-[11px]">
                <li>Press <kbd className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded font-mono">Ctrl + J</kbd> to open the browser's download manager.</li>
                <li>If Edge shows <em>"This file may harm your device"</em>, click <strong>...</strong> and choose <strong>Keep</strong>.</li>
                <li>Check the address bar for a blocked pop-up or automatic download icon.</li>
              </ul>
            </div>

            {/* Mobile Android */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Android Mobile Devices</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-[11px]">
                <li>Pull down your Android notification shade to see active downloads.</li>
                <li>When prompted <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>.</li>
                <li>Open your phone's <strong>Files</strong> app and tap the <strong>Downloads</strong> tab.</li>
              </ul>
            </div>

            {/* In-App Previews & Direct Links */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                <ShieldCheck className="w-4 h-4 text-violet-500" />
                <span>Direct Link & QR Scanner</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-[11px]">
                <li>Use the <strong>"New Tab"</strong> button on any app to bypass frame restrictions.</li>
                <li>Use <strong>"Scan QR"</strong> to download directly to your mobile phone from your PC screen.</li>
                <li>All packages are cryptographically signed with valid Android manifests.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Downloaded Apps List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Downloaded APK Packages ({downloadedApps.length})
          </h2>
          {downloadedApps.length > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Stored locally on this browser
            </span>
          )}
        </div>

        {downloadedApps.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <FileBox className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                No apps downloaded yet
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                When you download apps from the store, their installation packages, version history, and direct links will be archived here.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  setCurrentView('home');
                  window.location.hash = '#/';
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <span>Browse Store Apps</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {downloadedApps.map(item => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                {/* App Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.icon_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-13 h-13 rounded-2xl object-cover border border-zinc-100 dark:border-zinc-800 shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 
                        onClick={() => navigateToApp(item.slug)}
                        className="text-sm font-bold text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer truncate"
                      >
                        {item.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        v{item.version_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50">
                        {item.apk_size}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {item.developer_name} &bull; Package: <span className="font-mono text-[11px]">{item.package_name}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      Downloaded on {new Date(item.downloaded_at).toLocaleDateString()} at {new Date(item.downloaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                  {/* Re-download button */}
                  <button
                    type="button"
                    onClick={() => handleRedownload(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {/* Open in new tab (bypasses iframe restrictions) */}
                  {item.direct_url && (
                    <a
                      href={item.direct_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                      title="Open Direct Link in New Tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="Copy Direct Download Link"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* QR Code for Phone */}
                  <button
                    type="button"
                    onClick={() => setActiveQrApp(activeQrApp?.id === item.id ? null : item)}
                    className={`p-2 rounded-xl border transition-colors ${
                      activeQrApp?.id === item.id 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                    title="Scan QR Code to Download on Mobile"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal Dialog for Quick Scanning */}
      {activeQrApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-left">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Scan to Install on Mobile
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {activeQrApp.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveQrApp(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                &times;
              </button>
            </div>

            {qrDataUrl ? (
              <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-zinc-200">
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code for ${activeQrApp.name}`}
                  className="w-48 h-48 object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse">
                <span className="text-xs text-zinc-500">Generating QR...</span>
              </div>
            )}

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Open your Android phone's camera, aim it at this QR code, and tap the link to download <strong className="text-zinc-900 dark:text-white">{activeQrApp.filename}</strong> directly to your phone.
            </p>

            <button
              type="button"
              onClick={() => setActiveQrApp(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Quick App Suggestions if less than 3 downloads */}
      {apps.length > 0 && downloadedApps.length < 3 && (
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Popular Verified Apps Available for Download
            </h3>
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                window.location.hash = '#/';
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {apps.slice(0, 3).map(app => (
              <div
                key={app.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={app.icon_url}
                    alt={app.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 
                      onClick={() => navigateToApp(app.slug)}
                      className="text-xs font-bold text-zinc-900 dark:text-white hover:text-emerald-600 truncate cursor-pointer"
                    >
                      {app.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {app.apk_size} &bull; v{app.version_name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerAppDownload(app)}
                  className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 shrink-0 transition-colors"
                  title="Download APK"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
