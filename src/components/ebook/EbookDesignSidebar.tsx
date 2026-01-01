import { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Layers, FileText, Image as ImageIcon, 
  Box, Presentation, Plus, Pencil, Search, Sparkles, Send,
  Type, List, QrCode, Video, Music, Table, Calendar, CheckSquare,
  Link2, Quote, Heading, Columns, LayoutGrid
} from 'lucide-react';
import { Input } from '@/components/ui/input';

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
}: EbookDesignSidebarProps) => {
  const [expandedSection, setExpandedSection] = useState<SectionId>('content');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [hoveredChapterId, setHoveredChapterId] = useState<string | null>(null);
  const [imageSearch, setImageSearch] = useState('');
  const [templatePrompt, setTemplatePrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');

  const toggleSection = (section: SectionId) => {
    setExpandedSection(expandedSection === section ? 'content' : section);
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
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
      </div>
      {expandedSection === id ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden flex-shrink-0">
      <SectionHeader id="templates" title="Templates" icon={Layers} />
      {expandedSection === 'templates' && (
        <div className="p-3 border-b border-gray-200 max-h-72 overflow-y-auto">
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
      {expandedSection === 'content' && (
        <div className="flex-1 overflow-y-auto p-3 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Table of Contents</h4>
          <div className="space-y-1">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="relative"
                onMouseEnter={() => setHoveredChapterId(chapter.id)}
                onMouseLeave={() => setHoveredChapterId(null)}
              >
                {/* Add chapter button between items */}
                {hoveredChapterId === chapter.id && index > 0 && (
                  <button
                    onClick={() => onChapterAdd(chapters[index - 1].id)}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-5 h-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md transition-all"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
                
                <button
                  onClick={() => onChapterSelect(chapter.id)}
                  className={`w-full group flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    selectedChapterId === chapter.id
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-600 font-medium text-xs flex-shrink-0">
                    {index + 1}
                  </span>
                  
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
                    <span className="flex-1 text-sm font-medium text-gray-900 text-left truncate">
                      {chapter.title}
                    </span>
                  )}
                  
                  {chapter.type && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${
                      chapter.type === 'cover' ? 'bg-gray-700 text-white' :
                      chapter.type === 'table of contents' ? 'bg-teal-500 text-white' :
                      chapter.type === 'introduction' ? 'bg-teal-400 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {chapter.type}
                    </span>
                  )}
                  
                  {!chapter.type && !editingChapterId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(chapter);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                    >
                      <Pencil className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </button>
                
                {/* Add chapter button after last item */}
                {hoveredChapterId === chapter.id && index === chapters.length - 1 && (
                  <button
                    onClick={() => onChapterAdd(chapter.id)}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 w-5 h-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md transition-all"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Add New Page Button */}
          <button className="w-full mt-4 flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add New Page</span>
          </button>
        </div>
      )}

      <SectionHeader id="images" title="Images" icon={ImageIcon} />
      {expandedSection === 'images' && (
        <div className="p-3 border-b border-gray-200 max-h-72 overflow-y-auto">
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
      {expandedSection === 'elements' && (
        <div className="p-4 border-b border-gray-200 max-h-80 overflow-y-auto bg-white">
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
      {expandedSection === 'mockups' && (
        <div className="p-4 border-b border-gray-200 max-h-80 overflow-y-auto">
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
  );
};

export default EbookDesignSidebar;
