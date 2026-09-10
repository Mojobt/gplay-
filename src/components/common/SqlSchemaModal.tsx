import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Terminal,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { SUPABASE_SQL_SCHEMA, SUPABASE_RLS_FIX_SQL } from '../../lib/sqlSchema';
import { getSupabaseSqlEditorUrl, testSupabaseConnection } from '../../lib/supabase';

export const SqlSchemaModal: React.FC = () => {
  const { 
    schemaModalOpen, 
    setSchemaModalOpen, 
    schemaModalTab, 
    setSchemaModalTab,
    setIsRlsBlocked,
    syncFromSupabase 
  } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!schemaModalOpen) return null;

  const currentTab = schemaModalTab || 'rls';
  const currentSql = currentTab === 'rls' ? SUPABASE_RLS_FIX_SQL : SUPABASE_SQL_SCHEMA;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await testSupabaseConnection();
      setVerifyStatus(res);
      if (res.success) {
        setIsRlsBlocked(false);
        await syncFromSupabase();
      }
    } catch (err: any) {
      setVerifyStatus({ success: false, message: err?.message || 'Verification test failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const sqlEditorUrl = getSupabaseSqlEditorUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schema-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              currentTab === 'rls'
                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              {currentTab === 'rls' ? <ShieldAlert className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="schema-modal-title" className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{currentTab === 'rls' ? 'Supabase Row-Level Security (RLS) Fix' : 'Supabase Database & Storage Setup'}</span>
                {currentTab === 'rls' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                    Fix Policy Violation
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentTab === 'rls' 
                  ? 'Resolve "new row violates row-level security policy for table apps"'
                  : 'Create the public.apps tables and storage buckets in your Supabase project'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSchemaModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
          <button
            onClick={() => {
              setSchemaModalTab('rls');
              setVerifyStatus(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              currentTab === 'rls'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick RLS Policy Fix</span>
            <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">1-Click</span>
          </button>

          <button
            onClick={() => {
              setSchemaModalTab('schema');
              setVerifyStatus(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              currentTab === 'schema'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Full Database & Storage Schema</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-zinc-600 dark:text-zinc-300">
          {/* Explanation Box */}
          {currentTab === 'rls' ? (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Why did the RLS error occur?
                  </p>
                  <p className="text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                    PostgreSQL reported: <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded text-amber-900 dark:text-amber-200 font-semibold">new row violates row-level security policy for table "apps"</code>.
                    This happens because your database table <code className="font-mono">apps</code> has Row-Level Security enabled with an admin-only restriction policy (<code className="font-mono">is_admin()</code>), blocking client inserts.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <p className="text-amber-900 dark:text-amber-200 font-bold mb-1">Quick 15-Second Resolution:</p>
                <ol className="list-decimal list-inside space-y-1 text-amber-900/90 dark:text-amber-200 font-medium pl-1">
                  <li>Click <strong className="text-amber-700 dark:text-amber-300">"Copy Quick RLS Fix SQL"</strong> below.</li>
                  <li>Click <strong className="text-zinc-900 dark:text-white">"Open Supabase SQL Editor"</strong> to jump directly to your dashboard.</li>
                  <li>Paste into the query tab and click <strong className="text-zinc-900 dark:text-white">"Run"</strong>.</li>
                  <li>Come back and save your application again!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Full Database Initialization
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                    Creates tables (<code className="font-mono">apps</code>, <code className="font-mono">app_screenshots</code>, <code className="font-mono">app_reviews</code>, <code className="font-mono">profiles</code>, <code className="font-mono">app_downloads</code>), sets up atomic download/rating triggers, and creates public storage buckets (<code className="font-mono">app-apks</code>, <code className="font-mono">app-icons</code>, <code className="font-mono">app-screenshots</code>).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 text-white ${
                currentTab === 'rls'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'SQL Copied to Clipboard!' : currentTab === 'rls' ? 'Copy Quick RLS Fix SQL' : 'Copy Full SQL Schema'}</span>
            </button>

            <a
              href={sqlEditorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Supabase SQL Editor</span>
            </a>

            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{isVerifying ? 'Verifying...' : 'Verify Connection'}</span>
            </button>
          </div>

          {/* Verification result feedback */}
          {verifyStatus && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
              verifyStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              {verifyStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{verifyStatus.success ? 'Database Connected & Verified!' : 'Setup Verification'}</p>
                <p className="text-[11px] opacity-90 mt-0.5">{verifyStatus.message}</p>
              </div>
            </div>
          )}

          {/* Code Viewer Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                {currentTab === 'rls' ? 'RLS Policy Resolution Script (fix_rls.sql)' : 'PostgreSQL Migration Script (schema.sql)'}
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy SQL'}
              </button>
            </div>

            <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-[11px] text-zinc-300 max-h-72 overflow-y-auto leading-relaxed select-all">
              <pre className="whitespace-pre">{currentSql}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            {currentTab === 'rls' 
              ? 'Enables unrestricted insert/update/read operations on apps and screenshots'
              : 'Creates apps, app_screenshots, app_reviews, profiles, and storage buckets'}
          </p>

          <button
            onClick={() => setSchemaModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

