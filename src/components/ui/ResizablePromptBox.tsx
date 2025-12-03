// components/ui/ResizablePromptBox.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizablePromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxCharacters?: number;
  minHeight?: number;
  maxHeight?: number;
  minWidth?: number;
  className?: string;
  disabled?: boolean;
  showCharacterCount?: boolean;
  onSubmit?: () => void;
}

const ResizablePromptBox: React.FC<ResizablePromptBoxProps> = ({
  value,
  onChange,
  placeholder = 'Enter your prompt...',
  maxCharacters = 750000,
  minHeight = 120,
  maxHeight = 800,
  minWidth = 200,
  className = '',
  disabled = false,
  showCharacterCount = true,
  onSubmit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: minHeight });
  const [isResizing, setIsResizing] = useState(false);

  // Initialize dimensions
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: minHeight,
      });
    }
  }, [minHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width || containerRef.current?.offsetWidth || 0;
    const startHeight = dimensions.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(minWidth, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.min(
        maxHeight,
        Math.max(minHeight, startHeight + (moveEvent.clientY - startY))
      );

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dimensions, minHeight, maxHeight, minWidth]);

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startWidth = dimensions.width || containerRef.current?.offsetWidth || 0;
    const startHeight = dimensions.height;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      const newWidth = Math.max(minWidth, startWidth + (moveTouch.clientX - startX));
      const newHeight = Math.min(
        maxHeight,
        Math.max(minHeight, startHeight + (moveTouch.clientY - startY))
      );

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [dimensions, minHeight, maxHeight, minWidth]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const characterCount = value.length;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        width: dimensions.width > 0 ? dimensions.width : '100%',
        height: dimensions.height,
      }}
    >
      {/* Main Container */}
      <div
        className={`
          relative w-full h-full
          bg-[#0f1729] 
          border border-slate-700/50 
          rounded-xl
          transition-colors duration-200
          ${isResizing ? 'border-slate-500' : 'hover:border-slate-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full h-full
            bg-transparent
            text-slate-200 text-sm
            placeholder-slate-500
            p-4 pb-10
            resize-none
            focus:outline-none
            scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{ minHeight: minHeight - 40 }}
        />

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end px-4 py-2">
          {/* Character Count */}
          {showCharacterCount && (
            <span
              className={`
                text-xs tabular-nums
                ${isOverLimit ? 'text-red-400' : 'text-slate-500'}
              `}
            >
              {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()} characters
            </span>
          )}
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`
            absolute bottom-1 right-1
            w-6 h-6
            flex items-center justify-center
            cursor-nwse-resize
            group
            z-10
          `}
        >
          {/* Resize Icon - Two diagonal lines */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={`
              text-slate-500 
              transition-colors duration-200
              ${isResizing ? 'text-slate-300' : 'group-hover:text-slate-400'}
            `}
          >
            <path
              d="M10 2L2 10M10 6L6 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Resize indicator overlay */}
      {isResizing && (
        <div className="fixed inset-0 cursor-nwse-resize z-50" />
      )}
    </div>
  );
};

export default ResizablePromptBox;
