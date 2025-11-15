import { HelpCircle, User, Sparkles, Crown, ChevronRight, CreditCard, Globe, Languages, Moon, Sun, Circle, CircleDashed, Power, RefreshCw, UserPlus, Mail, Zap, Plug, Search, Check, Command, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as React from 'react';
import { NavLink } from '@/components/NavLink';
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

interface HeaderProps {
  onCreateClick?: () => void;
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

const Header = ({ onCreateClick }: HeaderProps) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState('English');
  const [selectedTheme, setSelectedTheme] = React.useState('split');
  const [languageSearch, setLanguageSearch] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Calculate next month's first day for credit refill
  const getNextRefillDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
      <header className="border-b border-border px-8 py-4 flex items-center justify-between bg-background">
        <div className="flex-1 flex items-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-300 w-80"
          >
            <Search size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500">Search</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
              <Command size={12} />
              <span>F</span>
            </kbd>
          </button>
        </div>
      
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-8">
          <NavLink to="/create" className="text-muted-foreground font-medium hover:text-foreground transition" activeClassName="text-foreground">
            Create
          </NavLink>
          <span className="text-muted">|</span>
          <NavLink to="/monetize" className="text-muted-foreground font-medium hover:text-foreground transition" activeClassName="text-foreground">
            Monetize
          </NavLink>
          <span className="text-muted">|</span>
          <NavLink to="/automate" className="text-muted-foreground font-medium hover:text-foreground transition" activeClassName="text-foreground">
            Automate
          </NavLink>
        </nav>
      </div>

      <div className="flex-1 flex items-center justify-end gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2">
                <Crown size={16} />
                <span className="font-semibold">Upgrade</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upgrade your plan</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
                <UserPlus size={16} />
                <span className="font-semibold">Invite</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Invite team members</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
                <Gift size={16} />
                <span className="font-semibold">Earn</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refer & earn rewards</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <NotificationBell />
        <HelpMenu />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition">
              <User size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-sidebar border-sidebar-hover p-6" align="end">
            {/* Header Section */}
            <div className="flex items-start gap-3 mb-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-secondary">DC</AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 bg-brand-yellow rounded-full p-1">
                  <Crown size={12} className="text-background" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">dolmarcross</h3>
                <p className="text-sm text-gray-400">dolmarcross@gmail.com</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-white h-12">
                <Zap size={18} className="mr-2" />
                Upgrade
              </Button>
              <Button variant="outline" className="w-full bg-transparent border-2 border-white/30 hover:bg-white hover:text-slate-900 text-white h-12 transition-all">
                <UserPlus size={18} className="mr-2" />
                Add Members
              </Button>
            </div>

            <DropdownMenuSeparator className="bg-sidebar-hover my-4" />

            {/* Menu Items */}
            <div className="space-y-1">
              <DropdownMenuItem className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-white">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} />
                  <span>Subscription</span>
                </div>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-700">
                  Pro
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-white">
                <User size={20} />
                <span>Account</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-white">
                <Mail size={20} />
                <span>Invites</span>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-white">
                <Link to="/integrations" className="flex items-center gap-3 w-full">
                  <Plug size={20} />
                  <span>Integrations</span>
                </Link>
              </DropdownMenuItem>

              {/* Language Selector */}
              <div className="px-3 py-2">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="group w-full flex items-center gap-4 py-4 px-4 rounded-lg border-2 border-white/30 hover:bg-white cursor-pointer bg-sidebar">
                    <Languages size={24} className="text-white group-hover:text-slate-900 flex-shrink-0" />
                    <span className="text-white group-hover:text-slate-900 font-medium flex-shrink-0">Language:</span>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      <span className="text-white group-hover:text-slate-900 font-medium">{selectedLanguage}</span>
                      <ChevronRight size={20} className="text-white group-hover:text-slate-900" />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-sidebar border-border/20 w-80 p-2">
                    <div className="px-2 pb-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          type="text"
                          placeholder="Search By"
                          value={languageSearch}
                          onChange={(e) => setLanguageSearch(e.target.value)}
                          className="pl-10 bg-sidebar-active border-border/20 text-white placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredLanguages.map((language) => (
                        <DropdownMenuItem
                          key={language.name}
                          onClick={() => {
                            setSelectedLanguage(language.name);
                            setLanguageSearch('');
                          }}
                          className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-sidebar-hover cursor-pointer text-white"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{language.flag}</span>
                            <span className="font-medium">{language.name}</span>
                          </div>
                          {selectedLanguage === language.name && (
                            <Check size={18} className="text-blue-500" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </div>

              {/* Theme Selector */}
              <div className="px-3 py-2">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger hideArrow className="group w-full flex items-center gap-4 py-4 px-4 rounded-lg border-2 border-white/30 hover:bg-white cursor-pointer bg-sidebar">
                    {selectedTheme === 'light' && <Sun size={24} className="text-white group-hover:text-slate-900 flex-shrink-0" />}
                    {selectedTheme === 'dark' && <Moon size={24} className="text-white group-hover:text-slate-900 flex-shrink-0" />}
                    {selectedTheme === 'split' && <SplitIcon />}
                    <span className="text-white group-hover:text-slate-900 font-medium flex-shrink-0">Theme:</span>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      <span className="text-white group-hover:text-slate-900 font-medium capitalize">{selectedTheme}</span>
                      <ChevronRight size={20} className="text-white group-hover:text-slate-900" />
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-sidebar border-border/20 w-64 p-2">
                    {themes.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <DropdownMenuItem
                          key={theme.name}
                          onClick={() => setSelectedTheme(theme.name)}
                          className="flex items-center justify-between py-3 px-4 rounded-md hover:bg-sidebar-hover cursor-pointer text-white"
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={20} />
                            <span className="font-medium">{theme.label}</span>
                          </div>
                          {selectedTheme === theme.name && (
                            <Check size={18} className="text-blue-500" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-sidebar-hover my-4" />

            {/* Affiliate Program */}
            <div className="px-3 py-3">
              <button 
                onClick={() => window.location.href = '/affiliate'}
                className="w-full px-6 py-3 bg-transparent border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow/10 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <span>Join Affiliate Program</span>
              </button>
            </div>

            <DropdownMenuSeparator className="bg-sidebar-hover my-4" />

            {/* Logout */}
            <DropdownMenuItem className="flex items-center justify-center gap-3 py-3 px-3 rounded-md cursor-pointer bg-brand-red text-white hover:bg-brand-red/90">
              <Power size={20} />
              <span>Log Out</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-sidebar-hover my-4" />

            {/* Footer */}
            <div className="px-3 py-4">
              <div className="flex items-center justify-between">
                {/* Left Side - Terms & Privacy Links */}
                <div className="flex items-center gap-2">
                  <a
                    href="/terms"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Terms
                  </a>
                  <span className="text-gray-400">|</span>
                  <a
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy
                  </a>
                </div>

                {/* Right Side - Social Media Icons */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://discord.gg/your-server"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Discord"
                  >
                    <DiscordIcon size={20} />
                  </a>
                  <a
                    href="https://twitter.com/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Twitter"
                  >
                    <TwitterIcon size={20} />
                  </a>
                  <a
                    href="https://youtube.com/yourchannel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="YouTube"
                  >
                    <YouTubeIcon size={20} />
                  </a>
                  <a
                    href="https://instagram.com/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Instagram"
                  >
                    <InstagramIcon size={20} />
                  </a>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
};

export default Header;
