// hooks/useResizableTextarea.ts
// A simple hook to add resize functionality to any textarea

import { useState, useCallback, RefObject } from 'react';

interface UseResizableTextareaOptions {
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
}

interface UseResizableTextareaReturn {
  height: number;
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent | React.TouchEvent) => void;
  containerStyle: React.CSSProperties;
}

export const useResizableTextarea = (
  options: UseResizableTextareaOptions = {}
): UseResizableTextareaReturn => {
  const {
    minHeight = 80,
    maxHeight = 600,
    initialHeight = 120,
  } = options;

  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startHeight = height;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();
      const currentY = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientY
        : (moveEvent as MouseEvent).clientY;
      
      const newHeight = Math.min(
        maxHeight,
        Math.max(minHeight, startHeight + (currentY - startY))
      );
      setHeight(newHeight);
    };

    const handleEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [height, minHeight, maxHeight]);

  return {
    height,
    isResizing,
    handleResizeStart,
    containerStyle: { height },
  };
};

export default useResizableTextarea;
