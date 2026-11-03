import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getItem, setItem, KEYS } from './storage';
import { INITIAL_NOTIFICATIONS } from './mockData';
import { generateUUID } from '../utils/uuid';

export const notificationService = {
  async getNotifications() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error fetching notifications from Supabase', e);
      }
    }
    return getItem(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  async markAsRead(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      } catch (e) {
        console.warn('Supabase markAsRead error', e);
      }
    }

    const notifs = getItem(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setItem(KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  async markAllAsRead() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
        }
      } catch (e) {
        console.warn('Supabase markAllAsRead error', e);
      }
    }

    const notifs = getItem(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => ({ ...n, is_read: true }));
    setItem(KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  async clearAll() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('notifications').delete().eq('user_id', user.id);
        }
      } catch (e) {
        console.warn('Supabase clearAll notifications error', e);
      }
    }

    setItem(KEYS.NOTIFICATIONS, []);
    return [];
  },

  async addNotification({ title, message, type = 'system' }) {
    const newNotif = {
      id: generateUUID(),
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('notifications')
            .insert([{ ...newNotif, user_id: user.id }])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase addNotification error', e);
      }
    }

    const notifs = getItem(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = [newNotif, ...notifs];
    setItem(KEYS.NOTIFICATIONS, updated);

    // Try web browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body: message, icon: '/vite.svg' });
      } catch (e) {
        console.warn('Browser notification error', e);
      }
    }

    return newNotif;
  },
};
