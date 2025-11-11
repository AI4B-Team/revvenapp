import { HelpCircle, User, Sparkles, Crown, ChevronRight, CreditCard, Globe, Languages, Moon, Sun, Power, RefreshCw, UserPlus, Mail, Zap, Plug, ChevronDown, Search, Check, Columns2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import NotificationBell from './NotificationBell';
import HelpMenu from './HelpMenu';
import { useTheme } from 'next-themes';
import { useState } from 'react';

interface HeaderProps {
  onCreateClick?: () => void;
}

const Header = ({ onCreateClick }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [languageSearch, setLanguageSearch] = useState('');

  const languages = [
    { name: 'English', flag: '🇺🇸', code: 'en' },
    { name: 'Spanish', flag: '🇪🇸', code: 'es' },
    { name: 'French', flag: '🇫🇷', code: 'fr' },
    { name: 'German', flag: '🇩🇪', code: 'de' },
    { name: 'Italian', flag: '🇮🇹', code: 'it' },
    { name: 'Portuguese', flag: '🇵🇹', code: 'pt' },
    { name: 'Japanese', flag: '🇯🇵', code: 'ja' },
    { name: 'Chinese', flag: '🇨🇳', code: 'zh' },
    { name: 'Korean', flag: '🇰🇷', code: 'ko' },
    { name: 'Russian', flag: '🇷🇺', code: 'ru' },
  ];

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  return (
    <header className="border-b border-border px-8 py-4 flex items-center justify-between bg-background">
      <div className="flex-1" />
      
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
        <button
          onClick={() => {
            const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'split' : 'dark';
            setTheme(nextTheme);
          }}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          title="Switch theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : theme === 'split' ? <Moon size={20} /> : <Columns2 size={20} />}
        </button>

        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-green" />
          <span className="text-brand-green font-semibold">88,000 Credits</span>
          <HelpCircle size={14} className="text-brand-green" />
        </div>

        <NotificationBell />
        <HelpMenu />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition">
              <User size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 border-sidebar-hover p-6" align="end" style={{ backgroundColor: 'hsl(var(--sidebar))', color: 'hsl(var(--sidebar-text))' }}>
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
                <h3 className="text-xl font-semibold text-sidebar-text">dolmarcross</h3>
                <p className="text-sm text-sidebar-muted">dolmarcross@gmail.com</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-white h-12">
                <Zap size={18} className="mr-2" />
                Upgrade
              </Button>
              <Button variant="outline" className="w-full bg-transparent border-border hover:bg-sidebar-hover text-sidebar-text h-12">
                <UserPlus size={18} className="mr-2" />
                Add Members
              </Button>
            </div>

            <DropdownMenuSeparator className="bg-border my-4" />

            {/* Menu Items */}
            <div className="space-y-1">
              <DropdownMenuItem className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-sidebar-text">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} />
                  <span>Subscription</span>
                </div>
                <Badge variant="secondary" className="bg-sidebar-active text-sidebar-text hover:bg-sidebar-active">
                  Pro
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-sidebar-text">
                <User size={20} />
                <span>Account</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-sidebar-text">
                <Mail size={20} />
                <span>Invites</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-sidebar-text">
                <Plug size={20} />
                <span>Integrations</span>
              </DropdownMenuItem>

              {/* Language Selector */}
              <DropdownMenu onOpenChange={() => setLanguageSearch('')}>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-sidebar-hover hover:bg-sidebar-active cursor-pointer text-sidebar-text transition-colors border border-border">
                    <div className="flex items-center gap-3">
                      <Languages size={20} />
                      <span className="font-medium">Language</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sidebar-text text-sm font-medium">{selectedLanguage}</span>
                      <ChevronDown size={16} className="text-sidebar-muted" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="right" 
                  align="start"
                  className="w-64 border-border p-2"
                  style={{ backgroundColor: 'hsl(var(--sidebar))' }}
                >
                  {/* Search Input */}
                  <div className="px-2 pb-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-muted" />
                  <Input 
                    placeholder="Search By"
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        className="pl-9 bg-sidebar-hover border-border text-sidebar-text placeholder:text-sidebar-muted"
                      />
                    </div>
                  </div>
                  
                  {/* Language List */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredLanguages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.name)}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-sidebar-hover cursor-pointer text-sidebar-text"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                        {selectedLanguage === lang.name && (
                          <Check size={16} className="text-brand-blue" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-sidebar-hover hover:bg-sidebar-active cursor-pointer text-sidebar-text transition-colors border border-border mt-2">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon size={20} /> : theme === 'split' ? <Columns2 size={20} /> : <Sun size={20} />}
                      <span className="font-medium">Theme</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sidebar-text text-sm font-medium capitalize">{theme || 'Dark'}</span>
                      <ChevronDown size={16} className="text-sidebar-muted" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="right" 
                  align="start"
                  className="w-48 border-border p-2"
                  style={{ backgroundColor: 'hsl(var(--sidebar))' }}
                >
                  <DropdownMenuItem 
                    onClick={() => setTheme('light')}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-sidebar-hover cursor-pointer text-sidebar-text"
                  >
                    <div className="flex items-center gap-3">
                      <Sun size={18} />
                      <span className="font-medium">Light</span>
                    </div>
                    {theme === 'light' && (
                      <Check size={16} className="text-brand-blue" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTheme('dark')}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-sidebar-hover cursor-pointer text-sidebar-text"
                  >
                    <div className="flex items-center gap-3">
                      <Moon size={18} />
                      <span className="font-medium">Dark</span>
                    </div>
                    {theme === 'dark' && (
                      <Check size={16} className="text-brand-blue" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTheme('split')}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-sidebar-hover cursor-pointer text-sidebar-text"
                  >
                    <div className="flex items-center gap-3">
                      <Columns2 size={18} />
                      <span className="font-medium">Split</span>
                    </div>
                    {theme === 'split' && (
                      <Check size={16} className="text-brand-blue" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DropdownMenuSeparator className="bg-border my-4" />

            {/* Affiliate Program */}
            <div className="px-3 py-3">
              <button 
                onClick={() => window.location.href = '/affiliate'}
                className="w-full px-6 py-3 bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <span>Join Affiliate Program</span>
                <ChevronRight size={18} />
              </button>
            </div>

            <DropdownMenuSeparator className="bg-border my-4" />

            {/* Logout */}
            <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-brand-red">
              <Power size={20} />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
