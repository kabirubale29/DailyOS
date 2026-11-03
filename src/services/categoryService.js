import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getItem, setItem, KEYS } from './storage';
import { INITIAL_CATEGORIES } from './mockData';
import { generateUUID } from '../utils/uuid';

export const categoryService = {
  async getCategories() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Error fetching categories from Supabase', e);
      }
    }
    return getItem(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async createCategory(category) {
    const newCat = {
      id: generateUUID(),
      name: category.name,
      color: category.color || '#6366f1',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('categories')
            .insert([{ ...category, user_id: user.id }])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (e) {
        console.warn('Supabase createCategory error', e);
      }
    }

    const categories = getItem(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const updated = [...categories, newCat];
    setItem(KEYS.CATEGORIES, updated);
    return newCat;
  },

  async updateCategory(id, updates) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase updateCategory error', e);
      }
    }

    const categories = getItem(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setItem(KEYS.CATEGORIES, updated);
    return updated.find((c) => c.id === id);
  },

  async deleteCategory(id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCategory error', e);
      }
    }

    const categories = getItem(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const updated = categories.filter((c) => c.id !== id);
    setItem(KEYS.CATEGORIES, updated);
    return true;
  },
};
