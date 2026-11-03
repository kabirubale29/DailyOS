import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { HabitIcon } from '../common/HabitIcon';
import { ProgressBar } from '../common/ProgressBar';
import {
  Flame,
  Award,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isAfter,
  parseISO,
  startOfDay,
  isSameDay,
} from 'date-fns';

export const HabitDetailModal = ({ isOpen, onClose, habit, logs = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!habit) return null;

  const scheduledDays = Array.isArray(habit.scheduled_days)
    ? habit.scheduled_days
    : [0, 1, 2, 3, 4, 5, 6];

  const logMap = new Map();
  logs.forEach((l) => {
    if (l.habit_id === habit.id) {
      logMap.set(l.log_date, l);
    }
  });

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get leading empty cells for day of week alignment
  const startDayOfWeek = monthStart.getDay(); // 0 is Sunday
  const leadingBlanks = Array.from({ length: startDayOfWeek });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Habit Consistency & History"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Habit Header Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
          >
            <HabitIcon name={habit.icon} className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {habit.name}
              </h3>
              <Badge color={habit.color} size="xs">
                {habit.habit_type}
              </Badge>
            </div>
            {habit.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                {habit.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
              <span>Target: {habit.target_value} {habit.target_unit}</span>
              <span>&bull;</span>
              <span>Started: {habit.start_date}</span>
            </div>
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Current Streak
            </span>
            <div className="flex items-center justify-center gap-1 mt-1 text-xl font-bold text-rose-500">
              <Flame className="w-4 h-4" />
              <span>{habit.stats?.currentStreak || 0}</span>
              <span className="text-xs font-normal text-neutral-400">days</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Longest Streak
            </span>
            <div className="flex items-center justify-center gap-1 mt-1 text-xl font-bold text-amber-500">
              <Award className="w-4 h-4" />
              <span>{habit.stats?.longestStreak || 0}</span>
              <span className="text-xs font-normal text-neutral-400">days</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Total Completions
            </span>
            <div className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {habit.stats?.totalCompletions || 0}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-center">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Completion Rate
            </span>
            <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {habit.stats?.completionRate || 0}%
            </div>
          </div>
        </div>

        {/* Consistency Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              <span>Weekly Consistency (Last 7 scheduled days)</span>
              <span>{habit.stats?.weeklyConsistency || 0}%</span>
            </div>
            <ProgressBar progress={habit.stats?.weeklyConsistency || 0} color="#6366f1" size="sm" />
          </div>

          <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              <span>Monthly Consistency (Last 30 scheduled days)</span>
              <span>{habit.stats?.monthlyConsistency || 0}%</span>
            </div>
            <ProgressBar progress={habit.stats?.monthlyConsistency || 0} color="#10b981" size="sm" />
          </div>
        </div>

        {/* F. Calendar History View */}
        <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Historical Calendar View
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar Day Labels */}
          <div className="grid grid-cols-7 gap-1.5 mt-3 text-center text-[10px] font-bold text-neutral-400 uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 mt-1.5">
            {leadingBlanks.map((_, idx) => (
              <div key={`blank_${idx}`} className="h-9" />
            ))}

            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isScheduled = scheduledDays.includes(day.getDay());
              const isFuture = isAfter(day, today);
              const isToday = isSameDay(day, today);
              const log = logMap.get(dateStr);
              const isCompleted = log && log.completed;

              // Visual state determination
              let statusClass = 'bg-neutral-50 dark:bg-neutral-800/30 text-neutral-400';
              let indicator = '';

              if (!isScheduled) {
                // Not scheduled
                statusClass = 'bg-transparent text-neutral-300 dark:text-neutral-700 border border-dashed border-neutral-200 dark:border-neutral-800';
                indicator = '•';
              } else if (isCompleted) {
                // Completed
                statusClass = 'bg-emerald-500 text-white font-bold shadow-xs';
                indicator = '✓';
              } else if (isFuture) {
                // Scheduled upcoming
                statusClass = 'border border-neutral-200 dark:border-neutral-700 text-neutral-400';
              } else if (isToday) {
                // Today pending
                statusClass = 'border-2 border-amber-400 text-amber-600 dark:text-amber-400 font-bold';
                indicator = '!';
              } else {
                // Missed scheduled day
                statusClass = 'bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400';
                indicator = '✕';
              }

              return (
                <div
                  key={dateStr}
                  title={`${dateStr} - ${
                    !isScheduled
                      ? 'Not scheduled'
                      : isCompleted
                      ? 'Completed'
                      : isFuture
                      ? 'Upcoming'
                      : 'Missed'
                  }`}
                  className={`h-9 rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${statusClass}`}
                >
                  <span className="text-[11px] leading-none">{format(day, 'd')}</span>
                  {indicator && (
                    <span className="text-[9px] leading-none font-bold mt-0.5">
                      {indicator}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-50 dark:bg-rose-950/40 text-rose-500 text-[9px] font-bold flex items-center justify-center">
                ✕
              </span>
              <span>Missed Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700" />
              <span>Upcoming</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-neutral-300 dark:border-neutral-700" />
              <span>Rest / Not Scheduled</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
