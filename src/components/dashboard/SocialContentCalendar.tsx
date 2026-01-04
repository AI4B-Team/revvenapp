import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search, 
  Download,
  MoreHorizontal,
  Calendar as CalendarIcon,
  List,
  Columns3,
  LayoutGrid,
  Sparkles,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Film,
  Play,
  Pencil,
  Share2,
  CalendarClock,
  Hand,
  Users,
  MoreVertical,
  RotateCcw,
  Image as ImageIcon,
  Grid3x3,
  RefreshCw,
  Layout,
  Tag,
  Expand,
  UserPlus,
  ListChecks,
  Maximize
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { getPlatformIcon } from './SocialIcons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PostDetailModal from './PostDetailModal';
import BestTimeToPostModal from './BestTimeToPostModal';
import ExportPostsModal from './calendar/ExportPostsModal';
import EventsModal from './calendar/EventsModal';
import LabelsModal from './calendar/LabelsModal';
import AddAccountModal from './calendar/AddAccountModal';
import TemplatesModal from './calendar/TemplatesModal';
import ContentRecyclingModal from './calendar/ContentRecyclingModal';
import FeedPreviewModal from './calendar/FeedPreviewModal';
import BulkActionsBar from './calendar/BulkActionsBar';
import PlatformWarnings, { generateWarnings } from './calendar/PlatformWarnings';
import EngagementOverlay, { generateMockEngagement } from './calendar/EngagementOverlay';
import { CalendarContentItem } from '@/data/sampleCalendarContent';
import { useToast } from '@/hooks/use-toast';

interface VideoScene {
  timestamp: string;
  visual: string;
  audio: string;
  text_overlay: string | null;
}

interface VideoScript {
  duration: string;
  scenes: VideoScene[];
}

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  status: string;
  imageUrl?: string;
  carouselImages?: string[] | null;
  type?: 'post' | 'story' | 'carousel' | 'reel';
  caption?: string;
  hashtags?: string[];
  accountName?: string;
  accountHandle?: string;
  videoScript?: VideoScript | null;
}

interface SocialContentCalendarProps {
  generatedContent?: ContentItem[];
  isGenerating: boolean;
  onDeletePost?: (postId: string) => void;
  onDeleteAllPosts?: () => void;
  onUpdatePost?: (updatedPost: ContentItem) => void;
}

type ViewMode = 'calendar' | 'list' | 'kanban' | 'grid' | 'feed';
type TimeRange = 'day' | 'week' | 'month';

// Filter types
interface FilterState {
  statuses: string[];
  labels: string[];
}

const STATUS_OPTIONS = [
  { id: 'scheduled', label: 'Scheduled', color: 'bg-emerald-500' },
  { id: 'draft', label: 'Draft', color: 'bg-slate-500' },
  { id: 'published', label: 'Published', color: 'bg-green-600' },
  { id: 'awaiting', label: 'Awaiting Approval', color: 'bg-amber-500' },
  { id: 'failed', label: 'Failed', color: 'bg-red-500' },
];

const LABEL_OPTIONS = [
  { id: 'influencer', label: 'INFLUENCER', color: 'bg-slate-800 dark:bg-slate-700' },
  { id: 'educational', label: 'EDUCATIONAL', color: 'bg-blue-600' },
  { id: 'promotional', label: 'PROMOTIONAL', color: 'bg-purple-600' },
  { id: 'engagement', label: 'ENGAGEMENT', color: 'bg-pink-600' },
  { id: 'behind-scenes', label: 'BEHIND THE SCENES', color: 'bg-amber-600' },
];

const SocialContentCalendar: React.FC<SocialContentCalendarProps> = ({ 
  generatedContent = [],
  isGenerating,
  onDeletePost,
  onDeleteAllPosts,
  onUpdatePost,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedPost, setSelectedPost] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBestTimeModalOpen, setIsBestTimeModalOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    labels: [],
  });
  const [previewPost, setPreviewPost] = useState<ContentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // New feature modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isRecyclingModalOpen, setIsRecyclingModalOpen] = useState(false);
  const [isFeedPreviewOpen, setIsFeedPreviewOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [reschedulePostId, setReschedulePostId] = useState<string | null>(null);
  
  // Labels state
  const [labels, setLabels] = useState([
    { id: 'influencer', name: 'INFLUENCER', color: 'bg-slate-800 dark:bg-slate-700' },
    { id: 'educational', name: 'EDUCATIONAL', color: 'bg-blue-600' },
    { id: 'promotional', name: 'PROMOTIONAL', color: 'bg-purple-600' },
    { id: 'engagement', name: 'ENGAGEMENT', color: 'bg-pink-600' },
    { id: 'behind-scenes', name: 'BEHIND THE SCENES', color: 'bg-amber-600' },
  ]);
  
  // Bulk selection
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  
  // Platform warnings
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();

  // === BULK ACTION HANDLERS ===
  const handleBulkDelete = () => {
    selectedPosts.forEach(postId => onDeletePost?.(postId));
    toast({ title: "Posts deleted", description: `${selectedPosts.size} posts have been deleted.` });
    setSelectedPosts(new Set());
  };

  const handleBulkDuplicate = () => {
    const postsToDuplicate = generatedContent.filter(p => selectedPosts.has(p.id));
    postsToDuplicate.forEach(post => {
      const newPost: ContentItem = {
        ...post,
        id: `${post.id}-copy-${Date.now()}`,
        title: `${post.title} (Copy)`,
        status: 'draft',
        date: new Date(post.date.getTime() + 24 * 60 * 60 * 1000), // Next day
      };
      onUpdatePost?.(newPost);
    });
    toast({ title: "Posts duplicated", description: `${selectedPosts.size} posts have been duplicated as drafts.` });
    setSelectedPosts(new Set());
  };

  const handleBulkReschedule = () => {
    // For bulk reschedule, we'll shift all by 7 days
    const postsToReschedule = generatedContent.filter(p => selectedPosts.has(p.id));
    postsToReschedule.forEach(post => {
      const newDate = new Date(post.date);
      newDate.setDate(newDate.getDate() + 7);
      onUpdatePost?.({ ...post, date: newDate });
    });
    toast({ title: "Posts rescheduled", description: `${selectedPosts.size} posts moved forward by 7 days.` });
    setSelectedPosts(new Set());
  };

  const handleBulkChangeStatus = (status: string) => {
    const postsToUpdate = generatedContent.filter(p => selectedPosts.has(p.id));
    postsToUpdate.forEach(post => {
      onUpdatePost?.({ ...post, status });
    });
    toast({ title: "Status updated", description: `${selectedPosts.size} posts changed to ${status}.` });
    setSelectedPosts(new Set());
  };

  const handleBulkAssignLabel = (labelId: string) => {
    // In a real app, this would update a label field on the posts
    toast({ title: "Label assigned", description: `Label applied to ${selectedPosts.size} posts.` });
    setSelectedPosts(new Set());
  };

  const handleClearSelection = () => {
    setSelectedPosts(new Set());
  };

  const togglePostSelection = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  // === INDIVIDUAL POST ACTION HANDLERS ===
  const handleEditPost = (item: ContentItem) => {
    setSelectedPost(item);
    setIsModalOpen(true);
  };

  const handleReschedulePost = (postId: string) => {
    const post = generatedContent.find(p => p.id === postId);
    if (post) {
      const newDate = new Date(post.date);
      newDate.setDate(newDate.getDate() + 1);
      onUpdatePost?.({ ...post, date: newDate });
      toast({ title: "Post rescheduled", description: "Post moved to tomorrow." });
    }
  };

  const handleDuplicatePost = (item: ContentItem) => {
    const newPost: ContentItem = {
      ...item,
      id: `${item.id}-copy-${Date.now()}`,
      title: `${item.title} (Copy)`,
      status: 'draft',
      date: new Date(item.date.getTime() + 24 * 60 * 60 * 1000),
    };
    onUpdatePost?.(newPost);
    toast({ title: "Post duplicated", description: "A copy has been created as draft." });
  };

  const handleRequestApproval = (item: ContentItem) => {
    onUpdatePost?.({ ...item, status: 'awaiting' });
    toast({ title: "Approval requested", description: "Post sent for approval." });
  };

  const handleSchedulePost = (item: ContentItem) => {
    onUpdatePost?.({ ...item, status: 'scheduled' });
    toast({ title: "Post scheduled", description: "Post has been scheduled." });
  };

  // === TEMPLATE HANDLER ===
  const handleSelectTemplate = (template: { name: string; caption: string; platform: string; hashtags: string[] }) => {
    const newPost: ContentItem = {
      id: `template-${Date.now()}`,
      title: template.name,
      platform: template.platform,
      date: new Date(),
      status: 'draft',
      caption: template.caption,
      hashtags: template.hashtags,
    };
    onUpdatePost?.(newPost);
    toast({ title: "Template applied", description: `New draft created from "${template.name}" template.` });
    setIsTemplatesModalOpen(false);
  };

  // === RECYCLING HANDLER ===
  const handleRecyclePost = (postId: string, scheduledDate: Date) => {
    // Find a mock post or use existing
    const newPost: ContentItem = {
      id: `recycled-${Date.now()}`,
      title: "Recycled post",
      platform: 'instagram',
      date: scheduledDate,
      status: 'scheduled',
      caption: "This is recycled content from a top-performing post.",
    };
    onUpdatePost?.(newPost);
    toast({ title: "Content recycled", description: `Post scheduled for ${scheduledDate.toLocaleDateString()}.` });
  };

  // Use only generated content (no mock data)
  const allContent = useMemo(() => {
    return [...generatedContent] as ContentItem[];
  }, [generatedContent]);

  // Get pillar/label for content item
  const getPillarId = (item: ContentItem): string => {
    if (item.type === 'reel') return 'influencer';
    if (item.type === 'carousel') return 'educational';
    if (item.type === 'story') return 'engagement';
    // Default random assignment for demo
    const pillars = ['influencer', 'educational', 'promotional', 'engagement', 'behind-scenes'];
    return pillars[Math.abs(item.id.charCodeAt(0)) % pillars.length];
  };

  // Filter content based on selected filters
  const filteredContent = useMemo(() => {
    if (filters.statuses.length === 0 && filters.labels.length === 0) {
      return allContent;
    }
    
    return allContent.filter(item => {
      const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(item.status);
      const labelMatch = filters.labels.length === 0 || filters.labels.includes(getPillarId(item));
      return statusMatch && labelMatch;
    });
  }, [allContent, filters]);

  // Filter helpers
  const toggleStatusFilter = (statusId: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(statusId)
        ? prev.statuses.filter(s => s !== statusId)
        : [...prev.statuses, statusId]
    }));
  };

  const toggleLabelFilter = (labelId: string) => {
    setFilters(prev => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter(l => l !== labelId)
        : [...prev.labels, labelId]
    }));
  };

  const resetFilters = () => {
    setFilters({ statuses: [], labels: [] });
  };

  const hasActiveFilters = filters.statuses.length > 0 || filters.labels.length > 0;

  const handleDeletePost = (postId: string) => {
    onDeletePost?.(postId);
    toast({
      title: "Post deleted",
      description: "The post has been removed from your content plan.",
    });
    setPostToDelete(null);
  };

  const handleDeleteAllPosts = () => {
    onDeleteAllPosts?.();
    toast({
      title: "All content deleted",
      description: "Your content plan has been cleared.",
    });
    setIsDeleteAllDialogOpen(false);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    const mondayAdjustedStart = startingDay === 0 ? 6 : startingDay - 1;
    
    for (let i = 0; i < mondayAdjustedStart; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
  const year = currentMonth.getFullYear();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setCurrentDate(new Date());
  };

  // Day/Week navigation
  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  // Get week days starting from Monday
  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const monday = new Date(date);
    monday.setDate(diff);
    
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Get content for a specific hour on a date
  const getContentForHour = (date: Date, hour: number) => {
    return filteredContent.filter(item => {
      const itemDate = item.date;
      return itemDate.toDateString() === date.toDateString() && itemDate.getHours() === hour;
    });
  };

  const getContentForDate = (date: Date | null) => {
    if (!date) return [];
    return filteredContent.filter(
      item => item.date.toDateString() === date.toDateString()
    );
  };

  const handlePostClick = (item: ContentItem) => {
    setSelectedPost(item);
    setIsModalOpen(true);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Sample holidays/events
  const getHolidaysForDate = (date: Date | null) => {
    if (!date) return [];
    const holidays: { [key: string]: string } = {
      '12-25': 'Christmas',
      '12-31': "New Year's Eve",
      '1-1': "New Year's Day",
      '12-14': 'Hanukkah',
      '12-21': 'First Day of Winter',
    };
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    return holidays[key] ? [holidays[key]] : [];
  };


  // Render calendar cell content uniformly with animation
  const renderContentCard = (item: ContentItem, compact: boolean = true) => (
    <div
      key={item.id}
      onClick={() => handlePostClick(item)}
      className="group relative bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
      style={{ animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="opacity-0 group-hover:opacity-100 ml-auto p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(item); }}>
              <Pencil className="w-3 h-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReschedulePost(item.id); }}>
              <CalendarClock className="w-3 h-3 mr-2" />
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicatePost(item); }}>
              <ListChecks className="w-3 h-3 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePost(item.id);
              }}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-1 flex items-start gap-2">
        <div className="flex-shrink-0 w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
          {getPlatformIcon(item.platform, "w-3 h-3")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground line-clamp-2 leading-relaxed">{item.title}</p>
          {/* Video script indicator */}
          {item.type === 'reel' && item.videoScript && (
            <div className="flex items-center gap-1 mt-1">
              <Film className="w-3 h-3 text-purple-500" />
              <span className="text-[10px] text-purple-500 font-medium">
                {item.videoScript.duration} • {item.videoScript.scenes?.length || 0} scenes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Kanban View
  const renderKanbanView = () => {
    const columns = [
      { id: 'draft', label: 'Drafts', items: filteredContent.filter(c => c.status === 'draft'), color: 'bg-slate-500' },
      { id: 'awaiting', label: 'Awaiting Approval', items: filteredContent.filter(c => c.status === 'awaiting'), color: 'bg-amber-500' },
      { id: 'scheduled', label: 'Scheduled', items: filteredContent.filter(c => c.status === 'scheduled'), color: 'bg-emerald-500' },
      { id: 'published', label: 'Published', items: filteredContent.filter(c => c.status === 'published'), color: 'bg-green-600' },
    ];

    // Content pillars for tagging
    const getPillarForContent = (item: ContentItem): { label: string; color: string } | null => {
      const pillars = [
        { label: 'INFLUENCER', color: 'bg-slate-800 dark:bg-slate-700 text-white' },
        { label: 'EDUCATIONAL', color: 'bg-blue-600 text-white' },
        { label: 'PROMOTIONAL', color: 'bg-purple-600 text-white' },
        { label: 'ENGAGEMENT', color: 'bg-pink-600 text-white' },
        { label: 'BEHIND THE SCENES', color: 'bg-amber-600 text-white' },
      ];
      // Assign pillar based on content type or randomly for demo
      if (item.type === 'reel') return pillars[0];
      if (item.type === 'carousel') return pillars[1];
      if (item.type === 'story') return pillars[3];
      return pillars[Math.floor(Math.random() * pillars.length)];
    };

    const renderKanbanCard = (item: ContentItem) => {
      const pillar = getPillarForContent(item);
      const isSelected = selectedPosts.has(item.id);
      
      return (
        <div 
          key={item.id}
          className={`bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
            isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-border'
          }`}
          onClick={() => handlePostClick(item)}
        >
          {/* Card Header */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Checkbox for bulk selection */}
              <Checkbox
                checked={isSelected}
                onCheckedChange={(e) => { togglePostSelection(item.id); }}
                onClick={(e) => e.stopPropagation()}
                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              {/* Account Avatar with Platform Badge */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                  {item.accountName?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center">
                  {getPlatformIcon(item.platform, 'w-2.5 h-2.5')}
                </div>
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                {item.accountHandle || item.accountName || 'Your Account'}
              </span>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-1.5 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border w-48">
                <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); handleRequestApproval(item); }}>
                  <Hand className="w-4 h-4" />
                  Request Approval
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); handleSchedulePost(item); }}>
                  <CalendarClock className="w-4 h-4" />
                  Schedule
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); handleEditPost(item); }}>
                  <Pencil className="w-4 h-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); handleDuplicatePost(item); }}>
                  <ListChecks className="w-4 h-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); handleReschedulePost(item.id); }}>
                  <CalendarClock className="w-4 h-4" />
                  Reschedule (+1 day)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePost(item.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Date/Time Row */}
          <div className="px-3 pb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Pencil className="w-3 h-3" />
            <span className="font-medium">
              {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
            <span className="uppercase">
              {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Caption Preview */}
          {(item.caption || item.title) && (
            <div className="px-3 pb-2">
              <p className="text-sm text-foreground line-clamp-2">
                {item.caption || item.title}
              </p>
            </div>
          )}

          {/* Image Preview */}
          {item.imageUrl && (
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {item.type === 'reel' && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-foreground ml-0.5" />
                  </div>
                </div>
              )}
              {item.type === 'carousel' && item.carouselImages && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  1/{item.carouselImages.length + 1}
                </div>
              )}
            </div>
          )}

          {/* Content Pillar Tag */}
          {pillar && (
            <div className="p-3 pt-2">
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${pillar.color}`}>
                {pillar.label}
              </span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="p-4 flex gap-4 min-h-[500px] overflow-x-auto">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80 bg-muted/30 rounded-xl p-3 flex flex-col">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{column.label}</h3>
                <span className="text-sm text-muted-foreground">{column.items.length}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {column.items.map(item => renderKanbanCard(item))}
              {column.items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                  <p className="font-medium">No Content</p>
                  <p className="text-xs mt-1">Drag Posts Here Or Click + To Add</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render List View
  const renderListView = () => {
    const sortedContent = [...filteredContent].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return (
      <div className="p-4">
        <div className="bg-muted/30 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">Platform</div>
            <div className="col-span-5">Content</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1"></div>
          </div>
          {sortedContent.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No scheduled content
            </div>
          ) : (
            sortedContent.map(item => (
              <div 
                key={item.id} 
                onClick={() => handlePostClick(item)}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center cursor-pointer"
              >
                <div className="col-span-1">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    {getPlatformIcon(item.platform, "w-4 h-4")}
                  </div>
                </div>
                <div className="col-span-5 text-sm text-foreground truncate">{item.title}</div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
                <div className="col-span-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'scheduled' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : item.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-muted rounded" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(item); }}>
                        <Pencil className="w-3 h-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReschedulePost(item.id); }}>
                        <CalendarClock className="w-3 h-3 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicatePost(item); }}>
                        <ListChecks className="w-3 h-3 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(item.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render Grid View
  const renderGridView = () => (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredContent.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          {hasActiveFilters ? 'No content matches your filters' : 'No content created yet'}
        </div>
      ) : (
        filteredContent.map(item => (
          <div 
            key={item.id} 
            onClick={() => handlePostClick(item)}
            className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-black/30 flex items-center justify-center">
                {getPlatformIcon(item.platform, "w-6 h-6")}
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-foreground line-clamp-2 mb-2">{item.title}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  item.status === 'scheduled' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-muted'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Render Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayContent = getContentForDate(currentDate);
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }).toUpperCase().replace(',', '');
    
    // Get pillar info for preview
    const getPillarInfo = (item: ContentItem) => {
      const pillarId = getPillarId(item);
      return LABEL_OPTIONS.find(l => l.id === pillarId);
    };

    return (
      <div className="flex h-[600px]">
        {/* Timeline */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          {hours.map(hour => {
            const hourContent = getContentForHour(currentDate, hour);
            const formattedHour = hour === 0 
              ? '12:00 AM' 
              : hour < 12 
                ? `${hour}:00 AM` 
                : hour === 12 
                  ? '12:00 PM' 
                  : `${hour - 12}:00 PM`;
            
            return (
              <div key={hour} className="flex min-h-[60px] border-b border-border/50">
                <div className="w-24 flex-shrink-0 px-4 py-2 text-sm text-muted-foreground border-r border-border/50">
                  {formattedHour}
                </div>
                <div className="flex-1 p-2 hover:bg-muted/20 transition-colors">
                  {hourContent.map(item => {
                    const pillar = getPillarInfo(item);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setPreviewPost(item);
                          handlePostClick(item);
                        }}
                        className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(item); }}>
                                <Pencil className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReschedulePost(item.id); }}>
                                <CalendarClock className="w-3 h-3 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicatePost(item); }}>
                                <ListChecks className="w-3 h-3 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePost(item.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {pillar && (
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2 ${pillar.color} text-white`}>
                            {pillar.label}
                          </span>
                        )}
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center flex-shrink-0">
                            {getPlatformIcon(item.platform, "w-3 h-3")}
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">{item.caption || item.title}</p>
                        </div>
                        {item.accountHandle && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {item.accountHandle}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Panel */}
        <div className="w-80 bg-muted/20 p-4 flex flex-col items-center justify-center">
          {previewPost ? (
            <div className="w-full max-w-xs">
              <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-4">
                {previewPost.imageUrl ? (
                  <img src={previewPost.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground line-clamp-4">{previewPost.caption || previewPost.title}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-xl flex items-center justify-center">
                <div className="w-8 h-4 bg-muted-foreground/30 rounded mb-1" />
              </div>
              <div className="w-16 h-8 bg-muted rounded mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Select post to preview</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekLabel = `${weekDays[0].toLocaleDateString('en-US', { month: 'long' })} ${weekDays[0].getFullYear()}`;
    
    // Get pillar info for cards
    const getPillarInfo = (item: ContentItem) => {
      const pillarId = getPillarId(item);
      return LABEL_OPTIONS.find(l => l.id === pillarId);
    };
    
    return (
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((date, index) => {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const today = isToday(date);
            return (
              <div key={index} className="text-center border-b border-border py-2">
                <div className="text-sm font-medium text-muted-foreground">{dayName}</div>
                <div className={`mt-1 inline-flex items-center justify-center text-lg font-semibold ${
                  today 
                    ? 'bg-emerald-500 text-white w-8 h-8 rounded-full' 
                    : 'text-foreground'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week Content Grid */}
        <div className="grid grid-cols-7 min-h-[500px]">
          {weekDays.map((date, index) => {
            const content = getContentForDate(date);
            const holidays = getHolidaysForDate(date);
            const today = isToday(date);
            
            return (
              <div 
                key={index} 
                className={`border-r border-b border-border p-2 ${
                  index === 0 ? 'border-l' : ''
                } ${today ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
              >
                {/* Add button */}
                <button className="w-full flex items-center justify-center p-1 mb-2 rounded-lg hover:bg-muted transition-colors opacity-0 hover:opacity-100">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
                
                {/* Holidays */}
                {holidays.map((holiday, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mb-2 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {holiday}
                  </div>
                ))}
                
                {/* Content Cards */}
                <div className="space-y-2">
                  {content.map(item => {
                    const pillar = getPillarInfo(item);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handlePostClick(item)}
                        className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                      >
                        {/* Time & Menu */}
                        <div className="px-2 pt-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <button className="p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(item); }}>
                                <Pencil className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReschedulePost(item.id); }}>
                                <CalendarClock className="w-3 h-3 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicatePost(item); }}>
                                <ListChecks className="w-3 h-3 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePost(item.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Pillar Label */}
                        {pillar && (
                          <div className="px-2 pt-1">
                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${pillar.color} text-white`}>
                              {pillar.label}
                            </span>
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="p-2">
                          <div className="flex items-start gap-1.5">
                            <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center flex-shrink-0">
                              {getPlatformIcon(item.platform, "w-2.5 h-2.5")}
                            </div>
                            <p className="text-xs text-foreground line-clamp-2">{item.caption || item.title}</p>
                          </div>
                        </div>
                        
                        {/* Image Preview */}
                        {item.imageUrl && (
                          <div className="aspect-[4/3] overflow-hidden">
                            <img 
                              src={item.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                            {item.type === 'reel' && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Account */}
                        {item.accountHandle && (
                          <div className="px-2 pb-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {item.accountHandle}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Calendar View (Month)
  const renderCalendarView = () => (
    <div className="p-4">
      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-3 border-b border-border">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const content = getContentForDate(date);
          const today = isToday(date);
          const holidays = getHolidaysForDate(date);
          
          return (
            <div
              key={index}
              className={`min-h-[140px] border-b border-r border-border p-2 transition-colors ${
                date
                  ? 'hover:bg-muted/30 cursor-pointer'
                  : 'bg-muted/20'
              } ${index % 7 === 0 ? 'border-l' : ''}`}
            >
              {date && (
                <>
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      today 
                        ? 'bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center' 
                        : 'text-foreground'
                    }`}>
                      {date.getDate()}
                    </span>
                    {content.length > 0 && (
                      <button className="opacity-0 hover:opacity-100 p-1 hover:bg-muted rounded transition-all">
                        <Plus className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  
                  {/* Holidays */}
                  {holidays.map((holiday, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mb-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {holiday}
                    </div>
                  ))}
                  
                  {/* Content Items */}
                  <div className="space-y-1">
                    {content.slice(0, 2).map(item => renderContentCard(item))}
                    
                    {content.length > 2 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button 
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline px-2"
                          >
                            +{content.length - 2} more
                          </button>
                        </PopoverTrigger>
                        <PopoverContent 
                          align="start" 
                          className="w-72 p-2 bg-popover border-border shadow-lg z-50 max-h-80 overflow-y-auto"
                        >
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground px-2 pb-1 border-b border-border">
                              {content.length - 2} more post{content.length - 2 > 1 ? 's' : ''} on {date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            {content.slice(2).map(item => (
                              <div
                                key={item.id}
                                onClick={() => handlePostClick(item)}
                                className="group bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-start gap-2">
                                  <div className="flex-shrink-0 w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                                    {getPlatformIcon(item.platform, "w-3 h-3")}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-foreground line-clamp-2 leading-relaxed">{item.title}</p>
                                    {item.type === 'reel' && item.videoScript && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <Film className="w-3 h-3 text-purple-500" />
                                        <span className="text-[10px] text-purple-500 font-medium">
                                          {item.videoScript.duration}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mt-8">
      {/* Main Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          {/* Left: View Mode Tabs */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white gap-2' 
                : 'gap-2'}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white gap-2' 
                : 'gap-2'}
            >
              <List className="w-4 h-4" />
              Plan
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white gap-2' 
                : 'gap-2'}
            >
              <Columns3 className="w-4 h-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white gap-2' 
                : 'gap-2'}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'feed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsFeedPreviewOpen(true)}
              className="gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              Feed
            </Button>

            {/* Generating Status Indicator - beside Feed */}
            {isGenerating && (
              <div className="flex items-center gap-2 ml-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg animate-in fade-in slide-in-from-left-2">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  Generating{allContent.length > 0 ? ` (${allContent.length})` : '...'}
                </span>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {allContent.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setIsDeleteAllDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete All
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              onClick={() => setIsBestTimeModalOpen(true)}
            >
              <Sparkles className="w-4 h-4" />
              Best Time To Post
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
                  <Plus className="w-4 h-4" />
                  New Post
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2">
                  <Pencil className="w-4 h-4" />
                  Create Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsTemplatesModalOpen(true)} className="gap-2">
                  <Layout className="w-4 h-4" />
                  Use Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRecyclingModalOpen(true)} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Recycle Content
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sub Header: Navigation & Tools */}
      <div className="px-6 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Time Range Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
                <LayoutGrid className="w-4 h-4" />
                {timeRange === 'month' ? 'Month' : timeRange === 'week' ? 'Week' : 'Day'}
                <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem onClick={() => setTimeRange('day')}>Day</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('week')}>Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('month')}>Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Calendar Navigation */}
          <div className="flex items-center gap-1">
            <button 
              onClick={goToToday}
              className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
              title="Today"
            >
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
            </button>
            <button 
              onClick={() => {
                if (timeRange === 'day') navigateDay('prev');
                else if (timeRange === 'week') navigateWeek('prev');
                else navigateMonth('prev');
              }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button 
              onClick={() => {
                if (timeRange === 'day') navigateDay('next');
                else if (timeRange === 'week') navigateWeek('next');
                else navigateMonth('next');
              }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Date Display */}
          <h2 className="text-lg font-semibold text-foreground">
            {timeRange === 'day' ? (
              <>
                {currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()},{' '}
                {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}{' '}
                <span className="text-muted-foreground font-normal">{currentDate.getFullYear()}</span>
              </>
            ) : timeRange === 'week' ? (
              <>
                {weekDays[0].toLocaleDateString('en-US', { month: 'long' })}{' '}
                <span className="text-muted-foreground font-normal">{weekDays[0].getFullYear()}</span>
              </>
            ) : (
              <>
                {monthName} <span className="text-muted-foreground font-normal">{year}</span>
              </>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Drafts Toggle */}
          <div className="flex items-center gap-2 mr-4">
            <div className="w-8 h-4 bg-emerald-500 rounded-full relative cursor-pointer">
              <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
            <span className="text-sm text-muted-foreground">Drafts</span>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          </div>

          {/* Search */}
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-2">
              <Input 
                placeholder="Search posts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background"
              />
            </PopoverContent>
          </Popover>
          
          {/* Filter Popover */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <button className={`p-2 rounded-lg transition-colors relative ${
                hasActiveFilters 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' 
                  : 'hover:bg-muted text-muted-foreground'
              }`}>
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-0 bg-popover border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Filters</h3>
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
              
              {/* Status Filters */}
              <div className="px-4 py-3 border-b border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Status</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.statuses.length === 0}
                      onCheckedChange={() => setFilters(prev => ({ ...prev, statuses: [] }))}
                    />
                    <span className="text-sm text-foreground">Select All</span>
                  </label>
                  {STATUS_OPTIONS.map(status => (
                    <label key={status.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={filters.statuses.includes(status.id)}
                        onCheckedChange={() => toggleStatusFilter(status.id)}
                      />
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      <span className="text-sm text-foreground">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Labels Filters */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-foreground">Labels</h4>
                  <button 
                    onClick={() => { setIsFilterOpen(false); setIsLabelsModalOpen(true); }}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    Manage
                  </button>
                </div>
                <div className="space-y-2">
                  {LABEL_OPTIONS.map(label => (
                    <label key={label.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={filters.labels.includes(label.id)}
                        onCheckedChange={() => toggleLabelFilter(label.id)}
                      />
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${label.color} text-white`}>
                        {label.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>
          
          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setIsFeedPreviewOpen(true)} className="gap-2">
                <Maximize className="w-4 h-4" />
                Open Full Screen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddAccountModalOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEventsModalOpen(true)} className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                Calendar Events
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsLabelsModalOpen(true)} className="gap-2">
                <Tag className="w-4 h-4" />
                Manage Labels
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsTemplatesModalOpen(true)} className="gap-2">
                <Layout className="w-4 h-4" />
                Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsRecyclingModalOpen(true)} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Content Recycling
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'calendar' && timeRange === 'day' && renderDayView()}
      {viewMode === 'calendar' && timeRange === 'week' && renderWeekView()}
      {viewMode === 'calendar' && timeRange === 'month' && renderCalendarView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'grid' && renderGridView()}

      {/* Generation Status - shown in header, removed from fixed bottom */}

      {/* Post Detail Modal */}
      <PostDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={selectedPost}
        onSave={(updatedPost) => {
          onUpdatePost?.(updatedPost);
          setSelectedPost(updatedPost);
          toast({
            title: "Post updated",
            description: "Your changes have been saved.",
          });
        }}
      />

      {/* Best Time To Post Modal */}
      <BestTimeToPostModal
        isOpen={isBestTimeModalOpen}
        onClose={() => setIsBestTimeModalOpen(false)}
      />

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete All Content?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {allContent.length} posts from your content plan. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAllPosts}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Feature Modals */}
      <ExportPostsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        posts={filteredContent}
      />
      
      <EventsModal
        isOpen={isEventsModalOpen}
        onClose={() => setIsEventsModalOpen(false)}
      />
      
      <LabelsModal
        isOpen={isLabelsModalOpen}
        onClose={() => setIsLabelsModalOpen(false)}
        labels={labels}
        onLabelsChange={setLabels}
      />
      
      <AddAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
      />
      
      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      
      <ContentRecyclingModal
        isOpen={isRecyclingModalOpen}
        onClose={() => setIsRecyclingModalOpen(false)}
        topPerformingPosts={[]}
        onRecyclePost={handleRecyclePost}
      />
      
      <FeedPreviewModal
        isOpen={isFeedPreviewOpen}
        onClose={() => setIsFeedPreviewOpen(false)}
        posts={filteredContent}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedPosts.size}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkDuplicate={handleBulkDuplicate}
        onBulkReschedule={handleBulkReschedule}
        onBulkChangeStatus={handleBulkChangeStatus}
        onBulkAssignLabel={handleBulkAssignLabel}
        labels={labels}
      />
    </div>
  );
};

export default SocialContentCalendar;
