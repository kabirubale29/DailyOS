import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/FormInputs';
import { Plus, Trash2, Tag } from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const CategoryModal = ({ isOpen, onClose, categories, onCreate, onDelete }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate({ name: name.trim(), color: selectedColor });
    setName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" maxWidth="max-w-md">
      {/* Existing Categories */}
      <div className="space-y-2 mb-6">
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
          Existing Categories
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {cat.name}
                </span>
              </div>
              <button
                onClick={() => onDelete(cat.id)}
                className="text-neutral-400 hover:text-rose-500 p-1 transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Category */}
      <form onSubmit={handleAdd} className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <Input
          label="New Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Design, Reading, Client"
        />

        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Pick Color
          </label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setSelectedColor(col)}
                className={`w-6 h-6 rounded-full transition-all ${
                  selectedColor === col ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
          <Button type="submit" disabled={!name.trim()} icon={Plus}>
            Add Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};
