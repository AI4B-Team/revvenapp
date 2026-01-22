import React, { useState } from 'react';
import { Search, Star, Archive, Trash2, MoreVertical, Send, Paperclip, 
         Mail, MessageSquare, Phone, Video, Filter, Tag, User, Clock, 
         CheckCircle, Circle, Zap, TrendingUp, Settings, Plus, X,
         Facebook, Twitter, Instagram, Linkedin, MessageCircle, Smartphone,
         AlertCircle, ChevronDown, ChevronRight, Sparkles, Users, FolderOpen,
         Flag, Bell, Eye, EyeOff, Reply, Forward, Download, Share2 } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

// Type definitions
interface Message {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'telegram' | 'slack' | 'discord';
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  preview: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isPriority: boolean;
  tags: string[];
  assignee?: string;
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
  sentiment?: 'positive' | 'neutral' | 'negative';
  aiSuggestions?: string[];
  attachments?: Array<{name: string; size: string; type: string}>;
}

const Inbox: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [activeView, setActiveView] = useState<'inbox' | 'sent' | 'drafts' | 'archived' | 'starred' | 'priority'>('inbox');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // Sample data
  const channels = [
    { id: 'email', name: 'Email', icon: Mail, color: '#10b981', count: 24 },
    { id: 'sms', name: 'SMS', icon: Smartphone, color: '#3b82f6', count: 12 },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: '#25D366', count: 8 },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877f2', count: 6 },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', count: 15 },
    { id: 'twitter', name: 'X/Twitter', icon: Twitter, color: '#1DA1F2', count: 9 },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', count: 4 },
    { id: 'telegram', name: 'Telegram', icon: MessageSquare, color: '#0088cc', count: 7 },
    { id: 'slack', name: 'Slack', icon: MessageSquare, color: '#4A154B', count: 18 },
    { id: 'discord', name: 'Discord', icon: MessageSquare, color: '#5865F2', count: 3 },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      channel: 'email',
      sender: { name: 'Sarah Johnson', email: 'sarah@example.com' },
      subject: 'Project Update - Q1 Goals',
      preview: 'Hey team, I wanted to share the latest updates on our Q1 objectives...',
      body: 'Hey team,\n\nI wanted to share the latest updates on our Q1 objectives. We\'ve made significant progress on the main deliverables and are on track to meet our targets.\n\nKey highlights:\n- Feature A is 90% complete\n- Customer feedback has been overwhelmingly positive\n- We\'ve onboarded 50 new beta users\n\nLet me know if you have any questions!\n\nBest,\nSarah',
      timestamp: new Date('2024-01-21T10:30:00'),
      isRead: false,
      isStarred: true,
      isPriority: true,
      tags: ['project', 'urgent'],
      assignee: 'You',
      status: 'new',
      sentiment: 'positive',
      aiSuggestions: ['Schedule a follow-up meeting', 'Acknowledge receipt', 'Request more details'],
      attachments: [{ name: 'Q1-Report.pdf', size: '2.4 MB', type: 'pdf' }]
    },
    {
      id: '2',
      channel: 'whatsapp',
      sender: { name: 'Mike Chen', email: '+1234567890' },
      subject: 'Quick question about the demo',
      preview: 'Hi! Can we reschedule tomorrow\'s demo to Thursday?',
      body: 'Hi!\n\nCan we reschedule tomorrow\'s demo to Thursday? I have a conflict with another meeting.\n\nThanks!',
      timestamp: new Date('2024-01-21T09:15:00'),
      isRead: false,
      isStarred: false,
      isPriority: false,
      tags: ['demo', 'scheduling'],
      status: 'open',
      sentiment: 'neutral',
      aiSuggestions: ['Suggest alternative times', 'Check calendar availability', 'Confirm new time']
    },
    {
      id: '3',
      channel: 'instagram',
      sender: { name: 'Emma Davis', email: '@emmadavis' },
      subject: 'DM: Love your product!',
      preview: 'Just wanted to say I absolutely love what you\'re building...',
      body: 'Just wanted to say I absolutely love what you\'re building! The interface is so clean and the features are exactly what I needed. Keep up the great work!',
      timestamp: new Date('2024-01-20T16:45:00'),
      isRead: true,
      isStarred: false,
      isPriority: false,
      tags: ['feedback', 'positive'],
      status: 'resolved',
      sentiment: 'positive',
      aiSuggestions: ['Thank the customer', 'Ask for testimonial', 'Offer referral program']
    },
    {
      id: '4',
      channel: 'slack',
      sender: { name: 'David Wilson', email: '@david.wilson' },
      subject: 'Bug Report: Login Issue',
      preview: 'Users are reporting issues with the login flow on mobile...',
      body: 'Users are reporting issues with the login flow on mobile devices. The OAuth redirect seems to be failing intermittently. Can someone look into this ASAP?',
      timestamp: new Date('2024-01-20T14:20:00'),
      isRead: true,
      isStarred: true,
      isPriority: true,
      tags: ['bug', 'urgent', 'mobile'],
      assignee: 'Tech Team',
      status: 'open',
      sentiment: 'negative',
      aiSuggestions: ['Escalate to engineering', 'Request error logs', 'Acknowledge and provide ETA']
    },
    {
      id: '5',
      channel: 'linkedin',
      sender: { name: 'Jennifer Lee', email: 'jennifer@company.com' },
      subject: 'Partnership Opportunity',
      preview: 'I came across your company and believe there\'s a great synergy...',
      body: 'Hi,\n\nI came across your company and believe there\'s a great synergy between our products. Would you be open to exploring a potential partnership?\n\nI\'d love to schedule a call to discuss further.\n\nBest regards,\nJennifer',
      timestamp: new Date('2024-01-19T11:00:00'),
      isRead: true,
      isStarred: false,
      isPriority: false,
      tags: ['partnership', 'business'],
      status: 'pending',
      sentiment: 'positive',
      aiSuggestions: ['Schedule discovery call', 'Request company deck', 'Send partnership info']
    },
  ];

  const templates = [
    { id: '1', name: 'Welcome Email', category: 'Onboarding', usage: 150 },
    { id: '2', name: 'Follow-up', category: 'Sales', usage: 230 },
    { id: '3', name: 'Thank You', category: 'Customer Service', usage: 180 },
    { id: '4', name: 'Meeting Confirmation', category: 'Scheduling', usage: 95 },
    { id: '5', name: 'Product Update', category: 'Marketing', usage: 120 },
  ];

  const aiInsights = [
    { type: 'trend', message: '15% increase in customer inquiries this week', icon: TrendingUp },
    { type: 'priority', message: '3 high-priority messages need attention', icon: AlertCircle },
    { type: 'sentiment', message: '92% positive sentiment across all channels', icon: Sparkles },
    { type: 'response', message: 'Average response time: 2.3 hours', icon: Clock },
  ];

  const getChannelIcon = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return Mail;
    return channel.icon;
  };

  const getChannelColor = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.color || '#6b7280';
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return styles[status as keyof typeof styles] || styles.new;
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        
        <div className="flex-1 flex overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          {/* Inbox Sidebar */}
          <div className="w-64 bg-gray-800/30 border-r border-gray-700/50 flex flex-col">
            {/* Views */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Views</h3>
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Compose
                </button>
              </div>
              <div className="space-y-1">
                {[
                  { id: 'inbox', name: 'Inbox', icon: Mail, count: 24 },
                  { id: 'starred', name: 'Starred', icon: Star, count: 5 },
                  { id: 'priority', name: 'Priority', icon: Flag, count: 3 },
                  { id: 'drafts', name: 'Drafts', icon: FolderOpen, count: 2 },
                  { id: 'sent', name: 'Sent', icon: Send, count: 156 },
                  { id: 'archived', name: 'Archived', icon: Archive, count: 892 },
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      activeView === view.id
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'hover:bg-gray-700/30 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <view.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{view.name}</span>
                    </div>
                    {view.count > 0 && (
                      <span className="text-xs bg-gray-700/50 px-2 py-0.5 rounded-full">
                        {view.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Channels */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Channels</h3>
              <div className="space-y-1">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = selectedChannels.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setSelectedChannels(prev =>
                          isSelected
                            ? prev.filter(c => c !== channel.id)
                            : [...prev, channel.id]
                        );
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-gray-700/50'
                          : 'hover:bg-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: channel.color }}
                        />
                        <Icon className="w-4 h-4" style={{ color: channel.color }} />
                        <span className="text-sm text-gray-300">{channel.name}</span>
                      </div>
                      <span className="text-xs bg-gray-700/50 px-2 py-0.5 rounded-full">
                        {channel.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Insights */}
            <div className="p-4 border-t border-gray-700/50">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                AI Insights
              </h3>
              <div className="space-y-2">
                {aiInsights.slice(0, 2).map((insight, idx) => {
                  const Icon = insight.icon;
                  return (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                      <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{insight.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="w-96 bg-gray-800/20 border-r border-gray-700/50 flex flex-col">
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-gray-700/50 rounded transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-700/50 rounded transition-colors">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-700/50 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2 flex-wrap">
                {['All', 'Unread', 'Flagged', 'With Attachments'].map((filter) => (
                  <button
                    key={filter}
                    className="px-3 py-1 text-xs bg-gray-700/30 hover:bg-gray-700/50 rounded-full transition-colors"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {mockMessages.map((message) => {
                const ChannelIcon = getChannelIcon(message.channel);
                const channelColor = getChannelColor(message.channel);
                
                return (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full p-4 border-b border-gray-700/30 hover:bg-gray-700/30 transition-all text-left ${
                      selectedMessage?.id === message.id ? 'bg-gray-700/50' : ''
                    } ${!message.isRead ? 'bg-gray-700/10' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-medium">
                          {message.sender.name.charAt(0)}
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-800"
                          style={{ backgroundColor: channelColor }}
                        >
                          <ChannelIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`font-semibold truncate ${!message.isRead ? 'text-white' : 'text-gray-300'}`}>
                              {message.sender.name}
                            </span>
                            {message.isPriority && (
                              <Flag className="w-3 h-3 text-red-400 flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`text-sm mb-1 truncate ${!message.isRead ? 'font-medium text-gray-200' : 'text-gray-400'}`}>
                          {message.subject}
                        </div>

                        <div className="text-sm text-gray-500 truncate mb-2">
                          {message.preview}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(message.status)}`}>
                            {message.status}
                          </span>
                          {message.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs bg-gray-700/50 px-2 py-0.5 rounded-full text-gray-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {message.isStarred && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        )}
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Detail */}
          <div className="flex-1 flex flex-col bg-gray-800/10">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="bg-gray-800/30 border-b border-gray-700/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-lg font-medium">
                          {selectedMessage.sender.name.charAt(0)}
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-800"
                          style={{ backgroundColor: getChannelColor(selectedMessage.channel) }}
                        >
                          {React.createElement(getChannelIcon(selectedMessage.channel), { className: 'w-3 h-3 text-white' })}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-1">{selectedMessage.sender.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{selectedMessage.sender.email}</span>
                          <span>•</span>
                          <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                        </div>
                        {selectedMessage.sentiment && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">Sentiment:</span>
                            <span className={`text-xs font-medium ${getSentimentColor(selectedMessage.sentiment)}`}>
                              {selectedMessage.sentiment}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Reply className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Forward className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Star className={`w-5 h-5 ${selectedMessage.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Archive className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-700/50 pt-4">
                    <h2 className="text-xl font-semibold mb-2">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(selectedMessage.status)}`}>
                        {selectedMessage.status}
                      </span>
                      {selectedMessage.assignee && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {selectedMessage.assignee}
                        </span>
                      )}
                      {selectedMessage.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-700/50 px-2 py-1 rounded-full text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{selectedMessage.body}</p>
                  </div>

                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-6 border-t border-gray-700/50 pt-6">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        Attachments ({selectedMessage.attachments.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedMessage.attachments.map((file, idx) => (
                          <div key={idx} className="bg-gray-700/30 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded flex items-center justify-center">
                              <Paperclip className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{file.name}</div>
                              <div className="text-xs text-gray-500">{file.size}</div>
                            </div>
                            <button className="p-1.5 hover:bg-gray-600/50 rounded">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions */}
                  {selectedMessage.aiSuggestions && selectedMessage.aiSuggestions.length > 0 && (
                    <div className="mt-6 border-t border-gray-700/50 pt-6">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        AI Suggestions
                      </h4>
                      <div className="space-y-2">
                        {selectedMessage.aiSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            className="w-full text-left p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-all text-sm text-emerald-400"
                          >
                            <Zap className="w-4 h-4 inline mr-2" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply Section */}
                <div className="bg-gray-800/30 border-t border-gray-700/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Templates
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors text-sm">
                      <Sparkles className="w-4 h-4" />
                      AI Assist
                    </button>
                  </div>

                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg p-4 text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                    rows={4}
                  />

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Tag className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                        Save Draft
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-all text-sm font-medium flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a message to view</p>
                  <p className="text-sm mt-2">Choose a conversation from the list to get started</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Panel */}
          {showAIPanel && (
            <div className="w-80 bg-gray-800/30 border-l border-gray-700/50 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  AI Assistant
                </h3>
                <button onClick={() => setShowAIPanel(false)} className="p-1 hover:bg-gray-700/50 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Insights */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-400">Insights</h4>
                  <div className="space-y-3">
                    {aiInsights.map((insight, idx) => {
                      const Icon = insight.icon;
                      return (
                        <div key={idx} className="bg-gray-700/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{insight.message}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-400">Quick Actions</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Mark all as read', icon: Eye },
                      { name: 'Archive resolved', icon: Archive },
                      { name: 'Generate report', icon: TrendingUp },
                      { name: 'Bulk assign', icon: Users },
                    ].map((action) => (
                      <button
                        key={action.name}
                        className="w-full flex items-center gap-2 p-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors text-sm text-left"
                      >
                        <action.icon className="w-4 h-4" />
                        {action.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analytics */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-400">Today's Stats</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Response Rate</span>
                        <span className="text-sm font-semibold text-emerald-400">94%</span>
                      </div>
                      <div className="w-full bg-gray-600/30 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full" style={{ width: '94%' }} />
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Resolution Time</span>
                        <span className="text-sm font-semibold">2.3h</span>
                      </div>
                      <div className="text-xs text-green-400">↓ 15% from yesterday</div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Messages Handled</span>
                        <span className="text-sm font-semibold">147</span>
                      </div>
                      <div className="text-xs text-emerald-400">↑ 23% from yesterday</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-semibold text-white">New Message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Channel</label>
                <select className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 text-white">
                  <option>Email</option>
                  <option>SMS</option>
                  <option>WhatsApp</option>
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>Twitter</option>
                  <option>LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">To</label>
                <input
                  type="text"
                  placeholder="Enter recipient..."
                  className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject..."
                  className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Message</label>
                <textarea
                  placeholder="Type your message..."
                  className="w-full bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 resize-none text-white"
                  rows={8}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-white">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-white">
                  <Tag className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Assist
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-white"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-all font-medium flex items-center gap-2 text-white">
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-semibold text-white">Message Templates</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className="p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg text-left transition-all border border-gray-600/30 hover:border-emerald-500/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{template.name}</h4>
                      <span className="text-xs bg-gray-600/50 px-2 py-1 rounded-full text-gray-300">
                        Used {template.usage} times
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{template.category}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-700/50 flex justify-end">
              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-all font-medium flex items-center gap-2 text-white">
                <Plus className="w-4 h-4" />
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
