import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { taskService } from '../services/taskService';
import { habitService } from '../services/habitService';
import { goalService } from '../services/goalService';
import { focusService } from '../services/focusService';
import { journalService } from '../services/journalService';
import { notificationService } from '../services/notificationService';
import { categoryService } from '../services/categoryService';
import { calculateHabitStats } from '../utils/habitStreaks';
import { format, isSameDay, parseISO } from 'date-fns';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load all initial data
  const refreshAllData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const [
        loadedTasks,
        loadedHabits,
        loadedLogs,
        loadedGoals,
        loadedMilestones,
        loadedSessions,
        loadedJournal,
        loadedNotifs,
        loadedCategories,
      ] = await Promise.all([
        taskService.getTasks(),
        habitService.getHabits(),
        habitService.getHabitLogs(),
        goalService.getGoals(),
        goalService.getMilestones(),
        focusService.getSessions(),
        journalService.getEntries(),
        notificationService.getNotifications(),
        categoryService.getCategories(),
      ]);

      setTasks(loadedTasks || []);
      setHabits(loadedHabits || []);
      setHabitLogs(loadedLogs || []);
      setGoals(loadedGoals || []);
      setMilestones(loadedMilestones || []);
      setFocusSessions(loadedSessions || []);
      setJournalEntries(loadedJournal || []);
      setNotifications(loadedNotifs || []);
      setCategories(loadedCategories || []);
    } catch (err) {
      console.error('Failed to load DataContext data', err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 500);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Realtime Supabase Subscription for Cross-Device Sync (Phone <-> Laptop)
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel('dailyos-cross-device-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        refreshAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, () => {
        refreshAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, () => {
        refreshAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        refreshAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_milestones' }, () => {
        refreshAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries' }, () => {
        refreshAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'focus_sessions' }, () => {
        refreshAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshAllData]);

  // Tab visibility and focus listener: refresh when Kabir opens or unlocks phone/laptop
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshAllData();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [refreshAllData]);

  // Task Operations
  const createTask = async (taskData) => {
    const created = await taskService.createTask(taskData);
    setTasks((prev) => [created, ...prev]);
    return created;
  };

  const updateTask = async (id, updates) => {
    const updated = await taskService.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const toggleTask = async (id) => {
    const updated = await taskService.toggleTaskStatus(id);
    const refreshed = await taskService.getTasks();
    setTasks(refreshed);
    return updated;
  };

  const deleteTask = async (id) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const duplicateTask = async (id) => {
    const duplicated = await taskService.duplicateTask(id);
    if (duplicated) {
      setTasks((prev) => [duplicated, ...prev]);
    }
    return duplicated;
  };

  const reorderTasks = async (newOrderList) => {
    setTasks(newOrderList);
    await taskService.reorderTasks(newOrderList);
  };

  // Habit Operations
  const createHabit = async (habitData) => {
    const created = await habitService.createHabit(habitData);
    setHabits((prev) => [...prev, created]);
    return created;
  };

  const updateHabit = async (id, updates) => {
    const updated = await habitService.updateHabit(id, updates);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    return updated;
  };

  const deleteHabit = async (id) => {
    await habitService.deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHabitLogs((prev) => prev.filter((l) => l.habit_id !== id));
  };

  const toggleHabitActive = async (id) => {
    const updated = await habitService.toggleActive(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
  };

  const toggleHabitArchive = async (id) => {
    const updated = await habitService.toggleArchive(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
  };

  const logHabit = async (habitId, dateStr, value = null, completed = null, notes = '') => {
    const newLog = await habitService.logHabit(habitId, dateStr, value, completed, notes);
    setHabitLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.habit_id === habitId && l.log_date === dateStr);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...newLog };
        return copy;
      }
      return [...prev, newLog];
    });
    return newLog;
  };

  // Goal Operations
  const createGoal = async (goalData) => {
    const created = await goalService.createGoal(goalData);
    setGoals((prev) => [created, ...prev]);
    return created;
  };

  const updateGoal = async (id, updates) => {
    const updated = await goalService.updateGoal(id, updates);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  };

  const deleteGoal = async (id) => {
    await goalService.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setMilestones((prev) => prev.filter((m) => m.goal_id !== id));
  };

  const addMilestone = async (goalId, title) => {
    const ms = await goalService.addMilestone(goalId, title);
    const refreshedMilestones = await goalService.getMilestones();
    const refreshedGoals = await goalService.getGoals();
    setMilestones(refreshedMilestones);
    setGoals(refreshedGoals);
    return ms;
  };

  const toggleMilestone = async (milestoneId) => {
    const updatedMs = await goalService.toggleMilestone(milestoneId);
    const refreshedMilestones = await goalService.getMilestones();
    const refreshedGoals = await goalService.getGoals();
    setMilestones(refreshedMilestones);
    setGoals(refreshedGoals);
    return updatedMs;
  };

  const deleteMilestone = async (milestoneId) => {
    await goalService.deleteMilestone(milestoneId);
    const refreshedMilestones = await goalService.getMilestones();
    const refreshedGoals = await goalService.getGoals();
    setMilestones(refreshedMilestones);
    setGoals(refreshedGoals);
  };

  // Focus Operations
  const logFocusSession = async (sessionData) => {
    const newSession = await focusService.logSession(sessionData);
    setFocusSessions((prev) => [newSession, ...prev]);
    return newSession;
  };

  // Journal Operations
  const createJournalEntry = async (entryData) => {
    const newEntry = await journalService.createEntry(entryData);
    setJournalEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const updateJournalEntry = async (id, updates) => {
    const updated = await journalService.updateEntry(id, updates);
    setJournalEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  const deleteJournalEntry = async (id) => {
    await journalService.deleteEntry(id);
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Notification Operations
  const markNotificationRead = async (id) => {
    const updated = await notificationService.markAsRead(id);
    setNotifications(updated);
  };

  const markAllNotificationsRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const clearNotifications = async () => {
    await notificationService.clearAll();
    setNotifications([]);
  };

  // Category Operations
  const createCategory = async (catData) => {
    const newCat = await categoryService.createCategory(catData);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (id, updates) => {
    const updated = await categoryService.updateCategory(id, updates);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteCategory = async (id) => {
    await categoryService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Computed Habit Stats Map
  const habitsWithStats = useMemo(() => {
    return habits.map((habit) => ({
      ...habit,
      stats: calculateHabitStats(habit, habitLogs),
    }));
  }, [habits, habitLogs]);

  // Today's Computed Stats
  const todayStats = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const dayOfWeek = new Date().getDay();

    // 1. Tasks scheduled for today
    const todayTasks = tasks.filter((t) => t.due_date === todayStr);
    const tasksCompletedCount = todayTasks.filter((t) => t.status === 'Completed').length;
    const tasksTotalCount = todayTasks.length;
    const taskPercent = tasksTotalCount > 0 ? Math.round((tasksCompletedCount / tasksTotalCount) * 100) : 0;
    const totalEstimatedMinutes = todayTasks.reduce((sum, t) => sum + (Number(t.estimated_minutes) || 0), 0);

    // 2. Habits scheduled for today (only active and not archived)
    const activeHabits = habits.filter((h) => h.is_active && !h.is_archived);
    const scheduledTodayHabits = activeHabits.filter((h) => {
      const days = Array.isArray(h.scheduled_days) ? h.scheduled_days : [0, 1, 2, 3, 4, 5, 6];
      return days.includes(dayOfWeek);
    });

    const habitsCompletedToday = scheduledTodayHabits.filter((h) => {
      const log = habitLogs.find((l) => l.habit_id === h.id && l.log_date === todayStr);
      return log && log.completed;
    });

    const habitsCompletedCount = habitsCompletedToday.length;
    const habitsTotalCount = scheduledTodayHabits.length;
    const habitPercent = habitsTotalCount > 0 ? Math.round((habitsCompletedCount / habitsTotalCount) * 100) : 0;

    // 3. Streak Metrics
    let currentStreakMax = 0;
    let longestStreakMax = 0;
    habitsWithStats.forEach((h) => {
      if (h.stats.currentStreak > currentStreakMax) currentStreakMax = h.stats.currentStreak;
      if (h.stats.longestStreak > longestStreakMax) longestStreakMax = h.stats.longestStreak;
    });

    // 4. Focus Time Today
    let todayFocusMinutes = 0;
    let todayFocusSessionsCount = 0;
    focusSessions.forEach((s) => {
      if (s.status === 'completed' && s.session_type === 'focus' && s.started_at) {
        if (isSameDay(parseISO(s.started_at), new Date())) {
          todayFocusMinutes += Number(s.duration_minutes) || 0;
          todayFocusSessionsCount += 1;
        }
      }
    });

    // 5. Overall Daily Progress (weighted combination of task & habit)
    const totalItems = tasksTotalCount + habitsTotalCount;
    const completedItems = tasksCompletedCount + habitsCompletedCount;
    const overallProgressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      todayStr,
      todayTasks,
      tasksCompletedCount,
      tasksTotalCount,
      taskPercent,
      totalEstimatedMinutes,
      scheduledTodayHabits,
      habitsCompletedCount,
      habitsTotalCount,
      habitPercent,
      currentStreakMax,
      longestStreakMax,
      todayFocusMinutes,
      todayFocusSessionsCount,
      overallProgressPercent,
    };
  }, [tasks, habits, habitLogs, habitsWithStats, focusSessions]);

  return (
    <DataContext.Provider
      value={{
        loading,
        tasks,
        habits,
        habitsWithStats,
        habitLogs,
        goals,
        milestones,
        focusSessions,
        journalEntries,
        notifications,
        categories,
        todayStats,
        refreshAllData,
        syncNow: refreshAllData,
        isSyncing,
        // Task operations
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        duplicateTask,
        reorderTasks,
        // Habit operations
        createHabit,
        updateHabit,
        deleteHabit,
        toggleHabitActive,
        toggleHabitArchive,
        logHabit,
        // Goal operations
        createGoal,
        updateGoal,
        deleteGoal,
        addMilestone,
        toggleMilestone,
        deleteMilestone,
        // Focus operations
        logFocusSession,
        // Journal operations
        createJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        // Notification operations
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        // Category operations
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
