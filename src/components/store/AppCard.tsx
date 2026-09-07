import React from 'react';
import { Download, Star, CheckCircle2, ShieldAlert, Smartphone } from 'lucide-react';
import { AppItem } from '../../types';
import { useAppStore } from '../../context/AppContext';

interface AppCardProps {
  app: AppItem;
  layout?: 'grid' | 'list';
}

export const AppCard: React.FC<AppCardProps> = ({ app, layout = 'grid' }) => {
  const { navigateToApp, triggerAppDownload, isDownloading } = useAppStore();
  const [downloadingThis, setDownloadingThis] = React.useState(false);

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingThis(true);
    try {
      await triggerAppDownload(app);
    } finally {
      setDownloadingThis(false);
    }
  };

  const formatDownloads = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  if (layout === 'list') {
    return (
      <div
        id={`app-card-${app.id}`}
        onClick={() => navigateToApp(app.slug)}
        className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {app.icon_url ? (
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-14 h-14 rounded-2xl object-cover border border-zinc-100 dark:border-zinc-700 shrink-0 shadow-sm group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              {app.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {app.developer_name} • {app.category}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                <Star className="w-3 h-3 fill-current" /> {app.rating.toFixed(1)}
              </span>
              <span>•</span>
              <span>{app.apk_size}</span>
              <span>•</span>
              <span>v{app.version_name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-3 shrink-0">
          <button
            onClick={handleDownloadClick}
            disabled={downloadingThis}
            aria-label={`Download ${app.name} APK`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm transition-all disabled:opacity-50"
          >
            {downloadingThis ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`app-card-${app.id}`}
      onClick={() => navigateToApp(app.slug)}
      className="group flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-3.5 mb-3">
          {app.icon_url ? (
            <img
              src={app.icon_url}
              alt={app.name}
              className="w-16 h-16 rounded-2xl object-cover border border-zinc-100 dark:border-zinc-700/80 shrink-0 shadow-sm group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              {app.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-zinc-900 dark:text-white text-base leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {app.developer_name}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                {app.category}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                v{app.version_name}
              </span>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
          {app.description}
        </p>
      </div>

      {/* Footer Info & Download Action */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {app.rating.toFixed(1)}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">•</span>
          <span>{formatDownloads(app.download_count)} dls</span>
          <span className="text-zinc-400 dark:text-zinc-500">•</span>
          <span>{app.apk_size}</span>
        </div>

        <button
          onClick={handleDownloadClick}
          disabled={downloadingThis}
          aria-label={`Get APK for ${app.name}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm transition-all disabled:opacity-50 shrink-0"
        >
          {downloadingThis ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Get APK</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
