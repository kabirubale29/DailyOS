import React from 'react';
import { twMerge } from 'tailwind-merge';

export const ProgressBar = ({
  progress = 0,
  max = 100,
  showLabel = false,
  label = '',
  size = 'md', // 'sm', 'md', 'lg'
  color = '#4f46e5',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((progress / max) * 100))) || 0;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={twMerge('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
          <span>{label}</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{percentage}%</span>
        </div>
      )}
      <div className={twMerge('w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};
