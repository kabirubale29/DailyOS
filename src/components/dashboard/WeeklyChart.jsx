import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { format, subDays, parseISO, isSameDay } from 'date-fns';

export const WeeklyChart = ({ tasks = [], habitLogs = [] }) => {
  // Generate last 7 days data
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const day = subDays(today, i);
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayName = format(day, 'EEE'); // Mon, Tue, etc.

    // Tasks completed on this day
    const completedTasksCount = tasks.filter((t) => {
      if (t.status !== 'Completed') return false;
      if (t.completed_at) {
        return isSameDay(parseISO(t.completed_at), day);
      }
      return t.due_date === dateStr;
    }).length;

    // Habits completed on this day
    const completedHabitsCount = habitLogs.filter((l) => {
      return l.log_date === dateStr && l.completed;
    }).length;

    data.push({
      date: dateStr,
      day: dayName,
      tasks: completedTasksCount,
      habits: completedHabitsCount,
    });
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#131926] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-3 text-xs">
          <p className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{label}</p>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium">
            Tasks: {payload[0]?.value || 0} completed
          </p>
          <p className="text-amber-500 font-medium">
            Habits: {payload[1]?.value || 0} completed
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            width={24}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
            formatter={(value) => (
              <span className="text-neutral-600 dark:text-neutral-400 capitalize">{value}</span>
            )}
          />
          <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tasks" />
          <Bar dataKey="habits" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Habits" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
