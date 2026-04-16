import { useState, useRef } from 'react';
import { Folder, FileText, Image, Video, Music, File, Star, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { DriveFolder, DriveFile } from '@/hooks/useDrive';
import DriveContextMenu from './DriveContextMenu';

const colorMap: Record<string, string> = {
  blue: 'from-blue-400 to-blue-600',
  purple: 'from-purple-400 to-purple-600',
  green: 'from-emerald-400 to-emerald-600',
  red: 'from-red-400 to-red-600',
  orange: 'from-orange-400 to-orange-600',
  amber: 'from-amber-400 to-amber-600',
  pink: 'from-pink-400 to-pink-600',
  gray: 'from-gray-400 to-gray-500',
  teal: 'from-teal-400 to-teal-600',
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
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renamingType, setRenamingType] = useState<'folder' | 'file'>('folder');

  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'file' | 'background', item?: DriveFolder | DriveFile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, item });
  };

  const startRename = (id: string, name: string, type: 'folder' | 'file') => {
    setRenamingId(id);
    setRenameValue(name);
    setRenamingType(type);
  };

  const confirmRename = () => {
    if (renamingId && renameValue.trim()) {
      if (renamingType === 'folder') onRenameFolder(renamingId, renameValue.trim());
      else onRenameFile(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const colorTagDot = (color: string | null) => {
    if (!color) return null;
    const dotColors: Record<string, string> = {
      red: 'bg-red-500', orange: 'bg-orange-500', amber: 'bg-amber-500',
      green: 'bg-green-500', blue: 'bg-blue-500', purple: 'bg-purple-500', gray: 'bg-gray-400',
      pink: 'bg-pink-500', teal: 'bg-teal-500',
    };
    return dotColors[color] ? <span className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${dotColors[color]}`} /> : null;
  };

  return (
    <div
      className="min-h-[400px]"
      onContextMenu={(e) => handleContextMenu(e, 'background')}
    >
      {/* Folders */}
      {folders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {folders.map(folder => (
              <div
                key={folder.id}
                className="group relative bg-card hover:bg-muted/60 border border-border/40 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-border"
                onDoubleClick={() => onOpenFolder(folder.id, folder.name)}
                onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
              >
                {colorTagDot(folder.color)}
                {folder.is_favorite && <Star className="absolute top-2 right-2 w-3 h-3 text-amber-400 fill-amber-400" />}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[folder.color] || colorMap.blue} flex items-center justify-center mb-3 mx-auto`}>
                  <Folder className="w-6 h-6 text-white" />
                </div>
                {renamingId === folder.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingId(null); }}
                      className="h-6 text-xs px-1"
                      autoFocus
                    />
                    <button onClick={confirmRename} className="text-green-500"><Check className="w-3 h-3" /></button>
                    <button onClick={() => setRenamingId(null)} className="text-muted-foreground"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-center truncate">{folder.name}</p>
                )}
                <p className="text-[11px] text-muted-foreground text-center mt-0.5">
                  {new Date(folder.updated_at).toLocaleDateString()}
                </p>
              </div>
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
                  {colorTagDot(file.color)}
                  {file.is_favorite && <Star className="absolute top-2 right-2 w-3 h-3 text-amber-400 fill-amber-400 z-10" />}
                  {/* Thumbnail or icon */}
                  <div className="w-full aspect-square bg-muted/30 flex items-center justify-center">
                    {isImage ? (
                      <img src={file.file_url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileIcon className="w-10 h-10 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="p-3">
                    {renamingId === file.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenamingId(null); }}
                          className="h-6 text-xs px-1"
                          autoFocus
                        />
                        <button onClick={confirmRename} className="text-green-500"><Check className="w-3 h-3" /></button>
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
            if (contextMenu.item) startRename(contextMenu.item.id, (contextMenu.item as any).name, contextMenu.type as any);
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
