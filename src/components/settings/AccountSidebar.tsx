import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Zap, 
  UserPlus, 
  CreditCard, 
  Settings, 
  Mail, 
  Plug, 
  Languages, 
  Moon,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AccountSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  planType?: string;
}

const menuItems = [
  { id: 'billing', label: 'Subscription', icon: CreditCard, badge: 'Pro' },
  { id: 'my-details', label: 'Account', icon: Settings },
  { id: 'invites', label: 'Invites', icon: Mail },
  { id: 'integrations', label: 'Integrations', icon: Plug },
];

export default function AccountSidebar({
  activeTab,
  onTabChange,
  userEmail = 'dolmarcross@gmail.com',
  userName = 'dolmarcross',
  userAvatar,
  planType = 'Pro'
}: AccountSidebarProps) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('split');

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    navigate(`/settings?tab=${tabId}`);
  };

  return (
    <div className="w-72 bg-[#1a1f2e] text-white rounded-xl p-4 flex flex-col gap-4">
      {/* User Profile Section */}
      <div className="flex flex-col items-center text-center pb-4">
        <Avatar className="w-16 h-16 mb-3 border-2 border-emerald-500">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-[#2a3142] text-white text-xl">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{userName}</h3>
        <p className="text-sm text-gray-400">{userEmail}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <Button 
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
          onClick={() => handleTabClick('plan')}
        >
          <Zap className="w-4 h-4 mr-2" />
          Upgrade
        </Button>
        <Button 
          variant="outline" 
          className="w-full bg-transparent border-gray-600 text-white hover:bg-[#2a3142] hover:text-white"
          onClick={() => handleTabClick('invites')}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Members
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#2a3142] text-white' 
                  : 'text-gray-300 hover:bg-[#2a3142] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <Badge className="bg-gray-600 text-white text-xs px-2 py-0.5">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Preferences Section */}
      <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-gray-700">
        {/* Language Selector */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#2a3142]">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-gray-300" />
            <span className="text-sm font-medium text-gray-300">Language:</span>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-auto border-none bg-transparent text-white p-0 h-auto gap-1 focus:ring-0">
              <SelectValue />
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-gray-700">
              <SelectItem value="en" className="text-white hover:bg-[#2a3142]">English</SelectItem>
              <SelectItem value="es" className="text-white hover:bg-[#2a3142]">Spanish</SelectItem>
              <SelectItem value="fr" className="text-white hover:bg-[#2a3142]">French</SelectItem>
              <SelectItem value="de" className="text-white hover:bg-[#2a3142]">German</SelectItem>
              <SelectItem value="pt" className="text-white hover:bg-[#2a3142]">Portuguese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#2a3142]">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-gray-300" />
            <span className="text-sm font-medium text-gray-300">Theme:</span>
          </div>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-auto border-none bg-transparent text-white p-0 h-auto gap-1 focus:ring-0">
              <SelectValue />
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-gray-700">
              <SelectItem value="light" className="text-white hover:bg-[#2a3142]">Light</SelectItem>
              <SelectItem value="dark" className="text-white hover:bg-[#2a3142]">Dark</SelectItem>
              <SelectItem value="split" className="text-white hover:bg-[#2a3142]">Split</SelectItem>
              <SelectItem value="system" className="text-white hover:bg-[#2a3142]">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
