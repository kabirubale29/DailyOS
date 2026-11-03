import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/FormInputs';
import { format } from 'date-fns';

const MOODS = [
  { value: 'Excellent', label: '⚡ Excellent (High energy & focused)' },
  { value: 'Good', label: '✨ Good (Productive & clear)' },
  { value: 'Neutral', label: '🌱 Neutral (Steady & calm)' },
  { value: 'Bad', label: '🌧️ Bad (Low energy or stressed)' },
  { value: 'Terrible', label: '🌪️ Terrible (Overwhelmed or drained)' },
];

export const JournalModal = ({ isOpen, onClose, entry = null, onSave }) => {
  const isEditing = Boolean(entry);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'Good',
    tags: '',
    entry_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        mood: entry.mood || 'Good',
        tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : (entry.tags || ''),
        entry_date: entry.entry_date || format(new Date(), 'yyyy-MM-dd'),
      });
    } else {
      setFormData({
        title: '',
        content: '',
        mood: 'Good',
        tags: '',
        entry_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setErrors({});
  }, [entry, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }
    if (!formData.content.trim()) {
      setErrors({ content: 'Reflection content is required' });
      return;
    }

    onSave({
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Journal Entry' : 'New Journal Reflection'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Entry Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Breakthrough on system design & deep work clarity"
          error={errors.title}
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Entry Date"
            value={formData.entry_date}
            onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
          />

          <Select
            label="Day's Mood"
            value={formData.mood}
            onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
          >
            {MOODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Tags (comma-separated)"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g. DeepWork, Health, Architecture, Wins"
        />

        <Textarea
          label="Written Reflection *"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="What insights did you gain today? What wins occurred? What could you optimize tomorrow?"
          rows={6}
          error={errors.content}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Save Reflection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
