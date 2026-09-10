import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Check, 
  Star, 
  Calendar, 
  ShieldCheck, 
  HardDrive, 
  Smartphone, 
  Layers, 
  AlertCircle,
  ExternalLink,
  Edit,
  Lock,
  QrCode,
  X
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ScreenshotGallery } from '../components/store/ScreenshotGallery';
import { ReviewSection } from '../components/store/ReviewSection';
import { generateQrDataUrl } from '../lib/qrCode';

interface AppDetailsPageProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const AppDetailsPage: React.FC<AppDetailsPageProps> = ({ onOpenAuth }) => {
  const { 
    currentSlug, 
    apps, 
    reviews, 
    setCurrentView, 
    triggerAppDownload, 
    setEditingApp, 
    setAdminTab,
    isDownloading
  } = useAppStore();
  const { user, isAdmin } = useAuth();

  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Find app by slug or fallback to id
  const app = apps.find(a => a.slug === currentSlug || a.id === currentSlug);

  useEffect(() => {
    if (app && showQrModal) {
      const targetUrl = app.apk_url || `${window.location.origin}/#/app/${app.slug}`;
      generateQrDataUrl(targetUrl).then(url => setQrDataUrl(url));
    }
  }, [app, showQrModal]);

  if (!app) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Application Not Found
        </h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          The requested APK package could not be found or has been unpublished by the publisher.
        </p>
        <button
          onClick={() => setCurrentView('home')}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
        >
          Return to Store Home
        </button>
      </div>
    );
  }

  // App specific reviews
  const appReviews = reviews.filter(r => r.app_id === app.id);

  const handleShare = () => {
    const url = `${window.location.origin}/#/app/${app.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleAdminEdit = () => {
    setEditingApp(app);
    setCurrentView('admin');
    setAdminTab('add-app');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      
      {/* Back Button & Admin Tools */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleAdminEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-emerald-500" />
              Edit App in Console
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Share APK</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Header / Install Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* App Info Left */}
        <div className="flex items-start gap-5">
          {app.icon_url ? (
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-md border border-zinc-200 dark:border-zinc-700 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-3xl shadow-md shrink-0">
              {app.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                {app.category}
              </span>
              {app.login_required && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Sign-in Required
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {app.name}
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {app.developer_name}
            </p>

            <p className="text-[11px] text-zinc-400 font-mono">
              {app.package_name} • v{app.version_name} (build {app.version_code})
            </p>
          </div>
        </div>

        {/* Action Button & Stats Right */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 shrink-0">
          
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => triggerAppDownload(app)}
              id="download-apk-button"
              className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download APK ({app.apk_size})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="hidden sm:flex items-center justify-center p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors shadow-sm"
              title="Scan QR Code with Phone"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" /> {app.rating.toFixed(1)}
            </span>
            <span>•</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {app.download_count.toLocaleString()} installs
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

        </div>

      </div>

      {/* Metadata Specification Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-1">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" /> Package Size
          </span>
          <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white font-mono">
            {app.apk_size}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-1">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-sky-500" /> Current Version
          </span>
          <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white font-mono">
            v{app.version_name}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-1">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" /> Min Android
          </span>
          <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
            {app.minimum_android_version || 'Android 8.0+'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-1">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" /> Updated On
          </span>
          <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
            {new Date(app.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Screenshots Gallery Section */}
      {app.screenshots && app.screenshots.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Device Previews & Screenshots
          </h3>
          <ScreenshotGallery screenshots={app.screenshots} appName={app.name} />
        </section>
      )}

      {/* About this app & What's New */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Description Column (2 cols) */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            About this Application
          </h3>
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {app.description}
          </div>

          {app.whats_new && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                What's New in Version {app.version_name}
              </h4>
              <div className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                {app.whats_new}
              </div>
            </div>
          )}
        </div>

        {/* Security & Permissions Column (1 col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Verified Package Security
          </h3>

          <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
              <strong>Clean Check:</strong> Scanned against known Android malware definitions. Certified APK structure.
            </div>

            <div>
              <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                Declared Android Permissions:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {app.permissions && app.permissions.length > 0 ? (
                  app.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    >
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-400">Standard network access</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Ratings and Reviews Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Ratings & User Reviews
        </h3>
        <ReviewSection
          appId={app.id}
          rating={app.rating}
          reviewCount={app.review_count}
          reviews={appReviews}
          onOpenAuth={onOpenAuth}
        />
      </section>

      {/* Mobile Sticky Bottom Action Bar (always visible on small screens) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={app.icon_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
            alt=""
            className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-800"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
              {app.name}
            </h4>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              {app.apk_size} &bull; v{app.version_name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => triggerAppDownload(app)}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Preparing...' : 'Download APK'}</span>
        </button>
      </div>

      {/* QR Code Dialog for Windows PC users */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-left">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Scan to Download on Phone
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {app.name} (v{app.version_name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {qrDataUrl ? (
              <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-zinc-200">
                <img 
                  src={qrDataUrl} 
                  alt={`QR code to download ${app.name}`}
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
              Open your Android phone's camera, point it at this QR code, and tap the link to download the APK package directly to your mobile device.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
