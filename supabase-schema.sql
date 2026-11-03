-- ==============================================================================
-- DailyOS: Supabase Database Schema & Row Level Security (RLS)
-- Tailored for Kabir Ubale & Cross-Device Realtime Sync
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  timezone text default 'Asia/Kolkata',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);


-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#6366f1',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Users can manage their categories"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_categories_user_id on public.categories(user_id);


-- Trigger to create profile & default categories upon new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, timezone)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Kabir Ubale'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'Asia/Kolkata'
  );

  insert into public.categories (user_id, name, color)
  values
    (new.id, 'Work', '#3b82f6'),
    (new.id, 'Study', '#8b5cf6'),
    (new.id, 'Fitness', '#10b981'),
    (new.id, 'Personal', '#f59e0b'),
    (new.id, 'Projects', '#ec4899'),
    (new.id, 'Other', '#64748b');

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. GOALS TABLE
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  category text default 'Personal',
  start_date date default current_date,
  target_date date,
  progress integer default 0,
  status text check (status in ('Not Started', 'In Progress', 'Completed', 'Paused')) default 'In Progress',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goals enable row level security;

create policy "Users can manage their goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_goals_user_id on public.goals(user_id);


-- 4. GOAL MILESTONES TABLE
create table if not exists public.goal_milestones (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade not null,
  title text not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goal_milestones enable row level security;

create policy "Users can manage their goal milestones"
  on public.goal_milestones for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_milestones_goal_id on public.goal_milestones(goal_id);


-- 5. TASKS TABLE
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  goal_id uuid references public.goals(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  due_time time,
  priority text check (priority in ('High', 'Medium', 'Low')) default 'Medium',
  estimated_minutes integer default 30,
  status text check (status in ('Pending', 'Completed')) default 'Pending',
  recurrence_rule text default 'None', -- 'None', 'Daily', 'Weekly', 'Weekdays', 'Monthly'
  order_index integer default 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;

create policy "Users can manage their tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_tasks_user_date on public.tasks(user_id, due_date);
create index if not exists idx_tasks_status on public.tasks(user_id, status);


-- 6. HABITS TABLE
create table if not exists public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  icon text default 'Sparkles',
  color text default '#6366f1',
  habit_type text check (habit_type in ('boolean', 'numeric', 'duration', 'count')) default 'boolean',
  frequency_type text check (frequency_type in ('daily', 'weekdays', 'specific_days', 'custom_weekly')) default 'daily',
  scheduled_days jsonb default '[0, 1, 2, 3, 4, 5, 6]'::jsonb, -- 0=Sunday, 1=Monday... 6=Saturday
  target_value numeric default 1,
  target_unit text default 'times',
  start_date date default current_date,
  end_date date,
  reminder_time time,
  is_active boolean default true,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.habits enable row level security;

create policy "Users can manage their habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_habits_user_id on public.habits(user_id);


-- 7. HABIT LOGS TABLE
create table if not exists public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  log_date date not null,
  completed boolean default false,
  actual_value numeric default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint habit_logs_habit_date_unique unique (habit_id, log_date)
);

alter table public.habit_logs enable row level security;

create policy "Users can manage their habit logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_habit_logs_date on public.habit_logs(user_id, log_date);


-- 8. FOCUS SESSIONS TABLE
create table if not exists public.focus_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete set null,
  session_type text check (session_type in ('focus', 'short_break', 'long_break')) default 'focus',
  duration_minutes integer not null default 25,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  status text check (status in ('completed', 'cancelled')) default 'completed'
);

alter table public.focus_sessions enable row level security;

create policy "Users can manage their focus sessions"
  on public.focus_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_focus_sessions_user on public.focus_sessions(user_id, started_at);


-- 9. JOURNAL ENTRIES TABLE
create table if not exists public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text,
  mood text check (mood in ('Excellent', 'Good', 'Neutral', 'Bad', 'Terrible')) default 'Good',
  tags text[] default array[]::text[],
  entry_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.journal_entries enable row level security;

create policy "Users can manage their journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_journal_user_date on public.journal_entries(user_id, entry_date);


-- 10. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'system', -- 'task_due', 'task_overdue', 'habit_reminder', 'daily_planning', 'system'
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can manage their notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read);


-- 11. ENABLE REALTIME BROADCASTING ACROSS ALL TABLES
do $$
begin
  alter publication supabase_realtime add table public.tasks;
  alter publication supabase_realtime add table public.habits;
  alter publication supabase_realtime add table public.habit_logs;
  alter publication supabase_realtime add table public.goals;
  alter publication supabase_realtime add table public.goal_milestones;
  alter publication supabase_realtime add table public.journal_entries;
  alter publication supabase_realtime add table public.focus_sessions;
  alter publication supabase_realtime add table public.categories;
exception when others then
  -- In case any table is already in the publication
  null;
end;
$$;
