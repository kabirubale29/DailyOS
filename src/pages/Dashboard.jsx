import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Sparkles,
  Flame,
  Timer,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Circle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CircularProgress } from '../components/common/CircularProgress';
import { ProgressBar } from '../components/common/ProgressBar';
import { HabitIcon } from '../components/common/HabitIcon';
import { WeeklyChart } from '../components/dashboard/WeeklyChart';
import { DailyHighlight } from '../components/dashboard/DailyHighlight';
import { DailyGrowthReflection } from '../components/dashboard/DailyGrowthReflection';
import { QuickAddModal } from '../components/layout/QuickAddModal';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';
import confetti from 'canvas-confetti';

export const Dashboard = () => {
  const { user } = useAuth();
  const {
    tasks,
    habitsWithStats,
    habitLogs,
    categories,
    todayStats,
    toggleTask,
    logHabit,
  } = useData();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState('task');

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayDate = startOfDay(new Date());

  // Motivational quotes
  const quotes = [
    'Small daily improvements over time lead to stunning results.',
    'Focus on being productive instead of busy.',
    'Consistency is the code that turns ambition into achievement.',
    'Discipline is choosing between what you want now and what you want most.',
  ];
  const motivationalMessage = quotes[new Date().getDate() % quotes.length];

  // Overdue and upcoming tasks
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'Completed' || !t.due_date) return false;
    return isBefore(parseISO(t.due_date), todayDate);
  });

  const upcomingTasks = tasks.filter((t) => {
    if (t.status === 'Completed' || !t.due_date) return false;
    const taskDate = parseISO(t.due_date);
    return !isBefore(taskDate, todayDate) && t.due_date !== todayStr;
  }).slice(0, 5);

  const getCategory = (catId) => categories.find((c) => c.id === catId);

  const handleToggleHabit = async (habitId, currentCompleted, targetValue) => {
    const nextCompleted = !currentCompleted;
    if (nextCompleted) {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    }
    await logHabit(habitId, todayStr, nextCompleted ? (targetValue || 1) : 0, nextCompleted);
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    if (currentStatus !== 'Completed') {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    }
    await toggleTask(taskId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* A. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-transparent dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-transparent border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {getGreeting()},
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {user?.full_name?.split(' ')[0] || 'Kabir'} 👋
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {format(new Date(), 'EEEE, MMMM do, yyyy')} &bull;{' '}
            <span className="italic text-neutral-500">{motivationalMessage}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setQuickAddTab('habit');
              setIsQuickAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            + Daily Habit
          </button>
          <Button
            variant="primary"
            onClick={() => {
              setQuickAddTab('task');
              setIsQuickAddOpen(true);
            }}
            icon={Plus}
            className="shadow-sm"
          >
            Quick Add
          </Button>
        </div>
      </div>

      {/* Daily Non-Negotiable Highlight */}
      <DailyHighlight />

      {/* B. Daily Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Tasks Completed */}
        <Card className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Tasks Completed
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {todayStats.tasksCompletedCount}
              </span>
              <span className="text-xs text-neutral-400">/ {todayStats.tasksTotalCount} total</span>
            </div>
            <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              {todayStats.taskPercent}% completion rate
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
        </Card>

        {/* Stat 2: Habits Completed */}
        <Card className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Habits Done Today
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {todayStats.habitsCompletedCount}
              </span>
              <span className="text-xs text-neutral-400">/ {todayStats.habitsTotalCount} scheduled</span>
            </div>
            <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              {todayStats.habitPercent}% completed
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </Card>

        {/* Stat 3: Current Streak */}
        <Card className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Habit Streak
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {todayStats.currentStreakMax}
              </span>
              <span className="text-xs text-neutral-400">days active</span>
            </div>
            <div className="text-[11px] font-medium text-rose-500">
              Record: {todayStats.longestStreakMax} days 🔥
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
        </Card>

        {/* Stat 4: Focus Time */}
        <Card className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Focus Time Today
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {todayStats.todayFocusMinutes}
              </span>
              <span className="text-xs text-neutral-400">mins</span>
            </div>
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {todayStats.todayFocusSessionsCount} focus blocks
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500 shrink-0">
            <Timer className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* C. Daily Progress Breakdown */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <CircularProgress percentage={todayStats.overallProgressPercent} size={92} strokeWidth={8}>
              <div className="text-center">
                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {todayStats.overallProgressPercent}%
                </span>
                <span className="block text-[9px] uppercase font-semibold text-neutral-400">
                  Overall
                </span>
              </div>
            </CircularProgress>

            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Daily Performance Score
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Calculated from your tasks, scheduled habits, and focus benchmarks for today.
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span>
                  Estimated time:{' '}
                  <strong className="text-neutral-800 dark:text-neutral-200">
                    {Math.floor(todayStats.totalEstimatedMinutes / 60)}h {todayStats.totalEstimatedMinutes % 60}m
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Differentiating Task vs Habit Progress */}
          <div className="w-full lg:w-96 space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Task Completion
                </span>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {todayStats.tasksCompletedCount} of {todayStats.tasksTotalCount} ({todayStats.taskPercent}%)
                </span>
              </div>
              <ProgressBar progress={todayStats.taskPercent} color="#6366f1" size="sm" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Habit Completion
                </span>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {todayStats.habitsCompletedCount} of {todayStats.habitsTotalCount} ({todayStats.habitPercent}%)
                </span>
              </div>
              <ProgressBar progress={todayStats.habitPercent} color="#f59e0b" size="sm" />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Today's Tasks & Today's Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D. Today's Tasks */}
        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Today's Tasks
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {todayStats.todayTasks.length}
              </span>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 flex-1 overflow-y-auto max-h-80">
            {todayStats.todayTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                No tasks scheduled for today. Take a breather or add a task!
              </div>
            ) : (
              todayStats.todayTasks.map((task) => {
                const category = getCategory(task.category_id);
                const isCompleted = task.status === 'Completed';

                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between py-3 px-1 gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 rounded-lg transition-colors group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-50 dark:fill-indigo-950" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium tracking-tight truncate ${
                            isCompleted
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {category && (
                            <Badge color={category.color} size="xs">
                              {category.name}
                            </Badge>
                          )}
                          <Badge
                            variant={
                              task.priority === 'High'
                                ? 'danger'
                                : task.priority === 'Medium'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="xs"
                          >
                            {task.priority}
                          </Badge>
                          {task.due_time && (
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.due_time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-neutral-400 shrink-0">
                      {task.estimated_minutes}m
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* E. Today's Habits */}
        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Today's Habits
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {todayStats.scheduledTodayHabits.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setQuickAddTab('habit');
                  setIsQuickAddOpen(true);
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Daily Habit
              </button>
              <Link
                to="/habits"
                className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:underline flex items-center gap-1"
              >
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 flex-1 overflow-y-auto max-h-80">
            {todayStats.scheduledTodayHabits.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  No habits scheduled for today
                </p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  Build momentum with small consistent daily habits.
                </p>
                <button
                  onClick={() => {
                    setQuickAddTab('habit');
                    setIsQuickAddOpen(true);
                  }}
                  className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Your First Daily Habit
                </button>
              </div>
            ) : (
              todayStats.scheduledTodayHabits.map((habit) => {
                const log = habitLogs.find(
                  (l) => l.habit_id === habit.id && l.log_date === todayStr
                );
                const isCompleted = log && log.completed;
                const habitWithStat = habitsWithStats.find((h) => h.id === habit.id);
                const currentStreak = habitWithStat?.stats.currentStreak || 0;

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between py-3 px-1 gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${habit.color}15`,
                          color: habit.color,
                        }}
                      >
                        <HabitIcon name={habit.icon} className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {habit.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-0.5">
                            <Flame className="w-3 h-3" /> {currentStreak} streak
                          </span>
                          {habit.habit_type !== 'boolean' && (
                            <span className="text-[11px] text-neutral-400">
                              Target: {habit.target_value} {habit.target_unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleToggleHabit(habit.id, isCompleted, habit.target_value)
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : 'Check off'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* F & G: Upcoming/Overdue Deadlines, Growth Reflection & Weekly Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Growth Reflection Protocol */}
        <DailyGrowthReflection />

        {/* F. Upcoming & Overdue Tasks */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Deadlines & Upcoming
            </h3>
            {overdueTasks.length > 0 && (
              <Badge variant="danger" size="xs">
                {overdueTasks.length} Overdue
              </Badge>
            )}
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 mt-2 flex-1 overflow-y-auto max-h-72">
            {/* Overdue Tasks */}
            {overdueTasks.map((t) => (
              <div key={t.id} className="py-2.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 truncate">
                      {t.title}
                    </p>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Due: {t.due_date}</p>
                </div>
                <button
                  onClick={() => handleToggleTask(t.id, t.status)}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                >
                  Done
                </button>
              </div>
            ))}

            {/* Upcoming Tasks */}
            {upcomingTasks.map((t) => (
              <div key={t.id} className="py-2.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {t.title}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Due: {format(parseISO(t.due_date), 'EEE, MMM d')}
                  </p>
                </div>
                <Badge variant={t.priority === 'High' ? 'danger' : 'neutral'} size="xs">
                  {t.priority}
                </Badge>
              </div>
            ))}

            {overdueTasks.length === 0 && upcomingTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-400">
                All clear! No upcoming or overdue deadlines.
              </div>
            )}
          </div>
        </Card>

        {/* G. Weekly Overview Chart (Recharts) */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Productivity Trends
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Tasks vs habits (last 7 days).
              </p>
            </div>
          </div>

          <WeeklyChart tasks={tasks} habitLogs={habitLogs} />
        </Card>
      </div>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddTab}
      />
    </div>
  );
};
