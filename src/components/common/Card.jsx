import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className = '', hover = false, onClick, style }) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={twMerge(
        'bg-white dark:bg-[#131926] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-5 shadow-xs transition-all duration-200',
        hover && 'hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
