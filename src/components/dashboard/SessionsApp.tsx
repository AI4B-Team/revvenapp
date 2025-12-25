import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Monitor,
  MessageSquare,
  Users,
  Settings,
  Calendar,
  Home,
  Plus,
  Search,
  Copy,
  ChevronLeft,
  ChevronRight,
  Clock,
  MoreHorizontal,
  Star,
  File,
  Send,
  X,
  Check,
  Circle,
  Square,
  RefreshCw,
  Edit2,
  ExternalLink,
  Image,
  UserPlus,
  Paperclip
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

// Types
interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  isHost?: boolean;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: Participant[];
  meetingId: string;
  passcode?: string;
  color?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  fileName?: string;
  fileSize?: string;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  isExternal?: boolean;
}

// Mock Data
const mockParticipants: Participant[] = [
  { id: '1', name: 'Nicholas Strattenberg', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isMuted: false, isVideoOn: true, isSpeaking: true, isHost: true },
  { id: '2', name: 'Laura Williams', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isMuted: false, isVideoOn: true, isSpeaking: false },
  { id: '3', name: 'Jake Middlestone', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isMuted: false, isVideoOn: true, isSpeaking: false },
  { id: '4', name: 'Melissa Miles', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', isMuted: false, isVideoOn: true, isSpeaking: false },
];

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Design Daily Zoom Meeting',
    description: 'Daily standup for the design team',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '11:30',
    participants: mockParticipants.slice(0, 3),
    meetingId: '707 904 6594',
    color: '#3B82F6'
  },
  {
    id: '2',
    title: 'Daily Standup Tech Conference',
    description: "Everyday's Standup Meeting discussing all the team work and tasks done.",
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '16:30',
    participants: mockParticipants,
    meetingId: '808 854 0943',
    color: '#3B82F6'
  },
  {
    id: '3',
    title: 'Marketing Strategy Development',
    description: 'Q1 marketing strategy planning session',
    date: '2024-01-15',
    startTime: '18:00',
    endTime: '20:00',
    participants: mockParticipants.slice(1, 4),
    meetingId: '909 123 4567',
    color: '#8B5CF6'
  },
];

const mockContacts: Contact[] = [
  { id: '1', name: 'Michelle Williams (you)', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', status: 'online' },
  { id: '2', name: 'Sarah Brightman', avatar: '', status: 'offline', lastMessage: 'Thanks for the update!' },
  { id: '3', name: 'Louis Tornton', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', status: 'online', lastMessage: 'I think everything is on the right place here!', isExternal: true },
  { id: '4', name: 'Damian Marley', avatar: '', status: 'away' },
];

const mockMessages: ChatMessage[] = [
  { id: '1', senderId: '3', senderName: 'Louis Tornton', senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', content: "Looks like we're in this together!", timestamp: '12:46', type: 'text' },
  { id: '2', senderId: '3', senderName: 'Louis Tornton', senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', content: 'Are you able to send the text file now?', timestamp: '12:46', type: 'text' },
  { id: '3', senderId: '1', senderName: 'You', senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', content: 'Hey you!', timestamp: '12:48', type: 'text' },
  { id: '4', senderId: '1', senderName: 'You', senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', content: 'Sending you the requested file...', timestamp: '12:48', type: 'text' },
  { id: '5', senderId: '1', senderName: 'You', senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', content: 'Documentation.pdf', timestamp: '12:48', type: 'file', fileName: 'Documentation.pdf', fileSize: '1.2 MB' },
];

// Components
const Avatar: React.FC<{ src?: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; status?: 'online' | 'offline' | 'away' }> = ({ 
  src, name, size = 'md', status 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500'
  };

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-gray-200`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-semibold text-white ring-2 ring-gray-200`}>
          {initials}
        </div>
      )}
      {status && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 ${statusColors[status]} rounded-full ring-2 ring-white`} />
      )}
    </div>
  );
};

const IconButton: React.FC<{ 
  icon: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'default' | 'primary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
}> = ({ 
  icon, onClick, variant = 'default', size = 'md', active, className = '' 
}) => {
  const variants = {
    default: active ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600'
  };

  const sizes = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  return (
    <button
      onClick={onClick}
      className={`${variants[variant]} ${sizes[size]} rounded-xl transition-all duration-200 ${className}`}
    >
      {icon}
    </button>
  );
};

// Sidebar Component
const Sidebar: React.FC<{ activeView: string; onViewChange: (view: string) => void }> = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'meetings', icon: Clock, label: 'Meetings' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
  ];

  return (
    <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-2">
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mb-4">
        <Video className="w-5 h-5 text-white" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
              activeView === item.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Settings */}
      <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all duration-200">
        <Settings className="w-5 h-5" />
      </button>

      {/* User Avatar */}
      <div className="mt-2">
        <Avatar 
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
          name="User" 
          size="sm"
          status="online"
        />
      </div>
    </div>
  );
};

// Home View Component
const HomeView: React.FC<{ 
  onStartMeeting: () => void; 
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
  meetings: Meeting[];
}> = ({ onStartMeeting, onJoinMeeting, onScheduleMeeting, meetings }) => {
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex gap-6">
        {/* Quick Actions */}
        <div className="w-80">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onStartMeeting}
              className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-left hover:from-orange-600 hover:to-orange-700 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">New Meeting</h3>
              <p className="text-orange-100 text-sm mt-1">set up new meeting</p>
            </button>

            <button 
              onClick={onJoinMeeting}
              className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-left hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Join Meeting</h3>
              <p className="text-blue-100 text-sm mt-1">via invitation link</p>
            </button>

            <button 
              onClick={onScheduleMeeting}
              className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-left hover:from-blue-700 hover:to-blue-800 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Schedule</h3>
              <p className="text-blue-100 text-sm mt-1">plan your meetings</p>
            </button>

            <button className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl text-left hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 group">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Share Screen</h3>
              <p className="text-blue-100 text-sm mt-1">show your work</p>
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 space-y-6">
          {/* Time Card */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
            <div>
              <h2 className="text-5xl font-bold text-white">{formattedTime}</h2>
              <p className="text-blue-100 mt-2">{formattedDate}</p>
            </div>
            <div className="absolute right-4 bottom-0">
              <div className="w-24 h-32 bg-green-400 rounded-t-full opacity-80" />
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div 
                key={meeting.id}
                className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.startTime} - {meeting.endTime}
                      </span>
                      <span>starts in 18 hours</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {meeting.participants.slice(0, 4).map((p) => (
                          <Avatar key={p.id} src={p.avatar} name={p.name} size="sm" />
                        ))}
                        {meeting.participants.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs ring-2 ring-white">
                            +{meeting.participants.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                      id
                    </button>
                    <button className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                      Start
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Meeting Room Component
const MeetingRoom: React.FC<{ 
  participants: Participant[];
  onLeaveMeeting: () => void;
}> = ({ participants, onLeaveMeeting }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: '3', senderName: 'Jake Middlestone', senderAvatar: mockParticipants[2].avatar, content: 'Hey guys!', timestamp: '10:24', type: 'text' },
    { id: '2', senderId: '3', senderName: 'Jake Middlestone', senderAvatar: mockParticipants[2].avatar, content: 'Everyone ready for the meeting?', timestamp: '10:24', type: 'text' },
    { id: '3', senderId: '1', senderName: 'Nicholas Strattenberg', senderAvatar: mockParticipants[0].avatar, content: "Yeah man, let's do this!", timestamp: '10:25', type: 'text' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const activeParticipant = participants[0];
  const otherParticipants = participants.slice(1);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message: ChatMessage = {
      id: String(chatMessages.length + 1),
      senderId: '1',
      senderName: 'You',
      senderAvatar: mockParticipants[0].avatar,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: 'text'
    };
    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Video Grid */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Main Video */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-200 to-yellow-300">
            <img 
              src={activeParticipant.avatar} 
              alt={activeParticipant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1.5 bg-gray-900/80 backdrop-blur text-white rounded-lg text-sm font-medium flex items-center gap-2">
                {activeParticipant.name}
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              </span>
            </div>
            <button className="absolute bottom-4 right-4 p-2 bg-gray-900/80 backdrop-blur rounded-lg text-gray-300 hover:text-white transition-colors">
              <MicOff className="w-5 h-5" />
            </button>
          </div>

          {/* Participant Videos */}
          <div className="flex gap-4">
            {otherParticipants.map((participant) => (
              <div 
                key={participant.id}
                className="relative w-48 h-36 rounded-xl overflow-hidden bg-gradient-to-br from-blue-200 to-blue-300"
              >
                <img 
                  src={participant.avatar} 
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="px-2 py-1 bg-gray-900/80 backdrop-blur text-white rounded text-xs font-medium flex items-center gap-1.5">
                    {participant.name.split(' ')[0]}
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  </span>
                  <button className={`p-1.5 rounded-lg transition-colors ${
                    participant.isMuted ? 'bg-red-500/80' : 'bg-blue-500/80'
                  }`}>
                    {participant.isMuted ? (
                      <MicOff className="w-3 h-3 text-white" />
                    ) : (
                      <Mic className="w-3 h-3 text-white" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        {showChat && (
          <div className="w-80 flex flex-col gap-4">
            {/* Participants Panel */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button className="flex-1 px-4 py-3 text-gray-900 font-medium bg-gray-100 rounded-tl-2xl">
                  Participants ({participants.length})
                </button>
                <button className="flex-1 px-4 py-3 text-gray-400 hover:text-gray-700 transition-colors rounded-tr-2xl">
                  Viewers (10)
                </button>
              </div>
              <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={participant.avatar} name={participant.name} size="sm" />
                      <span className="text-gray-900 text-sm">{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.isMuted ? (
                        <MicOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Mic className="w-4 h-4 text-gray-500" />
                      )}
                      {participant.isVideoOn ? (
                        <Video className="w-4 h-4 text-gray-500" />
                      ) : (
                        <VideoOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 font-medium">Chat</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{msg.senderName}</span>
                      <span className="text-xs text-gray-400">{msg.timestamp}</span>
                    </div>
                    <div className={`inline-block px-3 py-2 rounded-xl text-sm ${
                      msg.senderId === '1' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type to write a message"
                    className="flex-1 bg-white text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-200"
                  />
                  <button 
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
        <IconButton 
          icon={<Settings className="w-5 h-5" />}
          variant="default"
        />
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
          <IconButton 
            icon={isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            onClick={() => setIsMuted(!isMuted)}
            variant={isMuted ? 'danger' : 'default'}
            active={!isMuted}
            size="sm"
          />
          <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
          <IconButton 
            icon={isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            onClick={() => setIsVideoOn(!isVideoOn)}
            variant={!isVideoOn ? 'danger' : 'default'}
            active={isVideoOn}
            size="sm"
          />
          <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
          <IconButton 
            icon={<Users className="w-5 h-5" />}
            variant="default"
            size="sm"
          />
          <span className="text-gray-700 text-sm px-2">4</span>
          <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
        </div>
        <button 
          onClick={onLeaveMeeting}
          className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
        >
          End Meeting
        </button>
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
          <IconButton 
            icon={<Monitor className="w-5 h-5" />}
            variant="default"
            size="sm"
          />
          <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
        </div>
        <IconButton 
          icon={isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5 fill-current" />}
          onClick={() => setIsRecording(!isRecording)}
          variant={isRecording ? 'danger' : 'default'}
        />
        <div className="flex items-center gap-1 bg-blue-500 rounded-xl p-1">
          <IconButton 
            icon={<MessageSquare className="w-5 h-5" />}
            onClick={() => setShowChat(!showChat)}
            variant="primary"
            size="sm"
          />
          <ChevronRight className="w-4 h-4 text-white rotate-0" />
        </div>
      </div>
    </div>
  );
};

// Schedule Meeting Modal
const ScheduleMeetingModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (meeting: Partial<Meeting>) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('Marketing Sprint Strategy Planning');
  const [selectedDate, setSelectedDate] = useState(10);
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 11, 1));
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('14:30');
  const [passcode, setPasscode] = useState('id9hdk3h4n32');
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [autoGenerateId, setAutoGenerateId] = useState(true);

  if (!isOpen) return null;

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days: (number | null)[] = [];
  for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleSave = () => {
    onSave({
      title,
      date: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`,
      startTime,
      endTime,
      passcode,
      meetingId: autoGenerateId ? '808 854 0943' : '808 854 0943',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Meeting</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-xl font-semibold text-gray-900 placeholder-gray-400 outline-none"
            placeholder="Meeting title"
          />

          <div className="grid grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Select Date</label>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-900 font-medium">{monthName}</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                  <div key={day} className="text-xs text-gray-400 py-2">{day}</div>
                ))}
                {days.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => day && setSelectedDate(day)}
                    disabled={!day}
                    className={`py-2 rounded-lg text-sm transition-colors ${
                      !day ? 'invisible' :
                      day === selectedDate 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Time Zone */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Select Time Zone</label>
                <select className="w-full bg-gray-50 text-gray-900 rounded-xl p-3 border border-gray-200 outline-none focus:border-blue-500 transition-colors">
                  <option>Kiev, GMT +2</option>
                  <option>New York, GMT -5</option>
                  <option>London, GMT +0</option>
                  <option>Tokyo, GMT +9</option>
                </select>
              </div>

              {/* Time Selection */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Select Meeting Time</label>
                <div className="flex items-center gap-3">
                  <select 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="flex-1 bg-gray-50 text-gray-900 rounded-xl p-3 border border-gray-200 outline-none focus:border-blue-500 transition-colors"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${String(i).padStart(2, '0')}:00`}>
                        {`${String(i).padStart(2, '0')}:00`}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400">to</span>
                  <select 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="flex-1 bg-gray-50 text-gray-900 rounded-xl p-3 border border-gray-200 outline-none focus:border-blue-500 transition-colors"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={`${String(i).padStart(2, '0')}:30`}>
                        {`${String(i).padStart(2, '0')}:30`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passcode */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Security Passcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="flex-1 bg-gray-50 text-gray-900 rounded-xl p-3 border border-gray-200 outline-none focus:border-blue-500 transition-colors"
                  />
                  <button className="px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                    Copy
                  </button>
                </div>
              </div>

              {/* Waiting Room */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div 
                  onClick={() => setWaitingRoom(!waitingRoom)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    waitingRoom ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  {waitingRoom && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-900">Waiting Room</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Join Meeting Modal
const JoinMeetingModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onJoin: (meetingId: string) => void;
}> = ({ isOpen, onClose, onJoin }) => {
  const [meetingId, setMeetingId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Join Meeting</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Meeting ID</label>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="Enter meeting ID"
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl p-3 border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Passcode (optional)</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl p-3 border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl p-3 border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onJoin(meetingId)}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Sessions App Props
interface SessionsAppProps {
  isOpen: boolean;
  onClose: () => void;
}

// Main Sessions App Component
const SessionsApp: React.FC<SessionsAppProps> = ({ isOpen, onClose }) => {
  const [activeView, setActiveView] = useState('home');
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);

  const handleStartMeeting = () => {
    setIsInMeeting(true);
  };

  const handleLeaveMeeting = () => {
    setIsInMeeting(false);
  };

  const handleSaveMeeting = (meetingData: Partial<Meeting>) => {
    const newMeeting: Meeting = {
      id: String(meetings.length + 1),
      title: meetingData.title || 'New Meeting',
      date: meetingData.date || new Date().toISOString().split('T')[0],
      startTime: meetingData.startTime || '10:00',
      endTime: meetingData.endTime || '11:00',
      participants: mockParticipants.slice(0, 2),
      meetingId: '123 456 7890',
      passcode: meetingData.passcode,
    };
    setMeetings([...meetings, newMeeting]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white text-gray-900 max-w-[95vw] w-[1400px] h-[90vh] p-0 overflow-hidden [&>button]:hidden">
        <div className="h-full w-full flex">
          {/* Sidebar */}
          <Sidebar activeView={activeView} onViewChange={setActiveView} />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {isInMeeting ? 'Session Meeting' : `Sessions - ${activeView}`}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search by keywords"
                    className="w-64 bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-200"
                  />
                </div>
                <Avatar 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
                  name="User" 
                  size="md"
                />
              </div>
            </header>

            {/* Content Area */}
            {isInMeeting ? (
              <MeetingRoom 
                participants={mockParticipants}
                onLeaveMeeting={handleLeaveMeeting}
              />
            ) : (
              <HomeView 
                onStartMeeting={handleStartMeeting}
                onJoinMeeting={() => setShowJoinModal(true)}
                onScheduleMeeting={() => setShowScheduleModal(true)}
                meetings={meetings}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        <ScheduleMeetingModal 
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSave={handleSaveMeeting}
        />
        <JoinMeetingModal 
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onJoin={() => {
            setShowJoinModal(false);
            handleStartMeeting();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SessionsApp;
