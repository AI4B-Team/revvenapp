import { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp, Sparkles, Image, Video, FileText, Zap, ArrowRight, X, History, Briefcase, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchDropdownProps {
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  onOpenFullSearch: () => void;
}

const recentSearches = [
  'logo design',
  'marketing video',
  'brand guidelines',
  'social media posts',
];

const trendingSearches = [
  { label: 'AI image generation', icon: Image },
  { label: 'Video templates', icon: Video },
  { label: 'Brand kit', icon: Briefcase },
  { label: 'Content calendar', icon: FileText },
  { label: 'Voice cloning', icon: Music },
];

const quickActions = [
  { label: 'Create new image', icon: Image, color: 'text-emerald-500 bg-emerald-50' },
  { label: 'Generate video', icon: Video, color: 'text-blue-500 bg-blue-50' },
  { label: 'Write content', icon: FileText, color: 'text-amber-500 bg-amber-50' },
  { label: 'Browse apps', icon: Zap, color: 'text-purple-500 bg-purple-50' },
];

const SearchDropdown = ({ isExpanded, onExpandChange, onOpenFullSearch }: SearchDropdownProps) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
        setShowDropdown(true);
      }, 150);
    } else {
      setShowDropdown(false);
      setQuery('');
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        onExpandChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onExpandChange]);

  const handleSearchClick = (term: string) => {
    setQuery(term);
    onOpenFullSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onOpenFullSearch();
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
      onExpandChange(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      <div
        className={cn(
          'flex items-center overflow-hidden min-w-0 transition-all duration-300 ease-in-out',
          isExpanded ? 'w-48 md:w-64' : 'w-0'
        )}
      >
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full h-10 pl-8 pr-8 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onMouseDown={(e) => { e.preventDefault(); setQuery(''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
            >
              <X size={13} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-popover border border-border rounded-xl shadow-lg z-[100] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Recent Searches */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-1.5 mb-2">
              <History size={12} className="text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onMouseDown={(e) => { e.preventDefault(); handleSearchClick(term); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-muted/50 hover:bg-muted rounded-md transition-colors"
                >
                  <Clock size={10} className="text-muted-foreground" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t" />

          {/* Trending */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp size={12} className="text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Trending</span>
            </div>
            <div className="space-y-0.5">
              {trendingSearches.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onMouseDown={(e) => { e.preventDefault(); handleSearchClick(item.label); }}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors text-left group"
                  >
                    <Icon size={13} className="text-muted-foreground" />
                    <span className="text-xs flex-1">{item.label}</span>
                    <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t" />

          {/* Quick Actions */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={12} className="text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-border/50 hover:bg-muted/50 hover:border-border transition-colors text-left"
                  >
                    <div className={cn('p-1 rounded', action.color)}>
                      <Icon size={12} />
                    </div>
                    <span className="text-[11px] font-medium">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-3 py-2">
            <button
              onMouseDown={(e) => { e.preventDefault(); onOpenFullSearch(); }}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <Search size={12} />
              Open full search
              <kbd className="ml-1 px-1.5 py-0.5 bg-muted border rounded text-[10px] text-muted-foreground">⌘K</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
