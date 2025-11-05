import { HelpCircle, Bell, User, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-border px-8 py-4 flex items-center justify-between bg-background">
      <div className="flex-1" />
      
      <div className="flex items-center gap-8">
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

      <div className="flex-1 flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-green" />
          <span className="text-brand-green font-semibold">88,000 Credits</span>
          <HelpCircle size={14} className="text-brand-green" />
        </div>

        <button className="text-muted-foreground hover:text-foreground transition relative">
          <Bell size={20} />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition">
          <HelpCircle size={20} />
        </button>
        <button className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition">
          <User size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
