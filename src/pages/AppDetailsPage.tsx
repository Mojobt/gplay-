import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ScreenshotGallery } from '../components/store/ScreenshotGallery';
import { ReviewSection } from '../components/store/ReviewSection';

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
    setAdminTab 
  } = useAppStore();
  const { user, isAdmin } = useAuth();

  const [copiedLink, setCopiedLink] = useState(false);

  // Find app by slug or fallback to id
  const app = apps.find(a => a.slug === currentSlug || a.id === currentSlug);

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
          
          <button
            onClick={() => triggerAppDownload(app)}
            id="download-apk-button"
            className="w-full md:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-lg shadow-emerald-600/25"
          >
            <Download className="w-5 h-5" />
            <span>Download APK ({app.apk_size})</span>
          </button>

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

    </div>
  );
};
