import React, { useState } from 'react';
import { Calendar, Clock, Video, Phone, Plus, ChevronLeft, ChevronRight, Link2, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'call' | 'meeting' | 'demo';
  contact: string;
  company: string;
  synced: boolean;
}

const MCCalendarSync = () => {
  const [currentDate] = useState(new Date());
  const [connectedCalendars, setConnectedCalendars] = useState({
    google: true,
    outlook: false,
    apple: false,
  });

  const events: CalendarEvent[] = [
    { id: '1', title: 'Discovery Call', time: '9:00 AM', duration: '30 min', type: 'call', contact: 'Sarah Johnson', company: 'TechCorp', synced: true },
    { id: '2', title: 'Product Demo', time: '11:00 AM', duration: '45 min', type: 'demo', contact: 'Mike Chen', company: 'StartupXYZ', synced: true },
    { id: '3', title: 'Contract Review', time: '2:00 PM', duration: '1 hour', type: 'meeting', contact: 'Lisa Park', company: 'EnterpriseCo', synced: true },
    { id: '4', title: 'Follow-up Call', time: '4:00 PM', duration: '15 min', type: 'call', contact: 'James Wilson', company: 'GlobalTech', synced: true },
  ];

  const calendarProviders = [
    { id: 'google', name: 'Google Calendar', icon: '📅', connected: connectedCalendars.google },
    { id: 'outlook', name: 'Microsoft Outlook', icon: '📧', connected: connectedCalendars.outlook },
    { id: 'apple', name: 'Apple Calendar', icon: '🍎', connected: connectedCalendars.apple },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'demo': return <Video className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'demo': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'meeting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar Sync</h1>
          <p className="text-muted-foreground">Connect your calendars and manage all your calls in one place</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Call
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Calendars */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Connected Calendars
          </h2>
          <div className="space-y-3">
            {calendarProviders.map((provider) => (
              <div 
                key={provider.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="font-medium text-foreground">{provider.name}</span>
                </div>
                {provider.connected ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Check className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Calendar
          </Button>
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Today's Schedule</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-foreground">{formatDate(currentDate)}</span>
              <Button variant="ghost" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(event.type)}`}>
                    {getTypeIcon(event.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.contact} • {event.company}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-foreground">{event.time}</p>
                    <p className="text-sm text-muted-foreground">{event.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.synced && (
                      <Badge variant="outline" className="text-emerald-600">
                        <Check className="w-3 h-3 mr-1" />
                        Synced
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-4">Sync Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Auto-sync</span>
            </div>
            <p className="text-sm text-muted-foreground">Sync every 5 minutes</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Sync Range</span>
            </div>
            <p className="text-sm text-muted-foreground">Next 30 days</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Auto-detect Calls</span>
            </div>
            <p className="text-sm text-muted-foreground">Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCCalendarSync;
