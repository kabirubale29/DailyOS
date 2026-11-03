import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth();
  const { todayStats } = useData();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare, badge: todayStats?.tasksTotalCount > 0 ? todayStats.tasksTotalCount : null },
    { name: 'Habit Tracker', path: '/habits', icon: Sparkles, badge: todayStats?.currentStreakMax > 0 ? `${todayStats.currentStreakMax}🔥` : null },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Focus Mode', path: '/focus', icon: Timer },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white dark:bg-[#101623] border-r border-neutral-200/80 dark:border-neutral-800/80 transition-all duration-300 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-100 dark:border-neutral-800/80">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
          <img
            src="/logo-icon.png"
            alt="DailyOS Logo"
            className="w-9 h-9 rounded-xl object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] shrink-0 transition-transform group-hover:scale-105"
          />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center">
                Daily<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">OS</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-500/80 dark:text-indigo-400/80">
                Your Productivity OS
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <span className="flex-1 truncate tracking-tight">{item.name}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800/80">
        <NavLink
          to="/settings"
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors ${
            isCollapsed ? 'justify-center p-1' : ''
          }`}
          title="Open Settings & Profile"
        >
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.full_name || 'Kabir'}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700 shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {user?.full_name || 'Kabir Ubale'}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                Personal Workspace
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Settings className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
          )}
        </NavLink>
      </div>
    </aside>
  );
};
