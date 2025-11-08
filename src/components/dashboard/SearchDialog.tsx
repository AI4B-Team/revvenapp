import { useState, useEffect } from 'react';
import { Search, FileText, Image, Video, Music, Code, Calendar, Users, Briefcase, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { z } from 'zod';

const searchSchema = z.string().trim().max(100, { message: "Search query too long" });

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock search results - in a real app, this would query your backend/database
const searchableContent = [
  { id: 1, title: 'Design a logo for tech startup', type: 'content', icon: FileText, category: 'Recent Projects', time: '2 hours ago' },
  { id: 2, title: 'Product photography collection', type: 'image', icon: Image, category: 'Library', time: '5 hours ago' },
  { id: 3, title: 'Marketing video draft', type: 'video', icon: Video, category: 'Library', time: 'Yesterday' },
  { id: 4, title: 'Brand identity guidelines', type: 'document', icon: Briefcase, category: 'Brand', time: '3 days ago' },
  { id: 5, title: 'Social media campaign', type: 'campaign', icon: Calendar, category: 'Brand', time: '1 week ago' },
  { id: 6, title: 'Voice samples collection', type: 'audio', icon: Music, category: 'Brand', time: '2 weeks ago' },
  { id: 7, title: 'API integration code', type: 'code', icon: Code, category: 'Library', time: '1 month ago' },
  { id: 8, title: 'Team collaboration notes', type: 'document', icon: Users, category: 'Workspace', time: '2 days ago' },
];

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(searchableContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(searchableContent);
      setError(null);
      return;
    }

    // Validate search query
    const validation = searchSchema.safeParse(searchQuery);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setError(null);

    // Filter results based on search query
    const filtered = searchableContent.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    setError(null);
    onOpenChange(false);
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'content': return 'text-brand-yellow';
      case 'image': return 'text-brand-green';
      case 'video': return 'text-brand-red';
      case 'audio': return 'text-brand-blue';
      case 'code': return 'text-brand-yellow';
      case 'campaign': return 'text-brand-purple';
      default: return 'text-sidebar-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for projects, assets, campaigns..."
              className="pl-10 h-12 text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
              maxLength={100}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive px-3 pt-2">{error}</p>
          )}
        </DialogHeader>

        <div className="border-t">
          <ScrollArea className="h-[400px]">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <Search className="text-muted-foreground mb-3" size={48} />
                <p className="text-muted-foreground text-center">
                  No results found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={handleClose}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition text-left"
                    >
                      <div className={`p-2 rounded-lg bg-muted ${getIconColor(result.type)}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{result.category}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            {result.time}
                          </span>
                        </div>
                      </div>
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
          </div>
          <span>Press <kbd className="px-2 py-1 bg-background border rounded">Esc</kbd> to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
