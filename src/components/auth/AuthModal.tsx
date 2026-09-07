import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowLeft, 
  Database, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../context/AppContext';
import { getSupabaseConfig } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const { 
    signIn, 
    signUp, 
    resetPassword, 
    signInWithOAuth, 
    saveSupabaseCredentials,
    isSupabaseConfigured,
    loginRequiredModal, 
    setLoginRequiredModal 
  } = useAuth();
  const { isSupabaseConnected, syncFromSupabase, refreshApps } = useAppStore();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick configuration drawer for Supabase credentials
  const [showQuickConfig, setShowQuickConfig] = useState(false);
  const [configUrl, setConfigUrl] = useState('');
  const [configKey, setConfigKey] = useState('');
  const [showConfigKey, setShowConfigKey] = useState(false);
  const [configStatus, setConfigStatus] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Sync mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setEmailConfirmationRequired(false);
      
      const conf = getSupabaseConfig();
      setConfigUrl(conf.url || '');
      setConfigKey(conf.anonKey || '');
    }
  }, [isOpen, initialMode]);

  if (!isOpen && !loginRequiredModal) return null;

  const handleClose = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmailConfirmationRequired(false);
    setShowQuickConfig(false);
    setLoginRequiredModal(false);
    onClose();
  };

  const runSync = async () => {
    try {
      if (typeof syncFromSupabase === 'function') {
        await syncFromSupabase();
      } else if (typeof refreshApps === 'function') {
        await refreshApps();
      }
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        await runSync();
        handleClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await signUp(email, password, displayName, makeAdmin);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.confirmationRequired) {
        setEmailConfirmationRequired(true);
        setSuccessMsg(`Verification email sent to ${email}. Please confirm your email address to log in.`);
      } else {
        await runSync();
        handleClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await resetPassword(email);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Password recovery link has been sent to your email address.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not send recovery email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMsg(null);
    try {
      const res = await signInWithOAuth(provider);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || `OAuth sign in failed with ${provider}`);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigStatus(null);
    try {
      const res = await saveSupabaseCredentials(configUrl, configKey);
      if (res.success) {
        setConfigStatus('Supabase credentials successfully saved!');
        await runSync();
        setTimeout(() => {
          setShowQuickConfig(false);
          setConfigStatus(null);
        }, 1200);
      } else {
        setConfigStatus(res.message || 'Failed to save credentials.');
      }
    } catch (err: any) {
      setConfigStatus(err?.message || 'Error updating configuration.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const currentSupabaseHost = (() => {
    try {
      const conf = getSupabaseConfig();
      if (conf.url) {
        return new URL(conf.url).hostname;
      }
    } catch (e) {}
    return null;
  })();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Status Bar & Header */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-emerald-600/30">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Supabase Authentication
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Secure sign in & accounts for Gplay Store
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Supabase Connection State Badge */}
          <div className="mt-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-1.5 border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                isSupabaseConnected || isSupabaseConfigured 
                  ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse' 
                  : 'bg-amber-400'
              }`} />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                {isSupabaseConnected || isSupabaseConfigured
                  ? `Connected: ${currentSupabaseHost || 'Supabase Cloud'}`
                  : 'Supabase credentials not configured'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowQuickConfig(!showQuickConfig)}
              className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0 ml-2"
            >
              <span>{showQuickConfig ? 'Close' : 'Configure'}</span>
              {showQuickConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Quick Config Drawer */}
          {showQuickConfig && (
            <form onSubmit={handleSaveConfig} className="mt-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-300/80 dark:border-zinc-700 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                <span>Connect Supabase Project</span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Dashboard <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">
                  Project URL (Root origin)
                </label>
                <input
                  type="text"
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  required
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[9px] text-zinc-400 mt-0.5">
                  Must be root URL without <span className="font-mono">/rest/v1</span> or trailing slash.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    Anon Public API Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfigKey(!showConfigKey)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
                  >
                    {showConfigKey ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                    {showConfigKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showConfigKey ? "text" : "password"}
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[9px] text-zinc-400 mt-0.5">
                  Found in: Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API Keys &rarr; "anon" "public".
                </p>
              </div>

              {configStatus && (
                <p className={`text-[11px] font-medium ${
                  configStatus.includes('successfully') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                }`}>
                  {configStatus}
                </p>
              )}

              <button
                type="submit"
                disabled={isSavingConfig}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50"
              >
                {isSavingConfig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save & Connect Supabase
              </button>
            </form>
          )}

          {/* Mode Tabs (Sign In / Sign Up) */}
          {mode !== 'forgot' && (
            <div className="mt-4 flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Email Confirmation Screen */}
          {emailConfirmationRequired ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                  Confirm Your Email Address
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Supabase has sent a verification link to <strong className="text-zinc-700 dark:text-zinc-200">{email}</strong>. Please check your inbox to activate your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailConfirmationRequired(false);
                  setMode('signin');
                  setSuccessMsg(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20"
              >
                Proceed to Sign In
              </button>
            </div>
          ) : mode === 'forgot' ? (
            
            /* Forgot Password Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Reset Account Password
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Enter your registered email and Supabase will send you a recovery link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending Recovery Link...
                  </>
                ) : (
                  'Send Recovery Link'
                )}
              </button>
            </form>

          ) : mode === 'signin' ? (

            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signin-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="signin-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Authenticating with Supabase...
                  </>
                ) : (
                  'Sign In with Supabase'
                )}
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-zinc-900 text-[11px] text-zinc-400">
                  or sign in with
                </span>
              </div>

              {/* OAuth Providers */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </form>

          ) : (

            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-name-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Admin Privileges Option */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    id="signup-admin-checkbox"
                    type="checkbox"
                    checked={makeAdmin}
                    onChange={(e) => setMakeAdmin(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Register as Store Administrator
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                      Grants access to publish APK packages, upload screenshots, and moderate user reviews.
                    </p>
                  </div>
                </label>
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Creating Supabase Account...
                  </>
                ) : (
                  'Create Supabase Account'
                )}
              </button>
            </form>
          )}

          {/* Footer switch */}
          {mode !== 'forgot' && !emailConfirmationRequired && (
            <div className="pt-2 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {mode === 'signup' ? 'Already registered?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signup' ? 'signin' : 'signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {mode === 'signup' ? 'Sign In' : 'Create an Account'}
                </button>
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
