import { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Layers, FileText, Image as ImageIcon, 
  Box, Presentation, Plus, Pencil, Search, Sparkles, Send,
  Type, List, QrCode, Video, Music, Table, Calendar, CheckSquare,
  Link2, Quote, Heading, Columns, LayoutGrid, PanelLeftClose, PanelLeft,
  Trash2, GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface Chapter {
  id: string;
  title: string;
  type?: 'cover' | 'table of contents' | 'introduction' | 'summary' | null;
}

interface EbookDesignSidebarProps {
  bookTitle: string;
  chapters: Chapter[];
  selectedChapterId: string | null;
  onChapterSelect: (id: string) => void;
  onChapterAdd: (afterId: string) => void;
  onChapterTitleEdit: (id: string, newTitle: string) => void;
  onChapterDelete?: (id: string) => void;
  onChapterReorder?: (fromIndex: number, toIndex: number) => void;
}

// Template options
const TEMPLATES = [
  { id: 'minimal', name: 'Minimal', preview: 'bg-white' },
  { id: 'modern', name: 'Modern', preview: 'bg-gradient-to-br from-blue-50 to-purple-50' },
  { id: 'classic', name: 'Classic', preview: 'bg-amber-50' },
  { id: 'bold', name: 'Bold', preview: 'bg-gradient-to-br from-orange-400 to-pink-500' },
  { id: 'elegant', name: 'Elegant', preview: 'bg-gradient-to-br from-gray-900 to-gray-700' },
  { id: 'nature', name: 'Nature', preview: 'bg-gradient-to-br from-green-100 to-emerald-200' },
];

// Element options (inspired by attachment 8)
const ELEMENTS = [
  { id: 'heading', name: 'Chapter Heading', icon: Heading },
  { id: 'text-block', name: 'Text Block', icon: Type },
  { id: 'image', name: 'Captioned Image', icon: ImageIcon },
  { id: 'video', name: 'Embed Video', icon: Video },
  { id: 'audio', name: 'Embed Audio', icon: Music },
  { id: 'table', name: 'Table', icon: Table },
  { id: 'list', name: 'List', icon: List },
  { id: 'checklist', name: 'Checklist', icon: CheckSquare },
  { id: 'qr-code', name: 'QR Code', icon: QrCode },
  { id: 'quote', name: 'Quote Block', icon: Quote },
  { id: 'columns', name: 'Columns', icon: Columns },
  { id: 'cta', name: 'Call To Action', icon: Link2 },
  { id: 'page-break', name: 'Page Break', icon: LayoutGrid },
];

// Mockup categories
const MOCKUP_CATEGORIES = [
  { id: 'ebook', name: 'eBook Covers' },
  { id: 'magazines', name: 'Magazines' },
  { id: 'reports', name: 'Reports' },
  { id: 'social', name: 'Social Media' },
  { id: 'ads', name: 'Advertisements' },
];

type SectionId = 'templates' | 'content' | 'images' | 'elements' | 'mockups';

const EbookDesignSidebar = ({
  bookTitle,
  chapters,
  selectedChapterId,
  onChapterSelect,
  onChapterAdd,
  onChapterTitleEdit,
  onChapterDelete,
  onChapterReorder,
}: EbookDesignSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(['content']));
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [hoveredChapterId, setHoveredChapterId] = useState<string | null>(null);
  const [imageSearch, setImageSearch] = useState('');
  const [templatePrompt, setTemplatePrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onChapterReorder?.(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const toggleSection = (section: SectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleEditStart = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingValue(chapter.title);
  };

  const handleEditSave = () => {
    if (editingChapterId && editingValue.trim()) {
      onChapterTitleEdit(editingChapterId, editingValue.trim());
    }
    setEditingChapterId(null);
    setEditingValue('');
  };

  const SectionHeader = ({ 
    id, 
    title, 
    icon: Icon 
  }: { 
    id: SectionId; 
    title: string; 
    icon: React.ComponentType<{ className?: string }>; 
  }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          {!isCollapsed && <span className="font-semibold text-gray-900 text-base">{title}</span>}
        </div>
        {!isCollapsed && (
          isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )
        )}
      </button>
    );
  };

  // Collapsed sidebar - icons only
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="w-14 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden flex-shrink-0">
          {/* Expand Button */}
          <div className="p-2 border-b border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="w-full p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <PanelLeft className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expand sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Icon buttons for each section */}
          <div className="flex-1 flex flex-col py-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['templates']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Layers className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Templates</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['content']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <FileText className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Content</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['images']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Images</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['elements']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Box className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Elements</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['mockups']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Presentation className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Mockups</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden flex-shrink-0 relative">
        {/* Collapse Button - positioned on middle right border */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute top-1/2 -translate-y-1/2 -right-3 z-50 w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <PanelLeftClose className="w-4 h-4 text-gray-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Collapse sidebar</p>
          </TooltipContent>
        </Tooltip>

        {/* Scrollable sections container */}
        <div className="flex-1 overflow-y-auto">
          <SectionHeader id="templates" title="Templates" icon={Layers} />
          {expandedSections.has('templates') && (
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Choose a design</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    className={`aspect-[3/4] rounded-lg border-2 border-gray-200 hover:border-emerald-400 transition-all overflow-hidden ${template.preview}`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 bg-white/80 px-2 py-1 rounded">
                        {template.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {/* AI Template Prompt */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Edit with AI</span>
                </div>
                <div className="relative">
                  <textarea
                    value={templatePrompt}
                    onChange={(e) => setTemplatePrompt(e.target.value)}
                    placeholder="Describe what you want to create or upload a file..."
                    className="w-full min-h-[80px] p-3 pr-10 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                  />
                  <button className="absolute bottom-3 right-3 p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <SectionHeader id="content" title="Content" icon={FileText} />
          {expandedSections.has('content') && (
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <List className="w-3.5 h-3.5 text-gray-400" />
                  <h4 className="text-xs font-medium text-gray-500">Outline</h4>
                </div>
                <span className="w-10 text-right text-xs font-medium text-gray-400">Page #</span>
              </div>
              <div className="space-y-1">
                {chapters.map((chapter, index) => {
                  const hasType = !!chapter.type;
                  return (
                    <div
                      key={chapter.id}
                      className={`relative ${dragOverIndex === index ? 'ring-2 ring-emerald-400 rounded-lg' : ''}`}
                      onMouseEnter={() => setHoveredChapterId(chapter.id)}
                      onMouseLeave={() => setHoveredChapterId(null)}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onChapterSelect(chapter.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onChapterSelect(chapter.id);
                          }
                        }}
                        className={`w-full group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                          selectedChapterId === chapter.id
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                        } ${draggedIndex === index ? 'opacity-50' : ''}`}
                      >
                        {/* Drag handle - only visible on hover */}
                        <GripVertical className="w-3 h-3 text-gray-300 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-600 font-medium text-xs flex-shrink-0">
                          {index + 1}
                        </span>

                        {/* Badge next to number for typed chapters */}
                        {chapter.type && (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded flex-shrink-0 whitespace-nowrap bg-gray-300 text-gray-700">
                            {chapter.type === 'cover' ? 'Cover' :
                             chapter.type === 'table of contents' ? 'Table Of Contents' :
                             chapter.type === 'introduction' ? 'Introduction' :
                             chapter.type === 'summary' ? 'Summary' :
                             chapter.type}
                          </span>
                        )}
                        
                        {editingChapterId === chapter.id ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={handleEditSave}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') {
                                setEditingChapterId(null);
                                setEditingValue('');
                              }
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-sm font-medium bg-white border border-emerald-400 rounded px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          <>
                            {/* Show title - aligned left after badge */}
                            {!hasType && (
                              <span className="flex-1 text-sm font-medium text-gray-900 text-left truncate min-w-0">
                                {chapter.title}
                              </span>
                            )}
                            {hasType && <span className="flex-1" />}
                          </>
                        )}

                        {/* Right side: Edit/Delete icons + Page # */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Edit and Delete icons - next to page number on hover */}
                          {!editingChapterId && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditStart(chapter);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded transition-all"
                                  >
                                    <Pencil className="w-3 h-3 text-gray-500" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p>Edit title</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onChapterDelete) {
                                        onChapterDelete(chapter.id);
                                      } else {
                                        toast.success(`Deleted "${chapter.title}"`);
                                      }
                                    }}
                                    className="p-1 hover:bg-red-100 rounded transition-all"
                                  >
                                    <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-500" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p>Delete chapter</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                          
                          {/* Page # column */}
                          <span className="w-6 text-right text-xs font-medium text-gray-400">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      
                    </div>
                  );
                })}
              </div>
              
              {/* Add New Page Button */}
              <button className="w-full mt-4 flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add New Page</span>
              </button>
            </div>
          )}

          <SectionHeader id="images" title="Images" icon={ImageIcon} />
          {expandedSections.has('images') && (
            <div className="p-3 border-b border-gray-200">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                  placeholder="Search images..."
                  className="pl-9"
                />
              </div>
              {/* Stock Images Grid */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Stock Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <button
                      key={i}
                      className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 hover:ring-2 hover:ring-emerald-400 transition-all"
                    />
                  ))}
                </div>
              </div>
              
              {/* AI Image Generation Prompt */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Generate Image</span>
                </div>
                <div className="relative">
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="w-full min-h-[60px] p-3 pr-10 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                  />
                  <button className="absolute bottom-3 right-3 p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Elements Section */}
          <SectionHeader id="elements" title="Elements" icon={Box} />
          {expandedSections.has('elements') && (
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="grid grid-cols-3 gap-2">
                {ELEMENTS.map((element) => (
                  <button
                    key={element.id}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                  >
                    <element.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-tight">
                      {element.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mockups Section */}
          <SectionHeader id="mockups" title="Mockups" icon={Presentation} />
          {expandedSections.has('mockups') && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-2 mb-4">
                <button className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-full">
                  Mockups
                </button>
                <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
                  Scenes
                </button>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search..." className="pl-9" />
              </div>
              
              {MOCKUP_CATEGORIES.map((category) => (
                <div key={category.id} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-700">{category.name}</h4>
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      View all
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3].map((i) => (
                      <button
                        key={i}
                        className="flex-shrink-0 w-16 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:ring-2 hover:ring-emerald-400 transition-all"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EbookDesignSidebar;
