import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckSquare, Sparkles, Target, BookOpen, ArrowRight, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { tasks, habits, goals, journalEntries } = useData();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredTasks = cleanQuery
    ? tasks.filter((t) => t.title.toLowerCase().includes(cleanQuery) || t.description?.toLowerCase().includes(cleanQuery)).slice(0, 5)
    : [];

  const filteredHabits = cleanQuery
    ? habits.filter((h) => h.name.toLowerCase().includes(cleanQuery) || h.description?.toLowerCase().includes(cleanQuery)).slice(0, 5)
    : [];

  const filteredGoals = cleanQuery
    ? goals.filter((g) => g.title.toLowerCase().includes(cleanQuery) || g.description?.toLowerCase().includes(cleanQuery)).slice(0, 5)
    : [];

  const filteredJournal = cleanQuery
    ? journalEntries.filter((j) => j.title.toLowerCase().includes(cleanQuery) || j.content?.toLowerCase().includes(cleanQuery)).slice(0, 5)
    : [];

  const hasResults =
    filteredTasks.length > 0 ||
    filteredHabits.length > 0 ||
    filteredGoals.length > 0 ||
    filteredJournal.length > 0;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in">
        {/* Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, habits, goals, journal entries..."
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-sm">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2">
          {!cleanQuery ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              Type to search across everything in DailyOS...
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              No matching results found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tasks */}
              {filteredTasks.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1 block">
                    Tasks
                  </span>
                  {filteredTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelect('/tasks')}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer text-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate text-neutral-800 dark:text-neutral-200">{t.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Habits */}
              {filteredHabits.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1 block">
                    Habits
                  </span>
                  {filteredHabits.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => handleSelect('/habits')}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer text-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="truncate text-neutral-800 dark:text-neutral-200">{h.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Goals */}
              {filteredGoals.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1 block">
                    Goals
                  </span>
                  {filteredGoals.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => handleSelect('/goals')}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer text-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate text-neutral-800 dark:text-neutral-200">{g.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Journal */}
              {filteredJournal.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1 block">
                    Journal
                  </span>
                  {filteredJournal.map((j) => (
                    <div
                      key={j.id}
                      onClick={() => handleSelect('/journal')}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer text-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="truncate text-neutral-800 dark:text-neutral-200">{j.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
