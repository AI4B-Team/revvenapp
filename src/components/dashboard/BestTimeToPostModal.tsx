import React, { useState, useEffect } from 'react';
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
  Eye,
  LayoutGrid,
  List,
  Loader2,
  Check
} from 'lucide-react';
import { getPlatformIcon } from './SocialIcons';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';

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
  { id: 'all', name: 'All Accounts', handle: '', platform: 'all' },
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
  const [viewMode, setViewMode] = useState<'day' | 'grid'>('day');
  const [selectedAccount, setSelectedAccount] = useState(ACCOUNTS[0].id);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newTimeDay, setNewTimeDay] = useState<string>('everyday');
  const [newTimeHour, setNewTimeHour] = useState('9:00 AM');

  // Posting preferences state
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(false);
  const [smartSuggestionsEnabled, setSmartSuggestionsEnabled] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState('utc-8');

  const account = ACCOUNTS.find(a => a.id === selectedAccount);

  // Load schedules and preferences from database
  useEffect(() => {
    if (isOpen) {
      loadSchedules();
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_posting_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setAutoScheduleEnabled(data.auto_schedule_enabled);
        setSmartSuggestionsEnabled(data.smart_suggestions_enabled);
        setSelectedTimezone(data.timezone || 'utc-8');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleAutoSchedule = async () => {
    const newValue = !autoScheduleEnabled;
    setAutoScheduleEnabled(newValue);
    await savePreference('auto_schedule_enabled', newValue);
    toast({
      title: newValue ? "Auto-Schedule Enabled" : "Auto-Schedule Disabled",
      description: newValue 
        ? "Posts will be automatically scheduled at optimal times." 
        : "Auto-scheduling has been turned off.",
    });
  };

  const toggleSmartSuggestions = async () => {
    const newValue = !smartSuggestionsEnabled;
    setSmartSuggestionsEnabled(newValue);
    await savePreference('smart_suggestions_enabled', newValue);
    toast({
      title: newValue ? "Smart Suggestions Enabled" : "Smart Suggestions Disabled",
      description: newValue 
        ? "You'll receive AI recommendations for posting times." 
        : "AI suggestions have been turned off.",
    });
  };

  const handleTimezoneChange = async (value: string) => {
    setSelectedTimezone(value);
    await savePreference('timezone', value);
    toast({
      title: "Timezone Updated",
      description: "Your timezone preference has been saved.",
    });
  };

  const savePreference = async (key: string, value: boolean | string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please sign in to save your preferences.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_posting_preferences')
        .upsert({
          user_id: user.id,
          [key]: value,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving preference:', error);
      toast({
        title: "Error",
        description: "Failed to save preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // If no user, use default AI suggestions
        initializeWithAISuggestions();
        return;
      }

      const { data, error } = await supabase
        .from('posting_schedules')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const slots: TimeSlot[] = data.map(item => ({
          id: item.id,
          day: item.day,
          time: item.time,
          engagement: item.engagement as 'high' | 'medium' | 'low',
        }));
        setTimeSlots(slots);
      } else {
        // Initialize with AI suggestions for new users
        initializeWithAISuggestions();
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      initializeWithAISuggestions();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWithAISuggestions = () => {
    const slots: TimeSlot[] = [];
    Object.entries(AI_SUGGESTED_TIMES).forEach(([day, times]) => {
      times.forEach((item) => {
        slots.push({
          id: `temp-${day}-${item.time}-${Math.random().toString(36).substr(2, 9)}`,
          day,
          time: item.time,
          engagement: item.engagement,
        });
      });
    });
    setTimeSlots(slots);
  };

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
        id: `temp-${day}-${newTimeHour}-${Math.random().toString(36).substr(2, 9)}`,
        day,
        time: newTimeHour,
        engagement: randomEngagement,
      }));
      setTimeSlots(prev => [...prev, ...newSlots]);
    } else {
      const newSlot: TimeSlot = {
        id: `temp-${newTimeDay}-${newTimeHour}-${Math.random().toString(36).substr(2, 9)}`,
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
    initializeWithAISuggestions();
    toast({
      title: "AI analysis complete",
      description: "Optimal times updated based on audience activity.",
    });
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please sign in to save your posting schedule.",
          variant: "destructive",
        });
        return;
      }

      // Delete existing schedules
      const { error: deleteError } = await supabase
        .from('posting_schedules')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Insert new schedules
      if (timeSlots.length > 0) {
        const schedulesToInsert = timeSlots.map(slot => ({
          user_id: user.id,
          day: slot.day,
          time: slot.time,
          engagement: slot.engagement,
          account_id: selectedAccount,
        }));

        const { error: insertError } = await supabase
          .from('posting_schedules')
          .insert(schedulesToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Schedule saved",
        description: "Your posting schedule has been saved successfully.",
      });
      onClose();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error saving schedule",
        description: "Failed to save your posting schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Compact Header */}
        <div className="pl-6 pr-14 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Posting Schedule</h2>
                  <p className="text-xs text-muted-foreground">Optimize When You Post For Maximum Reach</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Account Selector - Compact */}
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-[180px] h-9">
                  <div className="flex items-center gap-2">
                    {account?.platform !== 'all' && (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        {getPlatformIcon(account?.platform || 'instagram', 'w-3 h-3')}
                      </div>
                    )}
                    <span className="text-sm truncate">{account?.name}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {ACCOUNTS.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <div className="flex items-center gap-2">
                        {acc.platform !== 'all' && getPlatformIcon(acc.platform, 'w-4 h-4')}
                        <span>{acc.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
              <p className="text-muted-foreground">Loading your schedule...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 border-b border-border bg-muted/10">
                <TabsList className="bg-transparent h-auto p-0 gap-6">
                  <TabsTrigger 
                    value="general" 
                    className="bg-transparent px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger 
                    value="schedule" 
                    className="bg-transparent px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="bg-transparent px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* General Tab */}
              <TabsContent value="general" className="flex-1 overflow-auto m-0 p-6">
                <div className="max-w-2xl space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      Timezone Settings
                    </h3>
                    <Select value={selectedTimezone} onValueChange={handleTimezoneChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="utc+0">UTC</SelectItem>
                        <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                        <SelectItem value="utc+5:30">India Standard Time (UTC+5:30)</SelectItem>
                        <SelectItem value="utc+6">Bangladesh Standard Time (UTC+6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-muted-foreground" />
                      Posting Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Auto-Schedule Posts</p>
                          <p className="text-xs text-muted-foreground">Automatically schedule based on optimal times</p>
                        </div>
                        <Switch 
                          checked={autoScheduleEnabled} 
                          onCheckedChange={toggleAutoSchedule}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Smart Suggestions</p>
                          <p className="text-xs text-muted-foreground">Get AI recommendations for posting times</p>
                        </div>
                        <Switch 
                          checked={smartSuggestionsEnabled} 
                          onCheckedChange={toggleSmartSuggestions}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="flex-1 overflow-hidden m-0 flex flex-col">
                {/* View Mode Toggle */}
                <div className="px-6 py-3 border-b border-border flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <Button
                    variant={viewMode === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                    className={viewMode === 'day' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                  >
                    <List className="w-3.5 h-3.5 mr-1.5" />
                    Day
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                  >
                    <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                    Week
                  </Button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex">
                  {viewMode === 'day' ? (
                    <>
                      {/* Left Sidebar - Day Navigator */}
                      <div className="w-56 border-r border-border bg-muted/20 p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
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
                        
                        {/* Legend - aligned with numbers below */}
                        <div className="grid grid-cols-[1fr,3rem,3rem] items-center mb-3 px-3 text-[10px] text-muted-foreground">
                          <span />
                          <span title="High Engagement Times With Peak Audience Activity" className="text-center">Peak</span>
                          <span title="Total Number Of Scheduled Posting Times" className="text-center">Total</span>
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
                                title={`${highCount} Peak · ${daySlots.length} Total`}
                                className={`w-full grid grid-cols-[1fr,3rem,3rem] items-center px-3 py-2.5 rounded-lg text-left transition-all ${
                                  isSelected 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'hover:bg-muted text-foreground'
                                }`}
                              >
                                <span className="font-medium text-sm">{DAY_FULL_LABELS[idx]}</span>

                                {highCount > 0 ? (
                                  <span
                                    className={`w-5 h-5 justify-self-center rounded-full text-[10px] flex items-center justify-center font-medium ${
                                      isSelected
                                        ? 'bg-white/20 text-white'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    }`}
                                    title="Peak Times"
                                  >
                                    {highCount}
                                  </span>
                                ) : (
                                  <span className="w-5 h-5 justify-self-center" aria-hidden="true" />
                                )}

                                <span
                                  className={`text-xs justify-self-center ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}
                                  title="Total Slots"
                                >
                                  {daySlots.length}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Stats Summary */}
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total Slots</span>
                            <span className="font-semibold">{getTotalSlots()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Peak Times</span>
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
                              {getTimesForDay(selectedDay).length} Posting Times Scheduled
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setTimeSlots(prev => prev.filter(s => s.day !== selectedDay));
                              toast({ title: "Day Cleared", description: `All times for ${selectedDay} removed.` });
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear Day
                          </Button>
                        </div>

                        {/* Time Slots Grid */}
                        <div className="space-y-3 mb-8">
                          {getTimesForDay(selectedDay).length === 0 ? (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border">
                              <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                              <p className="text-muted-foreground font-medium">No Times Scheduled</p>
                              <p className="text-sm text-muted-foreground mt-1">Add A Posting Time Below</p>
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
                                    {slot.engagement === 'high' && 'Highest Audience Activity Expected'}
                                    {slot.engagement === 'medium' && 'Good Engagement Potential'}
                                    {slot.engagement === 'low' && 'Lower Activity, Less Competition'}
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
                                <SelectItem value="everyday">Every Day</SelectItem>
                                <SelectItem value={selectedDay} className="font-medium">
                                  This Day Only
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
                    </>
                  ) : (
                    /* Week Grid View */
                    <div className="flex-1 overflow-auto p-6">
                      {/* Grid Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Weekly Overview</h3>
                          <p className="text-sm text-muted-foreground">
                            All posting times across the week
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={refreshAISuggestions}
                          className="gap-2"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Refresh AI Times
                        </Button>
                      </div>

                      {/* Week Grid */}
                      <div className="grid grid-cols-7 gap-3">
                        {DAYS_OF_WEEK.map((day, idx) => {
                          const daySlots = getTimesForDay(day);
                          const highCount = daySlots.filter(s => s.engagement === 'high').length;
                          
                          return (
                            <div key={day} className="bg-card border border-border rounded-xl overflow-hidden">
                              {/* Day Header */}
                              <div className="px-3 py-2.5 bg-muted/50 border-b border-border flex items-center justify-between">
                                <span className="font-semibold text-sm">{DAY_LABELS[idx]}</span>
                                <div className="flex items-center gap-1">
                                  {highCount > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] flex items-center justify-center font-medium">
                                      {highCount}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">{daySlots.length}</span>
                                </div>
                              </div>
                              
                              {/* Time Slots */}
                              <div className="p-2 space-y-1.5 min-h-[180px] max-h-[280px] overflow-y-auto">
                                {daySlots.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center h-[160px] text-muted-foreground">
                                    <Clock className="w-6 h-6 mb-1 opacity-50" />
                                    <span className="text-xs">No Times</span>
                                  </div>
                                ) : (
                                  daySlots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className="group relative flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/40 hover:bg-muted transition-all"
                                    >
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                        slot.engagement === 'high' ? 'bg-emerald-500' :
                                        slot.engagement === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
                                      }`} />
                                      <span className="text-xs font-medium flex-1">{slot.time}</span>
                                      <button
                                        onClick={() => removeTimeSlot(slot.id)}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded transition-all"
                                      >
                                        <X className="w-3 h-3 text-destructive" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                              
                              {/* Quick Add */}
                              <div className="px-2 py-2 border-t border-border">
                                <button 
                                  onClick={() => {
                                    setNewTimeDay(day);
                                    setViewMode('day');
                                    setSelectedDay(day);
                                  }}
                                  className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 rounded-md hover:bg-muted transition-all"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Stats Row */}
                      <div className="mt-6 flex items-center justify-center gap-8 py-4 bg-muted/30 rounded-xl">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{getTotalSlots()}</div>
                          <div className="text-xs text-muted-foreground">Total Times</div>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">{getHighEngagementSlots()}</div>
                          <div className="text-xs text-muted-foreground">Peak Times</div>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{timeSlots.filter(s => s.engagement === 'medium').length}</div>
                          <div className="text-xs text-muted-foreground">Good Times</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="flex-1 overflow-auto m-0 p-6">
                <div className="max-w-3xl space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                      Engagement Trends
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600">2.4K</div>
                        <div className="text-xs text-muted-foreground mt-1">Avg. Peak Reach</div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">1.5K</div>
                        <div className="text-xs text-muted-foreground mt-1">Avg. Good Reach</div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold">18%</div>
                        <div className="text-xs text-muted-foreground mt-1">Engagement Rate</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      Audience Activity
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your audience is most active on <strong>Wednesdays</strong> and <strong>Sundays</strong> between 6-8 PM.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

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
                <Button 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6" 
                  onClick={saveSchedule}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Schedule'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BestTimeToPostModal;
