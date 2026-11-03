import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer as TimerIcon,
  Coffee,
  CheckCircle2,
  Sparkles,
  Settings as SettingsIcon,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CircularProgress } from '../components/common/CircularProgress';
import { Modal } from '../components/common/Modal';
import { Input, Select } from '../components/common/FormInputs';
import confetti from 'canvas-confetti';

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn('AudioContext not supported', e);
  }
};

export const Focus = () => {
  const { tasks, focusSessions, logFocusSession, todayStats } = useData();

  // Durations in minutes
  const [durations, setDurations] = useState({
    focus: 25,
    short_break: 5,
    long_break: 15,
  });

  // Timer State
  const [sessionType, setSessionType] = useState('focus'); // 'focus', 'short_break', 'long_break'
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [completedCycles, setCompletedCycles] = useState(0); // 4 focus blocks -> long break
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Accurate timestamp-based timing
  const [endTime, setEndTime] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(durations.focus * 60);

  // Sync remaining seconds if durations change while paused
  useEffect(() => {
    if (!isRunning) {
      setRemainingSeconds(durations[sessionType] * 60);
    }
  }, [sessionType, durations, isRunning]);

  // Main countdown effect driven by real wall-clock timestamps
  useEffect(() => {
    let interval = null;

    if (isRunning && endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.round((endTime - now) / 1000));
        setRemainingSeconds(diffSeconds);

        if (diffSeconds <= 0) {
          clearInterval(interval);
          handleSessionComplete();
        }
      }, 500);
    }

    return () => clearInterval(interval);
  }, [isRunning, endTime]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    setEndTime(null);

    if (soundEnabled) {
      playBeep();
    }
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });

    // Save session to database if it was a focus session
    if (sessionType === 'focus') {
      await logFocusSession({
        taskId: selectedTaskId || null,
        sessionType: 'focus',
        durationMinutes: durations.focus,
      });

      const nextCycle = completedCycles + 1;
      setCompletedCycles(nextCycle);

      // Transition to break
      if (nextCycle % 4 === 0) {
        setSessionType('long_break');
        setRemainingSeconds(durations.long_break * 60);
      } else {
        setSessionType('short_break');
        setRemainingSeconds(durations.short_break * 60);
      }
    } else {
      // Transition back to focus
      setSessionType('focus');
      setRemainingSeconds(durations.focus * 60);
    }
  };

  const handleStart = () => {
    const end = Date.now() + remainingSeconds * 1000;
    setEndTime(end);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    setEndTime(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setEndTime(null);
    setRemainingSeconds(durations[sessionType] * 60);
  };

  const handleSkip = () => {
    handleReset();
    if (sessionType === 'focus') {
      setSessionType(completedCycles % 4 === 3 ? 'long_break' : 'short_break');
    } else {
      setSessionType('focus');
    }
  };

  const switchMode = (mode) => {
    handleReset();
    setSessionType(mode);
    setRemainingSeconds(durations[mode] * 60);
  };

  // Formatting
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDurationSeconds = durations[sessionType] * 60;
  const progressPercent = Math.round(
    ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100
  );

  const pendingTasks = tasks.filter((t) => t.status === 'Pending');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Focus Mode
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Immerse in deep work blocks with Pomodoro intervals and task linking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 transition-colors"
            title={soundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            icon={SettingsIcon}
          >
            Timer Settings
          </Button>
        </div>
      </div>

      {/* Main Pomodoro Console */}
      <Card className="p-8 sm:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Session Type Switcher */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-2xl mb-8 text-xs font-bold">
          <button
            onClick={() => switchMode('focus')}
            className={`px-4 py-2 rounded-xl transition-all ${
              sessionType === 'focus'
                ? 'bg-white dark:bg-[#131926] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            ⚡ Focus ({durations.focus}m)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-4 py-2 rounded-xl transition-all ${
              sessionType === 'short_break'
                ? 'bg-white dark:bg-[#131926] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            ☕ Short Break ({durations.short_break}m)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-4 py-2 rounded-xl transition-all ${
              sessionType === 'long_break'
                ? 'bg-white dark:bg-[#131926] text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            🌴 Long Break ({durations.long_break}m)
          </button>
        </div>

        {/* Circular Display */}
        <div className="my-2">
          <CircularProgress
            percentage={progressPercent}
            size={260}
            strokeWidth={14}
            color={sessionType === 'focus' ? '#6366f1' : sessionType === 'short_break' ? '#10b981' : '#a855f7'}
          >
            <div className="text-center">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
                {timeFormatted}
              </span>
              <span className="block text-xs uppercase font-bold text-neutral-400 mt-2 tracking-wider">
                {sessionType === 'focus'
                  ? 'Deep Work'
                  : sessionType === 'short_break'
                  ? 'Recharge & Breathe'
                  : 'Rest & Stretch'}
              </span>
            </div>
          </CircularProgress>
        </div>

        {/* Linked Task Selector */}
        <div className="w-full max-w-sm mt-8 mb-6">
          <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 text-center">
            Focusing on Task:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 rounded-xl px-3 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center"
          >
            <option value="">(No specific task selected)</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Session</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Pause className="w-5 h-5 fill-white" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleSkip}
            className="p-3 rounded-2xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Skip to next session"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Cycle dots */}
        <div className="flex items-center gap-2 mt-8 text-xs text-neutral-400">
          <span>Cycle:</span>
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full transition-colors ${
                completedCycles % 4 > idx || (completedCycles > 0 && completedCycles % 4 === 0)
                  ? 'bg-indigo-600'
                  : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
          ))}
          <span className="ml-1 text-[11px] font-semibold">
            {completedCycles % 4}/4 completed
          </span>
        </div>
      </Card>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1 text-center">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Today's Focus Time
          </span>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {todayStats.todayFocusMinutes} mins
          </div>
          <span className="text-[11px] text-neutral-500">
            {todayStats.todayFocusSessionsCount} completed blocks
          </span>
        </Card>

        <Card className="p-4 space-y-1 text-center">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Total Focus Sessions
          </span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {focusSessions.filter((s) => s.status === 'completed' && s.session_type === 'focus').length}
          </div>
          <span className="text-[11px] text-neutral-500">All-time logged</span>
        </Card>

        <Card className="p-4 space-y-1 text-center">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
            Weekly Focus Time
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {Math.floor(todayStats.todayFocusMinutes * 3.5 / 60)}h {(todayStats.todayFocusMinutes * 3.5) % 60}m
          </div>
          <span className="text-[11px] text-neutral-500">7-day rolling window</span>
        </Card>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Customize Focus Durations"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Focus Session (Minutes)"
            value={durations.focus}
            onChange={(e) =>
              setDurations({ ...durations, focus: parseInt(e.target.value, 10) || 25 })
            }
            min="1"
            max="120"
          />
          <Input
            type="number"
            label="Short Break (Minutes)"
            value={durations.short_break}
            onChange={(e) =>
              setDurations({ ...durations, short_break: parseInt(e.target.value, 10) || 5 })
            }
            min="1"
            max="30"
          />
          <Input
            type="number"
            label="Long Break (Minutes)"
            value={durations.long_break}
            onChange={(e) =>
              setDurations({ ...durations, long_break: parseInt(e.target.value, 10) || 15 })
            }
            min="1"
            max="60"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              variant="primary"
              onClick={() => {
                setIsSettingsOpen(false);
                handleReset();
              }}
            >
              Apply Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
