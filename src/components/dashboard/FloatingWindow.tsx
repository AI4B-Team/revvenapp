import { useRef, useState, useEffect, useCallback } from 'react';
import { X, ArrowUp } from 'lucide-react';
import { FloatingWindow as FloatingWindowType, useTabs } from '@/contexts/TabsContext';
import InboxPanel from './InboxPanel';
import CalendarApp from './CalendarApp';

interface FloatingWindowProps {
  window: FloatingWindowType;
}

const FloatingWindow = ({ window: win }: FloatingWindowProps) => {
  const { closeWindow, dockWindow, focusWindow, updateWindowPosition, updateWindowSize } = useTabs();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [localPosition, setLocalPosition] = useState(win.position);
  const [localSize, setLocalSize] = useState(win.size);

  useEffect(() => {
    if (!isDragging) setLocalPosition(win.position);
    if (!isResizing) setLocalSize(win.size);
  }, [win.position, win.size, isDragging, isResizing]);

  const IconComponent = win.icon;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    e.preventDefault();
    setIsDragging(true);
    focusWindow(win.id);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setLocalPosition({ x: Math.max(0, e.clientX - dragOffset.x), y: Math.max(60, e.clientY - dragOffset.y) });
    }
    if (isResizing) {
      setLocalSize({
        width: Math.max(400, resizeStart.width + e.clientX - resizeStart.x),
        height: Math.max(300, resizeStart.height + e.clientY - resizeStart.y),
      });
    }
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      updateWindowPosition(win.id, localPosition);
    }
    if (isResizing) {
      setIsResizing(false);
      updateWindowSize(win.id, localSize);
    }
  }, [isDragging, isResizing, win.id, localPosition, localSize, updateWindowPosition, updateWindowSize]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    focusWindow(win.id);
    setResizeStart({ x: e.clientX, y: e.clientY, width: localSize.width, height: localSize.height });
  };

  const renderContent = () => {
    switch (win.name) {
      case 'Inbox':
        return <InboxPanel />;
      case 'Calendar':
        return <CalendarApp />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {win.name} content coming soon...
          </div>
        );
    }
  };

  return (
    <div
      ref={windowRef}
      className={`fixed bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col ${
        win.isFocused ? 'ring-2 ring-primary/50' : ''
      }`}
      style={{
        left: localPosition.x,
        top: localPosition.y,
        width: localSize.width,
        height: localSize.height,
        zIndex: win.zIndex,
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md ${win.color} flex items-center justify-center`}>
            <IconComponent size={14} className="text-white" />
          </div>
          <span className="text-sm font-medium text-foreground">{win.name}</span>
        </div>
        <div className="window-controls flex items-center gap-1">
          {/* Dock Back Button */}
          <button
            onClick={() => dockWindow(win.id)}
            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            title="Dock to tab bar"
          >
            <ArrowUp size={14} />
          </button>
          {/* Close Button */}
          <button
            onClick={() => closeWindow(win.id)}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
        onMouseDown={handleResizeStart}
      >
        <svg className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground" viewBox="0 0 16 16">
          <path d="M14 14L14 8M14 14L8 14M14 14L6 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 14L14 11M14 14L11 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 14L10 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

export default FloatingWindow;
