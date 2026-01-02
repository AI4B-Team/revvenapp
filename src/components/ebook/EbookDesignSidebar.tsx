import { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Layers, FileText, Image as ImageIcon, 
  Box, Presentation, Plus, Pencil, Search, Sparkles, Send, Upload, Loader2,
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
  Activity, Waves, CircleDashed, Boxes, Radar, Languages, Check, Users
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

// Template images
import minimalTemplate from '@/assets/templates/minimal.jpg';
import modernTemplate from '@/assets/templates/modern.jpg';
import classicTemplate from '@/assets/templates/classic.jpg';
import boldTemplate from '@/assets/templates/bold.jpg';
import elegantTemplate from '@/assets/templates/elegant.jpg';
import natureTemplate from '@/assets/templates/nature.jpg';

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

// Template options with pages and images
const TEMPLATES = [
  { 
    id: 'minimal', 
    name: 'Minimal', 
    image: minimalTemplate,
    description: 'Clean and simple design with elegant typography',
    layout: 'Single column with centered headers',
    pages: ['Cover', 'Table of Contents', 'Introduction', 'Chapter 1', 'Summary'] 
  },
  { 
    id: 'modern', 
    name: 'Modern', 
    image: modernTemplate,
    description: 'Contemporary look with gradient accents',
    layout: 'Two-column layout with sidebar elements',
    pages: ['Cover', 'Table of Contents', 'About', 'Features', 'Pricing', 'Contact'] 
  },
  { 
    id: 'classic', 
    name: 'Classic', 
    image: classicTemplate,
    description: 'Traditional book aesthetic with vintage charm',
    layout: 'Classic single column with ornate headers',
    pages: ['Cover', 'Preface', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Conclusion'] 
  },
  { 
    id: 'bold', 
    name: 'Bold', 
    image: boldTemplate,
    description: 'Vibrant colors with strong visual impact',
    layout: 'Full-bleed images with overlay text',
    pages: ['Cover', 'Mission', 'Vision', 'Team', 'Products'] 
  },
  { 
    id: 'elegant', 
    name: 'Elegant', 
    image: elegantTemplate,
    description: 'Sophisticated dark theme with gold accents',
    layout: 'Centered content with decorative borders',
    pages: ['Cover', 'Overview', 'Details', 'Gallery', 'Contact'] 
  },
  { 
    id: 'nature', 
    name: 'Nature', 
    image: natureTemplate,
    description: 'Fresh organic design with botanical elements',
    layout: 'Asymmetric layout with nature imagery',
    pages: ['Cover', 'Introduction', 'Ecosystem', 'Conservation', 'Action'] 
  },
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

type SectionId = 'templates' | 'content' | 'image' | 'text' | 'video' | 'audio' | 'elements' | 'mockups' | 'translate';
type MediaTab = 'stock' | 'creations' | 'community' | 'uploads';

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
  
  // Media sections state (Image, Video, Audio)
  const [imageTab, setImageTab] = useState<MediaTab>('stock');
  const [videoTab, setVideoTab] = useState<MediaTab>('stock');
  const [audioTab, setAudioTab] = useState<MediaTab>('stock');
  const [textTab, setTextTab] = useState<MediaTab>('stock');
  const [stockImages, setStockImages] = useState<any[]>([]);
  const [stockVideos, setStockVideos] = useState<any[]>([]);
  const [stockAudio, setStockAudio] = useState<any[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [isLoadingStockVideos, setIsLoadingStockVideos] = useState(false);
  const [isLoadingStockAudio, setIsLoadingStockAudio] = useState(false);
  const [stockPage, setStockPage] = useState(1);
  const [creationsImages, setCreationsImages] = useState<any[]>([]);
  const [isLoadingCreations, setIsLoadingCreations] = useState(false);
  const [communityImages, setCommunityImages] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<any[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [videoSearch, setVideoSearch] = useState('');
  const [audioSearch, setAudioSearch] = useState('');
  const [textSearch, setTextSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedStockRef = useRef(false);
  const hasFetchedStockVideosRef = useRef(false);
  const hasFetchedStockAudioRef = useRef(false);
  
  // Translate section state
  const [translateLanguage, setTranslateLanguage] = useState('');
  const [translateTone, setTranslateTone] = useState('original');
  const [translateScope, setTranslateScope] = useState<'page' | 'selection' | 'book'>('page');
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [showTranslated, setShowTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const PEXELS_API_KEY = "gXq4NKwHspnNWq4RUUraWlQOrtdgNXHZ0K8mNvT41w6PYQAHTm6RcHIT";

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(languageSearchQuery.toLowerCase())
  );

  const viewingTemplate = TEMPLATES.find(t => t.id === viewingTemplateId);

  // Fetch stock images from Pexels
  const fetchStockImages = async (query: string, page: number = 1) => {
    setIsLoadingStock(true);
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query || 'business professional')}&per_page=30&page=${page}`,
        {
          headers: {
            Authorization: PEXELS_API_KEY
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch stock images');
      
      const data = await response.json();
      if (page === 1) {
        setStockImages(data.photos || []);
      } else {
        setStockImages(prev => [...prev, ...(data.photos || [])]);
      }
      setStockPage(page);
    } catch (error) {
      console.error('Error fetching Pexels images:', error);
      toast.error('Failed to load stock images');
    } finally {
      setIsLoadingStock(false);
    }
  };

  // Fetch user's AI-generated images from database
  const fetchCreationsImages = async () => {
    setIsLoadingCreations(true);
    try {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreationsImages(data || []);
    } catch (error) {
      console.error('Error fetching creations:', error);
      toast.error('Failed to load creations');
    } finally {
      setIsLoadingCreations(false);
    }
  };

  // Fetch community images (sample data for now)
  const fetchCommunityImages = () => {
    const communityData = [
      { id: 'c1', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', creator: 'Alex' },
      { id: 'c2', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', creator: 'Sarah' },
      { id: 'c3', image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop', creator: 'Mike' },
      { id: 'c4', image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop', creator: 'Emma' },
      { id: 'c5', image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop', creator: 'Chris' },
      { id: 'c6', image_url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=400&fit=crop', creator: 'Lisa' },
    ];
    setCommunityImages(communityData);
  };

  // Handle AI image generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    setIsGeneratingImage(true);
    toast.info('Generating image...');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: imagePrompt,
          model: 'auto',
          aspectRatio: '1:1',
          numberOfImages: 1
        }
      });
      
      if (error) throw error;
      
      toast.success('Image generation started! Check Creations tab.');
      setImagePrompt('');
      // Refresh creations after a short delay
      setTimeout(() => {
        fetchCreationsImages();
      }, 3000);
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingImage(true);
    const file = files[0];
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('upload-reference-image', {
          body: {
            image: base64Image,
            filename: file.name
          }
        });
        
        if (error) throw error;
        
        toast.success('Image uploaded successfully');
        fetchCreationsImages();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Fetch stock videos from Pexels
  const fetchStockVideos = async (query: string) => {
    setIsLoadingStockVideos(true);
    try {
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query || 'business')}&per_page=20`,
        {
          headers: {
            Authorization: PEXELS_API_KEY
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch stock videos');
      
      const data = await response.json();
      setStockVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching Pexels videos:', error);
      toast.error('Failed to load stock videos');
    } finally {
      setIsLoadingStockVideos(false);
    }
  };

  // Sample stock audio data
  const fetchStockAudio = async () => {
    setIsLoadingStockAudio(true);
    try {
      // Simulated audio data
      const audioData = [
        { id: 'a1', name: 'Upbeat Corporate', duration: '2:30', url: '#' },
        { id: 'a2', name: 'Calm Ambient', duration: '3:15', url: '#' },
        { id: 'a3', name: 'Inspiring Piano', duration: '2:45', url: '#' },
        { id: 'a4', name: 'Tech Innovation', duration: '2:00', url: '#' },
        { id: 'a5', name: 'Soft Background', duration: '4:00', url: '#' },
        { id: 'a6', name: 'Energetic Beat', duration: '2:20', url: '#' },
      ];
      setStockAudio(audioData);
    } finally {
      setIsLoadingStockAudio(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const videoUrl = URL.createObjectURL(file);
    setUploadedVideos(prev => [...prev, { id: Date.now().toString(), name: file.name, url: videoUrl }]);
    toast.success('Video uploaded successfully');
  };

  // Handle audio upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const audioUrl = URL.createObjectURL(file);
    setUploadedAudio(prev => [...prev, { id: Date.now().toString(), name: file.name, url: audioUrl }]);
    toast.success('Audio uploaded successfully');
  };

  // Load stock media when sections open
  useEffect(() => {
    if (expandedSections.has('image') && !hasFetchedStockRef.current) {
      hasFetchedStockRef.current = true;
      fetchStockImages('business professional');
      fetchCreationsImages();
      fetchCommunityImages();
    }
    if (expandedSections.has('video') && !hasFetchedStockVideosRef.current) {
      hasFetchedStockVideosRef.current = true;
      fetchStockVideos('business');
    }
    if (expandedSections.has('audio') && !hasFetchedStockAudioRef.current) {
      hasFetchedStockAudioRef.current = true;
      fetchStockAudio();
    }
  }, [expandedSections]);

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
      if (prev.has(section)) {
        // Closing the current section
        return new Set();
      } else {
        // Opening a new section - close all others
        return new Set([section]);
      }
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
                    setExpandedSections(new Set(['text']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Type className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Text</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['image']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Image</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['video']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Video</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedSections(new Set(['audio']));
                  }}
                  className="p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <Music className="w-5 h-5 text-gray-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Audio</p>
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
                        className="aspect-[3/4] rounded-lg border-2 border-gray-200 hover:border-emerald-400 transition-all overflow-hidden relative cursor-pointer group"
                      >
                        <img 
                          src={viewingTemplate.image} 
                          alt={`${page} preview`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-2">
                          <span className="text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded text-center">
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
                        className="aspect-[3/4] rounded-lg border-2 border-gray-200 hover:border-emerald-400 transition-all overflow-hidden relative group"
                        onMouseEnter={() => setHoveredTemplateId(template.id)}
                        onMouseLeave={() => setHoveredTemplateId(null)}
                        onClick={() => setViewingTemplateId(template.id)}
                      >
                        <img 
                          src={template.image} 
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                          <span className="text-xs font-semibold text-white">
                            {template.name}
                          </span>
                          <p className="text-[10px] text-gray-200 line-clamp-1 mt-0.5">
                            {template.description}
                          </p>
                        </div>
                        {/* Hover Overlay */}
                        {hoveredTemplateId === template.id && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity gap-1">
                            <span className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                              View Pages
                            </span>
                            <span className="text-[10px] text-gray-200 px-2 text-center">
                              {template.layout}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
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
                  <h4 className="text-sm font-semibold text-gray-800">Outline</h4>
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
              <Button 
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => {
                  // Add new page logic - can be connected to parent handler
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Page
              </Button>
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
                    <h4 className="text-sm font-semibold text-gray-800">{category.title}</h4>
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

          {/* Text Section */}
          <SectionHeader id="text" title="Text" icon={Type} />
          {expandedSections.has('text') && (
            <div className="p-3 border-b border-gray-200">
              {/* Tab Links - Centered */}
              <div className="flex items-center justify-center gap-4 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setTextTab('stock')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    textTab === 'stock' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Images className="w-3.5 h-3.5" />
                  Stock
                </button>
                <button
                  onClick={() => setTextTab('creations')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    textTab === 'creations' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Creations
                </button>
                <button
                  onClick={() => setTextTab('community')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    textTab === 'community' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Community
                </button>
                <button
                  onClick={() => setTextTab('uploads')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    textTab === 'uploads' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Uploads
                </button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  placeholder="Press [Enter] To Search"
                  className="pl-9"
                />
              </div>
              
              <div className="text-center py-8 text-gray-400">
                <Type className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Text templates coming soon</p>
              </div>
            </div>
          )}

          {/* Image Section */}
          <SectionHeader id="image" title="Image" icon={ImageIcon} />
          {expandedSections.has('image') && (
            <div className="p-3 border-b border-gray-200">
              {/* Tab Links - Centered with Icons */}
              <div className="flex items-center justify-center gap-4 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setImageTab('stock')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    imageTab === 'stock' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Images className="w-3.5 h-3.5" />
                  Stock
                </button>
                <button
                  onClick={() => setImageTab('creations')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    imageTab === 'creations' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Creations
                </button>
                <button
                  onClick={() => setImageTab('community')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    imageTab === 'community' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Community
                </button>
                <button
                  onClick={() => setImageTab('uploads')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    imageTab === 'uploads' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Uploads
                </button>
              </div>
              
              {/* Stock Images Tab */}
              {imageTab === 'stock' && (
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={imageSearch}
                      onChange={(e) => setImageSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchStockImages(imageSearch || 'business professional', 1);
                        }
                      }}
                      placeholder="Press [Enter] To Search"
                      className="pl-9"
                    />
                  </div>
                  
                  {isLoadingStock ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                        {stockImages.map((photo: any) => (
                          <button
                            key={photo.id}
                            onClick={() => toast.success('Image added to canvas')}
                            className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all relative group"
                          >
                            <img 
                              src={photo.src?.medium || photo.src?.small} 
                              alt={photo.alt || 'Stock image'}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          </button>
                        ))}
                      </div>
                      {stockImages.length > 0 && (
                        <button
                          onClick={() => fetchStockImages(imageSearch || 'business professional', stockPage + 1)}
                          className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                        >
                          Load More
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Creations Tab */}
              {imageTab === 'creations' && (
                <div className="space-y-3">
                  {/* Generate Image Prompt at Top - Styled like reference */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-gray-700">Generate Image</span>
                    </div>
                    <div className="border-2 border-emerald-400 rounded-xl p-3 bg-white">
                      <div className="flex items-start gap-2">
                        <ImageIcon className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <textarea
                          id="ai-image-prompt"
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="Describe what you want to create..."
                          className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 resize-none border-none focus:outline-none bg-transparent min-h-[40px]"
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700">
                            <Sparkles className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImage || !imagePrompt.trim()}
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-full transition-colors"
                          >
                            {isGeneratingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Creations Gallery */}
                  {isLoadingCreations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : creationsImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Images className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No AI creations yet</p>
                      <p className="text-xs text-gray-400">Generate your first image above</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                      {creationsImages.map((image: any) => (
                        <button
                          key={image.id}
                          onClick={() => toast.success('Image added to canvas')}
                          className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all relative group"
                        >
                          <img 
                            src={image.image_url} 
                            alt={image.prompt || 'AI generated image'}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Community Tab */}
              {imageTab === 'community' && (
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Press [Enter] To Search"
                      className="pl-9"
                    />
                  </div>
                  
                  {communityImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Users className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No community images</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                      {communityImages.map((image: any) => (
                        <button
                          key={image.id}
                          onClick={() => toast.success('Image added to canvas')}
                          className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all relative group"
                        >
                          <img 
                            src={image.image_url} 
                            alt={`By ${image.creator}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-white font-medium">By {image.creator}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Uploads Tab */}
              {imageTab === 'uploads' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-400 text-gray-600 hover:text-emerald-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload Images
                  </button>
                  
                  {uploadedImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Upload className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No uploaded images</p>
                      <p className="text-xs text-gray-400">Upload your own images</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                      {uploadedImages.map((image: any) => (
                        <button
                          key={image.id}
                          onClick={() => toast.success('Image added to canvas')}
                          className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all relative group"
                        >
                          <img 
                            src={image.url} 
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Video Section */}
          <SectionHeader id="video" title="Video" icon={Video} />
          {expandedSections.has('video') && (
            <div className="p-3 border-b border-gray-200">
              {/* Tab Links - Centered with Icons */}
              <div className="flex items-center justify-center gap-4 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setVideoTab('stock')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    videoTab === 'stock' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Images className="w-3.5 h-3.5" />
                  Stock
                </button>
                <button
                  onClick={() => setVideoTab('creations')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    videoTab === 'creations' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Creations
                </button>
                <button
                  onClick={() => setVideoTab('community')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    videoTab === 'community' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Community
                </button>
                <button
                  onClick={() => setVideoTab('uploads')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    videoTab === 'uploads' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Uploads
                </button>
              </div>
              
              {/* Stock Videos Tab */}
              {videoTab === 'stock' && (
                <div className="space-y-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={videoSearch}
                      onChange={(e) => setVideoSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchStockVideos(videoSearch || 'business');
                        }
                      }}
                      placeholder="Press [Enter] To Search"
                      className="pl-9"
                    />
                  </div>
                  
                  {isLoadingStockVideos ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                      {stockVideos.map((video: any) => (
                        <button
                          key={video.id}
                          onClick={() => toast.success('Video added to canvas')}
                          className="aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all relative group"
                        >
                          <img 
                            src={video.image} 
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <Play className="w-8 h-8 text-white opacity-80" />
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Creations Tab */}
              {videoTab === 'creations' && (
                <div className="text-center py-8 text-gray-400">
                  <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No video creations yet</p>
                </div>
              )}

              {/* Community Tab */}
              {videoTab === 'community' && (
                <div className="space-y-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Press [Enter] To Search" className="pl-9" />
                  </div>
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No community videos</p>
                  </div>
                </div>
              )}

              {/* Uploads Tab */}
              {videoTab === 'uploads' && (
                <div className="space-y-3">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button 
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-400 text-gray-600 hover:text-emerald-600 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Videos
                  </button>
                  
                  {uploadedVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Upload className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No uploaded videos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                      {uploadedVideos.map((video: any) => (
                        <button
                          key={video.id}
                          onClick={() => toast.success('Video added to canvas')}
                          className="aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all relative group bg-gray-100"
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-8 h-8 text-gray-500" />
                          </div>
                          <div className="absolute bottom-1 left-1 right-1 text-[10px] text-gray-600 truncate">
                            {video.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Audio Section */}
          <SectionHeader id="audio" title="Audio" icon={Music} />
          {expandedSections.has('audio') && (
            <div className="p-3 border-b border-gray-200">
              {/* Tab Links - Centered with Icons */}
              <div className="flex items-center justify-center gap-4 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setAudioTab('stock')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    audioTab === 'stock' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Images className="w-3.5 h-3.5" />
                  Stock
                </button>
                <button
                  onClick={() => setAudioTab('creations')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    audioTab === 'creations' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Creations
                </button>
                <button
                  onClick={() => setAudioTab('community')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    audioTab === 'community' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Community
                </button>
                <button
                  onClick={() => setAudioTab('uploads')}
                  className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors ${
                    audioTab === 'uploads' 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Uploads
                </button>
              </div>
              
              {/* Stock Audio Tab */}
              {audioTab === 'stock' && (
                <div className="space-y-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={audioSearch}
                      onChange={(e) => setAudioSearch(e.target.value)}
                      placeholder="Press [Enter] To Search"
                      className="pl-9"
                    />
                  </div>
                  
                  {isLoadingStockAudio ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {stockAudio.map((audio: any) => (
                        <button
                          key={audio.id}
                          onClick={() => toast.success('Audio added to canvas')}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700">{audio.name}</p>
                            <p className="text-xs text-gray-500">{audio.duration}</p>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Creations Tab */}
              {audioTab === 'creations' && (
                <div className="text-center py-8 text-gray-400">
                  <Music className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No audio creations yet</p>
                </div>
              )}

              {/* Community Tab */}
              {audioTab === 'community' && (
                <div className="space-y-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Press [Enter] To Search" className="pl-9" />
                  </div>
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No community audio</p>
                  </div>
                </div>
              )}

              {/* Uploads Tab */}
              {audioTab === 'uploads' && (
                <div className="space-y-3">
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <button 
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-400 text-gray-600 hover:text-emerald-600 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Audio
                  </button>
                  
                  {uploadedAudio.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Upload className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No uploaded audio</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {uploadedAudio.map((audio: any) => (
                        <button
                          key={audio.id}
                          onClick={() => toast.success('Audio added to canvas')}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                            <Music className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 truncate">{audio.name}</p>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                    <h4 className="text-sm font-semibold text-gray-800">{category.name}</h4>
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
                  <SelectContent className="max-h-[280px] bg-white z-50 overflow-hidden">
                    <div className="p-2 sticky top-0 bg-white border-b z-10 shadow-sm">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={languageSearchQuery}
                          onChange={(e) => setLanguageSearchQuery(e.target.value)}
                          placeholder="Search Languages..."
                          className="pl-8 h-9 bg-white"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[220px]">
                      {filteredLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </div>
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
                className="w-full h-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white text-xs font-medium rounded-sm flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
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
