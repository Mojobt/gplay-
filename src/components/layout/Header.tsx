import React, { useState } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  ShieldCheck, 
  User, 
  LogOut, 
  Download, 
  Layers, 
  Sparkles,
  Database,
  Smartphone
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, onOpenProfile }) => {
  const { 
    currentView, 
    setCurrentView, 
    searchQuery, 
    setSearchQuery, 
    isDark, 
    toggleTheme, 
    isSupabaseConnected,
    downloadedApps 
  } = useAppStore();

  const { user, profile, isAdmin, signOut, toggleAdminDevRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView('search');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <div 
            id="brand-logo"
            onClick={() => {
              setCurrentView('home');
              window.location.hash = '#/';
            }}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight leading-none">
                  Gplay
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400">
                  APP STORE
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                Android APK Marketplace
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-home-btn"
              onClick={() => {
                setCurrentView('home');
                window.location.hash = '#/';
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Home
            </button>
            <button
              id="nav-categories-btn"
              onClick={() => {
                setCurrentView('categories');
                window.location.hash = '#/categories';
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'categories'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Categories
            </button>
            <button
              id="nav-search-btn"
              onClick={() => {
                setCurrentView('search');
                window.location.hash = '#/search';
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'search'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Search
            </button>
            <button
              id="nav-downloads-btn"
              onClick={() => {
                setCurrentView('downloads');
                window.location.hash = '#/downloads';
              }}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'downloads'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Downloads</span>
              {downloadedApps.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white leading-none">
                  {downloadedApps.length}
                </span>
              )}
            </button>

            {/* Admin Console Link */}
            <button
              id="nav-admin-btn"
              onClick={() => {
                setCurrentView('admin');
                window.location.hash = '#/admin';
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentView === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Admin
            </button>
          </nav>

          {/* Quick Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex-1 max-w-md hidden sm:block relative"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (currentView !== 'search') setCurrentView('search');
                }}
                placeholder="Search apps, APKs, categories..."
                className="w-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm pl-9 pr-4 py-2 rounded-full border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-all"
              />
            </div>
          </form>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2">
            
            {/* Supabase Status Pill */}
            <div 
              title={isSupabaseConnected ? "Connected to live Supabase backend" : "Local / Offline mode (Connect in Admin Settings)"}
              onClick={() => {
                setCurrentView('admin');
                window.location.hash = '#/admin';
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer border transition-colors bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-zinc-600 dark:text-zinc-300">
                {isSupabaseConnected ? 'Supabase DB' : 'Config Supabase'}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  id="user-profile-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/20">
                    {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-700/60">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                        {profile?.display_name || user.email}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          isAdmin ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                        }`}>
                          {isAdmin ? 'Store Admin' : 'Standard User'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      My Profile & Downloads
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentView('admin');
                        window.location.hash = '#/admin';
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Admin Control Panel
                    </button>

                    <button
                      onClick={() => {
                        toggleAdminDevRole();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[11px] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-700/50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Switch Role ({isAdmin ? 'to User' : 'to Admin'})
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('signin')}
                  className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Sign In</span>
                </button>
                <button
                  id="header-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm shadow-emerald-600/20 active:scale-95"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
