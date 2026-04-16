import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Image, Video, Music, Code, Calendar, Users, Briefcase, Clock, TrendingUp, History, Sparkles, ArrowRight, X, Filter, Zap, Star, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const searchSchema = z.string().trim().max(100, { message: "Search query too long" });

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchFilter = 'all' | 'projects' | 'images' | 'videos' | 'audio' | 'documents' | 'apps';

const filters: { label: string; value: SearchFilter; icon: React.ElementType }[] = [
  { label: 'All', value: 'all', icon: Globe },
  { label: 'Projects', value: 'projects', icon: Briefcase },
  { label: 'Images', value: 'images', icon: Image },
  { label: 'Videos', value: 'videos', icon: Video },
  { label: 'Audio', value: 'audio', icon: Music },
  { label: 'Documents', value: 'documents', icon: FileText },
  { label: 'Apps', value: 'apps', icon: Zap },
];

const searchableContent = [
  { id: 1, title: 'Design a logo for tech startup', type: 'projects', icon: FileText, category: 'Recent Projects', time: '2 hours ago' },
  { id: 2, title: 'Product photography collection', type: 'images', icon: Image, category: 'Library', time: '5 hours ago' },
  { id: 3, title: 'Marketing video draft', type: 'videos', icon: Video, category: 'Library', time: 'Yesterday' },
  { id: 4, title: 'Brand identity guidelines', type: 'documents', icon: Briefcase, category: 'Brand', time: '3 days ago' },
  { id: 5, title: 'Social media campaign', type: 'projects', icon: Calendar, category: 'Brand', time: '1 week ago' },
  { id: 6, title: 'Voice samples collection', type: 'audio', icon: Music, category: 'Brand', time: '2 weeks ago' },
  { id: 7, title: 'API integration code', type: 'apps', icon: Code, category: 'Library', time: '1 month ago' },
  { id: 8, title: 'Team collaboration notes', type: 'documents', icon: Users, category: 'Workspace', time: '2 days ago' },
];

const recentSearches = [
  'logo design',
  'marketing video',
  'brand guidelines',
  'social media posts',
];

const trendingSearches = [
  'AI image generation',
  'Video templates',
  'Brand kit',
  'Content calendar',
  'Voice cloning',
];

const quickActions = [
  { label: 'Create new image', icon: Image, color: 'text-emerald-500 bg-emerald-50' },
  { label: 'Generate video', icon: Video, color: 'text-blue-500 bg-blue-50' },
  { label: 'Write content', icon: FileText, color: 'text-amber-500 bg-amber-50' },
  { label: 'Browse apps', icon: Zap, color: 'text-purple-500 bg-purple-50' },
];

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(searchableContent);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(searchableContent);
      setError(null);
      setActiveFilter('all');
      return;
    }

    const validation = searchSchema.safeParse(searchQuery);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setError(null);

    let filtered = searchableContent.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }

    setResults(filtered);
    setSelectedIndex(-1);
  }, [searchQuery, activeFilter]);

  const handleClose = () => {
    setSearchQuery('');
    setError(null);
    setActiveFilter('all');
    setSelectedIndex(-1);
    onOpenChange(false);
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'projects': return 'text-emerald-500 bg-emerald-50';
      case 'images': return 'text-blue-500 bg-blue-50';
      case 'videos': return 'text-red-500 bg-red-50';
      case 'audio': return 'text-purple-500 bg-purple-50';
      case 'apps': return 'text-amber-500 bg-amber-50';
      case 'documents': return 'text-slate-500 bg-slate-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, assets, apps..."
              className="pl-10 pr-10 h-12 text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
              maxLength={100}
            />
            {hasQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive px-3 pt-2">{error}</p>
          )}
        </DialogHeader>

        {/* Filter pills */}
        <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide border-t">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon size={14} />
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="border-t">
          <ScrollArea className="h-[400px]">
            {!hasQuery ? (
              <div className="py-3">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <History size={14} className="text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleRecentClick(term)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Clock size={12} className="text-muted-foreground" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending */}
                <div className="px-4 py-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trending</span>
                  </div>
                  <div className="space-y-0.5">
                    {trendingSearches.map((term, i) => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <span className="text-sm">{term}</span>
                        <ArrowRight size={14} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={handleClose}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-border transition-colors text-left"
                        >
                          <div className={cn('p-1.5 rounded-md', action.color)}>
                            <Icon size={16} />
                          </div>
                          <span className="text-sm font-medium">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <Search className="text-muted-foreground mb-3" size={48} />
                <p className="text-muted-foreground text-center">
                  No results found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching with different keywords or change the filter
                </p>
              </div>
            ) : (
              <div className="py-2">
                <div className="px-4 py-1">
                  <span className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</span>
                </div>
                {results.map((result, index) => {
                  const Icon = result.icon;
                  const colors = getIconColor(result.type);
                  return (
                    <button
                      key={result.id}
                      onClick={handleClose}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition text-left",
                        selectedIndex === index && "bg-muted/50"
                      )}
                    >
                      <div className={cn('p-2 rounded-lg', colors)}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                            {result.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            {result.time}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="border-t px-4 py-3 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <span>Press <kbd className="px-2 py-1 bg-background border rounded">↑↓</kbd> to navigate</span>
            <span>Press <kbd className="px-2 py-1 bg-background border rounded">Enter</kbd> to select</span>
            <span>Press <kbd className="px-2 py-1 bg-background border rounded">Tab</kbd> to filter</span>
          </div>
          <span>Press <kbd className="px-2 py-1 bg-background border rounded">Esc</kbd> to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
