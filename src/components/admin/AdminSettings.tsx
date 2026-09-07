import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  Check, 
  Copy, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { 
  getSupabaseConfig, 
  testSupabaseConnection, 
  resetSupabaseClient, 
  getSupabase,
  normalizeSupabaseUrl,
  normalizeAnonKey
} from '../../lib/supabase';
import { SUPABASE_SQL_SCHEMA } from '../../lib/sqlSchema';

export const AdminSettings: React.FC = () => {
  const { isSupabaseConnected, checkSupabaseConnection, refreshApps } = useAppStore();
  const config = getSupabaseConfig();

  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const normalizedPreview = url.trim() ? normalizeSupabaseUrl(url) : '';
  const hasPathWarning = url.trim().length > 0 && (
    url.includes('/rest/v1') || 
    url.includes('/dashboard/') || 
    url.endsWith('/') || 
    url.includes('"')
  );

  const handleSaveConfig = () => {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = normalizeAnonKey(anonKey);
    setUrl(cleanUrl);
    setAnonKey(cleanKey);
    localStorage.setItem('gplay_supabase_url', cleanUrl);
    localStorage.setItem('gplay_supabase_anon_key', cleanKey);
    resetSupabaseClient();
    checkSupabaseConnection();
    refreshApps();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      await checkSupabaseConnection();
    } catch (e: any) {
      setTestResult({ success: false, message: e?.message || 'Failed test' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Synchronize catalog with Supabase database
  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await checkSupabaseConnection();
      await refreshApps();
      setSyncMessage('Catalog successfully synchronized with Supabase.');
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (err: any) {
      setSyncMessage(`Sync error: ${err?.message || 'Failed to sync with Supabase'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Supabase Backend & Storage Setup
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Configure credentials, run database diagnostics, and inspect Row Level Security rules
        </p>
      </div>

      {/* Connection Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        isSupabaseConnected
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isSupabaseConnected ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">
              Status: {isSupabaseConnected ? 'Connected to Supabase' : 'Offline / Preview Mode'}
            </h4>
            <p className="text-xs opacity-80">
              {isSupabaseConnected 
                ? 'Your app is actively reading and writing to real Supabase tables and storage buckets.'
                : 'Running in safe interactive mode. Provide your Supabase URL and Anon Key below to link your live project.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
          testResult.success
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Credentials Configuration Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-500" />
          Supabase Project Credentials
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {hasPathWarning && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                Auto-cleaning URL to base origin: <span className="font-mono">{normalizedPreview}</span>
              </p>
            )}
            <p className="text-[11px] text-zinc-400 mt-1">
              Must be your root project URL (e.g. <span className="font-mono">https://xyz.supabase.co</span>). Do not append <span className="font-mono">/rest/v1</span> or trailing slashes to prevent "Invalid path specified in request URL" errors.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Anon Public API Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <button
                type="button"
                onClick={() => setShowAnonKey(!showAnonKey)}
                className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
              >
                {showAnonKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showAnonKey ? 'Hide key' : 'Show key'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showAnonKey ? "text" : "password"}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Found in: <span className="font-semibold">Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API Keys &rarr; "anon" "public"</span>. Never use your <code className="text-rose-500 font-semibold">service_role</code> secret in client code.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Credentials
          </button>

          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved successfully
            </span>
          )}
        </div>
      </div>

      {/* Catalog Synchronization */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-500" />
              Live Catalog & Database Synchronization
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Force refresh the local store state and synchronize with live Supabase database tables
            </p>
          </div>

          <button
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-sm disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Database'}</span>
          </button>
        </div>

        {syncMessage && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300">
            {syncMessage}
          </div>
        )}
      </div>

      {/* Complete SQL Schema Viewer with Copy Button */}
      <div className="p-6 rounded-3xl bg-zinc-900 text-zinc-200 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Supabase SQL Schema & Policies (1-Click Copy)
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Run this in your Supabase Dashboard: SQL Editor &rarr; New query &rarr; Run
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy SQL
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-2xl bg-black/60 font-mono text-[11px] max-h-80 overflow-y-auto text-emerald-400/90 leading-relaxed scrollbar-thin">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </div>

    </div>
  );
};
