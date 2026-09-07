import React from 'react';
import { Home, Grid, Search, ShieldCheck, User } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAuth, onOpenProfile }) => {
  const { currentView, setCurrentView } = useAppStore();
  const { user, isAdmin } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        <button
          id="mobile-nav-home"
          onClick={() => {
            setCurrentView('home');
            window.location.hash = '#/';
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentView === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          id="mobile-nav-categories"
          onClick={() => {
            setCurrentView('categories');
            window.location.hash = '#/categories';
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentView === 'categories'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Categories</span>
        </button>

        <button
          id="mobile-nav-search"
          onClick={() => {
            setCurrentView('search');
            window.location.hash = '#/search';
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentView === 'search'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Search</span>
        </button>

        {isAdmin ? (
          <button
            id="mobile-nav-admin"
            onClick={() => {
              setCurrentView('admin');
              window.location.hash = '#/admin';
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              currentView === 'admin'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        ) : (
          <button
            id="mobile-nav-profile"
            onClick={() => {
              if (user) {
                onOpenProfile();
              } else {
                onOpenAuth();
              }
            }}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-zinc-500 dark:text-zinc-400"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{user ? 'Profile' : 'Sign In'}</span>
          </button>
        )}
      </div>
    </nav>
  );
};
