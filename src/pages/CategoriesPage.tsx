import React, { useState } from 'react';
import { 
  Car, 
  Briefcase, 
  GraduationCap, 
  Film, 
  Gamepad2, 
  Plane, 
  CheckCircle2, 
  MessageCircle, 
  Boxes,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { AppCategory } from '../types';
import { AppCard } from '../components/store/AppCard';

export const CategoriesPage: React.FC = () => {
  const { apps } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<AppCategory | 'All'>('All');

  const publishedApps = apps.filter(a => a.is_published);

  const categoryConfigs: { name: AppCategory; icon: any; color: string; desc: string }[] = [
    {
      name: 'Transportation',
      icon: Car,
      color: 'from-emerald-500 to-teal-600',
      desc: 'Ride-hailing, motorcycle pilots, parcel couriers, transit navigation, and fleet telematics.',
    },
    {
      name: 'Productivity',
      icon: CheckCircle2,
      color: 'from-sky-500 to-blue-600',
      desc: 'Markdown notebooks, organizers, task trackers, and distraction-free editing tools.',
    },
    {
      name: 'Games',
      icon: Gamepad2,
      color: 'from-rose-500 to-pink-600',
      desc: 'Arcade drift simulators, action racers, puzzle engines, and mobile championships.',
    },
    {
      name: 'Business',
      icon: Briefcase,
      color: 'from-amber-500 to-orange-600',
      desc: 'Point-of-sale systems, Bluetooth receipt printing, invoice generators, and commerce.',
    },
    {
      name: 'Entertainment',
      icon: Film,
      color: 'from-purple-500 to-indigo-600',
      desc: 'Pocket DAWs, beat sequencers, audio creators, streaming utilities, and media players.',
    },
    {
      name: 'Education',
      icon: GraduationCap,
      color: 'from-teal-500 to-cyan-600',
      desc: 'Coding playgrounds, interactive Python REPLs, flashcards, and technical learning.',
    },
    {
      name: 'Travel',
      icon: Plane,
      color: 'from-blue-500 to-indigo-600',
      desc: 'Offline city guides, emergency phrase cards, currency converters, and trip planners.',
    },
    {
      name: 'Social',
      icon: MessageCircle,
      color: 'from-pink-500 to-rose-600',
      desc: 'Messaging apps, community forums, voice chat rooms, and decentralized feeds.',
    },
    {
      name: 'Other',
      icon: Boxes,
      color: 'from-zinc-500 to-zinc-700',
      desc: 'System utilities, file managers, developer tools, and specialty Android packages.',
    },
  ];

  const filteredApps = activeCategory === 'All'
    ? publishedApps
    : publishedApps.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Application Categories
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Browse specialized Android APK packages curated by industry and functionality
        </p>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryConfigs.map((cat) => {
          const Icon = cat.icon;
          const count = publishedApps.filter(a => a.category === cat.name).length;
          const isSelected = activeCategory === cat.name;

          return (
            <div
              key={cat.name}
              id={`cat-card-${cat.name.toLowerCase()}`}
              onClick={() => setActiveCategory(isSelected ? 'All' : cat.name)}
              className={`group p-5 rounded-3xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-500/50 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    {count} {count === 1 ? 'app' : 'apps'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{isSelected ? 'Viewing apps below' : 'Browse category'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtered Apps List */}
      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {activeCategory === 'All' ? 'All Published Applications' : `${activeCategory} Applications`} ({filteredApps.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Direct, verified APK packages ready for immediate installation
            </p>
          </div>

          {activeCategory !== 'All' && (
            <button
              onClick={() => setActiveCategory('All')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Show All Apps
            </button>
          )}
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
            No applications available in {activeCategory} at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
