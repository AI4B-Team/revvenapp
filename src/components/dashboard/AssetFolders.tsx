import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, Video, Image, Music, FileText, Plus, Search, Grid3X3, List, Filter, 
  Menu, Pencil, Copy, FolderInput, Star, Download, Trash2, Palette, ChevronRight,
  X, Check
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Types
export type FolderType = 'photos' | 'videos' | 'music' | 'documents' | 'default';
export type FolderColor = 'gray' | 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'amber' | 'green' | 'teal';

export interface AssetFolder {
  id: string;
  name: string;
  fileCount: number;
  type: FolderType;
  lastModified: Date;
  color: FolderColor;
  isFavorite: boolean;
}

// Color Options
const colorOptions: { name: string; value: FolderColor; tab: string; front: string; selected: string }[] = [
  { name: 'Gray', value: 'gray', tab: 'bg-gray-200', front: 'bg-white', selected: 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700' },
  { name: 'Blue', value: 'blue', tab: 'bg-blue-200', front: 'bg-blue-50', selected: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700' },
  { name: 'Purple', value: 'purple', tab: 'bg-purple-200', front: 'bg-purple-50', selected: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700' },
  { name: 'Pink', value: 'pink', tab: 'bg-pink-200', front: 'bg-pink-50', selected: 'bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700' },
  { name: 'Red', value: 'red', tab: 'bg-red-200', front: 'bg-red-50', selected: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' },
  { name: 'Orange', value: 'orange', tab: 'bg-orange-200', front: 'bg-orange-50', selected: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700' },
  { name: 'Amber', value: 'amber', tab: 'bg-amber-200', front: 'bg-amber-50', selected: 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700' },
  { name: 'Green', value: 'green', tab: 'bg-green-200', front: 'bg-green-50', selected: 'bg-gradient-to-br from-green-500 via-green-600 to-green-700' },
  { name: 'Teal', value: 'teal', tab: 'bg-teal-200', front: 'bg-teal-50', selected: 'bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700' },
];

// Icon Mapping
const folderIcons: Record<FolderType, React.ReactNode> = {
  photos: <Image className="w-5 h-5" />,
  videos: <Video className="w-5 h-5" />,
  music: <Music className="w-5 h-5" />,
  documents: <FileText className="w-5 h-5" />,
  default: <Folder className="w-5 h-5" />,
};

// Title Case Helper
const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
};

// Format Date Helper
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

// Get Color Classes - now returns default, hover, and selected states
const getColorClasses = (colorValue: FolderColor, isHovered: boolean) => {
  const color = colorOptions.find(c => c.value === colorValue) || colorOptions[0];
  if (isHovered) {
    return {
      tab: color.selected.replace('bg-gradient-to-br', 'bg-gradient-to-r'),
      front: color.selected,
    };
  }
  return {
    tab: color.tab,
    front: color.front,
  };
};

// ============================================
// Dropdown Menu Component
// ============================================
interface DropdownMenuProps {
  folder: AssetFolder;
  onClose: () => void;
  onChangeColor: (color: FolderColor) => void;
  onRename: () => void;
  onDuplicate: () => void;
  onMoveTo: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

const FolderDropdownMenu: React.FC<DropdownMenuProps> = ({
  folder,
  onClose,
  onChangeColor,
  onRename,
  onDuplicate,
  onMoveTo,
  onToggleFavorite,
  onDownload,
  onDelete,
}) => {
  const [showColorSubmenu, setShowColorSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="absolute top-16 right-4 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Change Color */}
      <div className="relative">
        <button 
          onClick={() => setShowColorSubmenu(!showColorSubmenu)}
          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
        >
          <Palette className="w-[18px] h-[18px] text-gray-500" />
          <span className="text-gray-700 font-medium">Change Color</span>
          <ChevronRight className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${showColorSubmenu ? 'rotate-90' : ''}`} />
        </button>
        {showColorSubmenu && (
          <div className="px-4 py-2 grid grid-cols-5 gap-2 border-t border-gray-100 mt-1 pt-3">
            {colorOptions.map(c => (
              <button
                key={c.value}
                onClick={() => onChangeColor(c.value)}
                className={`w-8 h-8 rounded-full ${c.tab} hover:scale-110 transition-transform ${folder.color === c.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rename */}
      <button onClick={onRename} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
        <Pencil className="w-[18px] h-[18px] text-gray-500" />
        <span className="text-gray-700 font-medium">Rename</span>
      </button>

      {/* Duplicate */}
      <button onClick={onDuplicate} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
        <Copy className="w-[18px] h-[18px] text-gray-500" />
        <span className="text-gray-700 font-medium">Duplicate</span>
      </button>

      {/* Move To */}
      <button onClick={onMoveTo} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
        <FolderInput className="w-[18px] h-[18px] text-gray-500" />
        <span className="text-gray-700 font-medium">Move To</span>
      </button>

      {/* Add To Favorites */}
      <button onClick={onToggleFavorite} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
        <Star className={`w-[18px] h-[18px] ${folder.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} />
        <span className="text-gray-700 font-medium">{folder.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'}</span>
      </button>

      {/* Download */}
      <button onClick={onDownload} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
        <Download className="w-[18px] h-[18px] text-gray-500" />
        <span className="text-gray-700 font-medium">Download</span>
      </button>

      <div className="border-t border-gray-100 my-2" />

      {/* Delete */}
      <button onClick={onDelete} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left">
        <Trash2 className="w-[18px] h-[18px] text-red-500" />
        <span className="text-red-600 font-medium">Delete</span>
      </button>
    </div>
  );
};

// ============================================
// Rename Modal Component
// ============================================
interface RenameModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

const RenameModal: React.FC<RenameModalProps> = ({ isOpen, currentName, onClose, onConfirm }) => {
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Folder Name..."
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// AssetFolderCard Component
// ============================================
interface AssetFolderCardProps {
  folder: AssetFolder;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onChangeColor: (id: string, color: FolderColor) => void;
  onRename: (id: string, newName: string) => void;
  onDuplicate: (id: string) => void;
  onMoveTo: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AssetFolderCard: React.FC<AssetFolderCardProps> = ({
  folder,
  isSelected,
  onSelect,
  onOpen,
  onChangeColor,
  onRename,
  onDuplicate,
  onMoveTo,
  onToggleFavorite,
  onDownload,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const colors = getColorClasses(folder.color, isHovered);

  return (
    <>
      <div
        onClick={() => onSelect(folder.id)}
        onDoubleClick={() => onOpen(folder.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative cursor-pointer select-none pt-3
          transition-all duration-300 ease-out
          transform hover:scale-[1.02] hover:-translate-y-1
          ${isSelected ? 'scale-[1.02] -translate-y-1' : ''}
        `}
      >
        {/* Folder Tab */}
        <div
          className={`
            absolute top-0 left-4 right-12 h-8
            rounded-t-2xl
            transition-all duration-300
            ${colors.tab}
          `}
          style={{
            clipPath: 'polygon(0 100%, 0 30%, 8% 0, 45% 0, 55% 30%, 100% 30%, 100% 100%)',
          }}
        />

        {/* Main Card */}
        <div
          className={`
            relative rounded-2xl p-5 pt-6
            transition-all duration-300
            ${isHovered
              ? `${colors.front} text-white shadow-xl`
              : `${colors.front} text-gray-800 shadow-lg`
            }
          `}
        >
          {/* Favorite Star */}
          {folder.isFavorite && (
            <div className="absolute top-4 left-4">
              <Star className={`w-4 h-4 fill-current ${isHovered ? 'text-yellow-300' : 'text-yellow-500'}`} />
            </div>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`
              absolute top-4 right-4
              w-10 h-10 rounded-full
              flex items-center justify-center
              transition-all duration-200
              ${isHovered
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
          >
            <Menu className={`w-[18px] h-[18px] ${isHovered ? 'text-white' : 'text-gray-500'}`} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <FolderDropdownMenu
              folder={folder}
              onClose={() => setIsMenuOpen(false)}
              onChangeColor={(color) => {
                onChangeColor(folder.id, color);
                setIsMenuOpen(false);
              }}
              onRename={() => {
                setIsMenuOpen(false);
                setIsRenameModalOpen(true);
              }}
              onDuplicate={() => {
                onDuplicate(folder.id);
                setIsMenuOpen(false);
              }}
              onMoveTo={() => {
                onMoveTo(folder.id);
                setIsMenuOpen(false);
              }}
              onToggleFavorite={() => {
                onToggleFavorite(folder.id);
                setIsMenuOpen(false);
              }}
              onDownload={() => {
                onDownload(folder.id);
                setIsMenuOpen(false);
              }}
              onDelete={() => {
                onDelete(folder.id);
                setIsMenuOpen(false);
              }}
            />
          )}

          {/* Folder Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className={isHovered ? 'text-white' : 'text-gray-700'}>
                {folderIcons[folder.type]}
              </span>
              <h3 className="text-xl font-semibold tracking-tight">{toTitleCase(folder.name)}</h3>
            </div>
            <p className={`text-sm ${isHovered ? 'text-white/80' : 'text-gray-500'}`}>
              {folder.fileCount} {folder.fileCount === 1 ? 'File' : 'Files'}
            </p>
          </div>

          {/* Last Modified Badge */}
          <div
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
              ${isHovered
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
              }
            `}
          >
            <span className={isHovered ? 'text-white/70' : 'text-gray-400'}>
              Last Modified:
            </span>
            <span className="font-medium">{formatDate(folder.lastModified)}</span>
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        currentName={folder.name}
        onClose={() => setIsRenameModalOpen(false)}
        onConfirm={(newName) => {
          onRename(folder.id, newName);
          setIsRenameModalOpen(false);
        }}
      />
    </>
  );
};

// ============================================
// AssetFolderGrid Component
// ============================================
interface AssetFolderGridProps {
  folders: AssetFolder[];
  onFoldersChange: (folders: AssetFolder[]) => void;
  onCreateFolder?: () => void;
  onOpenFolder?: (folderId: string, folderType: FolderType) => void;
}

export const AssetFolderGrid: React.FC<AssetFolderGridProps> = ({
  folders,
  onFoldersChange,
  onCreateFolder,
  onOpenFolder,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filterType, setFilterType] = useState<FolderType | 'all'>('all');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = filterType !== 'all' || filterFavorites;

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || folder.type === filterType;
    const matchesFavorite = !filterFavorites || folder.isFavorite;
    return matchesSearch && matchesType && matchesFavorite;
  });

  const clearFilters = () => {
    setFilterType('all');
    setFilterFavorites(false);
  };

  const handleChangeColor = (id: string, color: FolderColor) => {
    onFoldersChange(folders.map(f => f.id === id ? { ...f, color } : f));
  };

  const handleRename = (id: string, newName: string) => {
    onFoldersChange(folders.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  const handleDuplicate = (id: string) => {
    const folder = folders.find(f => f.id === id);
    if (folder) {
      const newFolder: AssetFolder = {
        ...folder,
        id: Date.now().toString(),
        name: folder.name + ' Copy',
      };
      onFoldersChange([...folders, newFolder]);
    }
  };

  const handleMoveTo = (id: string) => {
    console.log('Move Folder:', id);
  };

  const handleToggleFavorite = (id: string) => {
    onFoldersChange(folders.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f));
  };

  const handleDownload = (id: string) => {
    const folder = folders.find(f => f.id === id);
    console.log('Download Folder:', folder?.name);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this folder?')) {
      onFoldersChange(folders.filter(f => f.id !== id));
      if (selectedFolderId === id) setSelectedFolderId(null);
    }
  };

  const handleOpenFolder = (id: string) => {
    const folder = folders.find(f => f.id === id);
    if (folder && onOpenFolder) {
      onOpenFolder(id, folder.type);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">ASSETS</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 w-64"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            {/* Filter */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <button className={`p-3 rounded-xl transition-colors relative ${hasActiveFilters ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-background'}`}>
                  <Filter className="w-5 h-5" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">Filter Folders</h4>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Filter by Type */}
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-3">By Type</p>
                  <div className="space-y-2">
                    {[
                      { value: 'all' as const, label: 'All Types', icon: <Folder className="w-4 h-4" /> },
                      { value: 'photos' as const, label: 'Photos', icon: <Image className="w-4 h-4" /> },
                      { value: 'videos' as const, label: 'Videos', icon: <Video className="w-4 h-4" /> },
                      { value: 'music' as const, label: 'Music & Audio', icon: <Music className="w-4 h-4" /> },
                      { value: 'documents' as const, label: 'Documents', icon: <FileText className="w-4 h-4" /> },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilterType(option.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          filterType === option.value 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                        {filterType === option.value && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Filter by Favorites */}
                <div className="p-4">
                  <button
                    onClick={() => setFilterFavorites(!filterFavorites)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterFavorites 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${filterFavorites ? 'fill-current' : ''}`} />
                    <span>Favorites Only</span>
                    {filterFavorites && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* New Folder Button */}
            <Button
              onClick={onCreateFolder}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
            >
              <Plus className="w-5 h-5" />
              New Folder
            </Button>
          </div>
        </div>
      </div>

      {/* Folder Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {filteredFolders.map((folder) => (
            <AssetFolderCard
              key={folder.id}
              folder={folder}
              isSelected={selectedFolderId === folder.id}
              onSelect={(id) => setSelectedFolderId(id === selectedFolderId ? null : id)}
              onOpen={handleOpenFolder}
              onChangeColor={handleChangeColor}
              onRename={handleRename}
              onDuplicate={handleDuplicate}
              onMoveTo={handleMoveTo}
              onToggleFavorite={handleToggleFavorite}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 pt-4">
          {filteredFolders.map((folder) => {
            const colors = getColorClasses(folder.color, false);
            return (
              <div
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id === selectedFolderId ? null : folder.id)}
                onDoubleClick={() => handleOpenFolder(folder.id)}
                className={`
                  flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200
                  ${selectedFolderId === folder.id 
                    ? 'bg-primary/10 border-2 border-primary' 
                    : 'bg-card border border-border hover:bg-muted'
                  }
                `}
              >
                {/* Folder Icon */}
                <div className={`w-12 h-12 rounded-xl ${colors.tab} flex items-center justify-center`}>
                  <span className="text-gray-700">{folderIcons[folder.type]}</span>
                </div>
                
                {/* Folder Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{toTitleCase(folder.name)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {folder.fileCount} {folder.fileCount === 1 ? 'File' : 'Files'}
                  </p>
                </div>
                
                {/* Last Modified */}
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {formatDate(folder.lastModified)}
                </div>
                
                {/* Favorite Star */}
                {folder.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {filteredFolders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No Folders Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or create a new folder</p>
        </div>
      )}
    </div>
  );
};

export default AssetFolderGrid;
