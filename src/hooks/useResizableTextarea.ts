// hooks/useResizableTextarea.ts
// A simple hook to add resize functionality to any textarea (supports both width and height)

import { useState, useCallback } from 'react';

interface UseResizableTextareaOptions {
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  initialWidth?: number;
  resizeDirection?: 'vertical' | 'horizontal' | 'both';
}

interface UseResizableTextareaReturn {
  height: number;
  width: number | undefined;
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent | React.TouchEvent) => void;
  containerStyle: React.CSSProperties;
  setHeight: (h: number) => void;
  setWidth: (w: number) => void;
}

export const useResizableTextarea = (
  options: UseResizableTextareaOptions = {}
): UseResizableTextareaReturn => {
  const {
    minHeight = 80,
    maxHeight = 600,
    initialHeight = 120,
    minWidth = 300,
    maxWidth = 1200,
    initialWidth,
    resizeDirection = 'vertical',
  } = options;

  const [height, setHeight] = useState(initialHeight);
  const [width, setWidth] = useState<number | undefined>(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startHeight = height;
    const startWidth = width || minWidth;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();
      const currentY = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientY
        : (moveEvent as MouseEvent).clientY;
      const currentX = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientX
        : (moveEvent as MouseEvent).clientX;
      
      if (resizeDirection === 'vertical' || resizeDirection === 'both') {
        const newHeight = Math.min(
          maxHeight,
          Math.max(minHeight, startHeight + (currentY - startY))
        );
        setHeight(newHeight);
      }
      
      if (resizeDirection === 'horizontal' || resizeDirection === 'both') {
        const newWidth = Math.min(
          maxWidth,
          Math.max(minWidth, startWidth + (currentX - startX))
        );
        setWidth(newWidth);
      }
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

    document.body.style.cursor = resizeDirection === 'both' ? 'nwse-resize' : 
      resizeDirection === 'horizontal' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [height, width, minHeight, maxHeight, minWidth, maxWidth, resizeDirection]);

  const containerStyle: React.CSSProperties = {
    height,
    ...(width !== undefined && { width }),
  };

  return {
    height,
    width,
    isResizing,
    handleResizeStart,
    containerStyle,
    setHeight,
    setWidth,
  };
};

export default useResizableTextarea;
