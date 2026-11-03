import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/FormInputs';

export const HabitLogValueModal = ({
  isOpen,
  onClose,
  habit,
  dateStr,
  currentValue = 0,
  currentNotes = '',
  onSave,
}) => {
  const [value, setValue] = useState(currentValue);
  const [notes, setNotes] = useState(currentNotes);

  useEffect(() => {
    setValue(currentValue || '');
    setNotes(currentNotes || '');
  }, [currentValue, currentNotes, isOpen]);

  if (!habit) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(value) || 0;
    const isCompleted = num >= Number(habit.target_value);
    onSave(habit.id, dateStr, num, isCompleted, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Progress: ${habit.name}`}
      subtitle={`Date: ${dateStr} • Target: ${habit.target_value} ${habit.target_unit}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="number"
          label={`Amount Completed (${habit.target_unit})`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          step="any"
          min="0"
          required
          autoFocus
        />

        <Textarea
          label="Optional Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reflect on this session..."
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Log
          </Button>
        </div>
      </form>
    </Modal>
  );
};
