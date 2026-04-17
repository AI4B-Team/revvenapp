import { Search, Grid3X3, List, Columns, Plus, Upload, SlidersHorizontal, Check, Star, FileText, Image as ImageIcon, Video, Music, Folder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import type { ViewMode, SortField, SortDirection } from '@/hooks/useDrive';

interface DriveToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (dir: SortDirection) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewFolder: () => void;
  onUpload: () => void;
  filterType: string;
  onFilterTypeChange: (t: string) => void;
  filterFavorites: boolean;
  onFilterFavoritesChange: (v: boolean) => void;
}

const DriveToolbar = ({
  viewMode, onViewModeChange,
  searchQuery, onSearchChange,
  onNewFolder, onUpload,
  filterType, onFilterTypeChange,
  filterFavorites, onFilterFavoritesChange,
}: DriveToolbarProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasActiveFilters = filterType !== 'all' || filterFavorites;

  const viewOptions: { mode: ViewMode; icon: typeof Grid3X3; label: string }[] = [
    { mode: 'grid', icon: Grid3X3, label: 'Grid view' },
    { mode: 'list', icon: List, label: 'List view' },
    { mode: 'columns', icon: Columns, label: 'Columns view' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types', icon: <Folder className="w-4 h-4" /> },
    { value: 'images', label: 'Images', icon: <ImageIcon className="w-4 h-4" /> },
    { value: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { value: 'audio', label: 'Music & Audio', icon: <Music className="w-4 h-4" /> },
    { value: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
  ];

  const clearFilters = () => {
    onFilterTypeChange('all');
    onFilterFavoritesChange(false);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">DRIVE</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 w-64"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              {viewOptions.map(({ mode, icon: Icon, label }) => (
                <Tooltip key={mode}>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={label}
                      onClick={() => onViewModeChange(mode)}
                      className={`p-2.5 rounded-xl transition-colors border ${
                        viewMode === mode
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-white text-muted-foreground border-border hover:text-foreground hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Filter */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Filter"
                      className={`p-3 rounded-xl transition-colors relative border ${hasActiveFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-muted-foreground border-border hover:text-foreground hover:bg-gray-50'}`}
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
                      )}
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Filter</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">Filter</h4>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 border-b border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-3">By Type</p>
                  <div className="space-y-2">
                    {typeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onFilterTypeChange(option.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          filterType === option.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {filterType === option.value && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <button
                    onClick={() => onFilterFavoritesChange(!filterFavorites)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterFavorites ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${filterFavorites ? 'fill-current' : ''}`} />
                    <span>Favorites Only</span>
                    {filterFavorites && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* New Folder */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNewFolder}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Folder
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a new folder</TooltipContent>
            </Tooltip>

            {/* Upload */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onUpload}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload files</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DriveToolbar;
