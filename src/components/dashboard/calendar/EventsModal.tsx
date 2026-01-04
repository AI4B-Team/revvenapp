import React, { useState } from 'react';
import { X, Check, Plus, Globe, Calendar, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface Event {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  isCustom?: boolean;
}

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultEvents: Event[] = [
  { id: 'world-holidays', name: 'World holidays', color: 'bg-green-500', enabled: true },
  { id: 'indian-celebrations', name: 'Indian Celebrations', color: 'bg-orange-500', enabled: false },
  { id: 'canadian-holidays', name: 'Canadian Holidays', color: 'bg-red-500', enabled: false },
  { id: 'custom-events', name: 'Custom Events', color: 'bg-purple-500', enabled: true, isCustom: true },
];

const EventsModal: React.FC<EventsModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<Event[]>(defaultEvents);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventColor, setNewEventColor] = useState('bg-blue-500');

  const colorOptions = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
  ];

  const toggleEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, enabled: !e.enabled } : e
    ));
  };

  const addEvent = () => {
    if (!newEventName.trim()) return;
    
    const newEvent: Event = {
      id: `custom-${Date.now()}`,
      name: newEventName,
      color: newEventColor,
      enabled: true,
      isCustom: true,
    };
    
    setEvents(prev => [...prev, newEvent]);
    setNewEventName('');
    setIsAddingEvent(false);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Calendar Events</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-2">
          {events.map(event => (
            <div 
              key={event.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <Checkbox
                  checked={event.enabled}
                  onCheckedChange={() => toggleEvent(event.id)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <div className={`w-3 h-3 rounded-full ${event.color}`} />
                <span className="text-sm text-foreground">{event.name}</span>
              </label>
              
              {event.isCustom && (
                <button 
                  onClick={() => deleteEvent(event.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              )}
            </div>
          ))}
          
          {/* Add Event Form */}
          {isAddingEvent ? (
            <div className="p-3 rounded-lg border border-border space-y-3">
              <Input
                placeholder="Event name"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                className="bg-background"
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewEventColor(color)}
                    className={`w-6 h-6 rounded-full ${color} ${
                      newEventColor === color ? 'ring-2 ring-offset-2 ring-foreground' : ''
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={addEvent} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Add Event
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingEvent(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingEvent(true)}
              className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          )}
        </div>
        
        <div className="flex justify-end pt-2 border-t border-border">
          <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventsModal;
