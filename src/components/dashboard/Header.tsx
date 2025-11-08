import { HelpCircle, User, Sparkles, Crown, ChevronRight, CreditCard, Globe, Languages, Moon, Power, RefreshCw, UserPlus, Mail, Zap, Plug } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onCreateClick?: () => void;
}

const Header = ({ onCreateClick }: HeaderProps) => {
  return (
    <header className="border-b border-border px-8 py-4 flex items-center justify-between bg-background">
      <div className="flex-1" />
      
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-8">
          <button onClick={onCreateClick} className="text-foreground font-medium hover:text-muted-foreground transition">
            Create
          </button>
          <span className="text-muted">|</span>
          <button className="text-muted-foreground font-medium hover:text-foreground transition">
            Monetize
          </button>
          <span className="text-muted">|</span>
          <Link to="/ai-agents" className="text-muted-foreground font-medium hover:text-foreground transition">
            Automate
          </Link>
        </nav>
      </div>

      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-green" />
          <span className="text-brand-green font-semibold">88,000 Credits</span>
          <HelpCircle size={14} className="text-brand-green" />
        </div>

        <NotificationBell />
        <button className="text-muted-foreground hover:text-foreground transition">
          <HelpCircle size={20} />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition">
              <User size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-[#1a1a1a] border-[#2a2a2a] p-6" align="end">
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
              <Button variant="outline" className="w-full bg-transparent border-gray-600 hover:bg-gray-800 text-white h-12">
                <UserPlus size={18} className="mr-2" />
                Add Members
              </Button>
            </div>

            <DropdownMenuSeparator className="bg-gray-800 my-4" />

            {/* Menu Items */}
            <div className="space-y-1">
              <DropdownMenuItem className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-gray-800 cursor-pointer text-white">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} />
                  <span>Subscription</span>
                </div>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-700">
                  Pro
                </Badge>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-gray-800 cursor-pointer text-white">
                <User size={20} />
                <span>Account</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-gray-800 cursor-pointer text-white">
                <Mail size={20} />
                <span>Invites</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-gray-800 cursor-pointer text-white">
                <Plug size={20} />
                <span>Integrations</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-gray-800 cursor-pointer text-white">
                <div className="flex items-center gap-3">
                  <Languages size={20} />
                  <span>Language</span>
                </div>
                <span className="text-gray-400 text-sm">English</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-gray-800 cursor-pointer text-white">
                <div className="flex items-center gap-3">
                  <Moon size={20} />
                  <span>Theme</span>
                </div>
                <span className="text-gray-400 text-sm">Dark</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-gray-800 cursor-pointer text-white">
                <HelpCircle size={20} />
                <span>Help</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-gray-800 my-4" />

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

            <DropdownMenuSeparator className="bg-gray-800 my-4" />

            {/* Logout */}
            <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 rounded-md hover:bg-gray-800 cursor-pointer text-brand-red">
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
