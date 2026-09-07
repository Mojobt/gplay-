import React from 'react';
import { 
  Boxes, 
  CheckCircle2, 
  Download, 
  Users, 
  Calendar, 
  Plus, 
  Upload, 
  Database, 
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { stats, apps, setAdminTab, isSupabaseConnected } = useAppStore();

  const statCards = [
    {
      label: 'Total Apps',
      value: stats.totalApps,
      icon: Boxes,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50',
      description: 'Total catalog packages',
    },
    {
      label: 'Published Apps',
      value: stats.publishedApps,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
      description: 'Live in public store',
    },
    {
      label: 'Total Downloads',
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
      description: 'Real verified APK fetches',
    },
    {
      label: 'Active Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
      description: 'Registered profiles',
    },
    {
      label: 'Added This Month',
      value: stats.appsAddedThisMonth,
      icon: Calendar,
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/50',
      description: 'Recent 30-day updates',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-xs text-emerald-100 flex items-center gap-1">
              <Database className="w-3 h-3" />
              {isSupabaseConnected ? 'Connected to Supabase' : 'Offline / Preview State'}
            </span>
          </div>
          <h2 className="text-2xl font-bold">Gplay App Store Console</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Manage your Android application catalog, upload APK binaries to Supabase Storage, inspect live telemetry, and configure Row Level Security.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAdminTab('add-app')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add New App
          </button>
          <button
            onClick={() => setAdminTab('upload-apk')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-800 text-white transition-colors"
          >
            <Upload className="w-4 h-4" /> Direct APK Upload
          </button>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </span>
                <div className={`p-1.5 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-white">
                {stat.value}
              </div>
              <p className="text-[11px] text-zinc-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Apps Quick Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-700/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Recent Application Releases
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live status across your Supabase distribution tables
            </p>
          </div>
          <button
            onClick={() => setAdminTab('apps')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All ({apps.length}) →
          </button>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-700/60 overflow-x-auto">
          {apps.slice(0, 5).map((app) => (
            <div
              key={app.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={app.icon_url}
                  alt={app.name}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                />
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white truncate">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-mono truncate">
                    {app.package_name} • v{app.version_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                  {app.category}
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {app.download_count.toLocaleString()} dls
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  app.is_published 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {app.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
