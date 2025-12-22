import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Check, MoreHorizontal, Pencil, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ScriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  deleted?: boolean;
  selected?: boolean;
  hidden?: boolean;
}

interface ScriptTextEditorProps {
  script: string;
  segments?: ScriptSegment[];
  onScriptChange?: (script: string) => void;
  onSegmentDelete?: (segmentId: string) => void;
  onSegmentExport?: (segmentId: string, text: string) => void;
  showDeleted?: boolean;
}

const ScriptTextEditor: React.FC<ScriptTextEditorProps> = ({
  script,
  segments: initialSegments,
  onScriptChange,
  onSegmentDelete,
  onSegmentExport,
  showDeleted = false,
}) => {
  // Parse script into segments with timestamps
  const [segments, setSegments] = useState<ScriptSegment[]>(() => {
    if (initialSegments) return initialSegments;
    
    // Auto-parse script into segments based on sentences
    const sentences = script.split(/(?<=[.!?])\s+/);
    let currentTime = 0;
    return sentences.map((text, index) => {
      const duration = Math.max(1, text.split(' ').length * 0.3); // ~0.3s per word
      const segment: ScriptSegment = {
        id: `segment-${index}`,
        text: text.trim(),
        startTime: currentTime,
        endTime: currentTime + duration,
        deleted: false,
        selected: false,
      };
      currentTime += duration + 0.2; // Small gap between segments
      return segment;
    });
  });

  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [keepOnlyMode, setKeepOnlyMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    return `${seconds.toFixed(2)}s`;
  };

  const handleSegmentClick = (segment: ScriptSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.shiftKey) {
      // Multi-select with shift
      setSelectedSegments(prev => {
        const next = new Set(prev);
        if (next.has(segment.id)) {
          next.delete(segment.id);
        } else {
          next.add(segment.id);
        }
        return next;
      });
    } else {
      // Single click opens edit mode directly
      setSelectedSegments(new Set([segment.id]));
      setEditingSegmentId(segment.id);
      setEditingText(segment.text);
    }
  };

  const handleEditSave = () => {
    if (!editingSegmentId) return;
    
    setSegments(prev =>
      prev.map(seg =>
        seg.id === editingSegmentId ? { ...seg, text: editingText } : seg
      )
    );
    
    // Update parent script
    const updatedScript = segments
      .map(seg => (seg.id === editingSegmentId ? editingText : seg.text))
      .filter(text => text)
      .join(' ');
    onScriptChange?.(updatedScript);
    
    setEditingSegmentId(null);
    setEditingText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditingSegmentId(null);
      setEditingText('');
    }
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(prev =>
      prev.map(seg =>
        seg.id === segmentId ? { ...seg, deleted: true } : seg
      )
    );
    onSegmentDelete?.(segmentId);
    toast.success('Sentence removed');
  };

  const handleHideSegment = (segmentId: string) => {
    setSegments(prev =>
      prev.map(seg =>
        seg.id === segmentId ? { ...seg, hidden: !seg.hidden } : seg
      )
    );
    toast.success('Line visibility toggled');
  };

  const handleEditClick = (segment: ScriptSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSegments(new Set([segment.id]));
    setEditingSegmentId(segment.id);
    setEditingText(segment.text);
  };

  const handleAddToSelection = (segmentId: string) => {
    setSelectedSegments(prev => new Set([...prev, segmentId]));
  };

  const handleRemoveFromSelection = (segmentId: string) => {
    setSelectedSegments(prev => {
      const next = new Set(prev);
      next.delete(segmentId);
      return next;
    });
  };

  const handleKeepOnlySelected = () => {
    setKeepOnlyMode(true);
    // Mark all non-selected segments as visually muted
    toast.success('Showing only selected sentences');
  };

  const handleResetSelection = () => {
    setSelectedSegments(new Set());
    setKeepOnlyMode(false);
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
      if (!editingSegmentId) {
        // Don't clear selection when clicking outside
      }
    }
  }, [editingSegmentId]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Filter segments based on showDeleted
  const visibleSegments = segments.filter(seg => showDeleted || !seg.deleted);

  // Calculate total selection duration
  const selectionDuration = segments
    .filter(seg => selectedSegments.has(seg.id))
    .reduce((acc, seg) => acc + (seg.endTime - seg.startTime), 0);

  return (
    <div className="relative h-full flex flex-col bg-white">
      {/* Header with selection info */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Selection</span>
          <span className="text-sm font-medium text-gray-900">
            {selectionDuration > 0 ? `00:${Math.floor(selectionDuration).toString().padStart(2, '0')}` : '00:00'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetSelection}
          className="text-gray-600 hover:text-gray-900"
        >
          Reset
        </Button>
      </div>

      {/* Script Editor with sentence blocks */}
      <div 
        ref={editorRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="space-y-3">
          {visibleSegments.map((segment, index) => {
            const isSelected = selectedSegments.has(segment.id);
            const isMuted = keepOnlyMode && !isSelected;
            const isEditing = editingSegmentId === segment.id;
            const showTimestamp = segment.startTime > 0 && (index === 0 || segments[index - 1]?.endTime !== segment.startTime);

            return (
              <div
                key={segment.id}
                className="group relative"
              >
                {/* Sentence block */}
                <div
                  onClick={(e) => handleSegmentClick(segment, e)}
                  className={`relative flex items-start gap-2 py-2 px-1 rounded-lg transition-all cursor-pointer ${
                    isEditing 
                      ? 'bg-gray-50 ring-2 ring-primary/20' 
                      : isSelected 
                        ? 'bg-blue-50' 
                        : 'hover:bg-gray-50'
                  } ${isMuted ? 'opacity-40' : ''} ${segment.deleted ? 'line-through opacity-30' : ''} ${segment.hidden ? 'opacity-30 bg-gray-100' : ''}`}
                >
                  {/* Timestamp badge (shown inline for some sentences) */}
                  {showTimestamp && (
                    <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-600 text-[10px] rounded font-mono mt-0.5">
                      {formatTime(segment.startTime)}
                    </span>
                  )}

                  {/* Text content */}
                  {isEditing ? (
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={handleEditSave}
                      autoFocus
                      className="flex-1 resize-none bg-transparent text-gray-800 text-[15px] leading-relaxed focus:outline-none min-h-[24px]"
                      rows={Math.ceil(editingText.length / 60) || 1}
                    />
                  ) : (
                    <p className={`flex-1 text-[15px] leading-relaxed ${isMuted ? 'text-gray-400' : 'text-gray-800'} ${segment.hidden ? 'italic' : ''}`}>
                      {segment.text}
                    </p>
                  )}

                  {/* Hover action icons */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Pencil/Edit icon */}
                    <button
                      onClick={(e) => handleEditClick(segment, e)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    
                    {/* Eye/Hide icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHideSegment(segment.id);
                      }}
                      className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title={segment.hidden ? 'Show' : 'Hide'}
                    >
                      {segment.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    
                    {/* Delete icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSegment(segment.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Context menu for selected segments */}
                {isSelected && selectedSegments.size === 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44 bg-popover">
                      <DropdownMenuItem onClick={() => handleAddToSelection(segment.id)}>
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add To Selection
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleKeepOnlySelected}>
                        <Check className="w-3.5 h-3.5 mr-2" />
                        Keep Only Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Selection indicator when multi-selected */}
                {isSelected && selectedSegments.size > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 bg-popover">
                      <DropdownMenuItem onClick={() => handleRemoveFromSelection(segment.id)}>
                        <X className="w-3.5 h-3.5 mr-2" />
                        Remove From Selection
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleKeepOnlySelected}>
                        <Check className="w-3.5 h-3.5 mr-2" />
                        Keep Only Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>

        {/* End timestamp */}
        {visibleSegments.length > 0 && (
          <div className="mt-4">
            <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-600 text-[10px] rounded font-mono">
              {formatTime(visibleSegments[visibleSegments.length - 1]?.endTime || 0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptTextEditor;
