import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getItem, setItem, KEYS } from './storage';
import { INITIAL_HABITS, generateInitialHabitLogs } from './mockData';
import { calculateHabitStats } from '../utils/habitStreaks';
import { generateUUID } from '../utils/uuid';
import { format } from 'date-fns';

export const habitService = {
  async getHabits() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error fetching habits from Supabase', e);
      }
    }
    return getItem(KEYS.HABITS, INITIAL_HABITS);
  },

  async getHabitLogs() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('habit_logs')
          .select('*')
          .order('log_date', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error fetching habit logs from Supabase', e);
      }
    }
    return getItem(KEYS.HABIT_LOGS, generateInitialHabitLogs());
  },

  async createHabit(habit) {
    const newHabit = {
      id: generateUUID(),
      name: habit.name,
      description: habit.description || '',
      icon: habit.icon || 'Sparkles',
      color: habit.color || '#6366f1',
      habit_type: habit.habit_type || 'boolean',
      frequency_type: habit.frequency_type || 'daily',
      scheduled_days: habit.scheduled_days || [0, 1, 2, 3, 4, 5, 6],
      target_value: Number(habit.target_value) || 1,
      target_unit: habit.target_unit || 'times',
      start_date: habit.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: habit.end_date || null,
      reminder_time: habit.reminder_time || null,
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('habits')
            .insert([{ ...newHabit, user_id: user.id }])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase createHabit error', e);
      }
    }

    const habits = getItem(KEYS.HABITS, INITIAL_HABITS);
    const updated = [...habits, newHabit];
    setItem(KEYS.HABITS, updated);
    return newHabit;
  },

  async updateHabit(id, updates) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('habits')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateHabit error', e);
      }
    }

    const habits = getItem(KEYS.HABITS, INITIAL_HABITS);
    const updated = habits.map((h) => (h.id === id ? { ...h, ...updates } : h));
    setItem(KEYS.HABITS, updated);
    return updated.find((h) => h.id === id);
  },

  async toggleActive(id) {
    const habits = getItem(KEYS.HABITS, INITIAL_HABITS);
    const habit = habits.find((h) => h.id === id);
    if (!habit) return null;
    return await this.updateHabit(id, { is_active: !habit.is_active });
  },

  async toggleArchive(id) {
    const habits = getItem(KEYS.HABITS, INITIAL_HABITS);
    const habit = habits.find((h) => h.id === id);
    if (!habit) return null;
    return await this.updateHabit(id, { is_archived: !habit.is_archived });
  },

  async deleteHabit(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('habits').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteHabit error', e);
      }
    }

    const habits = getItem(KEYS.HABITS, INITIAL_HABITS);
    const updatedHabits = habits.filter((h) => h.id !== id);
    setItem(KEYS.HABITS, updatedHabits);

    // Also remove logs
    const logs = getItem(KEYS.HABIT_LOGS, []);
    setItem(KEYS.HABIT_LOGS, logs.filter((l) => l.habit_id !== id));
    return true;
  },

  async logHabit(habitId, dateStr, value = null, completed = null, notes = '') {
    const habits = getItem(KEYS.HABITS, INITIAL_HABITS);
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return null;

    let isCompleted = completed;
    let actualValue = value;

    if (habit.habit_type === 'boolean') {
      if (isCompleted === null) {
        isCompleted = true;
      }
      actualValue = isCompleted ? 1 : 0;
    } else {
      actualValue = Number(value) || 0;
      if (isCompleted === null) {
        isCompleted = actualValue >= Number(habit.target_value);
      }
    }

    const newLog = {
      id: generateUUID(),
      habit_id: habitId,
      log_date: dateStr,
      completed: Boolean(isCompleted),
      actual_value: actualValue,
      notes: notes || '',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { id, ...logPayload } = newLog;
          const { data, error } = await supabase
            .from('habit_logs')
            .upsert({ ...logPayload, user_id: user.id }, { onConflict: 'habit_id,log_date' })
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase upsert habit log error', e);
      }
    }

    const logs = getItem(KEYS.HABIT_LOGS, generateInitialHabitLogs());
    const existingIndex = logs.findIndex(
      (l) => l.habit_id === habitId && l.log_date === dateStr
    );

    let updatedLogs;
    if (existingIndex >= 0) {
      updatedLogs = [...logs];
      updatedLogs[existingIndex] = {
        ...updatedLogs[existingIndex],
        completed: Boolean(isCompleted),
        actual_value: actualValue,
        notes: notes !== undefined ? notes : updatedLogs[existingIndex].notes,
      };
    } else {
      updatedLogs = [...logs, newLog];
    }

    setItem(KEYS.HABIT_LOGS, updatedLogs);
    return newLog;
  },

  async getHabitWithStats(habitId) {
    const habits = await this.getHabits();
    const logs = await this.getHabitLogs();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return null;

    const stats = calculateHabitStats(habit, logs);
    return {
      ...habit,
      stats,
    };
  },

  async getAllHabitsWithStats() {
    const habits = await this.getHabits();
    const logs = await this.getHabitLogs();
    return habits.map((habit) => ({
      ...habit,
      stats: calculateHabitStats(habit, logs),
    }));
  },
};
