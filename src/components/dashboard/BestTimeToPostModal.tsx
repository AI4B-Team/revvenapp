import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  X,
  RefreshCw,
  Clock,
  Globe,
  ChevronDown,
  Zap,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Calendar,
  Settings,
  Eye
} from 'lucide-react';
import { getPlatformIcon } from './SocialIcons';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface TimeSlot {
  id: string;
  time: string;
  day: string;
  engagement: 'high' | 'medium' | 'low';
}

interface BestTimeToPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Sample accounts
const ACCOUNTS = [
  { id: '1', name: 'Main Account', handle: '@yourbrand', platform: 'instagram' },
  { id: '2', name: 'Business Page', handle: '@yourbusiness', platform: 'facebook' },
  { id: '3', name: 'Twitter Profile', handle: '@yourtwitter', platform: 'twitter' },
  { id: '4', name: 'TikTok Channel', handle: '@yourtiktok', platform: 'tiktok' },
];

// AI-suggested best times with engagement levels
const AI_SUGGESTED_TIMES: Record<string, Array<{ time: string; engagement: 'high' | 'medium' | 'low' }>> = {
  monday: [
    { time: '9:00 AM', engagement: 'high' },
    { time: '12:30 PM', engagement: 'medium' },
    { time: '5:00 PM', engagement: 'high' },
  ],
  tuesday: [
    { time: '8:30 AM', engagement: 'medium' },
    { time: '1:00 PM', engagement: 'high' },
    { time: '6:00 PM', engagement: 'high' },
  ],
  wednesday: [
    { time: '9:00 AM', engagement: 'high' },
    { time: '12:00 PM', engagement: 'medium' },
    { time: '3:00 PM', engagement: 'low' },
    { time: '7:00 PM', engagement: 'high' },
  ],
  thursday: [
    { time: '10:00 AM', engagement: 'high' },
    { time: '2:00 PM', engagement: 'high' },
    { time: '5:30 PM', engagement: 'medium' },
  ],
  friday: [
    { time: '9:00 AM', engagement: 'medium' },
    { time: '12:00 PM', engagement: 'high' },
    { time: '4:00 PM', engagement: 'low' },
  ],
  saturday: [
    { time: '10:00 AM', engagement: 'high' },
    { time: '2:00 PM', engagement: 'medium' },
    { time: '7:00 PM', engagement: 'high' },
  ],
  sunday: [
    { time: '11:00 AM', engagement: 'high' },
    { time: '4:00 PM', engagement: 'medium' },
    { time: '8:00 PM', engagement: 'high' },
  ],
};

const BestTimeToPostModal: React.FC<BestTimeToPostModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedAccount, setSelectedAccount] = useState(ACCOUNTS[0].id);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    const slots: TimeSlot[] = [];
    Object.entries(AI_SUGGESTED_TIMES).forEach(([day, times]) => {
      times.forEach((item) => {
        slots.push({
          id: `${day}-${item.time}-${Math.random().toString(36).substr(2, 9)}`,
          day,
          time: item.time,
          engagement: item.engagement,
        });
      });
    });
    return slots;
  });

  const [newTimeDay, setNewTimeDay] = useState<string>('everyday');
  const [newTimeHour, setNewTimeHour] = useState('9:00 AM');

  const account = ACCOUNTS.find(a => a.id === selectedAccount);

  const getTimesForDay = (day: string) => {
    return timeSlots
      .filter(slot => slot.day === day)
      .sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time}`);
        const timeB = new Date(`1970/01/01 ${b.time}`);
        return timeA.getTime() - timeB.getTime();
      });
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id));
    toast({
      title: "Time removed",
      description: "Posting time has been removed.",
    });
  };

  const clearAllTimepoints = () => {
    setTimeSlots([]);
    toast({
      title: "Schedule cleared",
      description: "All posting times have been removed.",
    });
  };

  const addTimepoint = () => {
    const engagementLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    const randomEngagement = engagementLevels[Math.floor(Math.random() * engagementLevels.length)];
    
    if (newTimeDay === 'everyday') {
      const newSlots: TimeSlot[] = DAYS_OF_WEEK.map(day => ({
        id: `${day}-${newTimeHour}-${Math.random().toString(36).substr(2, 9)}`,
        day,
        time: newTimeHour,
        engagement: randomEngagement,
      }));
      setTimeSlots(prev => [...prev, ...newSlots]);
    } else {
      const newSlot: TimeSlot = {
        id: `${newTimeDay}-${newTimeHour}-${Math.random().toString(36).substr(2, 9)}`,
        day: newTimeDay,
        time: newTimeHour,
        engagement: randomEngagement,
      };
      setTimeSlots(prev => [...prev, newSlot]);
    }
    toast({
      title: "Time added",
      description: `New posting time scheduled.`,
    });
  };

  const refreshAISuggestions = () => {
    const slots: TimeSlot[] = [];
    Object.entries(AI_SUGGESTED_TIMES).forEach(([day, times]) => {
      times.forEach((item) => {
        slots.push({
          id: `${day}-${item.time}-${Math.random().toString(36).substr(2, 9)}`,
          day,
          time: item.time,
          engagement: item.engagement,
        });
      });
    });
    setTimeSlots(slots);
    toast({
      title: "AI analysis complete",
      description: "Optimal times updated based on audience activity.",
    });
  };

  const timeOptions = [
    '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
    '10:00 PM', '10:30 PM', '11:00 PM'
  ];

  const getEngagementColor = (engagement: 'high' | 'medium' | 'low') => {
    switch (engagement) {
      case 'high': return 'bg-emerald-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-slate-400 text-white';
    }
  };

  const getEngagementBadge = (engagement: 'high' | 'medium' | 'low') => {
    switch (engagement) {
      case 'high': return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">Peak</Badge>;
      case 'medium': return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px]">Good</Badge>;
      case 'low': return <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px]">Low</Badge>;
    }
  };

  const getTotalSlots = () => timeSlots.length;
  const getHighEngagementSlots = () => timeSlots.filter(s => s.engagement === 'high').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Compact Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Posting Schedule</h2>
                  <p className="text-xs text-muted-foreground">Optimize when you post for maximum reach</p>
                </div>
              </div>
            </div>
            
            {/* Account Selector - Compact */}
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-[180px] h-9">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                    {getPlatformIcon(account?.platform || 'instagram', 'w-3 h-3')}
                  </div>
                  <span className="text-sm truncate">{account?.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {ACCOUNTS.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(acc.platform, 'w-4 h-4')}
                      <span>{acc.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar - Day Navigator */}
          <div className="w-48 border-r border-border bg-muted/20 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Days</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={refreshAISuggestions}
              >
                <Zap className="w-3 h-3 mr-1 text-amber-500" />
                AI
              </Button>
            </div>
            
            <div className="space-y-1 flex-1">
              {DAYS_OF_WEEK.map((day, idx) => {
                const daySlots = getTimesForDay(day);
                const highCount = daySlots.filter(s => s.engagement === 'high').length;
                const isSelected = selectedDay === day;
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'bg-emerald-500 text-white' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="font-medium text-sm">{DAY_FULL_LABELS[idx]}</span>
                    <div className="flex items-center gap-1.5">
                      {highCount > 0 && (
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-medium ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {highCount}
                        </span>
                      )}
                      <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {daySlots.length}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stats Summary */}
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total slots</span>
                <span className="font-semibold">{getTotalSlots()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Peak times</span>
                <span className="font-semibold text-emerald-600">{getHighEngagementSlots()}</span>
              </div>
            </div>
          </div>

          {/* Right Content - Time Slots */}
          <div className="flex-1 overflow-auto p-6">
            {/* Day Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold capitalize">{selectedDay}</h3>
                <p className="text-sm text-muted-foreground">
                  {getTimesForDay(selectedDay).length} posting times scheduled
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setTimeSlots(prev => prev.filter(s => s.day !== selectedDay));
                  toast({ title: "Day cleared", description: `All times for ${selectedDay} removed.` });
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear day
              </Button>
            </div>

            {/* Time Slots Grid */}
            <div className="space-y-3 mb-8">
              {getTimesForDay(selectedDay).length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No times scheduled</p>
                  <p className="text-sm text-muted-foreground mt-1">Add a posting time below</p>
                </div>
              ) : (
                getTimesForDay(selectedDay).map((slot) => (
                  <div
                    key={slot.id}
                    className="group flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all"
                  >
                    {/* Time Indicator */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getEngagementColor(slot.engagement)}`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    
                    {/* Time Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">{slot.time}</span>
                        {getEngagementBadge(slot.engagement)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {slot.engagement === 'high' && 'Highest audience activity expected'}
                        {slot.engagement === 'medium' && 'Good engagement potential'}
                        {slot.engagement === 'low' && 'Lower activity, less competition'}
                      </p>
                    </div>

                    {/* Engagement Indicator */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            {slot.engagement === 'high' && '~2.4K reach'}
                            {slot.engagement === 'medium' && '~1.5K reach'}
                            {slot.engagement === 'low' && '~800 reach'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeTimeSlot(slot.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Time Section */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Posting Time
              </h4>
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={newTimeDay} onValueChange={setNewTimeDay}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="everyday">Every day</SelectItem>
                    <SelectItem value={selectedDay} className="font-medium">
                      This day only
                    </SelectItem>
                    {DAYS_OF_WEEK.filter(d => d !== selectedDay).map((day, idx) => (
                      <SelectItem key={day} value={day}>
                        {DAY_FULL_LABELS[DAYS_OF_WEEK.indexOf(day)]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={newTimeHour} onValueChange={setNewTimeHour}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-[200px]">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={addTimepoint} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Peak</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Good</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span>Low</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={clearAllTimepoints} className="text-muted-foreground">
              Clear All
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6" onClick={onClose}>
              Save Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BestTimeToPostModal;
