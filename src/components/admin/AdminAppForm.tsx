import React, { useState } from 'react';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  FileCheck, 
  AlertCircle, 
  Plus, 
  X, 
  Sparkles,
  Smartphone,
  ShieldCheck,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { AppItem, AppCategory } from '../../types';
import { AVAILABLE_PERMISSIONS } from '../../lib/initialData';
import { useAppStore } from '../../context/AppContext';
import { uploadFileToStorage, BUCKET_APKS, BUCKET_ICONS, BUCKET_SCREENSHOTS, getSupabaseSqlEditorUrl } from '../../lib/supabase';
import { SUPABASE_RLS_FIX_SQL } from '../../lib/sqlSchema';

export const AdminAppForm: React.FC = () => {
  const { editingApp, setEditingApp, setAdminTab, saveApp, isSupabaseConnected, openSchemaModal } = useAppStore();
  const isEditing = Boolean(editingApp);
  const [copiedRls, setCopiedRls] = useState(false);

  // Form State
  const [name, setName] = useState(editingApp?.name || '');
  const [developerName, setDeveloperName] = useState(editingApp?.developer_name || '');
  const [packageName, setPackageName] = useState(editingApp?.package_name || '');
  const [slug, setSlug] = useState(editingApp?.slug || '');
  const [category, setCategory] = useState<AppCategory>(editingApp?.category || 'Transportation');
  const [versionName, setVersionName] = useState(editingApp?.version_name || '1.0.0');
  const [versionCode, setVersionCode] = useState(editingApp?.version_code || 1);
  const [minimumAndroidVersion, setMinimumAndroidVersion] = useState(editingApp?.minimum_android_version || 'Android 8.0 (API 26)');
  const [description, setDescription] = useState(editingApp?.description || '');
  const [whatsNew, setWhatsNew] = useState(editingApp?.whats_new || '');
  const [apkSize, setApkSize] = useState(editingApp?.apk_size || '');
  const [apkStoragePath, setApkStoragePath] = useState(editingApp?.apk_storage_path || '');
  const [iconUrl, setIconUrl] = useState(editingApp?.icon_url || '');
  const [isPublished, setIsPublished] = useState(editingApp ? editingApp.is_published : true);
  const [isFeatured, setIsFeatured] = useState(editingApp ? editingApp.is_featured : false);
  const [loginRequired, setLoginRequired] = useState(editingApp ? editingApp.login_required : false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    editingApp?.permissions || ['INTERNET', 'ACCESS_NETWORK_STATE']
  );
  const [screenshots, setScreenshots] = useState<string[]>(
    editingApp?.screenshots || []
  );
  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');

  // Upload States
  const [isUploadingApk, setIsUploadingApk] = useState(false);
  const [apkUploadProgress, setApkUploadProgress] = useState(0);
  const [apkUploadStatus, setApkUploadStatus] = useState<string | null>(null);

  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Auto generate slug and package name if adding new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setSlug(generatedSlug);
      if (!packageName) {
        setPackageName(`com.gplay.${generatedSlug.replace(/-/g, '.')}`);
      }
    }
  };

  // Toggle permission
  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  // Handle APK File Selection
  const handleApkFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate that the uploaded file is an APK
    if (!file.name.toLowerCase().endsWith('.apk')) {
      setApkUploadStatus('Validation Error: Selected file must have a .apk extension.');
      return;
    }

    // Auto set size from file
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setApkSize(sizeInMb);

    const safeFilename = `${slug || 'app'}-v${versionName}-${Date.now()}.apk`;
    setIsUploadingApk(true);
    setApkUploadProgress(10);
    setApkUploadStatus('Uploading APK to Supabase Storage bucket "app-apks"...');

    try {
      if (isSupabaseConnected) {
        const res = await uploadFileToStorage(
          BUCKET_APKS,
          safeFilename,
          file,
          (pct) => setApkUploadProgress(pct)
        );
        setApkStoragePath(res.storagePath);
        setApkUploadStatus(`Successfully uploaded: ${safeFilename}`);
      } else {
        // Simulated progress for preview mode
        await new Promise(r => setTimeout(r, 600));
        setApkUploadProgress(50);
        await new Promise(r => setTimeout(r, 600));
        setApkUploadProgress(100);
        setApkStoragePath(`simulated-storage/${safeFilename}`);
        setApkUploadStatus(`Validated APK: ${file.name} (${sizeInMb}) ready to link.`);
      }
    } catch (err: any) {
      setApkUploadStatus(`Upload Error: ${err?.message || 'Storage error'}`);
    } finally {
      setIsUploadingApk(false);
    }
  };

  // Handle Icon File Selection
  const handleIconFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingIcon(true);
    try {
      if (isSupabaseConnected) {
        const iconPath = `icon-${slug || 'app'}-${Date.now()}.${file.name.split('.').pop()}`;
        const res = await uploadFileToStorage(BUCKET_ICONS, iconPath, file);
        setIconUrl(res.publicUrl);
      } else {
        const localUrl = URL.createObjectURL(file);
        setIconUrl(localUrl);
      }
    } catch (err: any) {
      setFormError(`Icon upload failed: ${err?.message}`);
    } finally {
      setIsUploadingIcon(false);
    }
  };

  // Handle Screenshot File Selection
  const handleScreenshotFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (isSupabaseConnected) {
          const path = `shot-${slug || 'app'}-${Date.now()}-${i}.${file.name.split('.').pop()}`;
          const res = await uploadFileToStorage(BUCKET_SCREENSHOTS, path, file);
          newUrls.push(res.publicUrl);
        } else {
          newUrls.push(URL.createObjectURL(file));
        }
      }
      setScreenshots(prev => [...prev, ...newUrls]);
    } catch (err: any) {
      setFormError(`Screenshot upload error: ${err?.message}`);
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('App name is required');
      return;
    }
    if (!packageName.trim() || !packageName.includes('.')) {
      setFormError('Package name must be a valid Android package ID (e.g. com.company.app)');
      return;
    }

    const appPayload: Partial<AppItem> = {
      id: editingApp?.id,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      developer_name: developerName.trim() || 'Independent Developer',
      package_name: packageName.trim(),
      category,
      version_name: versionName.trim() || '1.0.0',
      version_code: Number(versionCode) || 1,
      minimum_android_version: minimumAndroidVersion,
      description: description.trim(),
      whats_new: whatsNew.trim(),
      apk_size: apkSize.trim() || '0 MB',
      apk_storage_path: apkStoragePath.trim(),
      icon_url: iconUrl.trim(),
      is_published: isPublished,
      is_featured: isFeatured,
      login_required: loginRequired,
      permissions: selectedPermissions,
      screenshots: screenshots,
    };

    const res = await saveApp(appPayload, isEditing);
    if (res.success) {
      setFormSuccess(true);
      setTimeout(() => {
        setEditingApp(null);
        setAdminTab('apps');
      }, 1000);
    } else {
      setFormError(res.error || 'Failed to save application');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setEditingApp(null);
            setAdminTab('apps');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Apps List
        </button>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {isEditing ? `Edit App: ${editingApp.name}` : 'Publish New Android App (APK)'}
        </h3>
      </div>

      {formError && (
        (() => {
          const isRls = formError.toLowerCase().includes('row-level security') || 
                        formError.toLowerCase().includes('rls') || 
                        formError.toLowerCase().includes('policy');

          if (isRls) {
            return (
              <div className="p-5 rounded-3xl bg-amber-50/95 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 shadow-md space-y-3.5 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-amber-950 dark:text-amber-100">
                        PostgreSQL Row-Level Security (RLS) Policy Error
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        table "apps"
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/90 dark:text-amber-200/90 mt-1 leading-relaxed">
                      Supabase blocked writing to the database because the table's Row-Level Security policy restricts insert/update operations: <code className="font-mono font-semibold bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-950 dark:text-amber-100">{formError}</code>.
                    </p>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">
                      You can resolve this immediately by running the 1-click RLS Quick Fix script in your Supabase SQL Editor.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1 pl-13">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
                      setCopiedRls(true);
                      setTimeout(() => setCopiedRls(false), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white transition-all shadow-sm"
                  >
                    {copiedRls ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedRls ? 'Fix SQL Copied to Clipboard!' : 'Copy Quick RLS Fix SQL'}</span>
                  </button>

                  <a
                    href={getSupabaseSqlEditorUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-500" />
                    <span>Open Supabase SQL Editor</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => openSchemaModal('rls')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>View SQL & Setup Guide</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          );
        })()
      )}

      {formSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Application successfully saved and synced to database! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Metadata */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            General Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                App Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Nova Browser"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Developer / Studio Name *
              </label>
              <input
                type="text"
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                placeholder="e.g. Apex Mobile Studios"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Android Package Name *
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="com.motoride.pilot.app"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                URL Slug (/app/:slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="motoride-pilot"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AppCategory)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Transportation">Transportation</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Games">Games</option>
                <option value="Travel">Travel</option>
                <option value="Productivity">Productivity</option>
                <option value="Social">Social</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Minimum Android OS
              </label>
              <input
                type="text"
                value={minimumAndroidVersion}
                onChange={(e) => setMinimumAndroidVersion(e.target.value)}
                placeholder="Android 8.0 (API 26)"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description & What's New */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Store Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what this application does, key features, target audience..."
              required
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              What's New in this Version
            </label>
            <textarea
              value={whatsNew}
              onChange={(e) => setWhatsNew(e.target.value)}
              rows={2}
              placeholder="• Bug fixes and speed enhancements..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* APK Binary Upload Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-500" />
              APK Binary & Storage File
            </h4>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Bucket: app-apks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Version Name
              </label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="1.0.0"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Version Code (Integer)
              </label>
              <input
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(Number(e.target.value))}
                placeholder="1"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Package Size
              </label>
              <input
                type="text"
                value={apkSize}
                onChange={(e) => setApkSize(e.target.value)}
                placeholder="25.4 MB"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-zinc-50 dark:bg-zinc-900/50 transition-colors text-center">
            <input
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              onChange={handleApkFileSelect}
              id="apk-file-picker"
              className="hidden"
            />
            <label htmlFor="apk-file-picker" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Click or drop Android APK file here
              </span>
              <span className="text-[11px] text-zinc-500">
                Only valid <code className="font-mono text-emerald-600">.apk</code> binaries accepted
              </span>
            </label>

            {/* Progress bar */}
            {isUploadingApk && (
              <div className="mt-4 max-w-xs mx-auto space-y-1">
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${apkUploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">{apkUploadProgress}% uploaded</p>
              </div>
            )}

            {apkUploadStatus && (
              <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {apkUploadStatus}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Current APK Storage Path
            </label>
            <input
              type="text"
              value={apkStoragePath}
              onChange={(e) => setApkStoragePath(e.target.value)}
              placeholder="e.g. apps/my-app-v1.0.0.apk"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Media: Icon & Screenshots */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            Visual Assets (Icon & Screenshots)
          </h4>

          {/* Icon */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt="App icon preview"
                className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
                <Smartphone className="w-7 h-7" />
              </div>
            )}
            <div className="flex-1 w-full space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Icon URL or Upload (Bucket: app-icons)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white"
                />
                <label className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer shrink-0">
                  <span>Browse...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Screenshots Gallery (Bucket: app-screenshots)
              </label>
              <label className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer">
                <span>+ Upload Screenshots</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {screenshots.length > 0 ? (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {screenshots.map((url, i) => (
                  <div key={i} className="relative w-24 h-40 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 group">
                    <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setScreenshots(screenshots.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 py-3 text-center border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
                No screenshots added yet. Upload images above to showcase your app.
              </p>
            )}
          </div>
        </div>

        {/* Permissions & Policies */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Android Permissions & Access
          </h4>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select Declared Android Permissions
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.id);
                return (
                  <button
                    type="button"
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    title={`${perm.name}: ${perm.description}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {perm.id}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Publish to Public Store
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded"
              />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Feature on Homepage Banner
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={loginRequired}
                onChange={(e) => setLoginRequired(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Require Login for APK Download
              </span>
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setEditingApp(null);
              setAdminTab('apps');
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" /> Save Application & Publish
          </button>
        </div>

      </form>

    </div>
  );
};
