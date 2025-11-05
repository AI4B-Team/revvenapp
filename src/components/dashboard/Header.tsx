import { HelpCircle, Bell, User, Sparkles, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="border-b border-border px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between bg-background sticky top-0 z-30">
      {/* Mobile: Hamburger Menu */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden text-foreground hover:text-muted-foreground p-2"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Desktop: Navigation Links */}
      <div className="hidden lg:flex flex-1" />
      
      <div className="hidden lg:flex items-center gap-8">
        <nav className="flex items-center gap-8">
          <button className="text-foreground font-medium hover:text-muted-foreground transition">
            Create
          </button>
          <span className="text-muted">|</span>
          <button className="text-muted-foreground font-medium hover:text-foreground transition">
            Monetize
          </button>
          <span className="text-muted">|</span>
          <button className="text-muted-foreground font-medium hover:text-foreground transition">
            Automate
          </button>
        </nav>
      </div>

      {/* Mobile: Centered Logo */}
      <div className="lg:hidden flex-1 text-center">
        <span className="text-lg font-bold text-foreground">REVVEN</span>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <Sparkles size={16} className="text-brand-green" />
          <span className="text-brand-green font-semibold text-sm lg:text-base">88,000 Credits</span>
          <HelpCircle size={14} className="text-brand-green" />
        </div>

        <button className="hidden sm:block text-muted-foreground hover:text-foreground transition">
          <HelpCircle size={20} />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition relative">
          <Bell size={20} />
        </button>
        <button className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition">
          <User size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
