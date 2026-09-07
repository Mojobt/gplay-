import React, { useState } from 'react';
import { 
  Database, 
  FolderArchive, 
  Image as ImageIcon, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { getSupabase, BUCKET_APKS, BUCKET_ICONS, BUCKET_SCREENSHOTS } from '../../lib/supabase';

export const AdminStorage: React.FC = () => {
  const { apps, isSupabaseConnected, setAdminTab } = useAppStore();
  const [checking, setChecking] = useState(false);

  const buckets = [
    {
      id: BUCKET_APKS,
      name: 'app-apks',
      type: 'Android APK Binaries (.apk)',
      policy: 'Public Read / Admin Write',
      icon: FolderArchive,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
      description: 'Stores Android Application Package (.apk) distribution binaries with signature validation.',
      fileCount: apps.filter(a => a.apk_storage_path).length,
    },
    {
      id: BUCKET_ICONS,
      name: 'app-icons',
      type: 'App Launch Icons (WebP / PNG / JPG)',
      policy: 'Public Read / Admin Write',
      icon: ImageIcon,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/60',
      description: 'Stores 512x512 rounded application branding badges and launcher icons.',
      fileCount: apps.filter(a => a.icon_url).length,
    },
    {
      id: BUCKET_SCREENSHOTS,
      name: 'app-screenshots',
      type: 'Promotional Device Shots',
      policy: 'Public Read / Admin Write',
      icon: FileCode,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60',
      description: 'Stores phone and tablet app interface previews, feature highlights, and mockups.',
      fileCount: apps.reduce((acc, a) => acc + (a.screenshots?.length || 0), 0),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Supabase Storage Buckets
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Dedicated asset storage infrastructure configured with public CDN delivery and Row Level Security
          </p>
        </div>

        <button
          onClick={() => setAdminTab('upload-apk')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" /> Upload New Asset
        </button>
      </div>

      {/* Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buckets.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${b.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    {b.policy}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-white font-mono">
                    {b.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {b.type}
                  </p>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Linked Assets:</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono">
                  {b.fileCount} records
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Storage Bucket Configuration Code */}
      <div className="p-6 rounded-3xl bg-zinc-900 text-zinc-200 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">
              Supabase Storage Bucket SQL Definition
            </h4>
          </div>
          <button
            onClick={() => setAdminTab('settings')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Open Full SQL Setup →
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-black/60 font-mono text-[11px] overflow-x-auto text-emerald-400 leading-relaxed">
{`-- Insert Storage Buckets in Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('app-apks', 'app-apks', true),
    ('app-icons', 'app-icons', true),
    ('app-screenshots', 'app-screenshots', true)
ON CONFLICT (id) DO NOTHING;`}
        </pre>
      </div>

    </div>
  );
};
