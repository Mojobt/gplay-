import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { AppItem } from '../../types';
import { useAppStore } from '../../context/AppContext';

interface FeaturedCarouselProps {
  apps: AppItem[];
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ apps }) => {
  const { navigateToApp, triggerAppDownload } = useAppStore();
  const featuredApps = apps.filter(a => a.is_featured);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredApps.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredApps.length]);

  // If no apps are marked as featured, hide the carousel so admin has full control
  if (featuredApps.length === 0) {
    return null;
  }

  const safeIndex = currentIndex >= featuredApps.length ? 0 : currentIndex;
  const currentApp = featuredApps[safeIndex];

  if (!currentApp) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/60 shadow-xl text-white">
      {/* Background ambient glow */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center filter blur-xl transform scale-110 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${currentApp.screenshots?.[0] || currentApp.icon_url})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left App Details */}
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Featured Android Release
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-zinc-300">
              {currentApp.category}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <img
              src={currentApp.icon_url}
              alt={currentApp.name}
              onClick={() => navigateToApp(currentApp.slug)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg cursor-pointer hover:scale-105 transition-transform"
            />
            <div>
              <h2 
                onClick={() => navigateToApp(currentApp.slug)}
                className="text-2xl sm:text-3xl font-extrabold tracking-tight hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {currentApp.name}
              </h2>
              <p className="text-sm text-zinc-300 font-medium">
                {currentApp.developer_name}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-300">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" /> {currentApp.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span>{currentApp.apk_size}</span>
                <span>•</span>
                <span>v{currentApp.version_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Safe APK
                </span>
              </div>
            </div>
          </div>

          <p className="text-zinc-300 text-sm sm:text-base line-clamp-2 leading-relaxed">
            {currentApp.description}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              id={`featured-download-${currentApp.id}`}
              onClick={() => triggerAppDownload(currentApp)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download APK ({currentApp.apk_size})</span>
            </button>

            <button
              onClick={() => navigateToApp(currentApp.slug)}
              className="px-4 py-3 rounded-xl font-medium text-sm bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Right Screenshot Showcase */}
        {currentApp.screenshots && currentApp.screenshots.length > 0 && (
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className="relative w-44 h-80 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl rotate-2 hover:rotate-0 transition-transform">
              <img
                src={currentApp.screenshots[0]}
                alt="Screenshot 1"
                className="w-full h-full object-cover"
              />
            </div>
            {currentApp.screenshots[1] && (
              <div className="relative w-44 h-80 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl -rotate-2 hover:rotate-0 transition-transform">
                <img
                  src={currentApp.screenshots[1]}
                  alt="Screenshot 2"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

      </div>

      {/* Slide dots and controls */}
      {featuredApps.length > 1 && (
        <div className="relative z-10 px-6 sm:px-8 py-3 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {featuredApps.map((app, idx) => (
              <button
                key={app.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-8 bg-emerald-500' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredApps.length) % featuredApps.length)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              aria-label="Previous featured app"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredApps.length)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              aria-label="Next featured app"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
