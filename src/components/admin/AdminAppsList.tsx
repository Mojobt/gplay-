import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { AppItem } from '../../types';
import { useAppStore } from '../../context/AppContext';

export const AdminAppsList: React.FC = () => {
  const { 
    apps, 
    setAdminTab, 
    setEditingApp, 
    deleteApp, 
    togglePublishApp, 
    toggleFeatureApp, 
    triggerAppDownload, 
    navigateToApp 
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const totalCount = apps.length;
  const featuredCount = apps.filter(a => a.is_featured).length;
  const notFeaturedCount = totalCount - featuredCount;
  const publishedCount = apps.filter(a => a.is_published).length;

  const filtered = apps.filter((app) => {
    const matchesQuery = 
      app.name.toLowerCase().includes(query.toLowerCase()) ||
      app.package_name.toLowerCase().includes(query.toLowerCase()) ||
      app.developer_name.toLowerCase().includes(query.toLowerCase());
    const matchesCat = categoryFilter === 'All' || app.category === categoryFilter;
    const matchesFeatured = 
      featuredFilter === 'all' || 
      (featuredFilter === 'featured' && app.is_featured) ||
      (featuredFilter === 'not-featured' && !app.is_featured);
    return matchesQuery && matchesCat && matchesFeatured;
  });

  const handleEdit = (app: AppItem) => {
    setEditingApp(app);
    setAdminTab('add-app');
  };

  const handleDelete = async (id: string) => {
    await deleteApp(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            App Packages Management ({filtered.length} of {totalCount})
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Publish, feature on homepage hero spotlight, edit metadata, and configure APK downloads
          </p>
        </div>

        <button
          onClick={() => {
            setEditingApp(null);
            setAdminTab('add-app');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Application
        </button>
      </div>

      {/* Homepage Featured Banner Spotlight Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Homepage Featured Spotlight ({featuredCount} apps active)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                Hero Carousel & Links
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Apps toggled with <strong>"Show on Home"</strong> appear prominently in the top hero banner carousel on the store home page.
            </p>
          </div>
        </div>

        {/* Quick Tabs to Filter Featured */}
        <div className="flex items-center gap-1.5 shrink-0 bg-white/90 dark:bg-zinc-800/90 p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm">
          <button
            onClick={() => setFeaturedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              featuredFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFeaturedFilter('featured')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              featuredFilter === 'featured'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-600'
            }`}
          >
            <Star className="w-3 h-3 fill-current" /> Featured ({featuredCount})
          </button>
          <button
            onClick={() => setFeaturedFilter('not-featured')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              featuredFilter === 'not-featured'
                ? 'bg-zinc-700 text-white dark:bg-zinc-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Not Featured ({notFeaturedCount})
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, package ID, developer..."
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
        >
          <option value="All">All Categories</option>
          <option value="Transportation">Transportation</option>
          <option value="Business">Business</option>
          <option value="Education">Education</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Games">Games</option>
          <option value="Travel">Travel</option>
          <option value="Productivity">Productivity</option>
          <option value="Social">Social</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Table / List */}
      <div className="rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">App</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Version</th>
                <th className="px-4 py-3.5">Size</th>
                <th className="px-4 py-3.5">Downloads</th>
                <th className="px-4 py-3.5">Rating</th>
                <th className="px-4 py-3.5">Store Status</th>
                <th className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Homepage Featured</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                    No applications match the active filters.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                    
                    {/* Name & Package */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.icon_url}
                          alt={app.name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
                            <span>{app.name}</span>
                            {app.is_featured && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono truncate">
                            {app.package_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                        {app.category}
                      </span>
                    </td>

                    {/* Version */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                      v{app.version_name} ({app.version_code})
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                      {app.apk_size}
                    </td>

                    {/* Downloads */}
                    <td className="px-4 py-3.5 font-semibold text-zinc-900 dark:text-white">
                      {app.download_count.toLocaleString()}
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3.5 text-amber-500 font-bold">
                      ★ {app.rating.toFixed(1)}
                    </td>

                    {/* Publish toggle */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => togglePublishApp(app.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          app.is_published
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                        title={app.is_published ? "Click to set as Draft" : "Click to Publish"}
                      >
                        {app.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    {/* Homepage Featured Toggle Column */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleFeatureApp(app.id)}
                        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none cursor-pointer ${
                          app.is_featured
                            ? 'bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 hover:bg-amber-200/90 shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300'
                        }`}
                        title={app.is_featured ? "Click to remove from Homepage Featured carousel" : "Click to show on Homepage Featured carousel"}
                      >
                        <span className={`w-2 h-2 rounded-full ${app.is_featured ? 'bg-amber-500 animate-pulse' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                        <Star className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${app.is_featured ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
                        <span>{app.is_featured ? 'Show on Home' : 'Hidden from Home'}</span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Download APK test */}
                        <button
                          onClick={() => triggerAppDownload(app)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                          title="Test APK Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(app)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                          title="Edit app details & placement"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        {deleteConfirmId === app.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(app.id)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 hover:border-rose-300 transition-colors"
                            title="Delete app"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
