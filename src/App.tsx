import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useAppStore } from './context/AppContext';
import { parseAppUrl } from './lib/routing';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { DownloadModal } from './components/store/DownloadModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { SchemaSetupBanner } from './components/common/SchemaSetupBanner';
import { SqlSchemaModal } from './components/common/SqlSchemaModal';
import { InstallAppModal } from './components/store/InstallAppModal';
import { InstallBanner } from './components/store/InstallBanner';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AppDetailsPage } from './pages/AppDetailsPage';
import { AdminPage } from './pages/AdminPage';
import { DownloadsPage } from './pages/DownloadsPage';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, navigateToApp, activeDownloadApp, isSupabaseConnected } = useAppStore();
  const { loginRequiredModal } = useAuth();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Listen for native browser PWA beforeinstallprompt (Chrome Android and Desktop)
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // URL routing synchronization (supports pathnames, hashes, and query params)
  useEffect(() => {
    const handleUrlSync = () => {
      const route = parseAppUrl();
      if (route.view === 'app-details' && route.slug) {
        navigateToApp(route.slug);
      } else if (route.view !== 'app-details') {
        setCurrentView(route.view);
      }
    };

    // Initial check on mount
    handleUrlSync();

    window.addEventListener('hashchange', handleUrlSync);
    window.addEventListener('popstate', handleUrlSync);
    return () => {
      window.removeEventListener('hashchange', handleUrlSync);
      window.removeEventListener('popstate', handleUrlSync);
    };
  }, [setCurrentView, navigateToApp]);

  // Sync state back to hash when currentView changes
  useEffect(() => {
    if (currentView === 'home') {
      const p = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (p === '' && window.location.hash !== '' && window.location.hash !== '#/') {
        window.location.hash = '#/';
      }
    } else if (currentView === 'search' && window.location.hash !== '#/search') {
      window.location.hash = '#/search';
    } else if (currentView === 'categories' && window.location.hash !== '#/categories') {
      window.location.hash = '#/categories';
    } else if (currentView === 'admin' && !window.location.hash.startsWith('#/admin')) {
      window.location.hash = '#/admin';
    } else if (currentView === 'downloads' && window.location.hash !== '#/downloads') {
      window.location.hash = '#/downloads';
    }
  }, [currentView]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-emerald-500 selection:text-white">
      
      {/* Mobile Prominent Install / Download App Banner */}
      <InstallBanner onOpenInstallModal={() => setIsInstallModalOpen(true)} />

      {/* Top Navigation Bar */}
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Database Schema Setup Alert Banner (if table public.apps is missing) */}
      <SchemaSetupBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'home' && <HomePage />}
        {currentView === 'search' && <SearchPage />}
        {currentView === 'categories' && <CategoriesPage />}
        {currentView === 'downloads' && <DownloadsPage />}
        {currentView === 'app-details' && (
          <AppDetailsPage onOpenAuth={handleOpenAuth} />
        )}
        {currentView === 'admin' && (
          <AdminPage onOpenAuth={handleOpenAuth} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav 
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Gplay Store App Install & APK Download Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallPrompted={() => setDeferredPrompt(null)}
      />

      {/* Download Flow Modal */}
      <DownloadModal />

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthOpen || loginRequiredModal}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Supabase SQL Schema Viewer / Setup Modal */}
      <SqlSchemaModal />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
