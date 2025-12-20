import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Trash2, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ScriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  deleted?: boolean;
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
      };
      currentTime += duration + 0.2; // Small gap between segments
      return segment;
    });
  });

  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number; segmentIds: string[] } | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    return `${seconds.toFixed(1)}s`;
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setSelectedRange(null);
      setPopupPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
      setSelectedRange(null);
      setPopupPosition(null);
      return;
    }

    // Find which segments are selected
    const selectedSegmentIds: string[] = [];
    const segmentElements = editorRef.current.querySelectorAll('[data-segment-id]');
    
    segmentElements.forEach((el) => {
      if (selection.containsNode(el, true)) {
        const segmentId = el.getAttribute('data-segment-id');
        if (segmentId) {
          selectedSegmentIds.push(segmentId);
        }
      }
    });

    if (selectedSegmentIds.length > 0) {
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      
      setSelectedRange({
        start: 0,
        end: selectedText.length,
        segmentIds: selectedSegmentIds,
      });
      
      setPopupPosition({
        x: rect.left + rect.width / 2 - editorRect.left,
        y: rect.top - editorRect.top - 10,
      });
    }
  }, []);

  const handleDelete = () => {
    if (!selectedRange) return;
    
    setSegments(prev => 
      prev.map(seg => 
        selectedRange.segmentIds.includes(seg.id) 
          ? { ...seg, deleted: true }
          : seg
      )
    );
    
    selectedRange.segmentIds.forEach(id => onSegmentDelete?.(id));
    toast.success('Selected text marked for deletion');
    setSelectedRange(null);
    setPopupPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleExport = () => {
    if (!selectedRange) return;
    
    const selectedText = segments
      .filter(seg => selectedRange.segmentIds.includes(seg.id))
      .map(seg => seg.text)
      .join(' ');
    
    onSegmentExport?.(selectedRange.segmentIds[0], selectedText);
    toast.success('Selected text exported');
    setSelectedRange(null);
    setPopupPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  // Listen for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleTextSelection);
    return () => document.removeEventListener('selectionchange', handleTextSelection);
  }, [handleTextSelection]);

  // Filter segments based on showDeleted
  const visibleSegments = segments.filter(seg => showDeleted || !seg.deleted);

  return (
    <div className="relative h-full flex flex-col">
      {/* Selection Popup */}
      {popupPosition && selectedRange && (
        <div
          className="absolute z-50 flex items-center gap-1 bg-gray-900 text-white rounded-lg shadow-xl px-1 py-1 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-white hover:bg-gray-800 px-3 py-1.5 h-auto text-sm"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="text-white hover:bg-gray-800 px-3 py-1.5 h-auto text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      )}

      {/* Script Editor */}
      <div 
        ref={editorRef}
        className="flex-1 overflow-y-auto p-4 bg-white"
      >
        <div className="prose prose-sm max-w-none leading-relaxed text-gray-700 space-y-1">
          {visibleSegments.map((segment, index) => (
            <React.Fragment key={segment.id}>
              <span
                data-segment-id={segment.id}
                className={`inline ${
                  segment.deleted 
                    ? 'line-through text-gray-400 bg-red-50' 
                    : 'hover:bg-blue-50 cursor-text'
                } ${
                  selectedRange?.segmentIds.includes(segment.id) 
                    ? 'bg-blue-100' 
                    : ''
                }`}
              >
                {segment.text}
              </span>
              {/* Timestamp indicator between sentences */}
              {index < visibleSegments.length - 1 && (
                <span className="inline-flex items-center mx-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded font-mono">
                  <Play className="w-2 h-2 mr-0.5 opacity-60" />
                  {formatTime(segment.endTime)}
                </span>
              )}
              {' '}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptTextEditor;
