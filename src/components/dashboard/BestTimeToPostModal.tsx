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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Users
} from 'lucide-react';
import { getPlatformIcon } from './SocialIcons';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  time: string;
  day: string;
}

interface BestTimeToPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Sample accounts
const ACCOUNTS = [
  { id: '1', name: 'Main Account', handle: '@yourbrand', platform: 'instagram' },
  { id: '2', name: 'Business Page', handle: '@yourbusiness', platform: 'facebook' },
  { id: '3', name: 'Twitter Profile', handle: '@yourtwitter', platform: 'twitter' },
  { id: '4', name: 'TikTok Channel', handle: '@yourtiktok', platform: 'tiktok' },
];

// AI-suggested best times (would come from analytics in production)
const AI_SUGGESTED_TIMES: Record<string, string[]> = {
  monday: ['8:44 AM', '11:30 AM', '4:42 PM', '5:48 PM'],
  tuesday: ['9:43 AM', '12:56 PM', '2:39 PM', '4:36 PM', '5:34 PM'],
  wednesday: ['8:56 AM', '12:56 PM', '2:53 PM', '3:31 PM', '6:45 PM'],
  thursday: ['9:39 AM', '12:58 PM', '2:49 PM', '3:55 PM', '5:58 PM'],
  friday: ['9:33 AM', '11:39 AM', '2:51 PM', '3:50 PM', '6:40 PM'],
  saturday: ['8:37 AM', '11:59 AM', '1:47 PM', '3:46 PM', '5:43 PM'],
  sunday: ['8:46 AM', '12:46 PM', '1:35 PM', '4:37 PM', '6:42 PM'],
};

const BestTimeToPostModal: React.FC<BestTimeToPostModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('timetable');
  const [selectedAccount, setSelectedAccount] = useState(ACCOUNTS[0].id);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    // Initialize with AI-suggested times
    const slots: TimeSlot[] = [];
    Object.entries(AI_SUGGESTED_TIMES).forEach(([day, times]) => {
      times.forEach((time) => {
        slots.push({
          id: `${day}-${time}-${Math.random().toString(36).substr(2, 9)}`,
          day,
          time,
        });
      });
    });
    return slots;
  });

  // New timepoint form state
  const [newTimeDay, setNewTimeDay] = useState<string>('everyday');
  const [newTimeHour, setNewTimeHour] = useState('8:00 AM');
  const [newTimeScope, setNewTimeScope] = useState<'this' | 'all'>('this');

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
      title: "Time slot removed",
      description: "The posting time has been removed from your schedule.",
    });
  };

  const clearAllTimepoints = () => {
    setTimeSlots([]);
    toast({
      title: "All timepoints cleared",
      description: "Your posting schedule has been reset.",
    });
  };

  const addTimepoint = () => {
    if (newTimeDay === 'everyday') {
      const newSlots: TimeSlot[] = DAYS_OF_WEEK.map(day => ({
        id: `${day}-${newTimeHour}-${Math.random().toString(36).substr(2, 9)}`,
        day,
        time: newTimeHour,
      }));
      setTimeSlots(prev => [...prev, ...newSlots]);
    } else {
      const newSlot: TimeSlot = {
        id: `${newTimeDay}-${newTimeHour}-${Math.random().toString(36).substr(2, 9)}`,
        day: newTimeDay,
        time: newTimeHour,
      };
      setTimeSlots(prev => [...prev, newSlot]);
    }
    toast({
      title: "Time slot added",
      description: `New posting time added${newTimeDay === 'everyday' ? ' for every day' : ''}.`,
    });
  };

  const refreshAISuggestions = () => {
    const slots: TimeSlot[] = [];
    Object.entries(AI_SUGGESTED_TIMES).forEach(([day, times]) => {
      times.forEach((time) => {
        slots.push({
          id: `${day}-${time}-${Math.random().toString(36).substr(2, 9)}`,
          day,
          time,
        });
      });
    });
    setTimeSlots(slots);
    toast({
      title: "AI suggestions refreshed",
      description: "Best posting times have been updated based on your audience data.",
    });
  };

  const timeOptions = [
    '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
    '10:00 PM', '10:30 PM', '11:00 PM'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Account Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 px-4 py-2.5 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      {getPlatformIcon(account?.platform || 'instagram', 'w-5 h-5 text-white')}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{account?.name}</p>
                      <p className="text-xs text-muted-foreground">{account?.handle}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-popover border-border">
                  {ACCOUNTS.map((acc) => (
                    <DropdownMenuItem
                      key={acc.id}
                      onClick={() => setSelectedAccount(acc.id)}
                      className="flex items-center gap-3 p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {getPlatformIcon(acc.platform, 'w-4 h-4')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">{acc.handle}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" className="gap-2" onClick={refreshAISuggestions}>
                <RefreshCw className="w-4 h-4" />
                Refresh Account Data
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-6">
              <TabsTrigger
                value="general"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="timetable"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground"
              >
                Timetable
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">4.2K</p>
                      <p className="text-sm text-muted-foreground">Avg. Reach</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">12.5%</p>
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">35</p>
                      <p className="text-sm text-muted-foreground">Scheduled Posts</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Timezone Settings
                </h3>
                <Select defaultValue="utc-5">
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc-0">GMT (UTC+0)</SelectItem>
                    <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">AI-Powered Insights</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Based on your audience activity, here are your optimal posting windows.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Peak Engagement Day</p>
                        <p className="font-semibold">Thursday</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Best Time Window</p>
                        <p className="font-semibold">9:00 AM - 11:00 AM</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Lowest Competition</p>
                        <p className="font-semibold">Saturday 8:30 AM</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Audience Active</p>
                        <p className="font-semibold">78% Online</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="font-medium mb-4">Weekly Activity Heatmap</h3>
                <div className="grid grid-cols-7 gap-2">
                  {DAY_LABELS.map((day, idx) => (
                    <div key={day} className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">{day.slice(0, 3)}</p>
                      <div className="space-y-1">
                        {[9, 12, 15, 18, 21].map((hour) => (
                          <div
                            key={hour}
                            className={`h-6 rounded text-[10px] flex items-center justify-center ${
                              (idx === 3 || idx === 4) && (hour === 9 || hour === 12)
                                ? 'bg-emerald-500 text-white'
                                : (idx < 5 && hour >= 9 && hour <= 18)
                                ? 'bg-emerald-200 dark:bg-emerald-800/50'
                                : 'bg-muted'
                            }`}
                          >
                            {hour}:00
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timetable' && (
            <div className="p-6">
              {/* Best Time Button & Clear */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  size="sm"
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={refreshAISuggestions}
                >
                  <Sparkles className="w-4 h-4" />
                  Best Time To Post
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-destructive"
                  onClick={clearAllTimepoints}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear timepoints
                </Button>
              </div>

              {/* Timetable Grid */}
              <div className="border border-border rounded-xl overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-muted/50">
                  {DAY_LABELS.map((day) => (
                    <div key={day} className="px-3 py-3 text-center border-r border-border last:border-r-0">
                      <span className="text-sm font-medium text-foreground uppercase tracking-wide">
                        {day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="grid grid-cols-7 min-h-[300px]">
                  {DAYS_OF_WEEK.map((day, idx) => {
                    const dayTimes = getTimesForDay(day);
                    return (
                      <div
                        key={day}
                        className={`border-r border-border last:border-r-0 p-2 space-y-2 ${
                          idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        {dayTimes.map((slot) => (
                          <div
                            key={slot.id}
                            className="group relative flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                          >
                            <span className="text-sm font-medium">{slot.time}</span>
                            <button
                              onClick={() => removeTimeSlot(slot.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                            >
                              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        ))}
                        {dayTimes.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-xs">
                            No times set
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Timepoint Section */}
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Add Timepoint:</span>
                
                {/* Scope Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Globe className="w-4 h-4" />
                      {newTimeScope === 'this' ? 'Only This Account' : 'All Accounts'}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => setNewTimeScope('this')}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={newTimeScope === 'this'} readOnly className="rounded" />
                        <Globe className="w-4 h-4" />
                        This Account
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewTimeScope('all')}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={newTimeScope === 'all'} readOnly className="rounded" />
                        <Users className="w-4 h-4" />
                        All Accounts
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Day Selector */}
                <Select value={newTimeDay} onValueChange={setNewTimeDay}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="everyday">Everyday</SelectItem>
                    {DAYS_OF_WEEK.map((day, idx) => (
                      <SelectItem key={day} value={day}>
                        {DAY_LABELS[idx]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Time Selector */}
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

                {/* Add Button */}
                <Button
                  size="sm"
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={addTimepoint}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={onClose}>
            Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BestTimeToPostModal;
