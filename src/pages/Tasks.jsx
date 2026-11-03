import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  Repeat,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TaskModal } from '../components/tasks/TaskModal';
import { CategoryModal } from '../components/tasks/CategoryModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { format, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
import confetti from 'canvas-confetti';

export const Tasks = () => {
  const {
    tasks,
    categories,
    goals,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    duplicateTask,
    reorderTasks,
    createCategory,
    deleteCategory,
    todayStats,
  } = useData();

  // Filters & State
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'upcoming', 'pending', 'completed', 'overdue'
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('due_date'); // 'due_date', 'priority', 'created_at', 'alpha'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayDate = startOfDay(new Date());

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Primary Filter
      if (activeFilter === 'today' && t.due_date !== todayStr) return false;
      if (activeFilter === 'pending' && t.status === 'Completed') return false;
      if (activeFilter === 'completed' && t.status !== 'Completed') return false;
      if (activeFilter === 'overdue') {
        if (t.status === 'Completed' || !t.due_date) return false;
        return isBefore(parseISO(t.due_date), todayDate);
      }
      if (activeFilter === 'upcoming') {
        if (t.status === 'Completed' || !t.due_date) return false;
        return !isBefore(parseISO(t.due_date), todayDate) && t.due_date !== todayStr;
      }

      // 2. Priority Filter
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      // 3. Category Filter
      if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      if (sortBy === 'priority') {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      }
      if (sortBy === 'created_at') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, activeFilter, selectedPriority, selectedCategory, sortBy, searchQuery, todayStr, todayDate]);

  // Operations
  const handleToggle = async (task) => {
    if (task.status !== 'Completed') {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }
    await toggleTask(task.id);
  };

  const handleSaveTask = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask.id, formData);
      setEditingTask(null);
    } else {
      await createTask(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredTasks.length) return;

    const copy = [...tasks];
    const taskA = filteredTasks[index];
    const taskB = filteredTasks[targetIdx];

    const idxA = copy.findIndex((t) => t.id === taskA.id);
    const idxB = copy.findIndex((t) => t.id === taskB.id);

    if (idxA >= 0 && idxB >= 0) {
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      await reorderTasks(copy);
    }
  };

  const getCategory = (catId) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Task Management
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Organize, prioritize, and conquer your daily commitments.
          </p>
        </div>

        {/* Time Estimation for today */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 block text-[10px] uppercase font-bold">
              Today's Estimated Time
            </span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">
              {Math.floor(todayStats.totalEstimatedMinutes / 60)}h {todayStats.totalEstimatedMinutes % 60}m
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            icon={Layers}
          >
            Categories
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            icon={Plus}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col gap-3">
        {/* Main Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'today', label: 'Today', count: todayStats.tasksTotalCount },
            { id: 'upcoming', label: 'Upcoming', count: tasks.filter((t) => t.status !== 'Completed' && t.due_date && t.due_date > todayStr).length },
            { id: 'pending', label: 'Pending', count: tasks.filter((t) => t.status === 'Pending').length },
            { id: 'completed', label: 'Completed', count: tasks.filter((t) => t.status === 'Completed').length },
            { id: 'overdue', label: 'Overdue', count: tasks.filter((t) => t.status === 'Pending' && t.due_date && t.due_date < todayStr).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.id
                    ? 'bg-neutral-700 text-neutral-200 dark:bg-neutral-300 dark:text-neutral-800'
                    : 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filter & Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto">
            {/* Priority filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="due_date">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created_at">Sort by Created</option>
              <option value="alpha">Sort Alphabetically</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <Card className="p-0 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks match criteria"
            description="Try adjusting your filters or search query, or create a brand new task."
            actionLabel="Add Task"
            onAction={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          filteredTasks.map((task, index) => {
            const category = getCategory(task.category_id);
            const isCompleted = task.status === 'Completed';
            const isOverdue =
              !isCompleted && task.due_date && isBefore(parseISO(task.due_date), todayDate);

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group ${
                  isOverdue ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                }`}
              >
                {/* Left: Reorder & Status Checkbox & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Reorder up/down */}
                  <div className="hidden sm:flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === filteredTasks.length - 1}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Checkbox */}
                  <button
                    onClick={() => handleToggle(task)}
                    className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-50 dark:fill-indigo-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400" />
                    )}
                  </button>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium tracking-tight truncate ${
                          isCompleted
                            ? 'line-through text-neutral-400 dark:text-neutral-500'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.recurrence_rule && task.recurrence_rule !== 'None' && (
                        <span
                          title={`Repeats: ${task.recurrence_rule}`}
                          className="text-[10px] text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded-sm"
                        >
                          <Repeat className="w-2.5 h-2.5" /> {task.recurrence_rule}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
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
                      {task.due_date && (
                        <span
                          className={`text-[11px] flex items-center gap-1 font-medium ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {task.due_date === todayStr ? 'Today' : task.due_date}
                          {task.due_time ? ` at ${task.due_time}` : ''}
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimated_minutes}m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => duplicateTask(task.id)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Duplicate task"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </Card>

      {/* Task Create/Edit Modal */}
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

      {/* Category Manager Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreate={createCategory}
        onDelete={deleteCategory}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
      />
    </div>
  );
};
