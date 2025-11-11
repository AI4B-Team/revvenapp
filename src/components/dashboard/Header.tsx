import { HelpCircle, User, Sparkles, Crown, ChevronRight, CreditCard, Globe, Languages, Moon, Sun, Circle, CircleDashed, Power, RefreshCw, UserPlus, Mail, Zap, Plug, Search, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as React from 'react';
import { NavLink } from '@/components/NavLink';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface HeaderProps {
  onCreateClick?: () => void;
}

const Header = ({ onCreateClick }: HeaderProps) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState('English');
  const [selectedTheme, setSelectedTheme] = React.useState('split');
  const [languageSearch, setLanguageSearch] = React.useState('');

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
              <Button variant="outline" className="w-full bg-transparent border-2 border-white/30 hover:bg-sidebar-hover text-white h-12">
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
                <Badge variant="secondary" className="bg-sidebar-active text-gray-300 hover:bg-sidebar-active">
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

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-white">
                <Plug size={20} />
                <span>Integrations</span>
              </DropdownMenuItem>

              {/* Language Selector */}
              <div className="px-3 py-2">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="w-full flex items-center gap-4 py-4 px-4 rounded-lg border-2 border-white/30 hover:bg-sidebar-hover cursor-pointer bg-sidebar [&>span]:hover:text-black [&>svg]:hover:text-black">
                    <Languages size={20} className="text-white flex-shrink-0" />
                    <span className="text-white font-medium flex-shrink-0">Language:</span>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{selectedLanguage}</span>
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
                  <DropdownMenuSubTrigger className="w-full flex items-center gap-4 py-4 px-4 rounded-lg border-2 border-white/30 hover:bg-sidebar-hover cursor-pointer bg-sidebar [&>span]:hover:text-black [&>svg]:hover:text-black">
                    {selectedTheme === 'light' && <Sun size={20} className="text-white flex-shrink-0" />}
                    {selectedTheme === 'dark' && <Moon size={20} className="text-white flex-shrink-0" />}
                    {selectedTheme === 'split' && <SplitIcon />}
                    <span className="text-white font-medium flex-shrink-0">Theme:</span>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium capitalize">{selectedTheme}</span>
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
                className="w-full px-6 py-3 bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <span>Join Affiliate Program</span>
                <ChevronRight size={18} />
              </button>
            </div>

            <DropdownMenuSeparator className="bg-sidebar-hover my-4" />

            {/* Logout */}
            <DropdownMenuItem className="flex items-center justify-center gap-3 py-3 px-3 rounded-md hover:bg-sidebar-hover cursor-pointer text-brand-red">
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
