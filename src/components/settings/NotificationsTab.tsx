import { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  MessageSquare, 
  Calendar, 
  Users, 
  Video, 
  Image, 
  FileText,
  Bot,
  Globe,
  Clock,
  Plus,
  X,
  Info
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  frequency: 'immediately' | 'daily';
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export default function NotificationsTab() {
  const { toast } = useToast();
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'content-generation',
      title: 'Content Generation',
      description: 'Get notified when your AI-generated content (videos, images, posts) is ready.',
      icon: Video,
      enabled: true,
      frequency: 'immediately',
      channels: { email: true, push: true, inApp: true }
    },
    {
      id: 'social-posts',
      title: 'Scheduled Posts',
      description: 'Notifications about scheduled social media posts, publishing status, and failures.',
      icon: Calendar,
      enabled: true,
      frequency: 'immediately',
      channels: { email: true, push: false, inApp: true }
    },
    {
      id: 'social-accounts',
      title: 'Social Account Alerts',
      description: 'Receive alerts when social media accounts need reconnection or have issues.',
      icon: AlertTriangle,
      enabled: true,
      frequency: 'immediately',
      channels: { email: true, push: true, inApp: true }
    },
    {
      id: 'team-activity',
      title: 'Team Activity',
      description: 'Updates about team member actions, comments, and collaboration.',
      icon: Users,
      enabled: true,
      frequency: 'daily',
      channels: { email: true, push: false, inApp: true }
    },
    {
      id: 'ai-agent',
      title: 'AI Agent Updates',
      description: 'Notifications from your AI agents, including call summaries and task completions.',
      icon: Bot,
      enabled: true,
      frequency: 'immediately',
      channels: { email: false, push: true, inApp: true }
    },
    {
      id: 'inbox',
      title: 'Social Inbox',
      description: 'Alerts for new messages, comments, and mentions across your social accounts.',
      icon: MessageSquare,
      enabled: true,
      frequency: 'immediately',
      channels: { email: false, push: true, inApp: true }
    },
    {
      id: 'product-updates',
      title: 'Product Updates',
      description: 'Stay informed about new features, improvements, and platform updates.',
      icon: Globe,
      enabled: true,
      frequency: 'daily',
      channels: { email: true, push: false, inApp: true }
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      description: 'Payment confirmations, subscription changes, and usage alerts.',
      icon: FileText,
      enabled: true,
      frequency: 'immediately',
      channels: { email: true, push: false, inApp: true }
    }
  ]);

  const handleToggle = (settingId: string, enabled: boolean) => {
    setSettings(prev => prev.map(s => 
      s.id === settingId ? { ...s, enabled } : s
    ));
  };

  const handleFrequencyChange = (settingId: string, frequency: 'immediately' | 'daily') => {
    setSettings(prev => prev.map(s => 
      s.id === settingId ? { ...s, frequency } : s
    ));
  };

  const handleChannelChange = (settingId: string, channel: 'email' | 'push' | 'inApp', enabled: boolean) => {
    setSettings(prev => prev.map(s => 
      s.id === settingId 
        ? { ...s, channels: { ...s.channels, [channel]: enabled } } 
        : s
    ));
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    if (additionalEmails.includes(newEmail)) {
      toast({
        title: "Duplicate Email",
        description: "This email is already in the list.",
        variant: "destructive"
      });
      return;
    }
    setAdditionalEmails(prev => [...prev, newEmail]);
    setNewEmail('');
    toast({
      title: "Email Added",
      description: "Additional recipient has been added."
    });
  };

  const handleRemoveEmail = (email: string) => {
    setAdditionalEmails(prev => prev.filter(e => e !== email));
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-500 mt-1">
              Control how and when you receive notifications across all channels.
            </p>
          </div>
          <Button 
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Save Changes
          </Button>
        </div>

        {/* Do Not Disturb */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Do Not Disturb</h4>
                <p className="text-xs text-gray-500">Pause all notifications temporarily</p>
              </div>
            </div>
            <Switch
              checked={doNotDisturb}
              onCheckedChange={setDoNotDisturb}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Quiet Hours</h4>
                <p className="text-xs text-gray-500">Mute push notifications during specific hours</p>
              </div>
            </div>
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={setQuietHoursEnabled}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
          
          {quietHoursEnabled && (
            <div className="ml-13 pl-13 flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600">From</Label>
                <Input 
                  type="time" 
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-32 bg-gray-50 border-gray-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600">To</Label>
                <Input 
                  type="time" 
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-32 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Additional Recipients */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Additional Email Recipients</h4>
              <p className="text-xs text-gray-500">Send copies of notifications to additional email addresses</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-3">
            <Input 
              type="email"
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 bg-gray-50 border-gray-200"
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <Button 
              onClick={handleAddEmail}
              variant="outline"
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          
          {additionalEmails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {additionalEmails.map((email) => (
                <div 
                  key={email}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                >
                  <span className="text-gray-700">{email}</span>
                  <button 
                    onClick={() => handleRemoveEmail(email)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-4">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <div 
              key={setting.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{setting.title}</h4>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={(checked) => handleToggle(setting.id, checked)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              
              {setting.enabled && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Frequency */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Notification Frequency
                      </Label>
                      <RadioGroup 
                        value={setting.frequency} 
                        onValueChange={(value) => handleFrequencyChange(setting.id, value as 'immediately' | 'daily')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="immediately" id={`${setting.id}-immediately`} />
                          <Label htmlFor={`${setting.id}-immediately`} className="text-sm text-gray-600 cursor-pointer">
                            Immediately
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="daily" id={`${setting.id}-daily`} />
                          <Label htmlFor={`${setting.id}-daily`} className="text-sm text-gray-600 cursor-pointer">
                            Daily Summary
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Channels */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Receive Via
                      </Label>
                      <div className="flex gap-4">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox 
                                  checked={setting.channels.email}
                                  onCheckedChange={(checked) => handleChannelChange(setting.id, 'email', checked as boolean)}
                                />
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">Email</span>
                                </div>
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Receive notifications via email</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox 
                                  checked={setting.channels.push}
                                  onCheckedChange={(checked) => handleChannelChange(setting.id, 'push', checked as boolean)}
                                />
                                <div className="flex items-center gap-1">
                                  <Smartphone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">Push</span>
                                </div>
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Receive push notifications</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox 
                                  checked={setting.channels.inApp}
                                  onCheckedChange={(checked) => handleChannelChange(setting.id, 'inApp', checked as boolean)}
                                />
                                <div className="flex items-center gap-1">
                                  <Bell className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">In-App</span>
                                </div>
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Show in notification center</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Some critical notifications (like security alerts and billing issues) cannot be disabled to ensure account safety.
          </p>
        </div>
      </div>
    </div>
  );
}
