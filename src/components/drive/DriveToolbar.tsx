import { Search, Grid3X3, List, Columns, Plus, Upload, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
}

const sortLabels: Record<SortField, string> = {
  name: 'Name',
  created_at: 'Date Created',
  updated_at: 'Date Modified',
  file_size: 'Size',
  mime_type: 'Kind',
};

const DriveToolbar = ({
  viewMode, onViewModeChange,
  sortField, sortDirection, onSortFieldChange, onSortDirectionChange,
  searchQuery, onSearchChange,
  onNewFolder, onUpload,
}: DriveToolbarProps) => {
  const viewOptions: { mode: ViewMode; icon: typeof Grid3X3; label: string }[] = [
    { mode: 'grid', icon: Grid3X3, label: 'Icons' },
    { mode: 'list', icon: List, label: 'List' },
    { mode: 'columns', icon: Columns, label: 'Columns' },
  ];

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search files & folders..."
          className="pl-9 h-9 bg-muted/50 border-border/50"
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/30">
        {viewOptions.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`p-1.5 rounded-md transition-colors ${viewMode === mode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortLabels[sortField]}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {(Object.entries(sortLabels) as [SortField, string][]).map(([field, label]) => (
            <DropdownMenuItem
              key={field}
              onClick={() => onSortFieldChange(field)}
              className={sortField === field ? 'bg-muted font-medium' : ''}
            >
              {label}
              {sortField === field && <span className="ml-auto text-xs text-muted-foreground">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}>
            {sortDirection === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Actions */}
      <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={onNewFolder}>
        <Plus className="w-3.5 h-3.5" />
        New Folder
      </Button>
      <Button size="sm" className="gap-1.5 h-9" onClick={onUpload}>
        <Upload className="w-3.5 h-3.5" />
        Upload
      </Button>
    </div>
  );
};

export default DriveToolbar;
