import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckSquare,
  Sparkles,
  Timer,
  Calendar,
  Flame,
  Award,
  Clock,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { format, subDays, parseISO, isAfter, startOfDay, getDay } from 'date-fns';

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

const CATEGORY_PALETTE = ['#6366f1', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#64748b'];

export const Analytics = () => {
  const { tasks, habitsWithStats, habitLogs, focusSessions, categories } = useData();

  // Date Range Filter: 7, 30, 90, 'all'
  const [dateRange, setDateRange] = useState('30'); // '7', '30', '90', 'all'

  const daysCount = dateRange === 'all' ? 365 : parseInt(dateRange, 10);
  const cutoffDate = subDays(startOfDay(new Date()), daysCount);

  // Filter items within the date range
  const filteredTasks = useMemo(() => {
    if (dateRange === 'all') return tasks;
    return tasks.filter((t) => {
      const d = t.created_at ? parseISO(t.created_at) : (t.due_date ? parseISO(t.due_date) : null);
      return d ? isAfter(d, cutoffDate) : true;
    });
  }, [tasks, dateRange, cutoffDate]);

  const filteredLogs = useMemo(() => {
    if (dateRange === 'all') return habitLogs;
    return habitLogs.filter((l) => {
      const d = parseISO(l.log_date);
      return isAfter(d, cutoffDate);
    });
  }, [habitLogs, dateRange, cutoffDate]);

  const filteredSessions = useMemo(() => {
    if (dateRange === 'all') return focusSessions;
    return focusSessions.filter((s) => {
      const d = s.started_at ? parseISO(s.started_at) : null;
      return d ? isAfter(d, cutoffDate) : true;
    });
  }, [focusSessions, dateRange, cutoffDate]);

  // A. Overview Statistics
  const totalTasksCreated = filteredTasks.length;
  const totalTasksCompleted = filteredTasks.filter((t) => t.status === 'Completed').length;
  const taskCompletionRate = totalTasksCreated > 0 ? Math.round((totalTasksCompleted / totalTasksCreated) * 100) : 0;

  const totalHabitsTracked = habitsWithStats.length;
  const totalHabitLogsCompleted = filteredLogs.filter((l) => l.completed).length;
  const totalHabitLogsScheduled = filteredLogs.length;
  const overallHabitRate = totalHabitLogsScheduled > 0 ? Math.round((totalHabitLogsCompleted / totalHabitLogsScheduled) * 100) : 0;

  const totalFocusMinutes = filteredSessions
    .filter((s) => s.status === 'completed' && s.session_type === 'focus')
    .reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0);

  // B. Completion Trend Over Time (Area Chart)
  const trendChartData = useMemo(() => {
    const dataMap = new Map();
    const intervalDays = Math.min(daysCount, 30); // show max 30 bars on screen for clarity
    const today = new Date();

    for (let i = intervalDays - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const label = format(d, intervalDays > 14 ? 'MM/dd' : 'EEE d');
      dataMap.set(dateStr, {
        date: dateStr,
        label,
        tasksCompleted: 0,
        habitsCompleted: 0,
      });
    }

    filteredTasks.forEach((t) => {
      if (t.status === 'Completed' && t.due_date && dataMap.has(t.due_date)) {
        dataMap.get(t.due_date).tasksCompleted += 1;
      }
    });

    filteredLogs.forEach((l) => {
      if (l.completed && dataMap.has(l.log_date)) {
        dataMap.get(l.log_date).habitsCompleted += 1;
      }
    });

    return Array.from(dataMap.values());
  }, [filteredTasks, filteredLogs, daysCount]);

  // Priority Distribution
  const priorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    filteredTasks.forEach((t) => {
      if (counts[t.priority] !== undefined) counts[t.priority] += 1;
    });
    return [
      { name: 'High', value: counts.High, color: PRIORITY_COLORS.High },
      { name: 'Medium', value: counts.Medium, color: PRIORITY_COLORS.Medium },
      { name: 'Low', value: counts.Low, color: PRIORITY_COLORS.Low },
    ].filter((p) => p.value > 0);
  }, [filteredTasks]);

  // Category Distribution
  const categoryData = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, { name: c.name, count: 0, color: c.color }));

    filteredTasks.forEach((t) => {
      if (t.category_id && map.has(t.category_id)) {
        map.get(t.category_id).count += 1;
      }
    });

    return Array.from(map.values()).filter((c) => c.count > 0);
  }, [filteredTasks, categories]);

  // Most Productive Weekday Calculation
  const mostProductiveDay = useMemo(() => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    filteredTasks.forEach((t) => {
      if (t.status === 'Completed' && t.due_date) {
        const d = parseISO(t.due_date);
        dayCounts[getDay(d)] += 1;
      }
    });

    let maxIdx = 1; // default Monday
    let maxVal = -1;
    dayCounts.forEach((count, idx) => {
      if (count > maxVal) {
        maxVal = count;
        maxIdx = idx;
      }
    });

    return maxVal > 0 ? dayNames[maxIdx] : 'Consistent across all days';
  }, [filteredTasks]);

  // Best & Most Missed Habits
  const sortedHabits = useMemo(() => {
    return [...habitsWithStats].sort((a, b) => (b.stats?.completionRate || 0) - (a.stats?.completionRate || 0));
  }, [habitsWithStats]);

  const bestHabit = sortedHabits[0];
  const lowestHabit = sortedHabits.length > 1 ? sortedHabits[sortedHabits.length - 1] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Productivity Analytics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Data-backed insights derived directly from your completion logs and focus records.
          </p>
        </div>

        {/* Date Filter selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Range:
          </span>
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  dateRange === r.id
                    ? 'bg-white dark:bg-[#131926] text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* A. Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Tasks Completed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {totalTasksCompleted}
            </span>
            <span className="text-xs text-neutral-400">/ {totalTasksCreated}</span>
          </div>
          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            {taskCompletionRate}% task win rate
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Habit Consistency
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {overallHabitRate}%
            </span>
          </div>
          <p className="text-[11px] font-semibold text-amber-500">
            {totalHabitLogsCompleted} habit check-offs
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Total Focus Time
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
            </span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {filteredSessions.length} total sessions
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Peak Productivity Day
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {mostProductiveDay}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-rose-500">
            Highest completion velocity
          </p>
        </Card>
      </div>

      {/* B. Daily & Weekly Completion Trends Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Daily Output Trend (Tasks vs Habits)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Historical count of completed tasks and habits across the selected interval.
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendChartData}>
              <defs>
                <linearGradient id="taskColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="habitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={24} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#131926',
                  borderColor: '#263148',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="tasksCompleted" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#taskColor)" name="Tasks Completed" />
              <Area type="monotone" dataKey="habitsCompleted" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#habitColor)" name="Habits Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* C & D. Priority & Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <Card className="p-5 flex flex-col">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Tasks by Priority
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Distribution across High, Medium, and Low priorities.
            </p>
          </div>

          <div className="h-60 w-full pt-2 flex items-center justify-center">
            {priorityData.length === 0 ? (
              <EmptyState title="No task priority data" description="Create tasks with priorities to see distribution." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131926',
                      borderColor: '#263148',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-5 flex flex-col">
          <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Tasks by Category
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Time and commitment distribution across focus areas.
            </p>
          </div>

          <div className="h-60 w-full pt-2">
            {categoryData.length === 0 ? (
              <EmptyState title="No category data" description="Categorize your tasks to see work distribution." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131926',
                      borderColor: '#263148',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Habit Consistency Rankings */}
      <Card className="p-5">
        <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Habit Consistency Leaderboard
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Ranked by overall completion percentage and longest streaks.
          </p>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 mt-2">
          {sortedHabits.length === 0 ? (
            <EmptyState
              title="No habits tracked yet"
              description="Create your habits in the Habit Tracker to see your consistency leaderboard."
            />
          ) : (
            sortedHabits.map((habit, idx) => (
              <div key={habit.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-neutral-400 w-4 text-center">
                    #{idx + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                      {habit.name}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Target: {habit.target_value} {habit.target_unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-500 flex items-center justify-end gap-0.5">
                      <Flame className="w-3.5 h-3.5" /> {habit.stats?.currentStreak || 0}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      Best: {habit.stats?.longestStreak || 0}d
                    </span>
                  </div>

                  <div className="w-24 text-right">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {habit.stats?.completionRate || 0}%
                    </span>
                    <span className="text-[10px] text-neutral-400 block">Consistency</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
