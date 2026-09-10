import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useAppStore } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { DownloadModal } from './components/store/DownloadModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { SchemaSetupBanner } from './components/common/SchemaSetupBanner';
import { SqlSchemaModal } from './components/common/SqlSchemaModal';
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

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Hash based URL routing synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash || hash === '') {
        setCurrentView('home');
      } else if (hash === 'search') {
        setCurrentView('search');
      } else if (hash === 'categories') {
        setCurrentView('categories');
      } else if (hash.startsWith('app/')) {
        const slug = hash.replace('app/', '');
        navigateToApp(slug);
      } else if (hash.startsWith('admin')) {
        setCurrentView('admin');
      } else if (hash === 'downloads') {
        setCurrentView('downloads');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentView, navigateToApp]);

  // Sync state back to hash when currentView changes
  useEffect(() => {
    if (currentView === 'home' && window.location.hash !== '' && window.location.hash !== '#/') {
      window.location.hash = '#/';
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
      
      {/* Top Navigation Bar */}
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileOpen(true)}
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
