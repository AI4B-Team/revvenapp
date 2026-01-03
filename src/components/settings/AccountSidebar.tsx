import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Sun,
  Monitor,
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
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AccountSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  planType?: string;
}

const menuItems = [
  { id: 'billing', label: 'Subscription', icon: CreditCard, badge: 'Pro' },
  { id: 'my-details', label: 'Account', icon: Settings },
  { id: 'invites', label: 'Invites', icon: Mail },
  { id: 'integrations', label: 'Integrations', icon: Plug },
];

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
  { value: 'de', label: 'German', flag: '🇩🇪' },
  { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
];

export default function AccountSidebar({
  activeTab,
  onTabChange,
  planType = 'Pro'
}: AccountSidebarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app-language') || 'en';
  });
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState('');

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        const fullName = user.user_metadata?.full_name || 
                        user.user_metadata?.name ||
                        user.email?.split('@')[0] || '';
        setUserName(fullName);
        setUserAvatar(user.user_metadata?.avatar_url || '');
        
        // Also check profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          if (profile.full_name) setUserName(profile.full_name);
          if (profile.avatar_url) setUserAvatar(profile.avatar_url);
        }
      }
    };
    
    fetchUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || '');
        const fullName = session.user.user_metadata?.full_name || 
                        session.user.user_metadata?.name ||
                        session.user.email?.split('@')[0] || '';
        setUserName(fullName);
        setUserAvatar(session.user.user_metadata?.avatar_url || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    navigate(`/account?tab=${tabId}`);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem('app-language', value);
    const langLabel = languages.find(l => l.value === value)?.label || value;
    toast({
      title: "Language Updated",
      description: `Language set to ${langLabel}`,
    });
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast({
      title: "Theme Updated",
      description: `Theme set to ${value.charAt(0).toUpperCase() + value.slice(1)}`,
    });
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5 text-gray-300" />;
      case 'dark':
        return <Moon className="w-5 h-5 text-gray-300" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className="w-72 bg-[#1a1f2e] text-white rounded-xl p-4 flex flex-col gap-4">
      {/* User Profile Section */}
      <div className="flex flex-col items-center text-center pb-4">
        <Avatar className="w-16 h-16 mb-3 border-2 border-emerald-500">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-[#2a3142] text-white text-xl">
            {userName ? userName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{userName || 'User'}</h3>
        <p className="text-sm text-gray-400">{userEmail || 'No email'}</p>
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
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-auto border-none bg-transparent text-white p-0 h-auto gap-1 focus:ring-0">
              <SelectValue>
                {languages.find(l => l.value === language)?.label || 'English'}
              </SelectValue>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-gray-700">
              {languages.map((lang) => (
                <SelectItem 
                  key={lang.value} 
                  value={lang.value} 
                  className="text-white hover:bg-[#2a3142] focus:bg-[#2a3142] focus:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#2a3142]">
          <div className="flex items-center gap-3">
            {getThemeIcon()}
            <span className="text-sm font-medium text-gray-300">Theme:</span>
          </div>
          <Select value={theme || 'system'} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-auto border-none bg-transparent text-white p-0 h-auto gap-1 focus:ring-0">
              <SelectValue>
                {theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : 'System'}
              </SelectValue>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-gray-700">
              <SelectItem value="light" className="text-white hover:bg-[#2a3142] focus:bg-[#2a3142] focus:text-white">
                <span className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </span>
              </SelectItem>
              <SelectItem value="dark" className="text-white hover:bg-[#2a3142] focus:bg-[#2a3142] focus:text-white">
                <span className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </span>
              </SelectItem>
              <SelectItem value="system" className="text-white hover:bg-[#2a3142] focus:bg-[#2a3142] focus:text-white">
                <span className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>System</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
