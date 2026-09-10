import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Smartphone, 
  FileCheck2, 
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Share2,
  FolderDown,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { generateQrDataUrl } from '../../lib/qrCode';
import { triggerBrowserDownload } from '../../lib/supabase';

export const DownloadModal: React.FC = () => {
  const { 
    isDownloading, 
    downloadProgress, 
    downloadError, 
    downloadSuccessApp, 
    setDownloadSuccessApp,
    downloadActivePayload,
    setCurrentView
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [selectedGuideTab, setSelectedGuideTab] = useState<'mobile' | 'pc'>('mobile');

  const activeApp = downloadSuccessApp;
  const fileName = downloadActivePayload?.filename || (activeApp 
    ? `${activeApp.slug || 'app'}-v${activeApp.version_name}.apk` 
    : 'application.apk');

  const downloadUrl = downloadActivePayload?.url || '';

  // Generate QR code whenever active download URL is available
  useEffect(() => {
    if (downloadUrl) {
      // If relative or blob, construct a clean downloadable link
      const targetUrl = downloadActivePayload?.directPublicUrl || window.location.href;
      generateQrDataUrl(targetUrl).then(url => setQrDataUrl(url));
    }
  }, [downloadUrl, downloadActivePayload]);

  if (!isDownloading && !downloadSuccessApp && !downloadError) {
    return null;
  }

  const handleCopyLink = async () => {
    const targetLink = downloadActivePayload?.directPublicUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(targetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleManualTrigger = () => {
    if (downloadUrl) {
      triggerBrowserDownload(downloadUrl, fileName);
    }
  };

  const handleShare = async () => {
    const targetLink = downloadActivePayload?.directPublicUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Download ${activeApp?.name || 'App'} APK`,
          text: `Download verified Android APK package for ${activeApp?.name || 'this app'} (${activeApp?.version_name || '1.0'})`,
          url: targetLink,
        });
      } catch {
        // User dismissed
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                {isDownloading 
                  ? 'Preparing Android APK' 
                  : downloadError 
                    ? 'Download Problem' 
                    : 'APK Download Ready'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeApp?.name ? `${activeApp.name} (v${activeApp.version_name})` : 'Android Package'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDownloadSuccessApp(null)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Downloading Progress State */}
          {isDownloading && (
            <div className="space-y-4 text-center py-4">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                    className="text-zinc-200 dark:text-zinc-800"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 - (213.6 * downloadProgress) / 100}
                    className="text-emerald-500 transition-all duration-300 stroke-round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-white">
                  {downloadProgress}%
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Preparing Android Package & Storage Link...
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Validating APK signatures, package manifests, and direct browser channels
                </p>
              </div>
            </div>
          )}

          {/* Download Error State */}
          {downloadError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                  Download was blocked or encountered an issue
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {downloadError}
                </p>
              </div>
            </div>
          )}

          {/* Download Ready Section */}
          {downloadSuccessApp && !isDownloading && (
            <div className="space-y-5">
              
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    APK Ready for Download
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
                    {fileName} &bull; {activeApp.apk_size}
                  </p>
                </div>
              </div>

              {/* PRIMARY ACTION: Direct Clickable Link */}
              <div className="space-y-2">
                <a
                  href={downloadUrl || '#'}
                  download={fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleManualTrigger}
                  id="direct-apk-download-btn"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all cursor-pointer group"
                >
                  <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                  <span>Download APK Now ({activeApp.apk_size})</span>
                  <ExternalLink className="w-4 h-4 opacity-75 ml-auto" />
                </a>

                <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400">
                  If the download did not start automatically in your browser tray, click the green button above.
                </p>
              </div>

              {/* Secondary Actions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {/* Re-trigger */}
                <button
                  type="button"
                  onClick={handleManualTrigger}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-500" />
                  <span>Re-trigger</span>
                </button>

                {/* Open in New Tab (Bypasses Iframe Sandbox) */}
                <a
                  href={downloadUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-sky-500" />
                  <span>New Tab</span>
                </a>

                {/* Copy Direct URL */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-500" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>

                {/* QR Code toggle or Share */}
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-violet-500" />
                    <span>Share</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      showQr 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-500" />
                    <span>Scan QR</span>
                  </button>
                )}
              </div>

              {/* QR Code Panel for Windows PC users wanting to install on Mobile */}
              {showQr && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-center space-y-3">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Scan with Android Camera to Download on Mobile
                  </p>
                  {qrDataUrl ? (
                    <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-zinc-200">
                      <img 
                        src={qrDataUrl} 
                        alt="QR Code for mobile APK download" 
                        className="w-44 h-44 object-contain mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 mx-auto flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 rounded-2xl animate-pulse">
                      <span className="text-xs text-zinc-500">Generating QR...</span>
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Point your Android phone camera at the QR code above to download the APK package straight to your mobile device.
                  </p>
                </div>
              )}

              {/* Step-by-Step Installation Guides */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {/* Guide Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGuideTab('mobile')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      selectedGuideTab === 'mobile'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>On Mobile Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGuideTab('pc')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      selectedGuideTab === 'pc'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>On Windows PC</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 bg-white dark:bg-zinc-900/60 text-xs text-zinc-600 dark:text-zinc-300">
                  {selectedGuideTab === 'mobile' ? (
                    <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
                      <li>Check your phone's notification bar or open the <strong>Files / Downloads</strong> app.</li>
                      <li>Tap the downloaded package: <strong className="text-zinc-900 dark:text-zinc-100">{fileName}</strong>.</li>
                      <li>If prompted with <em>"Install unknown apps"</em>, tap <strong>Settings</strong> and enable <strong>Allow from this source</strong>.</li>
                      <li>Tap <strong>Install</strong> to finish setup.</li>
                    </ol>
                  ) : (
                    <div className="space-y-2 text-[11px] leading-relaxed">
                      <p>
                        Your APK file is saved to your PC's <strong>Downloads</strong> folder (Press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-mono">Ctrl + J</kbd> in Chrome / Edge).
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        To install on your phone, connect via USB cable, transfer via Bluetooth / Google Drive, or scan the QR code above.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Modal Footer Links */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setDownloadSuccessApp(null);
                setCurrentView('downloads');
                window.location.hash = '#/downloads';
              }}
              className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>View Download History</span>
            </button>

            <button
              type="button"
              onClick={() => setDownloadSuccessApp(null)}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
