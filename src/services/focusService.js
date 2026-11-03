import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getItem, setItem, KEYS } from './storage';
import { INITIAL_FOCUS_SESSIONS } from './mockData';
import { generateUUID } from '../utils/uuid';
import { format, isSameDay, parseISO, subDays } from 'date-fns';

export const focusService = {
  async getSessions() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('focus_sessions')
          .select('*')
          .order('started_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error fetching focus sessions from Supabase', e);
      }
    }
    return getItem(KEYS.FOCUS, INITIAL_FOCUS_SESSIONS);
  },

  async logSession({ taskId = null, sessionType = 'focus', durationMinutes = 25, startedAt, completedAt }) {
    const newSession = {
      id: generateUUID(),
      task_id: taskId || null,
      session_type: sessionType,
      duration_minutes: durationMinutes,
      started_at: startedAt || new Date(Date.now() - durationMinutes * 60000).toISOString(),
      completed_at: completedAt || new Date().toISOString(),
      status: 'completed',
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('focus_sessions')
            .insert([{ ...newSession, user_id: user.id }])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase logSession error', e);
      }
    }

    const sessions = getItem(KEYS.FOCUS, INITIAL_FOCUS_SESSIONS);
    const updated = [newSession, ...sessions];
    setItem(KEYS.FOCUS, updated);
    return newSession;
  },

  async getFocusStats() {
    const sessions = await this.getSessions();
    const today = new Date();
    const weekAgo = subDays(today, 7);

    let todayMinutes = 0;
    let todaySessionsCount = 0;
    let weeklyMinutes = 0;
    let totalSessionsCount = 0;

    sessions.forEach((s) => {
      if (s.status !== 'completed' || s.session_type !== 'focus') return;
      totalSessionsCount += 1;

      const sessionDate = parseISO(s.started_at);
      if (isSameDay(sessionDate, today)) {
        todayMinutes += Number(s.duration_minutes) || 0;
        todaySessionsCount += 1;
      }

      if (sessionDate >= weekAgo) {
        weeklyMinutes += Number(s.duration_minutes) || 0;
      }
    });

    return {
      todayMinutes,
      todaySessionsCount,
      weeklyMinutes,
      totalSessionsCount,
    };
  },
};
