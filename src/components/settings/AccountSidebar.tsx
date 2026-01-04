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
import { useTranslation } from '@/hooks/useTranslation';

interface AccountSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  planType?: string;
}

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'pt', label: 'Português', flag: '🇵🇹' },
];

export default function AccountSidebar({
  activeTab,
  onTabChange,
  planType = 'Pro'
}: AccountSidebarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t, language, setLanguage: setAppLanguage } = useTranslation();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState('');

  const menuItems = [
    { id: 'billing', label: t('settings.subscription'), icon: CreditCard, badge: 'Pro' },
    { id: 'my-details', label: t('settings.account'), icon: Settings },
    { id: 'invites', label: t('settings.invites'), icon: Mail },
    { id: 'integrations', label: t('settings.integrations'), icon: Plug },
  ];

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
    setAppLanguage(value);
    const langLabel = languages.find(l => l.value === value)?.label || value;
    toast({
      title: t('message.languageUpdated'),
      description: `${t('message.languageSetTo')} ${langLabel}`,
    });
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast({
      title: t('message.themeUpdated'),
      description: `${t('message.themeSetTo')} ${value.charAt(0).toUpperCase() + value.slice(1)}`,
    });
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5 text-muted-foreground" />;
      case 'dark':
        return <Moon className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Monitor className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-72 bg-card text-card-foreground border border-border rounded-xl p-4 flex flex-col gap-4">
      {/* User Profile Section */}
      <div className="flex flex-col items-center text-center pb-4">
        <Avatar className="w-16 h-16 mb-3 border-2 border-emerald-500">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xl">
            {userName ? userName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{userName || 'User'}</h3>
        <p className="text-sm text-muted-foreground">{userEmail || 'No email'}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <Button 
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
          onClick={() => handleTabClick('plan')}
        >
          <Zap className="w-4 h-4 mr-2" />
          {t('nav.upgrade')}
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => handleTabClick('invites')}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {t('settings.addMembers')}
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
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <Badge className="bg-muted text-muted-foreground text-xs px-2 py-0.5">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Preferences Section */}
      <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-border">
        {/* Language Selector */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-accent">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{t('settings.language')}:</span>
          </div>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto gap-1 focus:ring-0">
              <SelectValue>
                {languages.find(l => l.value === language)?.label || 'English'}
              </SelectValue>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {languages.map((lang) => (
                <SelectItem 
                  key={lang.value} 
                  value={lang.value} 
                  className="hover:bg-accent focus:bg-accent"
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
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-accent">
          <div className="flex items-center gap-3">
            {getThemeIcon()}
            <span className="text-sm font-medium text-muted-foreground">{t('settings.theme')}:</span>
          </div>
          <Select value={theme || 'system'} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto gap-1 focus:ring-0">
              <SelectValue>
                {theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : 'System'}
              </SelectValue>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="light" className="hover:bg-accent focus:bg-accent">
                <span className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span>{t('settings.theme.light')}</span>
                </span>
              </SelectItem>
              <SelectItem value="dark" className="hover:bg-accent focus:bg-accent">
                <span className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span>{t('settings.theme.dark')}</span>
                </span>
              </SelectItem>
              <SelectItem value="system" className="hover:bg-accent focus:bg-accent">
                <span className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>{t('settings.theme.system')}</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
