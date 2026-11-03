import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { HabitIcon } from '../common/HabitIcon';
import { Plus, Check, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const GROWTH_PRESETS = [
  {
    name: 'Deep Work Coding Block',
    description: '90 minutes of high-cognitive focus without notifications or distractions.',
    icon: 'Zap',
    color: '#6366f1',
    habit_type: 'duration',
    frequency_type: 'weekdays',
    scheduled_days: [1, 2, 3, 4, 5],
    target_value: 90,
    target_unit: 'minutes',
    category: 'Engineering Mastery',
  },
  {
    name: 'Read 20 Pages Non-Fiction',
    description: 'Read systems thinking, engineering, or high-performance literature.',
    icon: 'BookOpen',
    color: '#3b82f6',
    habit_type: 'boolean',
    frequency_type: 'daily',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6],
    target_value: 1,
    target_unit: 'session',
    category: 'Intellectual Growth',
  },
  {
    name: 'Daily Hydration (3 Litres)',
    description: 'Drink fresh water throughout the day for cognitive clarity.',
    icon: 'Droplets',
    color: '#0ea5e9',
    habit_type: 'numeric',
    frequency_type: 'daily',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6],
    target_value: 3,
    target_unit: 'litres',
    category: 'Physical Vitality',
  },
  {
    name: 'Functional Strength / Calisthenics',
    description: 'Push-ups, core conditioning, and posture alignment.',
    icon: 'Flame',
    color: '#ef4444',
    habit_type: 'count',
    frequency_type: 'daily',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6],
    target_value: 50,
    target_unit: 'reps',
    category: 'Physical Vitality',
  },
  {
    name: 'Screen-Free Bedtime Routine',
    description: 'Shut down all glowing displays 45 minutes prior to sleep.',
    icon: 'Moon',
    color: '#8b5cf6',
    habit_type: 'boolean',
    frequency_type: 'daily',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6],
    target_value: 1,
    target_unit: 'session',
    category: 'Recovery & Sleep',
  },
  {
    name: 'Evening Reflection & Day Close',
    description: 'Document 1 key win and 1 lesson learned before concluding the day.',
    icon: 'Sparkles',
    color: '#f59e0b',
    habit_type: 'boolean',
    frequency_type: 'daily',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6],
    target_value: 1,
    target_unit: 'session',
    category: 'Self-Awareness',
  },
];

export const GrowthPresetsModal = ({ isOpen, onClose, existingHabitNames = [], onAddHabit }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const handleAdd = async (preset) => {
    await onAddHabit({
      ...preset,
      start_date: todayStr,
      is_active: true,
      is_archived: false,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personal Growth Habit Library"
      subtitle="Select science-backed foundational routines to add to your daily operating system."
      maxWidth="max-w-xl"
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {GROWTH_PRESETS.map((preset) => {
          const isAlreadyAdded = existingHabitNames.some(
            (name) => name.toLowerCase() === preset.name.toLowerCase()
          );

          return (
            <div
              key={preset.name}
              className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${preset.color}15`, color: preset.color }}
                >
                  <HabitIcon name={preset.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {preset.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                    {preset.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 ml-3">
                {isAlreadyAdded ? (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Added
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => handleAdd(preset)}
                    icon={Plus}
                  >
                    Add
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4">
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
};
