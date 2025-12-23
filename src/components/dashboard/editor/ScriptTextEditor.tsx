import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Check, MoreHorizontal, Pencil, Eye, EyeOff, Scissors, Trash2, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
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
  const [activeToolbarSegment, setActiveToolbarSegment] = useState<string | null>(null);
  const [segmentToggles, setSegmentToggles] = useState<Record<string, boolean>>({});
  const editorRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    return `${seconds.toFixed(2)}s`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      setActiveToolbarSegment(null);
    } else {
      // Single click shows toolbar
      setSelectedSegments(new Set([segment.id]));
      setActiveToolbarSegment(segment.id);
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
      setActiveToolbarSegment(null);
    }
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(prev =>
      prev.map(seg =>
        seg.id === segmentId ? { ...seg, deleted: true } : seg
      )
    );
    onSegmentDelete?.(segmentId);
    setActiveToolbarSegment(null);
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
    setActiveToolbarSegment(null);
  };

  const handleCreateClip = (segment: ScriptSegment) => {
    onSegmentExport?.(segment.id, segment.text);
    toast.success('Clip created from selection');
  };

  const handleCopySegment = (segment: ScriptSegment) => {
    navigator.clipboard.writeText(segment.text);
    toast.success('Copied to clipboard');
  };

  const handleToggleSegment = (segmentId: string) => {
    setSegmentToggles(prev => ({
      ...prev,
      [segmentId]: !prev[segmentId]
    }));
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
    setActiveToolbarSegment(null);
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
      if (!editingSegmentId) {
        setActiveToolbarSegment(null);
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
            const showToolbar = activeToolbarSegment === segment.id && !isEditing;
            const segmentDuration = segment.endTime - segment.startTime;

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

                  {/* Hover action icons (hidden when toolbar is showing) */}
                  {!showToolbar && (
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
                  )}
                </div>

                {/* Floating Edit Toolbar - appears when segment is clicked */}
                {showToolbar && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 animate-fade-in">
                    <div className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-200">
                      {/* Create Clip button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateClip(segment);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Scissors className="w-4 h-4" />
                        <span className="font-medium">Create clip</span>
                      </button>

                      {/* Duration */}
                      <span className="text-sm text-gray-500 px-2 font-mono">
                        {formatDuration(segmentDuration)}
                      </span>

                      {/* Divider */}
                      <div className="w-px h-5 bg-gray-200 mx-1" />

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSegment(segment.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Toggle switch */}
                      <Switch
                        checked={segmentToggles[segment.id] ?? true}
                        onCheckedChange={() => handleToggleSegment(segment.id)}
                        className="mx-1"
                      />

                      {/* Dropdown arrow */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-44 bg-popover">
                          <DropdownMenuItem onClick={() => handleEditClick(segment, {} as React.MouseEvent)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />
                            Edit Text
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleHideSegment(segment.id)}>
                            {segment.hidden ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
                            {segment.hidden ? 'Show' : 'Hide'}
                          </DropdownMenuItem>
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

                      {/* Divider */}
                      <div className="w-px h-5 bg-gray-200 mx-1" />

                      {/* Copy button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySegment(segment);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* More options */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover">
                          <DropdownMenuItem onClick={() => handleRemoveFromSelection(segment.id)}>
                            <X className="w-3.5 h-3.5 mr-2" />
                            Remove From Selection
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            onSegmentExport?.(segment.id, segment.text);
                            toast.success('Exported segment');
                          }}>
                            <Scissors className="w-3.5 h-3.5 mr-2" />
                            Export As Clip
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}

                {/* Context menu for selected segments (when toolbar not showing) */}
                {isSelected && selectedSegments.size === 1 && !showToolbar && (
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
