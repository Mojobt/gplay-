import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppItem, AppCategory, AppReview, AdminStats, LocalDownloadedApp } from '../types';
import { INITIAL_APPS, INITIAL_REVIEWS } from '../lib/initialData';
import { 
  getSupabase, 
  getSupabaseConfig, 
  downloadApkFile, 
  BUCKET_APKS, 
  isUUID, 
  generateUUID,
  isRlsPolicyError,
  ApkDownloadPayload
} from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  apps: AppItem[];
  isLoadingApps: boolean;
  selectedCategory: AppCategory | 'All';
  setSelectedCategory: (cat: AppCategory | 'All') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentView: 'home' | 'categories' | 'search' | 'app-details' | 'admin' | 'downloads';
  setCurrentView: (view: 'home' | 'categories' | 'search' | 'app-details' | 'admin' | 'downloads') => void;
  currentSlug: string | null;
  setCurrentSlug: (slug: string | null) => void;
  adminTab: 'dashboard' | 'apps' | 'add-app' | 'upload-apk' | 'reviews' | 'storage' | 'settings';
  setAdminTab: (tab: 'dashboard' | 'apps' | 'add-app' | 'upload-apk' | 'reviews' | 'storage' | 'settings') => void;
  editingApp: AppItem | null;
  setEditingApp: (app: AppItem | null) => void;
  activeApp: AppItem | null;
  reviews: AppReview[];
  isLoadingReviews: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  isSupabaseConnected: boolean;
  checkSupabaseConnection: () => Promise<boolean>;
  stats: AdminStats;
  
  // Download states
  isDownloading: boolean;
  downloadProgress: number;
  downloadError: string | null;
  downloadSuccessApp: AppItem | null;
  setDownloadSuccessApp: (app: AppItem | null) => void;
  downloadActivePayload: ApkDownloadPayload | null;
  downloadedApps: LocalDownloadedApp[];
  clearDownloadedApps: () => void;
  triggerAppDownload: (app: AppItem) => Promise<void>;
  
  // Reviews
  submitReview: (appId: string, rating: number, comment: string) => Promise<{ success: boolean; error?: string }>;
  deleteReview: (reviewId: string) => Promise<void>;

  // Admin App Operations
  saveApp: (appData: Partial<AppItem>, isEditing?: boolean) => Promise<{ success: boolean; error?: string; app?: AppItem; isRlsError?: boolean }>;
  deleteApp: (appId: string) => Promise<{ success: boolean; error?: string }>;
  togglePublishApp: (appId: string) => Promise<void>;
  toggleFeatureApp: (appId: string) => Promise<void>;
  refreshApps: () => Promise<void>;
  syncFromSupabase: () => Promise<void>;
  navigateToApp: (slug: string) => void;

  // Schema Diagnostic & RLS
  isSchemaMissing: boolean;
  isRlsBlocked: boolean;
  setIsRlsBlocked: (blocked: boolean) => void;
  schemaModalOpen: boolean;
  setSchemaModalOpen: (open: boolean) => void;
  schemaModalTab: 'schema' | 'rls';
  setSchemaModalTab: (tab: 'schema' | 'rls') => void;
  openSchemaModal: (tab?: 'schema' | 'rls') => void;
  dismissSchemaBanner: boolean;
  setDismissSchemaBanner: (dismiss: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, setLoginRequiredModal } = useAuth();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'categories' | 'search' | 'app-details' | 'admin'>('home');
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'dashboard' | 'apps' | 'add-app' | 'upload-apk' | 'reviews' | 'storage' | 'settings'>('dashboard');
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [reviews, setReviews] = useState<AppReview[]>(INITIAL_REVIEWS);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSchemaMissing, setIsSchemaMissing] = useState(false);
  const [isRlsBlocked, setIsRlsBlocked] = useState(false);
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);
  const [schemaModalTab, setSchemaModalTab] = useState<'schema' | 'rls'>('rls');
  const [dismissSchemaBanner, setDismissSchemaBanner] = useState(false);

  const openSchemaModal = (tab: 'schema' | 'rls' = 'rls') => {
    setSchemaModalTab(tab);
    setSchemaModalOpen(true);
  };

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gplay_theme');
      return saved ? saved === 'dark' : false;
    }
    return false;
  });

  // Download states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccessApp, setDownloadSuccessApp] = useState<AppItem | null>(null);
  const [downloadActivePayload, setDownloadActivePayload] = useState<ApkDownloadPayload | null>(null);
  const [downloadedApps, setDownloadedApps] = useState<LocalDownloadedApp[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gplay_downloaded_apps');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const clearDownloadedApps = useCallback(() => {
    localStorage.removeItem('gplay_downloaded_apps');
    setDownloadedApps([]);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('gplay_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle URL hash changes for deep linking (e.g. #/app/motoride-rider, #/admin)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/app/')) {
        const slug = hash.replace('#/app/', '').trim();
        if (slug) {
          setCurrentSlug(slug);
          setCurrentView('app-details');
        }
      } else if (hash.startsWith('#/admin')) {
        setCurrentView('admin');
      } else if (hash.startsWith('#/categories')) {
        setCurrentView('categories');
      } else if (hash.startsWith('#/search')) {
        setCurrentView('search');
      } else if (hash.startsWith('#/downloads')) {
        setCurrentView('downloads');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToApp = (slug: string) => {
    setCurrentSlug(slug);
    setCurrentView('app-details');
    window.location.hash = `#/app/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to detect if an error is due to missing tables in Supabase schema
  const isTableMissingError = (error: any): boolean => {
    if (!error) return false;
    const msg = (error.message || '').toLowerCase();
    const code = error.code || '';
    return (
      code === 'PGRST205' ||
      code === '42P01' ||
      msg.includes("could not find the table 'public.apps'") ||
      msg.includes("table 'public.apps' in the schema cache") ||
      msg.includes('schema cache') ||
      msg.includes('relation "apps" does not exist') ||
      msg.includes('relation "public.apps" does not exist')
    );
  };

  // Check connection
  const checkSupabaseConnection = useCallback(async (): Promise<boolean> => {
    const { isConfigured } = getSupabaseConfig();
    const client = getSupabase();
    if (!isConfigured || !client) {
      setIsSupabaseConnected(false);
      setIsSchemaMissing(false);
      return false;
    }

    try {
      const { error } = await client.from('apps').select('id').limit(1);
      if (error) {
        if (isTableMissingError(error)) {
          setIsSchemaMissing(true);
        } else {
          setIsSchemaMissing(false);
        }
        setIsSupabaseConnected(false);
        return false;
      }
      setIsSchemaMissing(false);
      setIsSupabaseConnected(true);
      return true;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        setIsSchemaMissing(true);
      }
      setIsSupabaseConnected(false);
      return false;
    }
  }, []);

  // Fetch apps from Supabase or fallback
  const fetchApps = useCallback(async () => {
    setIsAppsLoading(true);
    const client = getSupabase();

    if (client) {
      try {
        const { data, error } = await client
          .from('apps')
          .select(`
            *,
            app_screenshots (
              image_url,
              display_order
            )
          `)
          .order('download_count', { ascending: false });

        if (error) {
          if (isTableMissingError(error)) {
            setIsSchemaMissing(true);
          }
          console.warn('Could not fetch from Supabase apps table:', error.message);
        } else if (data) {
          setIsSchemaMissing(false);
          setIsSupabaseConnected(true);
          const mappedApps: AppItem[] = data.map((item: any) => ({
            ...item,
            rating: Number(item.rating) || 0,
            review_count: Number(item.review_count) || 0,
            download_count: Number(item.download_count) || 0,
            permissions: Array.isArray(item.permissions) ? item.permissions : [],
            screenshots: item.app_screenshots
              ? item.app_screenshots.sort((a: any, b: any) => a.display_order - b.display_order).map((s: any) => s.image_url)
              : [],
          }));
          setApps(mappedApps);
          setIsLoadingApps(false);
          return;
        }
      } catch (e: any) {
        if (isTableMissingError(e)) {
          setIsSchemaMissing(true);
        }
        console.warn('Could not fetch from Supabase apps table:', e);
      }
    }

    // Fallback: load INITIAL_APPS and merge with any locally added/edited apps
    const stored = localStorage.getItem('gplay_local_apps');
    let localCustomApps: AppItem[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localCustomApps = parsed.map(a => (!isUUID(a.id) ? { ...a, id: generateUUID() } : a));
        }
      } catch {}
    }

    // Combine local custom apps and INITIAL_APPS ensuring no duplicate IDs or slugs
    const combinedMap = new Map<string, AppItem>();
    INITIAL_APPS.forEach(app => combinedMap.set(app.id, app));
    localCustomApps.forEach(app => combinedMap.set(app.id, app));
    const finalApps = Array.from(combinedMap.values());

    setApps(finalApps);
    setIsLoadingApps(false);
  }, []);

  const setIsAppsLoading = (val: boolean) => setIsLoadingApps(val);

  // Initialize
  useEffect(() => {
    checkSupabaseConnection();
    fetchApps();
  }, [checkSupabaseConnection, fetchApps]);

  // Active app selection
  const activeApp = React.useMemo(() => {
    if (!currentSlug) return apps[0] || null;
    return apps.find(a => a.slug === currentSlug) || apps[0] || null;
  }, [apps, currentSlug]);

  // Fetch reviews for active app
  useEffect(() => {
    if (!activeApp) {
      setReviews([]);
      setIsLoadingReviews(false);
      return;
    }

    const fetchReviewsForApp = async () => {
      setIsLoadingReviews(true);
      const client = getSupabase();

      if (client && isUUID(activeApp.id)) {
        try {
          const { data, error } = await client
            .from('app_reviews')
            .select('*')
            .eq('app_id', activeApp.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setReviews(data);
            setIsLoadingReviews(false);
            return;
          }
        } catch (err) {
          console.warn('Failed to load reviews from Supabase:', err);
        }
      }

      // Filter local reviews, purging mock reviews
      const stored = localStorage.getItem(`gplay_reviews_${activeApp.id}`);
      if (stored) {
        try {
          const parsed: AppReview[] = JSON.parse(stored);
          const cleanReviews = Array.isArray(parsed) ? parsed.filter(r => !r.id.startsWith('r-00')) : [];
          setReviews(cleanReviews);
        } catch {
          setReviews([]);
        }
      } else {
        setReviews([]);
      }
      setIsLoadingReviews(false);
    };

    fetchReviewsForApp();
  }, [activeApp]);

  // APK Download action
  const triggerAppDownload = async (app: AppItem) => {
    setDownloadError(null);

    // Check if login is required
    if (app.login_required && !user) {
      setLoginRequiredModal(true);
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(20);

    try {
      // Direct APK resolution and browser download dispatch
      const payload = await downloadApkFile(app);
      setDownloadProgress(75);
      setDownloadActivePayload(payload);
      setDownloadSuccessApp(app);

      // Record in local downloaded apps history
      const newDownloaded: LocalDownloadedApp = {
        id: generateUUID(),
        app_id: app.id,
        name: app.name,
        slug: app.slug,
        developer_name: app.developer_name,
        package_name: app.package_name,
        icon_url: app.icon_url,
        version_name: app.version_name,
        apk_size: app.apk_size,
        downloaded_at: new Date().toISOString(),
        filename: payload.filename,
        direct_url: payload.directPublicUrl || payload.url,
        category: app.category,
      };

      setDownloadedApps(prev => {
        const filtered = prev.filter(d => d.app_id !== app.id);
        const updated = [newDownloaded, ...filtered];
        try {
          localStorage.setItem('gplay_downloaded_apps', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Increment download counter safely in Supabase
      const client = getSupabase();
      if (client && isUUID(app.id)) {
        try {
          const { error: rpcError } = await client.rpc('increment_app_download', { app_id_param: app.id });
          if (rpcError) {
            // If RPC function is missing (which returns PGRST125 Invalid path), fallback to direct column update
            await client
              .from('apps')
              .update({ download_count: app.download_count + 1 })
              .eq('id', app.id);
          }
        } catch {
          // Fallback to direct update
          try {
            await client
              .from('apps')
              .update({ download_count: app.download_count + 1 })
              .eq('id', app.id);
          } catch {}
        }
      }

      // Update local state count
      setApps(prev =>
        prev.map(a => (a.id === app.id ? { ...a, download_count: a.download_count + 1 } : a))
      );

      setDownloadProgress(100);
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err?.message || 'Download failed. Please check network connection or APK storage path.');
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 500);
    }
  };

  // Submit Review
  const submitReview = async (
    appId: string,
    rating: number,
    comment: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Please log in to submit a rating and review.' };
    }

    const userName = profile?.display_name || user.email?.split('@')[0] || 'Anonymous';
    const newReview: AppReview = {
      id: generateUUID(),
      app_id: appId,
      user_id: user.id,
      user_name: userName,
      user_avatar: profile?.avatar_url,
      rating,
      comment,
      created_at: new Date().toISOString(),
    };

    const client = getSupabase();
    if (client && isUUID(appId) && isUUID(user.id)) {
      try {
        const { data, error } = await client.from('app_reviews').insert({
          app_id: appId,
          user_id: user.id,
          user_name: userName,
          rating,
          comment,
        }).select().maybeSingle();

        if (error) {
          return { success: false, error: error.message };
        }
        if (data?.id) {
          newReview.id = data.id;
        }
      } catch (e: any) {
        return { success: false, error: e?.message || 'Failed to submit review' };
      }
    }

    // Update reviews state
    setReviews(prev => [newReview, ...prev]);

    // Recalculate rating on app
    setApps(prev =>
      prev.map(a => {
        if (a.id === appId) {
          const currentCount = a.review_count;
          const newCount = currentCount + 1;
          const newAvg = Number(((a.rating * currentCount + rating) / newCount).toFixed(1));
          return {
            ...a,
            rating: newAvg,
            review_count: newCount,
          };
        }
        return a;
      })
    );

    return { success: true };
  };

  // Delete review
  const deleteReview = async (reviewId: string) => {
    const client = getSupabase();
    if (client && isUUID(reviewId)) {
      try {
        await client.from('app_reviews').delete().eq('id', reviewId);
      } catch (e) {
        console.error('Delete review error', e);
      }
    }
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  // Admin App Save (Create or Update)
  const saveApp = async (
    appData: Partial<AppItem>,
    isEditing: boolean = false
  ): Promise<{ success: boolean; error?: string; app?: AppItem; isRlsError?: boolean }> => {
    const client = getSupabase();
    const timestamp = new Date().toISOString();

    const preparedSlug = (appData.slug || appData.name || 'new-app')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const hasValidUuid = isUUID(appData.id);
    const assignedId = hasValidUuid ? (appData.id as string) : generateUUID();

    const newOrUpdatedApp: AppItem = {
      id: assignedId,
      name: appData.name || 'Untitled App',
      slug: preparedSlug,
      developer_name: appData.developer_name || 'Independent Developer',
      package_name: appData.package_name || `com.app.${preparedSlug}`,
      description: appData.description || 'No description provided.',
      whats_new: appData.whats_new || 'Initial release.',
      category: appData.category || 'Other',
      version_name: appData.version_name || '1.0.0',
      version_code: Number(appData.version_code) || 1,
      minimum_android_version: appData.minimum_android_version || 'Android 8.0 (API 26)',
      apk_storage_path: appData.apk_storage_path || '',
      apk_url: appData.apk_url || '',
      icon_storage_path: appData.icon_storage_path || '',
      icon_url: appData.icon_url || '',
      apk_size: appData.apk_size || '0 MB',
      download_count: appData.download_count ?? 0,
      rating: appData.rating ?? 0,
      review_count: appData.review_count ?? 0,
      is_published: appData.is_published ?? true,
      is_featured: appData.is_featured ?? false,
      login_required: appData.login_required ?? false,
      permissions: appData.permissions || ['INTERNET'],
      created_at: appData.created_at || timestamp,
      updated_at: timestamp,
      screenshots: appData.screenshots || [],
    };

    if (client) {
      try {
        const { screenshots, ...dbFields } = newOrUpdatedApp;
        
        let existingSupabaseId: string | null = null;
        if (isEditing && hasValidUuid) {
          existingSupabaseId = appData.id as string;
        } else if (isEditing) {
          // If the app was previously saved with a non-UUID ID, check if it exists in Supabase by package_name or slug
          try {
            const { data: matched } = await client
              .from('apps')
              .select('id')
              .or(`package_name.eq.${newOrUpdatedApp.package_name},slug.eq.${newOrUpdatedApp.slug}`)
              .maybeSingle();
            if (matched?.id && isUUID(matched.id)) {
              existingSupabaseId = matched.id;
              newOrUpdatedApp.id = matched.id;
            }
          } catch {
            // ignore lookup error
          }
        }

        if (existingSupabaseId) {
          const { id, created_at, ...updateFields } = dbFields;
          const { error } = await client
            .from('apps')
            .update({
              ...updateFields,
              updated_at: timestamp,
            })
            .eq('id', existingSupabaseId);

          if (error) {
            if (isTableMissingError(error)) {
              setIsSchemaMissing(true);
              return { 
                success: false, 
                error: 'Cannot save: The "public.apps" table does not exist in your Supabase project yet. Please execute the SQL schema in your Supabase SQL Editor.' 
              };
            }
            if (isRlsPolicyError(error)) {
              setIsRlsBlocked(true);
              return {
                success: false,
                error: 'new row violates row-level security policy for table "apps"',
                isRlsError: true,
              };
            }
            return { success: false, error: error.message };
          }
        } else {
          // New app insertion with genuine UUID
          const insertPayload: any = {
            ...dbFields,
            id: assignedId,
          };

          const { data, error } = await client
            .from('apps')
            .insert([insertPayload])
            .select()
            .single();

          if (error) {
            if (isTableMissingError(error)) {
              setIsSchemaMissing(true);
              return { 
                success: false, 
                error: 'Cannot save: The "public.apps" table does not exist in your Supabase project yet. Please execute the SQL schema in your Supabase SQL Editor.' 
              };
            }
            if (isRlsPolicyError(error)) {
              setIsRlsBlocked(true);
              return {
                success: false,
                error: 'new row violates row-level security policy for table "apps"',
                isRlsError: true,
              };
            }
            return { success: false, error: error.message };
          }
          if (data?.id) newOrUpdatedApp.id = data.id;
        }

        // Handle screenshots if provided
        if (newOrUpdatedApp.screenshots && newOrUpdatedApp.screenshots.length > 0 && isUUID(newOrUpdatedApp.id)) {
          await client.from('app_screenshots').delete().eq('app_id', newOrUpdatedApp.id);
          const screenshotRecords = newOrUpdatedApp.screenshots.map((url, idx) => ({
            app_id: newOrUpdatedApp.id,
            image_url: url,
            display_order: idx,
          }));
          const { error: screenshotErr } = await client.from('app_screenshots').insert(screenshotRecords);
          if (screenshotErr && isRlsPolicyError(screenshotErr)) {
            setIsRlsBlocked(true);
            return {
              success: false,
              error: 'Screenshots could not be saved: violates row-level security policy for table "app_screenshots"',
              isRlsError: true,
            };
          }
        }
      } catch (err: any) {
        if (isRlsPolicyError(err)) {
          setIsRlsBlocked(true);
          return {
            success: false,
            error: 'new row violates row-level security policy for table "apps"',
            isRlsError: true,
          };
        }
        return { success: false, error: err?.message || 'Database transaction error' };
      }
    }

    // Update local state
    const oldId = appData.id;
    setApps(prev => {
      let nextList: AppItem[];
      if (isEditing) {
        nextList = prev.map(a => (a.id === newOrUpdatedApp.id || (oldId && a.id === oldId) ? newOrUpdatedApp : a));
      } else {
        nextList = [newOrUpdatedApp, ...prev.filter(a => a.id !== newOrUpdatedApp.id && (!oldId || a.id !== oldId))];
      }
      localStorage.setItem('gplay_local_apps', JSON.stringify(nextList));
      return nextList;
    });

    return { success: true, app: newOrUpdatedApp };
  };

  // Delete App
  const deleteApp = async (appId: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabase();
    if (client && isUUID(appId)) {
      try {
        const { error } = await client.from('apps').delete().eq('id', appId);
        if (error) {
          if (isRlsPolicyError(error)) {
            setIsRlsBlocked(true);
          }
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        if (isRlsPolicyError(err)) {
          setIsRlsBlocked(true);
        }
        return { success: false, error: err?.message || 'Failed to delete' };
      }
    }

    setApps(prev => {
      const filtered = prev.filter(a => a.id !== appId);
      localStorage.setItem('gplay_local_apps', JSON.stringify(filtered));
      return filtered;
    });
    return { success: true };
  };

  // Toggle Publish
  const togglePublishApp = async (appId: string) => {
    const target = apps.find(a => a.id === appId);
    if (!target) return;
    const newStatus = !target.is_published;

    const client = getSupabase();
    if (client && isUUID(appId)) {
      try {
        await client.from('apps').update({ is_published: newStatus }).eq('id', appId);
      } catch (e) {
        console.error('Publish status update failed in Supabase', e);
      }
    }

    setApps(prev =>
      prev.map(a => (a.id === appId ? { ...a, is_published: newStatus } : a))
    );
  };

  // Toggle Featured
  const toggleFeatureApp = async (appId: string) => {
    const target = apps.find(a => a.id === appId);
    if (!target) return;
    const newStatus = !target.is_featured;

    const client = getSupabase();
    if (client && isUUID(appId)) {
      try {
        await client.from('apps').update({ is_featured: newStatus }).eq('id', appId);
      } catch (e) {
        console.error('Feature status update failed in Supabase', e);
      }
    }

    setApps(prev =>
      prev.map(a => (a.id === appId ? { ...a, is_featured: newStatus } : a))
    );
  };

  // Admin statistics calculated in real-time
  const stats: AdminStats = React.useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalApps = apps.length;
    const publishedApps = apps.filter(a => a.is_published).length;
    const totalDownloads = apps.reduce((sum, a) => sum + (a.download_count || 0), 0);
    const appsAddedThisMonth = apps.filter(a => {
      const d = new Date(a.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    return {
      totalApps,
      publishedApps,
      totalDownloads,
      totalUsers: profile ? 1 : 0,
      appsAddedThisMonth,
    };
  }, [apps, profile]);

  return (
    <AppContext.Provider
      value={{
        apps,
        isLoadingApps,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        currentView,
        setCurrentView,
        currentSlug,
        setCurrentSlug,
        adminTab,
        setAdminTab,
        editingApp,
        setEditingApp,
        activeApp,
        reviews,
        isLoadingReviews,
        isDark,
        toggleTheme,
        isSupabaseConnected,
        checkSupabaseConnection,
        isSchemaMissing,
        isRlsBlocked,
        setIsRlsBlocked,
        schemaModalOpen,
        setSchemaModalOpen,
        schemaModalTab,
        setSchemaModalTab,
        openSchemaModal,
        dismissSchemaBanner,
        setDismissSchemaBanner,
        stats,
        isDownloading,
        downloadProgress,
        downloadError,
        downloadSuccessApp,
        setDownloadSuccessApp,
        downloadActivePayload,
        downloadedApps,
        clearDownloadedApps,
        triggerAppDownload,
        submitReview,
        deleteReview,
        saveApp,
        deleteApp,
        togglePublishApp,
        toggleFeatureApp,
        refreshApps: fetchApps,
        syncFromSupabase: async () => {
          await checkSupabaseConnection();
          await fetchApps();
        },
        navigateToApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return ctx;
};
