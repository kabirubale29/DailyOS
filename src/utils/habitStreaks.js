import { format, subDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

/**
 * Calculates streak metrics for a habit respecting scheduled days.
 * 
 * @param {Object} habit - Habit object containing scheduled_days, start_date, etc.
 * @param {Array} logs - Array of habit log records
 * @returns {Object} { currentStreak, longestStreak, totalCompletions, completionRate, weeklyConsistency, monthlyConsistency }
 */
export function calculateHabitStats(habit, logs = []) {
  if (!habit) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completionRate: 0,
      weeklyConsistency: 0,
      monthlyConsistency: 0,
    };
  }

  const scheduledDays = Array.isArray(habit.scheduled_days) 
    ? habit.scheduled_days 
    : [0, 1, 2, 3, 4, 5, 6];

  // Map logs by date string 'YYYY-MM-DD'
  const logMap = new Map();
  logs.forEach((log) => {
    if (log.habit_id === habit.id) {
      logMap.set(log.log_date, log);
    }
  });

  const today = startOfDay(new Date());
  const todayStr = format(today, 'yyyy-MM-dd');
  const habitStartDate = habit.start_date ? startOfDay(parseISO(habit.start_date)) : subDays(today, 60);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = today;
  let hasBroken = false;

  // Check today first
  const todayDayOfWeek = today.getDay();
  const isTodayScheduled = scheduledDays.includes(todayDayOfWeek);
  const todayLog = logMap.get(todayStr);
  const isTodayCompleted = todayLog && todayLog.completed;

  if (isTodayScheduled && isTodayCompleted) {
    currentStreak += 1;
    checkDate = subDays(today, 1);
  } else if (!isTodayScheduled) {
    // If today is not scheduled, streak can still be alive from yesterday
    checkDate = subDays(today, 1);
  } else {
    // Today is scheduled but not completed yet. 
    // Since today is ongoing, check if yesterday was completed.
    checkDate = subDays(today, 1);
  }

  // Check backwards from checkDate
  const maxLookbackDays = 365;
  let iterations = 0;

  while (!hasBroken && iterations < maxLookbackDays) {
    if (isBefore(checkDate, habitStartDate)) break;

    const dayOfWeek = checkDate.getDay();
    const dateStr = format(checkDate, 'yyyy-MM-dd');

    if (scheduledDays.includes(dayOfWeek)) {
      const log = logMap.get(dateStr);
      if (log && log.completed) {
        currentStreak += 1;
      } else {
        // Scheduled day was missed -> streak breaks!
        hasBroken = true;
        break;
      }
    }
    // If not scheduled, skip day without breaking streak

    checkDate = subDays(checkDate, 1);
    iterations += 1;
  }

  // 2. Calculate Longest Streak & Total completions
  let longestStreak = 0;
  let tempStreak = 0;
  let totalCompletions = 0;
  let totalScheduledDays = 0;

  // Iterate chronologically from start date to today
  let scanDate = habitStartDate;
  while (!isAfter(scanDate, today)) {
    const dayOfWeek = scanDate.getDay();
    const dateStr = format(scanDate, 'yyyy-MM-dd');

    if (scheduledDays.includes(dayOfWeek)) {
      totalScheduledDays += 1;
      const log = logMap.get(dateStr);
      if (log && log.completed) {
        totalCompletions += 1;
        tempStreak += 1;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        // Missed scheduled day
        tempStreak = 0;
      }
    }
    scanDate = subDays(scanDate, -1); // add 1 day
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 3. Completion Rate (%)
  const completionRate = totalScheduledDays > 0 
    ? Math.round((totalCompletions / totalScheduledDays) * 100) 
    : 0;

  // 4. Weekly Consistency (last 7 scheduled days)
  let past7Scheduled = 0;
  let past7Completed = 0;
  for (let i = 0; i < 7; i++) {
    const d = subDays(today, i);
    if (scheduledDays.includes(d.getDay())) {
      past7Scheduled += 1;
      const l = logMap.get(format(d, 'yyyy-MM-dd'));
      if (l && l.completed) past7Completed += 1;
    }
  }
  const weeklyConsistency = past7Scheduled > 0 
    ? Math.round((past7Completed / past7Scheduled) * 100) 
    : 100;

  // 5. Monthly Consistency (last 30 scheduled days)
  let past30Scheduled = 0;
  let past30Completed = 0;
  for (let i = 0; i < 30; i++) {
    const d = subDays(today, i);
    if (scheduledDays.includes(d.getDay())) {
      past30Scheduled += 1;
      const l = logMap.get(format(d, 'yyyy-MM-dd'));
      if (l && l.completed) past30Completed += 1;
    }
  }
  const monthlyConsistency = past30Scheduled > 0 
    ? Math.round((past30Completed / past30Scheduled) * 100) 
    : 100;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate,
    weeklyConsistency,
    monthlyConsistency,
  };
}
