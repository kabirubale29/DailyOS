import {
  INITIAL_USER,
  INITIAL_CATEGORIES,
} from './mockData';

const KEYS = {
  USER: 'dailyos_user',
  CATEGORIES: 'dailyos_categories',
  TASKS: 'dailyos_tasks',
  HABITS: 'dailyos_habits',
  HABIT_LOGS: 'dailyos_habit_logs',
  GOALS: 'dailyos_goals',
  MILESTONES: 'dailyos_milestones',
  FOCUS: 'dailyos_focus_sessions',
  JOURNAL: 'dailyos_journal_entries',
  NOTIFICATIONS: 'dailyos_notifications',
  SETTINGS: 'dailyos_settings',
  DATA_VERSION: 'dailyos_data_version',
};

const CURRENT_VERSION = 'clean_v3_kabir';

// Initialize default storage data (clean, personal for Kabir Ubale)
export const initLocalStorage = () => {
  const version = localStorage.getItem(KEYS.DATA_VERSION);
  if (version !== CURRENT_VERSION) {
    localStorage.setItem(KEYS.USER, JSON.stringify(INITIAL_USER));
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(KEYS.DATA_VERSION, CURRENT_VERSION);
  }

  if (!localStorage.getItem(KEYS.USER)) {
    localStorage.setItem(KEYS.USER, JSON.stringify(INITIAL_USER));
  } else {
    // Ensure name is Kabir Ubale
    try {
      const u = JSON.parse(localStorage.getItem(KEYS.USER));
      if (u.full_name !== 'Kabir Ubale') {
        localStorage.setItem(KEYS.USER, JSON.stringify({ ...u, full_name: 'Kabir Ubale', email: 'kabir@dailyos.local' }));
      }
    } catch (e) {
      localStorage.setItem(KEYS.USER, JSON.stringify(INITIAL_USER));
    }
  }

  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(KEYS.TASKS)) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.HABITS)) {
    localStorage.setItem(KEYS.HABITS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.HABIT_LOGS)) {
    localStorage.setItem(KEYS.HABIT_LOGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.GOALS)) {
    localStorage.setItem(KEYS.GOALS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.MILESTONES)) {
    localStorage.setItem(KEYS.MILESTONES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.FOCUS)) {
    localStorage.setItem(KEYS.FOCUS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.JOURNAL)) {
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify({
      theme: 'dark',
      week_start: 'monday',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      date_format: 'yyyy-MM-dd',
      notifications_enabled: true,
      focus_duration: 25,
      short_break: 5,
      long_break: 15,
    }));
  }
};

export const getItem = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);
    return data !== null ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Failed to get ${key} from localStorage`, e);
    return fallback;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to set ${key} in localStorage`, e);
  }
};

export { KEYS };
