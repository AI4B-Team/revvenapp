import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Plus, MoreHorizontal, X } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  day: number;
  color: string;
  attendees?: string[];
  location?: string;
  tags?: string[];
}

const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:00');
  const [newEventLocation, setNewEventLocation] = useState('');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Booking taxi app', startTime: '06:00', endTime: '07:30', day: 0, color: 'bg-blue-100 border-blue-300', attendees: ['avatar1', 'avatar2'] },
    { id: '2', title: 'Design onboarding', startTime: '06:00', endTime: '07:10', day: 1, color: 'bg-green-100 border-green-300' },
    { id: '3', title: 'Development meet', startTime: '08:00', endTime: '09:00', day: 0, color: 'bg-pink-200 border-pink-400', attendees: ['avatar1', 'avatar2'] },
    { id: '4', title: 'Development meet', startTime: '09:00', endTime: '10:00', day: 0, color: 'bg-pink-100 border-pink-300' },
    { id: '5', title: 'Book offsite', startTime: '07:30', endTime: '10:00', day: 1, color: 'bg-amber-100 border-amber-300' },
    { id: '6', title: 'Design session', startTime: '07:50', endTime: '09:30', day: 2, color: 'bg-purple-200 border-purple-400' },
    { id: '7', title: 'Design Review', startTime: '09:40', endTime: '10:30', day: 2, color: 'bg-yellow-100 border-yellow-300' },
    { id: '8', title: 'New project', startTime: '10:45', endTime: '12:30', day: 0, color: 'bg-cyan-200 border-cyan-400', attendees: ['avatar1'] },
    { id: '9', title: 'Unboarding meet', startTime: '10:50', endTime: '12:00', day: 1, color: 'bg-orange-200 border-orange-400' },
    { id: '10', title: 'Planning tasks', startTime: '07:00', endTime: '08:30', day: 5, color: 'bg-amber-100 border-amber-300' },
    { id: '11', title: 'Team meet', startTime: '08:00', endTime: '09:10', day: 4, color: 'bg-blue-200 border-blue-400' },
    { id: '12', title: 'Design our website', startTime: '08:30', endTime: '10:50', day: 5, color: 'bg-emerald-100 border-emerald-300' },
    { id: '13', title: 'Review with team', startTime: '09:00', endTime: '10:00', day: 4, color: 'bg-purple-100 border-purple-300' },
    { id: '14', title: 'Weekly Review', startTime: '10:00', endTime: '12:30', day: 5, color: 'bg-pink-100 border-pink-300' },
  ]);

  const hours = ['6am', '7am', '8am', '9am', '10am', '11am', '12am', '1pm'];

  const getEventPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const top = ((startHour - 6) * 60 + startMin) * (80 / 60);
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (80 / 60);
    return { top: `${top}px`, height: `${Math.max(height, 40)}px` };
  };

  const handlePrev = () => {
    if (viewMode === 'Month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'Week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };
  
  const handleNext = () => {
    if (viewMode === 'Month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'Week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };
  
  const handleToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return events.filter(event => event.day === dayOfWeek);
  };

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventDate) return;
    
    const eventDate = new Date(newEventDate);
    const dayOfWeek = eventDate.getDay();
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      day: dayOfWeek,
      color: 'bg-primary/20 border-primary',
      location: newEventLocation,
    };
    
    setEvents([...events, newEvent]);
    setShowAddEvent(false);
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventLocation('');
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">
            {format(currentDate, 'MMMM, yyyy')}
          </h1>
        </div>
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(['Month', 'Week', 'Day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Month View */}
      {viewMode === 'Month' && (
        <>
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground uppercase">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-7">
              {monthDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setCurrentDate(day);
                      setViewMode('Day');
                    }}
                    className={`min-h-24 p-2 border-b border-r border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                      !isSameMonth(day, currentDate) ? 'bg-muted/30' : ''
                    } ${isToday(day) ? 'bg-primary/5' : ''}`}
                  >
                    <p className={`text-sm font-medium mb-1 ${
                      !isSameMonth(day, currentDate) ? 'text-muted-foreground' : 'text-foreground'
                    } ${isToday(day) ? 'w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center' : ''}`}>
                      {format(day, 'd')}
                    </p>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate ${event.color}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Week View */}
      {viewMode === 'Week' && (
        <>
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-3" />
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-3 text-center border-l border-border ${
                  isToday(day) ? 'bg-primary/5' : ''
                }`}
              >
                <p className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEEE')}
                </p>
                <p
                  className={`text-2xl font-semibold mt-1 ${
                    isToday(day)
                      ? 'w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center mx-auto'
                      : 'text-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-8 relative">
              <div className="border-r border-border">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 flex items-start justify-end pr-3 pt-1 text-xs text-muted-foreground"
                  >
                    {hour}
                  </div>
                ))}
              </div>
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="relative border-l border-border">
                  {hours.map((_, hourIndex) => (
                    <div
                      key={hourIndex}
                      className="h-20 border-b border-border/50"
                    />
                  ))}
                  {events
                    .filter((event) => event.day === dayIndex)
                    .map((event) => {
                      const position = getEventPosition(event.startTime, event.endTime);
                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`absolute left-1 right-1 rounded-lg p-2 border-l-4 cursor-pointer transition-transform hover:scale-[1.02] ${event.color}`}
                          style={{ top: position.top, height: position.height }}
                        >
                          <p className="text-xs font-medium text-foreground truncate">
                            {event.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {event.startTime} - {event.endTime}
                          </p>
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex -space-x-2 mt-1">
                              {event.attendees.slice(0, 3).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-white"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Day View */}
      {viewMode === 'Day' && (
        <>
          <div className="p-4 border-b border-border text-center">
            <p className="text-xs text-muted-foreground uppercase">
              {format(currentDate, 'EEEE')}
            </p>
            <p className={`text-3xl font-semibold mt-1 ${
              isToday(currentDate)
                ? 'w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center mx-auto'
                : 'text-foreground'
            }`}>
              {format(currentDate, 'd')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(currentDate, 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-[80px_1fr] relative">
              <div className="border-r border-border">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 flex items-start justify-end pr-3 pt-1 text-xs text-muted-foreground"
                  >
                    {hour}
                  </div>
                ))}
              </div>
              <div className="relative">
                {hours.map((_, hourIndex) => (
                  <div
                    key={hourIndex}
                    className="h-20 border-b border-border/50"
                  />
                ))}
                {events
                  .filter((event) => event.day === currentDate.getDay())
                  .map((event) => {
                    const position = getEventPosition(event.startTime, event.endTime);
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`absolute left-2 right-2 rounded-lg p-3 border-l-4 cursor-pointer transition-transform hover:scale-[1.01] ${event.color}`}
                        style={{ top: position.top, height: position.height }}
                      >
                        <p className="text-sm font-medium text-foreground">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.startTime} - {event.endTime}
                        </p>
                        {event.location && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex -space-x-2 mt-2">
                            {event.attendees.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-white"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Event Button */}
      <div className="p-4 border-t border-border flex justify-center gap-2">
        <button
          onClick={() => setShowAddEvent(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
        >
          Add Event
        </button>
        <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <MoreHorizontal size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add New Event</h2>
              <button
                onClick={() => setShowAddEvent(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Event Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Meet with team..."
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-muted-foreground" />
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-muted-foreground" />
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="time"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-muted-foreground" />
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="Add location..."
                  className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground cursor-pointer hover:bg-primary/20 hover:text-primary">
                  Design
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground cursor-pointer hover:bg-primary/20 hover:text-primary">
                  Personal project
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground cursor-pointer hover:bg-primary/20 hover:text-primary">
                  Developer task
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-card"
                    />
                  ))}
                </div>
                <button className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddEvent(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 py-2.5 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar size={18} />
                <span className="text-foreground">
                  {format(weekDays[selectedEvent.day], 'EEEE, d MMMM')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock size={18} />
                <span className="text-foreground">
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin size={18} />
                  <span className="text-foreground">{selectedEvent.location}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-6 py-2.5 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;
