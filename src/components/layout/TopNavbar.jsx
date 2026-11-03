import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Menu,
  Sparkles,
  Calendar as CalendarIcon,
  User,
  Settings,
  LogOut,
  Cloud,
  Smartphone,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { QuickAddModal } from './QuickAddModal';
import { SearchModal } from './SearchModal';
import { CloudSyncModal } from './CloudSyncModal';
import { format } from 'date-fns';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/tasks': 'My Tasks',
  '/habits': 'Habit Tracker',
  '/calendar': 'Calendar Planning',
  '/goals': 'Long-term Goals',
  '/analytics': 'Productivity Analytics',
  '/focus': 'Focus Mode',
  '/journal': 'Daily Journal',
  '/settings': 'Settings & Profile',
};

export const TopNavbar = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoggedInToCloud, isCloudConfigured, logout } = useAuth();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState('task');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || 'DailyOS';
  const formattedDate = format(new Date(), 'EEEE, MMM d, yyyy');

  return (
    <>
      <header className="h-16 bg-white/80 dark:bg-[#101623]/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Bar */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors text-xs font-medium w-36 sm:w-56 justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Search DailyOS...</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded-sm shadow-2xs border border-neutral-200/60 dark:border-neutral-700/60">
              ⌘K
            </kbd>
          </button>

          {/* Cloud Sync Status Pill */}
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isLoggedInToCloud
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : isCloudConfigured
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-200/70'
            }`}
            title="Cloud Sync — Sync between phone and laptop"
          >
            <Cloud className={`w-3.5 h-3.5 ${isLoggedInToCloud ? 'text-emerald-500' : isCloudConfigured ? 'text-amber-500' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">
              {isLoggedInToCloud ? 'Cloud Synced' : isCloudConfigured ? 'Sign in to Sync' : 'Sync Phone'}
            </span>
          </button>

          {/* Quick-add habit button */}
          <button
            onClick={() => {
              setQuickAddTab('habit');
              setIsQuickAddOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Quick Add Daily Habit"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Habit</span>
          </button>

          {/* Quick-add button */}
          <button
            onClick={() => {
              setQuickAddTab('task');
              setIsQuickAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Notifications dropdown */}
          <NotificationDropdown />

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* User Profile */}
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center focus:outline-none"
            title="Kabir Ubale's Profile & Settings"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.full_name || 'Kabir Ubale'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20 hover:ring-indigo-500/60 transition-all"
            />
          </button>
        </div>
      </header>

      {/* Global Modals */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddTab}
      />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
