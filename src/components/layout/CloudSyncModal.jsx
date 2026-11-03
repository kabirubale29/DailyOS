import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Laptop,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/FormInputs';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { isSupabaseConfigured, createSupabaseInstance } from '../../lib/supabase';

export const CloudSyncModal = ({ isOpen, onClose }) => {
  const { user, session, isLoggedInToCloud, signIn, signUp, logout } = useAuth();
  const { syncNow, isSyncing } = useData();

  // Tab: 'status', 'auth', 'setup', 'phone'
  const [activeTab, setActiveTab] = useState(isLoggedInToCloud ? 'status' : isSupabaseConfigured() ? 'auth' : 'setup');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('kabir@dailyos.com');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('Kabir Ubale');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supabase Configuration inputs
  const [customUrl, setCustomUrl] = useState(
    localStorage.getItem('dailyos_supabase_url') || import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [customKey, setCustomKey] = useState(
    localStorage.getItem('dailyos_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  const [configError, setConfigError] = useState('');
  const [configSuccess, setConfigSuccess] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Phone local Wi-Fi URL
  const phoneLocalUrl = `http://${window.location.hostname}:5173`;

  const handleCopyPhoneUrl = () => {
    navigator.clipboard.writeText(phoneLocalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        await signIn(email, password);
        setAuthSuccess('Logged in successfully! Your phone and laptop are now in sync.');
        await syncNow();
      } else {
        await signUp(email, password, fullName);
        setAuthSuccess('Account created! Sign in on your phone with this email and password to sync.');
        await syncNow();
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigError('');
    setConfigSuccess('');

    if (!customUrl.startsWith('https://')) {
      setConfigError('Supabase URL must start with https://');
      return;
    }
    if (customKey.length < 20) {
      setConfigError('Invalid Supabase Anon key');
      return;
    }

    try {
      const testClient = createSupabaseInstance(customUrl, customKey);
      const { error } = await testClient.from('profiles').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, but credentials reached Supabase
        console.warn('Supabase test warning:', error);
      }

      localStorage.setItem('dailyos_supabase_url', customUrl);
      localStorage.setItem('dailyos_supabase_anon_key', customKey);
      setConfigSuccess('Supabase connected! Reloading page to initialize cloud client...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setConfigError('Connection failed: ' + (err.message || 'Check your URL and key'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cloud Sync — Phone & Laptop"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Sync Hero Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {isLoggedInToCloud
                    ? 'Cloud Sync Active 🟢'
                    : isSupabaseConfigured()
                    ? 'Supabase Connected 🟡'
                    : 'Local Mode (Offline)'}
                </h4>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {isLoggedInToCloud
                  ? `Signed in as ${user?.email || 'Kabir Ubale'} — real-time 2-way sync.`
                  : isSupabaseConfigured()
                  ? 'Sign in below to sync all tasks and habits across your devices.'
                  : 'Connect your Supabase project to enable seamless phone & laptop sync.'}
              </p>
            </div>
          </div>

          {isLoggedInToCloud && (
            <Button
              variant="outline"
              size="sm"
              onClick={syncNow}
              disabled={isSyncing}
              icon={RefreshCw}
              className={isSyncing ? 'animate-spin' : ''}
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Open on Phone
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(isSupabaseConfigured() ? 'auth' : 'setup')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'auth' || activeTab === 'setup'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            {isSupabaseConfigured() ? 'Account Sync' : 'Connect Supabase'}
          </button>
        </div>

        {/* TAB 1: PHONE INSTRUCTIONS */}
        {activeTab === 'phone' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  1. Local Wi-Fi URL (Instant access)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Same Wi-Fi
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Make sure your phone is connected to the same Wi-Fi as this laptop. Open your phone's browser (Safari or Chrome) and enter:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-indigo-600 dark:text-indigo-400 select-all">
                  {phoneLocalUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPhoneUrl}
                  icon={copiedUrl ? Check : Copy}
                >
                  {copiedUrl ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30">
                <p className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 mb-1.5">
                  📱 iPhone / Safari
                </p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-500 text-[11px]">
                  <li>Open URL in Safari</li>
                  <li>Tap the <strong>Share</strong> button</li>
                  <li>Tap <strong>"Add to Home Screen"</strong></li>
                  <li>Opens full-screen like a native app!</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30">
                <p className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 mb-1.5">
                  🤖 Android / Chrome
                </p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-500 text-[11px]">
                  <li>Open URL in Chrome</li>
                  <li>Tap the <strong>Three Dots ⋮</strong></li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                  <li>Enjoy seamless mobile experience!</li>
                </ol>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Want to access it anywhere outside home (on 5G/LTE)?</strong>
                <p className="text-[11px] mt-0.5 text-amber-600/90 dark:text-amber-400">
                  Deploying to Vercel takes 1 minute and gives you a free permanent HTTPS link (e.g. <code>dailyos-kabir.vercel.app</code>) that works on any phone, anywhere in the world!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUPABASE AUTH (When Supabase is configured) */}
        {activeTab === 'auth' && isSupabaseConfigured() && (
          <div className="space-y-4">
            {isLoggedInToCloud ? (
              <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Connected as {user?.email}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Your database is synchronizing automatically across both devices. Anything you add or edit on your phone or laptop syncs in real-time.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      await syncNow();
                      setAuthSuccess('Synced successfully with Supabase!');
                    }}
                    icon={RefreshCw}
                  >
                    Sync Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    icon={LogOut}
                  >
                    Sign Out
                  </Button>
                </div>
                {authSuccess && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{authSuccess}</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {authMode === 'login' ? 'Sign In to Sync Both Devices' : 'Create Supabase Sync Account'}
                  </span>
                  <div className="text-xs font-semibold">
                    {authMode === 'login' ? (
                      <button
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Need an account? Sign up
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Already registered? Sign in
                      </button>
                    )}
                  </div>
                </div>

                {authMode === 'signup' && (
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kabir@example.com"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                {authError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Connecting...'
                    : authMode === 'login'
                    ? 'Sign In & Activate Sync'
                    : 'Create Account & Start Sync'}
                </Button>

                <p className="text-[11px] text-center text-neutral-400">
                  Tip: Log in with this same email and password on your phone to keep both in 100% real-time sync.
                </p>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: CONNECT SUPABASE (When not configured or custom config) */}
        {activeTab === 'setup' && (
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
              <p className="font-bold text-neutral-800 dark:text-neutral-200">
                Quick 2-minute Supabase Setup:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-neutral-500 text-[11px]">
                <li>Create a free project at <strong>supabase.com</strong></li>
                <li>Go to <strong>Project Settings → API</strong> and copy Project URL & Anon Key</li>
                <li>In the <strong>SQL Editor</strong>, run the contents of <code>supabase-schema.sql</code></li>
                <li>Paste the URL and Anon Key below and click Connect</li>
              </ol>
            </div>

            <Input
              label="Supabase Project URL"
              placeholder="https://xyzcompany.supabase.co"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              required
            />

            <Input
              label="Supabase Anon Public API Key"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              required
            />

            {configError && (
              <p className="text-xs text-rose-500 font-semibold">{configError}</p>
            )}
            {configSuccess && (
              <p className="text-xs text-emerald-500 font-semibold">{configSuccess}</p>
            )}

            <Button type="submit" variant="primary" className="w-full">
              Test Connection & Connect Supabase
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
