import React from 'react';

export const CircularProgress = ({
  percentage = 0,
  size = 110,
  strokeWidth = 9,
  color = '#6366f1',
  trackColor = 'currentColor',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="text-neutral-100 dark:text-neutral-800"
          stroke={trackColor === 'currentColor' ? undefined : trackColor}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {children ? children : (
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
};
