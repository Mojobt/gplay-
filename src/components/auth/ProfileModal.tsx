import React from 'react';
import { X, User, ShieldCheck, Mail, Calendar, Download, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../context/AppContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, isAdmin, signOut, toggleAdminDevRole } = useAuth();
  const { apps, setCurrentView, setAdminTab } = useAppStore();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            User Account Profile
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Avatar & Badges */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-emerald-600/20">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                {profile?.display_name || user.email?.split('@')[0]}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}>
                  {isAdmin ? 'Store Administrator' : 'Standard User'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span>Account ID:</span>
              <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200">{user.id.slice(0, 16)}...</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span>Member Since:</span>
              <span className="text-zinc-800 dark:text-zinc-200">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span>APK Downloads:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Verified Direct Access</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {isAdmin ? (
              <button
                onClick={() => {
                  onClose();
                  setCurrentView('admin');
                  setAdminTab('dashboard');
                  window.location.hash = '#/admin';
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> Open Admin Console
              </button>
            ) : (
              <button
                onClick={() => {
                  toggleAdminDevRole();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all border border-zinc-200 dark:border-zinc-700"
              >
                <Sparkles className="w-4 h-4 text-amber-500" /> Switch Role to Store Administrator
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                signOut();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
