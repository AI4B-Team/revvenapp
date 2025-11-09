import { useState } from 'react';
import { 
  Plus, Settings, Instagram, ChevronRight, Circle
} from 'lucide-react';

const ChatHistorySidebar = () => {
  const [recentChats] = useState([
    "I'd like to automate content ide...",
    "How often should I post daily?",
    "Can I create an ai character to ..."
  ]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      
      {/* Profile Section */}
      <div className="p-6 border-b border-gray-200">
        {/* Avatar/Image Placeholder */}
        <div className="relative mb-4">
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            {/* Replace with your AI character image */}
            <img 
              src="/placeholder.svg" 
              alt="Cora AI"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Settings Button */}
          <button className="absolute top-3 right-3 w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center transition-colors shadow-sm">
            <Settings size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Name and Title */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Cora</h2>
          <p className="text-sm text-gray-500">AI Assistant</p>
        </div>

        {/* New Chat Button */}
        <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Active Task/Agent Card */}
      <div className="p-4 border-b border-gray-200">
        <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors cursor-pointer border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center shrink-0">
              <Instagram size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 mb-1">
                Social Media Manager
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Circle size={8} className="fill-green-500 text-green-500" />
                <span>9 posts to review</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Recents Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Recents
        </h3>
        
        <div className="space-y-2">
          {recentChats.map((chat, idx) => (
            <button
              key={idx}
              className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors line-clamp-1"
            >
              {chat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatHistorySidebar;
