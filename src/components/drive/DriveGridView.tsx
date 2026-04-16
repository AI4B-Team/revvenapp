import { useState, useRef, useEffect } from 'react';
import { 
  Folder, FileText, Image, Video, Music, File, Star, Check, X, 
  Menu, Pencil, Copy, FolderInput, Download, Trash2, Palette, ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { DriveFolder, DriveFile } from '@/hooks/useDrive';
import DriveContextMenu from './DriveContextMenu';

// ============================================
// Color system matching Assets
// ============================================
type FolderColor = 'gray' | 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'amber' | 'green' | 'teal';

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

const getColorClasses = (colorValue: string, isHovered: boolean) => {
  const color = colorOptions.find(c => c.value === colorValue) || colorOptions[0];
  if (isHovered) {
    return {
      tab: color.selected.replace('bg-gradient-to-br', 'bg-gradient-to-r'),
      front: color.selected,
    };
  }
  return { tab: color.tab, front: color.front };
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  return FileText;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// ============================================
// Folder Dropdown Menu (matching Assets)
// ============================================
interface FolderMenuProps {
  folder: DriveFolder;
  onClose: () => void;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onChangeColor: (color: string) => void;
}

const DriveFolderMenu = ({ folder, onClose, onOpen, onRename, onDelete, onToggleFavorite, onChangeColor }: FolderMenuProps) => {
  const [showColorSubmenu, setShowColorSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute top-16 right-4 w-56 bg-popover rounded-xl shadow-2xl border border-border py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onOpen} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left">
        <FolderInput className="w-[18px] h-[18px] text-muted-foreground" />
        <span className="text-foreground font-medium">Open</span>
      </button>

      <div className="relative">
        <button onClick={() => setShowColorSubmenu(!showColorSubmenu)} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left">
          <Palette className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="text-foreground font-medium">Change Color</span>
          <ChevronRight className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${showColorSubmenu ? 'rotate-90' : ''}`} />
        </button>
        {showColorSubmenu && (
          <div className="px-4 py-2 grid grid-cols-5 gap-2 border-t border-border mt-1 pt-3">
            {colorOptions.map(c => (
              <button
                key={c.value}
                onClick={() => { onChangeColor(c.value); onClose(); }}
                className={`w-8 h-8 rounded-full ${c.tab} hover:scale-110 transition-transform ${folder.color === c.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>

      <button onClick={onRename} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left">
        <Pencil className="w-[18px] h-[18px] text-muted-foreground" />
        <span className="text-foreground font-medium">Rename</span>
      </button>

      <button onClick={onToggleFavorite} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left">
        <Star className={`w-[18px] h-[18px] ${folder.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
        <span className="text-foreground font-medium">{folder.is_favorite ? 'Remove From Favorites' : 'Add To Favorites'}</span>
      </button>

      <div className="border-t border-border my-2" />

      <button onClick={onDelete} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-left">
        <Trash2 className="w-[18px] h-[18px] text-red-500" />
        <span className="text-red-600 font-medium">Delete</span>
      </button>
    </div>
  );
};

// ============================================
// Rename Modal
// ============================================
const RenameModal = ({ isOpen, currentName, onClose, onConfirm }: { isOpen: boolean; currentName: string; onClose: () => void; onConfirm: (name: string) => void }) => {
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentName]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onConfirm(name.trim()); }} className="space-y-4">
          <Input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter folder name..." />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Drive Folder Card (matching AssetFolderCard)
// ============================================
const DriveFolderCard = ({
  folder, onOpen, onRename, onDelete, onToggleFavorite, onSetColor,
}: {
  folder: DriveFolder;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onSetColor: (color: string) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const colors = getColorClasses(folder.color || 'blue', isHovered);

  return (
    <>
      <div
        onDoubleClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative cursor-pointer select-none pt-3
          transition-all duration-300 ease-out
          transform hover:scale-[1.02] hover:-translate-y-1
          ${isMenuOpen ? 'z-[90]' : 'z-0'}
        `}
      >
        {/* Folder Tab */}
        <div
          className={`absolute top-0 left-4 right-12 h-8 rounded-t-2xl transition-all duration-300 ${colors.tab}`}
          style={{ clipPath: 'polygon(0 100%, 0 30%, 8% 0, 45% 0, 55% 30%, 100% 30%, 100% 100%)' }}
        />

        {/* Main Card */}
        <div className={`relative rounded-2xl p-5 pt-6 transition-all duration-300 ${isHovered ? `${colors.front} text-white shadow-xl` : `${colors.front} text-gray-800 shadow-lg`}`}>
          {/* Favorite Star */}
          {folder.is_favorite && (
            <div className="absolute top-4 left-4">
              <Star className={`w-4 h-4 fill-current ${isHovered ? 'text-yellow-300' : 'text-yellow-500'}`} />
            </div>
          )}

          {/* Menu Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${isHovered ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <Menu className={`w-[18px] h-[18px] ${isHovered ? 'text-white' : 'text-gray-500'}`} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <DriveFolderMenu
              folder={folder}
              onClose={() => setIsMenuOpen(false)}
              onOpen={() => { setIsMenuOpen(false); onOpen(); }}
              onRename={() => { setIsMenuOpen(false); setIsRenameOpen(true); }}
              onDelete={() => { setIsMenuOpen(false); onDelete(); }}
              onToggleFavorite={() => { setIsMenuOpen(false); onToggleFavorite(); }}
              onChangeColor={(color) => { setIsMenuOpen(false); onSetColor(color); }}
            />
          )}

          {/* Folder Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className={isHovered ? 'text-white' : 'text-gray-700'}>
                <Folder className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-semibold tracking-tight">{folder.name}</h3>
            </div>
            <p className={`text-sm ${isHovered ? 'text-white/80' : 'text-gray-500'}`}>
              Folder
            </p>
          </div>

          {/* Last Modified Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${isHovered ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <span className={isHovered ? 'text-white/70' : 'text-gray-400'}>Last Modified:</span>
            <span className="font-medium">{formatDate(folder.updated_at)}</span>
          </div>
        </div>
      </div>

      <RenameModal
        isOpen={isRenameOpen}
        currentName={folder.name}
        onClose={() => setIsRenameOpen(false)}
        onConfirm={(newName) => { onRename(newName); setIsRenameOpen(false); }}
      />
    </>
  );
};

// ============================================
// Main DriveGridView
// ============================================
interface DriveGridViewProps {
  folders: DriveFolder[];
  files: DriveFile[];
  onOpenFolder: (id: string, name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onRenameFile: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteFile: (file: DriveFile) => void;
  onToggleFavoriteFolder: (id: string, current: boolean) => void;
  onToggleFavoriteFile: (id: string, current: boolean) => void;
  onSetFolderColor: (id: string, color: string) => void;
  onSetFileColor: (id: string, color: string) => void;
  onDownloadFile: (file: DriveFile) => void;
  onNewFolder: () => void;
  onUpload: () => void;
}

const DriveGridView = ({
  folders, files,
  onOpenFolder, onRenameFolder, onRenameFile, onDeleteFolder, onDeleteFile,
  onToggleFavoriteFolder, onToggleFavoriteFile, onSetFolderColor, onSetFileColor,
  onDownloadFile, onNewFolder, onUpload,
}: DriveGridViewProps) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'folder' | 'file' | 'background'; item?: DriveFolder | DriveFile } | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'file' | 'background', item?: DriveFolder | DriveFile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, item });
  };

  return (
    <div className="min-h-[400px]" onContextMenu={(e) => handleContextMenu(e, 'background')}>
      {/* Folders */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {folders.map(folder => (
              <DriveFolderCard
                key={folder.id}
                folder={folder}
                onOpen={() => onOpenFolder(folder.id, folder.name)}
                onRename={(name) => onRenameFolder(folder.id, name)}
                onDelete={() => onDeleteFolder(folder.id)}
                onToggleFavorite={() => onToggleFavoriteFolder(folder.id, folder.is_favorite)}
                onSetColor={(color) => onSetFolderColor(folder.id, color)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Files</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {files.map(file => {
              const FileIcon = getFileIcon(file.mime_type);
              const isImage = file.mime_type?.startsWith('image/');
              return (
                <div
                  key={file.id}
                  className="group relative bg-card hover:bg-muted/60 border border-border/40 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-border"
                  onContextMenu={(e) => handleContextMenu(e, 'file', file)}
                  onDoubleClick={() => onDownloadFile(file)}
                >
                  {file.is_favorite && <Star className="absolute top-2 right-2 w-3 h-3 text-amber-400 fill-amber-400 z-10" />}
                  <div className="w-full aspect-square bg-muted/30 flex items-center justify-center">
                    {isImage ? (
                      <img src={file.file_url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileIcon className="w-10 h-10 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="p-3">
                    {renamingFileId === file.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { onRenameFile(file.id, renameValue.trim()); setRenamingFileId(null); }
                            if (e.key === 'Escape') setRenamingFileId(null);
                          }}
                          className="h-6 text-xs px-1"
                          autoFocus
                        />
                        <button onClick={() => { onRenameFile(file.id, renameValue.trim()); setRenamingFileId(null); }} className="text-green-500"><Check className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <p className="text-xs font-medium truncate">{file.name}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatFileSize(file.file_size)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {folders.length === 0 && files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold mb-1">This folder is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">Drop files here or create a new folder</p>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <DriveContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          isFavorite={contextMenu.item && 'is_favorite' in contextMenu.item ? contextMenu.item.is_favorite : false}
          onClose={() => setContextMenu(null)}
          onOpen={() => {
            if (contextMenu.type === 'folder' && contextMenu.item) onOpenFolder(contextMenu.item.id, (contextMenu.item as DriveFolder).name);
            if (contextMenu.type === 'file' && contextMenu.item) onDownloadFile(contextMenu.item as DriveFile);
          }}
          onRename={() => {
            if (contextMenu.type === 'file' && contextMenu.item) {
              setRenamingFileId(contextMenu.item.id);
              setRenameValue((contextMenu.item as DriveFile).name);
            }
          }}
          onDelete={() => {
            if (contextMenu.type === 'folder' && contextMenu.item) onDeleteFolder(contextMenu.item.id);
            if (contextMenu.type === 'file' && contextMenu.item) onDeleteFile(contextMenu.item as DriveFile);
          }}
          onToggleFavorite={() => {
            if (contextMenu.type === 'folder' && contextMenu.item) onToggleFavoriteFolder(contextMenu.item.id, (contextMenu.item as DriveFolder).is_favorite);
            if (contextMenu.type === 'file' && contextMenu.item) onToggleFavoriteFile(contextMenu.item.id, (contextMenu.item as DriveFile).is_favorite);
          }}
          onDownload={() => {
            if (contextMenu.type === 'file' && contextMenu.item) onDownloadFile(contextMenu.item as DriveFile);
          }}
          onSetColor={(color) => {
            if (contextMenu.type === 'folder' && contextMenu.item) onSetFolderColor(contextMenu.item.id, color);
            if (contextMenu.type === 'file' && contextMenu.item) onSetFileColor(contextMenu.item.id, color);
          }}
          onNewFolder={onNewFolder}
          onUpload={onUpload}
        />
      )}
    </div>
  );
};

export default DriveGridView;
