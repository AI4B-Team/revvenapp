import { useState } from 'react';
import { 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  MoreHorizontal, 
  ChevronDown,
  Send,
  Paperclip,
  Smile,
  Bold,
  Italic,
  Link,
  AtSign,
  Inbox,
  Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  avatar: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment?: boolean;
  unreadCount?: number;
  color: string;
}

const emails: Email[] = [
  {
    id: '1',
    sender: 'Smart Responses',
    senderEmail: 'system@revven.ai',
    avatar: '',
    subject: 'Simplify your process with AI',
    preview: '',
    date: '',
    isRead: false,
    isStarred: false,
    color: 'bg-emerald-500',
  },
  {
    id: '2',
    sender: 'Eliot Rivers',
    senderEmail: 'eliot@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    subject: 'Find your design muse and let yo...',
    preview: 'In the middle of difficulty lies oppo...',
    date: 'Dec 9',
    isRead: true,
    isStarred: true,
    unreadCount: 2,
    color: 'bg-blue-500',
  },
  {
    id: '3',
    sender: 'Sohel',
    senderEmail: 'sohel@canarymail.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    subject: 'Explore the world of design and fi...',
    preview: 'The quick brown fox jumps over thi...',
    date: 'Dec 9',
    isRead: false,
    isStarred: false,
    color: 'bg-orange-500',
  },
  {
    id: '4',
    sender: 'Jasper Quinn',
    senderEmail: 'jasper@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    subject: 'Unleash your creativity and disco...',
    preview: 'A journey of a thousand begins...',
    date: 'Dec 9',
    isRead: true,
    isStarred: true,
    color: 'bg-purple-500',
  },
  {
    id: '5',
    sender: 'Liam Hawthorne',
    senderEmail: 'liam@example.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    subject: 'Dive into design and ignite your p...',
    preview: 'To be or not to be, that is the question...',
    date: 'Dec 9',
    isRead: true,
    isStarred: false,
    color: 'bg-teal-500',
  },
  {
    id: '6',
    sender: 'Finnian Blake',
    senderEmail: 'finnian@example.com',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face',
    subject: 'Chart your course in the design r...',
    preview: 'The only limit to our realization of t...',
    date: 'Dec 9',
    isRead: true,
    isStarred: true,
    unreadCount: 2,
    color: 'bg-amber-500',
  },
];

const categories = ['All', 'Web', 'Promotions', 'Socials'];

const InboxPanel = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails[2]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <TooltipProvider>
      <div className="flex h-full bg-background">
        {/* Email List */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Inbox - All</h2>
                <ChevronDown size={16} className="text-muted-foreground" />
              </div>
            </div>
            
            {/* Category Tabs */}
            <div className="flex gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Responses Banner */}
          <div className="p-3 mx-3 mt-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Smart Responses</p>
              <p className="text-xs text-muted-foreground">Simplify your process with AI</p>
            </div>
          </div>

          {/* Pinned Label */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pinned</span>
            <button className="text-xs text-primary hover:underline">Hide</button>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {emails.slice(1).map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`w-full p-3 flex items-start gap-3 border-b border-border/50 text-left hover:bg-muted/50 transition-colors ${
                  selectedEmail?.id === email.id ? 'bg-muted/70' : ''
                }`}
              >
                <div className="relative shrink-0">
                  {email.isStarred && (
                    <Star size={12} className="absolute -top-1 -left-1 text-yellow-500 fill-yellow-500" />
                  )}
                  <img src={email.avatar} alt={email.sender} className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium truncate ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {email.sender}
                    </span>
                    <span className="text-xs text-muted-foreground">{email.date}</span>
                  </div>
                  <p className={`text-sm truncate ${!email.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
                </div>
                {email.unreadCount && (
                  <div className="shrink-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs">
                      {email.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Email Content */}
        {selectedEmail ? (
          <div className="flex-1 flex flex-col">
            {/* Email Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Archive size={18} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Archive</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Trash2 size={18} className="text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Star size={18} className={selectedEmail.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Star</TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-muted-foreground">
                2 of 2421 {'<'} {'>'}
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-medium">Should you follow up? Ignored or forgotten?</span>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-muted/50">
                <p className="text-sm font-medium mb-2">Summary of Canary Mail's Email</p>
                <div className="text-sm text-muted-foreground">
                  Canary Mail promotes its read tracking feature, which notifies users when recipients open their emails, 
                  eliminating uncertainty about whether messages were seen or ignored. Users can check read statuses via 
                  the Read Receipt icon (top of the email panel) to inform follow-up decisions.
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <img src={selectedEmail.avatar} alt={selectedEmail.sender} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{selectedEmail.sender}</span>
                      <span className="text-sm text-muted-foreground ml-2">{selectedEmail.senderEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Sat, 15 February, 00:59 (3 days ago)</span>
                      <MoreHorizontal size={16} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">to: me</p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <p>Hello there!</p>
                <p className="italic">"The first 24 hours after downloading Canary will be life changing." - a Canary User</p>
                <p>Here's one feature that will change your life, right now. Have you ever wondered... Should I follow up? Did the email get missed or are they ignoring me?</p>
                <p>Well, wonder no more. With Canary Mail's read tracking feature, you'll receive a notification as soon as the recipient opens your email.</p>
                <p>Talk soon,<br/>Sohel<br/>Founder & CEO of Canary Mail</p>
              </div>

              {/* Quick Answers */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Quick Answers</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-full border border-border text-sm hover:bg-muted transition-colors">
                    Interested!
                  </button>
                  <button className="px-4 py-2 rounded-full border border-border text-sm hover:bg-muted transition-colors">
                    Looking Forward!
                  </button>
                  <button className="px-4 py-2 rounded-full border border-border text-sm hover:bg-muted transition-colors">
                    Let's do it!
                  </button>
                </div>
              </div>
            </div>

            {/* Reply Box */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">Recipient</span>
                <span className="px-2 py-1 rounded bg-muted text-sm">hello@canarymail.io</span>
                <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles size={14} />
                  Generate Quick Reply
                </button>
              </div>
              <div className="border border-border rounded-xl">
                <div className="p-3 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-muted"><Bold size={16} /></button>
                    <button className="p-1.5 rounded hover:bg-muted"><Italic size={16} /></button>
                    <button className="p-1.5 rounded hover:bg-muted"><Link size={16} /></button>
                    <button className="p-1.5 rounded hover:bg-muted"><AtSign size={16} /></button>
                    <button className="p-1.5 rounded hover:bg-muted"><Paperclip size={16} /></button>
                    <button className="p-1.5 rounded hover:bg-muted"><Smile size={16} /></button>
                  </div>
                  <button className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Inbox size={48} className="mx-auto mb-3 opacity-50" />
              <p>Select an email to view</p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default InboxPanel;
