import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/FormInputs';
import { useData } from '../../contexts/DataContext';
import { CheckSquare, Sparkles, Target, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export const QuickAddModal = ({ isOpen, onClose, initialTab = 'task' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { createTask, createHabit, createGoal, createJournalEntry, categories } = useData();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Task form state
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    due_time: '',
    priority: 'Medium',
    category_id: '',
    estimated_minutes: 30,
    recurrence_rule: 'None',
  });

  // Habit form state
  const [habitData, setHabitData] = useState({
    name: '',
    description: '',
    habit_type: 'boolean',
    frequency_type: 'daily',
    target_value: 1,
    target_unit: 'session',
    color: '#6366f1',
    icon: 'Sparkles',
  });

  // Goal form state
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    category: 'Personal',
    target_date: '',
  });

  // Journal form state
  const [journalData, setJournalData] = useState({
    title: '',
    content: '',
    mood: 'Good',
    tags: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;
    setLoading(true);
    await createTask(taskData);
    setLoading(false);
    setTaskData({
      title: '',
      description: '',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      due_time: '',
      priority: 'Medium',
      category_id: '',
      estimated_minutes: 30,
      recurrence_rule: 'None',
    });
    onClose();
  };

  const handleSubmitHabit = async (e) => {
    e.preventDefault();
    if (!habitData.name.trim()) return;
    setLoading(true);
    await createHabit({
      ...habitData,
      scheduled_days: habitData.frequency_type === 'weekdays' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6],
    });
    setLoading(false);
    setHabitData({
      name: '',
      description: '',
      habit_type: 'boolean',
      frequency_type: 'daily',
      target_value: 1,
      target_unit: 'session',
      color: '#6366f1',
      icon: 'Sparkles',
    });
    onClose();
  };

  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    if (!goalData.title.trim()) return;
    setLoading(true);
    await createGoal(goalData);
    setLoading(false);
    setGoalData({
      title: '',
      description: '',
      category: 'Personal',
      target_date: '',
    });
    onClose();
  };

  const handleSubmitJournal = async (e) => {
    e.preventDefault();
    if (!journalData.title.trim()) return;
    setLoading(true);
    await createJournalEntry(journalData);
    setLoading(false);
    setJournalData({
      title: '',
      content: '',
      mood: 'Good',
      tags: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Create" maxWidth="max-w-lg">
      {/* Tabs */}
      <div className="flex border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4 gap-2">
        <button
          onClick={() => setActiveTab('task')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'task'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Task
        </button>
        <button
          onClick={() => setActiveTab('habit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'habit'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Habit
        </button>
        <button
          onClick={() => setActiveTab('goal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'goal'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Target className="w-3.5 h-3.5" /> Goal
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'journal'
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Journal
        </button>
      </div>

      {/* Task Tab Form */}
      {activeTab === 'task' && (
        <form onSubmit={handleSubmitTask} className="space-y-4">
          <Input
            label="Task Title *"
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            placeholder="e.g. Design weekly retrospective notes"
            required
            autoFocus
          />
          <Textarea
            label="Description (Optional)"
            value={taskData.description}
            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
            placeholder="Additional context or links..."
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Due Date"
              value={taskData.due_date}
              onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
            />
            <Input
              type="time"
              label="Due Time"
              value={taskData.due_time}
              onChange={(e) => setTaskData({ ...taskData, due_time: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Priority"
              value={taskData.priority}
              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
            <Select
              label="Category"
              value={taskData.category_id}
              onChange={(e) => setTaskData({ ...taskData, category_id: e.target.value })}
            >
              <option value="">General</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              label="Est. Min"
              value={taskData.estimated_minutes}
              onChange={(e) => setTaskData({ ...taskData, estimated_minutes: e.target.value })}
              min="5"
              step="5"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Task
            </Button>
          </div>
        </form>
      )}

      {/* Habit Tab Form */}
      {activeTab === 'habit' && (
        <form onSubmit={handleSubmitHabit} className="space-y-4">
          {/* Quick Daily Habit Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Popular Daily Habits (Click to autofill)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Drink 3L Water', type: 'numeric', target: 3, unit: 'litres', icon: 'Droplets', color: '#0ea5e9' },
                { name: 'Read 20 Pages', type: 'boolean', target: 1, unit: 'session', icon: 'BookOpen', color: '#3b82f6' },
                { name: 'Deep Work Coding', type: 'duration', target: 60, unit: 'minutes', icon: 'Zap', color: '#6366f1' },
                { name: '50 Push-ups', type: 'count', target: 50, unit: 'reps', icon: 'Flame', color: '#ef4444' },
                { name: '10m Meditation', type: 'duration', target: 10, unit: 'minutes', icon: 'Smile', color: '#10b981' },
                { name: 'No Screens Before Bed', type: 'boolean', target: 1, unit: 'session', icon: 'Moon', color: '#8b5cf6' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setHabitData({
                      name: preset.name,
                      description: `Daily habit: ${preset.name}`,
                      habit_type: preset.type,
                      frequency_type: 'daily',
                      target_value: preset.target,
                      target_unit: preset.unit,
                      color: preset.color,
                      icon: preset.icon,
                    })
                  }
                  className="px-2.5 py-1 text-xs rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Daily Habit Name *"
            value={habitData.name}
            onChange={(e) => setHabitData({ ...habitData, name: e.target.value })}
            placeholder="e.g. Read 20 pages or Drink 3L water"
            required
            autoFocus
          />
          <Textarea
            label="Why this habit matters"
            value={habitData.description}
            onChange={(e) => setHabitData({ ...habitData, description: e.target.value })}
            placeholder="Motivation or routine trigger..."
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Habit Type"
              value={habitData.habit_type}
              onChange={(e) => setHabitData({ ...habitData, habit_type: e.target.value })}
            >
              <option value="boolean">Boolean (Yes/No)</option>
              <option value="numeric">Numeric (e.g. Litres)</option>
              <option value="duration">Duration (e.g. Minutes)</option>
              <option value="count">Count (e.g. Reps)</option>
            </Select>
            <Select
              label="Frequency"
              value={habitData.frequency_type}
              onChange={(e) => setHabitData({ ...habitData, frequency_type: e.target.value })}
            >
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays (Mon-Fri)</option>
            </Select>
          </div>
          {habitData.habit_type !== 'boolean' && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label="Target Value"
                value={habitData.target_value}
                onChange={(e) => setHabitData({ ...habitData, target_value: e.target.value })}
                min="1"
              />
              <Input
                label="Target Unit"
                value={habitData.target_unit}
                onChange={(e) => setHabitData({ ...habitData, target_unit: e.target.value })}
                placeholder="e.g. litres, reps, minutes"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Habit
            </Button>
          </div>
        </form>
      )}

      {/* Goal Tab Form */}
      {activeTab === 'goal' && (
        <form onSubmit={handleSubmitGoal} className="space-y-4">
          <Input
            label="Goal Title *"
            value={goalData.title}
            onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
            placeholder="e.g. Master TypeScript and Cloud Systems"
            required
            autoFocus
          />
          <Textarea
            label="Goal Description"
            value={goalData.description}
            onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
            placeholder="Define the clear target outcome..."
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={goalData.category}
              onChange={(e) => setGoalData({ ...goalData, category: e.target.value })}
            >
              <option value="Projects">Projects</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Fitness">Fitness</option>
              <option value="Study">Study</option>
            </Select>
            <Input
              type="date"
              label="Target Date"
              value={goalData.target_date}
              onChange={(e) => setGoalData({ ...goalData, target_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Goal
            </Button>
          </div>
        </form>
      )}

      {/* Journal Tab Form */}
      {activeTab === 'journal' && (
        <form onSubmit={handleSubmitJournal} className="space-y-4">
          <Input
            label="Entry Title *"
            value={journalData.title}
            onChange={(e) => setJournalData({ ...journalData, title: e.target.value })}
            placeholder="e.g. Reflections on deep work & morning momentum"
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Today's Mood"
              value={journalData.mood}
              onChange={(e) => setJournalData({ ...journalData, mood: e.target.value })}
            >
              <option value="Excellent">⚡ Excellent</option>
              <option value="Good">✨ Good</option>
              <option value="Neutral">🌱 Neutral</option>
              <option value="Bad">🌧️ Bad</option>
              <option value="Terrible">🌪️ Terrible</option>
            </Select>
            <Input
              label="Tags (comma separated)"
              value={journalData.tags}
              onChange={(e) => setJournalData({ ...journalData, tags: e.target.value })}
              placeholder="e.g. Focus, Fitness, Gratitude"
            />
          </div>
          <Textarea
            label="Written Reflection"
            value={journalData.content}
            onChange={(e) => setJournalData({ ...journalData, content: e.target.value })}
            placeholder="What went well today? What could be improved?"
            rows={4}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Entry
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
