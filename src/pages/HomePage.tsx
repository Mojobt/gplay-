import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, Clock, Car, Flame } from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { FeaturedCarousel } from '../components/store/FeaturedCarousel';
import { CategoryChips } from '../components/store/CategoryChips';
import { AppCard } from '../components/store/AppCard';

export const HomePage: React.FC = () => {
  const { apps, setCurrentView, selectedCategory, setSelectedCategory } = useAppStore();

  const publishedApps = apps.filter(a => a.is_published);
  
  // Filter by category if chip selected
  const displayApps = selectedCategory === 'All' 
    ? publishedApps 
    : publishedApps.filter(a => a.category === selectedCategory);

  // Popular Apps: sorted by download_count
  const popularApps = [...publishedApps].sort((a, b) => b.download_count - a.download_count).slice(0, 6);

  // Recently Added: sorted by created_at
  const recentApps = [...publishedApps].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

  // Transportation category apps (special spotlight)
  const transportationApps = publishedApps.filter(a => a.category === 'Transportation').slice(0, 4);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Featured Apps Hero Banner */}
      <section>
        <FeaturedCarousel apps={publishedApps} />
      </section>

      {/* Category Chips Bar */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Explore Categories
          </h2>
          <button
            onClick={() => setCurrentView('categories')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <CategoryChips />
      </section>

      {/* If category selected, show filtered view directly */}
      {publishedApps.length === 0 ? (
        <div className="py-16 px-6 text-center max-w-lg mx-auto space-y-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              No Applications Published Yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              The store catalog is clean and ready for real applications. Sign in to the Admin Console to add apps, upload genuine Android APK binaries, icons, and screenshots.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('admin')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            Open Admin Console &rarr;
          </button>
        </div>
      ) : selectedCategory !== 'All' ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {selectedCategory} Applications ({displayApps.length})
            </h3>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              Clear Filter
            </button>
          </div>

          {displayApps.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
              No apps found in {selectedCategory} yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Popular Apps */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Popular Apps & Games
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Most downloaded Android APK packages this month
                </p>
              </div>

              <button
                onClick={() => setCurrentView('search')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                See More <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </section>

          {/* Transportation & Mobility Spotlight */}
          {transportationApps.length > 0 && (
            <section className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/10 via-teal-950/5 to-transparent border border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Mobility & Fleet
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
                    <Car className="w-5 h-5 text-emerald-500" />
                    Transportation & Fleet Solutions
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Verified rider, driver, logistics, and navigation APKs
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('Transportation');
                    setCurrentView('categories');
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View Category →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {transportationApps.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Added Apps */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-500" />
                  Recently Added & Updated
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Fresh releases compiled with latest Android SDK targets
                </p>
              </div>

              <button
                onClick={() => setCurrentView('search')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Browse All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
};
