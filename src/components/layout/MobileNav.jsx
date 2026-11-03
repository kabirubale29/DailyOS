import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  Calendar,
  Target,
  BarChart3,
  Timer,
  BookOpen,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const MobileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habit Tracker', path: '/habits', icon: Sparkles },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Focus Mode', path: '/focus', icon: Timer },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#101623] h-full shadow-2xl flex flex-col z-10 animate-fade-in border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              Daily<span className="text-indigo-600 dark:text-indigo-400">OS</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Profile Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 p-1.5 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.full_name || 'Kabir Ubale'}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">Settings & Profile</p>
              </div>
            </div>
            <Settings className="w-4 h-4 text-neutral-400" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export const MobileBottomNav = () => {
  const bottomItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habits', path: '/habits', icon: Sparkles },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Focus', path: '/focus', icon: Timer },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-[#101623]/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around px-2 z-20">
      {bottomItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
