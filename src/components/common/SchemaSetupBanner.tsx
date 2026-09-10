import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  RefreshCw, 
  Code2,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { SUPABASE_SQL_SCHEMA } from '../../lib/sqlSchema';
import { getSupabaseSqlEditorUrl, testSupabaseConnection } from '../../lib/supabase';

export const SchemaSetupBanner: React.FC = () => {
  const { 
    isSchemaMissing, 
    dismissSchemaBanner, 
    setDismissSchemaBanner, 
    setSchemaModalOpen,
    syncFromSupabase 
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isSchemaMissing || dismissSchemaBanner) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRecheck = async () => {
    setIsChecking(true);
    setFeedback(null);
    try {
      const res = await testSupabaseConnection();
      if (res.success) {
        setFeedback('Success! Tables found and synchronized.');
        await syncFromSupabase();
      } else {
        setFeedback(res.tableMissing ? 'Table "public.apps" still not found. Run SQL in Supabase first.' : res.message);
      }
    } catch {
      setFeedback('Failed to connect.');
    } finally {
      setIsChecking(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const sqlEditorUrl = getSupabaseSqlEditorUrl();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 shadow-sm backdrop-blur-sm text-zinc-900 dark:text-zinc-100 relative transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main message */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-zinc-900 dark:text-white">
                  Database Schema Required: Table <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200">public.apps</code> Missing
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Supabase Connected
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                Your Supabase project URL and key are valid, but database tables haven't been created yet. Copy and run the SQL schema in your Supabase SQL Editor to finish setting up your app store.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 md:self-center pl-12 md:pl-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-sm"
              title="Copy complete PostgreSQL migration script"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL Schema'}</span>
            </button>

            <a
              href={sqlEditorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              <span>SQL Editor</span>
            </a>

            <button
              onClick={() => setSchemaModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>View Script</span>
            </button>

            <button
              onClick={handleRecheck}
              disabled={isChecking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50"
              title="Check if table public.apps has been created"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-emerald-500' : 'text-zinc-500'}`} />
              <span>{isChecking ? 'Checking...' : 'Check Again'}</span>
            </button>

            <button
              onClick={() => setDismissSchemaBanner(true)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors ml-1"
              aria-label="Dismiss banner"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback message if re-tested */}
        {feedback && (
          <div className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-300 pl-12">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};
