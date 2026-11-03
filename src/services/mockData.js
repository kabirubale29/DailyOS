export const INITIAL_USER = {
  id: 'usr_kabir_ubale',
  email: 'kabir@dailyos.local',
  full_name: 'Kabir Ubale',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  created_at: new Date().toISOString(),
};

export const INITIAL_CATEGORIES = [
  { id: '11111111-1111-4000-8000-000000000001', name: 'Work', color: '#3b82f6' },
  { id: '11111111-1111-4000-8000-000000000002', name: 'Study', color: '#8b5cf6' },
  { id: '11111111-1111-4000-8000-000000000003', name: 'Fitness', color: '#10b981' },
  { id: '11111111-1111-4000-8000-000000000004', name: 'Personal', color: '#f59e0b' },
  { id: '11111111-1111-4000-8000-000000000005', name: 'Projects', color: '#ec4899' },
  { id: '11111111-1111-4000-8000-000000000006', name: 'Other', color: '#64748b' },
];

export const INITIAL_TASKS = [];
export const INITIAL_HABITS = [];
export const generateInitialHabitLogs = () => [];
export const INITIAL_GOALS = [];
export const INITIAL_MILESTONES = [];
export const INITIAL_FOCUS_SESSIONS = [];
export const INITIAL_JOURNAL_ENTRIES = [];
export const INITIAL_NOTIFICATIONS = [];
