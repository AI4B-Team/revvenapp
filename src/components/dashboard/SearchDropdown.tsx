import { useState, useRef, useEffect } from 'react';
import { Search, Clock, Heart, Zap, Image, Video, FileText, ArrowRight, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchDropdownProps {
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  onOpenFullSearch: () => void;
}

type Tab = 'saved' | 'recent' | 'quick' | 'categories';

const savedSearches = [
  { label: 'Logo designs for startups', count: 12 },
  { label: 'Marketing video templates', count: 34 },
  { label: 'Brand identity assets', count: 8 },
];

const recentSearches = [
  { label: 'AI image generation', time: '2 min ago' },
  { label: 'Social media posts', time: '1 hour ago' },
  { label: 'Video templates', time: '3 hours ago' },
  { label: 'Brand guidelines', time: 'Yesterday' },
];

const quickActions = [
  { label: 'Create new image', icon: Image },
  { label: 'Generate video', icon: Video },
  { label: 'Write content', icon: FileText },
  { label: 'Browse all apps', icon: Zap },
];

const categories = [
  { label: 'Images & Design', count: 156 },
  { label: 'Video & Animation', count: 89 },
  { label: 'Audio & Voice', count: 42 },
  { label: 'Documents & Writing', count: 67 },
];

const tabs: { label: string; value: Tab; icon: React.ElementType }[] = [
  { label: 'Saved', value: 'saved', icon: Heart },
  { label: 'Recent', value: 'recent', icon: Clock },
  { label: 'Quick', value: 'quick', icon: Zap },
  { label: 'Categories', value: 'categories', icon: MapPin },
];

const SearchDropdown = ({ isExpanded, onExpandChange, onOpenFullSearch }: SearchDropdownProps) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('saved');
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
    if (e.key === 'Enter') onOpenFullSearch();
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

      {showDropdown && isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border rounded-xl shadow-lg z-[100] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Tabs */}
          <div className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px',
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  )}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {activeTab === 'saved' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Saved Searches</span>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    className="text-xs text-primary font-medium hover:text-primary/80"
                  >
                    + New
                  </button>
                </div>
                <div className="space-y-0.5">
                  {savedSearches.map((item) => (
                    <button
                      key={item.label}
                      onMouseDown={(e) => { e.preventDefault(); handleSearchClick(item.label); }}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <Heart size={14} className="text-red-400 fill-red-400 shrink-0" />
                      <span className="text-sm flex-1 truncate">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recent' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Searches</span>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-0.5">
                  {recentSearches.map((item) => (
                    <button
                      key={item.label}
                      onMouseDown={(e) => { e.preventDefault(); handleSearchClick(item.label); }}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <Clock size={14} className="text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 truncate">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground">{item.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'quick' && (
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Quick Actions</span>
                <div className="space-y-0.5">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      >
                        <Icon size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm flex-1">{action.label}</span>
                        <ArrowRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Browse Categories</span>
                <div className="space-y-0.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      onMouseDown={(e) => { e.preventDefault(); handleSearchClick(cat.label); }}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <MapPin size={14} className="text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1">{cat.label}</span>
                      <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
