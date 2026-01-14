import React, { useState } from 'react';
import { 
  BookOpen, ChevronDown, ChevronUp, Pencil, Trash2, Plus, Wand2, 
  GripVertical, Check, X, Sparkles, Loader2, Image as ImageIcon,
  FileText, MoreVertical, Copy, ArrowUp, ArrowDown, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ChapterData {
  id: string;
  title: string;
  description: string;
  topics: string[];
  includeImages: boolean;
  pageCount: number;
}

interface ChapterSequenceEditorProps {
  bookTitle: string;
  bookDescription: string;
  chapters: ChapterData[];
  onBookTitleChange: (title: string) => void;
  onBookDescriptionChange: (description: string) => void;
  onChaptersChange: (chapters: ChapterData[]) => void;
  includeImages: boolean;
  onIncludeImagesChange: (include: boolean) => void;
}

const AI_EDIT_OPTIONS = [
  { id: 'improve-writing', label: 'Improve Writing', icon: Sparkles },
  { id: 'fix-spelling', label: 'Fix Spelling & Grammar', icon: FileText },
  { id: 'make-shorter', label: 'Make Shorter', icon: FileText },
  { id: 'make-longer', label: 'Make Longer', icon: FileText },
  { id: 'change-tone', label: 'Change Tone', icon: Sparkles },
  { id: 'plain-language', label: 'Rewrite in Plain Language', icon: FileText },
  { id: 'change-focus', label: 'Change Focus', icon: FileText },
  { id: 'simplify', label: 'Simplify Language', icon: FileText },
];

interface SortableChapterItemProps {
  chapter: ChapterData;
  index: number;
  isExpanded: boolean;
  isEditingThis: boolean;
  editingField: 'title' | 'description' | null;
  editValue: string;
  isAIProcessing: boolean;
  addingTopicToChapter: string | null;
  newTopicValue: string;
  chaptersLength: number;
  onToggleExpand: (id: string) => void;
  onStartEditing: (chapterId: string, field: 'title' | 'description', currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onAIEdit: (chapterId: string, editType: string, field: 'description') => void;
  onToggleImages: (chapterId: string) => void;
  onDuplicate: (chapter: ChapterData) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onAddTopic: (chapterId: string) => void;
  onRemoveTopic: (chapterId: string, topicIndex: number) => void;
  onSetAddingTopic: (chapterId: string | null) => void;
  onNewTopicChange: (value: string) => void;
}

const SortableChapterItem: React.FC<SortableChapterItemProps> = ({
  chapter,
  index,
  isExpanded,
  isEditingThis,
  editingField,
  editValue,
  isAIProcessing,
  addingTopicToChapter,
  newTopicValue,
  chaptersLength,
  onToggleExpand,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onAIEdit,
  onToggleImages,
  onDuplicate,
  onMove,
  onDelete,
  onAddTopic,
  onRemoveTopic,
  onSetAddingTopic,
  onNewTopicChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggleExpand(chapter.id)}
    >
      <div 
        ref={setNodeRef} 
        style={style}
        className={`group ${isDragging ? 'bg-gray-100 shadow-lg rounded-lg' : ''}`}
      >
        {/* Chapter Header */}
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <button 
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-opacity"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 font-semibold text-sm flex-shrink-0">
            {index + 1}
          </span>

          <CollapsibleTrigger asChild>
            <button className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{chapter.title}</span>
                {chapter.includeImages && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                    <ImageIcon className="w-3 h-3 inline mr-1" />
                    Images
                  </span>
                )}
              </div>
              {chapter.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{chapter.description}</p>
              )}
            </button>
          </CollapsibleTrigger>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToggleImages(chapter.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    chapter.includeImages 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{chapter.includeImages ? 'Disable images' : 'Enable images'}</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onStartEditing(chapter.id, 'title', chapter.title)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(chapter)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onMove(index, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Move Up
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onMove(index, 'down')}
                  disabled={index === chaptersLength - 1}
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Move Down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(chapter.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CollapsibleTrigger asChild>
            <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </CollapsibleTrigger>
        </div>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 pl-16 space-y-4">
            {/* Title Edit */}
            {isEditingThis && editingField === 'title' ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveEdit();
                    if (e.key === 'Escape') onCancelEdit();
                  }}
                  autoFocus
                  className="flex-1"
                />
                <Button size="sm" onClick={onSaveEdit} className="bg-emerald-500 hover:bg-emerald-600">
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : null}

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      disabled={isAIProcessing}
                      className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                    >
                      {isAIProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      Edit With AI
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {AI_EDIT_OPTIONS.map(option => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => onAIEdit(chapter.id, option.id, 'description')}
                      >
                        <option.icon className="w-4 h-4 mr-2" />
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {isEditingThis && editingField === 'description' ? (
                <div className="space-y-2">
                  <Textarea
                    value={editValue}
                    onChange={(e) => onEditValueChange(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onSaveEdit} className="bg-emerald-500 hover:bg-emerald-600">
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={onCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p 
                  onClick={() => onStartEditing(chapter.id, 'description', chapter.description)}
                  className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 cursor-text hover:bg-gray-100 transition-colors min-h-[60px]"
                >
                  {chapter.description || 'Click to add a description...'}
                </p>
              )}
            </div>

            {/* Topics/Sections */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Key Topics</label>
              <div className="flex flex-wrap gap-2">
                {chapter.topics.map((topic, topicIndex) => (
                  <span
                    key={topicIndex}
                    className="group/topic inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                  >
                    {topic}
                    <button
                      onClick={() => onRemoveTopic(chapter.id, topicIndex)}
                      className="opacity-0 group-hover/topic:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                
                {addingTopicToChapter === chapter.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={newTopicValue}
                      onChange={(e) => onNewTopicChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onAddTopic(chapter.id);
                        if (e.key === 'Escape') {
                          onSetAddingTopic(null);
                          onNewTopicChange('');
                        }
                      }}
                      placeholder="Topic name"
                      className="h-7 text-sm w-32"
                      autoFocus
                    />
                    <button
                      onClick={() => onAddTopic(chapter.id)}
                      className="p-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        onSetAddingTopic(null);
                        onNewTopicChange('');
                      }}
                      className="p-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSetAddingTopic(chapter.id)}
                    className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-emerald-600 px-2 py-1 rounded-full border border-dashed border-gray-300 hover:border-emerald-400 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Topic
                  </button>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

const ChapterSequenceEditor: React.FC<ChapterSequenceEditorProps> = ({
  bookTitle,
  bookDescription,
  chapters,
  onBookTitleChange,
  onBookDescriptionChange,
  onChaptersChange,
  includeImages,
  onIncludeImagesChange,
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);
  const [newTopicValue, setNewTopicValue] = useState('');
  const [addingTopicToChapter, setAddingTopicToChapter] = useState<string | null>(null);
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [overviewEditValue, setOverviewEditValue] = useState({ title: bookTitle, description: bookDescription });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = chapters.findIndex((ch) => ch.id === active.id);
      const newIndex = chapters.findIndex((ch) => ch.id === over.id);
      onChaptersChange(arrayMove(chapters, oldIndex, newIndex));
      toast.success('Chapter reordered');
    }
  };

  const toggleChapterExpand = (id: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEditing = (chapterId: string, field: 'title' | 'description', currentValue: string) => {
    setEditingChapterId(chapterId);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingChapterId || !editingField) return;
    
    onChaptersChange(chapters.map(ch => 
      ch.id === editingChapterId 
        ? { ...ch, [editingField]: editValue }
        : ch
    ));
    
    setEditingChapterId(null);
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingChapterId(null);
    setEditingField(null);
    setEditValue('');
  };

  const handleAIEdit = async (chapterId: string, editType: string, field: 'description') => {
    setIsGeneratingAI(`${chapterId}-${field}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    
    let newValue = chapter[field];
    switch (editType) {
      case 'improve-writing':
        newValue = `${chapter[field]} This section provides comprehensive insights and actionable strategies that readers can immediately apply.`;
        break;
      case 'fix-spelling':
        newValue = chapter[field].replace(/\s+/g, ' ').trim();
        break;
      case 'make-shorter':
        newValue = chapter[field].split('.').slice(0, 2).join('.') + '.';
        break;
      case 'make-longer':
        newValue = `${chapter[field]} Additionally, this chapter explores advanced concepts and real-world applications that will help readers understand the practical implications and achieve better outcomes.`;
        break;
      case 'change-tone':
        newValue = `${chapter[field]} The content is presented in an engaging and accessible manner to connect with readers.`;
        break;
      case 'plain-language':
        newValue = chapter[field].replace(/comprehensive|implement|utilize|facilitate|methodology|paradigm/gi, match => {
          const plain: Record<string, string> = {
            comprehensive: 'complete',
            implement: 'use',
            utilize: 'use',
            facilitate: 'help',
            methodology: 'method',
            paradigm: 'model'
          };
          return plain[match.toLowerCase()] || match;
        });
        break;
      case 'change-focus':
        newValue = `From a practical standpoint, ${chapter[field].toLowerCase()}`;
        break;
      case 'simplify':
        newValue = chapter[field].replace(/comprehensive|implement|utilize|facilitate/gi, match => {
          const simple: Record<string, string> = {
            comprehensive: 'complete',
            implement: 'use',
            utilize: 'use',
            facilitate: 'help'
          };
          return simple[match.toLowerCase()] || match;
        });
        break;
    }
    
    onChaptersChange(chapters.map(ch => 
      ch.id === chapterId ? { ...ch, [field]: newValue } : ch
    ));
    
    setIsGeneratingAI(null);
    toast.success(`Chapter ${field} updated with AI`);
  };

  const addTopic = (chapterId: string) => {
    if (!newTopicValue.trim()) return;
    
    onChaptersChange(chapters.map(ch => 
      ch.id === chapterId 
        ? { ...ch, topics: [...ch.topics, newTopicValue.trim()] }
        : ch
    ));
    
    setNewTopicValue('');
    setAddingTopicToChapter(null);
  };

  const removeTopic = (chapterId: string, topicIndex: number) => {
    onChaptersChange(chapters.map(ch => 
      ch.id === chapterId 
        ? { ...ch, topics: ch.topics.filter((_, i) => i !== topicIndex) }
        : ch
    ));
  };

  const addBlankChapter = () => {
    const newChapter: ChapterData = {
      id: `chapter-${Date.now()}`,
      title: `Chapter ${chapters.length + 1}`,
      description: '',
      topics: [],
      includeImages: includeImages,
      pageCount: 5,
    };
    onChaptersChange([...chapters, newChapter]);
    setExpandedChapters(prev => new Set([...prev, newChapter.id]));
    toast.success('New chapter added');
  };

  const addChapterWithAI = async () => {
    setIsGeneratingAI('new-chapter');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newChapter: ChapterData = {
      id: `chapter-${Date.now()}`,
      title: `Advanced Strategies and Implementation`,
      description: 'This chapter covers advanced strategies and practical implementation techniques. Readers will learn how to apply concepts from previous chapters in real-world scenarios.',
      topics: ['Strategy Development', 'Implementation Framework', 'Best Practices', 'Case Studies'],
      includeImages: includeImages,
      pageCount: 8,
    };
    
    onChaptersChange([...chapters, newChapter]);
    setExpandedChapters(prev => new Set([...prev, newChapter.id]));
    setIsGeneratingAI(null);
    toast.success('AI-generated chapter added');
  };

  const deleteChapter = (id: string) => {
    if (chapters.length <= 1) {
      toast.error('Cannot delete the last chapter');
      return;
    }
    onChaptersChange(chapters.filter(ch => ch.id !== id));
    toast.success('Chapter deleted');
  };

  const duplicateChapter = (chapter: ChapterData) => {
    const newChapter: ChapterData = {
      ...chapter,
      id: `chapter-${Date.now()}`,
      title: `${chapter.title} (Copy)`,
    };
    const index = chapters.findIndex(ch => ch.id === chapter.id);
    const newChapters = [...chapters];
    newChapters.splice(index + 1, 0, newChapter);
    onChaptersChange(newChapters);
    toast.success('Chapter duplicated');
  };

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= chapters.length) return;
    
    const newChapters = [...chapters];
    [newChapters[index], newChapters[newIndex]] = [newChapters[newIndex], newChapters[index]];
    onChaptersChange(newChapters);
  };

  const toggleChapterImages = (chapterId: string) => {
    onChaptersChange(chapters.map(ch => 
      ch.id === chapterId ? { ...ch, includeImages: !ch.includeImages } : ch
    ));
  };

  const saveOverviewEdit = () => {
    onBookTitleChange(overviewEditValue.title);
    onBookDescriptionChange(overviewEditValue.description);
    setIsEditingOverview(false);
    toast.success('Book overview updated');
  };

  return (
    <div className="space-y-6">
      {/* Book Overview Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Book Overview</h3>
                <p className="text-sm text-gray-500">Refine your book title and description</p>
              </div>
            </div>
            {!isEditingOverview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOverviewEditValue({ title: bookTitle, description: bookDescription });
                  setIsEditingOverview(true);
                }}
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>

          {isEditingOverview ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={overviewEditValue.title}
                  onChange={(e) => setOverviewEditValue(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={overviewEditValue.description}
                  onChange={(e) => setOverviewEditValue(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe what your book is about and who it's for..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={saveOverviewEdit} className="bg-emerald-500 hover:bg-emerald-600">
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditingOverview(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{bookTitle || 'Untitled Book'}</h2>
              <p className="text-gray-600 leading-relaxed">
                {bookDescription || 'Add a description to help readers understand what your book is about.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Sequence Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Chapter Sequence</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {chapters.length} chapters
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Global Image Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onIncludeImagesChange(!includeImages)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    includeImages 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  {includeImages ? 'Images On' : 'Images Off'}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Include AI-generated images in chapters</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Chapter List with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chapters.map(ch => ch.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-gray-100">
              {chapters.map((chapter, index) => {
                const isExpanded = expandedChapters.has(chapter.id);
                const isEditingThis = editingChapterId === chapter.id;
                const isAIProcessing = isGeneratingAI?.startsWith(chapter.id) ?? false;

                return (
                  <SortableChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    index={index}
                    isExpanded={isExpanded}
                    isEditingThis={isEditingThis}
                    editingField={editingField}
                    editValue={editValue}
                    isAIProcessing={isAIProcessing}
                    addingTopicToChapter={addingTopicToChapter}
                    newTopicValue={newTopicValue}
                    chaptersLength={chapters.length}
                    onToggleExpand={toggleChapterExpand}
                    onStartEditing={startEditing}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onEditValueChange={setEditValue}
                    onAIEdit={handleAIEdit}
                    onToggleImages={toggleChapterImages}
                    onDuplicate={duplicateChapter}
                    onMove={moveChapter}
                    onDelete={deleteChapter}
                    onAddTopic={addTopic}
                    onRemoveTopic={removeTopic}
                    onSetAddingTopic={setAddingTopicToChapter}
                    onNewTopicChange={setNewTopicValue}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Chapter Buttons */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={addBlankChapter}
            className="flex-1 border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Blank Chapter
          </Button>
          <Button
            onClick={addChapterWithAI}
            disabled={isGeneratingAI === 'new-chapter'}
            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
          >
            {isGeneratingAI === 'new-chapter' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Add With AI
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChapterSequenceEditor;
