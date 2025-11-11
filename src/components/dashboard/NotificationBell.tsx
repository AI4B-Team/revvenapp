import { useState } from 'react';
import { Bell, X, Sparkles, Inbox } from 'lucide-react';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('whats-new'); // 'whats-new' or 'inbox'
  const [unreadCount, setUnreadCount] = useState(2); // Number of unread notifications

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'whats-new',
      timestamp: '2 days ago',
      image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
      title: 'Where everything connects',
      description: 'Expand your ideas with Spaces, an infinite, collaborative canvas equipped with all of our AI tools. Design and share creative workflows with your team and get instant feedback.',
      ctaText: 'Create a space',
      ctaColor: 'text-blue-400'
    },
    {
      id: 2,
      type: 'whats-new',
      timestamp: '2 days ago',
      image: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=800',
      title: 'A full week of real motion freedom',
      description: 'For seven days straight, Premium+ and Pro users get unlimited access to all motion features.',
      ctaText: 'Learn more',
      ctaColor: 'text-blue-400'
    },
    {
      id: 3,
      type: 'inbox',
      timestamp: '1 hour ago',
      title: 'Your video is ready!',
      description: 'The video you requested has finished processing and is ready to download.',
      ctaText: 'View video',
      ctaColor: 'text-green-400'
    }
  ];

  const filteredNotifications = notifications.filter(n => 
    activeTab === 'whats-new' ? n.type === 'whats-new' : n.type === 'inbox'
  );

  return (
    <div className="relative">
      {/* Bell Icon Button with Badge */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={20} />
        
        {/* Red Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute top-full right-0 mt-2 w-[90vw] sm:w-[500px] lg:w-[600px] max-h-[80vh] bg-popover rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-border">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold text-popover-foreground">Notifications</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-popover-foreground transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <button
                onClick={() => setActiveTab('whats-new')}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'whats-new'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-popover-foreground'
                }`}
              >
                <Sparkles size={18} />
                What's New
              </button>
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'inbox'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-popover-foreground'
                }`}
              >
                <Inbox size={18} />
                Inbox
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="space-y-3">
                  {/* Timestamp */}
                  <div className="text-sm text-muted-foreground">{notification.timestamp}</div>
                  
                  {/* Notification Card */}
                  <div className="bg-secondary rounded-2xl overflow-hidden hover:bg-secondary/80 transition-colors">
                    {/* Image (if exists) */}
                    {notification.image && (
                      <div className="relative w-full h-48 bg-gradient-to-br from-blue-900 to-yellow-600">
                        <img
                          src={notification.image} 
                          alt={notification.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {/* Overlay Badge (like "Spaces") */}
                        {notification.id === 1 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/70 backdrop-blur-sm px-8 py-3 rounded-full">
                              <span className="text-white text-2xl font-semibold">Spaces</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-5 space-y-3">
                      {/* Title */}
                      <div className="flex items-center gap-2">
                        {notification.id === 1 && (
                          <span className="bg-green-600 text-white text-xs font-bold uppercase px-2 py-1 rounded">
                            NEW
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-popover-foreground">
                          {notification.title}
                        </h3>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-popover-foreground/80 leading-relaxed">
                        {notification.description.split('**').map((part, idx) => 
                          idx % 2 === 1 ? (
                            <span key={idx} className="font-bold text-popover-foreground">{part}</span>
                          ) : (
                            part
                          )
                        )}
                      </p>
                      
                      {/* CTA Link */}
                      {notification.ctaText && (
                        <button className={`${notification.ctaColor} hover:underline font-semibold text-sm`}>
                          {notification.ctaText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredNotifications.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No notifications yet</p>
                  <p className="text-sm mt-2">Check back later for updates</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
