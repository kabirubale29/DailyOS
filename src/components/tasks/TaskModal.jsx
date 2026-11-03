import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/FormInputs';
import { format } from 'date-fns';

export const TaskModal = ({ isOpen, onClose, task = null, onSave, categories = [], goals = [] }) => {
  const isEditing = Boolean(task);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    due_time: '',
    priority: 'Medium',
    category_id: '',
    goal_id: '',
    estimated_minutes: 30,
    recurrence_rule: 'None',
    status: 'Pending',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date || format(new Date(), 'yyyy-MM-dd'),
        due_time: task.due_time || '',
        priority: task.priority || 'Medium',
        category_id: task.category_id || '',
        goal_id: task.goal_id || '',
        estimated_minutes: task.estimated_minutes || 30,
        recurrence_rule: task.recurrence_rule || 'None',
        status: task.status || 'Pending',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        due_time: '',
        priority: 'Medium',
        category_id: categories[0]?.id || '',
        goal_id: '',
        estimated_minutes: 30,
        recurrence_rule: 'None',
        status: 'Pending',
      });
    }
    setErrors({});
  }, [task, categories, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Implement user authentication flow"
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Description & Context"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Subtasks, checklist, or documentation links..."
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Due Date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
          <Input
            type="time"
            label="Due Time (Optional)"
            value={formData.due_time}
            onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="High">High 🔴</option>
            <option value="Medium">Medium 🟡</option>
            <option value="Low">Low 🟢</option>
          </Select>

          <Select
            label="Category"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          >
            <option value="">No Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Input
            type="number"
            label="Est. Duration (Minutes)"
            value={formData.estimated_minutes}
            onChange={(e) => setFormData({ ...formData, estimated_minutes: e.target.value })}
            min="5"
            step="5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Recurring Task Schedule"
            value={formData.recurrence_rule}
            onChange={(e) => setFormData({ ...formData, recurrence_rule: e.target.value })}
          >
            <option value="None">None (One-time)</option>
            <option value="Daily">Every day</option>
            <option value="Weekdays">Selected weekdays (Mon-Fri)</option>
            <option value="Weekly">Every week</option>
            <option value="Monthly">Every month</option>
          </Select>

          <Select
            label="Associated Long-Term Goal"
            value={formData.goal_id}
            onChange={(e) => setFormData({ ...formData, goal_id: e.target.value })}
          >
            <option value="">None (Independent Task)</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
