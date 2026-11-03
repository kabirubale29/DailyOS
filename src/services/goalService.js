import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getItem, setItem, KEYS } from './storage';
import { INITIAL_GOALS, INITIAL_MILESTONES } from './mockData';
import { generateUUID } from '../utils/uuid';
import { format } from 'date-fns';

export const goalService = {
  async getGoals() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error fetching goals from Supabase', e);
      }
    }
    return getItem(KEYS.GOALS, INITIAL_GOALS);
  },

  async getMilestones(goalId = null) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('goal_milestones').select('*').order('created_at', { ascending: true });
        if (goalId) query = query.eq('goal_id', goalId);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error fetching milestones from Supabase', e);
      }
    }
    const all = getItem(KEYS.MILESTONES, INITIAL_MILESTONES);
    return goalId ? all.filter((m) => m.goal_id === goalId) : all;
  },

  async createGoal(goal) {
    const newGoal = {
      id: generateUUID(),
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'Personal',
      start_date: goal.start_date || format(new Date(), 'yyyy-MM-dd'),
      target_date: goal.target_date || null,
      progress: 0,
      status: goal.status || 'In Progress',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('goals')
            .insert([{ ...newGoal, user_id: user.id }])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase createGoal error', e);
      }
    }

    const goals = getItem(KEYS.GOALS, INITIAL_GOALS);
    const updated = [newGoal, ...goals];
    setItem(KEYS.GOALS, updated);
    return newGoal;
  },

  async updateGoal(id, updates) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateGoal error', e);
      }
    }

    const goals = getItem(KEYS.GOALS, INITIAL_GOALS);
    const updated = goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    setItem(KEYS.GOALS, updated);
    return updated.find((g) => g.id === id);
  },

  async deleteGoal(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('goals').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteGoal error', e);
      }
    }

    const goals = getItem(KEYS.GOALS, INITIAL_GOALS);
    setItem(KEYS.GOALS, goals.filter((g) => g.id !== id));

    const milestones = getItem(KEYS.MILESTONES, INITIAL_MILESTONES);
    setItem(KEYS.MILESTONES, milestones.filter((m) => m.goal_id !== id));
    return true;
  },

  async addMilestone(goalId, title) {
    const newMs = {
      id: generateUUID(),
      goal_id: goalId,
      title,
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('goal_milestones')
            .insert([{ ...newMs, user_id: user.id }])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase addMilestone error', e);
      }
    }

    const milestones = getItem(KEYS.MILESTONES, INITIAL_MILESTONES);
    const updated = [...milestones, newMs];
    setItem(KEYS.MILESTONES, updated);
    await this.recalculateGoalProgress(goalId);
    return newMs;
  },

  async toggleMilestone(milestoneId) {
    const milestones = getItem(KEYS.MILESTONES, INITIAL_MILESTONES);
    const target = milestones.find((m) => m.id === milestoneId);
    if (!target) return null;

    const nextCompleted = !target.is_completed;
    const completedAt = nextCompleted ? new Date().toISOString() : null;

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('goal_milestones')
          .update({ is_completed: nextCompleted, completed_at: completedAt })
          .eq('id', milestoneId);
      } catch (e) {
        console.warn('Supabase toggleMilestone error', e);
      }
    }

    const updated = milestones.map((m) =>
      m.id === milestoneId ? { ...m, is_completed: nextCompleted, completed_at: completedAt } : m
    );
    setItem(KEYS.MILESTONES, updated);
    await this.recalculateGoalProgress(target.goal_id);
    return updated.find((m) => m.id === milestoneId);
  },

  async deleteMilestone(milestoneId) {
    const milestones = getItem(KEYS.MILESTONES, INITIAL_MILESTONES);
    const target = milestones.find((m) => m.id === milestoneId);
    if (!target) return false;

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('goal_milestones').delete().eq('id', milestoneId);
      } catch (e) {
        console.warn('Supabase deleteMilestone error', e);
      }
    }

    const updated = milestones.filter((m) => m.id !== milestoneId);
    setItem(KEYS.MILESTONES, updated);
    await this.recalculateGoalProgress(target.goal_id);
    return true;
  },

  async recalculateGoalProgress(goalId) {
    const milestones = getItem(KEYS.MILESTONES, INITIAL_MILESTONES).filter((m) => m.goal_id === goalId);
    if (milestones.length === 0) return;

    const completed = milestones.filter((m) => m.is_completed).length;
    const progress = Math.round((completed / milestones.length) * 100);
    const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';

    await this.updateGoal(goalId, { progress, status });
  },
};
