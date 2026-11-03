import React, { useState, useMemo } from 'react';
import {
  Plus,
  Flame,
  Award,
  Calendar,
  Sparkles,
  Archive,
  PauseCircle,
  PlayCircle,
  MoreVertical,
  Edit2,
  Trash2,
  BarChart2,
  CheckCircle2,
  Circle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { HabitIcon } from '../components/common/HabitIcon';
import { HabitModal } from '../components/habits/HabitModal';
import { HabitDetailModal } from '../components/habits/HabitDetailModal';
import { HabitLogValueModal } from '../components/habits/HabitLogValueModal';
import { GrowthPresetsModal } from '../components/habits/GrowthPresetsModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import confetti from 'canvas-confetti';

export const Habits = () => {
  const {
    habitsWithStats,
    habitLogs,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitActive,
    toggleHabitArchive,
    logHabit,
  } = useData();

  // View state: 'active' or 'archived'
  const [viewFilter, setViewFilter] = useState('active');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [inspectingHabit, setInspectingHabit] = useState(null);
  const [loggingHabitData, setLoggingHabitData] = useState(null); // { habit, dateStr, currentValue, currentNotes }
  const [habitToDelete, setHabitToDelete] = useState(null);

  // 7-day window state (ending at today, or navigatable)
  const [windowOffset, setWindowOffset] = useState(0); // 0 means ends today

  const past7Days = useMemo(() => {
    const days = [];
    const baseDate = subDays(new Date(), windowOffset * 7);
    for (let i = 6; i >= 0; i--) {
      const d = subDays(baseDate, i);
      days.push({
        date: d,
        dateStr: format(d, 'yyyy-MM-dd'),
        dayName: format(d, 'EEE'),
        dayNum: format(d, 'd'),
        dayOfWeek: d.getDay(),
        isToday: isSameDay(d, new Date()),
      });
    }
    return days;
  }, [windowOffset]);

  const displayedHabits = useMemo(() => {
    return habitsWithStats.filter((h) => {
      if (viewFilter === 'active') return !h.is_archived;
      if (viewFilter === 'archived') return h.is_archived;
      return true;
    });
  }, [habitsWithStats, viewFilter]);

  const handleCellClick = (habit, day) => {
    const isScheduled = (habit.scheduled_days || [0, 1, 2, 3, 4, 5, 6]).includes(day.dayOfWeek);
    if (!isScheduled) return;

    const existingLog = habitLogs.find(
      (l) => l.habit_id === habit.id && l.log_date === day.dateStr
    );

    if (habit.habit_type === 'boolean') {
      const nextCompleted = !(existingLog && existingLog.completed);
      if (nextCompleted) {
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
      }
      logHabit(habit.id, day.dateStr, nextCompleted ? 1 : 0, nextCompleted);
    } else {
      // Open value entry modal
      setLoggingHabitData({
        habit,
        dateStr: day.dateStr,
        currentValue: existingLog ? existingLog.actual_value : 0,
        currentNotes: existingLog ? existingLog.notes : '',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  const handleSaveHabit = async (formData) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, formData);
      setEditingHabit(null);
    } else {
      await createHabit(formData);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Habit Tracker
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Build sustainable daily systems through streak accountability and flexible frequencies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewFilter === 'active'
                  ? 'bg-white dark:bg-[#131926] text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewFilter('archived')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewFilter === 'archived'
                  ? 'bg-white dark:bg-[#131926] text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Archived
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPresetsModalOpen(true)}
            icon={Sparkles}
          >
            Growth Library
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingHabit({ frequency_type: 'daily', scheduled_days: [0, 1, 2, 3, 4, 5, 6] });
              setIsCreateModalOpen(true);
            }}
            icon={Plus}
            className="bg-amber-500 hover:bg-amber-600 border-amber-500 text-white shadow-xs"
          >
            + Daily Habit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingHabit(null);
              setIsCreateModalOpen(true);
            }}
            icon={Plus}
          >
            Custom Habit
          </Button>
        </div>
      </div>

      {/* 7-Day Matrix Navigation Controller */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            7-Day Completion Matrix
          </span>
          {windowOffset !== 0 && (
            <button
              onClick={() => setWindowOffset(0)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Jump to Current Week
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWindowOffset((prev) => prev + 1)}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Previous 7 Days"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-1">
            {past7Days[0].dateStr} — {past7Days[6].dateStr}
          </span>
          <button
            onClick={() => setWindowOffset((prev) => Math.max(0, prev - 1))}
            disabled={windowOffset === 0}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
            title="Next 7 Days"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* D. 7-Day Completion Grid Card */}
      <Card className="p-0 overflow-x-auto">
        {displayedHabits.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {viewFilter === 'archived' ? 'No archived habits' : 'No habits tracked yet'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              Build your personal routines with atomic daily habits or select from our curated growth library.
            </p>
            {viewFilter === 'active' && (
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingHabit({ frequency_type: 'daily', scheduled_days: [0, 1, 2, 3, 4, 5, 6] });
                    setIsCreateModalOpen(true);
                  }}
                  icon={Plus}
                  className="bg-amber-500 hover:bg-amber-600 border-amber-500 text-white"
                >
                  + Add Daily Habit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPresetsModalOpen(true)}
                  icon={Sparkles}
                >
                  Browse Growth Library
                </Button>
              </div>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
                <th className="py-3.5 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider w-72">
                  Habit
                </th>
                <th className="py-3.5 px-2 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center w-24">
                  Streak
                </th>
                {past7Days.map((d) => (
                  <th
                    key={d.dateStr}
                    className={`py-3.5 px-2 text-center text-xs font-semibold w-14 ${
                      d.isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
                    }`}
                  >
                    <span className="block text-[10px] uppercase">{d.dayName}</span>
                    <span className="text-xs">{d.dayNum}</span>
                  </th>
                ))}
                <th className="py-3.5 px-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right w-24">
                  Rate
                </th>
                <th className="py-3.5 px-3 text-right w-16" />
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {displayedHabits.map((habit) => {
                const scheduledDays = Array.isArray(habit.scheduled_days)
                  ? habit.scheduled_days
                  : [0, 1, 2, 3, 4, 5, 6];

                return (
                  <tr
                    key={habit.id}
                    className={`hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors ${
                      !habit.is_active ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Habit Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                          style={{
                            backgroundColor: `${habit.color}15`,
                            color: habit.color,
                          }}
                          onClick={() => setInspectingHabit(habit)}
                        >
                          <HabitIcon name={habit.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setInspectingHabit(habit)}
                            className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-left block"
                          >
                            {habit.name}
                          </button>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-neutral-400">
                              {habit.frequency_type === 'weekdays'
                                ? 'Mon - Fri'
                                : habit.frequency_type === 'daily'
                                ? 'Daily'
                                : 'Custom'}
                            </span>
                            {habit.habit_type !== 'boolean' && (
                              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                                ({habit.target_value} {habit.target_unit})
                              </span>
                            )}
                            {!habit.is_active && (
                              <Badge variant="neutral" size="xs">
                                Paused
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-2 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-xs text-rose-500">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{habit.stats?.currentStreak || 0}</span>
                      </div>
                    </td>

                    {/* 7-Day Grid Columns */}
                    {past7Days.map((day) => {
                      const isScheduled = scheduledDays.includes(day.dayOfWeek);
                      const log = habitLogs.find(
                        (l) => l.habit_id === habit.id && l.log_date === day.dateStr
                      );
                      const isCompleted = log && log.completed;

                      return (
                        <td key={day.dateStr} className="py-3.5 px-1 text-center">
                          {!isScheduled ? (
                            <span
                              title="Rest day / not scheduled"
                              className="inline-block w-7 h-7 rounded-lg text-neutral-300 dark:text-neutral-700 text-xs font-bold leading-7 select-none"
                            >
                              &bull;
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCellClick(habit, day)}
                              title={
                                isCompleted
                                  ? `Completed! ${log?.actual_value ? `(${log.actual_value} ${habit.target_unit})` : ''}`
                                  : `Click to log ${habit.name}`
                              }
                              className={`w-7 h-7 rounded-lg font-bold text-xs transition-all flex items-center justify-center mx-auto active:scale-95 ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                                  : day.isToday
                                  ? 'border-2 border-dashed border-amber-400 hover:border-amber-500 text-amber-500 hover:bg-amber-50/50'
                                  : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                              }`}
                            >
                              {isCompleted ? '✓' : ''}
                            </button>
                          )}
                        </td>
                      );
                    })}

                    {/* Weekly Completion Rate */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {habit.stats?.weeklyConsistency || 0}%
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setInspectingHabit(habit)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title="View stats & history"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingHabit(habit);
                            setIsCreateModalOpen(true);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title="Edit habit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleHabitActive(habit.id)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title={habit.is_active ? 'Pause habit' : 'Resume habit'}
                        >
                          {habit.is_active ? (
                            <PauseCircle className="w-3.5 h-3.5" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleHabitArchive(habit.id)}
                          className="p-1.5 text-neutral-400 hover:text-amber-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title={habit.is_archived ? 'Unarchive' : 'Archive habit'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setHabitToDelete(habit)}
                          className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onSave={handleSaveHabit}
      />

      {/* Habit Detail & History Modal */}
      <HabitDetailModal
        isOpen={Boolean(inspectingHabit)}
        onClose={() => setInspectingHabit(null)}
        habit={inspectingHabit}
        logs={habitLogs}
      />

      {/* Habit Numeric / Duration / Count Log Modal */}
      {loggingHabitData && (
        <HabitLogValueModal
          isOpen={Boolean(loggingHabitData)}
          onClose={() => setLoggingHabitData(null)}
          habit={loggingHabitData.habit}
          dateStr={loggingHabitData.dateStr}
          currentValue={loggingHabitData.currentValue}
          currentNotes={loggingHabitData.currentNotes}
          onSave={logHabit}
        />
      )}

      {/* Personal Growth Habit Presets Modal */}
      <GrowthPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        existingHabitNames={habitsWithStats.map((h) => h.name)}
        onAddHabit={createHabit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(habitToDelete)}
        onClose={() => setHabitToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Habit"
        message={`Are you sure you want to permanently delete "${habitToDelete?.name}"? Historical logs will also be removed. (If you just want to take a break, consider Archiving or Pausing instead).`}
        confirmText="Delete Habit"
      />
    </div>
  );
};
