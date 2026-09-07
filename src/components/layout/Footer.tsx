import React from 'react';
import { Smartphone, ShieldCheck, Database, FileCode2, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView, setAdminTab, isSupabaseConnected } = useAppStore();

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 pt-12 pb-24 md:pb-12 text-zinc-600 dark:text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                Gplay App Store
              </span>
            </div>
            <p className="leading-relaxed">
              Real Android APK distribution platform powered by Supabase. Providing direct, verified, and signature-checked APK downloads for smartphones, tablets, and head units.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3" /> Play Protect Compliant
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-3">Categories</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentView('categories')} className="hover:text-emerald-600 dark:hover:text-emerald-400">Transportation & Fleet</button></li>
              <li><button onClick={() => setCurrentView('categories')} className="hover:text-emerald-600 dark:hover:text-emerald-400">Productivity & Notes</button></li>
              <li><button onClick={() => setCurrentView('categories')} className="hover:text-emerald-600 dark:hover:text-emerald-400">Business & POS</button></li>
              <li><button onClick={() => setCurrentView('categories')} className="hover:text-emerald-600 dark:hover:text-emerald-400">Games & Entertainment</button></li>
            </ul>
          </div>

          {/* Developer & Admin */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-3">Developer & Admin</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => {
                    setCurrentView('admin');
                    setAdminTab('add-app');
                    window.location.hash = '#/admin';
                  }} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Publish New APK
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentView('admin');
                    setAdminTab('settings');
                    window.location.hash = '#/admin';
                  }} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Supabase Schema & Storage
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentView('admin');
                    setAdminTab('dashboard');
                    window.location.hash = '#/admin';
                  }} 
                  className="hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Marketplace Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Backend Info */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-3">Infrastructure</h4>
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-500" /> Supabase Storage
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isSupabaseConnected 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                }`}>
                  {isSupabaseConnected ? 'Live Connected' : 'Configurable'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Uses 3 dedicated buckets: <code className="text-emerald-600 dark:text-emerald-400 font-mono">app-apks</code>, <code className="text-emerald-600 dark:text-emerald-400 font-mono">app-icons</code>, <code className="text-emerald-600 dark:text-emerald-400 font-mono">app-screenshots</code>.
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 text-[11px]">
            © 2026 Gplay App Store. Android is a trademark of Google LLC. This app is an independent distribution platform.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span>APK Integrity: SHA-256</span>
            <span>TLS 1.3 Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
