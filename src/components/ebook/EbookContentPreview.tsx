import { useState, useRef } from 'react';
import { 
  Play, Pause, Wand2, MessageSquare, ImageIcon, Copy, Trash2, 
  Download, Undo2, Redo2, MoreVertical, Check, X, Plus,
  MinusCircle, ArrowDownToLine, Briefcase, FileText
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface Paragraph {
  id: string;
  text: string;
  chapterId: string;
}

interface Chapter {
  id: string;
  title: string;
  imageUrl?: string;
  paragraphs: Paragraph[];
}

interface EbookContentPreviewProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onParagraphEdit: (paragraphId: string, newText: string) => void;
  onChapterImageChange: (chapterId: string) => void;
}

const HIGHLIGHT_COLORS = [
  { id: 'yellow', class: 'bg-yellow-200', border: 'border-yellow-400' },
  { id: 'green', class: 'bg-green-200', border: 'border-green-400' },
  { id: 'blue', class: 'bg-blue-200', border: 'border-blue-400' },
  { id: 'pink', class: 'bg-pink-200', border: 'border-pink-400' },
];

const EbookContentPreview = ({
  chapters,
  selectedChapterId,
  onParagraphEdit,
  onChapterImageChange,
}: EbookContentPreviewProps) => {
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(null);
  const [editingParagraphId, setEditingParagraphId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showAIWriterDropdown, setShowAIWriterDropdown] = useState<string | null>(null);
  const [aiWriterPrompt, setAIWriterPrompt] = useState('');
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const selectedChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];

  const handleParagraphClick = (paragraphId: string) => {
    setSelectedParagraphId(paragraphId);
  };

  const handleEditStart = (paragraph: Paragraph) => {
    setEditingParagraphId(paragraph.id);
    setEditingValue(paragraph.text);
  };

  const handleEditSave = () => {
    if (editingParagraphId && editingValue.trim()) {
      onParagraphEdit(editingParagraphId, editingValue.trim());
      toast.success('Saved');
    }
    setEditingParagraphId(null);
    setEditingValue('');
  };

  const handleEditCancel = () => {
    setEditingParagraphId(null);
    setEditingValue('');
  };

  const handleAIAction = (action: string, paragraphId: string) => {
    toast.success(`Applying ${action}...`);
    setShowAIWriterDropdown(null);
    // In a real implementation, this would call an AI API
  };

  const handleHighlight = (color: string, paragraphId: string) => {
    toast.success(`Highlighted in ${color}`);
  };

  if (!selectedChapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Select a chapter to preview</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden flex flex-col">
      {/* Canvas Area - fixed height, no scroll on outer container */}
      <div className="flex-1 p-8 flex justify-center overflow-y-auto">
        <div className="w-full max-w-3xl">
          {/* Chapter Header */}
          <div className="bg-white rounded-t-2xl shadow-lg">
            {/* Chapter Image Section */}
            <div 
              className="relative h-48 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-2xl overflow-hidden cursor-pointer group"
              onClick={() => onChapterImageChange(selectedChapter.id)}
            >
              {selectedChapter.imageUrl ? (
                <img 
                  src={selectedChapter.imageUrl} 
                  alt={selectedChapter.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Click to add chapter image</p>
                  </div>
                </div>
              )}
              <button className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg text-sm font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <Wand2 className="w-4 h-4 text-purple-500" />
                Replace / Enhance Image
              </button>
            </div>

            {/* Chapter Title */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">{selectedChapter.title}</h2>
            </div>
          </div>

          {/* Paragraphs */}
          <div className="bg-white rounded-b-2xl shadow-lg">
            <TooltipProvider delayDuration={200}>
              {selectedChapter.paragraphs.map((paragraph, index) => {
                const isSelected = selectedParagraphId === paragraph.id;
                const isEditing = editingParagraphId === paragraph.id;
                const showToolbar = isSelected || isEditing;

                return (
                  <div 
                    key={paragraph.id} 
                    className={`relative transition-all ${index === 0 && showToolbar ? 'pt-12' : ''}`}
                  >
                    {/* Floating Toolbar */}
                    {showToolbar && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-50 animate-fade-in">
                        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-sidebar rounded-lg shadow-xl border border-gray-700">
                          {/* Play/Pause */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                <Play className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Play</TooltipContent>
                          </Tooltip>

                          {/* AI Writer */}
                          <Popover 
                            open={showAIWriterDropdown === paragraph.id} 
                            onOpenChange={(open) => setShowAIWriterDropdown(open ? paragraph.id : null)}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                  <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                    <Wand2 className="w-4 h-4" />
                                  </button>
                                </PopoverTrigger>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">AI Writer</TooltipContent>
                            </Tooltip>
                            <PopoverContent 
                              className="w-56 p-0 bg-white border-gray-200 shadow-xl z-50" 
                              side="bottom"
                              align="start"
                            >
                              <div className="p-2 border-b border-gray-100">
                                <input
                                  type="text"
                                  placeholder="Modify with a prompt..."
                                  value={aiWriterPrompt}
                                  onChange={(e) => setAIWriterPrompt(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && aiWriterPrompt.trim()) {
                                      handleAIAction(aiWriterPrompt, paragraph.id);
                                      setAIWriterPrompt('');
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div className="py-1">
                                <button
                                  onClick={() => handleAIAction('Rephrase', paragraph.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Wand2 className="w-4 h-4" />
                                  Rephrase
                                </button>
                                <button
                                  onClick={() => handleAIAction('Shorten', paragraph.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                  Shorten
                                </button>
                                <button
                                  onClick={() => handleAIAction('Expand', paragraph.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <ArrowDownToLine className="w-4 h-4" />
                                  Expand
                                </button>
                                <button
                                  onClick={() => handleAIAction('Formal', paragraph.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Briefcase className="w-4 h-4" />
                                  Formal
                                </button>
                                <button
                                  onClick={() => handleAIAction('Simplify', paragraph.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  Simplify
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>

                          {/* Highlight Colors */}
                          <Popover>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                  <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                    <div className="flex -space-x-1">
                                      <div className="w-3 h-3 rounded-full bg-yellow-200 border border-gray-600" />
                                      <div className="w-3 h-3 rounded-full bg-green-200 border border-gray-600" />
                                    </div>
                                  </button>
                                </PopoverTrigger>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">Highlight</TooltipContent>
                            </Tooltip>
                            <PopoverContent className="w-auto p-2 bg-white border-gray-200 z-50" side="bottom">
                              <div className="flex items-center gap-2">
                                {HIGHLIGHT_COLORS.map((color) => (
                                  <button
                                    key={color.id}
                                    onClick={() => handleHighlight(color.id, paragraph.id)}
                                    className={`w-6 h-6 rounded-full ${color.class} border-2 ${color.border} hover:scale-110 transition-transform`}
                                  />
                                ))}
                                <button className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-300 hover:scale-110 transition-transform flex items-center justify-center">
                                  <X className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>

                          {/* Add Image */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                <ImageIcon className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Add Image</TooltipContent>
                          </Tooltip>

                          {/* Comment */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Comment</TooltipContent>
                          </Tooltip>

                          {/* Copy */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(paragraph.text);
                                  toast.success('Copied!');
                                }}
                                className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Copy</TooltipContent>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-red-400 rounded-md transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
                          </Tooltip>

                          {/* Download */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Download</TooltipContent>
                          </Tooltip>

                          {/* Divider */}
                          <div className="w-px h-5 bg-gray-600 mx-1" />

                          {/* Undo */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                <Undo2 className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Undo</TooltipContent>
                          </Tooltip>

                          {/* Redo */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                <Redo2 className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Redo</TooltipContent>
                          </Tooltip>

                          {/* More */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">More</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    )}

                    {/* Paragraph Content */}
                    <div
                      onClick={() => handleParagraphClick(paragraph.id)}
                      className={`px-6 py-4 cursor-pointer transition-all border-l-4 ${
                        isSelected
                          ? 'bg-blue-50 border-l-emerald-500'
                          : 'border-l-transparent hover:bg-gray-50'
                      }`}
                    >
                      {isEditing ? (
                        <div>
                          <textarea
                            ref={(el) => {
                              textareaRefs.current[paragraph.id] = el;
                            }}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="w-full min-h-[100px] p-3 text-gray-700 leading-relaxed border-2 border-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                            autoFocus
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={handleEditSave}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p 
                          className="text-gray-700 leading-relaxed"
                          onDoubleClick={() => handleEditStart(paragraph)}
                        >
                          {paragraph.text}
                        </p>
                      )}
                    </div>

                    {/* Add paragraph button on hover */}
                    {isSelected && !isEditing && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                        <button className="w-6 h-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md transition-all">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookContentPreview;
