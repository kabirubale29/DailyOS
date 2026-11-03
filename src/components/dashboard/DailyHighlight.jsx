import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Edit3, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export const DailyHighlight = () => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `dailyos_highlight_${todayStr}`;

  const [highlight, setHighlight] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { text: '', completed: false };
    } catch {
      return { text: '', completed: false };
    }
  });

  const [isEditing, setIsEditing] = useState(!highlight.text);
  const [editText, setEditText] = useState(highlight.text);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(highlight));
    } catch (e) {
      console.error(e);
    }
  }, [highlight, storageKey]);

  const toggleComplete = () => {
    const nextCompleted = !highlight.completed;
    if (nextCompleted) {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
    }
    setHighlight((prev) => ({ ...prev, completed: nextCompleted }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setHighlight({ text: editText.trim(), completed: false });
    setIsEditing(false);
  };

  return (
    <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-indigo-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Target className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Today's #1 Non-Negotiable Win
          </span>
        </div>
        {!isEditing && highlight.text && (
          <button
            onClick={() => {
              setEditText(highlight.text);
              setIsEditing(true);
            }}
            className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> Change
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="What is the single most important task that makes today a win?"
            className="flex-1 bg-white dark:bg-[#131926] border border-amber-200 dark:border-amber-800/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            autoFocus
          />
          <button
            type="submit"
            disabled={!editText.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            Set Focus
          </button>
          {highlight.text && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-neutral-400 hover:text-neutral-600 px-2"
            >
              Cancel
            </button>
          )}
        </form>
      ) : (
        <div className="flex items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={toggleComplete}
              className="text-neutral-400 hover:text-amber-500 transition-colors shrink-0"
              title={highlight.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {highlight.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
              ) : (
                <Circle className="w-5 h-5 text-amber-500/70 hover:text-amber-500" />
              )}
            </button>
            <p
              className={`text-sm sm:text-base font-semibold tracking-tight truncate ${
                highlight.completed
                  ? 'line-through text-neutral-400 dark:text-neutral-500'
                  : 'text-neutral-900 dark:text-neutral-100'
              }`}
            >
              {highlight.text}
            </p>
          </div>

          {highlight.completed && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> High-Leverage Win!
            </span>
          )}
        </div>
      )}
    </div>
  );
};
