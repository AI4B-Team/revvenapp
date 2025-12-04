import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, Sparkles } from 'lucide-react';
import { getPlatformIcon } from './SocialIcons';

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  date: Date;
  status: string;
}

interface SocialContentCalendarProps {
  generatedContent: ContentItem[];
  isGenerating: boolean;
}

const SocialContentCalendar: React.FC<SocialContentCalendarProps> = ({ 
  generatedContent,
  isGenerating 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduleView, setScheduleView] = useState('schedule');
  const [calendarView, setCalendarView] = useState('monthly');
  const [layoutView, setLayoutView] = useState('calendar');

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
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

  const getContentForDate = (date: Date | null) => {
    if (!date) return [];
    return generatedContent.filter(
      item => item.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden mt-8">
      {/* Schedule Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex bg-muted rounded-xl p-1">
              <button
                onClick={() => setScheduleView('schedule')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  scheduleView === 'schedule' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setScheduleView('plan')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  scheduleView === 'plan' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Plan
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-emerald-500/40 transition-all">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-600 font-medium">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - {new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => navigateMonth('prev')} className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-medium">Month</button>
              <button onClick={() => navigateMonth('next')} className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle Row */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex bg-emerald-500 rounded-xl p-1">
              <button
                onClick={() => setCalendarView('weekly')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  calendarView === 'weekly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setCalendarView('monthly')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  calendarView === 'monthly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>
            
            <div className="flex bg-cyan-500 rounded-xl p-1">
              <button
                onClick={() => setLayoutView('calendar')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  layoutView === 'calendar' ? 'bg-white text-cyan-600 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setLayoutView('kanban')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  layoutView === 'kanban' ? 'bg-white text-cyan-600 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                Kanban
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-foreground" onClick={() => navigateMonth('prev')} />
              <span className="font-medium text-foreground">{monthName}</span>
              <ChevronRight className="w-4 h-4 cursor-pointer hover:text-foreground" onClick={() => navigateMonth('next')} />
            </div>
            
            <button className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-4 h-4" />
              Search
            </button>
            
            <button className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Month Label */}
      <div className="flex items-center justify-center py-3">
        <div className="flex items-center gap-3">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-emerald-300" />
          <span className="text-emerald-600 font-semibold">{monthName}</span>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-emerald-300" />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            const content = getContentForDate(date);
            const today = isToday(date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] rounded-xl border transition-all ${
                  date
                    ? today
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                      : 'bg-card border-border hover:border-border/80 hover:shadow-sm'
                    : 'bg-muted/30 border-transparent'
                }`}
              >
                {date && (
                  <div className="p-2">
                    <div className={`text-sm font-medium mb-2 ${today ? 'text-emerald-600' : 'text-foreground'}`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1.5">
                      {content.slice(0, 2).map((item, itemIndex) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-lg text-xs text-muted-foreground truncate cursor-pointer hover:bg-muted/80 transition-colors"
                        >
                          <span className="flex-shrink-0 w-4 h-4">{getPlatformIcon(item.platform, "w-4 h-4")}</span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                      
                      {content.length > 2 && (
                        <div className="text-xs text-muted-foreground px-2">+{content.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="font-medium">Researching your topic...</p>
            <p className="text-sm opacity-70">Generating 30 days of platform-specific content</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialContentCalendar;
