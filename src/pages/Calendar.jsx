import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckSquare,
  Sparkles,
  Timer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Circle,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TaskModal } from '../components/tasks/TaskModal';
import { HabitIcon } from '../components/common/HabitIcon';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isBefore,
  startOfDay,
} from 'date-fns';

export const Calendar = () => {
  const { tasks, habits, habitLogs, focusSessions, categories, goals, createTask, updateTask, toggleTask } = useData();

  // Calendar View: 'month', 'week', 'day'
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Task creation/editing from calendar
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayDate = startOfDay(new Date());

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Month days interval (start from week start)
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Week days interval
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Activities for the selected date
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.due_date === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const selectedDateHabitLogs = useMemo(() => {
    return habitLogs.filter((l) => l.log_date === selectedDateStr);
  }, [habitLogs, selectedDateStr]);

  const selectedDateFocusSessions = useMemo(() => {
    return focusSessions.filter((s) => {
      if (!s.started_at) return false;
      return format(parseISO(s.started_at), 'yyyy-MM-dd') === selectedDateStr;
    });
  }, [focusSessions, selectedDateStr]);

  const handleSaveTask = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask.id, formData);
      setEditingTask(null);
    } else {
      await createTask(formData);
    }
  };

  const getCategory = (catId) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Calendar Planning
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Map out commitments, deadlines, and daily consistency across days, weeks, and months.
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-[#131926] text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            icon={Plus}
          >
            Schedule Task
          </Button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {format(currentDate, viewMode === 'day' ? 'EEEE, MMMM do, yyyy' : 'MMMM yyyy')}
          </h3>
          <button
            onClick={handleToday}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Calendar Area: Grid + Selected Date Activity Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View Container */}
        <Card className="lg:col-span-2 p-4">
          {/* Month View */}
          {viewMode === 'month' && (
            <div>
              {/* Day of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center pb-2 border-b border-neutral-100 dark:border-neutral-800 text-xs font-bold text-neutral-400 uppercase">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 gap-1 mt-2">
                {monthDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);

                  // Tasks on this day
                  const dayTasks = tasks.filter((t) => t.due_date === dayStr);
                  const completedTasksCount = dayTasks.filter((t) => t.status === 'Completed').length;
                  const overdueCount = dayTasks.filter(
                    (t) => t.status === 'Pending' && isBefore(parseISO(dayStr), todayDate)
                  ).length;

                  // Habits completed on this day
                  const completedHabitsCount = habitLogs.filter(
                    (l) => l.log_date === dayStr && l.completed
                  ).length;

                  return (
                    <div
                      key={dayStr}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[76px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                          : 'border-neutral-100 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700'
                      } ${!isCurrentMonth ? 'opacity-40 bg-neutral-50/30 dark:bg-neutral-900/10' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>

                        {overdueCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Overdue task" />
                        )}
                      </div>

                      {/* Dots / Pills for activities */}
                      <div className="space-y-1 mt-1">
                        {dayTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded-sm truncate ${
                              t.status === 'Completed'
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 line-through'
                                : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                            }`}
                          >
                            {t.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <span className="text-[9px] text-neutral-400 font-semibold pl-1">
                            +{dayTasks.length - 2} more
                          </span>
                        )}
                        {completedHabitsCount > 0 && (
                          <div className="flex items-center gap-1 text-[9px] text-amber-500 font-medium pl-1">
                            <Sparkles className="w-2.5 h-2.5" /> {completedHabitsCount} habits
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-neutral-100 dark:border-neutral-800 text-xs font-bold text-neutral-400 uppercase">
                {weekDays.map((d) => (
                  <div
                    key={d.toString()}
                    onClick={() => setSelectedDate(d)}
                    className={`p-2 rounded-xl cursor-pointer ${
                      isSameDay(d, selectedDate)
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600'
                        : ''
                    }`}
                  >
                    <span>{format(d, 'EEE')}</span>
                    <span className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                      {format(d, 'd')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 min-h-[300px]">
                {weekDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const dayTasks = tasks.filter((t) => t.due_date === dayStr);
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <div
                      key={dayStr}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-1.5 cursor-pointer ${
                        isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`text-xs p-1.5 rounded-lg leading-tight truncate ${
                            t.status === 'Completed'
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 line-through'
                              : 'bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 font-medium'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length === 0 && (
                        <div className="text-[10px] text-neutral-300 dark:text-neutral-600 text-center pt-8">
                          Free
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day View */}
          {viewMode === 'day' && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Detailed timeline for {format(currentDate, 'MMMM d, yyyy')}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  icon={Plus}
                >
                  Add Task
                </Button>
              </div>

              <div className="space-y-2">
                {tasks
                  .filter((t) => t.due_date === format(currentDate, 'yyyy-MM-dd'))
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTask(task.id)}>
                          {task.status === 'Completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-300" />
                          )}
                        </button>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              task.status === 'Completed'
                                ? 'line-through text-neutral-400'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {task.title}
                          </p>
                          <span className="text-xs text-neutral-400">
                            {task.due_time || 'No specific time'} • {task.estimated_minutes} mins
                          </span>
                        </div>
                      </div>
                      <Badge variant={task.priority === 'High' ? 'danger' : 'neutral'} size="xs">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>

        {/* Selected Date Inspector Side Card */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Selected Day Inspector
              </span>
              <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {format(selectedDate, 'EEEE, MMM do')}
              </h4>
            </div>

            <button
              onClick={() => {
                setEditingTask({
                  due_date: selectedDateStr,
                });
                setIsTaskModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 transition-colors"
              title="Add task on this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Activities list for selected day */}
          <div className="space-y-4 mt-3 flex-1 overflow-y-auto max-h-[460px]">
            {/* Tasks section */}
            <div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                Tasks ({selectedDateTasks.length})
              </span>
              {selectedDateTasks.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No tasks due on this date.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateTasks.map((t) => {
                    const category = getCategory(t.category_id);
                    return (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/20 flex items-start justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button onClick={() => toggleTask(t.id)} className="mt-0.5">
                            {t.status === 'Completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-neutral-300" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-semibold truncate ${
                                t.status === 'Completed'
                                  ? 'line-through text-neutral-400'
                                  : 'text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              {t.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {category && <Badge color={category.color} size="xs">{category.name}</Badge>}
                              <Badge variant={t.priority === 'High' ? 'danger' : 'neutral'} size="xs">{t.priority}</Badge>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          className="text-xs font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          Edit
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Habits completed on selected day */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                Habit Logs ({selectedDateHabitLogs.length})
              </span>
              {selectedDateHabitLogs.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No habit logs recorded for this day.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedDateHabitLogs.map((log) => {
                    const habit = habits.find((h) => h.id === log.habit_id);
                    if (!habit) return null;
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/30 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <HabitIcon name={habit.icon} className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                            {habit.name}
                          </span>
                        </div>
                        <span className={`font-semibold ${log.completed ? 'text-emerald-500' : 'text-neutral-400'}`}>
                          {log.completed ? '✓ Completed' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Focus sessions on selected day */}
            {selectedDateFocusSessions.length > 0 && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                  Focus Sessions ({selectedDateFocusSessions.length})
                </span>
                <div className="space-y-1.5">
                  {selectedDateFocusSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/30 text-xs"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{session.duration_minutes}m Focus Session</span>
                      </div>
                      <span className="text-neutral-400 text-[10px]">
                        {session.completed_at ? format(parseISO(session.completed_at), 'HH:mm') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Task Modal for creating or editing tasks directly from calendar */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
        categories={categories}
        goals={goals}
      />
    </div>
  );
};
