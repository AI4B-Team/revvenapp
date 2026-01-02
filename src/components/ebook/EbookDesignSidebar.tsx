import { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Layers, FileText, Image as ImageIcon, 
  Box, Presentation, Plus, Pencil, Search, Sparkles, Send,
  Type, List, QrCode, Video, Music, Table, Calendar, CheckSquare,
  Link2, Quote, Heading, Columns, LayoutGrid, PanelLeftClose, PanelLeft,
  Trash2, GripVertical, BarChart3, BarChart2, BarChart, SplitSquareHorizontal, MousePointerClick, Code,
  BarChartHorizontal, Timer, Code2, Figma, GitBranch, Filter, Smile, TrendingUp,
  ImagePlus, Grid3X3, Clock, Sigma, Network, PieChart, ChevronsRight, Minus,
  Share2, Sun, ListOrdered, Tag, GanttChart, Play, Bot, Text, ListChecks, StickyNote,
  LayoutTemplate, ChevronDownSquare, Columns2, AlignLeft, MapPin, Square, Circle, Triangle,
  Target, Settings, UserPlus, Images, Hash, CodeSquare, Info, ListTree, PenTool, Brush, 
  ThumbsUp, HelpCircle, Hexagon, Star, Pentagon, Diamond, ArrowRight, ArrowDown, ArrowUp,
  ArrowLeft, Move, Pointer, Navigation, Maximize2, Minimize2, RotateCcw, ZoomIn, MessageSquare,
  FileDown, Volume2, ExternalLink, FileQuestion, Shrink, LineChart, CircleDot, AreaChart,
  Activity, Waves, CircleDashed, Boxes, Radar, Languages, Check
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  pageNumber?: number;
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
  onContentSectionChange?: (isExpanded: boolean) => void;
}

// Template options with pages
const TEMPLATES = [
  { id: 'minimal', name: 'Minimal', preview: 'bg-white', pages: ['Cover', 'Table of Contents', 'Introduction', 'Chapter 1', 'Summary'] },
  { id: 'modern', name: 'Modern', preview: 'bg-gradient-to-br from-blue-50 to-purple-50', pages: ['Cover', 'Table of Contents', 'About', 'Features', 'Pricing', 'Contact'] },
  { id: 'classic', name: 'Classic', preview: 'bg-amber-50', pages: ['Cover', 'Preface', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Conclusion'] },
  { id: 'bold', name: 'Bold', preview: 'bg-gradient-to-br from-orange-400 to-pink-500', pages: ['Cover', 'Mission', 'Vision', 'Team', 'Products'] },
  { id: 'elegant', name: 'Elegant', preview: 'bg-gradient-to-br from-gray-900 to-gray-700', pages: ['Cover', 'Overview', 'Details', 'Gallery', 'Contact'] },
  { id: 'nature', name: 'Nature', preview: 'bg-gradient-to-br from-green-100 to-emerald-200', pages: ['Cover', 'Introduction', 'Ecosystem', 'Conservation', 'Action'] },
];

// Browse categories with colorful icons (like reference design)
const BROWSE_CATEGORIES = [
  { id: 'graphics', name: 'Graphics', bgColor: 'bg-gradient-to-br from-yellow-100 to-green-100', iconColor: 'text-yellow-500', icon: Sun, hoverRotate: true },
  { id: 'stickers', name: 'Stickers', bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100', iconColor: 'text-yellow-500', icon: Smile, hoverShuffle: true },
  { id: 'photos', name: 'Photos', bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-100', iconColor: 'text-blue-500', icon: Images, hoverStack: true },
  { id: 'videos', name: 'Videos', bgColor: 'bg-gradient-to-br from-pink-100 to-rose-100', iconColor: 'text-pink-500', icon: Play, hoverPulse: true },
  { id: 'charts', name: 'Charts', bgColor: 'bg-gradient-to-br from-purple-100 to-violet-100', iconColor: 'text-purple-500', icon: BarChart3, hoverBounce: true },
  { id: 'sheets', name: 'Sheets', bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100', iconColor: 'text-green-600', icon: Table, hoverScale: true },
  { id: 'columns', name: 'Columns', bgColor: 'bg-gradient-to-br from-cyan-100 to-blue-100', iconColor: 'text-cyan-600', icon: Columns2, hoverTilt: true },
  { id: 'tables', name: 'Tables', bgColor: 'bg-gradient-to-br from-orange-100 to-red-100', iconColor: 'text-orange-500', icon: Grid3X3, hoverShake: true },
];

// Categorized Elements based on reference screenshots
const ELEMENT_CATEGORIES = {
  widgets: {
    title: 'Widgets',
    items: [
      { id: 'text-to-image', name: 'Text To Image', icon: ImagePlus },
      { id: 'map', name: 'Map', icon: MapPin },
      { id: 'table', name: 'Table', icon: Table },
      { id: 'page-no', name: 'Page No.', icon: Hash },
      { id: '3rd-party-embeds', name: '3rd party embeds', icon: CodeSquare },
      { id: 'tooltip', name: 'Tooltip', icon: Info },
      { id: 'auto-toc', name: 'Auto-generated TOC', icon: ListTree },
      { id: 'qr-code', name: 'QR Code', icon: QrCode },
      { id: 'shape-brush', name: 'Shape Brush', icon: Hexagon },
      { id: 'line-brush', name: 'Line Brush', icon: PenTool },
      { id: 'like', name: 'Like', icon: ThumbsUp },
      { id: 'quiz', name: 'Quiz', icon: HelpCircle },
    ]
  },
  shapes: {
    title: 'Shapes',
    items: [
      { id: 'rectangle', name: 'Rectangle', icon: Square },
      { id: 'ellipse', name: 'Ellipse', icon: Circle },
      { id: 'triangle', name: 'Triangle', icon: Triangle },
      { id: 'hexagon', name: 'Hexagon', icon: Hexagon },
      { id: 'star', name: 'Star', icon: Star },
      { id: 'diamond', name: 'Diamond', icon: Diamond },
    ]
  },
  arrows: {
    title: 'Arrows',
    items: [
      { id: 'arrow-right', name: 'Right Arrow', icon: ArrowRight },
      { id: 'arrow-down', name: 'Down Arrow', icon: ArrowDown },
      { id: 'arrow-up', name: 'Up Arrow', icon: ArrowUp },
      { id: 'arrow-left', name: 'Left Arrow', icon: ArrowLeft },
      { id: 'chevron-right', name: 'Chevron', icon: ChevronsRight },
    ]
  },
  buttons: {
    title: 'Buttons',
    items: [
      { id: 'button-setting', name: 'Setting', icon: Settings },
      { id: 'button-signup', name: 'Sign Up', icon: UserPlus },
      { id: 'button-register', name: 'Register', icon: CheckSquare },
    ]
  },
  hotspots: {
    title: 'Hotspots',
    items: [
      { id: 'hotspot-link', name: 'Link Hotspot', icon: Link2 },
      { id: 'hotspot-click', name: 'Click Hotspot', icon: MousePointerClick },
      { id: 'hotspot-target', name: 'Target Hotspot', icon: Target },
    ]
  },
  actions: {
    title: 'Actions',
    items: [
      { id: 'action-open-link', name: 'Open Link', icon: ExternalLink },
      { id: 'action-go-to-page', name: 'Go to Page', icon: FileText },
      { id: 'action-popup-window', name: 'Pop up Window', icon: Maximize2 },
      { id: 'action-popup-image', name: 'Pop up Image', icon: ImageIcon },
      { id: 'action-popup-msg', name: 'Pop up Msg', icon: MessageSquare },
      { id: 'action-show-hide', name: 'Show/Hide', icon: Minimize2 },
      { id: 'action-popup-video', name: 'Pop up Video', icon: Video },
      { id: 'action-play-audio', name: 'Play Audio', icon: Volume2 },
      { id: 'action-download-file', name: 'Download File', icon: FileDown },
      { id: 'action-area-zoom', name: 'Area Zoom in', icon: ZoomIn },
      { id: 'action-collapse', name: 'Collapse', icon: Shrink },
    ]
  },
  slideshows: {
    title: 'Slideshows',
    items: [
      { id: 'slideshow-basic', name: 'Basic Slideshow', icon: Images },
      { id: 'slideshow-fade', name: 'Fade Slideshow', icon: LayoutGrid },
      { id: 'slideshow-carousel', name: 'Carousel', icon: Columns },
    ]
  },
  barCharts: {
    title: 'Bar charts',
    items: [
      { id: 'stacked-bar', name: 'Stacked bar', icon: BarChart3, preview: 'stacked-bar' },
      { id: 'single-color-bar', name: 'Single color bar', icon: BarChart2, preview: 'single-bar' },
      { id: 'stacked-row', name: 'Stacked row', icon: BarChartHorizontal, preview: 'stacked-row' },
      { id: 'bar-chart', name: 'Bar', icon: BarChart, preview: 'bar' },
    ]
  },
  lineCharts: {
    title: 'Line charts',
    items: [
      { id: 'multi-line', name: 'Multi-line', icon: TrendingUp, preview: 'multi-line' },
      { id: 'line-chart', name: 'Line', icon: LineChart, preview: 'line' },
    ]
  },
  pieDonutCharts: {
    title: 'Pie and donut charts',
    items: [
      { id: 'pie-chart', name: 'Pie', icon: PieChart, preview: 'pie' },
      { id: 'donut-chart', name: 'Donut', icon: CircleDot, preview: 'donut' },
    ]
  },
  areaCharts: {
    title: 'Area charts',
    items: [
      { id: 'stacked-area', name: 'Stacked area', icon: AreaChart, preview: 'stacked-area' },
      { id: 'unstacked-area', name: 'Unstacked area', icon: Activity, preview: 'unstacked-area' },
      { id: 'proportional-area', name: 'Proportional area', icon: Layers, preview: 'proportional' },
      { id: 'streamgraph', name: 'Streamgraph', icon: Waves, preview: 'stream' },
    ]
  },
  hierarchyCharts: {
    title: 'Hierarchy charts',
    items: [
      { id: 'simple-packed', name: 'Simple packed', icon: CircleDashed, preview: 'packed' },
      { id: 'simple-treemap', name: 'Simple treemap', icon: LayoutGrid, preview: 'treemap' },
      { id: 'packed-circles', name: 'Packed circles', icon: Boxes, preview: 'circles' },
      { id: 'treemap', name: 'Treemap', icon: Grid3X3, preview: 'treemap-full' },
    ]
  },
  barRaceCharts: {
    title: 'Bar race charts',
    items: [
      { id: 'single-bar-race', name: 'Single color bar race', icon: BarChartHorizontal, preview: 'bar-race-single' },
      { id: 'bar-race', name: 'Bar race', icon: BarChart3, preview: 'bar-race' },
    ]
  },
  otherCharts: {
    title: 'Other charts',
    items: [
      { id: 'histogram', name: 'Histogram', icon: BarChart, preview: 'histogram' },
      { id: 'funnel', name: 'Funnel', icon: Filter, preview: 'funnel' },
      { id: 'radar', name: 'Radar', icon: Radar, preview: 'radar' },
    ]
  },
};

// Languages for translation with country flags
const LANGUAGES = [
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
  { code: 'as', name: 'Assamese', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
];

// Tone of voice options
const TONE_OPTIONS = [
  { id: 'original', name: 'Original' },
  { id: 'professional', name: 'Professional' },
  { id: 'conversational', name: 'Conversational' },
  { id: 'friendly', name: 'Friendly' },
  { id: 'informative', name: 'Informative' },
  { id: 'inspirational', name: 'Inspirational' },
];

// Mockup categories
const MOCKUP_CATEGORIES = [
  { id: 'ebook', name: 'eBook Covers' },
  { id: 'magazines', name: 'Magazines' },
  { id: 'reports', name: 'Reports' },
  { id: 'social', name: 'Social Media' },
  { id: 'ads', name: 'Advertisements' },
];

type SectionId = 'templates' | 'content' | 'images' | 'elements' | 'mockups' | 'translate';

const EbookDesignSidebar = ({
  bookTitle,
  chapters,
  selectedChapterId,
  onChapterSelect,
  onChapterAdd,
  onChapterTitleEdit,
  onChapterDelete,
  onChapterReorder,
  onContentSectionChange,
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
  const [viewingTemplateId, setViewingTemplateId] = useState<string | null>(null);
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);
  const [elementSearch, setElementSearch] = useState('');
  
  // Translate section state
  const [translateLanguage, setTranslateLanguage] = useState('');
  const [translateTone, setTranslateTone] = useState('original');
  const [translateScope, setTranslateScope] = useState<'page' | 'selection' | 'book'>('page');
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [showTranslated, setShowTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(languageSearchQuery.toLowerCase())
  );

  const viewingTemplate = TEMPLATES.find(t => t.id === viewingTemplateId);

  // Notify parent when content section changes
  useEffect(() => {
    onContentSectionChange?.(expandedSections.has('content'));
  }, [expandedSections, onContentSectionChange]);

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
        className={`w-full flex items-center justify-between px-3 py-2 transition-colors border-b border-gray-200 ${
          isExpanded 
            ? 'bg-gray-800 hover:bg-gray-700' 
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-gray-600'}`} />
          {!isCollapsed && (
            <span className={`font-semibold text-base ${isExpanded ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </span>
          )}
        </div>
        {!isCollapsed && (
          isExpanded ? (
            <ChevronUp className="w-4 h-4 text-white" />
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
        <div className="w-14 bg-white border-r border-gray-200 flex flex-col h-full min-h-0 flex-shrink-0 relative z-30 overflow-visible">
          {/* Expand Arrow - on edge */}
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute top-1/2 -translate-y-1/2 -right-2.5 z-50 w-5 h-10 bg-white border border-gray-300 rounded-r-md shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

          {/* Icon buttons for each section */}
          <div className="flex-1 flex flex-col py-2 pt-4">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['translate']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Languages className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Translate</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full min-h-0 flex-shrink-0 relative z-30 overflow-visible">
        {/* Collapse Arrow - positioned on canvas edge, matching right panel style */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-1/2 -translate-y-1/2 z-50 w-5 h-10 bg-white border border-gray-300 rounded-r-md shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center"
          style={{ left: '100%' }}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Scrollable sections container */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <SectionHeader id="templates" title="Templates" icon={Layers} />
          {expandedSections.has('templates') && (
            <div className="p-3 border-b border-gray-200">
              {viewingTemplate ? (
                // Template Pages View
                <div>
                  <button
                    onClick={() => setViewingTemplateId(null)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3 hover:text-emerald-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {viewingTemplate.name}
                  </button>
                  <button className="w-full py-2 px-4 mb-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Add All Pages
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingTemplate.pages.map((page, index) => (
                      <div
                        key={index}
                        className={`aspect-[3/4] rounded-lg border-2 border-gray-200 hover:border-emerald-400 transition-all overflow-hidden ${viewingTemplate.preview} relative cursor-pointer`}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center p-2">
                          <span className="text-xs font-medium text-gray-600 bg-white/80 px-2 py-1 rounded text-center">
                            {page}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}/{viewingTemplate.pages.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Templates Grid View
                <>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Choose A Design</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        className={`aspect-[3/4] rounded-lg border-2 border-gray-200 hover:border-emerald-400 transition-all overflow-hidden ${template.preview} relative group`}
                        onMouseEnter={() => setHoveredTemplateId(template.id)}
                        onMouseLeave={() => setHoveredTemplateId(null)}
                        onClick={() => setViewingTemplateId(template.id)}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 bg-white/80 px-2 py-1 rounded">
                            {template.name}
                          </span>
                        </div>
                        {/* Hover Overlay */}
                        {hoveredTemplateId === template.id && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
                            <span className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                              View Pages
                            </span>
                          </div>
                        )}
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
                </>
              )}
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
                          {chapter.pageNumber ?? (index + 1)}
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
                            {chapter.pageNumber ?? (index + 1)}
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

          {/* Elements Section */}
          <SectionHeader id="elements" title="Elements" icon={Box} />
          {expandedSections.has('elements') && (
            <div className="p-4 border-b border-gray-200 bg-white">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={elementSearch}
                  onChange={(e) => setElementSearch(e.target.value)}
                  placeholder="Press [Enter] to Search"
                  className="pl-9"
                />
              </div>

              {/* Browse Categories - Colorful Icons Grid */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Browse categories</h4>
                <div className="grid grid-cols-3 gap-3">
                  {BROWSE_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toast.success(`Opening ${category.name}`)}
                      className="group flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <div className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 group-hover:-rotate-3`}>
                        <category.icon className={`w-7 h-7 ${category.iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`} />
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Element Categories - Detailed Lists */}
              {Object.entries(ELEMENT_CATEGORIES).map(([key, category]) => (
                <div key={key} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-700">{category.title}</h4>
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      More
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {category.items.map((element) => (
                      <Tooltip key={element.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => toast.success(`Added ${element.name} to canvas`)}
                            className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                          >
                            <element.icon className="w-5 h-5 text-gray-600 transition-transform duration-200 group-hover:scale-110 group-hover:text-emerald-600" />
                            <span className="text-[10px] font-medium text-gray-700 text-center leading-tight group-hover:text-emerald-700">
                              {element.name}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{element.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
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
                  placeholder="Search Images"
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
                    placeholder="Describe the image you want to create"
                    className="w-full min-h-[60px] p-3 pr-10 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                  />
                  <button className="absolute bottom-3 right-3 p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
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

          {/* Translate Section */}
          <SectionHeader id="translate" title="Translate" icon={Languages} />
          {expandedSections.has('translate') && (
            <div className="p-4 border-b border-gray-200 flex flex-col">
              {/* Toggle between Original/Translated */}
              {showTranslated && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700">Currently viewing translated version</span>
                    <button
                      onClick={() => setShowTranslated(false)}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-800 underline"
                    >
                      View Original
                    </button>
                  </div>
                </div>
              )}

              {/* Translate to Language */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Translate To</h4>
                <Select value={translateLanguage} onValueChange={setTranslateLanguage}>
                  <SelectTrigger className="w-full border-gray-200 focus:ring-emerald-500">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px] bg-white z-50">
                    <div className="p-2 sticky top-0 bg-white border-b">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={languageSearchQuery}
                          onChange={(e) => setLanguageSearchQuery(e.target.value)}
                          placeholder="Search languages..."
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>
                    {filteredLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-xs text-gray-500">
                  Automatically Detect Current Language{' '}
                  <button className="text-emerald-600 hover:text-emerald-700 underline">(Edit)</button>
                </p>
              </div>

              {/* Translation Scope */}
              <div className="mb-6">
                <RadioGroup 
                  value={translateScope} 
                  onValueChange={(value) => setTranslateScope(value as 'page' | 'selection' | 'book')}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="page" id="translate-page" className="border-emerald-400 text-emerald-600" />
                    <Label htmlFor="translate-page" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Translate Page
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="selection" id="translate-selection" className="border-emerald-400 text-emerald-600" />
                    <Label htmlFor="translate-selection" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Translate Selected Text
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="book" id="translate-book" className="border-emerald-400 text-emerald-600" />
                    <Label htmlFor="translate-book" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Translate Entire Book
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Translate Button */}
              <button
                onClick={() => {
                  if (!translateLanguage) {
                    toast.error('Please select a target language');
                    return;
                  }
                  setIsTranslating(true);
                  const scopeLabel = translateScope === 'page' ? 'page' : translateScope === 'selection' ? 'selected text' : 'entire book';
                  const languageName = LANGUAGES.find(l => l.code === translateLanguage)?.name || translateLanguage;
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 2000)),
                    {
                      loading: `Translating ${scopeLabel} to ${languageName}...`,
                      success: () => {
                        setShowTranslated(true);
                        setIsTranslating(false);
                        return `Successfully translated ${scopeLabel} to ${languageName}`;
                      },
                      error: 'Translation failed',
                    }
                  );
                }}
                disabled={isTranslating || !translateLanguage}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Translate
              </button>

              {/* View Original/Translated Toggle (when translation exists) */}
              {showTranslated && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setShowTranslated(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Original
                  </button>
                  <button
                    onClick={() => setShowTranslated(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Translated
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EbookDesignSidebar;
