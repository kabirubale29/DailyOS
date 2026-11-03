import React, { useState } from 'react';
import {
  User,
  Sliders,
  Bell,
  Database,
  Trash2,
  Save,
  Moon,
  Sun,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getItem, setItem, KEYS } from '../services/storage';
import { isSupabaseConfigured, createSupabaseInstance } from '../lib/supabase';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/FormInputs';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

export const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Settings State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'preferences', 'notifications', 'supabase', 'data'

  // Profile Form
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || 'Kabir Ubale',
    email: user?.email || 'kabir@dailyos.local',
    avatar_url: user?.avatar_url || AVATARS[0],
    timezone: user?.timezone || 'Asia/Kolkata',
  });

  // Preferences Form
  const [preferences, setPreferences] = useState(() => {
    return getItem(KEYS.SETTINGS, {
      theme: 'dark',
      week_start: 'monday',
      timezone: 'Asia/Kolkata',
      date_format: 'yyyy-MM-dd',
      notifications_enabled: true,
      focus_duration: 25,
      short_break: 5,
      long_break: 15,
    });
  });

  // Supabase Configuration
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('dailyos_supabase_url') || import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    localStorage.getItem('dailyos_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  const [supabaseStatus, setSupabaseStatus] = useState(isSupabaseConfigured() ? 'connected' : 'local');
  const [testResult, setTestResult] = useState('');

  // Confirmation dialogs
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Browser notification permission state
  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile(profileData);
    setSaveMessage('Profile successfully saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSavePreferences = () => {
    setItem(KEYS.SETTINGS, preferences);
    setSaveMessage('Preferences successfully saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleTestSupabase = async () => {
    setTestResult('Testing connection...');
    try {
      const client = createSupabaseInstance(supabaseUrl.trim(), supabaseAnonKey.trim());
      if (!client) {
        setTestResult('Invalid URL or Key format.');
        return;
      }
      const { error } = await client.from('categories').select('count', { count: 'exact', head: true });
      if (error) {
        setTestResult(`Connection failed: ${error.message}`);
      } else {
        localStorage.setItem('dailyos_supabase_url', supabaseUrl.trim());
        localStorage.setItem('dailyos_supabase_anon_key', supabaseAnonKey.trim());
        setSupabaseStatus('connected');
        setTestResult('Successfully connected to Supabase! Config saved.');
      }
    } catch (e) {
      setTestResult(`Connection error: ${e.message}`);
    }
  };

  const handleResetData = () => {
    localStorage.removeItem(KEYS.TASKS);
    localStorage.removeItem(KEYS.HABITS);
    localStorage.removeItem(KEYS.HABIT_LOGS);
    localStorage.removeItem(KEYS.GOALS);
    localStorage.removeItem(KEYS.MILESTONES);
    localStorage.removeItem(KEYS.FOCUS);
    localStorage.removeItem(KEYS.JOURNAL);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    setIsResetModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Customize your personal growth workspace, look & feel, and cloud storage.
        </p>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {saveMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'supabase', label: 'Supabase Cloud', icon: Database },
          { id: 'data', label: 'Data Management', icon: Trash2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={profileData.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                />
                <div className="flex flex-wrap items-center gap-2">
                  {AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setProfileData({ ...profileData, avatar_url: url })}
                      className={`w-10 h-10 rounded-xl overflow-hidden ring-2 transition-all ${
                        profileData.avatar_url === url
                          ? 'ring-indigo-600 scale-105'
                          : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                required
              />
              <Input
                label="Timezone"
                value={profileData.timezone}
                onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button type="submit" icon={Save}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Preferences */}
      {activeTab === 'preferences' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Appearance & Theme
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Switch between high-contrast dark mode and clean paper light mode.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              icon={theme === 'dark' ? Sun : Moon}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="First Day of the Week"
              value={preferences.week_start}
              onChange={(e) =>
                setPreferences({ ...preferences, week_start: e.target.value })
              }
            >
              <option value="monday">Monday (ISO standard)</option>
              <option value="sunday">Sunday</option>
            </Select>

            <Select
              label="Date Display Format"
              value={preferences.date_format}
              onChange={(e) =>
                setPreferences({ ...preferences, date_format: e.target.value })
              }
            >
              <option value="yyyy-MM-dd">YYYY-MM-DD (2026-11-03)</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY (11/03/2026)</option>
              <option value="dd/MM/yyyy">DD/MM/YYYY (03/11/2026)</option>
            </Select>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button onClick={handleSavePreferences} icon={Save}>
              Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <Card className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              In-App Reminders & Push Alerts
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Control when DailyOS notifies you of upcoming deadlines and habit cues.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Task Deadline Reminders
                </p>
                <p className="text-[11px] text-neutral-400">
                  Alert before scheduled task due time.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications_enabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, notifications_enabled: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Browser System Notifications
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Status: <span className="font-semibold uppercase">{browserPermission}</span>
                  </p>
                </div>
                {browserPermission !== 'granted' && (
                  <Button size="sm" onClick={handleRequestNotification}>
                    Request Permission
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button onClick={handleSavePreferences} icon={Save}>
              Save Notification Settings
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 4: Supabase Cloud Integration */}
      {activeTab === 'supabase' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                Supabase Cloud Storage
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Store and backup your personal data in your own private Supabase database.
              </p>
            </div>
            <Badge
              variant={supabaseStatus === 'connected' ? 'success' : 'neutral'}
              size="sm"
            >
              {supabaseStatus === 'connected' ? 'Supabase Connected' : 'Local Storage Mode'}
            </Badge>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-2">
            <p className="font-semibold text-indigo-900 dark:text-indigo-200">
              📌 How it works:
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Right now, your data is saved automatically on your machine in local storage. When you're ready to backup to Supabase, simply run <code>supabase-schema.sql</code> in your Supabase SQL editor and enter your Project URL and Anon key below.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Supabase Project URL"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
            />
            <Input
              type="password"
              label="Supabase Anon Public API Key"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>

          {testResult && (
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 p-2.5 rounded-lg">
              {testResult}
            </p>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('dailyos_supabase_url');
                localStorage.removeItem('dailyos_supabase_anon_key');
                setSupabaseUrl('');
                setSupabaseAnonKey('');
                setSupabaseStatus('local');
                setTestResult('Operating in local storage mode.');
              }}
              className="text-xs text-neutral-400 hover:text-rose-500 underline"
            >
              Disconnect Supabase
            </button>
            <Button onClick={handleTestSupabase} icon={Save}>
              Connect & Verify Supabase
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 5: Data Management */}
      {activeTab === 'data' && (
        <Card className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Data Management
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Reset your tasks, habits, and journals whenever you want a completely fresh start.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Clear All Data & Start Fresh
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Clears all tasks, habits, and journal entries so you have a completely blank canvas.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              icon={Trash2}
            >
              Reset Data
            </Button>
          </div>
        </Card>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetData}
        title="Reset All Data?"
        message="This will clear all your created tasks, habits, and journal entries, giving you a fresh start. Are you sure?"
        confirmText="Yes, Reset"
      />
    </div>
  );
};
