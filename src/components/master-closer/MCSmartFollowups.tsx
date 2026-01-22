import React, { useState } from 'react';
import { Mail, Clock, CheckCircle2, Send, Plus, Filter, Search, Sparkles, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface FollowUp {
  id: string;
  contact: string;
  company: string;
  subject: string;
  status: 'pending' | 'sent' | 'scheduled';
  dueDate: string;
  type: 'email' | 'sms' | 'call';
  aiGenerated: boolean;
}

const MCSmartFollowups = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  const followups: FollowUp[] = [
    { id: '1', contact: 'Sarah Johnson', company: 'TechCorp', subject: 'Follow up on demo call', status: 'pending', dueDate: 'Today, 2:00 PM', type: 'email', aiGenerated: true },
    { id: '2', contact: 'Mike Chen', company: 'StartupXYZ', subject: 'Pricing proposal review', status: 'scheduled', dueDate: 'Tomorrow, 10:00 AM', type: 'email', aiGenerated: true },
    { id: '3', contact: 'Lisa Park', company: 'EnterpriseCo', subject: 'Contract discussion', status: 'sent', dueDate: 'Yesterday', type: 'email', aiGenerated: false },
    { id: '4', contact: 'James Wilson', company: 'GlobalTech', subject: 'Quick check-in', status: 'pending', dueDate: 'Today, 4:30 PM', type: 'sms', aiGenerated: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'sent': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'call': return <Calendar className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Smart Follow-ups</h1>
          <p className="text-muted-foreground">AI-powered follow-up suggestions based on your calls</p>
        </div>
        <Button onClick={() => setShowCompose(true)} className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Follow-up
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: '12', icon: Clock, color: 'text-yellow-500' },
          { label: 'Scheduled', value: '8', icon: Calendar, color: 'text-blue-500' },
          { label: 'Sent Today', value: '24', icon: Send, color: 'text-emerald-500' },
          { label: 'AI Generated', value: '18', icon: Sparkles, color: 'text-purple-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search follow-ups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Follow-up List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {followups.map((followup) => (
            <div key={followup.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    {getTypeIcon(followup.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{followup.contact}</h3>
                      <span className="text-sm text-muted-foreground">@ {followup.company}</span>
                      {followup.aiGenerated && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{followup.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{followup.dueDate}</p>
                    <Badge className={getStatusColor(followup.status)}>
                      {followup.status.charAt(0).toUpperCase() + followup.status.slice(1)}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Create Follow-up</h2>
            <div className="space-y-4">
              <Input placeholder="Recipient name or email" />
              <Input placeholder="Subject" />
              <Textarea placeholder="Message..." rows={4} />
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCSmartFollowups;
