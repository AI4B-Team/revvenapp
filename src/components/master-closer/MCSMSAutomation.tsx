import React, { useState } from 'react';
import { MessageSquare, Plus, Send, Clock, Users, CheckCircle } from 'lucide-react';

const MCSMSAutomation: React.FC = () => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const templates = [
    { id: '1', name: 'Follow-up After Call', content: "Hi {name}, great talking with you! Here's the link we discussed...", used: 234 },
    { id: '2', name: 'Meeting Reminder', content: 'Hi {name}, reminder about our meeting tomorrow at {time}. Looking forward to it!', used: 189 },
    { id: '3', name: 'Proposal Sent', content: "Hi {name}, I've sent over the proposal. Let me know if you have any questions!", used: 156 }
  ];

  const campaigns = [
    { name: 'Q1 Outreach', status: 'active', sent: 1247, delivered: 1198, replies: 89 },
    { name: 'Re-engagement', status: 'scheduled', sent: 0, delivered: 0, replies: 0 },
    { name: 'Event Invites', status: 'completed', sent: 456, delivered: 451, replies: 67 }
  ];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SMS Automation</h1>
          <p className="text-muted-foreground">Automated messaging campaigns and templates</p>
        </div>
        <button 
          onClick={() => setShowTemplateModal(true)} 
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: MessageSquare, value: '1,703', label: 'Total Sent', color: 'text-emerald-500' },
          { icon: CheckCircle, value: '1,649', label: 'Delivered', color: 'text-emerald-500' },
          { icon: Users, value: '156', label: 'Replies', color: 'text-blue-500' },
          { icon: Clock, value: '9.2%', label: 'Reply Rate', color: 'text-purple-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">SMS Templates</h2>
          </div>
          <div className="divide-y divide-border">
            {templates.map((template) => (
              <div key={template.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">Used {template.used} times</p>
                  </div>
                  <button className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                    Edit
                  </button>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{template.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Active Campaigns</h2>
          </div>
          <div className="divide-y divide-border">
            {campaigns.map((campaign, idx) => (
              <div key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{campaign.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      campaign.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : campaign.status === 'scheduled' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{campaign.sent}</div>
                    <div className="text-xs text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{campaign.delivered}</div>
                    <div className="text-xs text-muted-foreground">Delivered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{campaign.replies}</div>
                    <div className="text-xs text-muted-foreground">Replies</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Create SMS Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Template Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Follow-up After Demo" 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message Content</label>
                <textarea 
                  rows={4} 
                  placeholder="Hi {name}, ..." 
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground" 
                />
                <p className="text-xs text-muted-foreground mt-2">Use {'{name}'}, {'{company}'}, {'{time}'} for dynamic content</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowTemplateModal(false)} 
                className="flex-1 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors text-foreground"
              >
                Cancel
              </button>
              <button className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-sm">
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCSMSAutomation;
