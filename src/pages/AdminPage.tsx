import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  PlusCircle, 
  Upload, 
  MessageSquare, 
  HardDrive, 
  Settings, 
  ShieldCheck, 
  Lock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminAppsList } from '../components/admin/AdminAppsList';
import { AdminAppForm } from '../components/admin/AdminAppForm';
import { AdminReviews } from '../components/admin/AdminReviews';
import { AdminStorage } from '../components/admin/AdminStorage';
import { AdminSettings } from '../components/admin/AdminSettings';

interface AdminPageProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenAuth }) => {
  const { adminTab, setAdminTab, setCurrentView, isSupabaseConnected } = useAppStore();
  const { user, isAdmin, toggleAdminDevRole } = useAuth();

  // If user is not admin, show friendly authorization unlock screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Administrator Access Required
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            The Gplay App Store Admin Console is protected by Supabase Row Level Security (RLS). You must be signed in with an administrator account.
          </p>
        </div>

        {!user ? (
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Please authenticate with your Supabase account:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <Lock className="w-4 h-4 text-emerald-200" />
                Sign In to Console
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-800 dark:text-zinc-100 transition-all active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Create Admin Account
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
            <div className="text-xs text-zinc-600 dark:text-zinc-300">
              Signed in as <span className="font-semibold text-zinc-900 dark:text-white">{user.email}</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Elevate this account to Administrator role to unlock full publishing and management tools.
            </p>
            <button
              onClick={toggleAdminDevRole}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Elevate Account to Administrator
            </button>
          </div>
        )}

        <div>
          <button
            onClick={() => setCurrentView('home')}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Store Catalog
          </button>
        </div>
      </div>
    );
  }

  // Admin Navigation Tabs
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'apps', label: 'Apps Catalog', icon: Boxes },
    { id: 'add-app', label: 'Add / Edit App', icon: PlusCircle },
    { id: 'upload-apk', label: 'Upload APK', icon: Upload },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'storage', label: 'Storage Buckets', icon: HardDrive },
    { id: 'settings', label: 'Settings & SQL', icon: Settings },
  ] as const;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Admin Subheader Navigation Bar */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentView('home')}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Exit Console
        </button>
      </div>

      {/* View Rendering based on active admin tab */}
      <div>
        {adminTab === 'dashboard' && <AdminDashboard />}
        {adminTab === 'apps' && <AdminAppsList />}
        {(adminTab === 'add-app' || adminTab === 'upload-apk') && <AdminAppForm />}
        {adminTab === 'reviews' && <AdminReviews />}
        {adminTab === 'storage' && <AdminStorage />}
        {adminTab === 'settings' && <AdminSettings />}
      </div>

    </div>
  );
};
