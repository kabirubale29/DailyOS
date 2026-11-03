import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useData } from '../../contexts/DataContext';
import { Sunrise, Moon, Check, Sparkles, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export const DailyGrowthReflection = () => {
  const { createJournalEntry } = useData();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const hour = new Date().getHours();
  const isMorning = hour < 14;

  const [activeMode, setActiveMode] = useState(isMorning ? 'morning' : 'evening');

  // Morning Intention state
  const [intention, setIntention] = useState('');
  const [gratitude, setGratitude] = useState('');

  // Evening Reflection state
  const [win, setWin] = useState('');
  const [lesson, setLesson] = useState('');
  const [mood, setMood] = useState('Good');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveToJournal = async (e) => {
    e.preventDefault();
    if (activeMode === 'morning') {
      if (!intention.trim()) return;
      await createJournalEntry({
        title: `Morning Intention: ${intention.slice(0, 45)}...`,
        content: `🎯 Core Mindset / Intention:\n${intention}\n\n🙏 Grateful for:\n${gratitude || 'A fresh day with high cognitive focus.'}`,
        mood: 'Good',
        tags: ['MorningIntention', 'Mindset', 'Growth'],
        entry_date: todayStr,
      });
    } else {
      if (!win.trim()) return;
      await createJournalEntry({
        title: `Evening Review: ${win.slice(0, 45)}...`,
        content: `🏆 Today's Biggest Win:\n${win}\n\n💡 Key Lesson Learned:\n${lesson || 'Consistency compounded over days beats sporadic intensity.'}`,
        mood: mood,
        tags: ['EveningReflection', 'Wins', 'Lessons'],
        entry_date: todayStr,
      });
    }

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            {activeMode === 'morning' ? (
              <Sunrise className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Daily Growth Protocol
            </h3>
          </div>

          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMode('morning')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeMode === 'morning'
                  ? 'bg-white dark:bg-[#131926] text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Morning
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('evening')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeMode === 'evening'
                  ? 'bg-white dark:bg-[#131926] text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Evening
            </button>
          </div>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-2 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Reflection Saved to Your Journal!
            </p>
            <p className="text-[11px] text-neutral-400">
              Your personal growth timeline has been updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveToJournal} className="space-y-3 mt-3">
            {activeMode === 'morning' ? (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    What is your intention & mindset for today?
                  </label>
                  <input
                    type="text"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="e.g. Deep uninterrupted execution without social media"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    One thing you are genuinely grateful for:
                  </label>
                  <input
                    type="text"
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                    placeholder="e.g. Health, clear mind, and opportunity to build"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    What was your biggest win today?
                  </label>
                  <input
                    type="text"
                    value={win}
                    onChange={(e) => setWin(e.target.value)}
                    placeholder="e.g. Finished the full habit tracking module & worked out"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    One lesson or optimization for tomorrow:
                  </label>
                  <input
                    type="text"
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    placeholder="e.g. Block out the first 2 hours of the day before reading email"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-neutral-500">Day's Energy:</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    {['Excellent', 'Good', 'Neutral', 'Bad'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(m)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                          mood === m
                            ? 'bg-indigo-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" icon={BookOpen}>
                Save to Journal
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
};
