import { HelpCircle, User, Sparkles, Crown, ChevronRight, CreditCard, Globe, Languages, Moon, Sun, Circle, CircleDashed, Power, RefreshCw, UserPlus, Mail, Zap, Plug, Search, Check, Command, Gift, Settings, Menu } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import NotificationBell from './NotificationBell';
import HelpMenu from './HelpMenu';
import SearchDialog from './SearchDialog';
import InviteRewardsModalUpdated from './InviteRewardsModal';
import AppTabs from './AppTabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface HeaderProps {
  onCreateClick?: () => void;
  onMenuClick?: () => void;
}

const DiscordIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TwitterIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YouTubeIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const Header = ({ onCreateClick, onMenuClick }: HeaderProps) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState('English');
  const [selectedTheme, setSelectedTheme] = React.useState('light');
  const [languageSearch, setLanguageSearch] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [userAvatar, setUserAvatar] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Fetch user data on mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        // Try to get name from user metadata or profile
        const fullName = user.user_metadata?.full_name || 
                        user.user_metadata?.name ||
                        user.email?.split('@')[0] || '';
        setUserName(fullName);
        setUserAvatar(user.user_metadata?.avatar_url || '');
        
        // Also check profiles table for more data
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

  // Helper function to check if a top menu item should be active
  const isMenuActive = (menuType: 'create' | 'monetize' | 'automate') => {
    const path = location.pathname;
    
    if (menuType === 'create') {
      return path === '/create' || path.startsWith('/create/');
    }
    
    if (menuType === 'monetize') {
      const monetizePaths = ['/products', '/websites', '/funnels', '/store', '/marketing', '/revenue', '/contacts', '/monetize'];
      return monetizePaths.some(p => path === p || path.startsWith(p + '/'));
    }
    
    if (menuType === 'automate') {
      const automatePaths = ['/apps', '/automate', '/templates'];
      return automatePaths.some(p => path === p || path.startsWith(p + '/'));
    }
    
    return false;
  };

  // Calculate next month's first day for credit refill
  const getNextRefillDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      navigate('/login');
    }
  };

  const languages = [
    { name: 'English', flag: '🇺🇸' },
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Portuguese', flag: '🇵🇹' },
    { name: 'Italian', flag: '🇮🇹' },
    { name: 'Chinese', flag: '🇨🇳' },
    { name: 'Japanese', flag: '🇯🇵' },
  ];

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const SplitIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
      <path d="M12 2 A10 10 0 0 1 12 22 Z" fill="white" />
      <path d="M12 2 A10 10 0 0 0 12 22 Z" fill="black" />
    </svg>
  );

  const themes = [
    { name: 'light', label: 'Light', icon: Sun },
    { name: 'dark', label: 'Dark', icon: Moon },
    { name: 'split', label: 'Split', icon: SplitIcon },
  ];

  return (
    <>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <header className="px-4 md:px-8 py-4 flex items-center justify-between bg-slate-50">
        {/* Mobile menu button */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 hover:bg-secondary rounded-lg mr-2"
              >
                <Menu size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Menu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* App Tabs */}
        <AppTabs className="flex-1" />

      <div className="flex items-center justify-end gap-1 md:gap-2 h-10">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="bg-amber-100 hover:bg-amber-200 text-amber-700 hidden sm:flex items-center gap-1.5 px-3 md:px-4 h-10 text-sm border border-amber-200">
                <Crown size={14} />
                <span className="font-semibold hidden md:inline">{t('nav.upgrade')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('nav.upgrade')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                onClick={() => setIsRewardsModalOpen(true)}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 hidden sm:flex items-center gap-1.5 px-3 md:px-4 h-10 text-sm border border-emerald-200"
              >
                <Gift size={14} />
                <span className="font-semibold hidden md:inline">{t('nav.earn')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('nav.earn')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Expandable Search */}
        <div className="relative flex items-center">
          <div 
            className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
              isSearchExpanded ? 'w-48 md:w-64' : 'w-0'
            }`}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              className="w-full h-9 px-3 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              onBlur={() => setIsSearchExpanded(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsSearchOpen(true);
                  setIsSearchExpanded(false);
                }
              }}
            />
          </div>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (isSearchExpanded) {
                      setIsSearchOpen(true);
                      setIsSearchExpanded(false);
                    } else {
                      setIsSearchExpanded(true);
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <Search size={20} className="text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <NotificationBell />
        <HelpMenu />
        
        <DropdownMenu>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="relative w-10 h-10 rounded-full flex items-center justify-center p-0.5 ring-2 ring-emerald-500 hover:ring-emerald-400 transition">
                    <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                      <User size={18} />
                    </div>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('user.profile')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent className="w-72 bg-white border border-gray-200 rounded-2xl p-4 shadow-xl z-50" align="end">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User size={24} className="text-emerald-600" />
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1">
                  <Crown size={10} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{userName || 'User'}</h3>
                <p className="text-sm text-gray-500 truncate">{userEmail || 'No email'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-10 text-sm font-medium rounded-lg">
                <Zap size={16} className="mr-2" />
                {t('nav.upgrade')}
              </Button>
              <Button variant="outline" className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 h-10 text-sm font-medium rounded-lg">
                <UserPlus size={16} className="mr-2" />
                {t('settings.addMembers')}
              </Button>
            </div>

            <DropdownMenuSeparator className="bg-gray-100 my-3" />

            {/* Menu Items */}
            <div className="space-y-1">
              <DropdownMenuItem asChild className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 text-sm">
                <Link to="/account?tab=billing" className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className="text-gray-500" />
                    <span>{t('settings.subscription')}</span>
                  </div>
                  <span className="text-sm text-gray-400">Pro</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 text-sm">
                <Link to="/account?tab=my-details" className="flex items-center gap-3 w-full">
                  <Settings size={18} className="text-gray-500" />
                  <span>{t('settings.account')}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 text-sm">
                <Link to="/account?tab=invites" className="flex items-center gap-3 w-full">
                  <Mail size={18} className="text-gray-500" />
                  <span>{t('settings.invites')}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 text-sm">
                <Link to="/account?tab=integrations" className="flex items-center gap-3 w-full">
                  <Plug size={18} className="text-gray-500" />
                  <span>{t('settings.integrations')}</span>
                </Link>
              </DropdownMenuItem>
            </div>

              <DropdownMenuSeparator className="bg-gray-100 my-2" />

              {/* Language, Theme, Pro section with gray background */}
              <div className="bg-gray-50 rounded-xl p-2 space-y-1">
                {/* Language */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-100 cursor-pointer text-sm w-full [&>svg]:hidden">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Languages size={18} className="text-gray-500" />
                      <span>Language:</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>{selectedLanguage}</span>
                      <ChevronRight size={14} />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white border border-gray-200 rounded-xl p-2 shadow-lg z-50">
                    <div className="p-2">
                      <Input
                        placeholder="Search languages..."
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        className="h-8 text-sm bg-gray-50 border-gray-200"
                      />
                    </div>
                    {filteredLanguages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.name}
                        onClick={() => setSelectedLanguage(lang.name)}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span className="text-sm">{lang.name}</span>
                        </div>
                        {selectedLanguage === lang.name && (
                          <Check size={14} className="text-emerald-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Theme */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-100 cursor-pointer text-sm w-full [&>svg]:hidden">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Sun size={18} className="text-gray-500" />
                      <span>Theme:</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>Light</span>
                      <ChevronRight size={14} />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-white border border-gray-200 rounded-xl p-2 shadow-lg z-50">
                    {themes.map((theme) => (
                      <DropdownMenuItem
                        key={theme.name}
                        onClick={() => setSelectedTheme(theme.name)}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          {theme.name === 'light' && <Sun size={16} />}
                          {theme.name === 'dark' && <Moon size={16} />}
                          {theme.name === 'split' && <SplitIcon />}
                          <span className="text-sm">{theme.label}</span>
                        </div>
                        {selectedTheme === theme.name && (
                          <Check size={14} className="text-emerald-500" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Affiliate Button */}
                <div className="pt-1">
                  <Button 
                    variant="outline" 
                    className="w-full bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-300 h-10 text-sm font-medium rounded-full"
                    onClick={() => setIsRewardsModalOpen(true)}
                  >
                    Join Affiliate Program
                  </Button>
                </div>
              </div>

            {/* Logout Button */}
            <div className="mt-2">
              <Button 
                onClick={handleSignOut}
                className="w-full bg-red-500 hover:bg-red-600 text-white h-10 text-sm font-medium rounded-full"
              >
                <Power size={16} className="mr-2" />
                Log Out
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Link to="/terms-of-service" className="hover:text-gray-600 transition">Terms</Link>
                <span>|</span>
                <Link to="/privacy-policy" className="hover:text-gray-600 transition">Privacy</Link>
              </div>
              <div className="flex items-center gap-2">
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition">
                  <DiscordIcon size={16} />
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition">
                  <TwitterIcon size={16} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition">
                  <YouTubeIcon size={16} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition">
                  <InstagramIcon size={16} />
                </a>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    <InviteRewardsModalUpdated 
      isOpen={isRewardsModalOpen} 
      onClose={() => setIsRewardsModalOpen(false)} 
    />
    </>
  );
};

export default Header;
