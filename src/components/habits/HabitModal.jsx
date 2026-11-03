import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/FormInputs';
import { HABIT_ICONS, HabitIcon } from '../common/HabitIcon';
import { format } from 'date-fns';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
];

const WEEKDAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export const HabitModal = ({ isOpen, onClose, habit = null, onSave }) => {
  const isEditing = Boolean(habit && habit.id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Sparkles',
    color: '#6366f1',
    habit_type: 'boolean',
    frequency_type: 'daily',
    scheduled_days: [0, 1, 2, 3, 4, 5, 6],
    target_value: 1,
    target_unit: 'session',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    reminder_time: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        icon: habit.icon || 'Sparkles',
        color: habit.color || '#6366f1',
        habit_type: habit.habit_type || 'boolean',
        frequency_type: habit.frequency_type || 'daily',
        scheduled_days: habit.scheduled_days || [0, 1, 2, 3, 4, 5, 6],
        target_value: habit.target_value || 1,
        target_unit: habit.target_unit || 'session',
        start_date: habit.start_date || format(new Date(), 'yyyy-MM-dd'),
        end_date: habit.end_date || '',
        reminder_time: habit.reminder_time || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'Sparkles',
        color: '#6366f1',
        habit_type: 'boolean',
        frequency_type: 'daily',
        scheduled_days: [0, 1, 2, 3, 4, 5, 6],
        target_value: 1,
        target_unit: 'session',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        reminder_time: '',
      });
    }
    setErrors({});
  }, [habit, isOpen]);

  const handleFrequencyChange = (freq) => {
    let days = [0, 1, 2, 3, 4, 5, 6];
    if (freq === 'weekdays') {
      days = [1, 2, 3, 4, 5];
    }
    setFormData({ ...formData, frequency_type: freq, scheduled_days: days });
  };

  const toggleDay = (dayVal) => {
    const current = [...formData.scheduled_days];
    const idx = current.indexOf(dayVal);
    if (idx >= 0) {
      if (current.length === 1) return; // Must have at least 1 day
      current.splice(idx, 1);
    } else {
      current.push(dayVal);
      current.sort((a, b) => a - b);
    }
    setFormData({ ...formData, scheduled_days: current, frequency_type: 'custom_weekly' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Habit name is required' });
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'Create New Habit'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Daily Habit autofills if creating new */}
        {!isEditing && (
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Quick Daily Habit Presets (Click to autofill)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Drink 3L Water', type: 'numeric', target: 3, unit: 'litres', icon: 'Droplets', color: '#0ea5e9' },
                { name: 'Read 20 Pages', type: 'boolean', target: 1, unit: 'session', icon: 'BookOpen', color: '#3b82f6' },
                { name: 'Deep Work Coding', type: 'duration', target: 90, unit: 'minutes', icon: 'Zap', color: '#6366f1' },
                { name: '50 Push-ups', type: 'count', target: 50, unit: 'reps', icon: 'Flame', color: '#ef4444' },
                { name: 'Morning Meditation', type: 'duration', target: 10, unit: 'minutes', icon: 'Smile', color: '#10b981' },
                { name: 'No Screens Before Bed', type: 'boolean', target: 1, unit: 'session', icon: 'Moon', color: '#8b5cf6' },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      name: p.name,
                      description: `Daily habit: ${p.name}`,
                      habit_type: p.type,
                      frequency_type: 'daily',
                      scheduled_days: [0, 1, 2, 3, 4, 5, 6],
                      target_value: p.target,
                      target_unit: p.unit,
                      color: p.color,
                      icon: p.icon,
                    })
                  }
                  className="px-2.5 py-1 text-xs rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Habit Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Read 20 pages or Drink 3L water"
          error={errors.name}
          autoFocus
        />

        <Textarea
          label="Why is this habit important?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Explain your motivation or implementation cue..."
          rows={2}
        />

        {/* Frequency Schedule Segmented Selector */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Frequency Schedule
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'daily', label: '📅 Daily (Every day)' },
              { id: 'weekdays', label: '💼 Weekdays (Mon-Fri)' },
              { id: 'custom_weekly', label: '⚙️ Custom Days' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFrequencyChange(f.id)}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                  formData.frequency_type === f.id
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500'
                    : 'border-neutral-200 dark:border-neutral-750 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Habit Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Habit Tracking Type"
            value={formData.habit_type}
            onChange={(e) => setFormData({ ...formData, habit_type: e.target.value })}
          >
            <option value="boolean">Boolean (Done / Not Done)</option>
            <option value="numeric">Numeric (e.g. 3 Litres water)</option>
            <option value="duration">Duration (e.g. 120 Minutes coding)</option>
            <option value="count">Count (e.g. 30 Push-ups)</option>
          </Select>

          {formData.habit_type !== 'boolean' ? (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label="Target Goal"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                min="1"
              />
              <Input
                label="Unit"
                value={formData.target_unit}
                onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                placeholder="litres, reps, etc."
              />
            </div>
          ) : (
            <div className="flex flex-col justify-end pb-1 text-xs text-neutral-400">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Simple Check-off</span>
              <span>Mark complete or incomplete each day.</span>
            </div>
          )}
        </div>

        {/* Scheduled Days Selector */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Scheduled Days of Week
          </label>
          <div className="flex items-center gap-2">
            {WEEKDAYS.map((day) => {
              const isSelected = formData.scheduled_days.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target value & unit if not boolean */}
        {formData.habit_type !== 'boolean' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Target Goal Value"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
              min="1"
            />
            <Input
              label="Target Unit"
              value={formData.target_unit}
              onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
              placeholder="e.g. litres, minutes, pages, reps"
            />
          </div>
        )}

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Habit Icon
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {Object.keys(HABIT_ICONS).slice(0, 14).map((iconKey) => {
              const isSelected = formData.icon === iconKey;
              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconKey })}
                  className={`p-2 rounded-xl transition-all shrink-0 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 ring-2 ring-indigo-500'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <HabitIcon name={iconKey} className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Theme Color
          </label>
          <div className="flex items-center gap-2.5">
            {PRESET_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setFormData({ ...formData, color: col })}
                className={`w-6 h-6 rounded-full transition-all ${
                  formData.color === col ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
          </div>
        </div>

        {/* Dates and Reminders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
          <Input
            type="time"
            label="Reminder Time (Optional)"
            value={formData.reminder_time}
            onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
