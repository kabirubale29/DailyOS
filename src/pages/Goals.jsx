import React, { useState, useMemo } from 'react';
import {
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  ListTodo,
  Check,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { CircularProgress } from '../components/common/CircularProgress';
import { GoalModal } from '../components/goals/GoalModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { format, parseISO } from 'date-fns';
import confetti from 'canvas-confetti';

export const Goals = () => {
  const {
    goals,
    milestones,
    tasks,
    createGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    toggleTask,
  } = useData();

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Expanded goal IDs
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  // New milestone inline input map: { [goalId]: text }
  const [newMilestoneText, setNewMilestoneText] = useState({});

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
      return true;
    });
  }, [goals, statusFilter, categoryFilter]);

  const handleSaveGoal = async (formData) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, formData);
      setEditingGoal(null);
    } else {
      await createGoal(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (goalToDelete) {
      await deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
    }
  };

  const handleToggleMilestone = async (m) => {
    if (!m.is_completed) {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    }
    await toggleMilestone(m.id);
  };

  const handleAddMilestone = async (goalId) => {
    const text = newMilestoneText[goalId]?.trim();
    if (!text) return;
    await addMilestone(goalId, text);
    setNewMilestoneText({ ...newMilestoneText, [goalId]: '' });
  };

  const categories = useMemo(() => {
    const set = new Set(goals.map((g) => g.category).filter(Boolean));
    return Array.from(set);
  }, [goals]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Goal Management
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Break long-range vision down into concrete milestones and measurable daily progress.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          icon={Plus}
        >
          New Goal
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'In Progress', 'Completed', 'Not Started', 'Paused'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {status === 'all' ? 'All Goals' : status}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none self-end sm:self-auto"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredGoals.length === 0 ? (
          <EmptyState
            title="No goals found"
            description="Define your long-term roadmap and track milestones."
            actionLabel="Create Goal"
            onAction={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
          />
        ) : (
          filteredGoals.map((goal) => {
            const isExpanded = expandedGoalId === goal.id;
            const goalMilestones = milestones.filter((m) => m.goal_id === goal.id);
            const goalTasks = tasks.filter((t) => t.goal_id === goal.id);

            const completedMilestonesCount = goalMilestones.filter((m) => m.is_completed).length;
            const computedProgress = goalMilestones.length > 0
              ? Math.round((completedMilestonesCount / goalMilestones.length) * 100)
              : goal.progress || 0;

            const isDone = goal.status === 'Completed' || computedProgress === 100;

            return (
              <Card key={goal.id} className="p-5 transition-all">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                      <Target className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
                          {goal.title}
                        </h3>
                        <Badge
                          variant={
                            goal.status === 'Completed'
                              ? 'success'
                              : goal.status === 'In Progress'
                              ? 'primary'
                              : 'neutral'
                          }
                          size="xs"
                        >
                          {goal.status}
                        </Badge>
                        <Badge variant="neutral" size="xs">
                          {goal.category}
                        </Badge>
                      </div>

                      {goal.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                          {goal.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-400">
                        {goal.start_date && (
                          <span>Started: {format(parseISO(goal.start_date), 'MMM d, yyyy')}</span>
                        )}
                        {goal.target_date && (
                          <span>Target: {format(parseISO(goal.target_date), 'MMM d, yyyy')}</span>
                        )}
                        <span>
                          {goalMilestones.length} milestones &bull; {goalTasks.length} linked tasks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="w-32 sm:w-40">
                      <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        <span>Progress</span>
                        <span>{computedProgress}%</span>
                      </div>
                      <ProgressBar
                        progress={computedProgress}
                        color={isDone ? '#10b981' : '#6366f1'}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center gap-1 border-l border-neutral-100 dark:border-neutral-800 pl-3">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsGoalModalOpen(true);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ml-1"
                        title={isExpanded ? 'Collapse' : 'Expand milestones'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Milestones & Linked Tasks */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4 animate-fade-in">
                    {/* Milestones subsection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                          Milestones ({completedMilestonesCount}/{goalMilestones.length})
                        </span>
                      </div>

                      {/* Add milestone inline input */}
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={newMilestoneText[goal.id] || ''}
                          onChange={(e) =>
                            setNewMilestoneText({ ...newMilestoneText, [goal.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMilestone(goal.id);
                            }
                          }}
                          placeholder="Add milestone checkpoint... (press Enter)"
                          className="flex-1 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddMilestone(goal.id)}
                          disabled={!newMilestoneText[goal.id]?.trim()}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="space-y-1.5">
                        {goalMilestones.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-neutral-50/60 dark:bg-neutral-800/40 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button
                                onClick={() => handleToggleMilestone(m)}
                                className="text-neutral-400 hover:text-indigo-600 transition-colors"
                              >
                                {m.is_completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                                ) : (
                                  <Circle className="w-4 h-4 text-neutral-300" />
                                )}
                              </button>
                              <span
                                className={`truncate ${
                                  m.is_completed
                                    ? 'line-through text-neutral-400 dark:text-neutral-500 font-normal'
                                    : 'text-neutral-800 dark:text-neutral-200 font-medium'
                                }`}
                              >
                                {m.title}
                              </span>
                            </div>

                            <button
                              onClick={() => deleteMilestone(m.id)}
                              className="text-neutral-400 hover:text-rose-500 p-1"
                              title="Delete milestone"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {goalMilestones.length === 0 && (
                          <p className="text-xs text-neutral-400 italic">No milestones defined yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Linked Tasks subsection */}
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                        Linked Tasks ({goalTasks.length})
                      </span>
                      <div className="space-y-1.5">
                        {goalTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-neutral-50/40 dark:bg-neutral-800/20 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <button onClick={() => toggleTask(t.id)}>
                                {t.status === 'Completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-neutral-300" />
                                )}
                              </button>
                              <span
                                className={`truncate ${
                                  t.status === 'Completed'
                                    ? 'line-through text-neutral-400'
                                    : 'text-neutral-800 dark:text-neutral-200'
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>
                            <span className="text-neutral-400 text-[10px]">
                              {t.due_date || 'No date'}
                            </span>
                          </div>
                        ))}
                        {goalTasks.length === 0 && (
                          <p className="text-xs text-neutral-400 italic">
                            No tasks currently associated with this goal. Select this goal when creating tasks!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Goal Create/Edit Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={handleSaveGoal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to permanently delete "${goalToDelete?.title}"? Associated milestones will also be removed.`}
        confirmText="Delete Goal"
      />
    </div>
  );
};
