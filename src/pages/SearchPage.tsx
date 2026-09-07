import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  X, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { AppCard } from '../components/store/AppCard';
import { AppCategory } from '../types';

export const SearchPage: React.FC = () => {
  const { apps, searchQuery, setSearchQuery } = useAppStore();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'name' | 'newest'>('downloads');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const publishedApps = apps.filter(a => a.is_published);

  // Search logic: name, developer, category, description
  const results = publishedApps.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      app.name.toLowerCase().includes(q) ||
      app.developer_name.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.package_name.toLowerCase().includes(q);

    const matchCat = selectedCat === 'All' || app.category === selectedCat;

    return matchQuery && matchCat;
  });

  // Sort logic
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'downloads') return b.download_count - a.download_count;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  const categories = [
    'All',
    'Transportation',
    'Business',
    'Education',
    'Entertainment',
    'Games',
    'Travel',
    'Productivity',
    'Social',
    'Other',
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Search Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
        
        {/* Main Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by app name, developer, category, or features..."
            className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm sm:text-base pl-12 pr-10 py-3.5 rounded-2xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters and Layout Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-2xl scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-700/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort and View Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Recently Added</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>

            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-400'
                }`}
                title="Grid layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-400'
                }`}
                title="List layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <span>
          Showing <strong>{sortedResults.length}</strong> {sortedResults.length === 1 ? 'application' : 'applications'}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
          {selectedCat !== 'All' ? ` in ${selectedCat}` : ''}
        </span>
        {(searchQuery || selectedCat !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCat('All');
            }}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Results Container */}
      {sortedResults.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center text-zinc-400 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              No apps found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              We couldn't find any APK package matching your query. Try searching for broader terms like "transportation", "rider", "notes", or "games".
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400">Try searching:</span>
            {['Motoride', 'Notes', 'Racer', 'Invoice', 'DAW', 'Transit'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {sortedResults.map((app) => (
            <AppCard key={app.id} app={app} layout={viewMode} />
          ))}
        </div>
      )}

    </div>
  );
};
