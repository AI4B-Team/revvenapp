// components/ui/ResizeHandle.tsx
// A simple resize handle component that can be added to any container

import React from 'react';

interface ResizeHandleProps {
  onResizeStart: (e: React.MouseEvent | React.TouchEvent) => void;
  isResizing?: boolean;
  variant?: 'default' | 'subtle' | 'prominent';
  className?: string;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResizeStart,
  isResizing = false,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: `
      text-slate-500 
      hover:text-slate-400
      ${isResizing ? 'text-slate-300' : ''}
    `,
    subtle: `
      text-slate-600 
      hover:text-slate-500
      ${isResizing ? 'text-slate-400' : ''}
    `,
    prominent: `
      text-slate-400 
      hover:text-slate-300
      bg-slate-700/50 
      hover:bg-slate-600/50
      rounded
      ${isResizing ? 'text-slate-200 bg-slate-600/50' : ''}
    `,
  };

  return (
    <div
      onMouseDown={onResizeStart}
      onTouchStart={onResizeStart}
      className={`
        absolute bottom-1 right-1
        w-6 h-6
        flex items-center justify-center
        cursor-nwse-resize
        transition-colors duration-150
        select-none
        touch-none
        ${variantStyles[variant]}
        ${className}
      `}
      role="slider"
      aria-label="Resize handle"
      aria-orientation="vertical"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="pointer-events-none"
      >
        <path
          d="M10 2L2 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 6L6 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default ResizeHandle;
