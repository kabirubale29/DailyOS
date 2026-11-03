import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  Edit2,
  Trash2,
  Smile,
  Frown,
  Meh,
  Zap,
  CloudRain,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { JournalModal } from '../components/journal/JournalModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { format, parseISO } from 'date-fns';

const MOOD_META = {
  Excellent: { label: 'Excellent', icon: '⚡', color: '#6366f1', badge: 'primary' },
  Good: { label: 'Good', icon: '✨', color: '#10b981', badge: 'success' },
  Neutral: { label: 'Neutral', icon: '🌱', color: '#f59e0b', badge: 'warning' },
  Bad: { label: 'Bad', icon: '🌧️', color: '#f97316', badge: 'neutral' },
  Terrible: { label: 'Terrible', icon: '🌪️', color: '#ef4444', badge: 'danger' },
};

export const Journal = () => {
  const { journalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      if (selectedMood !== 'all' && entry.mood !== selectedMood) return false;
      if (selectedDateFilter && entry.entry_date !== selectedDateFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = entry.title?.toLowerCase().includes(q);
        const inContent = entry.content?.toLowerCase().includes(q);
        const inTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inTags) return false;
      }

      return true;
    }).sort((a, b) => (b.entry_date || '').localeCompare(a.entry_date || ''));
  }, [journalEntries, selectedMood, selectedDateFilter, searchQuery]);

  const handleSave = async (formData) => {
    if (editingEntry) {
      await updateJournalEntry(editingEntry.id, formData);
      setEditingEntry(null);
    } else {
      await createJournalEntry(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (entryToDelete) {
      await deleteJournalEntry(entryToDelete.id);
      setEntryToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Daily Journal
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Capture daily reflections, cognitive insights, energy levels, and personal milestones.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingEntry(null);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          New Reflection
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections, thoughts, tags..."
            className="w-full bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Mood Filter */}
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Moods</option>
            <option value="Excellent">⚡ Excellent</option>
            <option value="Good">✨ Good</option>
            <option value="Neutral">🌱 Neutral</option>
            <option value="Bad">🌧️ Bad</option>
            <option value="Terrible">🌪️ Terrible</option>
          </select>

          {/* Date Picker Filter */}
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
          />

          {selectedDateFilter && (
            <button
              onClick={() => setSelectedDateFilter('')}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Entries Timeline List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <EmptyState
            title="No journal entries found"
            description="Start documenting your thoughts, highlights, and daily learning."
            actionLabel="Write First Entry"
            onAction={() => {
              setEditingEntry(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          filteredEntries.map((entry) => {
            const mood = MOOD_META[entry.mood] || MOOD_META.Good;

            return (
              <Card key={entry.id} className="p-6 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={entry.mood}>
                      {mood.icon}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {entry.entry_date ? format(parseISO(entry.entry_date), 'EEEE, MMMM d, yyyy') : ''}
                        </span>
                        <span>&bull;</span>
                        <Badge variant={mood.badge} size="xs">
                          {entry.mood}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingEntry(entry);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Edit entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEntryToDelete(entry)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content reflection body */}
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-4 leading-relaxed whitespace-pre-line">
                  {entry.content}
                </p>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                    <Tag className="w-3 h-3 text-neutral-400" />
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      <JournalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        entry={editingEntry}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Journal Entry"
        message={`Are you sure you want to permanently delete "${entryToDelete?.title}"?`}
        confirmText="Delete Entry"
      />
    </div>
  );
};
