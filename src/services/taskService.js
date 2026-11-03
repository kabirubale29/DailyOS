import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getItem, setItem, KEYS } from './storage';
import { INITIAL_TASKS } from './mockData';
import { generateUUID } from '../utils/uuid';
import { addDays, addMonths, format, parseISO } from 'date-fns';

const calculateNextRecurrenceDate = (currentDateStr, rule) => {
  if (!currentDateStr || rule === 'None') return null;
  const curr = parseISO(currentDateStr);

  switch (rule) {
    case 'Daily':
      return format(addDays(curr, 1), 'yyyy-MM-dd');
    case 'Weekdays': {
      let next = addDays(curr, 1);
      // Skip Saturday (6) and Sunday (0)
      while (next.getDay() === 0 || next.getDay() === 6) {
        next = addDays(next, 1);
      }
      return format(next, 'yyyy-MM-dd');
    }
    case 'Weekly':
      return format(addDays(curr, 7), 'yyyy-MM-dd');
    case 'Monthly':
      return format(addMonths(curr, 1), 'yyyy-MM-dd');
    default:
      return null;
  }
};

export const taskService = {
  async getTasks() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error fetching tasks from Supabase', e);
      }
    }
    return getItem(KEYS.TASKS, INITIAL_TASKS);
  },

  async createTask(task) {
    const newTask = {
      id: generateUUID(),
      title: task.title,
      description: task.description || '',
      category_id: task.category_id || null,
      goal_id: task.goal_id || null,
      due_date: task.due_date || format(new Date(), 'yyyy-MM-dd'),
      due_time: task.due_time || null,
      priority: task.priority || 'Medium',
      estimated_minutes: parseInt(task.estimated_minutes, 10) || 30,
      status: task.status || 'Pending',
      recurrence_rule: task.recurrence_rule || 'None',
      order_index: task.order_index || 0,
      completed_at: task.status === 'Completed' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('tasks')
            .insert([{ ...newTask, user_id: user.id }])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase createTask error', e);
      }
    }

    const tasks = getItem(KEYS.TASKS, INITIAL_TASKS);
    const updated = [newTask, ...tasks];
    setItem(KEYS.TASKS, updated);
    return newTask;
  },

  async updateTask(id, updates) {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === 'Completed' && !updates.completed_at) {
      payload.completed_at = new Date().toISOString();
    } else if (updates.status === 'Pending') {
      payload.completed_at = null;
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateTask error', e);
      }
    }

    const tasks = getItem(KEYS.TASKS, INITIAL_TASKS);
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...payload } : t));
    setItem(KEYS.TASKS, updated);
    return updated.find((t) => t.id === id);
  },

  async toggleTaskStatus(id) {
    const tasks = getItem(KEYS.TASKS, INITIAL_TASKS);
    const target = tasks.find((t) => t.id === id);
    if (!target) return null;

    const isCompleting = target.status !== 'Completed';
    const nextStatus = isCompleting ? 'Completed' : 'Pending';
    const completedAt = isCompleting ? new Date().toISOString() : null;

    const updatedTask = await this.updateTask(id, {
      status: nextStatus,
      completed_at: completedAt,
    });

    // If completing a recurring task, generate the next occurrence!
    if (isCompleting && target.recurrence_rule && target.recurrence_rule !== 'None' && target.due_date) {
      const nextDueDate = calculateNextRecurrenceDate(target.due_date, target.recurrence_rule);
      if (nextDueDate) {
        await this.createTask({
          title: target.title,
          description: target.description,
          category_id: target.category_id,
          goal_id: target.goal_id,
          due_date: nextDueDate,
          due_time: target.due_time,
          priority: target.priority,
          estimated_minutes: target.estimated_minutes,
          status: 'Pending',
          recurrence_rule: target.recurrence_rule,
        });
      }
    }

    return updatedTask;
  },

  async deleteTask(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteTask error', e);
      }
    }

    const tasks = getItem(KEYS.TASKS, INITIAL_TASKS);
    const updated = tasks.filter((t) => t.id !== id);
    setItem(KEYS.TASKS, updated);
    return true;
  },

  async duplicateTask(id) {
    const tasks = getItem(KEYS.TASKS, INITIAL_TASKS);
    const target = tasks.find((t) => t.id === id);
    if (!target) return null;

    return await this.createTask({
      ...target,
      id: undefined,
      title: `${target.title} (Copy)`,
      status: 'Pending',
      completed_at: null,
      created_at: undefined,
      updated_at: undefined,
    });
  },

  async reorderTasks(reorderedTaskList) {
    const indexed = reorderedTaskList.map((task, index) => ({
      ...task,
      order_index: index,
    }));

    setItem(KEYS.TASKS, indexed);

    if (isSupabaseConfigured() && supabase) {
      try {
        for (const item of indexed) {
          await supabase.from('tasks').update({ order_index: item.order_index }).eq('id', item.id);
        }
      } catch (e) {
        console.warn('Supabase reorderTasks error', e);
      }
    }

    return indexed;
  },
};
