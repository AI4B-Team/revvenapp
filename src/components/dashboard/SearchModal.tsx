import { Search, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('');

  const recentSearches = ['Marketing campaign', 'Sales report', 'Customer analytics'];
  const suggestions = ['Create new project', 'View inbox', 'Generate report', 'Add team member'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything..."
              className="flex-1 bg-transparent border-none outline-none text-lg"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {!query && (
            <>
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Recent Searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setQuery(search)}
                      className="px-3 py-1.5 rounded-full bg-muted text-sm hover:bg-muted/80 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {query && (
            <div className="text-center text-muted-foreground py-8">
              <Search size={40} className="mx-auto mb-3 opacity-50" />
              <p>Searching for "{query}"...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
