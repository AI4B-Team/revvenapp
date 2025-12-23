import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Check, MoreHorizontal, MoreVertical, Pencil, Eye, EyeOff, Scissors, Trash2, Copy, ChevronDown, Search, Download, SlidersHorizontal, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

type HighlightColor = 'yellow' | 'green' | 'blue' | 'red' | null;

interface TextHighlight {
  start: number;
  end: number;
  color: HighlightColor;
}

interface ScriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  deleted?: boolean;
  selected?: boolean;
  hidden?: boolean;
  highlights?: TextHighlight[];
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
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentHighlights, setSegmentHighlights] = useState<Record<string, HighlightColor>>({});
  const [textSelection, setTextSelection] = useState<{ segmentId: string; start: number; end: number; text: string } | null>(null);
  const [highlightPickerPosition, setHighlightPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColor>('yellow');
  const editorRef = useRef<HTMLDivElement>(null);

  const highlightColorOptions = [
    { name: 'Yellow', color: 'yellow' as HighlightColor, bgClass: 'bg-yellow-100', dotClass: 'bg-yellow-200' },
    { name: 'Green', color: 'green' as HighlightColor, bgClass: 'bg-green-100', dotClass: 'bg-green-200' },
    { name: 'Blue', color: 'blue' as HighlightColor, bgClass: 'bg-blue-100', dotClass: 'bg-blue-200' },
    { name: 'Red', color: 'red' as HighlightColor, bgClass: 'bg-red-100', dotClass: 'bg-red-200' },
  ];

  const highlightColors = [
    { name: 'Select all', color: null, bgClass: '', dotClass: 'bg-yellow-300 bg-green-300' },
    ...highlightColorOptions,
  ];

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

  // Handle text selection within a segment
  const handleTextMouseUp = (segmentId: string, e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      
      // Get the text node and calculate offsets
      const textContent = segments.find(s => s.id === segmentId)?.text || '';
      const selectedIndex = textContent.indexOf(selectedText);
      
      if (selectedIndex !== -1) {
        setTextSelection({
          segmentId,
          start: selectedIndex,
          end: selectedIndex + selectedText.length,
          text: selectedText
        });
        
        // Position the highlight picker near the selection
        const rect = range.getBoundingClientRect();
        setHighlightPickerPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8
        });
      }
    }
  };

  // Apply highlight to selected text
  const applyTextHighlight = (color: HighlightColor) => {
    if (!textSelection) return;
    
    setSegments(prev => prev.map(seg => {
      if (seg.id === textSelection.segmentId) {
        const existingHighlights = seg.highlights || [];
        const newHighlight: TextHighlight = {
          start: textSelection.start,
          end: textSelection.end,
          color
        };
        return {
          ...seg,
          highlights: [...existingHighlights, newHighlight]
        };
      }
      return seg;
    }));
    
    setTextSelection(null);
    setHighlightPickerPosition(null);
    toast.success('Text highlighted');
  };

  // Render text with highlights
  const renderHighlightedText = (segment: ScriptSegment, isMuted: boolean) => {
    const highlights = segment.highlights || [];
    if (highlights.length === 0) {
      return <span className={isMuted ? 'text-gray-400' : 'text-gray-800'}>{segment.text}</span>;
    }

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, idx) => {
      // Add non-highlighted text before this highlight
      if (highlight.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`} className={isMuted ? 'text-gray-400' : 'text-gray-800'}>
            {segment.text.slice(lastIndex, highlight.start)}
          </span>
        );
      }
      
      // Add highlighted text
      const highlightBg = highlight.color === 'yellow' ? 'bg-yellow-100' :
                         highlight.color === 'green' ? 'bg-green-100' :
                         highlight.color === 'blue' ? 'bg-blue-100' :
                         highlight.color === 'red' ? 'bg-red-100' : '';
      parts.push(
        <mark key={`highlight-${idx}`} className={`${highlightBg} px-0.5 rounded`}>
          {segment.text.slice(highlight.start, highlight.end)}
        </mark>
      );
      
      lastIndex = highlight.end;
    });

    // Add remaining non-highlighted text
    if (lastIndex < segment.text.length) {
      parts.push(
        <span key="text-end" className={isMuted ? 'text-gray-400' : 'text-gray-800'}>
          {segment.text.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
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

  // Filter segments based on showDeleted and search query
  const visibleSegments = segments.filter(seg => {
    if (!showDeleted && seg.deleted) return false;
    if (searchQuery && !seg.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate total selection duration
  const selectionDuration = segments
    .filter(seg => selectedSegments.has(seg.id))
    .reduce((acc, seg) => acc + (seg.endTime - seg.startTime), 0);

  const handleCopyAll = () => {
    const allText = visibleSegments.map(seg => seg.text).join(' ');
    navigator.clipboard.writeText(allText);
    toast.success('Script copied to clipboard');
  };

  const handleDownload = () => {
    const allText = visibleSegments.map(seg => seg.text).join('\n\n');
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Script downloaded');
  };

  const handleHighlightColor = (color: HighlightColor) => {
    if (color === null) {
      // Select all - highlight all segments with different colors
      const newHighlights: Record<string, HighlightColor> = {};
      visibleSegments.forEach((seg, index) => {
        const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'red'];
        newHighlights[seg.id] = colors[index % colors.length];
      });
      setSegmentHighlights(newHighlights);
      toast.success('All segments highlighted');
    } else {
      // Apply color to selected segments
      if (selectedSegments.size > 0) {
        const newHighlights = { ...segmentHighlights };
        selectedSegments.forEach(id => {
          newHighlights[id] = color;
        });
        setSegmentHighlights(newHighlights);
        toast.success(`Highlight applied`);
      } else {
        toast.info('Select segments first to apply highlight');
      }
    }
  };

  const getHighlightClass = (segmentId: string): string => {
    const color = segmentHighlights[segmentId];
    switch (color) {
      case 'yellow': return 'bg-yellow-100';
      case 'green': return 'bg-green-100';
      case 'blue': return 'bg-blue-100';
      case 'red': return 'bg-red-100';
      default: return '';
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-white">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        {/* Search bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 border border-gray-300 rounded-lg">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-6 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-gray-400 px-0"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Copy button */}
          <button
            onClick={handleCopyAll}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Copy Script"
          >
            <Copy className="w-5 h-5" />
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Download Script"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Highlight dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Highlight Filter"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-popover">
              <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Highlight</div>
              <DropdownMenuSeparator />
              {highlightColors.map((item) => (
                <DropdownMenuItem 
                  key={item.name}
                  onClick={() => handleHighlightColor(item.color)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {item.color === null ? (
                    <div className="flex -space-x-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-300" />
                      <div className="w-3 h-3 rounded-full bg-green-300" />
                    </div>
                  ) : (
                    <div className={`w-4 h-4 rounded ${item.dotClass}`} />
                  )}
                  <span>{item.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            const highlightClass = getHighlightClass(segment.id);

            return (
              <div
                key={segment.id}
                className="group relative"
              >
                {/* Sentence block */}
                <div
                  onClick={(e) => handleSegmentClick(segment, e)}
                  className={`relative flex items-start gap-2 py-2 px-2 rounded-lg transition-all cursor-pointer ${
                    isEditing 
                      ? 'bg-gray-50 ring-2 ring-primary/20' 
                      : showToolbar
                        ? 'bg-indigo-100 ring-2 ring-indigo-300'
                        : isSelected 
                          ? 'bg-blue-50' 
                          : highlightClass || 'hover:bg-gray-50'
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
                    <p 
                      className={`flex-1 text-[15px] leading-relaxed ${segment.hidden ? 'italic' : ''} select-text`}
                      onMouseUp={(e) => handleTextMouseUp(segment.id, e)}
                    >
                      {renderHighlightedText(segment, isMuted)}
                    </p>
                  )}

                </div>

                {/* Floating Edit Toolbar - appears ABOVE sentence when clicked */}
                {showToolbar && (
                  <TooltipProvider delayDuration={200}>
                    <div className="absolute left-0 right-0 bottom-full mb-2 z-50 animate-fade-in flex justify-center">
                      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-sidebar rounded-lg shadow-xl border border-gray-700">
                        {/* Edit button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => handleEditClick(segment, e)}
                              className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
                        </Tooltip>

                        {/* Rephrase button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info('Rephrasing with AI...');
                              }}
                              className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                            >
                              <Bot className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Rephrase</TooltipContent>
                        </Tooltip>

                        {/* Highlight color dropdown */}
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                                >
                                  <div className="flex -space-x-1">
                                    <div className="w-3 h-3 rounded-full bg-yellow-200 border border-gray-600" />
                                    <div className="w-3 h-3 rounded-full bg-green-200 border border-gray-600" />
                                  </div>
                                </button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Highlight</TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="center" className="w-36 bg-popover">
                            {highlightColorOptions.map((item) => (
                              <DropdownMenuItem 
                                key={item.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSegmentHighlights(prev => ({
                                    ...prev,
                                    [segment.id]: item.color
                                  }));
                                  toast.success(`${item.name} highlight applied`);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <div className={`w-4 h-4 rounded ${item.dotClass}`} />
                                <span>{item.name}</span>
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSegmentHighlights(prev => {
                                  const next = { ...prev };
                                  delete next[segment.id];
                                  return next;
                                });
                                toast.success('Highlight removed');
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                              <span>Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Remove button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSegment(segment.id);
                              }}
                              className="p-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Remove</TooltipContent>
                        </Tooltip>

                        {/* Download Clip button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateClip(segment);
                              }}
                              className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Download</TooltipContent>
                        </Tooltip>

                        {/* Divider */}
                        <div className="w-px h-5 bg-gray-600 mx-1" />

                        {/* More options dropdown */}
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">More Options</TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end" className="w-44 bg-popover">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHideSegment(segment.id);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              {segment.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              <span>{segment.hidden ? 'Show' : 'Hide'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopySegment(segment);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleAddToSelection(segment.id)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add to Selection</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={handleKeepOnlySelected}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Keep Only Selected</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </TooltipProvider>
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

      {/* Floating Highlight Color Picker */}
      {highlightPickerPosition && textSelection && (
        <div
          className="fixed z-[100] animate-fade-in"
          style={{
            left: highlightPickerPosition.x,
            top: highlightPickerPosition.y,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg shadow-lg border border-gray-200">
            {highlightColorOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => applyTextHighlight(option.color)}
                className={`w-6 h-6 rounded ${option.dotClass} hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all ${
                  activeHighlightColor === option.color ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                }`}
                title={option.name}
              />
            ))}
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={() => {
                setTextSelection(null);
                setHighlightPickerPosition(null);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptTextEditor;
