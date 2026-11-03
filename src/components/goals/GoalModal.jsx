import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/FormInputs';
import { format } from 'date-fns';

export const GoalModal = ({ isOpen, onClose, goal = null, onSave }) => {
  const isEditing = Boolean(goal);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Projects',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    target_date: '',
    status: 'In Progress',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'Projects',
        start_date: goal.start_date || format(new Date(), 'yyyy-MM-dd'),
        target_date: goal.target_date || '',
        status: goal.status || 'In Progress',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Projects',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        target_date: '',
        status: 'In Progress',
      });
    }
    setErrors({});
  }, [goal, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors({ title: 'Goal title is required' });
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Long-Term Goal' : 'Create New Goal'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Master Full-Stack Architecture & Distributed Systems"
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Why this goal matters & key criteria"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Outline the scope, milestones, and definition of done..."
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Projects">Projects</option>
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Fitness">Fitness</option>
            <option value="Study">Study</option>
            <option value="Other">Other</option>
          </Select>

          <Select
            label="Current Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
          <Input
            type="date"
            label="Target Completion Date"
            value={formData.target_date}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
