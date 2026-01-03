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
  Plus
} from 'lucide-react';
import { getPlatformIcon } from './SocialIcons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PostDetailModal from './PostDetailModal';
import { CalendarContentItem } from '@/data/sampleCalendarContent';

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  status: string;
  imageUrl?: string;
  type?: 'post' | 'story' | 'carousel' | 'reel';
  caption?: string;
  hashtags?: string[];
  accountName?: string;
  accountHandle?: string;
}

interface SocialContentCalendarProps {
  generatedContent?: ContentItem[];
  isGenerating: boolean;
}

type ViewMode = 'calendar' | 'list' | 'kanban' | 'grid';
type TimeRange = 'week' | 'month';

const SocialContentCalendar: React.FC<SocialContentCalendarProps> = ({ 
  generatedContent = [],
  isGenerating 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedPost, setSelectedPost] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use only generated content (no mock data)
  const allContent = useMemo(() => {
    return [...generatedContent] as ContentItem[];
  }, [generatedContent]);

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
  };

  const getContentForDate = (date: Date | null) => {
    if (!date) return [];
    return allContent.filter(
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

  const viewModeButtons = [
    { id: 'calendar' as ViewMode, icon: CalendarIcon, label: 'Calendar' },
    { id: 'list' as ViewMode, icon: List, label: 'Plan' },
    { id: 'kanban' as ViewMode, icon: Columns3, label: 'Kanban' },
    { id: 'grid' as ViewMode, icon: LayoutGrid, label: 'Grid' },
  ];

  // Render calendar cell content uniformly
  const renderContentCard = (item: ContentItem, compact: boolean = true) => (
    <div
      key={item.id}
      onClick={() => handlePostClick(item)}
      className="group relative bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all"
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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Reschedule</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-1 flex items-start gap-2">
        <div className="flex-shrink-0 w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
          {getPlatformIcon(item.platform, "w-3 h-3")}
        </div>
        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">{item.title}</p>
      </div>
    </div>
  );

  // Render Kanban View
  const renderKanbanView = () => {
    const columns = [
      { id: 'draft', label: 'Drafts', items: allContent.filter(c => c.status === 'draft') },
      { id: 'scheduled', label: 'Scheduled', items: allContent.filter(c => c.status === 'scheduled') },
      { id: 'published', label: 'Published', items: allContent.filter(c => c.status === 'published') },
    ];

    return (
      <div className="p-4 grid grid-cols-3 gap-4 min-h-[500px]">
        {columns.map(column => (
          <div key={column.id} className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-foreground">{column.label}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {column.items.length}
              </span>
            </div>
            <div className="space-y-2">
              {column.items.map(item => renderContentCard(item))}
              {column.items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No content
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
    const sortedContent = [...allContent].sort((a, b) => a.date.getTime() - b.date.getTime());
    
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
      {allContent.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No content created yet
        </div>
      ) : (
        allContent.map(item => (
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

  // Render Calendar View
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
                      <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline px-2">
                        +{content.length - 2} more
                      </button>
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
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {viewModeButtons.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === id 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
              <Sparkles className="w-4 h-4" />
              Best Time To Post
            </Button>
            <Button size="sm" className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
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
                {timeRange === 'month' ? 'Month' : 'Week'}
                <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
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
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Month Year */}
          <h2 className="text-lg font-semibold text-foreground">
            {monthName} <span className="text-muted-foreground font-normal">{year}</span>
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

          {/* Tools */}
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'calendar' && renderCalendarView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'grid' && renderGridView()}

      {/* Generation Status */}
      {isGenerating && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="font-medium">Generating content...</p>
            <p className="text-sm opacity-70">Creating your social media calendar</p>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      <PostDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={selectedPost}
      />
    </div>
  );
};

export default SocialContentCalendar;
