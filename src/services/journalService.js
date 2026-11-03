import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getItem, setItem, KEYS } from './storage';
import { INITIAL_JOURNAL_ENTRIES } from './mockData';
import { generateUUID } from '../utils/uuid';
import { format } from 'date-fns';

export const journalService = {
  async getEntries() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .order('entry_date', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Error fetching journal entries from Supabase', e);
      }
    }
    return getItem(KEYS.JOURNAL, INITIAL_JOURNAL_ENTRIES);
  },

  async createEntry(entry) {
    const newEntry = {
      id: generateUUID(),
      title: entry.title,
      content: entry.content || '',
      mood: entry.mood || 'Good',
      tags: Array.isArray(entry.tags) ? entry.tags : (entry.tags ? entry.tags.split(',').map((t) => t.trim()) : []),
      entry_date: entry.entry_date || format(new Date(), 'yyyy-MM-dd'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('journal_entries')
            .insert([{ ...newEntry, user_id: user.id }])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase createEntry error', e);
      }
    }

    const entries = getItem(KEYS.JOURNAL, INITIAL_JOURNAL_ENTRIES);
    const updated = [newEntry, ...entries];
    setItem(KEYS.JOURNAL, updated);
    return newEntry;
  },

  async updateEntry(id, updates) {
    const payload = {
      ...updates,
      tags: Array.isArray(updates.tags) ? updates.tags : (updates.tags ? updates.tags.split(',').map((t) => t.trim()) : []),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateEntry error', e);
      }
    }

    const entries = getItem(KEYS.JOURNAL, INITIAL_JOURNAL_ENTRIES);
    const updated = entries.map((e) => (e.id === id ? { ...e, ...payload } : e));
    setItem(KEYS.JOURNAL, updated);
    return updated.find((e) => e.id === id);
  },

  async deleteEntry(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('journal_entries').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteEntry error', e);
      }
    }

    const entries = getItem(KEYS.JOURNAL, INITIAL_JOURNAL_ENTRIES);
    const updated = entries.filter((e) => e.id !== id);
    setItem(KEYS.JOURNAL, updated);
    return true;
  },
};
